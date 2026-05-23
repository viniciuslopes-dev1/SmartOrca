import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, error, children, className }: FieldProps) {
  return (
    <label className={cn("grid min-w-0 gap-2 text-sm font-medium text-slate-700", className)}>
      <span className="text-[0.82rem] font-semibold uppercase tracking-[0.04em] text-slate-600">{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-red-700">{error}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-input bg-white px-3.5 text-sm outline-none transition-all placeholder:text-slate-400",
        "focus:border-primary focus:ring-2 focus:ring-primary/15",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full min-w-0 rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400",
        "focus:border-primary focus:ring-2 focus:ring-primary/15",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-input bg-white px-3.5 text-sm outline-none transition-all",
        "focus:border-primary focus:ring-2 focus:ring-primary/15",
        props.className
      )}
    />
  );
}
