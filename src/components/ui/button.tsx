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
          "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variant === "primary" && "border-primary bg-primary text-primary-foreground hover:bg-sky-900",
          variant === "secondary" && "border-border bg-white text-slate-800 hover:bg-slate-100",
          variant === "ghost" && "border-transparent bg-transparent text-slate-700 hover:bg-slate-100",
          variant === "danger" && "border-destructive bg-destructive text-destructive-foreground hover:bg-red-800",
          size === "sm" && "h-8 px-3 text-xs",
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
