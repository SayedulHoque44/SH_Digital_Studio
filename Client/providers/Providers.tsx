"use client";

import React from "react";
import { Toaster } from "sonner";
import TanstackProvider from "./TanstackProvider";

/**
 * Client providers for interactive areas (the admin dashboard). Public pages
 * are server-rendered and do not load these, which keeps their JavaScript
 * small; the contact form wraps itself in TanstackProvider only.
 */
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TanstackProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </TanstackProvider>
  );
};

export default Providers;
