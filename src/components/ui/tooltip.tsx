import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Popup>,
  TooltipPrimitive.Popup.Props &
    Pick<
      TooltipPrimitive.Positioner.Props,
      "align" | "alignOffset" | "side" | "sideOffset"
    >
>(({ className, align, alignOffset, side, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className="isolate z-50"
    >
      <TooltipPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 origin-(--transform-origin) overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-[opacity,transform] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
