"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { projectStatusLabels } from "@/lib/labels";
import { projectSchema, type ProjectFormValues } from "@/lib/validations/schemas";
import type { Client, ProjectWithClient } from "@/types/database.types";

export function ProjectForm({
  clients,
  initial,
  presetClientId,
  onSubmit,
  submitLabel,
  isSubmitting
}: {
  clients: Client[];
  initial?: ProjectWithClient;
  presetClientId?: string;
  onSubmit: (values: ProjectFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_id: initial?.client_id ?? presetClientId ?? "",
      name: initial?.name ?? "",
      service_type: initial?.service_type ?? "",
      address: initial?.address ?? "",
      city: initial?.city ?? "",
      state: initial?.state ?? "",
      expected_start_date: initial?.expected_start_date ?? "",
      expected_end_date: initial?.expected_end_date ?? "",
      status: initial?.status ?? "planning",
      description: initial?.description ?? "",
      notes: initial?.notes ?? ""
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Cliente" error={errors.client_id?.message}>
          <Select {...register("client_id")}>
            <option value="">Selecione</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select {...register("status")}>
            {Object.entries(projectStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nome da obra/projeto" error={errors.name?.message}>
          <Input {...register("name")} />
        </Field>
        <Field label="Tipo de serviço" error={errors.service_type?.message}>
          <Input {...register("service_type")} />
        </Field>
        <Field label="Início previsto" error={errors.expected_start_date?.message}>
          <Input {...register("expected_start_date")} type="date" />
        </Field>
        <Field label="Término previsto" error={errors.expected_end_date?.message}>
          <Input {...register("expected_end_date")} type="date" />
        </Field>
        <Field label="Cidade" error={errors.city?.message}>
          <Input {...register("city")} />
        </Field>
        <Field label="Estado" error={errors.state?.message}>
          <Input {...register("state")} maxLength={2} />
        </Field>
      </div>
      <Field label="Endereço da obra" error={errors.address?.message}>
        <Input {...register("address")} />
      </Field>
      <Field label="Descrição" error={errors.description?.message}>
        <Textarea {...register("description")} />
      </Field>
      <Field label="Observações" error={errors.notes?.message}>
        <Textarea {...register("notes")} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
