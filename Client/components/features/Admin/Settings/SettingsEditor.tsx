"use client";

import { Alert, Button, Card, Form, Input, Skeleton, Switch, Tabs, Tag } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { LuExternalLink, LuPlus, LuSave, LuTrash2 } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import { contrastTextFor, normalizeAccent } from "@/lib/color";
import { cn } from "@/lib/utils";
import { FeatureListField, MarkdownField, OrderedSelect, StringListField } from "../fields/FormFields";
import PageHeader from "../PageHeader";
import { useUnsavedChanges } from "../UnsavedChanges";
import ContactSocialForm from "./ContactSocialForm";
import ConfirmDelete from "../fields/ConfirmDelete";

const ACCENT_PRESETS = ["#C8F25C", "#9EF0C9", "#FFD166", "#FF8A65", "#8EC5FF", "#E9E4D8"];

function AccentPicker({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const accent = normalizeAccent(value);
  const onDarkText = contrastTextFor(accent);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ACCENT_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Use ${color}`}
            onClick={() => onChange?.(color)}
            className={cn("size-9 rounded-full ring-2 ring-offset-2", accent.toLowerCase() === color.toLowerCase() ? "ring-ink-950" : "ring-transparent")}
            style={{ background: color }}
          />
        ))}
        <Input value={value} onChange={(event) => onChange?.(event.target.value)} className="!w-32" placeholder="#C8F25C" />
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full px-4 py-2 text-sm font-medium" style={{ background: accent, color: onDarkText }}>
          Button preview
        </span>
        <span className="rounded-full bg-ink-950 px-4 py-2 text-sm" style={{ color: accent }}>
          Accent on dark
        </span>
      </div>
      <p className="text-xs text-stone-600">
        Text on accent buttons switches automatically to {onDarkText === "#ffffff" ? "white" : "ink"} for readability. Light, vivid accents work best on the dark sections.
      </p>
    </div>
  );
}

/*
 * Read-only overview of optional server integrations. The API only reports
 * whether each one is configured - secrets never reach the browser - so this
 * lists the environment variable *names* to set on the server.
 */
const INTEGRATIONS = [
  {
    key: "emailNotifications",
    title: "E-mail notifications",
    on: "New inquiries are e-mailed to the notification address (Inquiries tab).",
    off: "Inquiries are saved in the dashboard but no e-mail is sent.",
    env: "SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM",
  },
  {
    key: "mediaUploads",
    title: "Media uploads (S3)",
    on: "Images and videos can be uploaded from the media library.",
    off: "Media can still be added by URL or placed in Client/public/media.",
    env: "AWS_S3_BUCKET_NAME, AWS_S3_BUCKET_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, MEDIA_PUBLIC_BASE_URL",
  },
] as const;

function IntegrationsStatus({ status }: { status?: { emailNotifications: boolean; mediaUploads: boolean } }) {
  return (
    <div className="space-y-3">
      {INTEGRATIONS.map((item) => {
        const enabled = !!status?.[item.key];
        return (
          <div key={item.key} className="rounded-xl bg-paper-50 p-4 ring-1 ring-paper-300/70">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{item.title}</p>
              <Tag color={enabled ? "green" : "default"}>{enabled ? "Configured" : "Not configured"}</Tag>
            </div>
            <p className="mt-1 text-sm text-stone-600">{enabled ? item.on : item.off}</p>
            {!enabled && (
              <p className="mt-2 text-xs text-stone-500">
                Server environment variables: <code className="font-mono">{item.env}</code>. See Server/README.md.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SettingsEditor() {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const { setDirty } = useUnsavedChanges();
  const settings = AdminHooks.useSettings();
  const update = AdminHooks.useUpdateSettings();
  const integrations = AdminHooks.useIntegrations();
  const projects = AdminHooks.useProjectOptions();
  const services = AdminHooks.useServiceOptions();
  const categories = AdminHooks.useCategoryOptions();

  // Fill the form once. Later refetches - e.g. after saving the Contact & social
  // form in the same screen - must not overwrite unsaved edits in other tabs.
  const loaded = useRef(false);
  useEffect(() => {
    if (settings.data && !loaded.current) {
      form.setFieldsValue(settings.data);
      loaded.current = true;
    }
  }, [settings.data, form]);
  useEffect(() => () => setDirty(false), [setDirty]);

  const onFinish = async () => {
    // The full form store, not just the registered fields: it keeps each list
    // item's _id, so saving doesn't recreate unchanged items (the API strips
    // anything that isn't editable). Contact & social are saved by their own form.
    const { contact, socialLinks, ...rest } = form.getFieldsValue(true);
    const saved = await update.mutateAsync(rest);
    // Pick up the ids the API gave newly added list items
    form.setFieldsValue(saved);
    setDirty(false);
  };

  if (settings.isLoading) return <Skeleton active paragraph={{ rows: 14 }} />;

  return (
    // component={false} keeps the Contact & social <form> from being nested
    <Form form={form} component={false} layout="vertical" requiredMark="optional" onFinish={onFinish} onValuesChange={() => setDirty(true)} scrollToFirstError>
      <PageHeader
        title="Site settings"
        description="Branding, homepage content, navigation, SEO defaults, legal pages and inquiry options."
        actions={
          <>
            <Button icon={<LuExternalLink aria-hidden />} href="/" target="_blank">
              View website
            </Button>
            <Button type="primary" onClick={() => form.submit()} loading={update.isLoading} icon={<LuSave aria-hidden />}>
              Save settings
            </Button>
          </>
        }
      />
      <Card>
        <Tabs
          defaultActiveKey={searchParams.get("tab") || "branding"}
          items={[
            {
              key: "branding",
              label: "Branding",
              forceRender: true,
              children: (
                <>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <Form.Item name={["brand", "name"]} label="Brand name" rules={[{ required: true, min: 2 }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name={["brand", "tagline"]} label="Tagline">
                      <Input />
                    </Form.Item>
                  </div>
                  <Form.Item name={["brand", "description"]} label="Short description" extra="Used in structured data and as a fallback description.">
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
                  </Form.Item>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <Form.Item name={["brand", "logoUrl"]} label="Custom logo (light backgrounds)" extra="Optional. Leave empty to use the built-in SVG logo.">
                      <Input placeholder="https://… or /brand/…" />
                    </Form.Item>
                    <Form.Item name={["brand", "logoDarkUrl"]} label="Custom logo (dark backgrounds)">
                      <Input placeholder="https://… or /brand/…" />
                    </Form.Item>
                  </div>
                  <Form.Item name={["theme", "accent"]} label="Accent colour" rules={[{ pattern: /^#[0-9a-fA-F]{6}$/, message: "Use a 6-digit hex colour" }]}>
                    <AccentPicker />
                  </Form.Item>
                </>
              ),
            },
            {
              key: "homepage",
              label: "Homepage",
              forceRender: true,
              children: (
                <>
                  <Card size="small" title="Hero" className="!mb-5">
                    <Form.Item name={["home", "heroEyebrow"]} label="Eyebrow">
                      <Input />
                    </Form.Item>
                    <Form.Item name={["home", "heroHeadline"]} label="Headline" rules={[{ required: true, min: 5 }]}>
                      <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
                    </Form.Item>
                    <Form.Item name={["home", "heroHighlight"]} label="Highlighted phrase" extra="Part of the headline shown in the italic accent style (must appear in the headline).">
                      <Input />
                    </Form.Item>
                    <Form.Item name={["home", "heroSubtext"]} label="Supporting text">
                      <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
                    </Form.Item>
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <Form.Item name={["home", "primaryCta", "label"]} label="Primary button label" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name={["home", "primaryCta", "href"]} label="Primary button link" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name={["home", "secondaryCta", "label"]} label="Secondary button label" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name={["home", "secondaryCta", "href"]} label="Secondary button link" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    </div>
                  </Card>

                  <Card size="small" title="Sections" className="!mb-5">
                    <div className="grid gap-x-4 sm:grid-cols-3">
                      {[
                        ["selectedWork", "Selected work"],
                        ["services", "What we build"],
                        ["industries", "Industries"],
                        ["process", "Process"],
                        ["capabilities", "Capabilities"],
                        ["about", "About preview"],
                        ["finalCta", "Closing call to action"],
                      ].map(([key, label]) => (
                        <Form.Item key={key} name={["home", "sections", key]} label={label} valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      ))}
                    </div>
                  </Card>

                  <Card size="small" title="Selected work" className="!mb-5">
                    <Form.Item name={["home", "selectedWork", "heading"]} label="Heading">
                      <Input />
                    </Form.Item>
                    <Form.Item name={["home", "selectedWork", "intro"]} label="Intro">
                      <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
                    </Form.Item>
                    <Form.Item name={["home", "selectedWork", "projects"]} label="Projects (in order)" extra="Leave empty to show projects marked as featured.">
                      <OrderedSelect options={projects.data || []} max={12} />
                    </Form.Item>
                  </Card>

                  <Card size="small" title="What we build (services)" className="!mb-5">
                    <Form.Item name={["home", "services", "heading"]} label="Heading">
                      <Input />
                    </Form.Item>
                    <Form.Item name={["home", "services", "intro"]} label="Intro">
                      <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
                    </Form.Item>
                    <Form.Item name={["home", "services", "items"]} label="Services (in order)">
                      <OrderedSelect options={services.data || []} max={12} />
                    </Form.Item>
                  </Card>

                  <Card size="small" title="Industries" className="!mb-5">
                    <Form.Item name={["home", "industries", "heading"]} label="Heading">
                      <Input />
                    </Form.Item>
                    <Form.Item name={["home", "industries", "intro"]} label="Intro">
                      <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
                    </Form.Item>
                    <Form.Item name={["home", "industries", "items"]} label="Industries (in order; the first is shown large)">
                      <OrderedSelect options={categories.data || []} max={16} />
                    </Form.Item>
                  </Card>

                  <Card size="small" title="Process" className="!mb-5">
                    <Form.Item name={["home", "process", "heading"]} label="Heading">
                      <Input />
                    </Form.Item>
                    <Form.Item name={["home", "process", "intro"]} label="Intro">
                      <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
                    </Form.Item>
                    <FeatureListField name={["home", "process", "steps"]} label="Steps" addLabel="Add step" max={8} />
                  </Card>

                  <Card size="small" title="Capabilities & technologies" className="!mb-5">
                    <Form.Item name={["home", "capabilities", "heading"]} label="Heading">
                      <Input />
                    </Form.Item>
                    <Form.Item name={["home", "capabilities", "intro"]} label="Intro">
                      <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
                    </Form.Item>
                    <FeatureListField name={["home", "capabilities", "items"]} label="Capabilities" withIcon addLabel="Add capability" max={9} />
                    <StringListField name={["home", "capabilities", "technologies"]} label="Technologies" addLabel="Add technology" max={40} />
                  </Card>

                  <Card size="small" title="About preview" className="!mb-5">
                    <Form.Item name={["home", "about", "heading"]} label="Heading">
                      <Input />
                    </Form.Item>
                    <Form.Item name={["home", "about", "text"]} label="Text">
                      <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
                    </Form.Item>
                    <Form.Item name={["home", "about", "ctaLabel"]} label="Button label">
                      <Input />
                    </Form.Item>
                  </Card>

                  <Card size="small" title="Closing call to action (shown above the footer on every page)">
                    <div className="grid gap-x-4 sm:grid-cols-2">
                      <Form.Item name={["home", "finalCta", "heading"]} label="Heading">
                        <Input />
                      </Form.Item>
                      <Form.Item name={["home", "finalCta", "buttonLabel"]} label="Button label">
                        <Input />
                      </Form.Item>
                    </div>
                    <Form.Item name={["home", "finalCta", "text"]} label="Text">
                      <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
                    </Form.Item>
                    <Form.Item name={["home", "finalCta", "buttonHref"]} label="Button link">
                      <Input placeholder="/contact" />
                    </Form.Item>
                  </Card>
                </>
              ),
            },
            {
              key: "navigation",
              label: "Navigation & footer",
              forceRender: true,
              children: (
                <>
                  <Form.Item label="Header navigation">
                    <Form.List name={["navigation", "header"]}>
                      {(fields, { add, remove, move }) => (
                        <div className="space-y-2">
                          {fields.map((field, index) => (
                            <div key={field.key} className="flex flex-wrap items-center gap-2">
                              <Form.Item name={[field.name, "label"]} noStyle rules={[{ required: true }]}>
                                <Input placeholder="Label" className="!w-44" />
                              </Form.Item>
                              <Form.Item name={[field.name, "href"]} noStyle rules={[{ required: true }]}>
                                <Input placeholder="/work" className="min-w-[180px] flex-1" />
                              </Form.Item>
                              <Form.Item name={[field.name, "visible"]} noStyle valuePropName="checked">
                                <Switch checkedChildren="Visible" unCheckedChildren="Hidden" />
                              </Form.Item>
                              <Button size="small" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move up">
                                ↑
                              </Button>
                              <Button size="small" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} aria-label="Move down">
                                ↓
                              </Button>
                              <ConfirmDelete title="Remove this link?" onConfirm={() => remove(field.name)}><Button size="small" danger icon={<LuTrash2 aria-hidden />} aria-label="Remove link" /></ConfirmDelete>
                            </div>
                          ))}
                          <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add({ label: "", href: "/", visible: true })}>
                            Add link
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </Form.Item>
                  <Form.Item name={["footer", "blurb"]} label="Footer description">
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
                  </Form.Item>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <Form.Item name={["footer", "showServices"]} label="List services in the footer" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name={["footer", "showIndustries"]} label="List industries in the footer" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </div>
                </>
              ),
            },
            {
              key: "contact",
              label: "Contact & social",
              children: <ContactSocialForm />,
            },
            {
              key: "seo",
              label: "SEO defaults",
              forceRender: true,
              children: (
                <>
                  <Form.Item name={["seo", "titleTemplate"]} label="Title template" extra="%s is replaced by the page title, e.g. '%s — SH Digital Studio'.">
                    <Input />
                  </Form.Item>
                  <Form.Item name={["seo", "defaultTitle"]} label="Homepage title" rules={[{ max: 70 }]}>
                    <Input showCount maxLength={70} />
                  </Form.Item>
                  <Form.Item name={["seo", "defaultDescription"]} label="Default description" rules={[{ max: 200 }]}>
                    <Input.TextArea showCount maxLength={200} autoSize={{ minRows: 2, maxRows: 4 }} />
                  </Form.Item>
                  <Form.Item name={["seo", "defaultOgImage"]} label="Default social image URL" extra="Optional — a branded card is generated automatically.">
                    <Input placeholder="https://… (1200×630)" />
                  </Form.Item>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <Form.Item name={["seo", "twitterHandle"]} label="X / Twitter handle">
                      <Input placeholder="@yourhandle" />
                    </Form.Item>
                    <Form.Item name={["seo", "googleSiteVerification"]} label="Google Search Console verification code">
                      <Input />
                    </Form.Item>
                  </div>
                  <StringListField name={["seo", "keywords"]} label="Keywords" addLabel="Add keyword" max={20} />
                </>
              ),
            },
            {
              key: "announcement",
              label: "Announcement",
              forceRender: true,
              children: (
                <>
                  <Form.Item name={["announcement", "enabled"]} label="Show announcement bar" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item name={["announcement", "text"]} label="Text" rules={[{ max: 160 }]}>
                    <Input showCount maxLength={160} />
                  </Form.Item>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <Form.Item name={["announcement", "linkLabel"]} label="Link label">
                      <Input />
                    </Form.Item>
                    <Form.Item name={["announcement", "linkHref"]} label="Link">
                      <Input placeholder="/contact" />
                    </Form.Item>
                  </div>
                </>
              ),
            },
            {
              key: "legal",
              label: "Legal pages",
              forceRender: true,
              children: (
                <>
                  <Alert
                    className="!mb-5"
                    type="warning"
                    showIcon
                    title="These are starting templates. Review them (ideally with a professional) so they match how you actually handle data."
                  />
                  <Form.Item name={["legal", "privacyPolicy"]} label="Privacy policy">
                    <MarkdownField rows={14} />
                  </Form.Item>
                  <Form.Item name={["legal", "terms"]} label="Terms of use">
                    <MarkdownField rows={12} />
                  </Form.Item>
                </>
              ),
            },
            {
              key: "inquiries",
              label: "Inquiries",
              forceRender: true,
              children: (
                <>
                  <div className="mb-5 flex items-center gap-3 text-sm">
                    E-mail notifications:
                    <Tag color={integrations.data?.emailNotifications ? "green" : "default"}>
                      {integrations.data?.emailNotifications ? "Configured" : "Not configured (inquiries are still saved in the dashboard)"}
                    </Tag>
                  </div>
                  <Form.Item
                    name={["inquiry", "notificationEmail"]}
                    label="Send new inquiry notifications to"
                    rules={[{ type: "email" }]}
                    extra="Requires SMTP settings on the server (see Server/README.md)."
                  >
                    <Input placeholder="you@your-domain.com" />
                  </Form.Item>
                  <StringListField name={["inquiry", "budgetRanges"]} label="Budget ranges on the form" addLabel="Add range" max={10} />
                  <Form.Item name={["inquiry", "successMessage"]} label="Confirmation message after submitting">
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
                  </Form.Item>
                </>
              ),
            },
            {
              key: "integrations",
              label: "Integrations",
              children: <IntegrationsStatus status={integrations.data} />,
            },
          ]}
        />
      </Card>
    </Form>
  );
}
