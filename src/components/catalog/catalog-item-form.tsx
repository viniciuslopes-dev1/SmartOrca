"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { catalogTypeLabels, unitLabels } from "@/lib/labels";
import { catalogItemSchema, type CatalogItemFormValues } from "@/lib/validations/schemas";
import type { CatalogItem } from "@/types/database.types";

export function CatalogItemForm({
  initial,
  onSubmit,
  submitLabel,
  isSubmitting
}: {
  initial?: CatalogItem;
  onSubmit: (values: CatalogItemFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CatalogItemFormValues>({
    resolver: zodResolver(catalogItemSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      type: initial?.type ?? "service",
      unit: initial?.unit ?? "unit",
      category: initial?.category ?? "",
      cost_unit: initial?.cost_unit ?? 0,
      price_unit: initial?.price_unit ?? 0,
      default_margin: initial?.default_margin ?? 0,
      is_active: initial?.is_active ?? true,
      notes: initial?.notes ?? ""
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome" error={errors.name?.message}>
          <Input {...register("name")} />
        </Field>
        <Field label="Categoria" error={errors.category?.message}>
          <Input {...register("category")} />
        </Field>
        <Field label="Tipo" error={errors.type?.message}>
          <Select {...register("type")}>
            {Object.entries(catalogTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Unidade" error={errors.unit?.message}>
          <Select {...register("unit")}>
            {Object.entries(unitLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Custo unitário" error={errors.cost_unit?.message}>
          <Input {...register("cost_unit", { valueAsNumber: true })} type="number" step="0.01" min="0" />
        </Field>
        <Field label="Preço sugerido" error={errors.price_unit?.message}>
          <Input {...register("price_unit", { valueAsNumber: true })} type="number" step="0.01" min="0" />
        </Field>
        <Field label="Margem padrão" error={errors.default_margin?.message}>
          <Input {...register("default_margin", { valueAsNumber: true })} type="number" step="0.01" min="0" />
        </Field>
      </div>
      <Field label="Descrição" error={errors.description?.message}>
        <Textarea {...register("description")} />
      </Field>
      <Field label="Observações" error={errors.notes?.message}>
        <Textarea {...register("notes")} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" {...register("is_active")} className="h-4 w-4" />
        Item ativo
      </label>
      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
