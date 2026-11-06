"use client";

import { Button, Form, Input, Select, Space, Switch, Tooltip } from "antd";
import type { FormListFieldData } from "antd";
import { useState } from "react";
import { LuArrowDown, LuArrowUp, LuPlus, LuTrash2 } from "react-icons/lu";
import Icon, { ICON_KEYS } from "@/components/shared/Icon";
import Markdown from "@/components/shared/Markdown";
import type { IOption } from "@/features/Admin/interface/admin.interface";
import { cn } from "@/lib/utils";
import ConfirmDelete from "./ConfirmDelete";

/* ------------------------------------------------------------------ */
/* Markdown editor with a sanitized live preview                       */
/* ------------------------------------------------------------------ */
export function MarkdownField({
  value,
  onChange,
  rows = 8,
  placeholder,
}: {
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  return (
    <div className="rounded-xl ring-1 ring-paper-300">
      <div className="flex items-center justify-between border-b border-paper-300 px-2 py-1.5">
        <div className="flex gap-1">
          {(["write", "preview"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium capitalize",
                mode === item ? "bg-ink-950 text-paper-50" : "text-stone-600 hover:bg-paper-200",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="pr-1 text-[11px] text-stone-500">Markdown: **bold**, *italic*, [link](/contact), - lists, ## headings</span>
      </div>
      {mode === "write" ? (
        <Input.TextArea
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          variant="borderless"
          className="!rounded-none"
        />
      ) : (
        <div className="min-h-[120px] p-4">{value?.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-stone-500">Nothing to preview</p>}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ordered list of short strings (highlights, deliverables, pages)     */
/* ------------------------------------------------------------------ */
function RowActions({
  index,
  count,
  move,
  remove,
}: {
  index: number;
  count: number;
  move: (from: number, to: number) => void;
  remove: (index: number) => void;
}) {
  return (
    <Space.Compact>
      <Tooltip title="Move up">
        <Button aria-label="Move up" icon={<LuArrowUp aria-hidden />} disabled={index === 0} onClick={() => move(index, index - 1)} />
      </Tooltip>
      <Tooltip title="Move down">
        <Button aria-label="Move down" icon={<LuArrowDown aria-hidden />} disabled={index === count - 1} onClick={() => move(index, index + 1)} />
      </Tooltip>
      <Tooltip title="Remove">
        <ConfirmDelete title="Remove this item?" onConfirm={() => remove(index)}><Button danger aria-label="Remove" icon={<LuTrash2 aria-hidden />} /></ConfirmDelete>
      </Tooltip>
    </Space.Compact>
  );
}

export function StringListField({
  name,
  label,
  placeholder,
  addLabel = "Add item",
  max = 30,
  extra,
}: {
  name: (string | number)[] | string;
  label?: string;
  placeholder?: string;
  addLabel?: string;
  max?: number;
  extra?: string;
}) {
  return (
    <Form.Item label={label} extra={extra}>
      <Form.List name={name}>
        {(fields, { add, remove, move }) => (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.key} className="flex gap-2">
                <Form.Item name={field.name} noStyle rules={[{ required: true, whitespace: true, message: "Required" }]}>
                  <Input placeholder={placeholder} />
                </Form.Item>
                <RowActions index={index} count={fields.length} move={move} remove={remove} />
              </div>
            ))}
            <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add("")} disabled={fields.length >= max}>
              {addLabel}
            </Button>
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
}

/* ------------------------------------------------------------------ */
/* Feature / step items: { title, description, icon }                   */
/* ------------------------------------------------------------------ */
export function IconSelect(props: { value?: string; onChange?: (value?: string) => void }) {
  return (
    <Select
      allowClear
      showSearch
      placeholder="Icon"
      value={props.value || undefined}
      onChange={props.onChange}
      options={ICON_KEYS.map((key) => ({
        value: key,
        label: (
          <span className="flex items-center gap-2">
            <Icon name={key} className="size-4" /> {key}
          </span>
        ),
      }))}
      className="min-w-[150px]"
    />
  );
}

export function FeatureListField({
  name,
  label,
  addLabel = "Add item",
  withIcon = false,
  max = 24,
  extra,
}: {
  name: (string | number)[] | string;
  label?: string;
  addLabel?: string;
  withIcon?: boolean;
  max?: number;
  extra?: string;
}) {
  return (
    <Form.Item label={label} extra={extra}>
      <Form.List name={name}>
        {(fields, { add, remove, move }) => (
          <div className="space-y-3">
            {fields.map((field: FormListFieldData, index) => (
              <div key={field.key} className="rounded-xl bg-paper-50 p-3 ring-1 ring-paper-300/70">
                <div className="flex flex-wrap items-start gap-2">
                  <Form.Item name={[field.name, "title"]} noStyle rules={[{ required: true, whitespace: true, message: "Title is required" }]}>
                    <Input placeholder="Title" className="min-w-[200px] flex-1" />
                  </Form.Item>
                  {withIcon && (
                    <Form.Item name={[field.name, "icon"]} noStyle>
                      <IconSelect />
                    </Form.Item>
                  )}
                  <RowActions index={index} count={fields.length} move={move} remove={remove} />
                </div>
                <Form.Item name={[field.name, "description"]} noStyle>
                  <Input.TextArea placeholder="Description (optional)" autoSize={{ minRows: 1, maxRows: 4 }} className="!mt-2" />
                </Form.Item>
              </div>
            ))}
            <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add({ title: "", description: "" })} disabled={fields.length >= max}>
              {addLabel}
            </Button>
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
}

export function FaqListField({ name = "faqs", label = "FAQs" }: { name?: string | (string | number)[]; label?: string }) {
  return (
    <Form.Item label={label}>
      <Form.List name={name}>
        {(fields, { add, remove, move }) => (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.key} className="rounded-xl bg-paper-50 p-3 ring-1 ring-paper-300/70">
                <div className="flex gap-2">
                  <Form.Item name={[field.name, "question"]} noStyle rules={[{ required: true, min: 3, message: "Question is required" }]}>
                    <Input placeholder="Question" />
                  </Form.Item>
                  <RowActions index={index} count={fields.length} move={move} remove={remove} />
                </div>
                <Form.Item name={[field.name, "answer"]} noStyle rules={[{ required: true, message: "Answer is required" }]}>
                  <Input.TextArea placeholder="Answer" autoSize={{ minRows: 2, maxRows: 6 }} className="!mt-2" />
                </Form.Item>
              </div>
            ))}
            <Button type="dashed" icon={<LuPlus aria-hidden />} onClick={() => add({ question: "", answer: "" })}>
              Add question
            </Button>
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
}

/* ------------------------------------------------------------------ */
/* SEO fields with counters and a search result preview                */
/* ------------------------------------------------------------------ */
export function SeoFields({ path, fallbackTitle, fallbackDescription }: { path: string; fallbackTitle?: string; fallbackDescription?: string }) {
  const form = Form.useFormInstance();
  const title = Form.useWatch(["seo", "title"], form) as string | undefined;
  const description = Form.useWatch(["seo", "description"], form) as string | undefined;
  const site = typeof window !== "undefined" ? window.location.host : "your-domain.com";
  return (
    <>
      <div className="mb-6 rounded-xl bg-paper-50 p-4 ring-1 ring-paper-300/70">
        <p className="mb-1 text-xs text-stone-500">Search result preview</p>
        <p className="truncate text-xs text-stone-600">
          {site}
          {path}
        </p>
        <p className="truncate text-lg text-[#1a0dab]">{title || fallbackTitle || "Page title"} — SH Digital Studio</p>
        <p className="line-clamp-2 text-sm text-stone-700">{description || fallbackDescription || "Page description"}</p>
      </div>
      <Form.Item name={["seo", "title"]} label="SEO title" extra="Shown in search results and browser tabs. Leave empty to use the page title." rules={[{ max: 70 }]}>
        <Input showCount maxLength={70} />
      </Form.Item>
      <Form.Item name={["seo", "description"]} label="Meta description" extra="Aim for 120–160 characters." rules={[{ max: 200 }]}>
        <Input.TextArea showCount maxLength={200} autoSize={{ minRows: 2, maxRows: 4 }} />
      </Form.Item>
      <Form.Item
        name={["seo", "ogImage"]}
        label="Social sharing image URL"
        extra="Optional. 1200×630 works best. Leave empty to use the automatically generated branded card."
      >
        <Input placeholder="https://… or /media/…" />
      </Form.Item>
      <Form.Item name={["seo", "canonicalUrl"]} label="Canonical URL override" extra="Only if this content's original lives at another URL.">
        <Input placeholder="https://" />
      </Form.Item>
      <Form.Item name={["seo", "noIndex"]} label="Hide from search engines" valuePropName="checked">
        <Switch />
      </Form.Item>
    </>
  );
}

export function CtaFields({ name = "cta", hint }: { name?: string; hint?: string }) {
  return (
    <>
      {hint && <p className="mb-4 text-sm text-stone-600">{hint}</p>}
      <Form.Item name={[name, "heading"]} label="Heading">
        <Input />
      </Form.Item>
      <Form.Item name={[name, "text"]} label="Text">
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
      </Form.Item>
      <div className="grid gap-4 sm:grid-cols-2">
        <Form.Item name={[name, "buttonLabel"]} label="Button label">
          <Input />
        </Form.Item>
        <Form.Item name={[name, "buttonHref"]} label="Button link" extra="e.g. /contact or https://…">
          <Input />
        </Form.Item>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Ordered multi-select for relations (featured projects, services…)   */
/* ------------------------------------------------------------------ */
export function OrderedSelect({
  value = [],
  onChange,
  options,
  placeholder,
  max,
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
  options: IOption[];
  placeholder?: string;
  max?: number;
}) {
  const label = (option?: IOption) => option?.title || option?.name || option?.slug || "Unknown";
  const byId = new Map(options.map((option) => [option._id, option]));
  const list = (value || []).filter((id) => byId.has(id));
  const move = (index: number, delta: number) => {
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange?.(next);
  };
  return (
    <div className="space-y-2">
      <Select
        mode="multiple"
        value={list}
        onChange={(next) => onChange?.(max ? next.slice(0, max) : next)}
        placeholder={placeholder}
        optionFilterProp="label"
        options={options.map((option) => {
          const status = option.publishStatus || option.status;
          return {
            value: option._id,
            label: `${label(option)}${status && status !== "published" ? ` (${status})` : ""}`,
          };
        })}
      />
      {list.length > 1 && (
        <ol className="space-y-1">
          {list.map((id, index) => (
            <li key={id} className="flex items-center justify-between gap-2 rounded-lg bg-paper-50 px-3 py-1.5 text-sm ring-1 ring-paper-300/60">
              <span className="truncate">
                <span className="mr-2 font-mono text-xs text-stone-500">{index + 1}</span>
                {label(byId.get(id))}
              </span>
              <Space.Compact>
                <Button size="small" aria-label="Move up" icon={<LuArrowUp aria-hidden />} disabled={index === 0} onClick={() => move(index, -1)} />
                <Button size="small" aria-label="Move down" icon={<LuArrowDown aria-hidden />} disabled={index === list.length - 1} onClick={() => move(index, 1)} />
              </Space.Compact>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slug input with "generate from title"                                */
/* ------------------------------------------------------------------ */
export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function SlugInput({
  value,
  onChange,
  prefix,
  source,
}: {
  value?: string;
  onChange?: (value: string) => void;
  prefix: string;
  source?: string;
}) {
  return (
    <Space.Compact className="w-full">
      <Space.Addon>{prefix}</Space.Addon>
      <Input
        value={value}
        onChange={(event) => onChange?.(slugify(event.target.value) + (event.target.value.endsWith("-") ? "-" : ""))}
        placeholder="auto-generated-from-title"
      />
      <Button onClick={() => source && onChange?.(slugify(source))} disabled={!source}>
        From title
      </Button>
    </Space.Compact>
  );
}
