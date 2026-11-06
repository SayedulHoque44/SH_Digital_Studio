"use client";

import { Alert, Button, Form, Input } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LuLock, LuMail } from "react-icons/lu";
import { Logo } from "@/components/brand/Logo";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import { apiErrorMessage } from "@/lib/api";
import { safeInternalPath } from "@/lib/site";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = AdminHooks.useLogin();
  // Already signed in? Skip the form.
  const me = AdminHooks.useMe();
  const [error, setError] = useState<string | null>(null);

  // Only internal admin paths are accepted as the post-login destination
  const nextParam = safeInternalPath(searchParams.get("next"), "/admin");
  const next = nextParam.startsWith("/admin") && !nextParam.startsWith("/admin/login") ? nextParam : "/admin";
  const expired = searchParams.get("expired") === "1";

  useEffect(() => {
    if (me.data) router.replace(next);
  }, [me.data, next, router]);

  const onFinish = async (values: { email: string; password: string }) => {
    setError(null);
    try {
      await login.mutateAsync(values);
      router.replace(next);
    } catch (err) {
      setError(apiErrorMessage(err, "Sign-in failed. Please try again."));
    }
  };

  return (
    <div className="surface-dark relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-4 py-16">
      <div aria-hidden className="bg-grid-ink pointer-events-none absolute inset-0 opacity-70 mask-fade-y" />
      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Logo tone="light" size="md" />
        </div>
        <div className="rounded-3xl bg-paper-50 p-8 shadow-2xl ring-1 ring-white/10 sm:p-10">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.025em] text-ink-950">Sign in to the studio</h1>
          <p className="mt-2 text-sm text-stone-600">Manage projects, pages, settings and inquiries.</p>

          {expired && !error && (
            <Alert className="!mt-6" type="info" showIcon title="Your session ended. Please sign in again." />
          )}
          {error && <Alert className="!mt-6" type="error" showIcon title={error} role="alert" />}

          <Form layout="vertical" requiredMark={false} onFinish={onFinish} className="!mt-6" disabled={login.isLoading}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Enter your email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input size="large" prefix={<LuMail aria-hidden className="text-stone-500" />} autoComplete="username" autoFocus />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: "Enter your password" }]}>
              <Input.Password size="large" prefix={<LuLock aria-hidden className="text-stone-500" />} autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={login.isLoading}>
              Sign in
            </Button>
          </Form>
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">
          Admin accounts are created with <code className="text-ink-300">npm run seed:admin</code> on the server.
        </p>
      </div>
    </div>
  );
}
