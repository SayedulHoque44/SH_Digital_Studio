"use client";

import { Input } from "antd";

// Edits a string[] as a textarea with one item per line.
export default function LinesInput({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Input.TextArea
      value={(value || []).join("\n")}
      onChange={(event) =>
        onChange?.(
          event.target.value
            .split("\n")
            .map((line) => line.replace(/^\s*[-•]\s*/, ""))
            .filter((line, index, all) => line.trim() || index === all.length - 1),
        )
      }
      onBlur={() => onChange?.((value || []).map((line) => line.trim()).filter(Boolean))}
      autoSize={{ minRows: rows, maxRows: 12 }}
      placeholder={placeholder || "One item per line"}
    />
  );
}
