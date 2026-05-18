"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useSignUp } from "@/hooks/useAuth";
import { useCreateWorkspace } from "@/hooks/useWorkspace";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const signUp = useSignUp();
  const createWorkspace = useCreateWorkspace();
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      workspace_name: "",
      password: "",
      password_confirmation: ""
    }
  });

  function submit(values: RegisterFormValues) {
    setSuccessMessage("");
    signUp.mutate(values, {
      onSuccess: async (data) => {
        if (data.session) {
          await createWorkspace.mutateAsync({ workspace_name: values.workspace_name, phone: values.phone || null });
          router.replace("/dashboard");
          return;
        }
        setSuccessMessage("Cadastro criado. Confirme seu email e depois faça login para concluir o workspace.");
      }
    });
  }

  return (
    <AuthShell title="Criar conta" description="Cadastre seu usuário e a empresa que vai emitir os orçamentos.">
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        <Field label="Nome" error={errors.full_name?.message}>
          <Input {...register("full_name")} autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" autoComplete="email" />
        </Field>
        <Field label="Telefone" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </Field>
        <Field label="Empresa/workspace" error={errors.workspace_name?.message}>
          <Input {...register("workspace_name")} />
        </Field>
        <Field label="Senha" error={errors.password?.message}>
          <Input {...register("password")} type="password" autoComplete="new-password" />
        </Field>
        <Field label="Confirmar senha" error={errors.password_confirmation?.message}>
          <Input {...register("password_confirmation")} type="password" autoComplete="new-password" />
        </Field>
        {signUp.isError ? <p className="text-sm font-medium text-red-700">{(signUp.error as Error).message}</p> : null}
        {createWorkspace.isError ? <p className="text-sm font-medium text-red-700">{(createWorkspace.error as Error).message}</p> : null}
        {successMessage ? <p className="text-sm font-medium text-emerald-700">{successMessage}</p> : null}
        <Button type="submit" disabled={signUp.isPending || createWorkspace.isPending}>
          {signUp.isPending || createWorkspace.isPending ? "Criando..." : "Cadastrar"}
        </Button>
        <Link className="text-sm font-medium text-primary" href="/login">Já tenho conta</Link>
      </form>
    </AuthShell>
  );
}
