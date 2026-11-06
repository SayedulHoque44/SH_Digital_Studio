"use client";

import { Alert, Button, Card, Form, Input, Popconfirm, Result, Segmented, Select, Skeleton, Tabs } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LuArrowLeft, LuExternalLink, LuSave, LuTrash2 } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IAdminService } from "@/features/Admin/interface/admin.interface";
import { PROJECT_TYPE_LABELS } from "@/lib/format";
import { CtaFields, FaqListField, FeatureListField, IconSelect, MarkdownField, OrderedSelect, SeoFields, SlugInput, StringListField } from "../fields/FormFields";
import { MediaField } from "../fields/MediaField";
import PageHeader from "../PageHeader";
import { useUnsavedChanges } from "../UnsavedChanges";

const toForm = (service?: IAdminService) =>
  service
    ? { ...service, image: service.image || null, seo: { noIndex: false, ...(service.seo || {}) }, cta: service.cta || {} }
    : {
        status: "draft",
        benefits: [],
        features: [],
        deliverables: [],
        industries: [],
        relatedProjects: [],
        projectTypes: [],
        faqs: [],
        seo: { noIndex: false },
      };

export default function ServiceEditor({ id }: { id?: string }) {
  const isNew = !id;
  const router = useRouter();
  const [form] = Form.useForm();
  const { setDirty, navigate } = useUnsavedChanges();
  const service = AdminHooks.useService(id);
  const categories = AdminHooks.useCategoryOptions();
  const projects = AdminHooks.useProjectOptions();
  const create = AdminHooks.useCreateService();
  const update = AdminHooks.useUpdateService();
  const remove = AdminHooks.useDeleteService();

  const title = Form.useWatch("title", form) as string | undefined;
  const slug = Form.useWatch("slug", form) as string | undefined;
  const shortDescription = Form.useWatch("shortDescription", form) as string | undefined;

  useEffect(() => {
    if (isNew) form.setFieldsValue(toForm());
    else if (service.data) form.setFieldsValue(toForm(service.data));
  }, [isNew, service.data, form]);
  useEffect(() => () => setDirty(false), [setDirty]);

  const onFinish = async () => {
    // The full form store, not just the registered fields: it keeps each list
    // item's _id, so saving doesn't recreate unchanged items (the API strips
    // anything that isn't editable)
    const values = form.getFieldsValue(true);
    const payload = { ...values, image: values.image?.url ? values.image : null };
    if (isNew) {
      const created = await create.mutateAsync(payload);
      setDirty(false);
      router.replace(`/admin/services/${created._id}`);
    } else {
      const saved = await update.mutateAsync({ id: id!, payload });
      form.setFieldsValue(toForm(saved));
      setDirty(false);
    }
  };

  const loading = !isNew && service.isLoading;
  const missing = !isNew && !service.isLoading && (service.isError || !service.data);

  return (
    <Form form={form} layout="vertical" requiredMark="optional" onFinish={onFinish} onValuesChange={() => setDirty(true)} scrollToFirstError>
      {loading ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : missing ? (
        <Result status="404" title="Service not found" extra={<Link href="/admin/services">Back to services</Link>} />
      ) : (
        <>
          <PageHeader
            eyebrow={
              <button type="button" onClick={() => navigate("/admin/services")} className="inline-flex items-center gap-1.5 hover:underline">
                <LuArrowLeft aria-hidden /> Services
              </button>
            }
            title={isNew ? "New service" : service.data?.title}
            actions={
              <>
                {!isNew && service.data?.status === "published" && (
                  <Button icon={<LuExternalLink aria-hidden />} href={`/services/${service.data.slug}`} target="_blank">
                    View
                  </Button>
                )}
                <Button type="primary" htmlType="submit" loading={create.isLoading || update.isLoading} icon={<LuSave aria-hidden />}>
                  {isNew ? "Create service" : "Save changes"}
                </Button>
              </>
            }
          />
          <Card>
            <Tabs
              items={[
                {
                  key: "basics",
                  label: "Basics",
                  forceRender: true,
                  children: (
                    <>
                      <div className="grid gap-x-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        <Form.Item name="title" label="Title" rules={[{ required: true, min: 2 }]}>
                          <Input />
                        </Form.Item>
                        <Form.Item name="status" label="Status">
                          <Segmented options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} />
                        </Form.Item>
                      </div>
                      <Form.Item name="slug" label="URL slug">
                        <SlugInput prefix="/services/" source={title} />
                      </Form.Item>
                      <Form.Item name="icon" label="Icon">
                        <IconSelect />
                      </Form.Item>
                      <Form.Item name="shortDescription" label="Short description" rules={[{ max: 320 }]}>
                        <Input.TextArea showCount maxLength={320} autoSize={{ minRows: 2, maxRows: 4 }} />
                      </Form.Item>
                      <Form.Item name="description" label="Full description">
                        <MarkdownField rows={8} />
                      </Form.Item>
                      <Form.Item name="image" label="Image">
                        <MediaField />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: "details",
                  label: "Details",
                  forceRender: true,
                  children: (
                    <>
                      <StringListField name="benefits" label="Benefits" addLabel="Add benefit" max={12} />
                      <FeatureListField name="features" label="Features" addLabel="Add feature" />
                      <StringListField name="deliverables" label="Typical deliverables" addLabel="Add deliverable" max={20} />
                    </>
                  ),
                },
                {
                  key: "pricing",
                  label: "Pricing & timeline",
                  forceRender: true,
                  children: (
                    <>
                      <Alert
                        className="!mb-5"
                        type="warning"
                        showIcon
                        title="Only publish prices and timelines you have confirmed. Leave empty to hide them."
                      />
                      <div className="grid gap-x-4 sm:grid-cols-2">
                        <Form.Item name="startingPrice" label="Starting price" extra="e.g. From $1,500">
                          <Input />
                        </Form.Item>
                        <Form.Item name="timeline" label="Typical timeline" extra="e.g. 3–5 weeks">
                          <Input />
                        </Form.Item>
                      </div>
                      <Form.Item name="priceNote" label="Price note">
                        <Input placeholder="e.g. Final quote depends on scope" />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: "relations",
                  label: "Industries & work",
                  forceRender: true,
                  children: (
                    <>
                      <Form.Item name="industries" label="Relevant industries">
                        <Select
                          mode="multiple"
                          optionFilterProp="label"
                          options={(categories.data || []).map((category) => ({ value: category._id, label: category.name }))}
                        />
                      </Form.Item>
                      <Form.Item name="relatedProjects" label="Related projects (in order)">
                        <OrderedSelect options={projects.data || []} max={12} />
                      </Form.Item>
                      <Form.Item name="projectTypes" label="Project types" extra="Used to show matching work automatically when no related projects are chosen.">
                        <Select mode="multiple" options={Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({ value, label }))} />
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
                      <CtaFields />
                    </>
                  ),
                },
                {
                  key: "seo",
                  label: "SEO",
                  forceRender: true,
                  children: <SeoFields path={`/services/${slug || "…"}`} fallbackTitle={title} fallbackDescription={shortDescription} />,
                },
              ]}
            />
          </Card>
          {!isNew && (
            <div className="mt-6 flex justify-end">
              <Popconfirm
                title="Delete this service?"
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  await remove.mutateAsync(id!);
                  setDirty(false);
                  router.replace("/admin/services");
                }}
              >
                <Button danger icon={<LuTrash2 aria-hidden />}>
                  Delete service
                </Button>
              </Popconfirm>
            </div>
          )}
        </>
      )}
    </Form>
  );
}
