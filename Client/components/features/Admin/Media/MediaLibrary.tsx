"use client";

import { App, Button, Drawer, Empty, Form, Input, Pagination, Segmented, Select, Space, Tag } from "antd";
import { useEffect, useState } from "react";
import { LuCopy, LuPlus, LuSave, LuSearch, LuTrash2 } from "react-icons/lu";
import AdminApis from "@/features/Admin/apis/admin.api";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IMediaAsset } from "@/features/Admin/interface/admin.interface";
import { apiErrorMessage } from "@/lib/api";
import { errorToast, successToast } from "@/utils/toast";
import MediaPickerModal from "../fields/MediaPickerModal";
import { formatBytes } from "../fields/mediaUtils";
import PageHeader from "../PageHeader";
import { MediaGridSkeleton } from "../Skeletons";

function MediaDetails({ asset, onClose }: { asset: IMediaAsset | null; onClose: () => void }) {
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const update = AdminHooks.useUpdateMedia();
  const remove = AdminHooks.useDeleteMedia();

  useEffect(() => {
    if (asset) form.setFieldsValue(asset);
  }, [asset, form]);
  if (!asset) return null;

  const copyUrl = async () => {
    const url = asset.url.startsWith("/") ? `${window.location.origin}${asset.url}` : asset.url;
    await navigator.clipboard.writeText(url);
    successToast("URL copied");
  };

  // Media is embedded in content, so check where it is used before deleting
  const handleDelete = async () => {
    try {
      const usage = await AdminApis.MediaApis.usage(asset._id);
      modal.confirm({
        title: "Delete this media item?",
        okText: usage.count ? "Delete anyway" : "Delete",
        okButtonProps: { danger: true },
        content: usage.count ? (
          <div className="text-sm">
            <p>It is still used in {usage.count} place(s):</p>
            <ul className="mt-2 list-disc pl-5">
              {usage.usedIn.slice(0, 8).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-2">Those pages will show a placeholder until you choose another image.</p>
          </div>
        ) : (
          "It is not used anywhere on the site."
        ),
        onOk: async () => {
          await remove.mutateAsync({ id: asset._id, force: usage.count > 0 });
          onClose();
        },
      });
    } catch (error) {
      errorToast(apiErrorMessage(error));
    }
  };

  return (
    <Drawer open={!!asset} onClose={onClose} size={520} title="Media details" destroyOnHidden>
      <div className="mb-5 overflow-hidden rounded-xl bg-paper-200 ring-1 ring-paper-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.posterUrl || asset.url} alt={asset.alt || ""} className="max-h-80 w-full object-contain" />
      </div>
      <div className="mb-5 flex flex-wrap gap-2 text-xs">
        <Tag>{asset.kind}</Tag>
        <Tag>{asset.provider}</Tag>
        {asset.width && asset.height && <Tag>{asset.width} × {asset.height}</Tag>}
        {asset.sizeBytes ? <Tag>{formatBytes(asset.sizeBytes)}</Tag> : null}
      </div>
      <Space.Compact className="mb-5! w-full">
        <Input value={asset.url} readOnly aria-label="File URL" />
        <Button icon={<LuCopy aria-hidden />} onClick={copyUrl} aria-label="Copy URL" />
      </Space.Compact>
      <Form form={form} layout="vertical" onFinish={(values) => update.mutate({ id: asset._id, payload: values })}>
        <Form.Item name="title" label="Title">
          <Input />
        </Form.Item>
        <Form.Item name="alt" label="Alt text" extra="Describe what the image shows.">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
        <Form.Item name="caption" label="Caption">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
        </Form.Item>
        <Form.Item name="tags" label="Tags">
          <Select mode="tags" tokenSeparators={[","]} />
        </Form.Item>
        <div className="flex justify-between">
          <Button type="primary" htmlType="submit" loading={update.isLoading} icon={<LuSave aria-hidden />}>
            Save
          </Button>
          <Button danger icon={<LuTrash2 aria-hidden />} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}

export default function MediaLibrary() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const [selected, setSelected] = useState<IMediaAsset | null>(null);
  const [adding, setAdding] = useState(false);
  const config = AdminHooks.useMediaConfig();
  const media = AdminHooks.useMedia({ page, limit: 24, searchTerm: search || undefined, kind: kind === "all" ? undefined : kind });
  const items = media.data?.result || [];

  return (
    <>
      <PageHeader
        title="Media library"
        description={
          config.data?.uploadsEnabled
            ? "Images and videos used across the site. Upload files or add them by URL."
            : "Images and videos used across the site. Uploads are not configured — add media by URL (see Server/README.md to enable S3 uploads)."
        }
        actions={
          <Button type="primary" icon={<LuPlus aria-hidden />} onClick={() => setAdding(true)}>
            Add media
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          allowClear
          prefix={<LuSearch aria-hidden />}
          placeholder="Search title, alt text or URL"
          className="!w-full sm:!w-80"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Segmented
          value={kind}
          onChange={(value) => {
            setKind(value as typeof kind);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "image", label: "Images" },
            { value: "video", label: "Videos" },
          ]}
        />
      </div>

      {/* Until this page/search has data; cached results refresh silently */}
      {media.isLoading || media.isPreviousData ? (
        <MediaGridSkeleton />
      ) : items.length ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {items.map((asset) => (
            <li key={asset._id}>
              <button
                type="button"
                onClick={() => setSelected(asset)}
                className="group block w-full overflow-hidden rounded-xl bg-paper-50 text-left ring-1 ring-paper-300/70 transition-shadow hover:shadow-md"
              >
                <span className="block aspect-[4/3] overflow-hidden bg-paper-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.posterUrl || asset.url} alt={asset.alt || ""} loading="lazy" className="h-full w-full object-cover object-top" />
                </span>
                <span className="block px-3 py-2">
                  <span className="block truncate text-sm font-medium">{asset.title || asset.alt || asset.url.split("/").pop()}</span>
                  <span className="block text-xs text-stone-500">
                    {asset.kind} · {asset.provider}
                    {!asset.alt && asset.kind === "image" && <span className="ml-1 text-warning">· no alt text</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty description="No media found" />
      )}

      {(media.data?.meta.totalPage || 1) > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination current={page} pageSize={24} total={media.data?.meta.total} onChange={setPage} showSizeChanger={false} />
        </div>
      )}

      <MediaDetails asset={selected} onClose={() => setSelected(null)} />
      <MediaPickerModal open={adding} onClose={() => setAdding(false)} onSelect={() => setAdding(false)} />
    </>
  );
}
