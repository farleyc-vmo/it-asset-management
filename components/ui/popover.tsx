"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import * as React from "react";

import { cn } from "@/lib/utils";

function Popover({
  children,
  ...props
}: PopoverPrimitive.Root.Props & {
  children: React.ReactNode;
}) {
  return (
    <PopoverPrimitive.Root data-slot="popover" {...props}>
      {children}
    </PopoverPrimitive.Root>
  );
}

function PopoverTrigger({
  className,
  ...props
}: PopoverPrimitive.Trigger.Props & {
  className?: string;
}) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn(className)}
      {...props}
    />
  );
}

function PopoverContent({
  className,
  sideOffset = 8,
  ...props
}: PopoverPrimitive.Popup.Props & {
  className?: string;
  sideOffset?: number;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner>
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          sideOffset={sideOffset}
          className={cn(
            "z-50 w-72 rounded-xl border bg-popover p-4 text-popover-foreground shadow-md",
            "origin-(--transform-origin) transition-[transform,opacity] duration-150",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { Popover, PopoverContent, PopoverProvider, PopoverTrigger };
