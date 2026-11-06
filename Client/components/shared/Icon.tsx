import React from "react";
import {
  LuAccessibility,
  LuAppWindow,
  LuBadgeCheck,
  LuBriefcase,
  LuCalendarCheck,
  LuCamera,
  LuChartBar,
  LuCode,
  LuCompass,
  LuDumbbell,
  LuGauge,
  LuGlobe,
  LuGraduationCap,
  LuHouse,
  LuLayers,
  LuLayoutDashboard,
  LuLayoutTemplate,
  LuMegaphone,
  LuMonitorSmartphone,
  LuPalette,
  LuPlane,
  LuRefreshCw,
  LuRocket,
  LuScissors,
  LuSearch,
  LuShieldCheck,
  LuShoppingBag,
  LuSmartphone,
  LuSparkles,
  LuUtensils,
  LuWrench,
} from "react-icons/lu";

/*
 * Icon keys that can be chosen in the admin (services, categories, features).
 * Storing a short key instead of markup keeps content safe and portable.
 */
export const ICONS = {
  website: LuGlobe,
  redesign: LuRefreshCw,
  restaurant: LuUtensils,
  landing: LuLayoutTemplate,
  webapp: LuAppWindow,
  dashboard: LuLayoutDashboard,
  mobile: LuSmartphone,
  ecommerce: LuShoppingBag,
  booking: LuCalendarCheck,
  maintenance: LuWrench,
  gauge: LuGauge,
  devices: LuMonitorSmartphone,
  search: LuSearch,
  accessibility: LuAccessibility,
  layout: LuLayers,
  shield: LuShieldCheck,
  fitness: LuDumbbell,
  travel: LuPlane,
  photography: LuCamera,
  beauty: LuScissors,
  realestate: LuHouse,
  education: LuGraduationCap,
  briefcase: LuBriefcase,
  chart: LuChartBar,
  code: LuCode,
  compass: LuCompass,
  palette: LuPalette,
  rocket: LuRocket,
  sparkles: LuSparkles,
  megaphone: LuMegaphone,
  check: LuBadgeCheck,
} as const;

export type TIconKey = keyof typeof ICONS;

export const ICON_KEYS = Object.keys(ICONS) as TIconKey[];

export default function Icon({
  name,
  className,
  fallback = "sparkles",
}: {
  name?: string;
  className?: string;
  fallback?: TIconKey;
}) {
  const Component = ICONS[(name as TIconKey) || fallback] || ICONS[fallback];
  return <Component aria-hidden className={className} />;
}
