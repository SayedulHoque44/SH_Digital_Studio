"use client";

import { Button, Collapse, Empty, Form, Input, InputNumber, Popconfirm, Segmented, Select } from "antd";
import type { FormInstance } from "antd";
import { LuCopyPlus, LuPlus, LuTrash2 } from "react-icons/lu";
import type { IClientProject, ILedgerMonth } from "@/features/Admin/interface/admin.interface";
import {
  COST_CATEGORY_LABELS,
  INCOME_KIND_LABELS,
  formatTaka,
  monthLabel,
  monthTotals,
  moneyYears,
  nextMonth,
  type TMoneyStats,
} from "@/lib/ledger";
import { CURRENCY_OPTIONS, formatMoney } from "@/lib/renewals";
import { cn } from "@/lib/utils";
import ConfirmDelete from "../fields/ConfirmDelete";

/* ------------------------------------------------------------------ */
/* Stat tiles                                                          */
/* ------------------------------------------------------------------ */
function Tile({ label, value, hint, emphasis, negative }: { label: string; value: string; hint?: string; emphasis?: boolean; negative?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-4 ring-1", emphasis ? "bg-ink-950 text-paper-50 ring-ink-950" : "bg-paper-50 ring-paper-300/70", negative && "bg-error/8 ring-error/30")}>
      <p className={cn("text-xs", emphasis ? "text-ink-200" : "text-stone-600")}>{label}</p>
      <p className={cn("mt-1.5 font-display text-[1.45rem] font-semibold leading-none tracking-[-0.03em]", negative ? "text-error" : emphasis ? "text-paper-50" : "text-ink-950")}>{value}</p>
      {hint && <p className={cn("mt-1.5 text-[11px]", emphasis ? "text-ink-300" : "text-stone-600")}>{hint}</p>}
    </div>
  );
}

export function MoneyTiles({ stats }: { stats: TMoneyStats }) {
  const credited = stats.salary + stats.funds + stats.renewalIncome;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <Tile emphasis label="Total credited" value={formatTaka(credited)} hint="Salary + funds + renewal payments" />
      <Tile label="Salary earned" value={formatTaka(stats.salary)} hint={`${stats.months} month(s) recorded`} />
      <Tile label="Funds received" value={formatTaka(stats.funds)} hint="Sent by clients for costs" />
      <Tile label="Spent on costs" value={formatTaka(stats.costs)} hint="AWS, hosting, APIs, people…" />
      <Tile label="Renewal payments" value={formatTaka(stats.renewalIncome)} hint="Hosting / maintenance fees received" />
      <Tile
        label="Balance now"
        value={formatTaka(stats.balance)}
        negative={stats.balance < 0}
        hint={stats.latestMonth ? `Left after ${monthLabel(stats.latestMonth, true)}` : "No months yet"}
      />
    </div>
  );
}

export function YearFilter({ projects, value, onChange }: { projects: IClientProject[]; value: string; onChange: (value: string) => void }) {
  const years = moneyYears(projects);
  if (!years.length) return null;
  return <Segmented size="small" value={value} onChange={(next) => onChange(String(next))} options={[{ value: "all", label: "All time" }, ...years.map((year) => ({ value: year, label: year }))]} />;
}

/* ------------------------------------------------------------------ */
/* Month-by-month table                                                */
/* ------------------------------------------------------------------ */
export function MonthlyTable({ months }: { months: ILedgerMonth[] }) {
  if (!months.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No monthly budget recorded yet" />;
  const rows = [...months].sort((a, b) => b.month.localeCompare(a.month));
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-paper-300/70">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">Monthly budget, newest first, amounts in taka</caption>
        <thead className="bg-paper-100 text-left text-xs text-stone-600">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">Month</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Fund + carried over</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Costs</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Left</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Salary</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-paper-200 bg-paper-50">
          {rows.map((month) => {
            const totals = monthTotals(month);
            return (
              <tr key={month._id || month.month}>
                <th scope="row" className="px-3 py-2 text-left font-medium text-ink-950">{monthLabel(month.month)}</th>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatTaka(totals.available)}
                  {totals.carriedOver !== 0 && <span className="block text-[11px] text-stone-600">incl. {formatTaka(totals.carriedOver)} carried</span>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatTaka(totals.costs)}
                  {totals.foreignCosts.length > 0 && (
                    <span className="block text-[11px] text-stone-600">
                      {totals.foreignCosts.map((item) => formatMoney(item.amount, item.currency)).join(" + ")}
                      {month.exchangeRate ? ` × ${month.exchangeRate}` : ""}
                    </span>
                  )}
                </td>
                <td className={cn("px-3 py-2 text-right font-semibold tabular-nums", totals.remaining < 0 ? "text-error" : "text-ink-950")}>
                  {formatTaka(totals.remaining)}
                  {totals.remaining < 0 && <span className="block text-[11px] font-normal">Overspent</span>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{totals.salary ? formatTaka(totals.salary) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Month editor (inside the client project form)                       */
/* ------------------------------------------------------------------ */
function MonthSummary({ form, name }: { form: FormInstance; name: number }) {
  const month = (Form.useWatch(["ledger", name], form) || {}) as ILedgerMonth;
  const totals = monthTotals(month);
  return (
    <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <span className="font-medium text-ink-950">{monthLabel(month.month)}</span>
      <span className="flex flex-wrap gap-x-4 text-xs text-stone-600 tabular-nums">
        <span>Have {formatTaka(totals.available)}</span>
        <span>Costs {formatTaka(totals.costs)}</span>
        <span className={cn("font-semibold", totals.remaining < 0 ? "text-error" : "text-ink-900")}>Left {formatTaka(totals.remaining)}</span>
      </span>
    </span>
  );
}

function MonthTotalsBox({ form, name }: { form: FormInstance; name: number }) {
  const month = (Form.useWatch(["ledger", name], form) || {}) as ILedgerMonth;
  const totals = monthTotals(month);
  const foreign = totals.foreignCosts.map((item) => formatMoney(item.amount, item.currency)).join(" + ");
  return (
    <div className="grid gap-1 rounded-xl bg-paper-100 p-3 text-sm ring-1 ring-paper-200 tabular-nums">
      <p className="flex justify-between gap-3">
        <span>Fund {formatTaka(totals.fund)} + carried over {formatTaka(totals.carriedOver)}</span>
        <strong>{formatTaka(totals.available)}</strong>
      </p>
      <p className="flex justify-between gap-3">
        <span>
          Costs{foreign ? ` ${foreign}${month.exchangeRate ? ` × ${month.exchangeRate}` : ""}` : ""}
          {totals.localCosts ? ` + ${formatTaka(totals.localCosts)}` : ""}
        </span>
        <strong>− {formatTaka(totals.costs)}</strong>
      </p>
      <p className={cn("flex justify-between gap-3 border-t border-paper-300 pt-1 font-semibold", totals.remaining < 0 ? "text-error" : "text-ink-950")}>
        <span>{totals.remaining < 0 ? "Overspent" : "Remaining (carries to next month)"}</span>
        <span>{formatTaka(totals.remaining)}</span>
      </p>
      {totals.salary > 0 && <p className="text-xs text-stone-600">Your salary this month: {formatTaka(totals.salary)} (not part of the fund)</p>}
      {totals.unconverted > 0 && <p className="text-xs text-error">Add the BDT rate: {totals.unconverted} foreign amount(s) are not counted.</p>}
    </div>
  );
}

const withoutIds = <T extends { _id?: string }>(items: T[] = []) => items.map(({ _id: _omit, ...rest }) => rest);

export function LedgerField({ form }: { form: FormInstance }) {
  return (
    <Form.List name="ledger">
      {(fields, { add, remove }) => {
        const months = ((form.getFieldValue("ledger") || []) as ILedgerMonth[]).filter(Boolean);
        const latest = [...months].sort((a, b) => (a.month || "").localeCompare(b.month || "")).at(-1);
        const ordered = [...fields].sort((a, b) => String(months[b.name]?.month || "9999").localeCompare(String(months[a.name]?.month || "9999")));

        const addNext = () => {
          if (!latest) return add({ month: nextMonth(), income: [], costs: [] });
          add(
            {
              month: nextMonth(latest.month),
              exchangeRate: latest.exchangeRate,
              carriedOver: Math.round(monthTotals(latest).remaining),
              income: withoutIds(latest.income),
              costs: withoutIds(latest.costs),
            },
            0,
          );
        };

        return (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              One entry per month: what the client sent, what you spent, and what is left. The remaining amount carries into the next month automatically when you add it.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="primary" ghost icon={<LuCopyPlus aria-hidden />} onClick={addNext}>
                {latest ? `Add ${monthLabel(nextMonth(latest.month))} (copy last month)` : "Add this month"}
              </Button>
              {latest && (
                <Button icon={<LuPlus aria-hidden />} onClick={() => add({ month: "", income: [], costs: [] }, 0)}>
                  Add empty month
                </Button>
              )}
            </div>
            {fields.length > 0 && (
              <Collapse
                defaultActiveKey={ordered[0] ? [String(ordered[0].key)] : []}
                items={ordered.map((field) => ({
                  key: String(field.key),
                  forceRender: true,
                  label: <MonthSummary form={form} name={field.name} />,
                  children: (
                    <div className="space-y-4">
                      <div className="grid gap-x-4 sm:grid-cols-3">
                        <Form.Item name={[field.name, "month"]} label="Month" rules={[{ required: true, message: "Pick a month" }]}>
                          <Input type="month" />
                        </Form.Item>
                        <Form.Item name={[field.name, "exchangeRate"]} label="BDT per 1 USD" extra="Used for every foreign amount this month">
                          <InputNumber min={0} className="w-full!" placeholder="e.g. 131" />
                        </Form.Item>
                        <Form.Item name={[field.name, "carriedOver"]} label="Carried over (BDT)" extra="Left from last month (negative if overspent)">
                          <InputNumber className="w-full!" placeholder="0" />
                        </Form.Item>
                      </div>

                      <Form.List name={[field.name, "income"]}>
                        {(rows, { add: addIncome, remove: removeIncome }) => (
                          <div>
                            <p className="mb-2 text-sm font-medium text-ink-900">Money received</p>
                            {rows.map((row) => (
                              <div key={row.key} className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-[11rem_minmax(0,1fr)_9rem_6rem_auto]">
                                <Form.Item name={[row.name, "kind"]} className="mb-0!">
                                  <Select aria-label="Type" options={Object.entries(INCOME_KIND_LABELS).map(([value, label]) => ({ value, label }))} />
                                </Form.Item>
                                <Form.Item name={[row.name, "label"]} className="mb-0!">
                                  <Input placeholder="Label (optional)" aria-label="Label" />
                                </Form.Item>
                                <Form.Item name={[row.name, "amount"]} className="mb-0!" rules={[{ required: true, message: "Amount" }]}>
                                  <InputNumber min={0} className="w-full!" placeholder="Amount" aria-label="Amount" />
                                </Form.Item>
                                <Form.Item name={[row.name, "currency"]} className="mb-0!">
                                  <Select aria-label="Currency" options={CURRENCY_OPTIONS.map((value) => ({ value, label: value }))} />
                                </Form.Item>
                                <ConfirmDelete title="Remove this entry?" onConfirm={() => removeIncome(row.name)}><Button type="text" danger aria-label="Remove" icon={<LuTrash2 aria-hidden />} /></ConfirmDelete>
                              </div>
                            ))}
                            <div className="flex flex-wrap gap-2">
                              <Button size="small" icon={<LuPlus aria-hidden />} onClick={() => addIncome({ kind: "fund", label: "Fund from client", currency: "BDT" })}>
                                Fund
                              </Button>
                              <Button size="small" icon={<LuPlus aria-hidden />} onClick={() => addIncome({ kind: "salary", label: "Salary", currency: "BDT" })}>
                                Salary
                              </Button>
                            </div>
                          </div>
                        )}
                      </Form.List>

                      <Form.List name={[field.name, "costs"]}>
                        {(rows, { add: addCost, remove: removeCost }) => (
                          <div>
                            <p className="mb-2 text-sm font-medium text-ink-900">Costs</p>
                            {rows.map((row) => (
                              <div key={row.key} className="mb-2 grid grid-cols-2 gap-2 border-b border-paper-200 pb-2 lg:grid-cols-[minmax(0,1.3fr)_8.5rem_7rem_5.5rem_minmax(0,0.9fr)_minmax(0,1.2fr)_auto] lg:border-0 lg:pb-0">
                                <Form.Item name={[row.name, "label"]} className="mb-0!" rules={[{ required: true, message: "Name" }]}>
                                  <Input placeholder="e.g. AWS" aria-label="Cost name" />
                                </Form.Item>
                                <Form.Item name={[row.name, "category"]} className="mb-0!">
                                  <Select aria-label="Category" options={Object.entries(COST_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))} />
                                </Form.Item>
                                <Form.Item name={[row.name, "amount"]} className="mb-0!" rules={[{ required: true, message: "Amount" }]}>
                                  <InputNumber min={0} className="w-full!" placeholder="Amount" aria-label="Amount" />
                                </Form.Item>
                                <Form.Item name={[row.name, "currency"]} className="mb-0!">
                                  <Select aria-label="Currency" options={CURRENCY_OPTIONS.map((value) => ({ value, label: value }))} />
                                </Form.Item>
                                <Form.Item name={[row.name, "usage"]} className="mb-0!">
                                  <Input placeholder="Usage, e.g. 1,802 GB" aria-label="Usage" />
                                </Form.Item>
                                <Form.Item name={[row.name, "note"]} className="mb-0!">
                                  <Input placeholder="Note" aria-label="Note" maxLength={300} />
                                </Form.Item>
                                <ConfirmDelete title="Remove this cost?" onConfirm={() => removeCost(row.name)}><Button type="text" danger aria-label="Remove cost" icon={<LuTrash2 aria-hidden />} /></ConfirmDelete>
                              </div>
                            ))}
                            <Button size="small" icon={<LuPlus aria-hidden />} onClick={() => addCost({ label: "", category: "other", currency: "USD" })}>
                              Add cost
                            </Button>
                          </div>
                        )}
                      </Form.List>

                      <MonthTotalsBox form={form} name={field.name} />

                      <Form.Item name={[field.name, "notes"]} label="Notes" className="mb-2!">
                        <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} maxLength={2000} />
                      </Form.Item>
                      <div className="flex justify-end">
                        <Popconfirm title="Remove this month?" okText="Remove" okButtonProps={{ danger: true }} onConfirm={() => remove(field.name)}>
                          <Button size="small" danger type="text" icon={<LuTrash2 aria-hidden />}>
                            Remove month
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  ),
                }))}
              />
            )}
          </div>
        );
      }}
    </Form.List>
  );
}
