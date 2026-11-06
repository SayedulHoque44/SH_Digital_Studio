"use client";

import { Button, Dropdown, Input, Popconfirm, Select, Space, Switch, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LuArrowUpDown, LuCopy, LuEllipsis, LuExternalLink, LuEye, LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IAdminProject } from "@/features/Admin/interface/admin.interface";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/format";
import PageHeader from "../PageHeader";
import ReorderModal from "../ReorderModal";

const STATUS_COLOR: Record<string, string> = { published: "green", draft: "orange", archived: "default" };

export default function ProjectsTable() {
  const [query, setQuery] = useState<Record<string, unknown>>({ page: 1, limit: 20, sort: "order" });
  const [reorderOpen, setReorderOpen] = useState(false);

  const projects = AdminHooks.useProjects(query);
  const options = AdminHooks.useProjectOptions();
  const categories = AdminHooks.useCategoryOptions();
  const updateProject = AdminHooks.useUpdateProject();
  const duplicateProject = AdminHooks.useDuplicateProject();
  const deleteProject = AdminHooks.useDeleteProject();
  const reorder = AdminHooks.useReorderProjects();

  const setFilter = (key: string, value: unknown) => setQuery((current) => ({ ...current, [key]: value || undefined, page: 1 }));
  const patch = (id: string, payload: Partial<IAdminProject>) => updateProject.mutate({ id, payload });

  const columns: ColumnsType<IAdminProject> = useMemo(
    () => [
      {
        title: "Project",
        key: "title",
        render: (_, project) => (
          <Link href={`/admin/projects/${project._id}`} className="flex items-center gap-3">
            <span className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-paper-200 ring-1 ring-paper-300">
              {project.media?.coverImage?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.media.coverImage.url} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink-950">{project.title}</span>
              <span className="block truncate text-xs text-stone-600">
                {(project.categories as { name: string }[]).map((category) => category.name).join(", ") || "No category"}
              </span>
            </span>
          </Link>
        ),
      },
      {
        title: "Type",
        dataIndex: "projectType",
        responsive: ["md"],
        render: (value: IAdminProject["projectType"], project) => (
          <span className="text-sm">
            {PROJECT_TYPE_LABELS[value]}
            <span className="block text-xs text-stone-500">{project.isClientWork ? "Client project" : PROJECT_STATUS_LABELS[project.projectStatus]}</span>
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "publishStatus",
        render: (value: string, project) => (
          <Space orientation="vertical" size={2}>
            <Tag color={STATUS_COLOR[value]}>{value}</Tag>
            {project.visibility === "unlisted" && <Tag>unlisted</Tag>}
          </Space>
        ),
      },
      {
        title: "Featured",
        dataIndex: "featured",
        responsive: ["lg"],
        render: (value: boolean, project) => (
          <Switch size="small" checked={value} aria-label={`Feature ${project.title}`} onChange={(checked) => patch(project._id, { featured: checked })} />
        ),
      },
      {
        title: "Updated",
        dataIndex: "updatedAt",
        responsive: ["xl"],
        render: (value: string) => <span className="text-xs text-stone-600">{value ? new Date(value).toLocaleDateString() : ""}</span>,
      },
      {
        title: <span className="sr-only">Actions</span>,
        key: "actions",
        align: "right",
        render: (_, project) => (
          <Space>
            <Tooltip title="Edit">
              <Link href={`/admin/projects/${project._id}`}>
                <Button size="small" icon={<LuPencil aria-hidden />} aria-label={`Edit ${project.title}`} />
              </Link>
            </Tooltip>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "preview",
                    icon: <LuEye aria-hidden />,
                    label: "Preview",
                    onClick: () => window.open(`/preview?path=${encodeURIComponent(`/projects/${project.slug}`)}`, "_blank", "noopener"),
                  },
                  ...(project.publishStatus === "published"
                    ? [{ key: "view", icon: <LuExternalLink aria-hidden />, label: "View on site", onClick: () => window.open(`/projects/${project.slug}`, "_blank", "noopener") }]
                    : []),
                  {
                    key: "toggle",
                    label: project.publishStatus === "published" ? "Unpublish (draft)" : "Publish",
                    onClick: () => patch(project._id, { publishStatus: project.publishStatus === "published" ? "draft" : "published" }),
                  },
                  ...(project.publishStatus !== "archived"
                    ? [{ key: "archive", label: "Archive", onClick: () => patch(project._id, { publishStatus: "archived" }) }]
                    : []),
                  { key: "duplicate", icon: <LuCopy aria-hidden />, label: "Duplicate", onClick: () => duplicateProject.mutate(project._id) },
                ],
              }}
            >
              <Button size="small" icon={<LuEllipsis aria-hidden />} aria-label={`More actions for ${project.title}`} />
            </Dropdown>
            <Popconfirm
              title="Delete project?"
              description="This cannot be undone. Archiving keeps it without showing it."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteProject.mutate(project._id)}
            >
              <Button size="small" danger icon={<LuTrash2 aria-hidden />} aria-label={`Delete ${project.title}`} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <PageHeader
        title="Projects"
        description="Websites, applications and concept demos shown on the public site."
        actions={
          <>
            <Button icon={<LuArrowUpDown aria-hidden />} onClick={() => setReorderOpen(true)}>
              Reorder
            </Button>
            <Link href="/admin/projects/new">
              <Button type="primary" icon={<LuPlus aria-hidden />}>
                New project
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          allowClear
          prefix={<LuSearch aria-hidden />}
          placeholder="Search projects"
          className="!w-full sm:!w-72"
          onChange={(event) => setFilter("searchTerm", event.target.value)}
        />
        <Select
          allowClear
          placeholder="Status"
          className="min-w-[140px]"
          onChange={(value) => setFilter("publishStatus", value)}
          options={["published", "draft", "archived"].map((value) => ({ value, label: value }))}
        />
        <Select
          allowClear
          placeholder="Type"
          className="min-w-[170px]"
          onChange={(value) => setFilter("projectType", value)}
          options={Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Category"
          className="min-w-[200px]"
          onChange={(value) => setFilter("category", value)}
          options={(categories.data || []).map((category) => ({ value: category._id, label: category.name }))}
        />
        <Select
          value={query.sort as string}
          className="min-w-[160px]"
          onChange={(value) => setFilter("sort", value)}
          options={[
            { value: "order", label: "Display order" },
            { value: "updated", label: "Recently updated" },
            { value: "newest", label: "Newest" },
            { value: "title", label: "Title A–Z" },
          ]}
        />
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={projects.data?.result || []}
        loading={projects.isFetching}
        scroll={{ x: 720 }}
        locale={{ emptyText: "No projects match these filters" }}
        pagination={{
          current: Number(query.page),
          pageSize: Number(query.limit),
          total: projects.data?.meta.total,
          showSizeChanger: true,
          onChange: (page, limit) => setQuery((current) => ({ ...current, page, limit })),
        }}
      />

      <ReorderModal
        open={reorderOpen}
        title="Project display order"
        items={(options.data || []).map((option) => ({ id: option._id, label: option.title || option.slug, meta: option.publishStatus }))}
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
