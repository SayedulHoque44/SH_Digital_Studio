"use client";

import { Badge, Button, Drawer, Dropdown, Grid, Layout, Menu, Result } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  LuBriefcase,
  LuContact,
  LuExternalLink,
  LuFolderKanban,
  LuImage,
  LuInbox,
  LuLayoutDashboard,
  LuLayers,
  LuLogOut,
  LuMenu,
  LuSettings,
  LuUserRound,
  LuUserRoundCog,
} from "react-icons/lu";
import { Logo } from "@/components/brand/Logo";
import AdminHooks from "@/features/Admin/hooks/admin.hooks";
import { errorToast } from "@/utils/toast";
import { AdminShellSkeleton } from "./Skeletons";
import { UnsavedChangesProvider, useUnsavedChanges } from "./UnsavedChanges";

const { Sider, Header, Content } = Layout;

const NAV = [
  { key: "/admin", label: "Dashboard", icon: LuLayoutDashboard },
  { key: "/admin/projects", label: "Projects", icon: LuFolderKanban },
  { key: "/admin/categories", label: "Categories", icon: LuLayers },
  { key: "/admin/services", label: "Services", icon: LuBriefcase },
  { key: "/admin/inquiries", label: "Inquiries", icon: LuInbox },
  { key: "/admin/clients", label: "Clients", icon: LuContact },
  { key: "/admin/media", label: "Media library", icon: LuImage },
  { key: "/admin/profile", label: "Profile & about", icon: LuUserRound },
  { key: "/admin/settings", label: "Site settings", icon: LuSettings },
];

const activeKey = (pathname: string) =>
  NAV.filter((item) => item.key !== "/admin")
    .map((item) => item.key)
    .find((key) => pathname.startsWith(key)) || (pathname === "/admin" ? "/admin" : "");

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  // The drawer remembers the page it was opened on, so navigating closes it
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const drawerOpen = drawerPath === pathname;
  const setDrawerOpen = (open: boolean) => setDrawerPath(open ? pathname : null);
  const { navigate } = useUnsavedChanges();

  const me = AdminHooks.useMe();
  // Wait for a confirmed session, so signed-out visitors only trigger the session check
  const dashboard = AdminHooks.useDashboard(!!me.data);
  const logout = AdminHooks.useLogout();


  const newInquiries = dashboard.data?.inquiries.new || 0;
  // Client renewals that are overdue or inside their reminder window
  const overdueRenewals = dashboard.data?.renewals?.overdue || 0;
  const renewalAlerts = overdueRenewals + (dashboard.data?.renewals?.dueSoon || 0);

  const menuItems = useMemo(
    () =>
      NAV.map((item) => ({
        key: item.key,
        icon: <item.icon aria-hidden className="size-[18px]" />,
        label:
          item.key === "/admin/inquiries" && newInquiries > 0 ? (
            <span className="flex items-center justify-between gap-2">
              {item.label}
              <Badge count={newInquiries} size="small" color="#c8f25c" style={{ color: "#0a0b0d" }} />
            </span>
          ) : item.key === "/admin/clients" && renewalAlerts > 0 ? (
            <span className="flex items-center justify-between gap-2" title={`${renewalAlerts} renewal(s) need attention`}>
              {item.label}
              <Badge count={renewalAlerts} size="small" color={overdueRenewals ? "red" : "gold"} />
            </span>
          ) : (
            item.label
          ),
      })),
    [newInquiries, renewalAlerts, overdueRenewals],
  );

  const handleLogout = async () => {
    try {
      await logout.mutateAsync(undefined);
    } catch (error) {
      errorToast({ error });
    } finally {
      router.replace("/admin/login");
    }
  };

  // The whole shell (and the current screen) as a skeleton while the session is checked
  if (me.isLoading) return <AdminShellSkeleton pathname={pathname} />;

  if (me.isError || !me.data) {
    // 401 is redirected to the login page by the API client; anything else
    // (API down, network) gets a clear retry screen.
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper-100 p-6">
        <Result
          status="warning"
          title="The admin API is not reachable"
          subTitle="Check that the API server is running, then try again."
          extra={
            <Button type="primary" onClick={() => me.refetch()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex h-16 items-center px-6" onClick={(event) => {
        event.preventDefault();
        navigate("/admin");
      }}>
        <Logo tone="light" size="sm" />
      </Link>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeKey(pathname)]}
        items={menuItems}
        onClick={({ key }) => navigate(String(key))}
        className="flex-1 border-none px-2"
      />
      <div className="space-y-1 border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-300 hover:bg-white/5 hover:text-paper-50"
        >
          <LuExternalLink aria-hidden className="size-4" /> View website
        </a>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-dvh">
      {isMobile ? (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          size={280}
          styles={{ body: { padding: 0, background: "#0a0b0d" }, header: { display: "none" } }}
        >
          {sidebar}
        </Drawer>
      ) : (
        <Sider width={248} className="!fixed inset-y-0 left-0 z-20 overflow-y-auto">
          {sidebar}
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : 248 }}>
        <Header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-paper-300/70 !px-4 backdrop-blur sm:!px-8">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                type="text"
                aria-label="Open navigation"
                icon={<LuMenu aria-hidden className="size-5" />}
                onClick={() => setDrawerOpen(true)}
              />
            )}
            <span className="hidden text-sm text-stone-600 sm:inline">SH Digital Studio · Content manager</span>
          </div>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                { key: "account", icon: <LuUserRoundCog aria-hidden />, label: "Account & security", onClick: () => navigate("/admin/account") },
                { type: "divider" },
                { key: "logout", icon: <LuLogOut aria-hidden />, label: "Sign out", danger: true, onClick: handleLogout },
              ],
            }}
          >
            <Button type="text" className="!h-10">
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-ink-950 text-xs font-semibold text-paper-50">
                  {me.data.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-medium">{me.data.name}</span>
                  <span className="block text-xs text-stone-600">{me.data.email}</span>
                </span>
              </span>
            </Button>
          </Dropdown>
        </Header>
        <Content className="px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <UnsavedChangesProvider>
      <ShellInner>{children}</ShellInner>
    </UnsavedChangesProvider>
  );
}
