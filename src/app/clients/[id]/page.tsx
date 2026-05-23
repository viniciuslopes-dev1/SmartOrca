"use client";

import Link from "next/link";
import { FilePlus2, Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveBadge, BudgetStatusBadge, ProjectStatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { personTypeLabels } from "@/lib/labels";
import { useClient, useClientRelations } from "@/hooks/useClients";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const client = useClient(params.id);
  const relations = useClientRelations(params.id);

  return (
    <>
      <PageHeader
        title={client.data?.name ?? "Cliente"}
        description="Detalhes cadastrais, obras e orçamentos relacionados."
        actions={
          client.data ? (
            <>
              <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium hover:bg-slate-100" href={`/clients/${params.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
              <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-primary bg-primary px-4 text-sm font-medium text-white hover:bg-sky-900" href={`/budgets/new?clientId=${params.id}`}>
                <FilePlus2 className="h-4 w-4" />
                Novo orçamento
              </Link>
            </>
          ) : null
        }
      />
      {client.isLoading ? <LoadingState /> : null}
      {client.isError ? <ErrorState message={(client.error as Error).message} onRetry={() => client.refetch()} /> : null}
      {client.data ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-semibold">Cadastro</h2>
                <ActiveBadge active={client.data.is_active} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <Info label="Tipo" value={personTypeLabels[client.data.person_type]} />
              <Info label="Documento" value={client.data.document} />
              <Info label="Telefone" value={client.data.phone} />
              <Info label="WhatsApp" value={client.data.whatsapp} />
              <Info label="Email" value={client.data.email} />
              <Info label="Endereço" value={[client.data.address, client.data.city, client.data.state].filter(Boolean).join(" - ")} />
              <Info label="Observações" value={client.data.notes} />
            </CardContent>
          </Card>
          <div className="grid gap-4">
            <Card>
              <CardHeader><h2 className="font-semibold">Obras/projetos</h2></CardHeader>
              <CardContent>
                {relations.isLoading ? <LoadingState /> : null}
                {relations.data?.projects.length === 0 ? <EmptyState title="Nenhuma obra vinculada" /> : null}
                <div className="grid gap-2">
                  {relations.data?.projects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`} className="flex min-w-0 flex-col gap-2 rounded-md border border-border bg-white p-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                      <span className="break-words font-medium">{project.name}</span>
                      <ProjectStatusBadge status={project.status} />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><h2 className="font-semibold">Orçamentos</h2></CardHeader>
              <CardContent>
                {relations.data?.budgets.length === 0 ? <EmptyState title="Nenhum orçamento vinculado" /> : null}
                <div className="grid gap-2">
                  {relations.data?.budgets.map((budget) => (
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
