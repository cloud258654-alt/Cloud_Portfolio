import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const appCardVariants = cva("rounded-radius-lg border p-6", {
  variants: {
    variant: {
      default: "border-border bg-surface shadow-soft",
      glass: "border-white/70 bg-white/70 shadow-glass backdrop-blur-xl",
      wood: "border-warmWood bg-warmWood/45 shadow-soft",
      outline: "border-border bg-transparent",
      premium: "border-dark bg-dark text-white shadow-floating",
      prompt: "border-softBlue bg-gradient-to-br from-white to-softBlue/45 shadow-soft",
      timeline:
        "border-border bg-surface shadow-soft before:mb-5 before:block before:h-1 before:w-16 before:rounded-full before:bg-toyotaRed",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type AppCardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof appCardVariants>;

export function AppCard({ className, variant, ...props }: AppCardProps) {
  return <div className={cn(appCardVariants({ variant }), className)} {...props} />;
}
