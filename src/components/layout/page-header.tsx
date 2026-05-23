import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex min-w-0 flex-col gap-3 border-b border-border/80 pb-4 md:mb-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="break-words text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl md:text-[1.7rem]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-3xl text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto [&>a]:flex-1 [&>div]:w-full sm:[&>a]:flex-none sm:[&>div]:w-auto [&_button]:w-full sm:[&_button]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
