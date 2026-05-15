"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BudgetForm } from "@/components/budgets/budget-form";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { useCreateBudget } from "@/hooks/useBudgets";
import { useCatalogItems } from "@/hooks/useCatalogItems";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { toSaveBudgetInput } from "@/lib/budget-form-mapper";
import type { BudgetFormValues } from "@/lib/validations/schemas";

export default function NewBudgetPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NewBudgetContent />
    </Suspense>
  );
}

function NewBudgetContent() {
  const router = useRouter();
  const params = useSearchParams();
  const clients = useClients();
  const projects = useProjects();
  const catalog = useCatalogItems({ activeOnly: true });
  const create = useCreateBudget();

  function submit(values: BudgetFormValues) {
    create.mutate(toSaveBudgetInput(values), {
      onSuccess: (budget) => router.push(`/budgets/${budget.id}`)
    });
  }

  const loading = clients.isLoading || projects.isLoading || catalog.isLoading;
  const error = clients.error || projects.error || catalog.error;

  return (
    <>
      <PageHeader title="Novo orçamento" description="Monte itens, condições, escopo e status inicial." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} /> : null}
      {clients.data && projects.data && catalog.data ? (
        <>
          <BudgetForm
            clients={clients.data}
            projects={projects.data}
            catalog={catalog.data}
            presetClientId={params.get("clientId") ?? undefined}
            presetProjectId={params.get("projectId") ?? undefined}
            onSubmit={submit}
            submitLabel="Salvar orçamento"
            isSubmitting={create.isPending}
          />
          {create.isError ? <p className="mt-3 text-sm font-medium text-red-700">{(create.error as Error).message}</p> : null}
        </>
      ) : null}
    </>
  );
}
