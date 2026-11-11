"use client";

import {
  Alert,
  Button,
  Card,
  Collapse,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Result,
  Segmented,
  Select,
  Switch,
  Tabs,
  Tag,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LuArrowLeft, LuCopy, LuExternalLink, LuEye, LuSave, LuTrash2 } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/format";
import BlockEditor from "../fields/BlockEditor";
import {
  CtaFields,
  FeatureListField,
  MarkdownField,
  OrderedSelect,
  SeoFields,
  SlugInput,
  StringListField,
} from "../fields/FormFields";
import { MediaField, MediaListField } from "../fields/MediaField";
import PageHeader from "../PageHeader";
import { EditorSkeleton } from "../Skeletons";
import { useUnsavedChanges } from "../UnsavedChanges";
import { CASE_STUDY_FIELDS, formToProjectPayload, projectToForm } from "./projectForm";

const typeOptions = Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function ProjectEditor({ id }: { id?: string }) {
  const isNew = !id;
  const router = useRouter();
  const [form] = Form.useForm();
  const { setDirty, navigate } = useUnsavedChanges();

  const project = AdminHooks.useProject(id);
  const categoryOptions = AdminHooks.useCategoryOptions();
  const projectOptions = AdminHooks.useProjectOptions();
  const createProject = AdminHooks.useCreateProject();
  const updateProject = AdminHooks.useUpdateProject();
  const duplicateProject = AdminHooks.useDuplicateProject();
  const deleteProject = AdminHooks.useDeleteProject();

  const title = Form.useWatch("title", form) as string | undefined;
  const slug = Form.useWatch("slug", form) as string | undefined;
  const isClientWork = Form.useWatch("isClientWork", form) as boolean | undefined;
  const demoEnabled = Form.useWatch(["demoAccess", "enabled"], form) as boolean | undefined;
  const publishStatus = Form.useWatch("publishStatus", form) as string | undefined;
  const summary = Form.useWatch("summary", form) as string | undefined;

  useEffect(() => {
    if (isNew) form.setFieldsValue(projectToForm());
    else if (project.data) form.setFieldsValue(projectToForm(project.data));
  }, [isNew, project.data, form]);

  useEffect(() => () => setDirty(false), [setDirty]);

  const loading = !isNew && project.isLoading;
  const missing = !isNew && !project.isLoading && (project.isError || !project.data);

  const saving = createProject.isLoading || updateProject.isLoading;

  const onFinish = async () => {
    // The full form store, not just the registered fields: it keeps each list
    // item's _id, so saving doesn't recreate unchanged items (the API strips
    // anything that isn't editable)
    const payload = formToProjectPayload(form.getFieldsValue(true), project.data);
    if (isNew) {
      const created = await createProject.mutateAsync(payload);
      setDirty(false);
      router.replace(`/admin/projects/${created._id}`);
    } else {
      const saved = await updateProject.mutateAsync({ id: id!, payload });
      form.setFieldsValue(projectToForm(saved));
      setDirty(false);
    }
  };

  const publicPath = `/projects/${project.data?.slug || slug || ""}`;
  const categories = (categoryOptions.data || []).map((category) => ({
    value: category._id,
    label: `${category.parent ? "— " : ""}${category.name}${category.status !== "published" ? " (draft)" : ""}`,
  }));

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark="optional"
      onFinish={onFinish}
      onFinishFailed={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onValuesChange={() => setDirty(true)}
      scrollToFirstError
    >
      {loading ? (
        <EditorSkeleton
          label="Loading project…"
          tabs={7}
          sidebar
          eyebrow={
            <button type="button" onClick={() => navigate("/admin/projects")} className="inline-flex items-center gap-1.5 hover:underline">
              <LuArrowLeft aria-hidden /> Projects
            </button>
          }
        />
      ) : missing ? (
        <Result status="404" title="Project not found" extra={<Link href="/admin/projects">Back to projects</Link>} />
      ) : (
      <>
      <PageHeader
        eyebrow={
          <button type="button" onClick={() => navigate("/admin/projects")} className="inline-flex items-center gap-1.5 hover:underline">
            <LuArrowLeft aria-hidden /> Projects
          </button>
        }
        title={isNew ? "New project" : project.data?.title}
        description={isNew ? "Only the title and type are required — everything else is optional." : undefined}
        actions={
          <Button type="primary" htmlType="submit" loading={saving} icon={<LuSave aria-hidden />}>
            {isNew ? "Create project" : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <Tabs
            items={[
              {
                key: "basics",
                label: "Basics",
                forceRender: true,
                children: (
                  <>
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <Form.Item name="title" label="Title" rules={[{ required: true, message: "Title is required" }, { max: 120 }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="projectType" label="Project type" rules={[{ required: true }]}>
                        <Select options={typeOptions} />
                      </Form.Item>
                    </div>
                    <Form.Item name="slug" label="URL slug" extra="Changing the slug keeps the old link working (it redirects).">
                      <SlugInput prefix="/projects/" source={title} />
                    </Form.Item>
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <Form.Item name="projectStatus" label="Development status" extra="Be accurate — concept demos are labelled as such.">
                        <Select options={statusOptions} />
                      </Form.Item>
                      <Form.Item name="brandName" label="Brand / product name">
                        <Input />
                      </Form.Item>
                    </div>
                    <Form.Item name="isClientWork" label="Real client project" valuePropName="checked" extra="Only switch on for genuine, commissioned client work.">
                      <Switch />
                    </Form.Item>
                    {isClientWork && (
                      <Form.Item name="clientName" label="Client name" extra="Only with the client's permission.">
                        <Input />
                      </Form.Item>
                    )}
                    <Form.Item name="subtitle" label="Subtitle" rules={[{ max: 160 }]}>
                      <Input showCount maxLength={160} />
                    </Form.Item>
                    <Form.Item
                      name="summary"
                      label="Summary"
                      extra="Shown on cards and in social previews. Required to publish."
                      rules={[{ max: 320 }]}
                      validateStatus={publishStatus === "published" && !summary?.trim() ? "warning" : undefined}
                    >
                      <Input.TextArea showCount maxLength={320} autoSize={{ minRows: 2, maxRows: 5 }} />
                    </Form.Item>
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <Form.Item name="categories" label="Industries / categories">
                        <Select mode="multiple" options={categories} optionFilterProp="label" loading={categoryOptions.isLoading} />
                      </Form.Item>
                      <Form.Item name="subcategory" label="Type of business" extra="e.g. Bakery & Coffee Shop">
                        <Input />
                      </Form.Item>
                    </div>
                    <Form.Item name="tags" label="Tags">
                      <Select mode="tags" tokenSeparators={[","]} placeholder="Type and press Enter" />
                    </Form.Item>
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <Form.Item name="techStack" label="Technology stack">
                        <Select mode="tags" tokenSeparators={[","]} placeholder="Next.js, MongoDB…" />
                      </Form.Item>
                      <Form.Item name="platforms" label="Platforms">
                        <Select mode="tags" tokenSeparators={[","]} placeholder="Web, iOS, Android…" />
                      </Form.Item>
                    </div>
                  </>
                ),
              },
              {
                key: "content",
                label: "Content",
                forceRender: true,
                children: (
                  <>
                    <Form.Item name="overview" label="Overview">
                      <MarkdownField rows={8} />
                    </Form.Item>
                    <StringListField name="designHighlights" label="Design highlights" addLabel="Add highlight" max={12} />
                    <StringListField name="corePages" label="Core pages" addLabel="Add page" max={30} />
                    <FeatureListField name="features" label="Features" addLabel="Add feature" withIcon />
                    <FeatureListField name="modules" label="Main modules (applications)" addLabel="Add module" withIcon />
                    <FeatureListField name="workflows" label="Key workflows (applications)" addLabel="Add workflow" />
                  </>
                ),
              },
              {
                key: "media",
                label: "Media",
                forceRender: true,
                children: (
                  <>
                    <Form.Item name={["media", "coverImage"]} label="Cover image" extra="Used on cards and social previews. 16:10 desktop screenshots work best.">
                      <MediaField />
                    </Form.Item>
                    <Form.Item name={["media", "fullPageScreenshot"]} label="Full-page screenshot" extra="A tall capture of the whole page — shown in a scrollable browser frame.">
                      <MediaField />
                    </Form.Item>
                    <div className="grid gap-x-6 lg:grid-cols-2">
                      <Form.Item name={["media", "logo"]} label="Logo / app icon">
                        <MediaField />
                      </Form.Item>
                      <Form.Item name={["media", "browserMockup"]} label="Browser mockup image">
                        <MediaField />
                      </Form.Item>
                    </div>
                    <Form.Item name={["media", "desktopScreenshots"]} label="Desktop screenshots">
                      <MediaListField />
                    </Form.Item>
                    <Form.Item name={["media", "tabletScreenshots"]} label="Tablet screenshots">
                      <MediaListField />
                    </Form.Item>
                    <Form.Item name={["media", "mobileScreenshots"]} label="Mobile screenshots" extra="Portrait screenshots are shown in phone frames.">
                      <MediaListField />
                    </Form.Item>
                    <Form.Item name={["media", "gallery"]} label="Additional gallery images">
                      <MediaListField />
                    </Form.Item>
                    <Card size="small" title="Video demonstration" className="!mt-2">
                      <Form.Item name={["video", "url"]} label="Video URL" extra="YouTube, Vimeo or a direct .mp4/.webm file. Loaded only when visitors press play.">
                        <Input placeholder="https://" />
                      </Form.Item>
                      <div className="grid gap-x-4 sm:grid-cols-2">
                        <Form.Item name={["video", "title"]} label="Title">
                          <Input />
                        </Form.Item>
                        <Form.Item name={["video", "posterUrl"]} label="Poster / thumbnail URL">
                          <Input placeholder="https://" />
                        </Form.Item>
                      </div>
                      <Form.Item name={["video", "captionsUrl"]} label="Captions (.vtt) URL">
                        <Input placeholder="https://" />
                      </Form.Item>
                      <Form.Item name={["video", "transcript"]} label="Transcript">
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 8 }} />
                      </Form.Item>
                    </Card>
                  </>
                ),
              },
              {
                key: "case-study",
                label: "Case study",
                forceRender: true,
                children: (
                  <>
                    <Alert
                      className="!mb-5"
                      type="info"
                      showIcon
                      title="All sections are optional — empty ones are simply hidden on the public page. Never add invented results, clients or testimonials."
                    />
                    <Collapse
                      items={CASE_STUDY_FIELDS.map((field) => ({
                        key: field.key,
                        forceRender: true,
                        label: (
                          <span>
                            {field.label}
                            {field.hint && <span className="ml-2 text-xs text-stone-500">{field.hint}</span>}
                          </span>
                        ),
                        children: (
                          <Form.Item name={["caseStudy", field.key]} noStyle>
                            <MarkdownField rows={6} />
                          </Form.Item>
                        ),
                      }))}
                    />
                  </>
                ),
              },
              {
                key: "blocks",
                label: "Content blocks",
                forceRender: true,
                children: <BlockEditor />,
              },
              {
                key: "links",
                label: "Links & demo",
                forceRender: true,
                children: (
                  <>
                    <div className="grid gap-x-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                      <Form.Item name={["links", "liveUrl"]} label="Live demo / app URL" rules={[{ type: "url", message: "Enter a full https:// URL" }]}>
                        <Input placeholder="https://" />
                      </Form.Item>
                      <Form.Item name={["links", "liveUrlLabel"]} label="Button label">
                        <Input placeholder="Open live demo" />
                      </Form.Item>
                      <Form.Item name={["links", "secondaryUrl"]} label="Secondary preview URL" rules={[{ type: "url", message: "Enter a full https:// URL" }]}>
                        <Input placeholder="https://" />
                      </Form.Item>
                      <Form.Item name={["links", "secondaryUrlLabel"]} label="Label">
                        <Input />
                      </Form.Item>
                      <Form.Item name={["links", "appStoreUrl"]} label="App Store URL" rules={[{ type: "url" }]}>
                        <Input placeholder="https://" />
                      </Form.Item>
                      <Form.Item name={["links", "playStoreUrl"]} label="Google Play URL" rules={[{ type: "url" }]}>
                        <Input placeholder="https://" />
                      </Form.Item>
                    </div>
                    <Form.Item name={["links", "sourceUrl"]} label="Source code URL" rules={[{ type: "url" }]}>
                      <Input placeholder="https://github.com/…" />
                    </Form.Item>
                    <Form.Item name={["links", "showSourceUrl"]} label="Show source code link publicly" valuePropName="checked" extra="Off by default — only enable for public repositories.">
                      <Switch />
                    </Form.Item>

                    <Card size="small" title="Public demo access" className="!mt-4">
                      <Alert
                        className="!mb-4"
                        type="warning"
                        showIcon
                        title="Anything entered here is shown publicly while enabled."
                        description="Only use a dedicated sandbox/demo account with limited permissions. Never enter real, admin or production credentials."
                      />
                      <Form.Item name={["demoAccess", "enabled"]} label="Show the demo access panel" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                      <div className="grid gap-x-4 sm:grid-cols-2">
                        <Form.Item name={["demoAccess", "username"]} label="Demo email / username" rules={demoEnabled ? [{ required: true, message: "Required while the panel is enabled" }] : []}>
                          <Input autoComplete="off" />
                        </Form.Item>
                        <Form.Item name={["demoAccess", "password"]} label="Demo password / PIN">
                          <Input autoComplete="off" />
                        </Form.Item>
                      </div>
                      <Form.Item name={["demoAccess", "loginUrl"]} label="Login URL" rules={[{ type: "url" }]}>
                        <Input placeholder="https://" />
                      </Form.Item>
                      <Form.Item name={["demoAccess", "instructions"]} label="Instructions">
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
                      </Form.Item>
                      <Form.Item name={["demoAccess", "limitations"]} label="Limitations / reset schedule">
                        <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} placeholder="e.g. Data resets every night." />
                      </Form.Item>
                    </Card>
                  </>
                ),
              },
              {
                key: "seo",
                label: "SEO",
                forceRender: true,
                children: <SeoFields path={publicPath} fallbackTitle={title} fallbackDescription={summary} />,
              },
            ]}
          />
        </Card>

        {/* Publishing sidebar */}
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {/* every field here is optional, and "(optional)" would crowd the narrow column */}
          <Card title="Publishing" className="[&_.ant-form-item-optional]:hidden">
            <Form.Item name="publishStatus" label="Status">
              <Segmented
                block
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "archived", label: "Archived" },
                ]}
              />
            </Form.Item>
            {publishStatus === "published" && !summary?.trim() && (
              <Alert className="!mb-4" type="warning" showIcon title="Add a summary (Basics tab) before publishing." />
            )}
            <Form.Item name="visibility" label="Visibility" extra="Unlisted: reachable by direct link only, hidden from listings and search.">
              <Select
                options={[
                  { value: "listed", label: "Listed" },
                  { value: "unlisted", label: "Unlisted (link only)" },
                ]}
              />
            </Form.Item>
            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item name="featured" label="Featured" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="featuredOrder" label="Featured order">
                <InputNumber min={0} className="!w-full" />
              </Form.Item>
              <Form.Item name="sortOrder" label="Sort order">
                <InputNumber min={0} className="!w-full" />
              </Form.Item>
              <Form.Item name="publishedAt" label="Published date">
                <Input type="date" />
              </Form.Item>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="primary" htmlType="submit" loading={saving} icon={<LuSave aria-hidden />}>
                Save
              </Button>
              {!isNew && project.data && (
                <>
                  <Button
                    icon={<LuEye aria-hidden />}
                    onClick={() => window.open(`/preview?path=${encodeURIComponent(`/projects/${project.data!.slug}`)}`, "_blank", "noopener")}
                  >
                    Preview
                  </Button>
                  {project.data.publishStatus === "published" && (
                    <Button icon={<LuExternalLink aria-hidden />} href={`/projects/${project.data.slug}`} target="_blank">
                      View
                    </Button>
                  )}
                </>
              )}
            </div>
            {!isNew && project.data && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-paper-200 pt-4 text-xs text-stone-600">
                <Tag color={project.data.publishStatus === "published" ? "green" : project.data.publishStatus === "archived" ? "default" : "orange"}>
                  {project.data.publishStatus}
                </Tag>
                {project.data.updatedAt && <span>Saved {new Date(project.data.updatedAt).toLocaleString()}</span>}
              </div>
            )}
          </Card>

          <Card title="Related & call to action">
            <Form.Item name="relatedProjects" label="Related projects" extra="Leave empty to show projects from the same industry.">
              <OrderedSelect options={(projectOptions.data || []).filter((option) => option._id !== id)} max={6} />
            </Form.Item>
            <CtaFields hint="Optional — overrides the default 'Request something similar' call to action." />
          </Card>

          <Card title="Internal notes">
            <Form.Item name="internalNotes" noStyle>
              <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} placeholder="Private — never shown on the website." />
            </Form.Item>
          </Card>

          {!isNew && project.data && (
            <Card>
              <div className="flex flex-wrap gap-2">
                <Button
                  icon={<LuCopy aria-hidden />}
                  loading={duplicateProject.isLoading}
                  onClick={async () => {
                    const copy = await duplicateProject.mutateAsync(id!);
                    navigate(`/admin/projects/${copy._id}`);
                  }}
                >
                  Duplicate
                </Button>
                <Popconfirm
                  title="Delete this project?"
                  description="This permanently removes it and its references. Consider archiving instead."
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    await deleteProject.mutateAsync(id!);
                    setDirty(false);
                    router.replace("/admin/projects");
                  }}
                >
                  <Button danger icon={<LuTrash2 aria-hidden />}>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </Card>
          )}
        </div>
      </div>
      </>
      )}
    </Form>
  );
}
