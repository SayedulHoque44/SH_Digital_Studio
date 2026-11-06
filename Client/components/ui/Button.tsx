"use client";
import React, { useRef, forwardRef, useCallback } from "react";
import { ImSpinner9 } from "react-icons/im";
import { cn } from "@/lib/utils";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonStyles";

export type { ButtonSize, ButtonVariant };

// Button Props Interface
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "disabled"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  ripple?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      // The ripple effect from the original component is kept as an opt-in
      // (the new design language uses calmer micro-interactions by default).
      ripple = false,
      loading = false,
      className = "",
      children,
      leftIcon,
      rightIcon,
      onClick,
      type = "button",
      ...rest
    },
    forwardedRef,
  ) => {
    const localRef = useRef<HTMLButtonElement | null>(null);

    const setButtonRef = useCallback(
      (node: HTMLButtonElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef != null) {
          (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !loading) {
        const button = localRef.current;
        if (button) {
          const span = document.createElement("span");
          const diameter = Math.max(button.clientWidth, button.clientHeight);
          const radius = diameter / 2;
          span.style.width = span.style.height = `${diameter}px`;
          span.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
          span.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
          span.className =
            variant === "secondary" || variant === "outline" || variant === "ghost"
              ? "ripple-effect ripple-secondary"
              : "ripple-effect ripple-primary";
          button.getElementsByClassName("ripple-effect")[0]?.remove();
          button.appendChild(span);
          setTimeout(() => span.remove(), 600);
        }
      }
      if (!loading) onClick?.(e);
    };

    return (
      <button
        ref={setButtonRef}
        type={type}
        className={buttonClasses({
          variant,
          size,
          className: cn(ripple && "ripple-container overflow-hidden", className),
        })}
        onClick={handleClick}
        disabled={loading || rest.disabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && <ImSpinner9 className="animate-spin" aria-hidden />}
        {!loading && leftIcon && <span className="button-icon-left -ml-0.5 inline-flex">{leftIcon}</span>}
        {children && <span className="button-content">{children}</span>}
        {!loading && rightIcon && <span className="button-icon-right -mr-0.5 inline-flex">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
