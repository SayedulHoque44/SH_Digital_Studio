"use client";

import CopyButton from "@/components/shared/CopyButton";

/**
 * Read-only plain-text summary with a Copy button, for sending to a client.
 * Built from the form's current values, so unsaved edits show up too.
 */
export default function StatementBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-3 rounded-xl bg-paper-50 ring-1 ring-paper-300/70">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-200 px-3 py-2">
        <span className="text-sm font-medium text-ink-900">{title}</span>
        <CopyButton value={text} label="Copy text" size="sm" />
      </div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap px-3 py-2.5 font-sans text-[13px] leading-relaxed text-ink-800 wrap-anywhere">
        {text}
      </pre>
    </div>
  );
}
