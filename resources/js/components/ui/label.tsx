import * as LabelPrimitive from "@radix-ui/react-label"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  requirement?: 'optional' | 'required';
}

function Label({
  className,
  children,
  requirement,
  ...props
}: LabelProps) { 
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-1.5 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      
      {/* 3. Logika untuk render badge */}
      {requirement === 'optional' && (
        <span className="rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-normal tracking-wide text-muted-foreground uppercase leading-none">
          Optional
        </span>
      )}
      {requirement === 'required' && (
        <span className="text-destructive font-bold">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  )
}

export { Label }