"use client";

import { useParams, useRouter } from "next/navigation";
import { CatalogItemForm } from "@/components/catalog/catalog-item-form";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useCatalogItem, useUpdateCatalogItem } from "@/hooks/useCatalogItems";
import { normalizeCatalogItemInput } from "@/lib/form-normalizers";
import type { CatalogItemFormValues } from "@/lib/validations/schemas";

export default function EditCatalogItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const item = useCatalogItem(params.id);
  const update = useUpdateCatalogItem(params.id);

  function submit(values: CatalogItemFormValues) {
    update.mutate(normalizeCatalogItemInput(values), { onSuccess: () => router.push(`/catalog/${params.id}`) });
  }

  return (
    <>
      <PageHeader title="Editar produto/serviço" description="Atualize valores, categoria e status do item." />
      {item.isLoading ? <LoadingState /> : null}
      {item.isError ? <ErrorState message={(item.error as Error).message} onRetry={() => item.refetch()} /> : null}
      {item.data ? (
        <Card>
          <CardContent>
            <CatalogItemForm initial={item.data} onSubmit={submit} submitLabel="Salvar alterações" isSubmitting={update.isPending} />
            {update.isError ? <p className="mt-3 text-sm font-medium text-red-700">{(update.error as Error).message}</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
