"use client";

import { useState } from "react";

/**
 * Open state for a Collapse over a Form.List: panels start closed (also
 * when the saved data loads in), and a panel you add with `add()` opens so
 * you can fill it in.
 */
export function usePanels<T>(keys: number[], listAdd: (value: T) => void) {
  const [known, setKnown] = useState<number[]>(keys);
  const [open, setOpen] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  if (known.length !== keys.length || keys.some((key) => !known.includes(key))) {
    const added = keys.filter((key) => !known.includes(key)).map(String);
    setKnown(keys);
    if (adding && added.length) {
      setOpen([...open, ...added]);
      setAdding(false);
    }
  }
  return {
    open,
    setOpen: (next: string | string[]) => setOpen(Array.isArray(next) ? next : [next]),
    add: (value: T) => {
      setAdding(true);
      listAdd(value);
    },
  };
}
