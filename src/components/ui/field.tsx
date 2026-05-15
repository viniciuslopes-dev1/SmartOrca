import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, error, children, className }: FieldProps) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-medium text-slate-700", className)}>
      <span>{label}</span>
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
        "h-10 rounded-md border border-input bg-white px-3 text-sm outline-none transition placeholder:text-slate-400",
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
        "min-h-24 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400",
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
        "h-10 rounded-md border border-input bg-white px-3 text-sm outline-none transition",
        "focus:border-primary focus:ring-2 focus:ring-primary/15",
        props.className
      )}
    />
  );
}
