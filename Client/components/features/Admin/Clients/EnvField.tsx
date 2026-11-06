"use client";

import { Alert, Button, Collapse, Form, Input, Tooltip } from "antd";
import type { FormInstance, FormListFieldData } from "antd";
import { useState } from "react";
import { LuCopy, LuEye, LuEyeOff, LuKeyRound, LuLock, LuPlus, LuTrash2 } from "react-icons/lu";
import type { IClientProject } from "@/features/Admin/interface/admin.interface";
import { errorToast, successToast } from "@/utils/toast";
import ConfirmDelete from "../fields/ConfirmDelete";
import { usePanels } from "./usePanels";

type TEnvSet = NonNullable<IClientProject["envSets"]>[number];

const copy = async (text: string) => {
  if (!text) return errorToast("Nothing to copy");
  try {
    await navigator.clipboard.writeText(text);
    successToast(".env copied");
  } catch (error) {
    errorToast({ error });
  }
};

// KEY=VALUE lines, ignoring comments and blank lines
const countVars = (content = "") => content.split(/\r?\n/).filter((line) => /^\s*(export\s+)?[A-Za-z_][\w.-]*\s*=/.test(line)).length;

function SetHeader({ form, name }: { form: FormInstance; name: number }) {
  const set = (Form.useWatch(["envSets", name], form) || {}) as TEnvSet;
  const count = countVars(set.content);
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-paper-200 text-ink-900">
        <LuKeyRound className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-ink-950">{set.label || "New env set"}</span>
        <span className="block truncate text-xs text-stone-600">
          {count} variable{count === 1 ? "" : "s"}
          {set.note ? ` · ${set.note}` : ""}
        </span>
      </span>
    </span>
  );
}

// The whole .env in one box, hidden until "Show" (values are secrets)
function ContentBox({ form, name }: { form: FormInstance; name: number }) {
  const [shown, setShown] = useState(false);
  const content = (Form.useWatch(["envSets", name, "content"], form) || "") as string;
  const lines = content ? content.split(/\r?\n/).length : 0;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink-900">.env content</span>
        <span className="flex gap-2">
          <Button size="small" icon={shown ? <LuEyeOff aria-hidden /> : <LuEye aria-hidden />} onClick={() => setShown(!shown)}>
            {shown ? "Hide" : "Show"}
          </Button>
          <Button size="small" icon={<LuCopy aria-hidden />} onClick={() => copy(content)}>
            Copy all
          </Button>
        </span>
      </div>
      <Form.Item name={[name, "content"]} hidden={!shown} className="mb-0!">
        <Input.TextArea
          autoSize={{ minRows: 10, maxRows: 30 }}
          maxLength={50000}
          className="font-mono text-[13px]!"
          spellCheck={false}
          autoComplete="off"
          placeholder={"# Paste the whole .env file here\nMONGODB_URL=mongodb+srv://…\nJWT_ACCESS_SECRET=…"}
        />
      </Form.Item>
      {!shown && (
        <button
          type="button"
          onClick={() => setShown(true)}
          className="flex w-full flex-col items-center justify-center gap-1 rounded-xl bg-paper-100 px-4 py-8 text-sm text-stone-600 ring-1 ring-paper-300 hover:bg-paper-200"
        >
          <LuLock aria-hidden className="size-5" />
          {lines ? `${lines} line${lines === 1 ? "" : "s"} hidden — click to show and edit` : "Empty — click to paste your .env"}
        </button>
      )}
    </div>
  );
}

function EnvPanels({
  form,
  fields,
  add,
  remove,
  locked,
}: {
  form: FormInstance;
  fields: FormListFieldData[];
  add: (value: Partial<TEnvSet>) => void;
  remove: (index: number) => void;
  locked: boolean;
}) {
  const panels = usePanels(fields.map((field) => field.key), add);

  if (locked) {
    return (
      <Alert
        type="error"
        showIcon
        icon={<LuLock aria-hidden />}
        title="Env values are locked"
        description="They are stored encrypted, and the server can't decrypt them: DATA_ENCRYPTION_KEY is missing or different from the one used to save them. Saving this project keeps the stored values unchanged."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Alert
        type="info"
        showIcon
        icon={<LuLock aria-hidden />}
        title="Encrypted before it is stored, hidden until you click Show, and never included in the Clients list. Only signed-in admins can see it."
      />
      {fields.length > 0 && (
        <Collapse
          activeKey={panels.open}
          onChange={panels.setOpen}
          items={fields.map((field) => ({
            key: String(field.key),
            forceRender: true,
            label: <SetHeader form={form} name={field.name} />,
            extra: (
              <span className="flex gap-1" onClick={(event) => event.stopPropagation()}>
                <Tooltip title="Copy all">
                  <Button type="text" size="small" aria-label="Copy .env" icon={<LuCopy aria-hidden />} onClick={() => copy(form.getFieldValue(["envSets", field.name, "content"]) || "")} />
                </Tooltip>
                <ConfirmDelete title="Delete this env set?" onConfirm={() => remove(field.name)}>
                  <Button danger type="text" size="small" aria-label="Delete env set" icon={<LuTrash2 aria-hidden />} />
                </ConfirmDelete>
              </span>
            ),
            children: (
              <>
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <Form.Item name={[field.name, "label"]} label="Label" rules={[{ required: true, message: "Name this set" }]}>
                    <Input placeholder="e.g. Server — production (Vercel)" />
                  </Form.Item>
                  <Form.Item name={[field.name, "note"]} label="Note">
                    <Input placeholder="e.g. Same as Vercel → Settings → Environment Variables" maxLength={300} />
                  </Form.Item>
                </div>
                <ContentBox form={form} name={field.name} />
              </>
            ),
          }))}
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-stone-600">Add:</span>
        {["Client (frontend)", "Server (backend)"].map((label) => (
          <Button key={label} icon={<LuPlus aria-hidden />} onClick={() => panels.add({ label, content: "" })}>
            {label}
          </Button>
        ))}
        <Button icon={<LuPlus aria-hidden />} onClick={() => panels.add({ label: "", content: "" })}>
          Other
        </Button>
      </div>
    </div>
  );
}

export function EnvField({ form, locked }: { form: FormInstance; locked: boolean }) {
  return (
    <Form.List name="envSets">
      {(fields, { add, remove }) => <EnvPanels form={form} fields={fields} add={add} remove={remove} locked={locked} />}
    </Form.List>
  );
}
