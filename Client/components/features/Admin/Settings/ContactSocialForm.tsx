"use client";

import { Button, Form, Input, Select } from "antd";
import { useEffect } from "react";
import { LuPlus, LuSave, LuTrash2 } from "react-icons/lu";
import { SOCIAL_PLATFORMS, socialLabel } from "@/components/shared/SocialIcon";
import { SkeletonStatus } from "@/components/ui/Skeleton";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import ConfirmDelete from "../fields/ConfirmDelete";
import { FieldsSkeleton } from "../Skeletons";

/**
 * Contact details and social profiles. Stored once in site settings and
 * used by the footer, contact page, About page, CTAs and structured data -
 * shared by the Profile and Site settings screens so there is one source.
 */
export default function ContactSocialForm() {
  const [form] = Form.useForm();
  const settings = AdminHooks.useSettings();
  const update = AdminHooks.useUpdateSettings();

  useEffect(() => {
    if (settings.data) form.setFieldsValue({ contact: settings.data.contact || {}, socialLinks: settings.data.socialLinks || [] });
  }, [settings.data, form]);

  if (settings.isLoading)
    return (
      <>
        <SkeletonStatus label="Loading contact details…" />
        <FieldsSkeleton fields={6} textarea={false} />
      </>
    );

  return (
    <Form form={form} layout="vertical" onFinish={() => update.mutate(form.getFieldsValue(true))}>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Form.Item name={["contact", "email"]} label="Public email" rules={[{ type: "email" }]} extra="Shown on the contact page, footer and About page.">
          <Input placeholder="hello@your-domain.com" />
        </Form.Item>
        <Form.Item name={["contact", "phone"]} label="Phone">
          <Input />
        </Form.Item>
        <Form.Item
          name={["contact", "whatsappNumber"]}
          label="WhatsApp number"
          extra="International format, digits only (e.g. +8801XXXXXXXXX). Leave empty to hide WhatsApp buttons."
          rules={[{ pattern: /^\+?[1-9]\d{6,14}$/, message: "Use international format with digits only" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name={["contact", "location"]} label="Location" extra="Optional, e.g. 'Dhaka, Bangladesh · working worldwide'">
          <Input />
        </Form.Item>
      </div>
      <Form.Item
        name={["contact", "whatsappMessage"]}
        label="WhatsApp message template"
        extra="Placeholders: {page}, {project}, {industry} are filled in automatically."
      >
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
      </Form.Item>
      <Form.Item name={["contact", "responseTime"]} label="Typical response time" extra="Only state a response time you can keep. Leave empty to hide.">
        <Input placeholder="e.g. Usually replies within 1–2 business days" />
      </Form.Item>

      <Form.Item label="Social profiles">
        <Form.List name="socialLinks">
          {(fields, { add, remove }) => (
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.key} className="flex flex-wrap gap-2">
                  <Form.Item name={[field.name, "platform"]} noStyle rules={[{ required: true }]}>
                    <Select className="min-w-[150px]" options={SOCIAL_PLATFORMS.map((value) => ({ value, label: socialLabel(value) }))} />
                  </Form.Item>
                  <Form.Item name={[field.name, "url"]} noStyle rules={[{ required: true, type: "url", message: "Full URL required" }]}>
                    <Input placeholder="https://" className="min-w-[240px] flex-1" />
                  </Form.Item>
                  <Form.Item name={[field.name, "label"]} noStyle>
                    <Input placeholder="Label (optional)" className="!w-40" />
                  </Form.Item>
                  <ConfirmDelete title="Remove this social profile?" onConfirm={() => remove(field.name)}><Button danger aria-label="Remove profile" icon={<LuTrash2 aria-hidden />} /></ConfirmDelete>
                </div>
              ))}
              <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add({ platform: "linkedin", url: "" })}>
                Add profile
              </Button>
            </div>
          )}
        </Form.List>
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={update.isLoading} icon={<LuSave aria-hidden />}>
        Save contact & social
      </Button>
    </Form>
  );
}
