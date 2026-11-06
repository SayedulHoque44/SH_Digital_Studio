"use client";

import { App, Button, Card, Descriptions, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LuKeyRound, LuLogOut, LuSave } from "react-icons/lu";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import PageHeader from "../PageHeader";

// Mirrors the server rule (admin.validation.ts) so mistakes show before submitting
const PASSWORD_MIN_LENGTH = 12;

export default function AccountSettings() {
  const router = useRouter();
  const { modal } = App.useApp();
  const me = AdminHooks.useMe();
  const updateMe = AdminHooks.useUpdateMe();
  const changePassword = AdminHooks.useChangePassword();
  const logoutEverywhere = AdminHooks.useLogoutEverywhere();
  const [profileForm] = Form.useForm<{ name: string }>();
  const [passwordForm] = Form.useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>();

  useEffect(() => {
    if (me.data) profileForm.setFieldsValue({ name: me.data.name });
  }, [me.data, profileForm]);

  const onChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      // The server re-issues this session's cookie and revokes every other session
      await changePassword.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      passwordForm.resetFields();
    } catch {
      // error toast is shown by the hook
    }
  };

  const confirmLogoutEverywhere = () =>
    modal.confirm({
      title: "Sign out of every device?",
      content: "All active sessions, including this one, will end. You will need to sign in again.",
      okText: "Sign out everywhere",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await logoutEverywhere.mutateAsync(undefined);
        } finally {
          router.replace("/admin/login");
        }
      },
    });

  return (
    <>
      <PageHeader title="Account & security" description="Your sign-in details for this dashboard. These are never shown on the public website." />
      <div className="grid max-w-3xl gap-6">
        <Card title="Account">
          <Descriptions column={1} size="small" className="mb-6">
            <Descriptions.Item label="Sign-in email">{me.data?.email}</Descriptions.Item>
            <Descriptions.Item label="Role">{me.data?.role === "owner" ? "Owner" : "Editor"}</Descriptions.Item>
            {me.data?.lastLoginAt && (
              <Descriptions.Item label="Last sign-in">
                {new Date(me.data.lastLoginAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </Descriptions.Item>
            )}
          </Descriptions>
          <Form form={profileForm} layout="vertical" requiredMark="optional" onFinish={(values) => updateMe.mutate(values)}>
            <Form.Item name="name" label="Display name" rules={[{ required: true, whitespace: true, min: 2, max: 80 }]}>
              <Input autoComplete="name" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={updateMe.isLoading} icon={<LuSave aria-hidden />}>
              Save
            </Button>
          </Form>
          <p className="mt-4 text-xs text-stone-500">
            To change the sign-in email, run <code className="font-mono">npm run seed:admin</code> on the server (see Server/README.md).
          </p>
        </Card>

        <Card title="Change password">
          <Form form={passwordForm} layout="vertical" requiredMark={false} onFinish={onChangePassword}>
            <Form.Item name="currentPassword" label="Current password" rules={[{ required: true, message: "Enter your current password" }]}>
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New password"
              extra={`At least ${PASSWORD_MIN_LENGTH} characters with letters and numbers. A long passphrase is best.`}
              dependencies={["currentPassword"]}
              rules={[
                { required: true, message: "Enter a new password" },
                { min: PASSWORD_MIN_LENGTH, message: `Use at least ${PASSWORD_MIN_LENGTH} characters` },
                { max: 128 },
                {
                  validator: (_, value?: string) =>
                    !value || (/[a-zA-Z]/.test(value) && /\d/.test(value))
                      ? Promise.resolve()
                      : Promise.reject(new Error("Include both letters and numbers")),
                },
                ({ getFieldValue }) => ({
                  validator: (_, value?: string) =>
                    !value || value !== getFieldValue("currentPassword")
                      ? Promise.resolve()
                      : Promise.reject(new Error("Choose a password different from the current one")),
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm new password"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Repeat the new password" },
                ({ getFieldValue }) => ({
                  validator: (_, value?: string) =>
                    !value || value === getFieldValue("newPassword") ? Promise.resolve() : Promise.reject(new Error("Passwords do not match")),
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={changePassword.isLoading} icon={<LuKeyRound aria-hidden />}>
              Update password
            </Button>
            <p className="mt-3 text-xs text-stone-500">Updating your password signs out every other device.</p>
          </Form>
        </Card>

        <Card title="Sessions">
          <p className="mb-4 text-sm text-stone-600">
            Lost a device or signed in somewhere public? End every active session at once.
          </p>
          <Button danger icon={<LuLogOut aria-hidden />} loading={logoutEverywhere.isLoading} onClick={confirmLogoutEverywhere}>
            Sign out everywhere
          </Button>
        </Card>
      </div>
    </>
  );
}
