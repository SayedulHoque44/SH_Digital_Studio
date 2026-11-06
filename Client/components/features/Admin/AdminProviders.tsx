"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import React from "react";
import Providers from "@/providers/Providers";

/**
 * Ant Design is only loaded for /admin (the public site uses lightweight
 * Tailwind components). The theme maps the brand tokens onto antd: ink as
 * the primary colour (white text on dark buttons keeps contrast), warm paper
 * surfaces and the Geist UI font.
 */
export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          // A fixed key: the default is derived from useId(), which produced a
          // different class name on the server and in the browser (hydration warning)
          cssVar: { key: "shds-admin" },
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#111316",
            colorLink: "#111316",
            colorInfo: "#3d7cf5",
            colorSuccess: "#2f9e6b",
            colorWarning: "#d99a1e",
            colorError: "#e5484d",
            colorBgLayout: "#f4f1ea",
            colorBorder: "#ddd6c7",
            colorBorderSecondary: "#ebe6db",
            borderRadius: 10,
            fontFamily: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
            fontSize: 14,
            controlHeight: 38,
          },
          components: {
            Layout: { siderBg: "#0a0b0d", headerBg: "#fbfaf6", bodyBg: "#f4f1ea" },
            Menu: {
              darkItemBg: "#0a0b0d",
              darkSubMenuItemBg: "#0a0b0d",
              darkItemSelectedBg: "#1b1e22",
              darkItemSelectedColor: "#fbfaf6",
              darkItemColor: "#9ba1a9",
              darkItemHoverColor: "#fbfaf6",
            },
            Card: { borderRadiusLG: 16 },
            Table: { headerBg: "#f4f1ea", borderColor: "#ebe6db" },
            Tabs: { inkBarColor: "#111316", itemSelectedColor: "#111316" },
          },
        }}
      >
        <AntdApp>
          <Providers>{children}</Providers>
        </AntdApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
