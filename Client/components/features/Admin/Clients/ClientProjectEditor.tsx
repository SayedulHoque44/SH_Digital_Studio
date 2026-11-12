"use client";

import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Result,
  Segmented,
  Select,
  Switch,
  Tabs,
  Tooltip,
} from "antd";
import type { FormInstance } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuExternalLink, LuMail, LuMessageCircle, LuPhone, LuPlus, LuSave, LuTrash2, LuWallet } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IClientProject, IRenewal } from "@/features/Admin/interface/admin.interface";
import {
  CLIENT_STATUS_LABELS,
  CURRENCY_OPTIONS,
  CYCLE_LABELS,
  LINK_KIND_LABELS,
  RENEWAL_KIND_LABELS,
  formatDay,
  formatMoney,
  hostOf,
  renewalState,
  toDateInput,
} from "@/lib/renewals";
import { cn } from "@/lib/utils";
import { MarkdownField } from "../fields/FormFields";
import PageHeader from "../PageHeader";
import { EditorSkeleton } from "../Skeletons";
import { useUnsavedChanges } from "../UnsavedChanges";
import { moneyStats } from "@/lib/ledger";
import { LedgerField, MoneyTiles, MonthlyTable, YearFilter } from "./MoneyParts";
import { DirectionTag, PriceLine, RemindField, STATE_ACCENT, StatePill, usePaymentModal } from "./RenewalParts";
import ConfirmDelete from "../fields/ConfirmDelete";
import AccountsField from "./AccountsField";
import { EnvField } from "./EnvField";
import StatementBox from "./StatementBox";
import { renewalStatement } from "@/lib/statements";

/* ------------------------------------------------------------------ */
/* Form <-> API conversion (dates are "YYYY-MM-DD" in the form)        */
/* ------------------------------------------------------------------ */
const toForm = (project?: IClientProject) =>
  project
    ? {
        ...project,
        tags: project.tags || [],
        startDate: toDateInput(project.startDate),
        handoverDate: toDateInput(project.handoverDate),
        renewals: project.renewals.map((renewal) => ({
          ...renewal,
          paidFrom: toDateInput(renewal.paidFrom),
          paidUntil: toDateInput(renewal.paidUntil),
          payments: renewal.payments.map((payment) => ({
            ...payment,
            paidOn: toDateInput(payment.paidOn),
            periodFrom: toDateInput(payment.periodFrom),
            periodTo: toDateInput(payment.periodTo),
          })),
        })),
      }
    : { status: "active", pinned: false, muteAlerts: false, tags: [], client: { name: "" }, links: [], accounts: [], renewals: [], checklist: [], ledger: [], envSets: [] };

const RENEWAL_PRESETS: { label: string; value: Partial<IRenewal> }[] = [
  { label: "Domain", value: { title: "Domain registration", kind: "domain", direction: "payable", cycle: "yearly", remindDaysBefore: 30 } },
  { label: "Hosting fee", value: { title: "Hosting fee", kind: "hosting", direction: "receivable", cycle: "monthly", remindDaysBefore: 14 } },
  { label: "Maintenance", value: { title: "Maintenance", kind: "maintenance", direction: "receivable", cycle: "monthly", remindDaysBefore: 14 } },
  { label: "Server / DB", value: { title: "Server & database", kind: "server", direction: "receivable", cycle: "monthly", remindDaysBefore: 14 } },
  { label: "Custom", value: { title: "", kind: "other", direction: "receivable", cycle: "monthly", remindDaysBefore: 30 } },
];

const newRenewal = (preset: Partial<IRenewal>): Partial<IRenewal> => ({
  currency: "USD",
  active: true,
  autoRenew: false,
  payments: [],
  ...preset,
});

const ACCOUNT_PROVIDERS = ["Vercel", "Hostinger", "GitHub", "MongoDB Atlas", "AWS", "Cloudflare", "Namecheap", "Netlify", "Render", "Firebase", "Google Workspace", "cPanel"];

const STANDARD_CHECKLIST = [
  "Environment variables documented in the hosting dashboard",
  "Domain DNS and SSL verified",
  "Main branches protected on GitHub",
  "Database backups enabled",
  "Admin login handed over to the client",
  "Domain renewal reminders on at the registrar",
];

/* ------------------------------------------------------------------ */
/* Saved renewals at a glance, with "Record payment"                   */
/* ------------------------------------------------------------------ */
function RenewalOverview({ project, onPay }: { project: IClientProject; onPay: (renewal: IRenewal) => void }) {
  if (!project.renewals.length) return null;
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {project.renewals.map((renewal) => {
        const { state, daysLeft } = renewalState(renewal);
        return (
          <div key={renewal._id} className={cn("flex flex-col rounded-2xl border-l-4 bg-paper-50 p-4 ring-1 ring-paper-300/70", STATE_ACCENT[state])}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-ink-950">{renewal.title}</p>
              <DirectionTag direction={renewal.direction} />
            </div>
            <p className="mt-1 text-sm">
              <PriceLine renewal={renewal} />
            </p>
            <p className="mt-2 text-xs text-stone-600">
              {renewal.paidUntil ? `Paid until ${formatDay(renewal.paidUntil)}` : "No due date set"}
              {renewal.provider ? ` · ${renewal.provider}` : ""}
            </p>
            <div className="mt-3 flex flex-1 items-end justify-between gap-2">
              <StatePill state={state} daysLeft={daysLeft} />
              {renewal.active && renewal.cycle !== "one-time" && (
                <Button size="small" icon={<LuWallet aria-hidden />} onClick={() => onPay(renewal)}>
                  Paid
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One renewal in the editor                                            */
/* ------------------------------------------------------------------ */
function RenewalCard({ form, name, onRemove }: { form: FormInstance; name: number; onRemove: () => void }) {
  const renewal = (Form.useWatch(["renewals", name], form) || {}) as IRenewal;
  const projectName = Form.useWatch("name", form) as string | undefined;
  const { state, daysLeft } = renewalState({ ...renewal, paidUntil: renewal.paidUntil || null });
  const currency = renewal.currency || "USD";

  return (
    <div className={cn("rounded-2xl border-l-4 bg-paper-50 p-4 ring-1 ring-paper-300/70 sm:p-5", STATE_ACCENT[state])}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-base font-semibold text-ink-950">{renewal.title || "New renewal"}</span>
          <StatePill state={state} daysLeft={daysLeft} />
        </div>
        <Popconfirm title="Remove this renewal and its payment history?" okText="Remove" okButtonProps={{ danger: true }} onConfirm={onRemove}>
          <Button type="text" danger aria-label="Remove renewal" icon={<LuTrash2 aria-hidden />} />
        </Popconfirm>
      </div>

      <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
        <Form.Item name={[name, "title"]} label="Name" rules={[{ required: true, message: "Name this renewal" }]} className="lg:col-span-2">
          <Input placeholder="e.g. Hosting & domain fee" />
        </Form.Item>
        <Form.Item name={[name, "kind"]} label="Type">
          <Select options={Object.entries(RENEWAL_KIND_LABELS).map(([value, label]) => ({ value, label }))} />
        </Form.Item>
        <Form.Item name={[name, "provider"]} label="Provider">
          <AutoComplete options={ACCOUNT_PROVIDERS.map((value) => ({ value }))} placeholder="e.g. Hostinger" filterOption />
        </Form.Item>
      </div>

      <Form.Item name={[name, "direction"]} label="Who pays?">
        <Segmented
          options={[
            { value: "receivable", label: "Client pays me" },
            { value: "payable", label: "I pay the provider" },
          ]}
        />
      </Form.Item>

      <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
        <Form.Item name={[name, "amount"]} label="Amount per cycle">
          <InputNumber min={0} className="w-full!" placeholder="e.g. 20" />
        </Form.Item>
        <Form.Item name={[name, "currency"]} label="Currency">
          <Select options={CURRENCY_OPTIONS.map((value) => ({ value, label: value }))} />
        </Form.Item>
        {currency !== "BDT" && (
          <Form.Item name={[name, "exchangeRate"]} label={`BDT per 1 ${currency}`} extra="Optional, shows the taka amount">
            <InputNumber min={0} className="w-full!" placeholder="e.g. 126" />
          </Form.Item>
        )}
        <Form.Item name={[name, "cycle"]} label="Billing cycle">
          <Select options={Object.entries(CYCLE_LABELS).map(([value, label]) => ({ value, label }))} />
        </Form.Item>
      </div>

      <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
        <Form.Item name={[name, "paidFrom"]} label="Started / first paid">
          <Input type="date" />
        </Form.Item>
        <Form.Item name={[name, "paidUntil"]} label="Paid until (next due)" extra="Moves forward when you record a payment">
          <Input type="date" />
        </Form.Item>
        <Form.Item name={[name, "remindDaysBefore"]} label="Remind me" className="lg:col-span-2">
          <RemindField />
        </Form.Item>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <Form.Item name={[name, "active"]} label="Billing active" valuePropName="checked" extra="Off = tracked only (e.g. free for now)">
          <Switch />
        </Form.Item>
        <Form.Item name={[name, "autoRenew"]} label="Auto-renews at provider" valuePropName="checked">
          <Switch />
        </Form.Item>
      </div>

      <Form.Item name={[name, "notes"]} label="Notes">
        <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} maxLength={2000} placeholder="e.g. Will charge the client later" />
      </Form.Item>

      <Form.List name={[name, "payments"]}>
        {(payments, { add, remove }) => (
          <div className="rounded-xl bg-paper-100 p-3 ring-1 ring-paper-200">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink-900">Payment history ({payments.length})</span>
              <Button size="small" type="text" icon={<LuPlus aria-hidden />} onClick={() => add({ paidOn: "", currency })}>
                Add manually
              </Button>
            </div>
            {payments.length === 0 && <p className="text-xs text-stone-600">No payments yet. Use “Paid” at the top of the page after saving.</p>}
            {payments
              .slice()
              .reverse()
              .map((payment) => (
                <div key={payment.key} className="grid grid-cols-2 items-start gap-2 border-t border-paper-200 py-2 first:border-t-0 sm:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.5fr)_auto]">
                  <Form.Item name={[payment.name, "paidOn"]} rules={[{ required: true, message: "Date" }]} className="mb-0!" tooltip="Paid on">
                    <Input type="date" size="small" aria-label="Paid on" />
                  </Form.Item>
                  <Form.Item name={[payment.name, "amount"]} className="mb-0!">
                    <InputNumber size="small" min={0} className="w-full!" placeholder={`Amount ${currency}`} aria-label="Amount" />
                  </Form.Item>
                  <Form.Item name={[payment.name, "periodFrom"]} className="mb-0!">
                    <Input type="date" size="small" aria-label="Period from" />
                  </Form.Item>
                  <Form.Item name={[payment.name, "periodTo"]} className="mb-0!">
                    <Input type="date" size="small" aria-label="Period to" />
                  </Form.Item>
                  <Form.Item name={[payment.name, "note"]} className="mb-0!">
                    <Input size="small" placeholder="Note" aria-label="Note" maxLength={300} />
                  </Form.Item>
                  <ConfirmDelete title="Delete this payment?" onConfirm={() => remove(payment.name)}><Button size="small" type="text" danger aria-label="Delete payment" icon={<LuTrash2 aria-hidden />} /></ConfirmDelete>
                </div>
              ))}
            {payments.length > 0 && <p className="mt-1 text-[11px] text-stone-500">Columns: paid on · amount · period from · period to · note</p>}
            {payments.length > 0 && <StatementBox title="Payment details (to send)" text={renewalStatement(renewal, projectName)} />}
          </div>
        )}
      </Form.List>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                               */
/* ------------------------------------------------------------------ */
export default function ClientProjectEditor({ id }: { id?: string }) {
  const isNew = !id;
  const router = useRouter();
  const [form] = Form.useForm();
  const { setDirty, isDirty, navigate } = useUnsavedChanges();
  const project = AdminHooks.useClientProject(id);
  const create = AdminHooks.useCreateClientProject();
  const update = AdminHooks.useUpdateClientProject();
  const remove = AdminHooks.useDeleteClientProject();
  const payment = usePaymentModal();
  const [year, setYear] = useState("all");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const checklist = (Form.useWatch("checklist", form) || []) as IClientProject["checklist"];
  const checklistDone = checklist.filter((item) => item?.done).length;

  useEffect(() => {
    if (isNew) form.setFieldsValue(toForm());
    else if (project.data) form.setFieldsValue(toForm(project.data));
  }, [isNew, project.data, form]);
  useEffect(() => () => setDirty(false), [setDirty]);

  const onFinish = async () => {
    // Full store: keeps every list item's _id (renewals, payments, links…)
    const payload = form.getFieldsValue(true);
    if (isNew) {
      const created = await create.mutateAsync(payload);
      setDirty(false);
      router.replace(`/admin/clients/${created._id}`);
    } else {
      const saved = await update.mutateAsync({ id: id!, payload });
      form.setFieldsValue(toForm(saved));
      setDirty(false);
    }
  };

  const openPayment = (renewal: IRenewal) => {
    if (isDirty() && !window.confirm("You have unsaved changes. Recording a payment reloads this page and discards them. Continue?")) return;
    setDirty(false);
    payment.open(project.data!, renewal);
  };

  const loading = !isNew && project.isLoading;
  const missing = !isNew && !project.isLoading && (project.isError || !project.data);
  const data = project.data;
  const liveLink = data?.links.find((link) => link.kind === "live");
  const adminLink = data?.links.find((link) => link.kind === "admin");
  const whatsapp = data?.client.whatsapp?.replace(/[^\d]/g, "");

  return (
    <>
    <Form form={form} layout="vertical" requiredMark="optional" onFinish={onFinish} onValuesChange={() => setDirty(true)} scrollToFirstError>
      {loading ? (
        <EditorSkeleton
          label="Loading client project…"
          tabs={9}
          tiles={2}
          eyebrow={
            <button type="button" onClick={() => navigate("/admin/clients")} className="inline-flex items-center gap-1.5 hover:underline">
              <LuArrowLeft aria-hidden /> Clients
            </button>
          }
        />
      ) : missing ? (
        <Result status="404" title="Client project not found" extra={<Link href="/admin/clients">Back to clients</Link>} />
      ) : (
        <>
          <PageHeader
            eyebrow={
              <button type="button" onClick={() => navigate("/admin/clients")} className="inline-flex items-center gap-1.5 hover:underline">
                <LuArrowLeft aria-hidden /> Clients
              </button>
            }
            title={isNew ? "New client project" : data?.name}
            description={
              data ? (
                <>
                  {data.client.name}
                  {data.client.relation ? ` · ${data.client.relation}` : ""} · {CLIENT_STATUS_LABELS[data.status]}
                  {data.handoverDate ? ` · handed over ${formatDay(data.handoverDate)}` : ""}
                </>
              ) : (
                "Everything about one client project: contacts, accounts, renewals and payments. Private to admins."
              )
            }
            actions={
              <>
                {liveLink && (
                  <Button icon={<LuExternalLink aria-hidden />} href={liveLink.url} target="_blank" rel="noopener noreferrer">
                    {hostOf(liveLink.url)}
                  </Button>
                )}
                {adminLink && (
                  <Button icon={<LuExternalLink aria-hidden />} href={adminLink.url} target="_blank" rel="noopener noreferrer">
                    Admin
                  </Button>
                )}
                {data?.client.email && <Button aria-label="E-mail client" icon={<LuMail aria-hidden />} href={`mailto:${data.client.email}`} />}
                {data?.client.phone && <Button aria-label="Call client" icon={<LuPhone aria-hidden />} href={`tel:${data.client.phone}`} />}
                {whatsapp && (
                  <Button aria-label="WhatsApp client" icon={<LuMessageCircle aria-hidden />} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" />
                )}
                <Button type="primary" htmlType="submit" loading={create.isLoading || update.isLoading} icon={<LuSave aria-hidden />}>
                  {isNew ? "Create" : "Save changes"}
                </Button>
              </>
            }
          />

          {data && <RenewalOverview project={data} onPay={openPayment} />}

          {data && (data.ledger?.length > 0 || data.renewals.some((renewal) => renewal.payments.length)) && (
            <section aria-label="Money for this project" className="mb-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-950">Money</h2>
                <YearFilter projects={[data]} value={year} onChange={setYear} />
              </div>
              <MoneyTiles stats={moneyStats([data], year === "all" ? undefined : year)} />
            </section>
          )}

          <Card>
            <Tabs
              items={[
                {
                  key: "overview",
                  label: "Overview",
                  forceRender: true,
                  children: (
                    <>
                      <Form.Item name="name" label="Project name" rules={[{ required: true, min: 2 }]}>
                        <Input placeholder="e.g. E-Services Al-Riyadh" />
                      </Form.Item>
                      <Form.Item name="summary" label="Short summary">
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} maxLength={1000} showCount placeholder="What was built, for whom, where it runs" />
                      </Form.Item>
                      <div className="grid gap-x-4 sm:grid-cols-3">
                        <Form.Item name="startDate" label="Started">
                          <Input type="date" />
                        </Form.Item>
                        <Form.Item name="handoverDate" label="Handed over">
                          <Input type="date" />
                        </Form.Item>
                        <Form.Item name="techLead" label="Technical lead">
                          <Input placeholder="e.g. Sayedul Hoque" />
                        </Form.Item>
                      </div>
                    </>
                  ),
                },
                {
                  key: "client",
                  label: "Client",
                  forceRender: true,
                  children: (
                    <>
                      <div className="grid gap-x-4 sm:grid-cols-2">
                        <Form.Item name={["client", "name"]} label="Client name" rules={[{ required: true, message: "Client name is required" }]}>
                          <Input />
                        </Form.Item>
                        <Form.Item name={["client", "relation"]} label="How you know them / referred by">
                          <Input placeholder="e.g. Friend of Monsor vaiya" />
                        </Form.Item>
                        <Form.Item name={["client", "company"]} label="Company / organization">
                          <Input />
                        </Form.Item>
                        <Form.Item name={["client", "country"]} label="Country">
                          <Input />
                        </Form.Item>
                        <Form.Item name={["client", "email"]} label="E-mail" rules={[{ type: "email" }]}>
                          <Input type="email" />
                        </Form.Item>
                        <Form.Item name={["client", "phone"]} label="Phone">
                          <Input type="tel" />
                        </Form.Item>
                        <Form.Item name={["client", "whatsapp"]} label="WhatsApp" extra="With country code, e.g. +8801…">
                          <Input type="tel" />
                        </Form.Item>
                      </div>
                    </>
                  ),
                },
                {
                  key: "renewals",
                  label: "Renewals & payments",
                  forceRender: true,
                  children: (
                    <Form.List name="renewals">
                      {(fields, { add, remove: removeRenewal }) => (
                        <div className="space-y-4">
                          <p className="text-sm text-stone-600">
                            Everything that renews: domain, hosting, maintenance, server… The dashboard and the sidebar warn you when one is inside its
                            reminder window or overdue.
                          </p>
                          {fields.map((field) => (
                            <RenewalCard key={field.key} form={form} name={field.name} onRemove={() => removeRenewal(field.name)} />
                          ))}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-stone-600">Add:</span>
                            {RENEWAL_PRESETS.map((preset) => (
                              <Button key={preset.label} icon={<LuPlus aria-hidden />} onClick={() => add(newRenewal(preset.value))}>
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </Form.List>
                  ),
                },
                {
                  key: "accounts",
                  label: "Accounts & hosting",
                  forceRender: true,
                  children: (
                    <AccountsField form={form} providers={ACCOUNT_PROVIDERS} />
                  ),
                },
                {
                  key: "env",
                  label: "Env",
                  forceRender: true,
                  children: (
                    <EnvField form={form} locked={!!data?.envLocked} />
                  ),
                },
                {
                  key: "links",
                  label: "Links & code",
                  forceRender: true,
                  children: (
                    <Form.List name="links">
                      {(fields, { add, remove: removeLink }) => (
                        <div className="space-y-3">
                          {fields.map((field) => (
                            <div key={field.key} className="grid gap-x-3 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,2fr)_auto]">
                              <Form.Item name={[field.name, "kind"]} className="mb-2! sm:mb-0!">
                                <Select aria-label="Link type" options={Object.entries(LINK_KIND_LABELS).map(([value, label]) => ({ value, label }))} />
                              </Form.Item>
                              <Form.Item name={[field.name, "label"]} className="mb-2! sm:mb-0!">
                                <Input placeholder="Label (optional)" aria-label="Label" />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, "url"]}
                                className="mb-2! sm:mb-0!"
                                rules={[{ required: true, message: "Link is required" }, { type: "url", message: "Full https:// link" }]}
                              >
                                <Input placeholder="https://…" aria-label="URL" />
                              </Form.Item>
                              <ConfirmDelete title="Remove this link?" onConfirm={() => removeLink(field.name)}><Button danger type="text" aria-label="Remove link" icon={<LuTrash2 aria-hidden />} /></ConfirmDelete>
                            </div>
                          ))}
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <span className="text-sm text-stone-600">Add:</span>
                            {(["live", "admin", "repository", "staging", "other"] as const).map((kind) => (
                              <Button key={kind} icon={<LuPlus aria-hidden />} onClick={() => add({ kind, url: "" })}>
                                {LINK_KIND_LABELS[kind]}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </Form.List>
                  ),
                },
                {
                  key: "checklist",
                  label: `Checklist${checklist.length ? ` ${checklistDone}/${checklist.length}` : ""}`,
                  forceRender: true,
                  children: (
                    <Form.List name="checklist">
                      {(fields, { add, remove: removeItem }) => (
                        <div className="space-y-2">
                          {checklist.length > 0 && (
                            <Progress percent={Math.round((checklistDone / checklist.length) * 100)} strokeColor="var(--color-success)" className="mb-3!" />
                          )}
                          {fields.map((field) => (
                            <div key={field.key} className="flex items-center gap-3">
                              <Form.Item name={[field.name, "done"]} valuePropName="checked" className="mb-0!">
                                <Checkbox aria-label="Done" />
                              </Form.Item>
                              <Form.Item name={[field.name, "text"]} className="mb-0! flex-1" rules={[{ required: true, message: "Write the task" }]}>
                                <Input
                                  variant="borderless"
                                  className={cn(checklist[field.name]?.done && "text-stone-500 line-through")}
                                  placeholder="Task"
                                />
                              </Form.Item>
                              <ConfirmDelete title="Remove this task?" onConfirm={() => removeItem(field.name)}><Button danger type="text" aria-label="Remove task" icon={<LuTrash2 aria-hidden />} /></ConfirmDelete>
                            </div>
                          ))}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button icon={<LuPlus aria-hidden />} onClick={() => add({ text: "", done: false })}>
                              Add task
                            </Button>
                            <Tooltip title="Adds common handover tasks you don't have yet">
                              <Button
                                onClick={() => {
                                  const existing = new Set(checklist.map((item) => item?.text?.toLowerCase()));
                                  STANDARD_CHECKLIST.filter((text) => !existing.has(text.toLowerCase())).forEach((text) => add({ text, done: false }));
                                  setDirty(true);
                                }}
                              >
                                Add standard handover tasks
                              </Button>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </Form.List>
                  ),
                },
                {
                  key: "budget",
                  label: "Monthly budget",
                  forceRender: true,
                  children: (
                    <div className="space-y-6">
                      {data && data.ledger?.length > 0 && <MonthlyTable months={data.ledger} />}
                      <LedgerField form={form} />
                    </div>
                  ),
                },
                {
                  key: "notes",
                  label: "Notes",
                  forceRender: true,
                  children: (
                    <Form.Item name="notes" label="Private notes" extra="Anything else: agreements, quirks, what to check on each renewal.">
                      <MarkdownField rows={10} />
                    </Form.Item>
                  ),
                },
                {
                  key: "settings",
                  label: "Settings",
                  forceRender: true,
                  children: (
                    <div className="max-w-3xl space-y-2">
                      <Form.Item name="status" label="Status" extra="Ended projects drop to the bottom of the list and never raise renewal alerts.">
                        <Segmented options={Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
                      </Form.Item>
                      <div className="grid gap-x-6 sm:grid-cols-2">
                        <Form.Item name="pinned" label="Pin to top" valuePropName="checked" extra="Always listed first on the Clients page.">
                          <Switch />
                        </Form.Item>
                        <Form.Item
                          name="muteAlerts"
                          label="Mute renewal alerts"
                          valuePropName="checked"
                          extra="Keeps tracking renewals here, but leaves them out of the sidebar badge, dashboard banner and “Needs attention”."
                        >
                          <Switch />
                        </Form.Item>
                      </div>
                      <Form.Item name="tags" label="Tags" extra="Press Enter after each tag, e.g. government, next.js. Tags are searchable on the Clients page.">
                        <Select mode="tags" tokenSeparators={[","]} open={false} suffixIcon={null} />
                      </Form.Item>

                      {data && (
                        <div className="mt-8 rounded-2xl p-5 ring-1 ring-error/40">
                          <h3 className="font-display text-base font-semibold text-error">Danger zone</h3>
                          <p className="mt-1 text-sm text-stone-600">
                            Deleting removes this project with its renewals, payment history, monthly budgets, accounts and notes. It cannot be undone. To keep the
                            record but stop tracking it, set the status to <strong>Ended</strong> instead.
                          </p>
                          <Button danger className="mt-4" icon={<LuTrash2 aria-hidden />} onClick={() => setDeleteOpen(true)}>
                            Delete client project
                          </Button>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {data && (
            <div className="mt-6">
              <p className="text-xs text-stone-600">
                Last updated {formatDay(data.updatedAt)} · {data.renewals.reduce((sum, renewal) => sum + renewal.payments.length, 0)} payment(s) recorded ·{" "}
                {formatMoney(
                  data.renewals
                    .filter((renewal) => renewal.direction === "receivable" && renewal.currency === "USD")
                    .flatMap((renewal) => renewal.payments)
                    .reduce((sum, item) => sum + (item.amount || 0), 0),
                  "USD",
                )}{" "}
                received (USD)
              </p>
            </div>
          )}
        </>
      )}
    </Form>
    {/* Outside the project form: its own form must not submit this one */}
    {payment.modal}
    {data && (
      <DeleteProjectModal
        open={deleteOpen}
        projectName={data.name}
        deleting={remove.isLoading}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await remove.mutateAsync(id!);
          setDirty(false);
          router.replace("/admin/clients");
        }}
      />
    )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Type-to-confirm delete: guards against deleting by accident          */
/* ------------------------------------------------------------------ */
function DeleteProjectModal({
  open,
  projectName,
  deleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  projectName: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  const phrase = `delete ${projectName}`;
  const matches = typed.trim() === phrase;
  const close = () => {
    setTyped("");
    onCancel();
  };
  return (
    <Modal
      open={open}
      title="Delete client project?"
      okText="Delete permanently"
      okButtonProps={{ danger: true, disabled: !matches }}
      confirmLoading={deleting}
      onOk={() => matches && onConfirm()}
      onCancel={close}
      destroyOnHidden
    >
      <p className="text-sm text-stone-700">
        This permanently deletes <strong>{projectName}</strong> with all its renewals, payments, monthly budgets, accounts, links and notes.
      </p>
      <label htmlFor="confirm-delete" className="mt-4 block text-sm">
        Type <code className="rounded bg-paper-200 px-1.5 py-0.5 text-ink-950 select-all">{phrase}</code> to confirm:
      </label>
      <Input
        id="confirm-delete"
        className="mt-2"
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        onPressEnter={() => matches && onConfirm()}
        autoComplete="off"
        status={typed && !matches ? "error" : undefined}
      />
    </Modal>
  );
}
