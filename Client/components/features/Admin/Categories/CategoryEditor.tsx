"use client";

import { Alert, Button, Drawer, Form, Input, Segmented, Select, Skeleton, Switch, Tabs } from "antd";
import { useEffect } from "react";
import { LuCopy, LuSave } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IAdminCategory } from "@/features/Admin/interface/admin.interface";
import { successToast } from "@/utils/toast";
import BlockEditor from "../fields/BlockEditor";
import { CtaFields, FaqListField, IconSelect, MarkdownField, OrderedSelect, SeoFields, SlugInput, StringListField } from "../fields/FormFields";
import { MediaField } from "../fields/MediaField";
import { useUnsavedChanges } from "../UnsavedChanges";

const toForm = (category?: IAdminCategory) =>
  category
    ? {
        ...category,
        parent: typeof category.parent === "object" && category.parent ? category.parent._id : category.parent || null,
        coverImage: category.coverImage || null,
        featuredImage: category.featuredImage || null,
        seo: { noIndex: false, ...(category.seo || {}) },
        cta: category.cta || {},
      }
    : {
        status: "draft",
        showOnHome: false,
        highlights: [],
        faqs: [],
        contentBlocks: [],
        featuredProjects: [],
        relatedServices: [],
        parent: null,
        seo: { noIndex: false },
      };

const cleanMedia = (media: any) => (media?.url ? media : null);

export default function CategoryEditor({ id, open, onClose }: { id?: string; open: boolean; onClose: () => void }) {
  const isNew = !id;
  const [form] = Form.useForm();
  const { setDirty, isDirty } = useUnsavedChanges();
  const category = AdminHooks.useCategory(id);
  const options = AdminHooks.useCategoryOptions();
  const projects = AdminHooks.useProjectOptions();
  const services = AdminHooks.useServiceOptions();
  const create = AdminHooks.useCreateCategory();
  const update = AdminHooks.useUpdateCategory();

  const name = Form.useWatch("name", form) as string | undefined;
  const slug = Form.useWatch("slug", form) as string | undefined;
  const emailIntro = Form.useWatch("emailIntro", form) as string | undefined;
  const shortDescription = Form.useWatch("shortDescription", form) as string | undefined;

  useEffect(() => {
    if (!open) return;
    if (isNew) form.setFieldsValue(toForm());
    else if (category.data) form.setFieldsValue(toForm(category.data));
  }, [open, isNew, category.data, form]);

  const close = () => {
    if (isDirty() && !window.confirm("Discard unsaved changes?")) return;
    setDirty(false);
    form.resetFields();
    onClose();
  };

  const onFinish = async () => {
    // The full form store, not just the registered fields: it keeps each list
    // item's _id, so saving doesn't recreate unchanged items (the API strips
    // anything that isn't editable)
    const values = form.getFieldsValue(true);
    const payload = {
      ...values,
      parent: values.parent || null,
      coverImage: cleanMedia(values.coverImage),
      featuredImage: cleanMedia(values.featuredImage),
    };
    if (isNew) await create.mutateAsync(payload);
    else await update.mutateAsync({ id: id!, payload });
    setDirty(false);
    form.resetFields();
    onClose();
  };

  // Ready-to-paste text for emailing the industry page to a prospect
  const copyEmailText = async () => {
    const url = `${window.location.origin}/demos/${category.data?.slug || slug}`;
    const text = `${emailIntro || shortDescription || ""}\n\n${url}`.trim();
    await navigator.clipboard.writeText(text);
    successToast("Link and intro copied — paste it into your email");
  };

  const parentOptions = (options.data || [])
    .filter((option) => !option.parent && option._id !== id)
    .map((option) => ({ value: option._id, label: option.name }));

  return (
    <Drawer
      open={open}
      onClose={close}
      title={isNew ? "New category" : `Edit: ${category.data?.name || ""}`}
      size={760}
      destroyOnHidden
      extra={
        <Button type="primary" icon={<LuSave aria-hidden />} loading={create.isLoading || update.isLoading} onClick={() => form.submit()}>
          Save
        </Button>
      }
    >
      <Form form={form} layout="vertical" requiredMark="optional" onFinish={onFinish} onValuesChange={() => setDirty(true)} scrollToFirstError>
        {!isNew && category.isLoading ? (
          <Skeleton active />
        ) : (
          <Tabs
            items={[
              {
                key: "basics",
                label: "Basics",
                forceRender: true,
                children: (
                  <>
                    <Form.Item name="name" label="Name" rules={[{ required: true, min: 2 }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="slug" label="URL slug" extra="Shareable link: /demos/<slug>. Old slugs keep redirecting.">
                      <SlugInput prefix="/demos/" source={name} />
                    </Form.Item>
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <Form.Item name="status" label="Status">
                        <Segmented options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} />
                      </Form.Item>
                      <Form.Item name="showOnHome" label="Feature on homepage" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                      <Form.Item name="parent" label="Parent category" extra="Optional — for sub-categories like Fine Dining.">
                        <Select allowClear options={parentOptions} placeholder="None (top level)" />
                      </Form.Item>
                      <Form.Item name="icon" label="Icon">
                        <IconSelect />
                      </Form.Item>
                    </div>
                    <Form.Item name="shortDescription" label="Short description" rules={[{ max: 320 }]}>
                      <Input.TextArea showCount maxLength={320} autoSize={{ minRows: 2, maxRows: 4 }} />
                    </Form.Item>
                    <Form.Item
                      name="emailIntro"
                      label="Intro for emails"
                      extra="A short, personal note shown at the top of the page and handy to paste into emails."
                      rules={[{ max: 600 }]}
                    >
                      <Input.TextArea showCount maxLength={600} autoSize={{ minRows: 2, maxRows: 5 }} />
                    </Form.Item>
                    {!isNew && (
                      <Button icon={<LuCopy aria-hidden />} onClick={copyEmailText} className="!mb-6">
                        Copy link + intro for an email
                      </Button>
                    )}
                    <div className="grid gap-x-6 lg:grid-cols-2">
                      <Form.Item name="coverImage" label="Cover image">
                        <MediaField />
                      </Form.Item>
                      <Form.Item name="featuredImage" label="Featured image">
                        <MediaField />
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
                    <StringListField name="highlights" label="What we build for this industry" addLabel="Add highlight" max={12} />
                    <Form.Item name="introduction" label="Introduction">
                      <MarkdownField rows={8} />
                    </Form.Item>
                    <Form.Item label="Content blocks">
                      <BlockEditor />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "relations",
                label: "Projects & services",
                forceRender: true,
                children: (
                  <>
                    <Alert className="!mb-4" type="info" showIcon title="Projects are assigned to categories in each project's Basics tab. Here you choose which ones appear first." />
                    <Form.Item name="featuredProjects" label="Featured projects (shown first, in this order)">
                      <OrderedSelect options={projects.data || []} max={24} />
                    </Form.Item>
                    <Form.Item name="relatedServices" label="Related services">
                      <OrderedSelect options={services.data || []} max={12} />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "faq",
                label: "FAQ & CTA",
                forceRender: true,
                children: (
                  <>
                    <FaqListField />
                    <CtaFields hint="Optional call to action at the end of the industry page." />
                  </>
                ),
              },
              {
                key: "seo",
                label: "SEO",
                forceRender: true,
                children: <SeoFields path={`/demos/${slug || "…"}`} fallbackTitle={name} fallbackDescription={shortDescription} />,
              },
            ]}
          />
        )}
      </Form>
    </Drawer>
  );
}
