import React from "react";
import { cn } from "@/lib/utils";

interface IContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}

const widths = {
  narrow: "max-w-[880px]",
  default: "max-w-[1360px]",
  wide: "max-w-[1600px]",
};

// Fluid side gutters: 16px on phones, growing to 48px on large screens.
const Container: React.FC<IContainerProps> = ({ children, className, size = "default" }) => {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12", widths[size], className)}>
      {children}
    </div>
  );
};

export default Container;
