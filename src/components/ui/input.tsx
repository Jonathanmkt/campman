import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    // Base styles
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    "dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs",
    "outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm",
    "transition-colors",

    // Interactive states (minimal focus)
    "focus-visible:outline-none focus-visible:border-gray-500 focus-visible:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50"
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
        // Remove rings coloridos e mantém borda discreta
        "focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!shadow-none hover:border-gray-400",
        className
      )}
      {...props}
    />
  )
}

export { Input, inputVariants }
