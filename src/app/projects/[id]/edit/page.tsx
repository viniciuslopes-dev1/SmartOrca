"use client";

import { useParams, useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectForm } from "@/components/projects/project-form";
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/hooks/useClients";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { normalizeProjectInput } from "@/lib/form-normalizers";
import type { ProjectFormValues } from "@/lib/validations/schemas";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clients = useClients();
  const project = useProject(params.id);
  const update = useUpdateProject(params.id);

  function submit(values: ProjectFormValues) {
    update.mutate(normalizeProjectInput(values), { onSuccess: () => router.push(`/projects/${params.id}`) });
  }

  return (
    <>
      <PageHeader title="Editar obra/projeto" description="Atualize vínculo, status e informações operacionais." />
      {(clients.isLoading || project.isLoading) ? <LoadingState /> : null}
      {clients.isError ? <ErrorState message={(clients.error as Error).message} onRetry={() => clients.refetch()} /> : null}
      {project.isError ? <ErrorState message={(project.error as Error).message} onRetry={() => project.refetch()} /> : null}
      {clients.data && project.data ? (
        <Card>
          <CardContent>
            <ProjectForm clients={clients.data} initial={project.data} onSubmit={submit} submitLabel="Salvar alterações" isSubmitting={update.isPending} />
            {update.isError ? <p className="mt-3 text-sm font-medium text-red-700">{(update.error as Error).message}</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
