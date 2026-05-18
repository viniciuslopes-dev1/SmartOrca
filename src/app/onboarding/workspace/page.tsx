"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useAuth } from "@/hooks/useAuth";
import { useCreateWorkspace } from "@/hooks/useWorkspace";
import { workspaceOnboardingSchema, type WorkspaceOnboardingFormValues } from "@/lib/validations/schemas";

export default function WorkspaceOnboardingPage() {
  const router = useRouter();
  const auth = useAuth();
  const createWorkspace = useCreateWorkspace();
  const metadata = auth.data?.user_metadata as { workspace_name?: string; phone?: string } | undefined;
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WorkspaceOnboardingFormValues>({
    resolver: zodResolver(workspaceOnboardingSchema),
    values: {
      workspace_name: metadata?.workspace_name ?? "",
      phone: metadata?.phone ?? ""
    }
  });

  function submit(values: WorkspaceOnboardingFormValues) {
    createWorkspace.mutate(
      { workspace_name: values.workspace_name, phone: values.phone || null },
      { onSuccess: () => router.replace("/dashboard") }
    );
  }

  return (
    <AuthShell title="Configurar workspace" description="Crie a empresa que será usada para clientes, obras e orçamentos.">
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        <Field label="Nome da empresa/workspace" error={errors.workspace_name?.message}>
          <Input {...register("workspace_name")} />
        </Field>
        <Field label="Telefone" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </Field>
        {createWorkspace.isError ? <p className="text-sm font-medium text-red-700">{(createWorkspace.error as Error).message}</p> : null}
        <Button type="submit" disabled={createWorkspace.isPending}>
          {createWorkspace.isPending ? "Criando..." : "Criar workspace"}
        </Button>
      </form>
    </AuthShell>
  );
}
