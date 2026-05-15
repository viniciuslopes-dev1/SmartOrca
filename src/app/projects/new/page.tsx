"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectForm } from "@/components/projects/project-form";
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/hooks/useClients";
import { useCreateProject } from "@/hooks/useProjects";
import { normalizeProjectInput } from "@/lib/form-normalizers";
import type { ProjectFormValues } from "@/lib/validations/schemas";

export default function NewProjectPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NewProjectContent />
    </Suspense>
  );
}

function NewProjectContent() {
  const router = useRouter();
  const params = useSearchParams();
  const clients = useClients();
  const create = useCreateProject();

  function submit(values: ProjectFormValues) {
    create.mutate(normalizeProjectInput(values), { onSuccess: (project) => router.push(`/projects/${project.id}`) });
  }

  return (
    <>
      <PageHeader title="Nova obra/projeto" description="Vincule uma obra a um cliente e acompanhe o status." />
      {clients.isLoading ? <LoadingState /> : null}
      {clients.isError ? <ErrorState message={(clients.error as Error).message} onRetry={() => clients.refetch()} /> : null}
      {clients.data ? (
        <Card>
          <CardContent>
            <ProjectForm clients={clients.data} presetClientId={params.get("clientId") ?? undefined} onSubmit={submit} submitLabel="Cadastrar obra" isSubmitting={create.isPending} />
            {create.isError ? <p className="mt-3 text-sm font-medium text-red-700">{(create.error as Error).message}</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
