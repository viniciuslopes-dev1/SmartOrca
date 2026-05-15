"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { clientSchema, type ClientFormValues } from "@/lib/validations/schemas";
import type { Client } from "@/types/database.types";

const defaults: ClientFormValues = {
  name: "",
  person_type: "individual",
  document: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  state: "",
  notes: "",
  is_active: true
};

export function ClientForm({
  initial,
  onSubmit,
  submitLabel,
  isSubmitting
}: {
  initial?: Client;
  onSubmit: (values: ClientFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          person_type: initial.person_type,
          document: initial.document ?? "",
          phone: initial.phone ?? "",
          whatsapp: initial.whatsapp ?? "",
          email: initial.email ?? "",
          address: initial.address ?? "",
          city: initial.city ?? "",
          state: initial.state ?? "",
          notes: initial.notes ?? "",
          is_active: initial.is_active
        }
      : defaults
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome ou razão social" error={errors.name?.message}>
          <Input {...register("name")} placeholder="Ex.: Construtora Alpha" />
        </Field>
        <Field label="Tipo" error={errors.person_type?.message}>
          <Select {...register("person_type")}>
            <option value="individual">Pessoa física</option>
            <option value="company">Pessoa jurídica</option>
          </Select>
        </Field>
        <Field label="CPF/CNPJ" error={errors.document?.message}>
          <Input {...register("document")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" />
        </Field>
        <Field label="Telefone" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <Input {...register("whatsapp")} />
        </Field>
        <Field label="Cidade" error={errors.city?.message}>
          <Input {...register("city")} />
        </Field>
        <Field label="Estado" error={errors.state?.message}>
          <Input {...register("state")} maxLength={2} />
        </Field>
      </div>
      <Field label="Endereço" error={errors.address?.message}>
        <Input {...register("address")} />
      </Field>
      <Field label="Observações" error={errors.notes?.message}>
        <Textarea {...register("notes")} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" {...register("is_active")} className="h-4 w-4" />
        Cliente ativo
      </label>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
