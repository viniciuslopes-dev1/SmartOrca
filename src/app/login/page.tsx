"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoadingState } from "@/components/feedback/data-state";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useSignIn } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/schemas";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  function submit(values: LoginFormValues) {
    signIn.mutate(values, {
      onSuccess: () => router.replace(searchParams.get("next") || "/dashboard")
    });
  }

  return (
    <AuthShell title="Entrar no sistema" description="Acesse sua área operacional com email e senha.">
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        <Field label="Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" autoComplete="email" />
        </Field>
        <Field label="Senha" error={errors.password?.message}>
          <Input {...register("password")} type="password" autoComplete="current-password" />
        </Field>
        {signIn.isError ? <p className="text-sm font-medium text-red-700">{(signIn.error as Error).message}</p> : null}
        <Button type="submit" disabled={signIn.isPending}>{signIn.isPending ? "Entrando..." : "Entrar"}</Button>
        <div className="flex items-center justify-between text-sm">
          <Link className="font-medium text-primary" href="/register">Criar conta</Link>
          <Link className="font-medium text-slate-600" href="/forgot-password">Esqueci a senha</Link>
        </div>
      </form>
    </AuthShell>
  );
}
