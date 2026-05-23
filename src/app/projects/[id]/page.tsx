"use client";

import Link from "next/link";
import { FilePlus2, Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { BudgetStatusBadge, ProjectStatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useProject, useProjectBudgets } from "@/hooks/useProjects";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const project = useProject(params.id);
  const budgets = useProjectBudgets(params.id);

  return (
    <>
      <PageHeader
        title={project.data?.name ?? "Obra/projeto"}
        description="Informações do projeto e orçamentos vinculados."
        actions={
          project.data ? (
            <>
              <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium hover:bg-slate-100" href={`/projects/${params.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
              <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-primary bg-primary px-4 text-sm font-medium text-white hover:bg-sky-900" href={`/budgets/new?clientId=${project.data.client_id}&projectId=${project.data.id}`}>
                <FilePlus2 className="h-4 w-4" />
                Novo orçamento
              </Link>
            </>
          ) : null
        }
      />
      {project.isLoading ? <LoadingState /> : null}
      {project.isError ? <ErrorState message={(project.error as Error).message} onRetry={() => project.refetch()} /> : null}
      {project.data ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-semibold">Dados da obra</h2>
                <ProjectStatusBadge status={project.data.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <Info label="Cliente" value={project.data.clients?.name} />
              <Info label="Tipo de serviço" value={project.data.service_type} />
              <Info label="Endereço" value={[project.data.address, project.data.city, project.data.state].filter(Boolean).join(" - ")} />
              <Info label="Previsão" value={`${formatDate(project.data.expected_start_date)} até ${formatDate(project.data.expected_end_date)}`} />
              <Info label="Descrição" value={project.data.description} />
              <Info label="Observações" value={project.data.notes} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h2 className="font-semibold">Orçamentos vinculados</h2></CardHeader>
            <CardContent>
              {budgets.isLoading ? <LoadingState /> : null}
              {budgets.data?.length === 0 ? <EmptyState title="Nenhum orçamento vinculado" /> : null}
              <div className="grid gap-2">
                {budgets.data?.map((budget) => (
                  <Link key={budget.id} href={`/budgets/${budget.id}`} className="flex min-w-0 flex-col gap-2 rounded-md border border-border bg-white p-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0">
                      <span className="block break-words font-medium">#{budget.budget_number} - {budget.title}</span>
                      <span className="text-xs text-slate-500">{formatDate(budget.issue_date)} · {formatCurrency(budget.total)}</span>
                    </span>
                    <BudgetStatusBadge status={budget.status} />
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

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="text-slate-900">{value || "-"}</div>
    </div>
  );
}
