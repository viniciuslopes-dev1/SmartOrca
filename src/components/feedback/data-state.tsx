import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Carregando dados..." }: { label?: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-white text-sm text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800">
      <AlertTriangle className="h-5 w-5" />
      <p>{message}</p>
      {onRetry ? (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-white p-6 text-center">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
