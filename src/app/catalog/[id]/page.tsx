"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { catalogTypeLabels, unitLabels } from "@/lib/labels";
import { useCatalogItem } from "@/hooks/useCatalogItems";

export default function CatalogItemDetailPage() {
  const params = useParams<{ id: string }>();
  const item = useCatalogItem(params.id);

  return (
    <>
      <PageHeader
        title={item.data?.name ?? "Produto/serviço"}
        description="Detalhes do item reutilizável."
        actions={
          item.data ? (
            <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium hover:bg-slate-100" href={`/catalog/${params.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          ) : null
        }
      />
      {item.isLoading ? <LoadingState /> : null}
      {item.isError ? <ErrorState message={(item.error as Error).message} onRetry={() => item.refetch()} /> : null}
      {item.data ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Cadastro do item</h2>
              <ActiveBadge active={item.data.is_active} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <Info label="Tipo" value={catalogTypeLabels[item.data.type]} />
            <Info label="Unidade" value={unitLabels[item.data.unit]} />
            <Info label="Categoria" value={item.data.category} />
            <Info label="Margem padrão" value={`${item.data.default_margin}%`} />
            <Info label="Custo unitário" value={formatCurrency(item.data.cost_unit)} />
            <Info label="Preço sugerido" value={formatCurrency(item.data.price_unit)} />
            <Info label="Descrição" value={item.data.description} />
            <Info label="Observações" value={item.data.notes} />
            <Info label="Criado em" value={formatDate(item.data.created_at.slice(0, 10))} />
          </CardContent>
        </Card>
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
