"use client";

import { useParams, useRouter } from "next/navigation";
import { BudgetForm } from "@/components/budgets/budget-form";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { useBudget, useUpdateBudget } from "@/hooks/useBudgets";
import { useCatalogItems } from "@/hooks/useCatalogItems";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { toSaveBudgetInput } from "@/lib/budget-form-mapper";
import type { BudgetFormValues } from "@/lib/validations/schemas";

export default function EditBudgetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const budget = useBudget(params.id);
  const clients = useClients();
  const projects = useProjects();
  const catalog = useCatalogItems({ activeOnly: true });
  const update = useUpdateBudget(params.id);

  function submit(values: BudgetFormValues) {
    update.mutate(toSaveBudgetInput(values), {
      onSuccess: () => router.push(`/budgets/${params.id}`)
    });
  }

  const loading = budget.isLoading || clients.isLoading || projects.isLoading || catalog.isLoading;
  const error = budget.error || clients.error || projects.error || catalog.error;

  return (
    <>
      <PageHeader title="Editar orçamento" description="Atualize itens, valores, escopo e status." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} /> : null}
      {budget.data && clients.data && projects.data && catalog.data ? (
        <>
          <BudgetForm
            clients={clients.data}
            projects={projects.data}
            catalog={catalog.data}
            initial={budget.data}
            onSubmit={submit}
            submitLabel="Salvar alterações"
            isSubmitting={update.isPending}
          />
          {update.isError ? <p className="mt-3 text-sm font-medium text-red-700">{(update.error as Error).message}</p> : null}
        </>
      ) : null}
    </>
  );
}
