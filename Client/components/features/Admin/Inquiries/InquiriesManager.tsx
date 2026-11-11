"use client";

import { Button, DatePicker, Descriptions, Drawer, Input, Popconfirm, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LuMail, LuMessageCircle, LuPhone, LuSave, LuSearch, LuTrash2 } from "react-icons/lu";
import InquiryHooks from "@/features/Inquiry/hooks/inquiry.hooks";
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  PREFERRED_CONTACT_LABELS,
  type IInquiry,
  type IInquiryQuery,
  type TInquiryStatus,
} from "@/features/Inquiry/interface/inquiry.interface";
import { cn } from "@/lib/utils";
import { successToast } from "@/utils/toast";
import PageHeader from "../PageHeader";
import { SkeletonCell, skeletonColumns, skeletonRows } from "../Skeletons";

const STATUS_COLOR: Record<TInquiryStatus, string> = {
  new: "green",
  contacted: "blue",
  qualified: "geekblue",
  "proposal-sent": "purple",
  won: "gold",
  lost: "default",
  archived: "default",
};

const whatsappLink = (phone?: string, name?: string) => {
  const digits = (phone || "").replace(/[^\d]/g, "");
  return digits.length >= 7 ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hi ${name || ""}, thanks for your inquiry!`)}` : null;
};

function InquiryDrawer({ inquiry, onClose }: { inquiry: IInquiry | null; onClose: () => void }) {
  // The drawer is keyed by inquiry id, so notes start fresh for each inquiry
  const [notes, setNotes] = useState(inquiry?.adminNotes || "");
  const update = InquiryHooks.useUpdateInquiry();
  const remove = InquiryHooks.useDeleteInquiry();

  if (!inquiry) return null;

  const subject = `Re: your ${inquiry.projectTitle ? `inquiry about ${inquiry.projectTitle}` : "project inquiry"}`;
  const whatsapp = whatsappLink(inquiry.phone, inquiry.name);

  return (
    <Drawer open={!!inquiry} onClose={onClose} size={640} title={inquiry.name} destroyOnHidden>
      <div className="mb-5 flex flex-wrap gap-2">
        <Button type="primary" icon={<LuMail aria-hidden />} href={`mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}`}>
          Reply by email
        </Button>
        {whatsapp && (
          <Button icon={<LuMessageCircle aria-hidden />} href={whatsapp} target="_blank">
            WhatsApp
          </Button>
        )}
        {inquiry.phone && (
          <Button icon={<LuPhone aria-hidden />} href={`tel:${inquiry.phone.replace(/\s/g, "")}`}>
            Call
          </Button>
        )}
      </div>

      <div className="mb-5 flex items-center gap-3">
        <span className="text-sm text-stone-600">Status</span>
        <Select
          value={inquiry.status}
          className="min-w-[180px]"
          onChange={(status) => update.mutate({ id: inquiry._id, data: { status } }, { onSuccess: () => successToast("Status updated") })}
          options={INQUIRY_STATUSES.map((value) => ({ value, label: INQUIRY_STATUS_LABELS[value] }))}
        />
      </div>

      <Descriptions column={1} size="small" bordered styles={{ label: { width: 170 } }}>
        <Descriptions.Item label="Email">{inquiry.email}</Descriptions.Item>
        {inquiry.phone && <Descriptions.Item label="Phone">{inquiry.phone}</Descriptions.Item>}
        {inquiry.businessName && <Descriptions.Item label="Business">{inquiry.businessName}</Descriptions.Item>}
        {inquiry.country && <Descriptions.Item label="Country">{inquiry.country}</Descriptions.Item>}
        {inquiry.website && (
          <Descriptions.Item label="Website">
            <a href={inquiry.website} target="_blank" rel="noopener noreferrer">
              {inquiry.website}
            </a>
          </Descriptions.Item>
        )}
        {inquiry.industry && <Descriptions.Item label="Industry">{inquiry.industry}</Descriptions.Item>}
        {inquiry.service && <Descriptions.Item label="Service">{inquiry.service}</Descriptions.Item>}
        {inquiry.projectTitle && <Descriptions.Item label="Interested in">{inquiry.projectTitle}</Descriptions.Item>}
        {inquiry.budgetRange && <Descriptions.Item label="Budget">{inquiry.budgetRange}</Descriptions.Item>}
        {inquiry.desiredLaunch && <Descriptions.Item label="Desired launch">{inquiry.desiredLaunch}</Descriptions.Item>}
        <Descriptions.Item label="Preferred contact">{PREFERRED_CONTACT_LABELS[inquiry.preferredContact]}</Descriptions.Item>
        <Descriptions.Item label="Received">{new Date(inquiry.createdAt).toLocaleString()}</Descriptions.Item>
        {inquiry.sourcePath && <Descriptions.Item label="Sent from page">{inquiry.sourcePath}</Descriptions.Item>}
        <Descriptions.Item label="Email notification">
          {inquiry.notification?.sent ? <Tag color="green">Sent</Tag> : <Tag>{inquiry.notification?.attempted ? "Failed" : "Not sent"}</Tag>}
        </Descriptions.Item>
      </Descriptions>

      <h3 className="mb-2 mt-6 font-medium">Project description</h3>
      <p className="whitespace-pre-line rounded-xl bg-paper-100 p-4 text-[0.95rem] leading-relaxed">{inquiry.message}</p>

      <h3 className="mb-2 mt-6 font-medium">Internal notes</h3>
      <Input.TextArea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        autoSize={{ minRows: 4, maxRows: 12 }}
        placeholder="Private notes — never shown publicly."
      />
      <div className="mt-3 flex justify-between">
        <Button
          icon={<LuSave aria-hidden />}
          loading={update.isLoading}
          onClick={() => update.mutate({ id: inquiry._id, data: { adminNotes: notes } }, { onSuccess: () => successToast("Notes saved") })}
        >
          Save notes
        </Button>
        <Popconfirm
          title="Delete this inquiry permanently?"
          description="Use this for spam or when someone asks for their data to be removed."
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            await remove.mutateAsync(inquiry._id);
            successToast("Inquiry deleted");
            onClose();
          }}
        >
          <Button danger icon={<LuTrash2 aria-hidden />}>
            Delete
          </Button>
        </Popconfirm>
      </div>
    </Drawer>
  );
}

export default function InquiriesManager() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<IInquiryQuery>({ page: 1, limit: 20, sort: "newest" });
  const [openId, setOpenId] = useState<string | null>(searchParams.get("open"));
  const inquiries = InquiryHooks.useGetInquiries(query);
  const data = inquiries.data?.data;
  // Skeleton rows until this page/filter has data; cached data refreshes silently
  const skeleton = inquiries.isLoading || inquiries.isPreviousData;

  const open = useMemo(() => data?.result.find((item) => item._id === openId) || null, [data, openId]);
  const setFilter = (patch: Partial<IInquiryQuery>) => setQuery((current) => ({ ...current, ...patch, page: 1 }));

  const columns: ColumnsType<IInquiry> = [
    {
      title: "Contact",
      key: "contact",
      render: (_, inquiry) => (
        <button type="button" className="text-left" onClick={() => setOpenId(inquiry._id)}>
          <span className="block font-medium text-ink-950">
            {inquiry.name}
            {inquiry.businessName ? <span className="font-normal text-stone-600"> · {inquiry.businessName}</span> : null}
          </span>
          <span className="block text-xs text-stone-600">{inquiry.email}</span>
        </button>
      ),
    },
    {
      title: "Interest",
      key: "interest",
      responsive: ["md"],
      render: (_, inquiry) => (
        <span className="text-sm">
          {inquiry.industry || "—"}
          <span className="block text-xs text-stone-500">{inquiry.projectTitle || inquiry.service || ""}</span>
        </span>
      ),
    },
    { title: "Budget", dataIndex: "budgetRange", responsive: ["lg"], render: (value?: string) => value || "—" },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: TInquiryStatus) => <Tag color={STATUS_COLOR[value]}>{INQUIRY_STATUS_LABELS[value]}</Tag>,
    },
    {
      title: "Received",
      dataIndex: "createdAt",
      render: (value: string) => <span className="text-xs text-stone-600">{new Date(value).toLocaleDateString()}</span>,
    },
  ];

  return (
    <>
      <PageHeader title="Inquiries" description="Project inquiries from the website. Contact details and notes are private." />

      <div className="mb-4 flex flex-wrap gap-2">
        {[undefined, ...INQUIRY_STATUSES].map((status) => {
          const active = query.status === status;
          const count = status ? data?.statusCounts?.[status] || 0 : Object.values(data?.statusCounts || {}).reduce((sum, value) => sum + (value || 0), 0);
          return (
            <button
              key={status || "all"}
              type="button"
              onClick={() => setFilter({ status })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm ring-1 transition-colors",
                active ? "bg-ink-950 text-paper-50 ring-ink-950" : "bg-paper-50 ring-paper-300 hover:ring-ink-900/40",
              )}
            >
              {status ? INQUIRY_STATUS_LABELS[status] : "All"} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <Space wrap className="mb-4">
        <Input
          allowClear
          prefix={<LuSearch aria-hidden />}
          placeholder="Search name, email, message"
          className="!w-72"
          onChange={(event) => setFilter({ searchTerm: event.target.value || undefined })}
        />
        <Input allowClear placeholder="Industry" className="!w-48" onChange={(event) => setFilter({ industry: event.target.value || undefined })} />
        <DatePicker.RangePicker
          onChange={(dates) =>
            setFilter({
              gte: dates?.[0] ? dates[0].format("YYYY-MM-DD") : undefined,
              lte: dates?.[1] ? dates[1].format("YYYY-MM-DD") : undefined,
            })
          }
        />
        <Select
          value={query.sort}
          onChange={(sort) => setFilter({ sort })}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "status", label: "By status" },
          ]}
        />
      </Space>

      <Table
        rowKey="_id"
        columns={
          skeleton
            ? skeletonColumns(columns, {
                contact: SkeletonCell.lines("60%", "75%"),
                interest: SkeletonCell.lines("50%", "65%"),
                budgetRange: SkeletonCell.line("5rem"),
                status: SkeletonCell.tag(),
                createdAt: SkeletonCell.line("4.5rem"),
              })
            : columns
        }
        dataSource={skeleton ? skeletonRows<IInquiry>(8) : data?.result || []}
        loading={!skeleton && inquiries.isFetching && inquiries.isFetchedAfterMount}
        onRow={skeleton ? undefined : (record) => ({ onClick: () => setOpenId(record._id), className: "cursor-pointer" })}
        locale={{ emptyText: "No inquiries yet — they will appear here when visitors use the contact form." }}
        scroll={{ x: 640 }}
        pagination={{
          current: query.page,
          pageSize: query.limit,
          total: data?.meta.total,
          onChange: (page, limit) => setQuery((current) => ({ ...current, page, limit })),
        }}
      />

      <InquiryDrawer key={open?._id} inquiry={open} onClose={() => setOpenId(null)} />
    </>
  );
}
