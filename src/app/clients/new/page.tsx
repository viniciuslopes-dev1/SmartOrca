"use client";

import { useRouter } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateClient } from "@/hooks/useClients";
import { normalizeClientInput } from "@/lib/form-normalizers";
import type { ClientFormValues } from "@/lib/validations/schemas";

export default function NewClientPage() {
  const router = useRouter();
  const create = useCreateClient();

  function submit(values: ClientFormValues) {
    create.mutate(normalizeClientInput(values), {
      onSuccess: (client) => router.push(`/clients/${client.id}`)
    });
  }

  return (
    <>
      <PageHeader title="Novo cliente" description="Cadastre os dados principais do cliente." />
      <Card>
        <CardContent>
          <ClientForm onSubmit={submit} submitLabel="Cadastrar cliente" isSubmitting={create.isPending} />
          {create.isError ? <p className="mt-3 text-sm font-medium text-red-700">{(create.error as Error).message}</p> : null}
        </CardContent>
      </Card>
    </>
  );
}
