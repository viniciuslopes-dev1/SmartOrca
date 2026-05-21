import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border font-semibold tracking-[0.01em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variant === "primary" && "border-primary bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:brightness-95",
          variant === "secondary" && "border-border bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:bg-slate-100",
          variant === "ghost" && "border-transparent bg-transparent text-slate-700 hover:bg-slate-100",
          variant === "danger" && "border-destructive bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-0.5 hover:brightness-95",
          size === "sm" && "h-9 px-3.5 text-xs",
          size === "md" && "h-10 px-4 text-sm",
          size === "icon" && "h-9 w-9 p-0",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
