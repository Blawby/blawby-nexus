"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  SelectPrimitive.Trigger.Props
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon render={<ChevronDown className="h-4 w-4 opacity-50" />} />
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpArrow>,
  SelectPrimitive.ScrollUpArrow.Props
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpArrow
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpArrow>
))
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownArrow>,
  SelectPrimitive.ScrollDownArrow.Props
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownArrow
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownArrow>
))
SelectScrollDownButton.displayName = "SelectScrollDownButton"

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Popup>,
  SelectPrimitive.Popup.Props &
    Pick<
      SelectPrimitive.Positioner.Props,
      "align" | "alignItemWithTrigger" | "alignOffset" | "side" | "sideOffset"
    >
>(({ className, children, align = "start", alignItemWithTrigger = false, alignOffset, side, sideOffset = 4, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      align={align}
      alignItemWithTrigger={alignItemWithTrigger}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
    >
      <SelectPrimitive.Popup
        ref={ref}
        className={cn(
          "relative z-50 max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md transition-[opacity,transform] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.List className="p-1">
        {children}
        </SelectPrimitive.List>
        <SelectScrollDownButton />
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.GroupLabel>,
  SelectPrimitive.GroupLabel.Props
>(({ className, ...props }, ref) => (
  <SelectPrimitive.GroupLabel
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  SelectPrimitive.Item.Props
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemIndicator render={<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center" />}>
        <Check className="h-4 w-4" />
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText className="shrink-0 whitespace-nowrap">
      {children}
    </SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
