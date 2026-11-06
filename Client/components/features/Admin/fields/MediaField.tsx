"use client";

import { Button, Input, Space, Tooltip } from "antd";
import { useState } from "react";
import { LuArrowDown, LuArrowUp, LuImagePlus, LuTrash2 } from "react-icons/lu";
import type { IMediaRef } from "@/features/Admin/interface/admin.interface";
import MediaPickerModal from "./MediaPickerModal";
import { readImageSize } from "./mediaUtils";
import ConfirmDelete from "./ConfirmDelete";

function Preview({ media, className = "h-28 w-44" }: { media?: IMediaRef | null; className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-lg bg-paper-200 ring-1 ring-paper-300`}>
      {media?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.url} alt={media.alt || ""} className="h-full w-full object-cover object-top" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-stone-500">No image</div>
      )}
    </div>
  );
}

/**
 * Single media reference for antd Form ({ url, alt, caption, width, height }).
 * Emits `null` when removed so the API clears the stored value.
 */
export function MediaField({
  value,
  onChange,
  showCaption = false,
}: {
  value?: IMediaRef | null;
  onChange?: (value: IMediaRef | null) => void;
  showCaption?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<IMediaRef>) => onChange?.({ ...(value || { url: "" }), ...patch } as IMediaRef);

  const setUrl = async (url: string) => {
    update({ url, width: undefined, height: undefined, assetId: undefined });
    const size = await readImageSize(url);
    if (size) onChange?.({ ...(value || {}), url, ...size } as IMediaRef);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Preview media={value} />
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          placeholder="https://… or /media/…"
          value={value?.url || ""}
          onChange={(event) => update({ url: event.target.value })}
          onBlur={(event) => event.target.value && setUrl(event.target.value)}
        />
        <Input placeholder="Alt text (describe the image)" value={value?.alt || ""} onChange={(event) => update({ alt: event.target.value })} />
        {showCaption && (
          <Input placeholder="Caption (optional)" value={value?.caption || ""} onChange={(event) => update({ caption: event.target.value })} />
        )}
        <Space wrap>
          <Button size="small" icon={<LuImagePlus aria-hidden />} onClick={() => setOpen(true)}>
            Choose from library
          </Button>
          {value?.url && (
            <ConfirmDelete title="Remove this image?" onConfirm={() => onChange?.(null)}>
              <Button size="small" danger icon={<LuTrash2 aria-hidden />}>
                Remove
              </Button>
            </ConfirmDelete>
          )}
          {value?.width && value?.height && (
            <span className="text-xs text-stone-500">
              {value.width} × {value.height}px
            </span>
          )}
        </Space>
      </div>
      <MediaPickerModal open={open} onClose={() => setOpen(false)} onSelect={([item]) => item && onChange?.(item)} />
    </div>
  );
}

/** Ordered list of media references (screenshots, galleries). */
export function MediaListField({
  value = [],
  onChange,
  max = 40,
}: {
  value?: IMediaRef[];
  onChange?: (value: IMediaRef[]) => void;
  max?: number;
}) {
  const [open, setOpen] = useState(false);
  const list = value || [];
  const set = (next: IMediaRef[]) => onChange?.(next);
  const move = (index: number, delta: number) => {
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    set(next);
  };

  return (
    <div>
      {list.length > 0 && (
        <ul className="mb-3 space-y-2">
          {list.map((item, index) => (
            <li key={`${item.url}-${index}`} className="flex items-center gap-3 rounded-xl bg-paper-50 p-2 ring-1 ring-paper-300/70">
              <Preview media={item} className="h-14 w-20" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate text-xs text-stone-600" title={item.url}>
                  {item.url}
                </p>
                <Input
                  size="small"
                  placeholder="Alt text"
                  value={item.alt || ""}
                  onChange={(event) => set(list.map((entry, i) => (i === index ? { ...entry, alt: event.target.value } : entry)))}
                />
              </div>
              <Space.Compact>
                <Tooltip title="Move up">
                  <Button size="small" aria-label="Move up" icon={<LuArrowUp aria-hidden />} disabled={index === 0} onClick={() => move(index, -1)} />
                </Tooltip>
                <Tooltip title="Move down">
                  <Button
                    size="small"
                    aria-label="Move down"
                    icon={<LuArrowDown aria-hidden />}
                    disabled={index === list.length - 1}
                    onClick={() => move(index, 1)}
                  />
                </Tooltip>
                <Tooltip title="Remove">
                  <ConfirmDelete title="Remove this image?" onConfirm={() => set(list.filter((_, i) => i !== index))}><Button size="small" danger aria-label="Remove" icon={<LuTrash2 aria-hidden />} /></ConfirmDelete>
                </Tooltip>
              </Space.Compact>
            </li>
          ))}
        </ul>
      )}
      <Button icon={<LuImagePlus aria-hidden />} disabled={list.length >= max} onClick={() => setOpen(true)}>
        Add images
      </Button>
      <MediaPickerModal
        open={open}
        multiple
        onClose={() => setOpen(false)}
        onSelect={(items) => set([...list, ...items].slice(0, max))}
      />
    </div>
  );
}
