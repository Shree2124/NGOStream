import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        upcoming:
          "border-transparent bg-[#5DADE2] text-[#154360] hover:bg-[#3498DB]",
        happening:
          "border-transparent bg-[#58D68D] text-[#145A32] hover:bg-[#28B463]",
        completed:
          "border-transparent bg-[#5D6D7E] text-[#FFFFFF] hover:bg-[#34495E]",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "upcoming",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
