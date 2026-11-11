"use client";

import { Alert, Button, Card, Form, Input, Select, Switch, Tabs } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { LuExternalLink, LuPlus, LuSave, LuTrash2 } from "react-icons/lu";
import { SkeletonStatus } from "@/components/ui/Skeleton";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import { FeatureListField, MarkdownField, OrderedSelect, SeoFields, StringListField } from "../fields/FormFields";
import LinesInput from "../fields/LinesInput";
import { MediaField } from "../fields/MediaField";
import PageHeader from "../PageHeader";
import { TabsCardSkeleton } from "../Skeletons";
import ContactSocialForm from "../Settings/ContactSocialForm";
import { useUnsavedChanges } from "../UnsavedChanges";
import ConfirmDelete from "../fields/ConfirmDelete";

const AVAILABILITY = [
  { value: "available", label: "Available for new projects" },
  { value: "limited", label: "Limited availability" },
  { value: "unavailable", label: "Fully booked" },
  { value: "hidden", label: "Don't show availability" },
];

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <ConfirmDelete title={`${label}?`} onConfirm={onClick}>
      <Button danger size="small" aria-label={label} icon={<LuTrash2 aria-hidden />} />
    </ConfirmDelete>
  );
}

export default function ProfileEditor() {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const { setDirty } = useUnsavedChanges();
  const profile = AdminHooks.useProfile();
  const update = AdminHooks.useUpdateProfile();
  const projects = AdminHooks.useProjectOptions();
  const skillCategories = (Form.useWatch("skillCategories", form) || []) as string[];

  useEffect(() => {
    if (profile.data)
      form.setFieldsValue({
        ...profile.data,
        photo: profile.data.photo || null,
        seo: { noIndex: false, ...(profile.data.seo || {}) },
      });
  }, [profile.data, form]);
  useEffect(() => () => setDirty(false), [setDirty]);

  const onFinish = async () => {
    // The full form store, not just the registered fields: it keeps each list
    // item's _id, so saving doesn't recreate unchanged items (the API strips
    // anything that isn't editable)
    const values = form.getFieldsValue(true);
    const payload = {
      ...values,
      photo: values.photo?.url ? values.photo : null,
      experience: (values.experience || []).map((item: any) => ({ ...item, logo: item.logo?.url ? item.logo : undefined })),
      testimonials: (values.testimonials || []).map((item: any) => ({ ...item, project: item.project || null })),
    };
    await update.mutateAsync(payload);
    setDirty(false);
  };

  return (
    // component={false}: no <form> element, so the separate Contact & social form
    // in the last tab is not nested inside this one (nested forms are invalid HTML)
    <Form form={form} component={false} layout="vertical" requiredMark="optional" onFinish={onFinish} onValuesChange={() => setDirty(true)} scrollToFirstError>
      <PageHeader
        title="Profile & about page"
        description="Your real details power the About page, the homepage introduction and structured data."
        actions={
          <>
            <Button icon={<LuExternalLink aria-hidden />} href="/about" target="_blank">
              View page
            </Button>
            {/* Disabled until loaded: saving an empty form would clear the photo, experience and testimonials */}
            <Button type="primary" onClick={() => form.submit()} loading={update.isLoading} disabled={profile.isLoading} icon={<LuSave aria-hidden />}>
              Save profile
            </Button>
          </>
        }
      />
      {profile.isLoading ? (
        <>
          <SkeletonStatus label="Loading profile…" />
          <TabsCardSkeleton tabs={6} />
        </>
      ) : (
        <Card>
          <Tabs
            defaultActiveKey={searchParams.get("tab") || "profile"}
            items={[
              {
                key: "profile",
                label: "Profile",
                forceRender: true,
                children: (
                  <>
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <Form.Item name="name" label="Name" rules={[{ required: true, min: 2 }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="title" label="Professional title">
                        <Input />
                      </Form.Item>
                    </div>
                    <Form.Item name="photo" label="Profile photo" extra="Use a real photo of yourself. A monogram placeholder is shown until you add one.">
                      <MediaField />
                    </Form.Item>
                    <Form.Item name="shortIntro" label="Short introduction" rules={[{ max: 400 }]}>
                      <Input.TextArea showCount maxLength={400} autoSize={{ minRows: 2, maxRows: 4 }} />
                    </Form.Item>
                    <Form.Item name="bio" label="Biography">
                      <MarkdownField rows={10} />
                    </Form.Item>
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <Form.Item name="location" label="Location">
                        <Input placeholder="Optional" />
                      </Form.Item>
                      <Form.Item name="resumeUrl" label="Résumé / CV URL" rules={[{ type: "url" }]}>
                        <Input placeholder="Optional https:// link" />
                      </Form.Item>
                      <Form.Item name="availabilityStatus" label="Availability">
                        <Select options={AVAILABILITY} />
                      </Form.Item>
                      <Form.Item name="availabilityNote" label="Availability note">
                        <Input placeholder="e.g. Taking on new projects" />
                      </Form.Item>
                    </div>
                    <StringListField name="specializations" label="Specializations" addLabel="Add specialization" max={20} />
                    <StringListField name="workingArrangements" label="Working arrangements" addLabel="Add arrangement" max={12} />
                  </>
                ),
              },
              {
                key: "skills",
                label: "Skills",
                forceRender: true,
                children: (
                  <>
                    <Alert
                      className="!mb-5"
                      type="info"
                      showIcon
                      title="Skills are shown as grouped labels. Avoid percentage bars or scores that can't be measured — use an optional text label instead (e.g. 'Daily use')."
                    />
                    <StringListField name="skillCategories" label="Skill groups (in display order)" addLabel="Add group" max={20} />
                    <Form.Item label="Skills">
                      <Form.List name="skills">
                        {(fields, { add, remove }) => (
                          <div className="space-y-2">
                            {fields.map((field) => (
                              <div key={field.key} className="flex flex-wrap gap-2 rounded-xl bg-paper-50 p-2 ring-1 ring-paper-300/60">
                                <Form.Item name={[field.name, "name"]} noStyle rules={[{ required: true, message: "Name required" }]}>
                                  <Input placeholder="Skill" className="!w-44" />
                                </Form.Item>
                                <Form.Item name={[field.name, "category"]} noStyle rules={[{ required: true, message: "Group required" }]}>
                                  <Select placeholder="Group" className="min-w-[190px]" options={skillCategories.map((value) => ({ value, label: value }))} />
                                </Form.Item>
                                <Form.Item name={[field.name, "proficiencyLabel"]} noStyle>
                                  <Input placeholder="Label (optional)" className="!w-40" />
                                </Form.Item>
                                <Form.Item name={[field.name, "description"]} noStyle>
                                  <Input placeholder="Short description (optional)" className="min-w-[200px] flex-1" />
                                </Form.Item>
                                <RemoveButton label="Remove skill" onClick={() => remove(field.name)} />
                              </div>
                            ))}
                            <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add({ name: "", category: skillCategories[0] })}>
                              Add skill
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "experience",
                label: "Experience & education",
                forceRender: true,
                children: (
                  <>
                    <Alert className="!mb-5" type="info" showIcon title="Only add real roles and qualifications. Empty sections are hidden on the website." />
                    <Form.Item label="Work experience">
                      <Form.List name="experience">
                        {(fields, { add, remove }) => (
                          <div className="space-y-4">
                            {fields.map((field) => (
                              <Card key={field.key} size="small" extra={<RemoveButton label="Remove role" onClick={() => remove(field.name)} />} title="Role">
                                <div className="grid gap-x-4 sm:grid-cols-2">
                                  <Form.Item name={[field.name, "position"]} label="Position" rules={[{ required: true }]}>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "organization"]} label="Company / organization" rules={[{ required: true }]}>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "employmentType"]} label="Employment type">
                                    <Select allowClear options={["Full-time", "Part-time", "Freelance", "Contract", "Internship", "Self-employed"].map((value) => ({ value, label: value }))} />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "location"]} label="Location">
                                    <Input />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "startDate"]} label="Start (month)">
                                    <Input type="month" />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "endDate"]} label="End (month)">
                                    <Input type="month" />
                                  </Form.Item>
                                </div>
                                <Form.Item name={[field.name, "isCurrent"]} label="I currently work here" valuePropName="checked">
                                  <Switch />
                                </Form.Item>
                                <Form.Item name={[field.name, "description"]} label="Description">
                                  <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                                </Form.Item>
                                <Form.Item name={[field.name, "responsibilities"]} label="Responsibilities (one per line)">
                                  <LinesInput />
                                </Form.Item>
                                <Form.Item name={[field.name, "achievements"]} label="Key achievements (one per line, real only)">
                                  <LinesInput />
                                </Form.Item>
                                <Form.Item name={[field.name, "technologies"]} label="Technologies">
                                  <Select mode="tags" tokenSeparators={[","]} />
                                </Form.Item>
                                <Form.Item name={[field.name, "logo"]} label="Company logo">
                                  <MediaField />
                                </Form.Item>
                              </Card>
                            ))}
                            <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add({ isCurrent: false, responsibilities: [], achievements: [], technologies: [] })}>
                              Add role
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Form.Item>
                    <Form.Item label="Education">
                      <Form.List name="education">
                        {(fields, { add, remove }) => (
                          <div className="space-y-4">
                            {fields.map((field) => (
                              <Card key={field.key} size="small" title="Qualification" extra={<RemoveButton label="Remove qualification" onClick={() => remove(field.name)} />}>
                                <div className="grid gap-x-4 sm:grid-cols-2">
                                  <Form.Item name={[field.name, "qualification"]} label="Qualification" rules={[{ required: true }]}>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "institution"]} label="Institution" rules={[{ required: true }]}>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "field"]} label="Field of study">
                                    <Input />
                                  </Form.Item>
                                  <div className="grid grid-cols-2 gap-x-3">
                                    <Form.Item name={[field.name, "startDate"]} label="Start">
                                      <Input type="month" />
                                    </Form.Item>
                                    <Form.Item name={[field.name, "endDate"]} label="End">
                                      <Input type="month" />
                                    </Form.Item>
                                  </div>
                                </div>
                                <Form.Item name={[field.name, "description"]} label="Description">
                                  <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
                                </Form.Item>
                              </Card>
                            ))}
                            <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add({})}>
                              Add qualification
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "capabilities",
                label: "Capabilities & process",
                forceRender: true,
                children: (
                  <>
                    <FeatureListField name="capabilities" label="Personal capabilities" addLabel="Add capability" max={20} />
                    <FeatureListField name="workingProcess" label="Working process (communication, milestones, revisions, handover)" addLabel="Add step" max={12} />
                  </>
                ),
              },
              {
                key: "trust",
                label: "Trust",
                forceRender: true,
                children: (
                  <>
                    <Alert
                      className="!mb-5"
                      type="warning"
                      showIcon
                      title="Only add genuine testimonials you have permission to publish, and real certifications. Testimonials stay hidden until marked approved."
                    />
                    <Form.Item label="Testimonials">
                      <Form.List name="testimonials">
                        {(fields, { add, remove }) => (
                          <div className="space-y-4">
                            {fields.map((field) => (
                              <Card key={field.key} size="small" extra={<RemoveButton label="Remove testimonial" onClick={() => remove(field.name)} />}>
                                <Form.Item name={[field.name, "quote"]} label="Quote" rules={[{ required: true }]}>
                                  <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                                </Form.Item>
                                <div className="grid gap-x-4 sm:grid-cols-3">
                                  <Form.Item name={[field.name, "author"]} label="Name" rules={[{ required: true }]}>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "role"]} label="Role">
                                    <Input />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "company"]} label="Company">
                                    <Input />
                                  </Form.Item>
                                </div>
                                <div className="grid gap-x-4 sm:grid-cols-2">
                                  <Form.Item name={[field.name, "project"]} label="Related project">
                                    <Select allowClear options={(projects.data || []).map((option) => ({ value: option._id, label: option.title }))} />
                                  </Form.Item>
                                  <Form.Item name={[field.name, "approved"]} label="Approved for publication" valuePropName="checked">
                                    <Switch />
                                  </Form.Item>
                                </div>
                              </Card>
                            ))}
                            <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add({ approved: false })}>
                              Add testimonial
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Form.Item>
                    <Form.Item label="Certifications">
                      <Form.List name="certifications">
                        {(fields, { add, remove }) => (
                          <div className="space-y-2">
                            {fields.map((field) => (
                              <div key={field.key} className="flex flex-wrap gap-2">
                                <Form.Item name={[field.name, "name"]} noStyle rules={[{ required: true }]}>
                                  <Input placeholder="Certification" className="min-w-[200px] flex-1" />
                                </Form.Item>
                                <Form.Item name={[field.name, "issuer"]} noStyle>
                                  <Input placeholder="Issuer" className="!w-40" />
                                </Form.Item>
                                <Form.Item name={[field.name, "date"]} noStyle>
                                  <Input type="month" className="!w-40" />
                                </Form.Item>
                                <Form.Item name={[field.name, "url"]} noStyle rules={[{ type: "url" }]}>
                                  <Input placeholder="Verification URL" className="!w-56" />
                                </Form.Item>
                                <RemoveButton label="Remove certification" onClick={() => remove(field.name)} />
                              </div>
                            ))}
                            <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add({})}>
                              Add certification
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "featured",
                label: "Featured work & SEO",
                forceRender: true,
                children: (
                  <>
                    <Form.Item name="featuredProjects" label="Selected work on the About page">
                      <OrderedSelect options={projects.data || []} max={12} />
                    </Form.Item>
                    <SeoFields path="/about" />
                  </>
                ),
              },
              {
                key: "contact",
                label: "Contact & social",
                children: (
                  <>
                    <Alert className="!mb-5" type="info" showIcon title="Contact details and social profiles are shared with Site settings and saved separately below." />
                    <ContactSocialForm />
                  </>
                ),
              },
            ]}
          />
        </Card>
      )}
    </Form>
  );
}
