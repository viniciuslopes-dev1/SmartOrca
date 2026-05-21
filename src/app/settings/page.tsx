"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BudgetLayoutPreview } from "@/components/budgets/budget-layout-preview";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useRemoveWorkspaceLogo, useSettings, useUpdateSettings, useUploadWorkspaceLogo } from "@/hooks/useSettings";
import { BUDGET_LAYOUTS, resolveBudgetLayoutId } from "@/lib/budget-layouts";
import { validateLogoFile } from "@/services/settings.service";
import type { Settings } from "@/types/database.types";

type SettingsFormValues = Pick<
  Settings,
  "company_name" | "company_document" | "company_phone" | "company_email" | "company_address" | "default_budget_validity_days" | "default_payment_terms" | "default_notes" | "default_budget_layout"
>;

const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024;
const LOGO_MIN_DIMENSION = 80;
const LOGO_MAX_DIMENSION = 2400;

export default function SettingsPage() {
  const settings = useSettings();

  return (
    <>
      <PageHeader title="Configuracoes" description="Dados da empresa, logo e layout padrao dos orcamentos." />
      {settings.isLoading ? <LoadingState /> : null}
      {settings.isError ? <ErrorState message={(settings.error as Error).message} onRetry={() => settings.refetch()} /> : null}
      {settings.data ? <SettingsForm settings={settings.data} /> : null}
    </>
  );
}

function SettingsForm({ settings }: { settings: Settings }) {
  const update = useUpdateSettings();
  const uploadLogo = useUploadWorkspaceLogo();
  const removeLogo = useRemoveWorkspaceLogo();
  const [logoError, setLogoError] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState(resolveBudgetLayoutId(settings.default_budget_layout));

  const { register, handleSubmit, setValue, watch } = useForm<SettingsFormValues>({
    defaultValues: {
      company_name: settings.company_name,
      company_document: settings.company_document ?? "",
      company_phone: settings.company_phone ?? "",
      company_email: settings.company_email ?? "",
      company_address: settings.company_address ?? "",
      default_budget_validity_days: settings.default_budget_validity_days,
      default_payment_terms: settings.default_payment_terms ?? "",
      default_notes: settings.default_notes ?? "",
      default_budget_layout: resolveBudgetLayoutId(settings.default_budget_layout)
    }
  });

  const currentLayout = watch("default_budget_layout");
  const previewBudget = useMemo(() => ({
    budget_number: 1042,
    title: "Reforma residencial",
    issue_date: new Date().toISOString().slice(0, 10),
    valid_until: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    payment_terms: "50% na aprovacao e 50% na entrega",
    execution_deadline: "20 dias uteis",
    included_scope: "Servicos, materiais e mao de obra conforme composicao.",
    excluded_scope: "Taxas de prefeitura e adequacoes estruturais nao previstas.",
    customer_notes: "Validade sujeita a vistoria tecnica inicial.",
    subtotal: 12500,
    discount_total: 500,
    tax_total: 320,
    total: 12320,
    clients: { id: "mock", workspace_id: "mock", name: "Cliente Exemplo", person_type: "individual" as const, document: null, phone: null, whatsapp: null, email: null, address: null, city: null, state: null, notes: null, is_active: true, created_at: "", updated_at: "" },
    projects: null,
    budget_groups: [
      { id: "g1", budget_id: "b1", name: "Mao de obra", type: "labor", sort_order: 0, subtotal: 6000, notes: null, created_at: "", updated_at: "", budget_items: [{ id: "i1", budget_id: "b1", group_id: "g1", catalog_item_id: null, name: "Equipe eletrica", description: null, type: null, unit: "day", quantity: 8, cost_unit: 400, price_unit: 750, discount: 0, margin: 0, subtotal: 6000, sort_order: 0, notes: null, created_at: "", updated_at: "" }] },
      { id: "g2", budget_id: "b1", name: "Materiais", type: "material", sort_order: 1, subtotal: 6500, notes: null, created_at: "", updated_at: "", budget_items: [{ id: "i2", budget_id: "b1", group_id: "g2", catalog_item_id: null, name: "Cabos e disjuntores", description: null, type: null, unit: "unit", quantity: 1, cost_unit: 4300, price_unit: 6500, discount: 0, margin: 0, subtotal: 6500, sort_order: 0, notes: null, created_at: "", updated_at: "" }] }
    ]
  }), []);

  async function onSelectLogo(file?: File) {
    if (!file) return;
    setLogoError(null);
    try {
      validateLogoFile(file, { maxSizeBytes: LOGO_MAX_SIZE_BYTES });
      await validateImageDimensions(file);
      await uploadLogo.mutateAsync(file);
    } catch (error) {
      setLogoError((error as Error).message);
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader><h2 className="font-semibold">Identidade visual</h2></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg border border-border bg-slate-50">
            {settings.logo_url ? <img src={settings.logo_url} alt="Logo da empresa" className="h-full w-full object-contain" /> : <span className="text-xs text-slate-500">Sem logo</span>}
          </div>
          <div className="grid gap-3">
            <p className="text-sm text-slate-600">Formatos: PNG, JPG, JPEG e WEBP. Tamanho maximo: 2MB.</p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                void onSelectLogo(file);
              }}
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" disabled={removeLogo.isPending || !settings.logo_path} onClick={() => removeLogo.mutate(settings.logo_path)}>
                {removeLogo.isPending ? "Removendo..." : "Remover logo"}
              </Button>
            </div>
            {uploadLogo.isPending ? <p className="text-sm text-slate-500">Enviando logo...</p> : null}
            {logoError || uploadLogo.isError ? <p className="text-sm font-medium text-red-700">{logoError ?? (uploadLogo.error as Error).message}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold">Dados da empresa e padroes</h2></CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit((values) => update.mutate(values))}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome da empresa/prestador"><Input {...register("company_name", { required: true })} /></Field>
              <Field label="Documento"><Input {...register("company_document")} /></Field>
              <Field label="Telefone"><Input {...register("company_phone")} /></Field>
              <Field label="Email"><Input {...register("company_email")} type="email" /></Field>
              <Field label="Validade padrao em dias"><Input {...register("default_budget_validity_days", { valueAsNumber: true })} type="number" min="1" /></Field>
            </div>
            <Field label="Endereco"><Input {...register("company_address")} /></Field>
            <Field label="Condicoes de pagamento padrao"><Textarea {...register("default_payment_terms")} /></Field>
            <Field label="Observacoes padrao"><Textarea {...register("default_notes")} /></Field>

            <div className="grid gap-3">
              <h3 className="font-semibold">Template de orcamento</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {BUDGET_LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => {
                      setSelectedLayout(layout.id);
                      setValue("default_budget_layout", layout.id, { shouldDirty: true });
                    }}
                    className={`rounded-lg border p-3 text-left transition ${currentLayout === layout.id ? "border-primary bg-sky-50" : "border-border bg-white hover:bg-slate-50"}`}
                  >
                    <div className="text-sm font-semibold">{layout.name}</div>
                    <div className="text-xs text-slate-500">{layout.description}</div>
                    {currentLayout === layout.id ? <div className="mt-2 text-xs font-semibold text-sky-700">Template ativo</div> : null}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register("default_budget_layout")} />
            </div>

            <div className="flex items-center justify-end gap-3">
              {update.isSuccess ? <span className="text-sm font-medium text-emerald-700">Configuracoes salvas.</span> : null}
              {update.isError ? <span className="text-sm font-medium text-red-700">{(update.error as Error).message}</span> : null}
              <Button type="submit" disabled={update.isPending}>{update.isPending ? "Salvando..." : "Salvar configuracoes"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold">Preview do template</h2></CardHeader>
        <CardContent>
          <BudgetLayoutPreview budget={{ ...(previewBudget as any), budget_layout: selectedLayout }} settings={{ ...settings, default_budget_layout: selectedLayout }} layoutId={selectedLayout} />
        </CardContent>
      </Card>
    </div>
  );
}

async function validateImageDimensions(file: File) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.width, height: image.height });
      image.onerror = () => reject(new Error("Nao foi possivel validar as dimensoes da imagem."));
      image.src = imageUrl;
    });

    if (dimensions.width < LOGO_MIN_DIMENSION || dimensions.height < LOGO_MIN_DIMENSION) {
      throw new Error(`Logo muito pequena. Use no minimo ${LOGO_MIN_DIMENSION}x${LOGO_MIN_DIMENSION}px.`);
    }

    if (dimensions.width > LOGO_MAX_DIMENSION || dimensions.height > LOGO_MAX_DIMENSION) {
      throw new Error(`Logo muito grande. Use no maximo ${LOGO_MAX_DIMENSION}x${LOGO_MAX_DIMENSION}px.`);
    }
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}



