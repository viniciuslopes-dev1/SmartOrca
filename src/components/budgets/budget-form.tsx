"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { calculateBudgetTotals, calculateItemSubtotal } from "@/lib/calculations/budget";
import { formatCurrency } from "@/lib/formatters";
import { budgetStatusLabels, catalogTypeLabels, unitLabels } from "@/lib/labels";
import { budgetSchema, type BudgetFormValues } from "@/lib/validations/schemas";
import type { BudgetWithRelations, CatalogItem, Client, ProjectWithClient } from "@/types/database.types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function BudgetForm({
  clients,
  projects,
  catalog,
  initial,
  presetClientId,
  presetProjectId,
  onSubmit,
  submitLabel,
  isSubmitting
}: {
  clients: Client[];
  projects: ProjectWithClient[];
  catalog: CatalogItem[];
  initial?: BudgetWithRelations;
  presetClientId?: string;
  presetProjectId?: string;
  onSubmit: (values: BudgetFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const [catalogId, setCatalogId] = useState("");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      client_id: initial?.client_id ?? presetClientId ?? "",
      project_id: initial?.project_id ?? presetProjectId ?? "",
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      issue_date: initial?.issue_date ?? today(),
      valid_until: initial?.valid_until ?? "",
      execution_deadline: initial?.execution_deadline ?? "",
      payment_terms: initial?.payment_terms ?? "",
      included_scope: initial?.included_scope ?? "",
      excluded_scope: initial?.excluded_scope ?? "",
      customer_notes: initial?.customer_notes ?? "",
      internal_notes: initial?.internal_notes ?? "",
      discount_total: initial?.discount_total ?? 0,
      tax_total: initial?.tax_total ?? 0,
      status: initial?.status ?? "draft",
      items: initial?.budget_items?.length
        ? initial.budget_items.map((item) => ({
            id: item.id,
            catalog_item_id: item.catalog_item_id,
            name: item.name,
            description: item.description ?? "",
            type: item.type ?? "",
            unit: item.unit,
            quantity: item.quantity,
            cost_unit: item.cost_unit,
            price_unit: item.price_unit,
            discount: item.discount,
            margin: item.margin,
            subtotal: item.subtotal,
            sort_order: item.sort_order,
            notes: item.notes ?? ""
          }))
        : []
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const selectedClient = useWatch({ control, name: "client_id" });
  const items = useWatch({ control, name: "items" }) ?? [];
  const discountTotal = useWatch({ control, name: "discount_total" }) ?? 0;
  const taxTotal = useWatch({ control, name: "tax_total" }) ?? 0;

  const filteredProjects = useMemo(() => projects.filter((project) => !selectedClient || project.client_id === selectedClient), [projects, selectedClient]);
  const totals = calculateBudgetTotals({ items, discount_total: discountTotal, tax_total: taxTotal });

  function addManualItem() {
    append({
      catalog_item_id: null,
      name: "",
      description: "",
      type: "manual",
      unit: "unit",
      quantity: 1,
      cost_unit: 0,
      price_unit: 0,
      discount: 0,
      margin: 0,
      subtotal: 0,
      sort_order: fields.length,
      notes: ""
    });
  }

  function addCatalogItem() {
    const item = catalog.find((entry) => entry.id === catalogId);
    if (!item) return;
    append({
      catalog_item_id: item.id,
      name: item.name,
      description: item.description ?? "",
      type: item.type,
      unit: item.unit,
      quantity: 1,
      cost_unit: item.cost_unit,
      price_unit: item.price_unit,
      discount: 0,
      margin: item.default_margin,
      subtotal: item.price_unit,
      sort_order: fields.length,
      notes: item.notes ?? ""
    });
    setCatalogId("");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <Card>
        <CardHeader><h2 className="font-semibold">Cabeçalho</h2></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Cliente" error={errors.client_id?.message}>
              <Select {...register("client_id")} onChange={(event) => {
                setValue("client_id", event.target.value);
                setValue("project_id", "");
              }}>
                <option value="">Selecione</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </Select>
            </Field>
            <Field label="Obra/projeto" error={errors.project_id?.message}>
              <Select {...register("project_id")}>
                <option value="">Sem vínculo</option>
                {filteredProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </Select>
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <Select {...register("status")}>
                {Object.entries(budgetStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
            </Field>
            <Field label="Título" error={errors.title?.message} className="md:col-span-2">
              <Input {...register("title")} />
            </Field>
            <Field label="Emissão" error={errors.issue_date?.message}>
              <Input {...register("issue_date")} type="date" />
            </Field>
            <Field label="Validade" error={errors.valid_until?.message}>
              <Input {...register("valid_until")} type="date" />
            </Field>
            <Field label="Prazo de execução" error={errors.execution_deadline?.message} className="md:col-span-2">
              <Input {...register("execution_deadline")} placeholder="Ex.: 20 dias úteis após aprovação" />
            </Field>
          </div>
          <Field label="Descrição" error={errors.description?.message}>
            <Textarea {...register("description")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="font-semibold">Itens do orçamento</h2>
            <div className="flex flex-col gap-2 md:flex-row">
              <Select value={catalogId} onChange={(event) => setCatalogId(event.target.value)} className="md:w-72">
                <option value="">Selecionar item do catálogo</option>
                {catalog.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} · {catalogTypeLabels[item.type]}</option>
                ))}
              </Select>
              <Button type="button" variant="secondary" onClick={addCatalogItem} disabled={!catalogId}>
                <Plus className="h-4 w-4" />
                Catálogo
              </Button>
              <Button type="button" variant="secondary" onClick={addManualItem}>
                <Plus className="h-4 w-4" />
                Manual
              </Button>
            </div>
          </div>
          {errors.items?.message ? <p className="mt-2 text-sm font-medium text-red-700">{errors.items.message}</p> : null}
        </CardHeader>
        <CardContent>
          <div className="industrial-scrollbar overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Unidade</th>
                  <th className="px-3 py-2">Qtd.</th>
                  <th className="px-3 py-2">Custo</th>
                  <th className="px-3 py-2">Preço</th>
                  <th className="px-3 py-2">Desconto</th>
                  <th className="px-3 py-2">Subtotal</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fields.map((field, index) => {
                  const itemSubtotal = calculateItemSubtotal(items[index] ?? field);
                  return (
                    <tr key={field.id}>
                      <td className="px-3 py-2">
                        <Input {...register(`items.${index}.name`)} placeholder="Nome do item" />
                        {errors.items?.[index]?.name?.message ? <p className="mt-1 text-xs text-red-700">{errors.items[index]?.name?.message}</p> : null}
                      </td>
                      <td className="px-3 py-2">
                        <Select {...register(`items.${index}.unit`)}>
                          {Object.entries(unitLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </Select>
                      </td>
                      <td className="px-3 py-2"><Input {...register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" min="0.0001" step="0.0001" /></td>
                      <td className="px-3 py-2"><Input {...register(`items.${index}.cost_unit`, { valueAsNumber: true })} type="number" min="0" step="0.01" /></td>
                      <td className="px-3 py-2"><Input {...register(`items.${index}.price_unit`, { valueAsNumber: true })} type="number" min="0" step="0.01" /></td>
                      <td className="px-3 py-2"><Input {...register(`items.${index}.discount`, { valueAsNumber: true })} type="number" min="0" step="0.01" /></td>
                      <td className="px-3 py-2 font-semibold">{formatCurrency(itemSubtotal)}</td>
                      <td className="px-3 py-2 text-right">
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remover item">
                          <Trash2 className="h-4 w-4 text-red-700" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader><h2 className="font-semibold">Condições e escopo</h2></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Condições de pagamento" error={errors.payment_terms?.message}>
              <Textarea {...register("payment_terms")} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Escopo incluso" error={errors.included_scope?.message}>
                <Textarea {...register("included_scope")} />
              </Field>
              <Field label="Escopo não incluso" error={errors.excluded_scope?.message}>
                <Textarea {...register("excluded_scope")} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Observações para o cliente" error={errors.customer_notes?.message}>
                <Textarea {...register("customer_notes")} />
              </Field>
              <Field label="Observações internas" error={errors.internal_notes?.message}>
                <Textarea {...register("internal_notes")} />
              </Field>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Totais</h2></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Desconto total" error={errors.discount_total?.message}>
              <Input {...register("discount_total", { valueAsNumber: true })} type="number" min="0" step="0.01" />
            </Field>
            <Field label="Impostos/taxas" error={errors.tax_total?.message}>
              <Input {...register("tax_total", { valueAsNumber: true })} type="number" min="0" step="0.01" />
            </Field>
            <div className="grid gap-2 rounded-md border border-border bg-slate-50 p-3 text-sm">
              <TotalLine label="Subtotal" value={totals.subtotal} />
              <TotalLine label="Desconto" value={totals.discount_total} />
              <TotalLine label="Taxas" value={totals.tax_total} />
              <TotalLine label="Margem estimada" value={totals.margin_total} />
              <div className="flex items-center justify-between border-t border-border pt-2 text-base font-bold">
                <span>Total final</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : submitLabel}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function TotalLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );
}
