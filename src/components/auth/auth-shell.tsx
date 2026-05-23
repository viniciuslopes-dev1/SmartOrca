import { BrandLogo } from "@/components/brand/brand-logo";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-border bg-white shadow-industrial">
        <div className="border-b border-border px-6 py-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-sm ring-1 ring-border">
              <BrandLogo variant="mark" className="h-full w-full" priority />
            </span>
            <div>
              <div className="text-sm font-bold text-slate-950">SmartOrça</div>
              <div className="text-xs text-slate-500">Gestão operacional de orçamentos</div>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="p-6">{children}</div>
      </section>
    </main>
  );
}
