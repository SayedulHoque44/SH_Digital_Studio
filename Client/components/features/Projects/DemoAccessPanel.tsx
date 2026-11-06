import { LuArrowUpRight, LuKeyRound, LuTriangleAlert } from "react-icons/lu";
import CopyButton from "@/components/shared/CopyButton";
import type { IProjectDetail } from "@/features/Public/interface/public.interface";

/**
 * "Try the live application" panel. Only rendered when the admin enabled
 * public demo access for this project - the API omits these fields
 * otherwise. These must always be dedicated sandbox credentials.
 */
export default function DemoAccessPanel({
  access,
  appUrl,
  title,
}: {
  access: NonNullable<IProjectDetail["demoAccess"]>;
  appUrl?: string;
  title: string;
}) {
  const loginUrl = access.loginUrl || appUrl;
  return (
    <section
      aria-labelledby="demo-access-heading"
      className="surface-dark rounded-[1.75rem] bg-ink-950 p-7 text-paper-50 ring-1 ring-white/10 sm:p-9"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-contrast">
          <LuKeyRound aria-hidden className="size-5" />
        </span>
        <h2 id="demo-access-heading" className="font-display text-xl font-semibold tracking-[-0.02em]">
          Try the live application
        </h2>
      </div>

      <dl className="mt-7 space-y-4">
        {access.username && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10">
            <div>
              <dt className="text-eyebrow text-ink-400">Demo login</dt>
              <dd className="mt-1 break-all font-mono text-[0.95rem]">{access.username}</dd>
            </div>
            <CopyButton value={access.username} label="Copy login" tone="dark" size="sm" />
          </div>
        )}
        {access.password && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10">
            <div>
              <dt className="text-eyebrow text-ink-400">Password / PIN</dt>
              <dd className="mt-1 break-all font-mono text-[0.95rem]">{access.password}</dd>
            </div>
            <CopyButton value={access.password} label="Copy password" tone="dark" size="sm" />
          </div>
        )}
      </dl>

      {access.instructions && <p className="mt-5 whitespace-pre-line leading-relaxed text-ink-200">{access.instructions}</p>}

      {loginUrl && (
        <a
          href={loginUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-contrast hover:brightness-95"
        >
          Open {title}
          <LuArrowUpRight aria-hidden className="size-4" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}

      <p className="mt-6 flex gap-2.5 text-sm leading-relaxed text-ink-300">
        <LuTriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
        <span>
          This is a shared demo environment with sample data. Some features may be limited and data may be reset at
          any time — please don&apos;t enter personal information.
          {access.limitations ? ` ${access.limitations}` : ""}
        </span>
      </p>
    </section>
  );
}
