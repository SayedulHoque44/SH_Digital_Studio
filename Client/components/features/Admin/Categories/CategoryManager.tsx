"use client";

import { App, Button, Input, Space, Switch, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LuArrowUpDown, LuExternalLink, LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";
import AdminApis from "@/features/Admin/apis/admin.api";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IAdminCategory } from "@/features/Admin/interface/admin.interface";
import { apiErrorMessage } from "@/lib/api";
import { errorToast } from "@/utils/toast";
import PageHeader from "../PageHeader";
import { SkeletonCell, skeletonColumns, skeletonRows } from "../Skeletons";
import ReorderModal from "../ReorderModal";
import CategoryEditor from "./CategoryEditor";

export default function CategoryManager() {
  const searchParams = useSearchParams();
  const { modal } = App.useApp();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ open: boolean; id?: string }>({ open: false });
  const [reorderOpen, setReorderOpen] = useState(false);

  const categories = AdminHooks.useCategories({ limit: 100, searchTerm: search || undefined });
  // Skeleton rows until this search has data; cached data refreshes silently
  const skeleton = categories.isLoading;
  const update = AdminHooks.useUpdateCategory();
  const remove = AdminHooks.useDeleteCategory();
  const reorder = AdminHooks.useReorderCategories();

  // Deep link from the dashboard: /admin/categories?edit=<id>. Adjusted while
  // rendering (not in an effect) so the editor opens without an extra render.
  const editParam = searchParams.get("edit");
  const [handledEditParam, setHandledEditParam] = useState<string | null>(null);
  if (editParam && editParam !== handledEditParam) {
    setHandledEditParam(editParam);
    setEditing({ open: true, id: editParam });
  }

  const rows = categories.data?.result || [];

  // Explain the consequences before deleting (projects are never deleted)
  const confirmDelete = async (category: IAdminCategory) => {
    try {
      const impact = await AdminApis.CategoryApis.deleteImpact(category._id);
      modal.confirm({
        title: `Delete "${category.name}"?`,
        okText: "Delete category",
        okButtonProps: { danger: true },
        content: (
          <div className="space-y-2 text-sm">
            <p>
              {impact.projectCount
                ? `${impact.projectCount} project(s) (${impact.publishedProjectCount} published) will be removed from this category. The projects themselves are kept.`
                : "No projects use this category."}
            </p>
            {impact.childCount > 0 && <p>{impact.childCount} sub-categor{impact.childCount === 1 ? "y" : "ies"} will become top-level.</p>}
            <p>The page /demos/{category.slug} will stop working.</p>
          </div>
        ),
        onOk: () => remove.mutateAsync(category._id),
      });
    } catch (error) {
      errorToast(apiErrorMessage(error));
    }
  };

  const columns: ColumnsType<IAdminCategory> = [
    {
      title: "Category",
      key: "name",
      render: (_, category) => (
        <button type="button" className="text-left" onClick={() => setEditing({ open: true, id: category._id })}>
          <span className="block font-medium text-ink-950">
            {category.parent ? <span className="mr-1 text-stone-500">↳</span> : null}
            {category.name}
          </span>
          <span className="block text-xs text-stone-600">/demos/{category.slug}</span>
        </button>
      ),
    },
    {
      title: "Projects",
      key: "projects",
      render: (_, category) => (
        <span className="text-sm">
          {category.publishedProjectCount || 0}
          <span className="text-stone-500"> published / {category.projectCount || 0}</span>
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: string, category) => (
        <Switch
          size="small"
          checked={value === "published"}
          checkedChildren="Published"
          unCheckedChildren="Draft"
          onChange={(checked) => update.mutate({ id: category._id, payload: { status: checked ? "published" : "draft" } })}
        />
      ),
    },
    {
      title: "Homepage",
      dataIndex: "showOnHome",
      responsive: ["md"],
      render: (value: boolean) => (value ? <Tag color="green">Featured</Tag> : <span className="text-stone-400">—</span>),
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      align: "right",
      render: (_, category) => (
        <Space>
          {category.status === "published" && (
            <Tooltip title="View page">
              <Button size="small" icon={<LuExternalLink aria-hidden />} aria-label={`View ${category.name}`} href={`/demos/${category.slug}`} target="_blank" />
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <Button size="small" icon={<LuPencil aria-hidden />} aria-label={`Edit ${category.name}`} onClick={() => setEditing({ open: true, id: category._id })} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button size="small" danger icon={<LuTrash2 aria-hidden />} aria-label={`Delete ${category.name}`} onClick={() => confirmDelete(category)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Categories"
        description="Industries and sub-categories. Each published category has a shareable page at /demos/<slug>."
        actions={
          <>
            <Button icon={<LuArrowUpDown aria-hidden />} onClick={() => setReorderOpen(true)}>
              Reorder
            </Button>
            <Button type="primary" icon={<LuPlus aria-hidden />} onClick={() => setEditing({ open: true })}>
              New category
            </Button>
          </>
        }
      />
      <Input
        allowClear
        prefix={<LuSearch aria-hidden />}
        placeholder="Search categories"
        className="!mb-4 !w-full sm:!w-72"
        onChange={(event) => setSearch(event.target.value)}
      />
      <Table
        rowKey="_id"
        columns={
          skeleton
            ? skeletonColumns(columns, {
                name: SkeletonCell.lines("55%", "40%"),
                projects: SkeletonCell.line("5rem"),
                status: SkeletonCell.labelledToggle(),
                showOnHome: SkeletonCell.tag(),
                actions: SkeletonCell.actions(3),
              })
            : columns
        }
        dataSource={skeleton ? skeletonRows<IAdminCategory>(8) : rows}
        loading={!skeleton && categories.isFetching && categories.isFetchedAfterMount}
        pagination={false}
        scroll={{ x: 640 }}
      />

      <CategoryEditor id={editing.id} open={editing.open} onClose={() => setEditing({ open: false })} />
      <ReorderModal
        open={reorderOpen}
        title="Category order"
        items={rows.map((row) => ({ id: row._id, label: row.name, meta: row.parent ? "sub-category" : undefined }))}
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
