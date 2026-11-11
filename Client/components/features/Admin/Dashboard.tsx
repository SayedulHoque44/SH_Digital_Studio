"use client";

import { Alert, Button, Card, Empty, Progress, Tag } from "antd";
import Link from "next/link";
import { LuCircleCheck, LuCircle, LuPlus, LuInbox, LuExternalLink } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import { INQUIRY_STATUS_LABELS, type TInquiryStatus } from "@/features/Inquiry/interface/inquiry.interface";
import { formatDate } from "@/lib/format";
import { AttentionList } from "./Clients/RenewalParts";
import PageHeader from "./PageHeader";
import { DashboardBodySkeleton } from "./Skeletons";

function Stat({ label, value, hint, href }: { label: string; value: number | string; hint?: string; href: string }) {
  return (
    <Link href={href} className="block rounded-2xl bg-paper-50 p-5 ring-1 ring-paper-300/70 transition-shadow hover:shadow-md">
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-2 font-display text-[2rem] font-semibold leading-none tracking-[-0.03em]">{value}</p>
      {hint && <p className="mt-2 text-xs text-stone-500">{hint}</p>}
    </Link>
  );
}

// All numbers come from the database - no visitor or sales figures are invented.
export default function Dashboard() {
  const { data, isLoading, isError, refetch } = AdminHooks.useDashboard();

  const header = (
    <PageHeader
      title="Dashboard"
      description="An overview of your content and leads."
      actions={
        <>
          <Link href="/admin/projects/new">
            <Button type="primary" icon={<LuPlus aria-hidden />}>
              New project
            </Button>
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button icon={<LuExternalLink aria-hidden />}>View website</Button>
          </a>
        </>
      }
    />
  );

  if (isLoading)
    return (
      <>
        {header}
        <DashboardBodySkeleton />
      </>
    );
  if (isError || !data)
    return (
      <Alert
        type="error"
        showIcon
        title="Could not load the dashboard"
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );

  const done = data.checklist.filter((item) => item.done).length;
  const percent = Math.round((done / Math.max(1, data.checklist.length)) * 100);

  return (
    <>
      {header}

      {data.renewals.overdue + data.renewals.dueSoon > 0 && (
        <Alert
          className="!mb-6"
          type={data.renewals.overdue ? "error" : "warning"}
          showIcon
          title={
            data.renewals.overdue
              ? `${data.renewals.overdue} client renewal(s) overdue${data.renewals.dueSoon ? ` · ${data.renewals.dueSoon} due soon` : ""}`
              : `${data.renewals.dueSoon} client renewal(s) due soon`
          }
          description={data.renewals.items
            .slice(0, 3)
            .map((item) => `${item.projectName} — ${item.title}`)
            .join(" · ")}
          action={
            <Link href="/admin/clients">
              <Button size="small">Review</Button>
            </Link>
          }
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Published projects" value={data.projects.published} hint={`${data.projects.draft} draft · ${data.projects.archived} archived`} href="/admin/projects" />
        <Stat label="Website / application demos" value={`${data.projects.websites} / ${data.projects.applications}`} hint="Published, by type" href="/admin/projects" />
        <Stat label="Categories" value={data.categories.total} hint={`${data.categories.published} published`} href="/admin/categories" />
        <Stat label="New inquiries" value={data.inquiries.new} hint={`${data.inquiries.total} in total`} href="/admin/inquiries" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7" title="Launch checklist" extra={<span className="text-sm text-stone-600">{done} of {data.checklist.length} done</span>}>
          <Progress percent={percent} strokeColor="#111316" showInfo={false} className="!mb-4" />
          <ul className="divide-y divide-paper-200">
            {data.checklist.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-4 py-3">
                <span className="flex items-center gap-3 text-[0.95rem]">
                  {item.done ? (
                    <LuCircleCheck aria-label="Done" className="size-5 shrink-0 text-success" />
                  ) : (
                    <LuCircle aria-label="To do" className="size-5 shrink-0 text-stone-500" />
                  )}
                  <span className={item.done ? "text-stone-500 line-through" : ""}>{item.label}</span>
                </span>
                {!item.done && (
                  <Link href={item.href} className="shrink-0 text-sm font-medium underline underline-offset-4">
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6 xl:col-span-5">
          <Card
            title="Client renewals"
            extra={
              <Link href="/admin/clients" className="text-sm font-medium">
                All clients
              </Link>
            }
          >
            <AttentionList alerts={data.renewals.items} empty="Nothing due soon — all client renewals are paid up." />
          </Card>

          <Card
            title="Recent inquiries"
            extra={
              <Link href="/admin/inquiries" className="text-sm font-medium">
                View all
              </Link>
            }
          >
            {data.recentInquiries.length ? (
              <ul className="divide-y divide-paper-200">
                {data.recentInquiries.map((inquiry) => (
                  <li key={inquiry._id} className="py-3">
                    <Link href={`/admin/inquiries?open=${inquiry._id}`} className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block font-medium">
                          {inquiry.name}
                          {inquiry.businessName ? ` · ${inquiry.businessName}` : ""}
                        </span>
                        <span className="block text-xs text-stone-600">
                          {[inquiry.industry, inquiry.projectTitle].filter(Boolean).join(" · ") || inquiry.email}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <Tag color={inquiry.status === "new" ? "green" : "default"}>
                          {INQUIRY_STATUS_LABELS[inquiry.status as TInquiryStatus] || inquiry.status}
                        </Tag>
                        <span className="mt-1 block text-xs text-stone-500">{formatDate(inquiry.createdAt, { month: "short", day: "numeric" })}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty image={<LuInbox className="mx-auto size-10 text-stone-400" />} description="No inquiries yet" />
            )}
          </Card>

          <Card title="Recent changes">
            {data.recentChanges.length ? (
              <ul className="divide-y divide-paper-200">
                {data.recentChanges.map((change) => (
                  <li key={`${change.type}-${change.id}`} className="flex items-center justify-between gap-3 py-2.5">
                    <Link href={change.href} className="min-w-0">
                      <span className="block truncate font-medium">{change.title}</span>
                      <span className="block text-xs text-stone-600">
                        {change.type} · {formatDate(change.updatedAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </Link>
                    <Tag color={change.status === "published" ? "green" : change.status === "archived" ? "default" : "orange"}>{change.status}</Tag>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty description="No content yet" />
            )}
          </Card>

          <Card title="Integrations">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>E-mail notifications for inquiries</span>
                <Tag color={data.integrations.emailNotifications ? "green" : "default"}>
                  {data.integrations.emailNotifications ? "Configured" : "Not configured"}
                </Tag>
              </li>
              <li className="flex items-center justify-between">
                <span>Media uploads (S3)</span>
                <Tag color={data.integrations.mediaUploads ? "green" : "default"}>
                  {data.integrations.mediaUploads ? "Configured" : "URL-only"}
                </Tag>
              </li>
            </ul>
            <p className="mt-3 text-xs text-stone-600">Integrations are configured with server environment variables (see Server/README.md).</p>
          </Card>
        </div>
      </div>
    </>
  );
}
