import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const appBadgeVariants = cva(
  "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
  {
    variants: {
      variant: {
        draft: "bg-surfaceMuted text-textSecondary",
        inProgress: "bg-softBlue text-softBlueText",
        review: "bg-warningSoft text-warning",
        completed: "bg-successSoft text-success",
        success: "bg-successSoft text-success",
        warning: "bg-warningSoft text-warning",
        danger: "bg-dangerSoft text-danger",
        neutral: "bg-surfaceMuted text-textSecondary",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type AppBadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof appBadgeVariants>;

export function AppBadge({ className, variant, ...props }: AppBadgeProps) {
  return <span className={cn(appBadgeVariants({ variant }), className)} {...props} />;
}
