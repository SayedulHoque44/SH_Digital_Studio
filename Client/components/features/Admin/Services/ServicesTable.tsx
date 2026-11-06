"use client";

import { Button, Popconfirm, Space, Switch, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useState } from "react";
import { LuArrowUpDown, LuExternalLink, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import Icon from "@/components/shared/Icon";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IAdminService } from "@/features/Admin/interface/admin.interface";
import PageHeader from "../PageHeader";
import ReorderModal from "../ReorderModal";

export default function ServicesTable() {
  const [reorderOpen, setReorderOpen] = useState(false);
  const services = AdminHooks.useServices({ limit: 100 });
  const update = AdminHooks.useUpdateService();
  const remove = AdminHooks.useDeleteService();
  const reorder = AdminHooks.useReorderServices();
  const rows = services.data?.result || [];

  const columns: ColumnsType<IAdminService> = [
    {
      title: "Service",
      key: "title",
      render: (_, service) => (
        <Link href={`/admin/services/${service._id}`} className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-paper-200">
            <Icon name={service.icon} className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-ink-950">{service.title}</span>
            <span className="block truncate text-xs text-stone-600">{service.shortDescription}</span>
          </span>
        </Link>
      ),
    },
    {
      title: "Price / timeline",
      key: "price",
      responsive: ["lg"],
      render: (_, service) => (
        <span className="text-sm text-stone-600">{[service.startingPrice, service.timeline].filter(Boolean).join(" · ") || "Not shown"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: string, service) => (
        <Switch
          size="small"
          checked={value === "published"}
          checkedChildren="Published"
          unCheckedChildren="Draft"
          onChange={(checked) => update.mutate({ id: service._id, payload: { status: checked ? "published" : "draft" } })}
        />
      ),
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      align: "right",
      render: (_, service) => (
        <Space>
          {service.status === "published" && (
            <Tooltip title="View page">
              <Button size="small" icon={<LuExternalLink aria-hidden />} aria-label={`View ${service.title}`} href={`/services/${service.slug}`} target="_blank" />
            </Tooltip>
          )}
          <Link href={`/admin/services/${service._id}`}>
            <Button size="small" icon={<LuPencil aria-hidden />} aria-label={`Edit ${service.title}`} />
          </Link>
          <Popconfirm title="Delete this service?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => remove.mutate(service._id)}>
            <Button size="small" danger icon={<LuTrash2 aria-hidden />} aria-label={`Delete ${service.title}`} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Services"
        description="Your service catalogue. Published services appear on /services and can be featured on the homepage."
        actions={
          <>
            <Button icon={<LuArrowUpDown aria-hidden />} onClick={() => setReorderOpen(true)}>
              Reorder
            </Button>
            <Link href="/admin/services/new">
              <Button type="primary" icon={<LuPlus aria-hidden />}>
                New service
              </Button>
            </Link>
          </>
        }
      />
      <Table rowKey="_id" columns={columns} dataSource={rows} loading={services.isFetching} pagination={false} scroll={{ x: 600 }} />
      <ReorderModal
        open={reorderOpen}
        title="Service order"
        items={rows.map((row) => ({ id: row._id, label: row.title, meta: row.status }))}
        onClose={() => setReorderOpen(false)}
        saving={reorder.isLoading}
        onSave={async (ids) => {
          await reorder.mutateAsync(ids);
          setReorderOpen(false);
        }}
      />
    </>
  );
}
