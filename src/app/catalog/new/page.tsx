"use client";

import { useRouter } from "next/navigation";
import { CatalogItemForm } from "@/components/catalog/catalog-item-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateCatalogItem } from "@/hooks/useCatalogItems";
import { normalizeCatalogItemInput } from "@/lib/form-normalizers";
import type { CatalogItemFormValues } from "@/lib/validations/schemas";

export default function NewCatalogItemPage() {
  const router = useRouter();
  const create = useCreateCatalogItem();

  function submit(values: CatalogItemFormValues) {
    create.mutate(normalizeCatalogItemInput(values), { onSuccess: (item) => router.push(`/catalog/${item.id}`) });
  }

  return (
    <>
      <PageHeader title="Novo produto/serviço" description="Cadastre um item reutilizável para orçamentos." />
      <Card>
        <CardContent>
          <CatalogItemForm onSubmit={submit} submitLabel="Cadastrar item" isSubmitting={create.isPending} />
          {create.isError ? <p className="mt-3 text-sm font-medium text-red-700">{(create.error as Error).message}</p> : null}
        </CardContent>
      </Card>
    </>
  );
}
