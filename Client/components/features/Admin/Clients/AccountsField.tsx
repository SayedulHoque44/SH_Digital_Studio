"use client";

import { Alert, AutoComplete, Button, Collapse, Form, Input, Select, Tooltip } from "antd";
import type { FormInstance, FormListFieldData } from "antd";
import { LuExternalLink, LuPlus, LuShieldAlert, LuTrash2 } from "react-icons/lu";
import type { IClientProject } from "@/features/Admin/interface/admin.interface";
import { hostOf } from "@/lib/renewals";
import { SERVICE_ICON_OPTIONS, resolveServiceIcon } from "@/lib/serviceIcons";
import ConfirmDelete from "../fields/ConfirmDelete";
import { usePanels } from "./usePanels";

type TAccount = IClientProject["accounts"][number];

const QUICK_ADD = ["Vercel", "Hostinger", "GitHub", "MongoDB Atlas", "AWS"];

// Header of one collapsed account: service, quick dashboard link, who owns it
function AccountHeader({ form, name }: { form: FormInstance; name: number }) {
  const account = (Form.useWatch(["accounts", name], form) || {}) as TAccount;
  const url = account.dashboardUrl?.startsWith("http") ? account.dashboardUrl : "";
  const icon = resolveServiceIcon(account.icon, account.provider);
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-sm font-semibold text-paper-50">
        {icon ? <icon.Icon className="size-[18px]" /> : (account.provider || "?").slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-medium text-ink-950">{account.provider || "New account"}</span>
          {url && (
            <Tooltip title={`Open ${hostOf(url)}`}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${account.provider || "service"} dashboard`}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex size-6 items-center justify-center rounded-md text-stone-600 hover:bg-paper-200 hover:text-ink-950"
              >
                <LuExternalLink aria-hidden className="size-3.5" />
              </a>
            </Tooltip>
          )}
        </span>
        <span className="block truncate text-xs text-stone-600">
          {[account.login, account.projectName].filter(Boolean).join(" · ") || "No account set"}
          {account.purpose ? ` — ${account.purpose}` : ""}
        </span>
      </span>
    </span>
  );
}

function AccountPanels({
  form,
  providers,
  fields,
  add,
  remove,
}: {
  form: FormInstance;
  providers: string[];
  fields: FormListFieldData[];
  add: (value: Partial<TAccount>) => void;
  remove: (index: number) => void;
}) {
  const panels = usePanels(fields.map((field) => field.key), add);
  return (
    <div className="space-y-4">
      <Alert
        type="warning"
        showIcon
        icon={<LuShieldAlert aria-hidden />}
        title="Store which account owns what (e-mail or username), never passwords. Keep passwords in a password manager."
      />
      {fields.length > 0 && (
        <Collapse
          activeKey={panels.open}
          onChange={panels.setOpen}
          items={fields.map((field) => ({
            key: String(field.key),
            forceRender: true,
            label: <AccountHeader form={form} name={field.name} />,
            extra: (
              <span onClick={(event) => event.stopPropagation()}>
                <ConfirmDelete title="Remove this account?" onConfirm={() => remove(field.name)}>
                  <Button danger type="text" size="small" aria-label="Remove account" icon={<LuTrash2 aria-hidden />} />
                </ConfirmDelete>
              </span>
            ),
            children: (
              <>
                <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-[11rem_repeat(3,minmax(0,1fr))]">
                  <Form.Item name={[field.name, "icon"]} label="Icon">
                    <Select
                      allowClear
                      showSearch
                      placeholder="Auto"
                      optionFilterProp="title"
                      options={SERVICE_ICON_OPTIONS.map(({ value, label, Icon }) => ({
                        value,
                        title: label,
                        label: (
                          <span className="flex items-center gap-2">
                            <Icon aria-hidden className="size-4 shrink-0" />
                            {label}
                          </span>
                        ),
                      }))}
                    />
                  </Form.Item>
                  <Form.Item name={[field.name, "provider"]} label="Service" rules={[{ required: true, message: "Which service?" }]}>
                    <AutoComplete options={providers.map((value) => ({ value }))} filterOption placeholder="e.g. Vercel" />
                  </Form.Item>
                  <Form.Item name={[field.name, "login"]} label="Account (e-mail / username)">
                    <Input autoComplete="off" />
                  </Form.Item>
                  <Form.Item name={[field.name, "projectName"]} label="Project / team name">
                    <Input placeholder="e.g. AlmunProject" />
                  </Form.Item>
                </div>
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <Form.Item name={[field.name, "dashboardUrl"]} label="Dashboard link" rules={[{ type: "url", message: "Full https:// link" }]} extra="Shown as a link icon beside the service name">
                    <Input placeholder="https://vercel.com/…" />
                  </Form.Item>
                  <Form.Item name={[field.name, "purpose"]} label="What it controls">
                    <Input placeholder="e.g. Builds, env variables, serverless functions" />
                  </Form.Item>
                </div>
                <Form.Item name={[field.name, "notes"]} label="Notes" className="mb-0!">
                  <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} maxLength={1000} />
                </Form.Item>
              </>
            ),
          }))}
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-stone-600">Add:</span>
        {QUICK_ADD.map((provider) => (
          <Button key={provider} icon={<LuPlus aria-hidden />} onClick={() => panels.add({ provider })}>
            {provider}
          </Button>
        ))}
        <Button icon={<LuPlus aria-hidden />} onClick={() => panels.add({ provider: "" })}>
          Other
        </Button>
      </div>
    </div>
  );
}

export default function AccountsField({ form, providers }: { form: FormInstance; providers: string[] }) {
  return (
    <Form.List name="accounts">
      {(fields, { add, remove }) => <AccountPanels form={form} providers={providers} fields={fields} add={add} remove={remove} />}
    </Form.List>
  );
}
