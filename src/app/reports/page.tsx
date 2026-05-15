"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { budgetStatusLabels } from "@/lib/labels";
import { useReportsData } from "@/hooks/useReports";

const colors = ["#0e7490", "#15803d", "#b45309", "#b91c1c", "#475569", "#0369a1"];

export default function ReportsPage() {
  const reports = useReportsData();

  return (
    <>
      <PageHeader title="Relatórios" description="Indicadores simples para acompanhamento comercial." />
      {reports.isLoading ? <LoadingState /> : null}
      {reports.isError ? <ErrorState message={(reports.error as Error).message} onRetry={() => reports.refetch()} /> : null}
      {reports.data ? (
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Summary label="Total orçado" value={formatCurrency(reports.data.totalQuoted)} />
            <Summary label="Total aprovado" value={formatCurrency(reports.data.totalApproved)} />
            <Summary label="Ticket médio" value={formatCurrency(reports.data.averageTicket)} />
            <Summary label="Taxa aprovação" value={`${reports.data.approvalRate}%`} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Orçamentos por status">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={reports.data.statusTotals.map((entry) => ({ ...entry, label: budgetStatusLabels[entry.status as keyof typeof budgetStatusLabels] }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="total">
                    {reports.data.statusTotals.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Clientes com mais orçamentos">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={reports.data.topClients}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="client" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="total" fill="#0e7490" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <Card>
            <CardHeader><h2 className="font-semibold">Itens mais usados</h2></CardHeader>
            <CardContent>
              <div className="industrial-scrollbar overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Quantidade</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reports.data.mostUsedItems.map((item) => (
                      <tr key={item.item}>
                        <td className="px-4 py-3 font-medium">{item.item}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><h2 className="font-semibold">{title}</h2></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
