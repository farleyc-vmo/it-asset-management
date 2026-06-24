"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

function Tooltip({
  children,
  delay = 100,
  ...props
}: TooltipPrimitive.Root.Props & {
  delay?: number;
}) {
  return (
    <TooltipPrimitive.Root data-slot="tooltip" delay={delay} {...props}>
      {children}
    </TooltipPrimitive.Root>
  );
}

function TooltipTrigger({
  className,
  ...props
}: TooltipPrimitive.Trigger.Props & {
  className?: string;
}) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      className={cn(className)}
      {...props}
    />
  );
}

function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: TooltipPrimitive.Popup.Props & {
  className?: string;
  sideOffset?: number;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          sideOffset={sideOffset}
          className={cn(
            "z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
            "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
