import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/supabase/utils"
import { getInteractionClasses } from "@/lib/design-tokens"

const inputVariants = cva(
  [
    // Base styles
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    "dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs", 
    "outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm",
    
    // Interactive states from design tokens
    getInteractionClasses('input', ['default', 'hover', 'focus', 'disabled'])
  ].join(' '),
  {
    variants: {
      state: {
        default: "",
        error: "!border-destructive !ring-destructive/20 dark:!ring-destructive/40",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
)

function Input({ 
  className, 
  type, 
  state,
  ...props 
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ state }),
        // Adicional !important para garantir maior especificidade
        "focus-visible:!border-primary focus-visible:!ring-primary/50 focus-visible:!ring-[3px] hover:!border-primary",
        className
      )}
      {...props}
    />
  )
}

export { Input, inputVariants }
