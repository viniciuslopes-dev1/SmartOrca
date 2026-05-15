"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { formatCurrency } from "@/lib/formatters";
import { catalogTypeLabels, unitLabels } from "@/lib/labels";
import { useCatalogItems, useDeactivateCatalogItem } from "@/hooks/useCatalogItems";
import type { CatalogItemType } from "@/types/database.types";

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<CatalogItemType | "all">("all");
  const catalog = useCatalogItems({ search, type });
  const deactivate = useDeactivateCatalogItem();

  return (
    <>
      <PageHeader
        title="Produtos e serviços"
        description="Itens reutilizáveis para acelerar a montagem de orçamentos."
        actions={
          <Link href="/catalog/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-sky-900">
            <Plus className="h-4 w-4" />
            Novo item
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
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
        {catalog.data?.length === 0 ? <div className="p-4"><EmptyState title="Nenhum item cadastrado" description="Cadastre produtos, serviços e materiais para reutilizar nos orçamentos." /></div> : null}
        {catalog.data && catalog.data.length > 0 ? (
          <div className="industrial-scrollbar overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Unidade</th>
                  <th className="px-4 py-3">Custo</th>
                  <th className="px-4 py-3">Preço sugerido</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {catalog.data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/catalog/${item.id}`} className="font-semibold text-slate-900 hover:text-primary">{item.name}</Link>
                      <div className="text-xs text-slate-500">{item.category || "Sem categoria"}</div>
                    </td>
                    <td className="px-4 py-3">{catalogTypeLabels[item.type]}</td>
                    <td className="px-4 py-3">{unitLabels[item.unit]}</td>
                    <td className="px-4 py-3">{formatCurrency(item.cost_unit)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(item.price_unit)}</td>
                    <td className="px-4 py-3"><ActiveBadge active={item.is_active} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link className="text-xs font-semibold text-primary" href={`/catalog/${item.id}/edit`}>Editar</Link>
                        {item.is_active ? (
                          <button
                            className="text-xs font-semibold text-red-700"
                            onClick={() => {
                              if (window.confirm("Inativar este item?")) deactivate.mutate(item.id);
                            }}
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
    </>
  );
}
