"use client";

import { useEffect, useRef } from "react";

/**
 * Progressive enhancement for GET filter forms: submits the surrounding form
 * when a <select> changes (and after a short pause while typing a search).
 * Without JavaScript the form still works with its submit button.
 */
export default function AutoSubmit() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const form = marker.current?.closest("form");
    if (!form) return;
    let timer: ReturnType<typeof setTimeout>;

    const onChange = (event: Event) => {
      if ((event.target as HTMLElement).tagName === "SELECT") form.requestSubmit();
    };
    const onInput = (event: Event) => {
      if ((event.target as HTMLInputElement).type !== "search") return;
      clearTimeout(timer);
      timer = setTimeout(() => form.requestSubmit(), 550);
    };

    form.addEventListener("change", onChange);
    form.addEventListener("input", onInput);
    return () => {
      clearTimeout(timer);
      form.removeEventListener("change", onChange);
      form.removeEventListener("input", onInput);
    };
  }, []);

  return <span ref={marker} hidden />;
}
