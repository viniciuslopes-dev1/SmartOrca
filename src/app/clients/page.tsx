"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/field";
import { formatDate } from "@/lib/formatters";
import { personTypeLabels } from "@/lib/labels";
import { useClients, useDeactivateClient } from "@/hooks/useClients";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clientToDeactivate, setClientToDeactivate] = useState<string | null>(null);
  const clients = useClients(search);
  const deactivate = useDeactivateClient();

  function confirmDeactivateClient() {
    if (!clientToDeactivate) return;
    deactivate.mutate(clientToDeactivate, {
      onSettled: () => setClientToDeactivate(null)
    });
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Cadastro operacional de pessoas físicas e jurídicas."
        actions={
          <Link href="/clients/new">
            <Button>
              <Plus className="h-4 w-4" />
              Novo cliente
            </Button>
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <div className="list-toolbar">
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
              action={<Link className="action-link text-sm" href="/clients/new">Cadastrar cliente</Link>}
            />
          </div>
        ) : null}
        {clients.data && clients.data.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Contato</th>
                  <th>Cidade</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.data.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td>
                      <Link href={`/clients/${client.id}`} className="row-link">{client.name}</Link>
                      <div className="text-xs text-slate-500">{client.document || "Documento não informado"}</div>
                    </td>
                    <td>{personTypeLabels[client.person_type]}</td>
                    <td>
                      <div>{client.phone || client.whatsapp || "-"}</div>
                      <div className="text-xs text-slate-500">{client.email || "-"}</div>
                    </td>
                    <td>{[client.city, client.state].filter(Boolean).join(" / ") || "-"}</td>
                    <td><ActiveBadge active={client.is_active} /></td>
                    <td>{formatDate(client.created_at.slice(0, 10))}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link className="action-link" href={`/clients/${client.id}/edit`}>Editar</Link>
                        {client.is_active ? (
                          <button
                            className="text-xs font-semibold text-red-700 hover:underline"
                            onClick={() => setClientToDeactivate(client.id)}
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
        open={clientToDeactivate !== null}
        title="Inativar cliente?"
        description="O cliente deixa de aparecer como ativo para novos cadastros, mas obras e orçamentos já criados continuam preservados."
        confirmLabel="Inativar cliente"
        isConfirming={deactivate.isPending}
        onConfirm={confirmDeactivateClient}
        onCancel={() => setClientToDeactivate(null)}
      />
    </>
  );
}
