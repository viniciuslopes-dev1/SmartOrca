import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isConfirming,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-3 py-6 sm:px-4">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-white shadow-industrial">
        <div className="flex gap-3 border-b border-border px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-slate-950">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" className="w-full sm:w-auto" onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? "Processando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
