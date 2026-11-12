"use client";

import { Button, Empty, Form, Input, InputNumber, Modal, Tag } from "antd";
import Link from "next/link";
import { useState } from "react";
import { LuCircleCheck, LuWallet } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import type { IClientProject, IRenewal, IRenewalAlert } from "@/features/Admin/interface/admin.interface";
import {
  CYCLE_MONTHS,
  CYCLE_SHORT,
  REMIND_PRESETS,
  RENEWAL_KIND_LABELS,
  addMonthsToInput,
  describeDays,
  formatBdt,
  formatDay,
  formatMoney,
  toDateInput,
  todayInput,
  type TRenewalState,
} from "@/lib/renewals";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* State pill: the one place that decides how urgency looks            */
/* ------------------------------------------------------------------ */
const PILL: Record<TRenewalState, { dot: string; box: string }> = {
  overdue: { dot: "bg-error", box: "bg-error/12 text-error ring-error/30" },
  "due-soon": { dot: "bg-warning", box: "bg-warning/15 text-ink-900 ring-warning/40" },
  ok: { dot: "bg-success", box: "bg-success/10 text-ink-800 ring-success/25" },
  unscheduled: { dot: "bg-stone-500", box: "bg-paper-200 text-stone-700 ring-paper-300" },
  inactive: { dot: "bg-stone-500", box: "bg-paper-200 text-stone-700 ring-paper-300" },
};

export const STATE_ACCENT: Record<TRenewalState, string> = {
  overdue: "border-l-error",
  "due-soon": "border-l-warning",
  ok: "border-l-success",
  unscheduled: "border-l-paper-300",
  inactive: "border-l-paper-300",
};

export function StatePill({ state, daysLeft, className }: { state: TRenewalState; daysLeft: number | null; className?: string }) {
  const label =
    state === "inactive"
      ? "Not billing yet"
      : state === "unscheduled"
        ? "No due date"
        : state === "ok"
          ? `Paid · ${describeDays(daysLeft!).replace("Due in", "").trim()} left`
          : describeDays(daysLeft!);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        PILL[state].box,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", PILL[state].dot, state === "overdue" && "animate-pulse")} />
      {label}
    </span>
  );
}

export function DirectionTag({ direction }: { direction: IRenewal["direction"] }) {
  return direction === "receivable" ? (
    <Tag color="green" className="m-0!">Client pays you</Tag>
  ) : (
    <Tag color="blue" className="m-0!">You pay</Tag>
  );
}

export function PriceLine({ renewal }: { renewal: Pick<IRenewal, "amount" | "currency" | "exchangeRate" | "cycle"> }) {
  if (renewal.amount === undefined || renewal.amount === null) return <span className="text-stone-500">No amount set</span>;
  const bdt = formatBdt(renewal.amount, renewal.exchangeRate, renewal.currency);
  return (
    <span>
      <span className="font-semibold text-ink-950">{formatMoney(renewal.amount, renewal.currency)}</span>
      <span className="text-stone-600">{CYCLE_SHORT[renewal.cycle]}</span>
      {bdt && <span className="ml-1.5 text-stone-600">{bdt}</span>}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Reminder field: free number of days + one-click presets            */
/* ------------------------------------------------------------------ */
export function RemindField({ value, onChange }: { value?: number; onChange?: (value: number) => void }) {
  return (
    <div>
      <InputNumber
        min={0}
        max={365}
        value={value}
        onChange={(next) => onChange?.(Number(next ?? 0))}
        suffix="days before"
        className="w-full!"
      />
      <div className="mt-1.5 flex flex-wrap gap-1">
        {REMIND_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange?.(preset.value)}
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] ring-1 ring-paper-300 transition-colors",
              value === preset.value ? "bg-ink-950 text-paper-50 ring-ink-950" : "text-stone-700 hover:bg-paper-200",
            )}
          >
            {preset.label.replace(" before", "")}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Record a payment: moves the due date forward                        */
/* ------------------------------------------------------------------ */
type TPaymentTarget = { projectId: string; projectName: string; renewal: IRenewal };

type TPaymentForm = { paidOn: string; cycles: number; amount?: number | null; exchangeRate?: number | null; note?: string };

export function PaymentModal({ target, onClose }: { target: TPaymentTarget | null; onClose: () => void }) {
  const record = AdminHooks.useRecordPayment();
  if (!target) return null;
  return <PaymentModalInner key={target.renewal._id} target={target} onClose={onClose} saving={record.isLoading} onSubmit={record.mutateAsync} />;
}

function PaymentModalInner({
  target,
  onClose,
  saving,
  onSubmit,
}: {
  target: TPaymentTarget;
  onClose: () => void;
  saving: boolean;
  onSubmit: ReturnType<typeof AdminHooks.useRecordPayment>["mutateAsync"];
}) {
  const { renewal } = target;
  const [form] = Form.useForm<TPaymentForm>();
  const paidOn = Form.useWatch("paidOn", form) || todayInput();
  const cycles = Form.useWatch("cycles", form) || 1;
  const amount = Form.useWatch("amount", form);
  const months = CYCLE_MONTHS[renewal.cycle];
  // The new period starts where the old one ended (paying late never shortens it)
  const from = toDateInput(renewal.paidUntil) || paidOn;
  const to = months ? addMonthsToInput(from, months * cycles) : "";
  const suggested = renewal.amount ? renewal.amount * cycles : undefined;

  const submit = async (values: TPaymentForm) => {
    await onSubmit({
      id: target.projectId,
      renewalId: renewal._id!,
      payload: {
        paidOn: values.paidOn,
        cycles: values.cycles || 1,
        amount: values.amount ?? suggested ?? null,
        currency: renewal.currency,
        exchangeRate: values.exchangeRate ?? null,
        note: values.note,
      },
    });
    onClose();
  };

  return (
    <Modal
      open
      title={
        <span className="flex items-center gap-2">
          <LuWallet aria-hidden /> Record payment
        </span>
      }
      okText="Save payment"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      <p className="mb-4 text-sm text-stone-600">
        {target.projectName} · <span className="font-medium text-ink-900">{renewal.title}</span>
      </p>
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        onFinish={submit}
        initialValues={{ paidOn: todayInput(), cycles: 1, exchangeRate: renewal.exchangeRate ?? undefined }}
      >
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item name="paidOn" label="Paid on" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          {months > 0 && (
            <Form.Item name="cycles" label={`Covers how many ${renewal.cycle === "monthly" ? "months" : "periods"}?`}>
              <InputNumber min={1} max={60} className="w-full!" />
            </Form.Item>
          )}
          <Form.Item name="amount" label={`Amount (${renewal.currency})`} extra={suggested !== undefined ? `Leave empty for ${formatMoney(suggested, renewal.currency)}` : undefined}>
            <InputNumber min={0} className="w-full!" placeholder={suggested !== undefined ? String(suggested) : undefined} />
          </Form.Item>
          {renewal.currency !== "BDT" && (
            <Form.Item name="exchangeRate" label={`Rate (BDT per 1 ${renewal.currency})`}>
              <InputNumber min={0} className="w-full!" />
            </Form.Item>
          )}
        </div>
        <Form.Item name="note" label="Note">
          <Input placeholder="e.g. bKash, paid by Monsor vaiya" maxLength={300} />
        </Form.Item>
      </Form>
      {to && (
        <div className="flex items-start gap-2 rounded-xl bg-success/10 p-3 text-sm ring-1 ring-success/25">
          <LuCircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
          <span>
            Covers <strong>{formatDay(from)}</strong> → <strong>{formatDay(to)}</strong>. The next due date becomes{" "}
            <strong>{formatDay(to)}</strong>
            {(amount ?? suggested) !== undefined && <> · {formatMoney(amount ?? suggested, renewal.currency)}</>}.
          </span>
        </div>
      )}
    </Modal>
  );
}

export function usePaymentModal() {
  const [target, setTarget] = useState<TPaymentTarget | null>(null);
  return {
    open: (project: Pick<IClientProject, "_id" | "name">, renewal: IRenewal) =>
      setTarget({ projectId: project._id, projectName: project.name, renewal }),
    modal: <PaymentModal target={target} onClose={() => setTarget(null)} />,
  };
}

/* ------------------------------------------------------------------ */
/* "Needs attention" list (dashboard + clients page)                   */
/* ------------------------------------------------------------------ */
export function AttentionList({
  alerts,
  onRecordPayment,
  empty = "Nothing due — every renewal is paid up.",
}: {
  alerts: IRenewalAlert[];
  onRecordPayment?: (alert: IRenewalAlert) => void;
  empty?: string;
}) {
  if (!alerts.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={empty} />;
  return (
    <ul className="space-y-2">
      {alerts.map((alert) => (
          <li
            key={`${alert.projectId}-${alert.renewalId}`}
            className={cn(
              "flex flex-col gap-3 rounded-xl border-l-4 bg-paper-50 p-3 ring-1 ring-paper-300/70 sm:flex-row sm:items-center sm:justify-between",
              STATE_ACCENT[alert.state],
            )}
          >
            <div className="min-w-0">
              <Link href={`/admin/clients/${alert.projectId}`} className="block truncate font-medium text-ink-950 hover:underline">
                {alert.projectName}
              </Link>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-600">
                <span className="min-w-0 wrap-anywhere">
                  {alert.title} · {RENEWAL_KIND_LABELS[alert.kind]}
                </span>
                <DirectionTag direction={alert.direction} />
              </p>
              <p className="mt-1 text-sm">
                <PriceLine renewal={alert} />
              </p>
            </div>
            {/* Phone: pill + date on the left, button on the right (wraps under them if needed) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-paper-200 pt-2.5 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1.5 sm:border-0 sm:pt-0">
              <StatePill state={alert.state} daysLeft={alert.daysLeft} />
              <span className="whitespace-nowrap text-xs text-stone-600">Due {formatDay(alert.paidUntil)}</span>
              {onRecordPayment && (
                <Button size="small" className="ml-auto sm:ml-0" onClick={() => onRecordPayment(alert)}>
                  Record payment
                </Button>
              )}
            </div>
          </li>
      ))}
    </ul>
  );
}
