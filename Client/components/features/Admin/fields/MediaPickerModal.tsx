"use client";

import { Alert, Button, Empty, Form, Input, Modal, Pagination, Spin, Tabs, Upload } from "antd";
import { useState } from "react";
import { LuCheck, LuSearch, LuUpload } from "react-icons/lu";
import AdminApis from "@/features/Admin/apis/admin.api";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IMediaAsset, IMediaRef } from "@/features/Admin/interface/admin.interface";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { errorToast, successToast } from "@/utils/toast";
import { formatBytes, readImageSize } from "./mediaUtils";

export const toMediaRef = (asset: IMediaAsset): IMediaRef => ({
  url: asset.url,
  alt: asset.alt || "",
  caption: asset.caption || undefined,
  width: asset.width,
  height: asset.height,
  assetId: asset._id,
});

/**
 * Pick media for a field: browse the library, add an image by URL, or upload
 * a file (only when S3 storage is configured on the server - otherwise the
 * upload tab explains how to enable it instead of pretending).
 */
export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  multiple = false,
  kind = "image",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: IMediaRef[]) => void;
  multiple?: boolean;
  kind?: "image" | "video";
}) {
  const [tab, setTab] = useState("library");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IMediaAsset[]>([]);
  const [urlForm] = Form.useForm();
  const [busy, setBusy] = useState(false);

  const config = AdminHooks.useMediaConfig();
  const media = AdminHooks.useMedia({ page, limit: 18, kind, searchTerm: search || undefined }, open);
  const createMedia = AdminHooks.useCreateMedia();

  const toggle = (asset: IMediaAsset) => {
    if (!multiple) {
      setSelected([asset]);
      return;
    }
    setSelected((current) =>
      current.some((item) => item._id === asset._id) ? current.filter((item) => item._id !== asset._id) : [...current, asset],
    );
  };

  const confirm = (assets = selected) => {
    if (!assets.length) return;
    onSelect(assets.map(toMediaRef));
    setSelected([]);
    onClose();
  };

  const addByUrl = async (values: { url: string; alt?: string; caption?: string }) => {
    setBusy(true);
    try {
      const size = kind === "image" ? await readImageSize(values.url) : null;
      const asset = await createMedia.mutateAsync({ ...values, kind, ...(size || {}) });
      successToast("Added to the media library");
      urlForm.resetFields();
      confirm([asset]);
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const { uploadUrl, key, publicUrl } = await AdminApis.MediaApis.uploadUrl({
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });
      // The browser uploads straight to S3 with a short-lived signed URL
      const response = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!response.ok) throw new Error("The storage service rejected the upload");
      const objectUrl = URL.createObjectURL(file);
      const size = file.type.startsWith("image/") ? await readImageSize(objectUrl) : null;
      URL.revokeObjectURL(objectUrl);
      const asset = await createMedia.mutateAsync({
        url: publicUrl,
        storageKey: key,
        mimeType: file.type,
        sizeBytes: file.size,
        title: file.name,
        alt: "",
        ...(size || {}),
      });
      successToast("Uploaded");
      confirm([asset]);
    } catch (error) {
      errorToast(apiErrorMessage(error, (error as Error)?.message || "Upload failed"));
    } finally {
      setBusy(false);
    }
    return false;
  };

  const items = media.data?.result || [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={multiple ? "Choose media" : "Choose an image"}
      width={980}
      footer={
        tab === "library"
          ? [
              <Button key="cancel" onClick={onClose}>
                Cancel
              </Button>,
              <Button key="ok" type="primary" disabled={!selected.length} onClick={() => confirm()}>
                {multiple ? `Use ${selected.length || ""} selected` : "Use image"}
              </Button>,
            ]
          : null
      }
      destroyOnHidden
    >
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: "library",
            label: "Library",
            children: (
              <div>
                <Input
                  allowClear
                  prefix={<LuSearch aria-hidden />}
                  placeholder="Search by title, alt text or URL"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="!mb-4"
                />
                {media.isLoading ? (
                  <div className="flex justify-center py-16">
                    <Spin />
                  </div>
                ) : items.length ? (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {items.map((asset) => {
                      const active = selected.some((item) => item._id === asset._id);
                      return (
                        <li key={asset._id}>
                          <button
                            type="button"
                            onClick={() => toggle(asset)}
                            onDoubleClick={() => !multiple && confirm([asset])}
                            aria-pressed={active}
                            className={cn(
                              "group relative block aspect-square w-full overflow-hidden rounded-xl bg-paper-200 ring-2 transition",
                              active ? "ring-ink-950" : "ring-transparent hover:ring-paper-400",
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset.posterUrl || asset.url}
                              alt={asset.alt || ""}
                              loading="lazy"
                              className="h-full w-full object-cover object-top"
                            />
                            {active && (
                              <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-ink-950 text-paper-50">
                                <LuCheck aria-hidden className="size-3.5" />
                              </span>
                            )}
                          </button>
                          <p className="mt-1 truncate text-xs text-stone-600" title={asset.title || asset.url}>
                            {asset.title || asset.alt || asset.url.split("/").pop()}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Empty description="No media yet — add one by URL or upload" />
                )}
                {(media.data?.meta.totalPage || 1) > 1 && (
                  <div className="mt-5 flex justify-center">
                    <Pagination
                      current={page}
                      pageSize={18}
                      total={media.data?.meta.total}
                      onChange={setPage}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "url",
            label: "Add by URL",
            children: (
              <Form form={urlForm} layout="vertical" onFinish={addByUrl} requiredMark={false}>
                <Form.Item
                  name="url"
                  label={kind === "video" ? "Video URL (YouTube, Vimeo or .mp4)" : "Image URL"}
                  rules={[
                    { required: true, message: "Enter a URL" },
                    { pattern: /^(https?:\/\/|\/(?!\/))/, message: "Use an https:// URL or a site path starting with /" },
                  ]}
                >
                  <Input placeholder="https://" />
                </Form.Item>
                <Form.Item
                  name="alt"
                  label="Alt text"
                  extra="Describe the image for people using screen readers (and for search engines)."
                >
                  <Input />
                </Form.Item>
                <Form.Item name="caption" label="Caption">
                  <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={busy}>
                  Add and use
                </Button>
              </Form>
            ),
          },
          {
            key: "upload",
            label: "Upload",
            children: config.data?.uploadsEnabled ? (
              <Spin spinning={busy}>
                <Upload.Dragger
                  accept={[...(config.data.allowedImageTypes || []), ...(kind === "video" ? config.data.allowedVideoTypes : [])].join(",")}
                  beforeUpload={(file) => {
                    const limit = file.type.startsWith("video/") ? config.data!.maxVideoBytes : config.data!.maxImageBytes;
                    if (file.size > limit) {
                      errorToast(`File is too large (max ${formatBytes(limit)})`);
                      return Upload.LIST_IGNORE;
                    }
                    void upload(file);
                    return false;
                  }}
                  showUploadList={false}
                >
                  <div className="py-8">
                    <LuUpload aria-hidden className="mx-auto size-8 text-stone-500" />
                    <p className="mt-3 font-medium">Click or drop a file to upload</p>
                    <p className="mt-1 text-xs text-stone-600">
                      JPG, PNG, WebP, AVIF or GIF up to {formatBytes(config.data.maxImageBytes)}
                      {kind === "video" ? ` · MP4/WebM up to ${formatBytes(config.data.maxVideoBytes)}` : ""}. SVG is not accepted for security reasons.
                    </p>
                  </div>
                </Upload.Dragger>
              </Spin>
            ) : (
              <Alert
                type="info"
                showIcon
                title="File uploads are not configured"
                description="Add images by URL for now. To enable uploads, set the AWS S3 variables and MEDIA_PUBLIC_BASE_URL on the server (see Server/README.md)."
              />
            ),
          },
        ]}
      />
    </Modal>
  );
}
