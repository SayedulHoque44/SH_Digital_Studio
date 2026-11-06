import Link from "next/link";
import React from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { isExternalHref } from "@/lib/site";
import { cn } from "@/lib/utils";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonStyles";

type TButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // External links open in a new tab with an explicit "leaves the site" cue
  external?: boolean;
  prefetch?: boolean;
  "aria-label"?: string;
};

/**
 * Link styled as a button. Works in server components. External http(s)
 * links automatically open in a new tab with rel="noopener noreferrer" and
 * an arrow icon plus screen-reader text, so visitors know they are leaving.
 */
export default function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  leftIcon,
  rightIcon,
  external,
  prefetch,
  ...rest
}: TButtonLinkProps) {
  const isExternal = external ?? isExternalHref(href);
  const classes = buttonClasses({ variant, size, className: cn("group/btn", className) });

  const content = (
    <>
      {leftIcon && <span className="-ml-0.5 inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon ??
        (isExternal ? (
          <FiArrowUpRight
            aria-hidden
            className="-mr-1 size-[1.05em] transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
          />
        ) : null)}
      {isExternal && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} prefetch={prefetch} className={classes} {...rest}>
      {content}
    </Link>
  );
}
