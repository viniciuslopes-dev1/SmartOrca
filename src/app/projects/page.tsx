"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectStatusBadge } from "@/components/status-badge";
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
          <Link href="/projects/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-sky-900">
            <Plus className="h-4 w-4" />
            Nova obra
          </Link>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por obra, serviço ou cidade" className="pl-9" />
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
        {projects.data?.length === 0 ? <div className="p-4"><EmptyState title="Nenhuma obra cadastrada" description="Crie uma obra para organizar orçamentos por projeto." /></div> : null}
        {projects.data && projects.data.length > 0 ? (
          <div className="industrial-scrollbar overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Obra/projeto</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Previsão</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {projects.data.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${project.id}`} className="font-semibold text-slate-900 hover:text-primary">{project.name}</Link>
                      <div className="text-xs text-slate-500">{[project.city, project.state].filter(Boolean).join(" / ") || "Local não informado"}</div>
                    </td>
                    <td className="px-4 py-3">{project.clients?.name ?? "-"}</td>
                    <td className="px-4 py-3">{project.service_type || "-"}</td>
                    <td className="px-4 py-3"><ProjectStatusBadge status={project.status} /></td>
                    <td className="px-4 py-3">{formatDate(project.expected_start_date)} até {formatDate(project.expected_end_date)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link className="text-xs font-semibold text-primary" href={`/projects/${project.id}/edit`}>Editar</Link>
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
