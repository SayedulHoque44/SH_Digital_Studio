"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

/*
 * Unsaved-changes protection for admin editors:
 * - warns before closing/reloading the tab (beforeunload)
 * - intercepts clicks on internal links while a form is dirty
 * - exposes `navigate()` for programmatic navigation with the same check
 */

type TContext = {
  setDirty: (dirty: boolean) => void;
  isDirty: () => boolean;
  navigate: (href: string) => void;
};

const UnsavedContext = createContext<TContext | null>(null);
const MESSAGE = "You have unsaved changes. Leave this page and discard them?";

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dirtyRef = useRef(false);

  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (dirtyRef.current && !window.confirm(MESSAGE)) return;
      dirtyRef.current = false;
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = MESSAGE;
    };
    // Capture-phase listener so it runs before Next's <Link> handler
    const onClick = (event: MouseEvent) => {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor || anchor.target === "_blank" || !anchor.href) return;
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (!window.confirm(MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        dirtyRef.current = false;
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  const value = useMemo(() => ({ setDirty, isDirty: () => dirtyRef.current, navigate }), [setDirty, navigate]);
  return <UnsavedContext.Provider value={value}>{children}</UnsavedContext.Provider>;
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedContext);
  if (!context) throw new Error("useUnsavedChanges must be used inside UnsavedChangesProvider");
  return context;
}
