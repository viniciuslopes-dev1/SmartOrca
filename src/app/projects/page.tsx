"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { formatDate } from "@/lib/formatters";
import { projectStatusLabels } from "@/lib/labels";
import { useProjects } from "@/hooks/useProjects";
import type { ProjectStatus } from "@/types/database.types";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const projects = useProjects({ search, status });

  return (
    <>
      <PageHeader
        title="Obras e projetos"
        description="Controle de escopos vinculados aos clientes."
        actions={
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nova obra
            </Button>
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <div className="list-toolbar">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por obra, servico ou cidade" className="pl-9" />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus | "all")} className="md:w-64">
            <option value="all">Todos os status</option>
            {Object.entries(projectStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
        {projects.isLoading ? <div className="p-4"><LoadingState /></div> : null}
        {projects.isError ? <div className="p-4"><ErrorState message={(projects.error as Error).message} onRetry={() => projects.refetch()} /></div> : null}
        {projects.data?.length === 0 ? <div className="p-4"><EmptyState title="Nenhuma obra cadastrada" description="Crie uma obra para organizar orcamentos por projeto." /></div> : null}
        {projects.data && projects.data.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Obra/projeto</th>
                  <th>Cliente</th>
                  <th>Servico</th>
                  <th>Status</th>
                  <th>Previsao</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {projects.data.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td>
                      <Link href={`/projects/${project.id}`} className="row-link">{project.name}</Link>
                      <div className="text-xs text-slate-500">{[project.city, project.state].filter(Boolean).join(" / ") || "Local nao informado"}</div>
                    </td>
                    <td>{project.clients?.name ?? "-"}</td>
                    <td>{project.service_type || "-"}</td>
                    <td><ProjectStatusBadge status={project.status} /></td>
                    <td>{formatDate(project.expected_start_date)} ate {formatDate(project.expected_end_date)}</td>
                    <td className="text-right">
                      <Link className="action-link" href={`/projects/${project.id}/edit`}>Editar</Link>
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
