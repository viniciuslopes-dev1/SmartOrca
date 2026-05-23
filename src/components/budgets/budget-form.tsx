"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Layers3, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { type Control, type FieldErrors, type UseFormRegister, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { calculateGroupedBudgetTotals, calculateGroupSubtotal, calculateItemSubtotal } from "@/lib/calculations/budget";
import { BUDGET_LAYOUTS, resolveBudgetLayoutId } from "@/lib/budget-layouts";
import { formatCurrency } from "@/lib/formatters";
import { budgetGroupTypeLabels, budgetStatusLabels, catalogTypeLabels, unitLabels } from "@/lib/labels";
import { budgetSchema, type BudgetFormValues, type BudgetItemFormValues } from "@/lib/validations/schemas";
import type { BudgetGroupType, BudgetWithRelations, CatalogItem, CatalogItemType, Client, ProjectWithClient } from "@/types/database.types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyItem(sortOrder: number): BudgetItemFormValues {
  return {
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
    sort_order: sortOrder,
    notes: ""
  };
}

function defaultGroup(type: BudgetGroupType, sortOrder: number) {
  return {
    name: budgetGroupTypeLabels[type],
    type,
    sort_order: sortOrder,
    subtotal: 0,
    notes: "",
    items: [emptyItem(0)]
  };
}

function initialGroups(initial?: BudgetWithRelations): BudgetFormValues["groups"] {
  if (!initial) return [defaultGroup("labor", 0)];

  const groups = initial.budget_groups?.length
    ? initial.budget_groups
    : [
        {
          id: "legacy-items",
          budget_id: initial.id,
          name: "Itens do orçamento",
          type: "service" as BudgetGroupType,
          sort_order: 0,
          subtotal: initial.subtotal,
          notes: null,
          created_at: initial.created_at,
          updated_at: initial.updated_at,
          budget_items: initial.budget_items ?? []
        }
      ];

  return groups.map((group, groupIndex) => ({
    id: group.id === "legacy-items" ? undefined : group.id,
    name: group.name,
    type: group.type,
    sort_order: groupIndex,
    subtotal: group.subtotal,
    notes: group.notes ?? "",
    items: group.budget_items.map((item, itemIndex) => ({
      id: item.id,
      group_id: item.group_id,
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
      sort_order: itemIndex,
      notes: item.notes ?? ""
    }))
  }));
}

export function BudgetForm({
  clients,
  projects,
  catalog,
  initial,
  presetClientId,
  presetProjectId,
  defaultLayoutId,
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
  defaultLayoutId?: string;
  onSubmit: (values: BudgetFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const [newGroupType, setNewGroupType] = useState<BudgetGroupType>("material");
  const [groupToRemove, setGroupToRemove] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
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
      budget_layout: resolveBudgetLayoutId(initial?.budget_layout ?? defaultLayoutId),
      status: initial?.status ?? "draft",
      groups: initialGroups(initial)
    }
  });
  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({ control, name: "groups" });
  const selectedClient = useWatch({ control, name: "client_id" });
  const groups = useWatch({ control, name: "groups" }) ?? [];
  const discountTotal = useWatch({ control, name: "discount_total" }) ?? 0;
  const taxTotal = useWatch({ control, name: "tax_total" }) ?? 0;

  const filteredProjects = useMemo(() => projects.filter((project) => !selectedClient || project.client_id === selectedClient), [projects, selectedClient]);
  const totals = calculateGroupedBudgetTotals({ groups, discount_total: discountTotal, tax_total: taxTotal });

  function addGroup() {
    appendGroup(defaultGroup(newGroupType, groupFields.length));
  }

  function requestRemoveGroup(index: number) {
    setGroupToRemove(index);
  }

  function confirmRemoveGroup() {
    if (groupToRemove === null) return;
    removeGroup(groupToRemove);
    setGroupToRemove(null);
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
            <Field label="Template" error={errors.budget_layout?.message}>
              <Select {...register("budget_layout")}>
                {BUDGET_LAYOUTS.map((layout) => <option key={layout.id} value={layout.id}>{layout.name}</option>)}
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
          <Field label="Descrição que aparece no orçamento" error={errors.description?.message}>
            <Textarea {...register("description")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold">Composição do orçamento</h2>
              <p className="text-sm text-slate-500">Monte grupos por etapa, serviço, material ou mão de obra e acompanhe o impacto no total.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={newGroupType} onChange={(event) => setNewGroupType(event.target.value as BudgetGroupType)} className="sm:w-52">
                {Object.entries(budgetGroupTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={addGroup}>
                <Layers3 className="h-4 w-4" />
                Adicionar grupo
              </Button>
            </div>
          </div>
          {errors.groups?.message ? <p className="mt-2 text-sm font-medium text-red-700">{errors.groups.message}</p> : null}
        </CardHeader>
        <CardContent className="grid gap-4">
          {groupFields.map((field, groupIndex) => (
            <BudgetGroupEditor
              key={field.id}
              groupIndex={groupIndex}
              control={control}
              register={register}
              errors={errors}
              catalog={catalog}
              onRemoveGroup={() => requestRemoveGroup(groupIndex)}
            />
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader><h2 className="font-semibold">Condições e escopo</h2></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Condições de pagamento para o cliente" error={errors.payment_terms?.message}>
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
              <Field label="Observações internas (não aparecem no PDF)" error={errors.internal_notes?.message}>
                <Textarea {...register("internal_notes")} />
              </Field>
            </div>
          </CardContent>
        </Card>
        <BudgetTotalsPanel
          totals={totals}
          discountError={errors.discount_total?.message}
          taxError={errors.tax_total?.message}
          register={register}
          submitLabel={submitLabel}
          isSubmitting={isSubmitting}
        />
      </div>
      <ConfirmDialog
        open={groupToRemove !== null}
        title="Remover grupo do orçamento?"
        description="Todos os itens deste grupo serão removidos desta edição. Revise o total antes de salvar."
        confirmLabel="Remover grupo"
        onConfirm={confirmRemoveGroup}
        onCancel={() => setGroupToRemove(null)}
      />
    </form>
  );
}

function BudgetTotalsPanel({
  totals,
  discountError,
  taxError,
  register,
  submitLabel,
  isSubmitting
}: {
  totals: ReturnType<typeof calculateGroupedBudgetTotals>;
  discountError?: string;
  taxError?: string;
  register: UseFormRegister<BudgetFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  return (
    <Card className="lg:sticky lg:top-20 lg:self-start">
      <CardHeader>
        <div>
          <h2 className="font-semibold">Conferência dos valores</h2>
          <p className="text-sm text-slate-500">Resumo atualizado conforme itens, descontos e taxas mudam.</p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Field label="Desconto total" error={discountError}>
            <Input {...register("discount_total", { valueAsNumber: true })} type="number" min="0" step="0.01" />
          </Field>
          <Field label="Impostos e taxas" error={taxError}>
            <Input {...register("tax_total", { valueAsNumber: true })} type="number" min="0" step="0.01" />
          </Field>
        </div>
        <div className="grid gap-2 rounded-lg border border-border bg-slate-50 p-4 text-sm">
          <TotalLine label="Subtotal dos grupos" value={totals.subtotal} />
          <TotalLine label="Descontos aplicados" value={totals.discount_total} />
          <TotalLine label="Impostos e taxas" value={totals.tax_total} />
          <TotalLine label="Margem estimada" value={totals.margin_total} />
          <div className="mt-1 flex flex-col gap-1 border-t border-border pt-3 text-base font-bold text-slate-950 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <span>Total final</span>
            <span className="text-lg">{formatCurrency(totals.total)}</span>
          </div>
        </div>
        <p className="text-xs leading-5 text-slate-500">
          Antes de salvar, confira se o total final bate com a proposta que será enviada ao cliente.
        </p>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

function BudgetGroupEditor({
  groupIndex,
  control,
  register,
  errors,
  catalog,
  onRemoveGroup
}: {
  groupIndex: number;
  control: Control<BudgetFormValues>;
  register: UseFormRegister<BudgetFormValues>;
  errors: FieldErrors<BudgetFormValues>;
  catalog: CatalogItem[];
  onRemoveGroup: () => void;
}) {
  const [catalogType, setCatalogType] = useState<CatalogItemType | "">("");
  const [catalogId, setCatalogId] = useState("");
  const name = `groups.${groupIndex}.items` as const;
  const { fields, append, remove } = useFieldArray({ control, name });
  const items = useWatch({ control, name }) ?? [];
  const subtotal = calculateGroupSubtotal({ items });
  const catalogTypes = useMemo(() => {
    const types = new Set(catalog.map((item) => item.type));
    return Array.from(types).sort((a, b) => catalogTypeLabels[a].localeCompare(catalogTypeLabels[b], "pt-BR"));
  }, [catalog]);
  const filteredCatalog = useMemo(() => {
    if (!catalogType) return [];
    return catalog.filter((item) => item.type === catalogType);
  }, [catalog, catalogType]);

  function addManualItem() {
    append(emptyItem(fields.length));
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
    <section className="rounded-md border border-border bg-white">
      <div className="grid gap-3 border-b border-border bg-slate-50 p-3 lg:grid-cols-[1fr_180px_160px_auto] lg:items-end">
        <Field label="Grupo" error={errors.groups?.[groupIndex]?.name?.message}>
          <Input {...register(`groups.${groupIndex}.name`)} placeholder="Ex.: Mão de obra" />
        </Field>
        <Field label="Tipo" error={errors.groups?.[groupIndex]?.type?.message}>
          <Select {...register(`groups.${groupIndex}.type`)}>
            {Object.entries(budgetGroupTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </Field>
        <div className="rounded-md border border-border bg-white px-3 py-2">
          <div className="text-xs font-semibold uppercase text-slate-500">Subtotal</div>
          <div className="text-base font-bold text-slate-900">{formatCurrency(subtotal)}</div>
        </div>
        <Button type="button" variant="ghost" onClick={onRemoveGroup}>
          <Trash2 className="h-4 w-4 text-red-700" />
          Remover
        </Button>
      </div>
      <div className="grid gap-3 p-3">
        <Field label="Observações do grupo" error={errors.groups?.[groupIndex]?.notes?.message}>
          <Input {...register(`groups.${groupIndex}.notes`)} placeholder="Opcional" />
        </Field>
        <div className="grid gap-2 md:grid-cols-[220px_minmax(280px,1fr)_auto_auto]">
          <Select
            value={catalogType}
            onChange={(event) => {
              setCatalogType(event.target.value as CatalogItemType | "");
              setCatalogId("");
            }}
          >
            <option value="">Tipo do catálogo</option>
            {catalogTypes.map((type) => (
              <option key={type} value={type}>{catalogTypeLabels[type]}</option>
            ))}
          </Select>
          <Select value={catalogId} onChange={(event) => setCatalogId(event.target.value)} disabled={!catalogType}>
            <option value="">{catalogType ? "Selecionar item" : "Escolha um tipo primeiro"}</option>
            {filteredCatalog.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </Select>
          <Button type="button" variant="secondary" className="w-full" onClick={addCatalogItem} disabled={!catalogId}>
            <Plus className="h-4 w-4" />
            Adicionar do catálogo
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={addManualItem}>
            <Plus className="h-4 w-4" />
            Adicionar item manual
          </Button>
        </div>
        {errors.groups?.[groupIndex]?.items?.message ? <p className="text-sm font-medium text-red-700">{errors.groups[groupIndex]?.items?.message}</p> : null}
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
              {fields.map((field, itemIndex) => {
                const itemSubtotal = calculateItemSubtotal(items[itemIndex] ?? field);
                return (
                  <tr key={field.id}>
                    <td className="px-3 py-2">
                      <Input {...register(`groups.${groupIndex}.items.${itemIndex}.name`)} placeholder="Nome do item" />
                      {errors.groups?.[groupIndex]?.items?.[itemIndex]?.name?.message ? <p className="mt-1 text-xs text-red-700">{errors.groups[groupIndex]?.items?.[itemIndex]?.name?.message}</p> : null}
                    </td>
                    <td className="px-3 py-2">
                      <Select {...register(`groups.${groupIndex}.items.${itemIndex}.unit`)}>
                        {Object.entries(unitLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </Select>
                    </td>
                    <td className="px-3 py-2"><Input {...register(`groups.${groupIndex}.items.${itemIndex}.quantity`, { valueAsNumber: true })} type="number" min="0.0001" step="0.0001" /></td>
                    <td className="px-3 py-2"><Input {...register(`groups.${groupIndex}.items.${itemIndex}.cost_unit`, { valueAsNumber: true })} type="number" min="0" step="0.01" /></td>
                    <td className="px-3 py-2"><Input {...register(`groups.${groupIndex}.items.${itemIndex}.price_unit`, { valueAsNumber: true })} type="number" min="0" step="0.01" /></td>
                    <td className="px-3 py-2"><Input {...register(`groups.${groupIndex}.items.${itemIndex}.discount`, { valueAsNumber: true })} type="number" min="0" step="0.01" /></td>
                    <td className="px-3 py-2 font-semibold">{formatCurrency(itemSubtotal)}</td>
                    <td className="px-3 py-2 text-right">
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(itemIndex)} aria-label="Remover item">
                        <Trash2 className="h-4 w-4 text-red-700" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function TotalLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );
}

