"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { usePasswordReset } from "@/hooks/useAuth";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/schemas";

export default function ForgotPasswordPage() {
  const reset = usePasswordReset();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  function submit(values: ForgotPasswordFormValues) {
    reset.mutate(values, { onSuccess: () => setSent(true) });
  }

  return (
    <AuthShell title="Recuperar senha" description="Informe o email cadastrado para receber o link de recuperação.">
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        <Field label="Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" autoComplete="email" />
        </Field>
        {reset.isError ? <p className="text-sm font-medium text-red-700">{(reset.error as Error).message}</p> : null}
        {sent ? <p className="text-sm font-medium text-emerald-700">Se o email existir, enviaremos as instruções de recuperação.</p> : null}
        <Button type="submit" disabled={reset.isPending}>{reset.isPending ? "Enviando..." : "Enviar link"}</Button>
        <Link className="text-sm font-medium text-primary" href="/login">Voltar para login</Link>
      </form>
    </AuthShell>
  );
}
