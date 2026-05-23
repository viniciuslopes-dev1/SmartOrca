"use client";

import Link from "next/link";
import { Boxes, Building2, ClipboardList, FilePlus2, Plus, Users } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { BudgetStatusBadge, ProjectStatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useDashboardData } from "@/hooks/useReports";

export default function DashboardPage() {
  const dashboard = useDashboardData();

  return (
    <>
      <PageHeader title="Dashboard" description="Resumo operacional de clientes, obras e orçamentos." />
      {dashboard.isLoading ? <LoadingState /> : null}
      {dashboard.isError ? <ErrorState message={(dashboard.error as Error).message} onRetry={() => dashboard.refetch()} /> : null}
      {dashboard.data ? (
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric title="Clientes" value={dashboard.data.metrics.totalClients} icon={<Users className="h-4 w-4" />} />
            <Metric title="Obras/projetos" value={dashboard.data.metrics.totalProjects} icon={<Building2 className="h-4 w-4" />} />
            <Metric title="Orçamentos" value={dashboard.data.metrics.totalBudgets} icon={<ClipboardList className="h-4 w-4" />} />
            <Metric title="Valor aprovado" value={formatCurrency(dashboard.data.metrics.totalApproved)} icon={<FilePlus2 className="h-4 w-4" />} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <SmallMetric label="Rascunhos" value={dashboard.data.metrics.draftBudgets} />
            <SmallMetric label="Enviados" value={dashboard.data.metrics.sentBudgets} />
            <SmallMetric label="Aprovados" value={dashboard.data.metrics.approvedBudgets} />
            <SmallMetric label="Recusados" value={dashboard.data.metrics.rejectedBudgets} />
            <SmallMetric label="Taxa aprovação" value={`${dashboard.data.metrics.approvalRate}%`} />
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <Card>
              <CardHeader><h2 className="font-semibold">Atalhos rápidos</h2></CardHeader>
              <CardContent className="grid gap-2">
                <QuickLink href="/clients/new" label="Novo cliente" icon={<Users className="h-4 w-4" />} />
                <QuickLink href="/projects/new" label="Nova obra" icon={<Building2 className="h-4 w-4" />} />
                <QuickLink href="/budgets/new" label="Novo orçamento" icon={<ClipboardList className="h-4 w-4" />} />
                <QuickLink href="/catalog/new" label="Novo produto/serviço" icon={<Boxes className="h-4 w-4" />} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><h2 className="font-semibold">Últimos orçamentos</h2></CardHeader>
              <CardContent>
                {dashboard.data.recentBudgets.length === 0 ? <EmptyState title="Nenhum orçamento criado" description="Use os atalhos para iniciar o primeiro orçamento." /> : null}
                <div className="grid gap-2">
                  {dashboard.data.recentBudgets.map((budget) => (
                    <Link key={budget.id} href={`/budgets/${budget.id}`} className="flex min-w-0 flex-col gap-2 rounded-md border border-border bg-white p-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                      <span className="min-w-0">
                        <span className="block break-words font-medium">#{budget.budget_number} - {budget.title}</span>
                        <span className="text-xs text-slate-500">{budget.clients?.name ?? "-"} · {formatCurrency(budget.total)}</span>
                      </span>
                      <BudgetStatusBadge status={budget.status} />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><h2 className="font-semibold">Obras recentes</h2></CardHeader>
            <CardContent>
              {dashboard.data.recentProjects.length === 0 ? <EmptyState title="Nenhuma obra cadastrada" /> : null}
              <div className="grid gap-2 md:grid-cols-2">
                {dashboard.data.recentProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="flex min-w-0 flex-col gap-2 rounded-md border border-border bg-white p-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0">
                      <span className="block break-words font-medium">{project.name}</span>
                      <span className="text-xs text-slate-500">{project.clients?.name ?? "-"} · {formatDate(project.created_at.slice(0, 10))}</span>
                    </span>
                    <ProjectStatusBadge status={project.status} />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}

function Metric({ title, value, icon }: { title: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase text-slate-500">{title}</div>
          <div className="mt-1 break-words text-xl font-bold text-slate-950 sm:text-2xl">{value}</div>
        </div>
        <div className="rounded-md bg-cyan-800 p-2 text-white">{icon}</div>
      </CardContent>
    </Card>
  );
}

function SmallMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border bg-white p-3 text-sm font-semibold hover:bg-slate-50">
      <span className="flex min-w-0 items-center gap-2">{icon}<span className="break-words">{label}</span></span>
      <Plus className="h-4 w-4 text-primary" />
    </Link>
  );
}
