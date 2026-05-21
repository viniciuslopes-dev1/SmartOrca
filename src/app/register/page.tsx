"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
    <main className="min-h-screen bg-[#071126] px-5 py-8 text-white">
      <section className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(148,163,184,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.22)_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col justify-center">
        <Link href="/dashboard" className="mb-8 flex w-fit items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/8 text-[#d6a13a] shadow-sm">
            <Building2 className="h-5 w-5" />
          </span>
          <span>
            <strong className="block text-sm font-black uppercase text-white">ORÇAOBRA</strong>
            <span className="block text-xs font-semibold text-slate-400">controle financeiro de obras</span>
          </span>
        </Link>

        <div className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-7">
          <div className="mb-6">
            <h1 className="text-3xl font-black leading-tight text-white">Criar conta</h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-300">
              Cadastre seu usuário e a empresa que vai emitir os orçamentos.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-black uppercase text-slate-300">
                Nome
                <input
                  {...register("full_name")}
                  autoComplete="name"
                  className="h-11 rounded-md border border-white/10 bg-white px-3.5 text-sm font-semibold normal-case text-slate-900 shadow-sm outline-none transition focus:border-[#d6a13a] focus:ring-3 focus:ring-[#d6a13a]/15"
                />
                {errors.full_name?.message ? <span className="text-sm font-semibold normal-case text-[#e6b95a]">{errors.full_name.message}</span> : null}
              </label>

              <label className="grid gap-2 text-xs font-black uppercase text-slate-300">
                Email
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className="h-11 rounded-md border border-white/10 bg-white px-3.5 text-sm font-semibold normal-case text-slate-900 shadow-sm outline-none transition focus:border-[#d6a13a] focus:ring-3 focus:ring-[#d6a13a]/15"
                />
                {errors.email?.message ? <span className="text-sm font-semibold normal-case text-[#e6b95a]">{errors.email.message}</span> : null}
              </label>

              <label className="grid gap-2 text-xs font-black uppercase text-slate-300">
                Telefone
                <input
                  {...register("phone")}
                  className="h-11 rounded-md border border-white/10 bg-white px-3.5 text-sm font-semibold normal-case text-slate-900 shadow-sm outline-none transition focus:border-[#d6a13a] focus:ring-3 focus:ring-[#d6a13a]/15"
                />
                {errors.phone?.message ? <span className="text-sm font-semibold normal-case text-[#e6b95a]">{errors.phone.message}</span> : null}
              </label>

              <label className="grid gap-2 text-xs font-black uppercase text-slate-300">
                Empresa/workspace
                <input
                  {...register("workspace_name")}
                  className="h-11 rounded-md border border-white/10 bg-white px-3.5 text-sm font-semibold normal-case text-slate-900 shadow-sm outline-none transition focus:border-[#d6a13a] focus:ring-3 focus:ring-[#d6a13a]/15"
                />
                {errors.workspace_name?.message ? <span className="text-sm font-semibold normal-case text-[#e6b95a]">{errors.workspace_name.message}</span> : null}
              </label>

              <label className="grid gap-2 text-xs font-black uppercase text-slate-300">
                Senha
                <input
                  {...register("password")}
                  type="password"
                  autoComplete="new-password"
                  className="h-11 rounded-md border border-white/10 bg-white px-3.5 text-sm font-semibold normal-case text-slate-900 shadow-sm outline-none transition focus:border-[#d6a13a] focus:ring-3 focus:ring-[#d6a13a]/15"
                />
                {errors.password?.message ? <span className="text-sm font-semibold normal-case text-[#e6b95a]">{errors.password.message}</span> : null}
              </label>

              <label className="grid gap-2 text-xs font-black uppercase text-slate-300">
                Confirmar senha
                <input
                  {...register("password_confirmation")}
                  type="password"
                  autoComplete="new-password"
                  className="h-11 rounded-md border border-white/10 bg-white px-3.5 text-sm font-semibold normal-case text-slate-900 shadow-sm outline-none transition focus:border-[#d6a13a] focus:ring-3 focus:ring-[#d6a13a]/15"
                />
                {errors.password_confirmation?.message ? (
                  <span className="text-sm font-semibold normal-case text-[#e6b95a]">{errors.password_confirmation.message}</span>
                ) : null}
              </label>
            </div>

            {signUp.isError ? <p className="rounded-md border border-red-400/20 bg-red-500/10 px-3.5 py-3 text-sm font-semibold text-red-100">{(signUp.error as Error).message}</p> : null}
            {createWorkspace.isError ? (
              <p className="rounded-md border border-red-400/20 bg-red-500/10 px-3.5 py-3 text-sm font-semibold text-red-100">{(createWorkspace.error as Error).message}</p>
            ) : null}
            {successMessage ? <p className="rounded-md border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-3 text-sm font-semibold text-emerald-100">{successMessage}</p> : null}

            <div className="mt-1 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={signUp.isPending || createWorkspace.isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#d6a13a] px-6 text-sm font-black text-[#071126] shadow-[0_14px_28px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-[#e0ad4b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {signUp.isPending || createWorkspace.isPending ? "Criando..." : "Cadastrar"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link className="text-sm font-bold text-slate-300 transition hover:text-white" href="/login">
                Já tenho conta
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
