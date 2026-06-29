import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const appButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-radius-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-toyotaRed disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-toyotaRed text-white shadow-soft hover:bg-danger",
        secondary: "bg-surfaceMuted text-textPrimary hover:bg-warmWood",
        ghost: "bg-transparent text-textSecondary hover:bg-surfaceMuted hover:text-textPrimary",
        danger: "bg-danger text-white shadow-soft hover:bg-red-700",
        success: "bg-success text-white shadow-soft hover:bg-green-700",
        outline: "border border-border bg-surface text-textPrimary hover:bg-surfaceMuted",
        premium: "bg-dark text-white shadow-floating hover:bg-textPrimary/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
        xl: "h-14 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type AppButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof appButtonVariants> & {
    href?: string;
  };

export function AppButton({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: AppButtonProps) {
  const classes = cn(appButtonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
