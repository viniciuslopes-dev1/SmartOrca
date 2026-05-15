"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import Link from "next/link";
import { Download, Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { BudgetPdfDocument } from "@/components/budgets/budget-pdf";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { BudgetStatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import { budgetStatusLabels } from "@/lib/labels";
import { useBudget, useBudgetStatusHistory, useChangeBudgetStatus } from "@/hooks/useBudgets";
import { useSettings } from "@/hooks/useSettings";
import type { BudgetStatus } from "@/types/database.types";

export default function BudgetDetailPage() {
  const params = useParams<{ id: string }>();
  const budget = useBudget(params.id);
  const history = useBudgetStatusHistory(params.id);
  const settings = useSettings();
  const changeStatus = useChangeBudgetStatus();

  return (
    <>
      <PageHeader
        title={budget.data ? `#${budget.data.budget_number} - ${budget.data.title}` : "Orçamento"}
        description="Visualização operacional, histórico e PDF."
        actions={
          budget.data ? (
            <>
              <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium hover:bg-slate-100" href={`/budgets/${params.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
              <PDFDownloadLink
                document={<BudgetPdfDocument budget={budget.data} settings={settings.data ?? null} />}
                fileName={`orcamento-${budget.data.budget_number}.pdf`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-primary bg-primary px-4 text-sm font-medium text-white hover:bg-sky-900"
              >
                {({ loading }) => (
                  <>
                    <Download className="h-4 w-4" />
                    {loading ? "Gerando..." : "Gerar PDF"}
                  </>
                )}
              </PDFDownloadLink>
            </>
          ) : null
        }
      />
      {budget.isLoading ? <LoadingState /> : null}
      {budget.isError ? <ErrorState message={(budget.error as Error).message} onRetry={() => budget.refetch()} /> : null}
      {budget.data ? (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-semibold">Dados do orçamento</h2>
                    <p className="text-sm text-slate-500">{budget.data.clients?.name ?? "-"} · {budget.data.projects?.name ?? "Sem obra vinculada"}</p>
                  </div>
                  <BudgetStatusBadge status={budget.data.status} />
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm md:grid-cols-3">
                <Info label="Emissão" value={formatDate(budget.data.issue_date)} />
                <Info label="Validade" value={formatDate(budget.data.valid_until)} />
                <Info label="Prazo de execução" value={budget.data.execution_deadline} />
                <Info label="Descrição" value={budget.data.description} />
                <Info label="Pagamento" value={budget.data.payment_terms} />
                <Info label="Observações cliente" value={budget.data.customer_notes} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><h2 className="font-semibold">Itens</h2></CardHeader>
              <CardContent>
                <div className="industrial-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Qtd.</th>
                        <th className="px-3 py-2">Unidade</th>
                        <th className="px-3 py-2">Preço</th>
                        <th className="px-3 py-2">Desconto</th>
                        <th className="px-3 py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {budget.data.budget_items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 font-medium">{item.name}</td>
                          <td className="px-3 py-2">{item.quantity}</td>
                          <td className="px-3 py-2">{item.unit}</td>
                          <td className="px-3 py-2">{formatCurrency(item.price_unit)}</td>
                          <td className="px-3 py-2">{formatCurrency(item.discount)}</td>
                          <td className="px-3 py-2 font-semibold">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><h2 className="font-semibold">Escopo</h2></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Info label="Incluso" value={budget.data.included_scope} />
                <Info label="Não incluso" value={budget.data.excluded_scope} />
                <Info label="Observações internas" value={budget.data.internal_notes} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4">
            <Card>
              <CardHeader><h2 className="font-semibold">Status</h2></CardHeader>
              <CardContent className="grid gap-3">
                <Select
                  value={budget.data.status}
                  onChange={(event) => changeStatus.mutate({ id: budget.data.id, status: event.target.value as BudgetStatus })}
                >
                  {Object.entries(budgetStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
                {changeStatus.isError ? <p className="text-sm font-medium text-red-700">{(changeStatus.error as Error).message}</p> : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><h2 className="font-semibold">Totais</h2></CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <Total label="Subtotal" value={budget.data.subtotal} />
                <Total label="Desconto" value={budget.data.discount_total} />
                <Total label="Taxas" value={budget.data.tax_total} />
                <Total label="Margem estimada" value={budget.data.margin_total} />
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>Total final</span>
                  <span>{formatCurrency(budget.data.total)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><h2 className="font-semibold">Histórico</h2></CardHeader>
              <CardContent>
                {history.isLoading ? <LoadingState /> : null}
                {history.data?.length === 0 ? <EmptyState title="Sem histórico de status" /> : null}
                <div className="grid gap-2">
                  {history.data?.map((entry) => (
                    <div key={entry.id} className="rounded-md border border-border bg-white p-3 text-sm">
                      <div className="font-medium">{entry.old_status ? budgetStatusLabels[entry.old_status] : "Inicial"} → {budgetStatusLabels[entry.new_status]}</div>
                      <div className="text-xs text-slate-500">{formatDateTime(entry.created_at)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="whitespace-pre-line text-slate-900">{value || "-"}</div>
    </div>
  );
}

function Total({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );
}
