"use client";

import { useForm } from "react-hook-form";
import { ErrorState, LoadingState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import type { Settings } from "@/types/database.types";

type SettingsFormValues = Pick<
  Settings,
  "company_name" | "company_document" | "company_phone" | "company_email" | "company_address" | "default_budget_validity_days" | "default_payment_terms" | "default_notes"
>;

export default function SettingsPage() {
  const settings = useSettings();

  return (
    <>
      <PageHeader title="Configurações" description="Dados usados no PDF e padrões de orçamento." />
      {settings.isLoading ? <LoadingState /> : null}
      {settings.isError ? <ErrorState message={(settings.error as Error).message} onRetry={() => settings.refetch()} /> : null}
      {settings.data ? <SettingsForm settings={settings.data} /> : null}
    </>
  );
}

function SettingsForm({ settings }: { settings: Settings }) {
  const update = useUpdateSettings();
  const { register, handleSubmit } = useForm<SettingsFormValues>({
    defaultValues: {
      company_name: settings.company_name,
      company_document: settings.company_document ?? "",
      company_phone: settings.company_phone ?? "",
      company_email: settings.company_email ?? "",
      company_address: settings.company_address ?? "",
      default_budget_validity_days: settings.default_budget_validity_days,
      default_payment_terms: settings.default_payment_terms ?? "",
      default_notes: settings.default_notes ?? ""
    }
  });

  return (
    <Card>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit((values) => update.mutate(values))}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome da empresa/prestador"><Input {...register("company_name", { required: true })} /></Field>
            <Field label="Documento"><Input {...register("company_document")} /></Field>
            <Field label="Telefone"><Input {...register("company_phone")} /></Field>
            <Field label="Email"><Input {...register("company_email")} type="email" /></Field>
            <Field label="Validade padrão em dias"><Input {...register("default_budget_validity_days", { valueAsNumber: true })} type="number" min="1" /></Field>
          </div>
          <Field label="Endereço"><Input {...register("company_address")} /></Field>
          <Field label="Condições de pagamento padrão"><Textarea {...register("default_payment_terms")} /></Field>
          <Field label="Observações padrão"><Textarea {...register("default_notes")} /></Field>
          <div className="flex items-center justify-end gap-3">
            {update.isSuccess ? <span className="text-sm font-medium text-emerald-700">Configurações salvas.</span> : null}
            {update.isError ? <span className="text-sm font-medium text-red-700">{(update.error as Error).message}</span> : null}
            <Button type="submit" disabled={update.isPending}>{update.isPending ? "Salvando..." : "Salvar configurações"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
