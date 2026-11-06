"use client";

import { Alert, Button, Collapse, Dropdown, Empty, Form, Input, Popconfirm, Select, Space, Switch, Tooltip } from "antd";
import type { FormListFieldData } from "antd";
import { LuArrowDown, LuArrowUp, LuPlus, LuTrash2 } from "react-icons/lu";
import { FeatureListField, MarkdownField } from "./FormFields";
import { MediaField, MediaListField } from "./MediaField";
import ConfirmDelete from "./ConfirmDelete";

/*
 * Ordered content blocks for project and category pages. Each block has a
 * type and a `data` object; the API validates every type's data and the
 * public site renders it with components/features/Blocks/BlockRenderer.
 */

export const BLOCK_LABELS: Record<string, string> = {
  richText: "Rich text",
  heading: "Heading & paragraph",
  image: "Image",
  gallery: "Image gallery",
  video: "Video",
  imageText: "Image beside text",
  featureGrid: "Feature grid",
  techList: "Technology list",
  stats: "Statistics (verified only)",
  comparison: "Comparison table",
  quote: "Quote (approved only)",
  callout: "Callout",
  embed: "Embedded demo",
  beforeAfter: "Before & after",
  timeline: "Timeline",
  cta: "Call to action",
};

const DEFAULTS: Record<string, Record<string, unknown>> = {
  richText: { markdown: "" },
  heading: { heading: "", text: "" },
  image: { image: null, layout: "contained" },
  gallery: { images: [], columns: 3 },
  video: { video: { url: "" } },
  imageText: { image: null, markdown: "", imagePosition: "left" },
  featureGrid: { items: [{ title: "" }], columns: 3 },
  techList: { items: [] },
  stats: { items: [{ value: "", label: "", source: "" }] },
  comparison: { leftTitle: "Before", rightTitle: "After", rows: [{ label: "", left: "", right: "" }] },
  quote: { quote: "", author: "", approved: false },
  callout: { tone: "note", markdown: "" },
  embed: { title: "", url: "", aspectRatio: "16:9" },
  beforeAfter: { before: null, after: null, beforeLabel: "Before", afterLabel: "After" },
  timeline: { items: [{ title: "", date: "", description: "" }] },
  cta: { heading: "", buttonLabel: "Start a project", buttonHref: "/contact" },
};

const required = (message = "Required") => [{ required: true, message }];
const mediaRequired = [{ validator: (_: unknown, value: { url?: string } | null) => (value?.url ? Promise.resolve() : Promise.reject(new Error("Choose an image"))) }];

function SubList({
  name,
  fields: columns,
  addLabel,
  empty,
}: {
  name: (string | number)[];
  fields: { key: string; placeholder: string; required?: boolean; wide?: boolean }[];
  addLabel: string;
  empty: Record<string, string>;
}) {
  return (
    <Form.List name={name}>
      {(items, { add, remove }) => (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.key} className="flex flex-wrap gap-2">
              {columns.map((column) => (
                <Form.Item
                  key={column.key}
                  name={[item.name, column.key]}
                  noStyle
                  rules={column.required ? required() : undefined}
                >
                  <Input placeholder={column.placeholder} className={column.wide ? "min-w-[240px] flex-[2]" : "min-w-[140px] flex-1"} />
                </Form.Item>
              ))}
              <ConfirmDelete title="Remove this row?" onConfirm={() => remove(item.name)}><Button danger aria-label="Remove row" icon={<LuTrash2 aria-hidden />} /></ConfirmDelete>
            </div>
          ))}
          <Button type="dashed" size="small" icon={<LuPlus aria-hidden />} onClick={() => add(empty)}>
            {addLabel}
          </Button>
        </div>
      )}
    </Form.List>
  );
}

function BlockFields({ field, type }: { field: FormListFieldData; type: string }) {
  const d = (...path: (string | number)[]) => [field.name, "data", ...path];
  switch (type) {
    case "richText":
      return (
        <Form.Item name={d("markdown")} rules={required("Add some text")}>
          <MarkdownField rows={10} />
        </Form.Item>
      );
    case "heading":
      return (
        <>
          <Form.Item name={d("eyebrow")} label="Eyebrow (small label)">
            <Input />
          </Form.Item>
          <Form.Item name={d("heading")} label="Heading" rules={required()}>
            <Input />
          </Form.Item>
          <Form.Item name={d("text")} label="Paragraph">
            <MarkdownField rows={4} />
          </Form.Item>
        </>
      );
    case "image":
      return (
        <>
          <Form.Item name={d("image")} rules={mediaRequired}>
            <MediaField showCaption />
          </Form.Item>
          <Form.Item name={d("layout")} label="Width">
            <Select options={[{ value: "contained", label: "Contained" }, { value: "wide", label: "Wide" }, { value: "full", label: "Full" }]} />
          </Form.Item>
        </>
      );
    case "gallery":
      return (
        <>
          <Form.Item name={d("heading")} label="Heading">
            <Input />
          </Form.Item>
          <Form.Item name={d("images")} rules={[{ validator: (_, value) => (value?.length ? Promise.resolve() : Promise.reject(new Error("Add at least one image"))) }]}>
            <MediaListField max={24} />
          </Form.Item>
          <Form.Item name={d("columns")} label="Columns">
            <Select options={[2, 3, 4].map((value) => ({ value, label: `${value} columns` }))} />
          </Form.Item>
        </>
      );
    case "video":
      return (
        <>
          <Form.Item name={d("heading")} label="Heading">
            <Input />
          </Form.Item>
          <Form.Item name={d("video", "url")} label="Video URL" extra="YouTube, Vimeo or a direct .mp4/.webm link" rules={required()}>
            <Input placeholder="https://" />
          </Form.Item>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item name={d("video", "title")} label="Title">
              <Input />
            </Form.Item>
            <Form.Item name={d("video", "posterUrl")} label="Poster image URL">
              <Input placeholder="https://" />
            </Form.Item>
          </div>
          <Form.Item name={d("video", "captionsUrl")} label="Captions file (.vtt) URL">
            <Input placeholder="https://" />
          </Form.Item>
          <Form.Item name={d("video", "transcript")} label="Transcript">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 8 }} />
          </Form.Item>
        </>
      );
    case "imageText":
      return (
        <>
          <Form.Item name={d("image")} rules={mediaRequired}>
            <MediaField />
          </Form.Item>
          <Form.Item name={d("heading")} label="Heading">
            <Input />
          </Form.Item>
          <Form.Item name={d("markdown")} label="Text" rules={required()}>
            <MarkdownField rows={6} />
          </Form.Item>
          <Form.Item name={d("imagePosition")} label="Image position">
            <Select options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
          </Form.Item>
        </>
      );
    case "featureGrid":
      return (
        <>
          <Form.Item name={d("heading")} label="Heading">
            <Input />
          </Form.Item>
          <Form.Item name={d("intro")} label="Intro">
            <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
          </Form.Item>
          <FeatureListField name={d("items") as (string | number)[]} withIcon addLabel="Add feature" />
          <Form.Item name={d("columns")} label="Columns">
            <Select options={[2, 3, 4].map((value) => ({ value, label: `${value} columns` }))} />
          </Form.Item>
        </>
      );
    case "techList":
      return (
        <>
          <Form.Item name={d("heading")} label="Heading">
            <Input />
          </Form.Item>
          <Form.Item name={d("items")} label="Technologies" rules={required("Add at least one")}>
            <Select mode="tags" tokenSeparators={[","]} placeholder="Type and press Enter" />
          </Form.Item>
        </>
      );
    case "stats":
      return (
        <>
          <Alert
            className="!mb-4"
            type="warning"
            showIcon
            title="Only add statistics you can verify, and state the source for each one. Never invent results."
          />
          <Form.Item name={d("heading")} label="Heading">
            <Input />
          </Form.Item>
          <SubList
            name={d("items")}
            addLabel="Add statistic"
            empty={{ value: "", label: "", source: "" }}
            fields={[
              { key: "value", placeholder: "Value (e.g. 2.1s)", required: true },
              { key: "label", placeholder: "Label", required: true },
              { key: "source", placeholder: "Source (required)", required: true, wide: true },
            ]}
          />
        </>
      );
    case "comparison":
      return (
        <>
          <Form.Item name={d("heading")} label="Heading">
            <Input />
          </Form.Item>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item name={d("leftTitle")} label="Left column title" rules={required()}>
              <Input />
            </Form.Item>
            <Form.Item name={d("rightTitle")} label="Right column title" rules={required()}>
              <Input />
            </Form.Item>
          </div>
          <SubList
            name={d("rows")}
            addLabel="Add row"
            empty={{ label: "", left: "", right: "" }}
            fields={[
              { key: "label", placeholder: "Aspect", required: true },
              { key: "left", placeholder: "Left" },
              { key: "right", placeholder: "Right" },
            ]}
          />
        </>
      );
    case "quote":
      return (
        <>
          <Alert className="!mb-4" type="info" showIcon title="Only publish real quotes you have permission to use. Unapproved quotes are never shown publicly." />
          <Form.Item name={d("quote")} label="Quote" rules={required()}>
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
          </Form.Item>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item name={d("author")} label="Author" rules={required()}>
              <Input />
            </Form.Item>
            <Form.Item name={d("role")} label="Role / company">
              <Input />
            </Form.Item>
          </div>
          <Form.Item name={d("approved")} label="Approved for publication" valuePropName="checked">
            <Switch />
          </Form.Item>
        </>
      );
    case "callout":
      return (
        <>
          <Form.Item name={d("tone")} label="Style">
            <Select options={["note", "info", "success", "warning"].map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item name={d("title")} label="Title">
            <Input />
          </Form.Item>
          <Form.Item name={d("markdown")} label="Text" rules={required()}>
            <MarkdownField rows={4} />
          </Form.Item>
        </>
      );
    case "embed":
      return (
        <>
          <Alert className="!mb-4" type="info" showIcon title="Embeds load only when a visitor clicks, inside a sandboxed frame. Use https URLs you trust." />
          <Form.Item name={d("title")} label="Title" rules={required()}>
            <Input />
          </Form.Item>
          <Form.Item name={d("url")} label="URL" rules={[...required(), { pattern: /^https:\/\//, message: "Must start with https://" }]}>
            <Input placeholder="https://" />
          </Form.Item>
          <Form.Item name={d("aspectRatio")} label="Aspect ratio">
            <Select options={["16:9", "4:3", "1:1", "9:16"].map((value) => ({ value, label: value }))} />
          </Form.Item>
        </>
      );
    case "beforeAfter":
      return (
        <>
          <Form.Item name={d("heading")} label="Heading">
            <Input />
          </Form.Item>
          <Form.Item name={d("before")} label="Before" rules={mediaRequired}>
            <MediaField />
          </Form.Item>
          <Form.Item name={d("after")} label="After" rules={mediaRequired}>
            <MediaField />
          </Form.Item>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item name={d("beforeLabel")} label="Before label">
              <Input />
            </Form.Item>
            <Form.Item name={d("afterLabel")} label="After label">
              <Input />
            </Form.Item>
          </div>
          <Form.Item name={d("caption")} label="Caption">
            <Input />
          </Form.Item>
        </>
      );
    case "timeline":
      return (
        <>
          <Form.Item name={d("heading")} label="Heading">
            <Input />
          </Form.Item>
          <SubList
            name={d("items")}
            addLabel="Add milestone"
            empty={{ title: "", date: "", description: "" }}
            fields={[
              { key: "title", placeholder: "Milestone", required: true },
              { key: "date", placeholder: "Date / week" },
              { key: "description", placeholder: "Description", wide: true },
            ]}
          />
        </>
      );
    case "cta":
      return (
        <>
          <Form.Item name={d("heading")} label="Heading" rules={required()}>
            <Input />
          </Form.Item>
          <Form.Item name={d("text")} label="Text">
            <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
          </Form.Item>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item name={d("buttonLabel")} label="Button label" rules={required()}>
              <Input />
            </Form.Item>
            <Form.Item name={d("buttonHref")} label="Button link" rules={required()}>
              <Input placeholder="/contact" />
            </Form.Item>
          </div>
        </>
      );
    default:
      return <Alert type="warning" title={`Unknown block type "${type}"`} />;
  }
}

export default function BlockEditor({ name = "contentBlocks" }: { name?: string }) {
  const form = Form.useFormInstance();
  const blocks = (Form.useWatch(name, form) || []) as { type: string; data?: Record<string, any> }[];

  const summary = (block?: { type: string; data?: Record<string, any> }) => {
    const data = block?.data || {};
    const text = data.heading || data.title || data.quote || data.markdown || data.video?.title || "";
    return String(text).replace(/[#*_>`-]/g, "").slice(0, 60);
  };

  return (
    <Form.List name={name}>
      {(fields, { add, remove, move }) => (
        <div className="space-y-3">
          {fields.length === 0 && (
            <Empty description="No content blocks yet. Blocks are optional — use them for richer case studies." />
          )}
          <Collapse
            accordion={false}
            items={fields.map((field, index) => {
              const block = blocks[field.name];
              return {
                key: String(field.key),
                label: (
                  <span className="flex items-center gap-3">
                    <span className="rounded-md bg-paper-200 px-2 py-0.5 font-mono text-xs">{index + 1}</span>
                    <span className="font-medium">{BLOCK_LABELS[block?.type] || block?.type}</span>
                    <span className="truncate text-sm text-stone-500">{summary(block)}</span>
                  </span>
                ),
                extra: (
                  <Space.Compact onClick={(event) => event.stopPropagation()}>
                    <Tooltip title="Move up">
                      <Button size="small" aria-label="Move block up" icon={<LuArrowUp aria-hidden />} disabled={index === 0} onClick={() => move(index, index - 1)} />
                    </Tooltip>
                    <Tooltip title="Move down">
                      <Button size="small" aria-label="Move block down" icon={<LuArrowDown aria-hidden />} disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} />
                    </Tooltip>
                    <Popconfirm title="Delete this block?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => remove(field.name)}>
                      <Button size="small" danger aria-label="Delete block" icon={<LuTrash2 aria-hidden />} />
                    </Popconfirm>
                  </Space.Compact>
                ),
                children: (
                  <>
                    <Form.Item name={[field.name, "type"]} hidden>
                      <Input />
                    </Form.Item>
                    <BlockFields field={field} type={block?.type} />
                  </>
                ),
              };
            })}
          />
          <Dropdown
            trigger={["click"]}
            menu={{
              items: Object.entries(BLOCK_LABELS).map(([type, label]) => ({ key: type, label })),
              onClick: ({ key }) => add({ type: key, data: structuredClone(DEFAULTS[key] || {}) }),
            }}
          >
            <Button type="dashed" icon={<LuPlus aria-hidden />} block>
              Add content block
            </Button>
          </Dropdown>
        </div>
      )}
    </Form.List>
  );
}
