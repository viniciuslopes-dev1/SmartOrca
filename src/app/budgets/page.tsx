"use client";

import Link from "next/link";
import { Copy, Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { BudgetStatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { budgetStatusLabels } from "@/lib/labels";
import { useBudgets, useDuplicateBudget } from "@/hooks/useBudgets";
import type { BudgetStatus } from "@/types/database.types";

export default function BudgetsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BudgetStatus | "all">("all");
  const budgets = useBudgets({ search, status });
  const duplicate = useDuplicateBudget();

  return (
    <>
      <PageHeader
        title="Orçamentos"
        description="Criação, acompanhamento e histórico de propostas."
        actions={
          <Link href="/budgets/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-sky-900">
            <Plus className="h-4 w-4" />
            Novo orçamento
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título ou descrição" className="pl-9" />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value as BudgetStatus | "all")} className="md:w-64">
            <option value="all">Todos os status</option>
            {Object.entries(budgetStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </div>
        {budgets.isLoading ? <div className="p-4"><LoadingState /></div> : null}
        {budgets.isError ? <div className="p-4"><ErrorState message={(budgets.error as Error).message} onRetry={() => budgets.refetch()} /></div> : null}
        {budgets.data?.length === 0 ? <div className="p-4"><EmptyState title="Nenhum orçamento cadastrado" description="Crie o primeiro orçamento para acompanhar valores e status." /></div> : null}
        {budgets.data && budgets.data.length > 0 ? (
          <div className="industrial-scrollbar overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Número/título</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Obra</th>
                  <th className="px-4 py-3">Emissão</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {budgets.data.map((budget) => (
                  <tr key={budget.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/budgets/${budget.id}`} className="font-semibold text-slate-900 hover:text-primary">#{budget.budget_number} - {budget.title}</Link>
                      <div className="text-xs text-slate-500">{budget.valid_until ? `Válido até ${formatDate(budget.valid_until)}` : "Sem validade"}</div>
                    </td>
                    <td className="px-4 py-3">{budget.clients?.name ?? "-"}</td>
                    <td className="px-4 py-3">{budget.projects?.name ?? "-"}</td>
                    <td className="px-4 py-3">{formatDate(budget.issue_date)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(budget.total)}</td>
                    <td className="px-4 py-3"><BudgetStatusBadge status={budget.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link className="text-xs font-semibold text-primary" href={`/budgets/${budget.id}/edit`}>Editar</Link>
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700" onClick={() => duplicate.mutate(budget.id)}>
                          <Copy className="h-3 w-3" />
                          Duplicar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </>
  );
}
