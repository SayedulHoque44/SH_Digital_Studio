import type { IAdminProject } from "@/features/Admin/interface/admin.interface";

/*
 * Converts between the stored project document and antd form values.
 * Keeping this mapping in one place makes the editor component simple and
 * guarantees cleared fields are sent explicitly (so the API clears them).
 */

export const CASE_STUDY_FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "goals", label: "Goals" },
  { key: "problem", label: "Problem statement" },
  { key: "solution", label: "Proposed solution" },
  { key: "targetAudience", label: "Target audience" },
  { key: "role", label: "My role" },
  { key: "collaboration", label: "Team & collaboration", hint: "Only if accurate" },
  { key: "process", label: "Development process" },
  { key: "designDecisions", label: "Design decisions" },
  { key: "challenges", label: "Technical challenges" },
  { key: "implementation", label: "Implementation details" },
  { key: "timeline", label: "Timeline", hint: "Only a real timeline" },
  { key: "outcomes", label: "Outcomes", hint: "Only real, verifiable results" },
  { key: "lessons", label: "Lessons learned" },
  { key: "limitations", label: "Limitations & disclaimers", hint: "Shown in an 'About this project' note" },
];

const toDateInput = (value?: string) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export const projectToForm = (project?: IAdminProject) => {
  if (!project) {
    return {
      projectType: "website",
      projectStatus: "concept",
      publishStatus: "draft",
      visibility: "listed",
      isClientWork: false,
      featured: false,
      featuredOrder: 0,
      sortOrder: 0,
      categories: [],
      tags: [],
      platforms: [],
      techStack: [],
      corePages: [],
      designHighlights: [],
      features: [],
      modules: [],
      workflows: [],
      contentBlocks: [],
      relatedProjects: [],
      media: {
        coverImage: null,
        logo: null,
        browserMockup: null,
        fullPageScreenshot: null,
        desktopScreenshots: [],
        tabletScreenshots: [],
        mobileScreenshots: [],
        gallery: [],
      },
      links: { showSourceUrl: false },
      demoAccess: { enabled: false },
      caseStudy: {},
      seo: { noIndex: false },
    };
  }
  return {
    ...project,
    categories: (project.categories || []).map((item) => (typeof item === "string" ? item : item._id)),
    publishedAt: toDateInput(project.publishedAt),
    media: {
      coverImage: project.media?.coverImage || null,
      logo: project.media?.logo || null,
      browserMockup: project.media?.browserMockup || null,
      fullPageScreenshot: project.media?.fullPageScreenshot || null,
      desktopScreenshots: project.media?.desktopScreenshots || [],
      tabletScreenshots: project.media?.tabletScreenshots || [],
      mobileScreenshots: project.media?.mobileScreenshots || [],
      gallery: project.media?.gallery || [],
    },
    video: project.video || { url: "" },
    links: { showSourceUrl: false, ...(project.links || {}) },
    demoAccess: { ...(project.demoAccess || {}), enabled: !!project.demoAccess?.enabled },
    caseStudy: project.caseStudy || {},
    seo: { noIndex: false, ...(project.seo || {}) },
    cta: project.cta || {},
  };
};

// Media refs: drop empty objects (no URL) so validation never sees url: ""
const cleanMedia = (media: any) => (media && media.url ? media : null);
const cleanMediaList = (list: any[] = []) => list.filter((item) => item?.url);

export const formToProjectPayload = (values: Record<string, any>, original?: IAdminProject) => {
  const payload: Record<string, any> = { ...values };
  // The form edits the date only: keep the stored time when the date is unchanged
  const sameDate = !!original?.publishedAt && toDateInput(original.publishedAt) === values.publishedAt;
  payload.publishedAt = values.publishedAt
    ? sameDate
      ? original!.publishedAt
      : new Date(values.publishedAt).toISOString()
    : null;
  payload.media = {
    coverImage: cleanMedia(values.media?.coverImage),
    logo: cleanMedia(values.media?.logo),
    browserMockup: cleanMedia(values.media?.browserMockup),
    fullPageScreenshot: cleanMedia(values.media?.fullPageScreenshot),
    desktopScreenshots: cleanMediaList(values.media?.desktopScreenshots),
    tabletScreenshots: cleanMediaList(values.media?.tabletScreenshots),
    mobileScreenshots: cleanMediaList(values.media?.mobileScreenshots),
    gallery: cleanMediaList(values.media?.gallery),
  };
  payload.video = values.video?.url?.trim() ? values.video : null;
  payload.clientName = values.isClientWork ? values.clientName || "" : "";
  // Content blocks: drop empty media refs inside block data
  payload.contentBlocks = (values.contentBlocks || []).map((block: any) => {
    const data = { ...(block.data || {}) };
    ["image", "before", "after"].forEach((key) => {
      if (key in data) data[key] = cleanMedia(data[key]);
    });
    if (Array.isArray(data.images)) data.images = cleanMediaList(data.images);
    return { ...(block._id ? { _id: block._id } : {}), type: block.type, data };
  });
  return payload;
};
