"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { formatDate } from "@/lib/formatters";
import { personTypeLabels } from "@/lib/labels";
import { useClients, useDeactivateClient } from "@/hooks/useClients";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const clients = useClients(search);
  const deactivate = useDeactivateClient();

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Cadastro operacional de pessoas físicas e jurídicas."
        actions={
          <Link href="/clients/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-sky-900">
            <Plus className="h-4 w-4" />
            Novo cliente
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, documento, telefone ou email" className="pl-9" />
          </div>
        </div>
        {clients.isLoading ? <div className="p-4"><LoadingState /></div> : null}
        {clients.isError ? <div className="p-4"><ErrorState message={(clients.error as Error).message} onRetry={() => clients.refetch()} /></div> : null}
        {clients.data && clients.data.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Nenhum cliente cadastrado"
              description="Cadastre o primeiro cliente para vincular obras e orçamentos."
              action={<Link className="text-sm font-semibold text-primary" href="/clients/new">Cadastrar cliente</Link>}
            />
          </div>
        ) : null}
        {clients.data && clients.data.length > 0 ? (
          <div className="industrial-scrollbar overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Cidade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Criado em</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {clients.data.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${client.id}`} className="font-semibold text-slate-900 hover:text-primary">{client.name}</Link>
                      <div className="text-xs text-slate-500">{client.document || "Documento não informado"}</div>
                    </td>
                    <td className="px-4 py-3">{personTypeLabels[client.person_type]}</td>
                    <td className="px-4 py-3">
                      <div>{client.phone || client.whatsapp || "-"}</div>
                      <div className="text-xs text-slate-500">{client.email || "-"}</div>
                    </td>
                    <td className="px-4 py-3">{[client.city, client.state].filter(Boolean).join(" / ") || "-"}</td>
                    <td className="px-4 py-3"><ActiveBadge active={client.is_active} /></td>
                    <td className="px-4 py-3">{formatDate(client.created_at.slice(0, 10))}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link className="text-xs font-semibold text-primary" href={`/clients/${client.id}/edit`}>Editar</Link>
                        {client.is_active ? (
                          <button
                            className="text-xs font-semibold text-red-700"
                            onClick={() => {
                              if (window.confirm("Inativar este cliente?")) deactivate.mutate(client.id);
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
