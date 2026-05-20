"use client";

import Link from "next/link";
import { Copy, Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { BudgetStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
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
        title="Orcamentos"
        description="Criacao, acompanhamento e historico de propostas."
        actions={
          <Link href="/budgets/new">
            <Button>
              <Plus className="h-4 w-4" />
              Novo orcamento
            </Button>
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <div className="list-toolbar">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por titulo ou descricao" className="pl-9" />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value as BudgetStatus | "all")} className="md:w-64">
            <option value="all">Todos os status</option>
            {Object.entries(budgetStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </div>
        {budgets.isLoading ? <div className="p-4"><LoadingState /></div> : null}
        {budgets.isError ? <div className="p-4"><ErrorState message={(budgets.error as Error).message} onRetry={() => budgets.refetch()} /></div> : null}
        {budgets.data?.length === 0 ? <div className="p-4"><EmptyState title="Nenhum orcamento cadastrado" description="Crie o primeiro orcamento para acompanhar valores e status." /></div> : null}
        {budgets.data && budgets.data.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table min-w-[980px]">
              <thead>
                <tr>
                  <th>Numero/titulo</th>
                  <th>Cliente</th>
                  <th>Obra</th>
                  <th>Emissao</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {budgets.data.map((budget) => (
                  <tr key={budget.id} className="hover:bg-slate-50">
                    <td>
                      <Link href={`/budgets/${budget.id}`} className="row-link">#{budget.budget_number} - {budget.title}</Link>
                      <div className="text-xs text-slate-500">{budget.valid_until ? `Valido ate ${formatDate(budget.valid_until)}` : "Sem validade"}</div>
                    </td>
                    <td>{budget.clients?.name ?? "-"}</td>
                    <td>{budget.projects?.name ?? "-"}</td>
                    <td>{formatDate(budget.issue_date)}</td>
                    <td className="font-semibold">{formatCurrency(budget.total)}</td>
                    <td><BudgetStatusBadge status={budget.status} /></td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link className="action-link" href={`/budgets/${budget.id}/edit`}>Editar</Link>
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:underline" onClick={() => duplicate.mutate(budget.id)}>
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
