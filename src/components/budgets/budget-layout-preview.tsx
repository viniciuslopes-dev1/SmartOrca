"use client";

import type { ReactNode } from "react";
import { formatCurrency } from "@/lib/formatters";
import type { BudgetWithRelations, Settings } from "@/types/database.types";

type PreviewBudget = Pick<BudgetWithRelations, "budget_number" | "title" | "issue_date" | "execution_deadline" | "subtotal" | "discount_total" | "tax_total" | "total" | "budget_groups" | "clients" | "budget_layout">;

export function BudgetLayoutPreview({ budget, settings }: { budget: PreviewBudget; settings: Settings; layoutId?: string | null }) {
  const logoSrc = settings.logo_url;
  const firstGroups = (budget.budget_groups ?? []).slice(0, 3);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[0.72fr_1fr]">
        <div className="flex min-h-80 items-center justify-center bg-[#3f5d70] p-8 text-white">
          <div className="flex h-48 w-full max-w-sm items-center justify-center border-[5px] border-white p-6">
            {logoSrc ? <img src={logoSrc} alt="Logo da empresa" className="max-h-28 max-w-full object-contain" /> : <div className="text-center text-2xl font-bold">{settings.company_name}</div>}
          </div>
        </div>

        <div className="relative min-h-80 bg-white">
          <div className="h-4 bg-[#3f5d70]" />
          <div className="absolute right-0 top-24 h-56 w-56 border-[18px] border-slate-100 opacity-70 rotate-45" />
          <div className="relative p-6 pb-24">
            <header className="mb-6 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
              <div className="text-sm leading-6">
                <p><strong>Cliente:</strong> {budget.clients?.name ?? "-"}</p>
                <p><strong>Empresa:</strong> {settings.company_name}</p>
                <p><strong>Prazo:</strong> {budget.execution_deadline || "-"}</p>
                <p><strong>Proposta:</strong> {budget.budget_number}</p>
              </div>
              <div className="flex h-16 w-36 items-center justify-center border border-[#3f5d70] bg-white p-2">
                {logoSrc ? <img src={logoSrc} alt="Logo da empresa" className="h-full w-full object-contain" /> : <span className="text-xs font-semibold text-[#3f5d70]">Logo</span>}
              </div>
              <div className="text-right text-sm">Pagina: 1/2</div>
            </header>

            <h3 className="mb-5 text-center text-3xl font-extrabold underline">Proposta Comercial</h3>

            <div className="space-y-4">
              {firstGroups.map((group) => (
                <div key={group.id} className="overflow-hidden border border-slate-950 text-[10px]">
                  <div className="bg-[#163f4a] py-1 text-center font-bold uppercase text-white">Descritivo Orcamentario</div>
                  <div className="grid grid-cols-[0.7fr_1.1fr_3fr_0.8fr_1fr_1.1fr] bg-[#214f8f] font-bold text-white">
                    <Cell>Codigo</Cell>
                    <Cell>Setores</Cell>
                    <Cell>Servico</Cell>
                    <Cell>Unid</Cell>
                    <Cell>Qnt.</Cell>
                    <Cell last>Total</Cell>
                  </div>
                  {group.budget_items.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="grid grid-cols-[0.7fr_1.1fr_3fr_0.8fr_1fr_1.1fr] border-t border-slate-900">
                      <Cell tone="blue">S-{String(index + 1).padStart(3, "0")}</Cell>
                      <Cell tone="sector">{group.name}</Cell>
                      <Cell>{item.name}</Cell>
                      <Cell>{item.unit}</Cell>
                      <Cell>{item.quantity}</Cell>
                      <Cell tone="total" last>{formatCurrency(item.subtotal)}</Cell>
                    </div>
                  ))}
                  <div className="ml-auto grid w-56 grid-cols-2 border-t border-slate-900 bg-[#eef6e9] font-bold">
                    <Cell>Total:</Cell>
                    <Cell last>{formatCurrency(group.subtotal)}</Cell>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <footer className="absolute inset-x-0 bottom-0">
            <div className="border-y-[6px] border-[#a79a61] bg-slate-50 py-2 text-center text-sm font-bold">Sao Paulo, data da proposta</div>
            <div className="grid grid-cols-2 gap-6 bg-[#3f5d70] px-12 py-4 text-sm text-white">
              <span>{settings.company_phone || "-"}</span>
              <span>{settings.company_email || settings.company_name}</span>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}

function Cell({ children, tone, last }: { children: ReactNode; tone?: "blue" | "sector" | "total"; last?: boolean }) {
  const toneClass = tone === "blue" ? "bg-[#d8e9f8]" : tone === "sector" ? "bg-[#6ea9d8] font-bold" : tone === "total" ? "bg-[#cfe8bf] font-bold text-right" : "bg-slate-50";
  return <div className={`${toneClass} ${last ? "" : "border-r border-slate-900"} flex items-center px-2 py-1`}>{children}</div>;
}
