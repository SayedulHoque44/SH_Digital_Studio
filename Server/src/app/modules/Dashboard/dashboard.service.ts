import { Model } from "mongoose";
import { isMailConfigured } from "../../utils/mailer";
import { isS3Configured } from "../../utils/s3";
import { CategoryModel } from "../Category/category.model";
import { ClientProjectServices } from "../ClientProject/clientProject.service";
import { InquiryModel } from "../Inquiry/inquiry.model";
import { DEFAULT_BIO } from "../Profile/profile.defaults";
import { ProfileServices } from "../Profile/profile.service";
import { ProjectModel } from "../Project/project.model";
import { ServiceModel } from "../Service/service.model";
import {
  DEFAULT_PRIVACY_POLICY,
  DEFAULT_TERMS,
} from "../SiteSettings/siteSettings.defaults";
import { SiteSettingsServices } from "../SiteSettings/siteSettings.service";

type Doc = Record<string, any>;

const APP_TYPES = ["web-app", "mobile-app", "desktop-app", "saas"];

/**
 * Launch checklist computed from real data - it lists content that still
 * needs your genuine details before the site goes live.
 */
const buildChecklist = (
  settings: Doc,
  profile: Doc,
  projectsWithoutCover: number,
  draftServices: Doc[],
) => {

  const items = [
    {
      key: "contact-email",
      label: "Add a public contact email",
      done: Boolean(settings.contact?.email),
      href: "/admin/settings?tab=contact",
    },
    {
      key: "profile-photo",
      label: "Upload your real profile photo",
      done: Boolean(profile.photo?.url),
      href: "/admin/profile",
    },
    {
      key: "bio",
      label: "Personalize the biography in your own words",
      done: Boolean(profile.bio) && profile.bio !== DEFAULT_BIO,
      href: "/admin/profile",
    },
    {
      key: "experience",
      label: "Add your work experience and education (optional but recommended)",
      done: (profile.experience?.length || 0) + (profile.education?.length || 0) > 0,
      href: "/admin/profile?tab=experience",
    },
    {
      key: "social",
      label: "Add your social / professional profile links",
      done: (settings.socialLinks?.length || 0) > 0,
      href: "/admin/settings?tab=contact",
    },
    {
      key: "privacy",
      label: "Review the privacy policy and terms templates",
      done:
        settings.legal?.privacyPolicy !== DEFAULT_PRIVACY_POLICY ||
        settings.legal?.terms !== DEFAULT_TERMS,
      href: "/admin/settings?tab=legal",
    },
    {
      key: "covers",
      label:
        projectsWithoutCover > 0
          ? `Add cover images to ${projectsWithoutCover} published project(s)`
          : "Every published project has a cover image",
      done: projectsWithoutCover === 0,
      href: "/admin/projects",
    },
    {
      key: "email-notifications",
      label: "Configure SMTP so new inquiries are e-mailed to you (inquiries are always saved here)",
      done: isMailConfigured(),
      href: "/admin/settings?tab=inquiries",
    },
    ...draftServices.map(service => ({
      key: `service-${service._id}`,
      label: `Confirm and publish the "${service.title}" service, or delete it`,
      done: false,
      href: `/admin/services/${service._id}`,
    })),
  ];
  return items;
};

// Counts per status in one query: [{ _id: "published", count: 3 }, ...]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countByStatus = (model: Model<any>, field: string) =>
  model.aggregate<{ _id: string; count: number }>([
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);

const sumCounts = (rows: { count: number }[]) => rows.reduce((total, row) => total + row.count, 0);
const countOf = (rows: { _id: string; count: number }[], id: string) =>
  rows.find(row => row._id === id)?.count || 0;

/*
 * Every query runs in a single parallel batch (grouped counts instead of one
 * query per number), so the dashboard costs about one database round trip.
 */
const getDashboardFromDB = async () => {
  const [
    settings,
    profile,
    projectCounts,
    categoryCounts,
    serviceCounts,
    inquiryCounts,
    projectsWithoutCover,
    draftServices,
    recentInquiries,
    recentProjects,
    recentCategories,
    recentServices,
    renewals,
  ] = await Promise.all([
    SiteSettingsServices.getSettingsDoc(),
    ProfileServices.getProfileDoc(),
    ProjectModel.aggregate<{ _id: { status: string; type: string }; count: number }>([
      { $group: { _id: { status: "$publishStatus", type: "$projectType" }, count: { $sum: 1 } } },
    ]),
    countByStatus(CategoryModel, "status"),
    countByStatus(ServiceModel, "status"),
    countByStatus(InquiryModel, "status"),
    ProjectModel.countDocuments({
      publishStatus: "published",
      "media.coverImage.url": { $exists: false },
      "media.desktopScreenshots.0": { $exists: false },
    }),
    ServiceModel.find({ status: "draft" }).select("title").lean(),
    InquiryModel.find()
      .select("name businessName email industry projectTitle status createdAt")
      .sort("-createdAt")
      .limit(6)
      .lean(),
    ProjectModel.find().select("title publishStatus updatedAt").sort("-updatedAt").limit(6).lean(),
    CategoryModel.find().select("name status updatedAt").sort("-updatedAt").limit(4).lean(),
    ServiceModel.find().select("title status updatedAt").sort("-updatedAt").limit(4).lean(),
    ClientProjectServices.getRenewalAlertsFromDB(),
  ]);

  const projects = { published: 0, draft: 0, archived: 0, websites: 0, applications: 0 };
  projectCounts.forEach(({ _id: { status, type }, count }) => {
    if (status === "published" || status === "draft" || status === "archived") projects[status] += count;
    if (status !== "published") return;
    if (type === "website") projects.websites += count;
    if (APP_TYPES.includes(type)) projects.applications += count;
  });

  const recentChanges = [
    ...recentProjects.map(item => ({
      type: "Project",
      id: String(item._id),
      title: item.title,
      status: item.publishStatus,
      updatedAt: item.updatedAt,
      href: `/admin/projects/${item._id}`,
    })),
    ...recentCategories.map(item => ({
      type: "Category",
      id: String(item._id),
      title: item.name,
      status: item.status,
      updatedAt: item.updatedAt,
      href: `/admin/categories?edit=${item._id}`,
    })),
    ...recentServices.map(item => ({
      type: "Service",
      id: String(item._id),
      title: item.title,
      status: item.status,
      updatedAt: item.updatedAt,
      href: `/admin/services/${item._id}`,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
    .slice(0, 8);

  return {
    projects,
    categories: { total: sumCounts(categoryCounts), published: countOf(categoryCounts, "published") },
    services: { total: sumCounts(serviceCounts), published: countOf(serviceCounts, "published") },
    inquiries: { total: sumCounts(inquiryCounts), new: countOf(inquiryCounts, "new") },
    recentInquiries,
    recentChanges,
    renewals,
    integrations: { emailNotifications: isMailConfigured(), mediaUploads: isS3Configured() },
    checklist: buildChecklist(settings as Doc, profile as Doc, projectsWithoutCover, draftServices),
  };
};

export const DashboardServices = { getDashboardFromDB };
