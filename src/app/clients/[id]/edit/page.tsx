"use client";

import { useParams, useRouter } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useClient, useUpdateClient } from "@/hooks/useClients";
import { normalizeClientInput } from "@/lib/form-normalizers";
import type { ClientFormValues } from "@/lib/validations/schemas";

export default function EditClientPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useClient(params.id);
  const update = useUpdateClient(params.id);

  function submit(values: ClientFormValues) {
    update.mutate(normalizeClientInput(values), {
      onSuccess: () => router.push(`/clients/${params.id}`)
    });
  }

  return (
    <>
      <PageHeader title="Editar cliente" description="Atualize dados cadastrais e status." />
      {client.isLoading ? <LoadingState /> : null}
      {client.isError ? <ErrorState message={(client.error as Error).message} onRetry={() => client.refetch()} /> : null}
      {client.data ? (
        <Card>
          <CardContent>
            <ClientForm initial={client.data} onSubmit={submit} submitLabel="Salvar alterações" isSubmitting={update.isPending} />
            {update.isError ? <p className="mt-3 text-sm font-medium text-red-700">{(update.error as Error).message}</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
