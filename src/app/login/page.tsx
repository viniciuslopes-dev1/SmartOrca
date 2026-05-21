"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { LoadingState } from "@/components/feedback/data-state";
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
      onSuccess: () => {
        router.replace(searchParams.get("next") || "/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <main className="h-screen overflow-hidden bg-[#071126] text-slate-950">
      <section className="relative h-full w-full overflow-hidden bg-[#071126]">
        <section className="relative z-10 flex h-full min-h-0 items-center px-6 py-8 text-white sm:px-10 lg:px-16">
          <div className="absolute inset-0 opacity-[0.24] [background-image:linear-gradient(rgba(148,163,184,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.22)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#12306f]/40 to-transparent" />

          <div className="relative z-10 w-full max-w-[580px]">
            <Link href="/dashboard" className="mb-10 flex w-fit items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/8 text-[#d6a13a] shadow-sm">
                <Building2 className="h-5 w-5" />
              </span>
              <span>
                <strong className="block text-sm font-black uppercase text-white">ORÇAOBRA</strong>
                <span className="block text-xs font-semibold text-slate-400">controle financeiro de obras</span>
              </span>
            </Link>

            <div className="mb-9">
              <h1 className="text-[2.75rem] font-black leading-tight text-white sm:text-[3.4rem]">Entrar no sistema</h1>
              <p className="mt-4 max-w-md text-base font-medium leading-7 text-slate-300">
                Acesse seus orçamentos, clientes e obras em um ambiente técnico e organizado.
              </p>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit(submit)}>
              <div>
                <label className="mb-2 block text-xs font-black uppercase text-slate-300" htmlFor="login-email">
                  E-mail
                </label>
                <input
                  {...register("email")}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="h-12 w-full rounded-md border border-white/10 bg-white px-4 text-base font-semibold text-slate-900 shadow-[0_12px_28px_rgba(0,0,0,0.18)] outline-none transition placeholder:text-slate-400 focus:border-[#d6a13a] focus:ring-3 focus:ring-[#d6a13a]/15"
                />
                {errors.email?.message ? <p className="mt-2 text-sm font-semibold text-[#e6b95a]">{errors.email.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase text-slate-300" htmlFor="login-password">
                  Senha
                </label>
                <input
                  {...register("password")}
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  className="h-12 w-full rounded-md border border-white/10 bg-white px-4 text-base font-semibold text-slate-900 shadow-[0_12px_28px_rgba(0,0,0,0.18)] outline-none transition placeholder:text-slate-400 focus:border-[#d6a13a] focus:ring-3 focus:ring-[#d6a13a]/15"
                />
                {errors.password?.message ? <p className="mt-2 text-sm font-semibold text-[#e6b95a]">{errors.password.message}</p> : null}
              </div>

              {signIn.isError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700">
                  {(signIn.error as Error).message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={signIn.isPending}
                className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#d6a13a] px-5 text-base font-black text-[#071126] shadow-[0_14px_28px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-[#e0ad4b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {signIn.isPending ? "Entrando..." : "Entrar"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4 text-sm font-bold text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <Link className="transition hover:text-white" href="/register">
                  Criar uma conta
                </Link>
                <Link className="transition hover:text-white" href="/forgot-password">
                  Esqueceu a senha?
                </Link>
              </div>
            </form>

            <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-4 text-xs font-semibold leading-5 text-slate-300">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#d6a13a]" />
              <span>Ambiente seguro para dados comerciais e técnicos.</span>
            </div>
          </div>
        </section>

        <section className="pointer-events-none absolute bottom-8 right-8 top-8 hidden w-[31%] overflow-hidden rounded-l-[2rem] border border-white/10 bg-[#071126] shadow-[0_28px_80px_rgba(0,0,0,0.28)] md:block">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=88"
            alt="Canteiro de obra com estrutura em construção"
            className="h-full w-full object-cover brightness-[0.7] contrast-[0.9] saturate-[0.68]"
          />
          <div className="absolute inset-0 bg-[#071126]/32" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#071126]/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#071126]/60 to-transparent" />
        </section>
      </section>
    </main>
  );
}
