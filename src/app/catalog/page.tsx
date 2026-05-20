"use client";

import Link from "next/link";
import { FileSpreadsheet, Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Select } from "@/components/ui/field";
import { formatCurrency } from "@/lib/formatters";
import { catalogTypeLabels, unitLabels } from "@/lib/labels";
import { useCatalogItems, useDeactivateCatalogItem } from "@/hooks/useCatalogItems";
import type { CatalogItemType } from "@/types/database.types";

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<CatalogItemType | "all">("all");
  const [itemToDeactivate, setItemToDeactivate] = useState<string | null>(null);
  const catalog = useCatalogItems({ search, type });
  const deactivate = useDeactivateCatalogItem();

  function confirmDeactivateItem() {
    if (!itemToDeactivate) return;
    deactivate.mutate(itemToDeactivate, {
      onSettled: () => setItemToDeactivate(null)
    });
  }

  return (
    <>
      <PageHeader
        title="Produtos e serviços"
        description="Itens reutilizáveis para acelerar a montagem de orçamentos."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/catalog/import">
              <Button variant="secondary">
                <FileSpreadsheet className="h-4 w-4" />
                Importar Excel
              </Button>
            </Link>
            <Link href="/catalog/new">
              <Button>
                <Plus className="h-4 w-4" />
                Novo item
              </Button>
            </Link>
          </div>
        }
      />
      <Card className="overflow-hidden">
        <div className="list-toolbar">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, categoria ou descrição" className="pl-9" />
          </div>
          <Select value={type} onChange={(event) => setType(event.target.value as CatalogItemType | "all")} className="md:w-64">
            <option value="all">Todos os tipos</option>
            {Object.entries(catalogTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
        {catalog.isLoading ? <div className="p-4"><LoadingState /></div> : null}
        {catalog.isError ? <div className="p-4"><ErrorState message={(catalog.error as Error).message} onRetry={() => catalog.refetch()} /></div> : null}
        {catalog.data?.length === 0 ? <div className="p-4"><EmptyState title="Nenhum item cadastrado" description="Cadastre ou importe produtos, serviços e materiais para reutilizar nos orçamentos." /></div> : null}
        {catalog.data && catalog.data.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Tipo</th>
                  <th>Unidade</th>
                  <th>Custo</th>
                  <th>Preço sugerido</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {catalog.data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td>
                      <Link href={`/catalog/${item.id}`} className="row-link">{item.name}</Link>
                      <div className="text-xs text-slate-500">{item.category || "Sem categoria"}</div>
                    </td>
                    <td>{catalogTypeLabels[item.type]}</td>
                    <td>{unitLabels[item.unit]}</td>
                    <td>{formatCurrency(item.cost_unit)}</td>
                    <td className="font-semibold">{formatCurrency(item.price_unit)}</td>
                    <td><ActiveBadge active={item.is_active} /></td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link className="action-link" href={`/catalog/${item.id}/edit`}>Editar</Link>
                        {item.is_active ? (
                          <button
                            className="text-xs font-semibold text-red-700 hover:underline"
                            onClick={() => setItemToDeactivate(item.id)}
                          >
                            Inativar
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
      <ConfirmDialog
        open={itemToDeactivate !== null}
        title="Inativar item do catálogo?"
        description="O item não será sugerido para novos orçamentos, mas os orçamentos que já usam esse item continuam com seus valores preservados."
        confirmLabel="Inativar item"
        isConfirming={deactivate.isPending}
        onConfirm={confirmDeactivateItem}
        onCancel={() => setItemToDeactivate(null)}
      />
    </>
  );
}
