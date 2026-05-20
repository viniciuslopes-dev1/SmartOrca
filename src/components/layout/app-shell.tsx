"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, Building2, ClipboardList, FileText, Home, LogOut, Menu, Settings, Users, X } from "lucide-react";
import { useState } from "react";
import { LoadingState } from "@/components/feedback/data-state";
import { cn } from "@/lib/utils";
import { useSignOut } from "@/hooks/useAuth";
import { useWorkspaceId } from "@/hooks/useWorkspace";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/projects", label: "Obras", icon: Building2 },
  { href: "/catalog", label: "Produtos/serviços", icon: Boxes },
  { href: "/budgets", label: "Orçamentos", icon: ClipboardList },
  { href: "/reports", label: "Relatórios", icon: BarChart3 },
  { href: "/settings", label: "Configurações", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const signOut = useSignOut();
  const workspace = useWorkspaceId();
  const isPublicAuthRoute = ["/login", "/register", "/forgot-password"].some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isOnboarding = pathname === "/onboarding/workspace";

  if (isPublicAuthRoute || isOnboarding) {
    return <>{children}</>;
  }

  if (workspace.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <LoadingState label="Validando sessão e workspace..." />
        </div>
      </div>
    );
  }

  if (!workspace.workspaceId && !isOnboarding) {
    router.replace("/onboarding/workspace");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <LoadingState label="Preparando workspace..." />
        </div>
      </div>
    );
  }

  async function handleSignOut() {
    await signOut.mutateAsync();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {open ? <button className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu" /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-800 bg-slate-950 text-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-700">
              <FileText className="h-5 w-5" />
            </span>
            <span>
              <strong className="block text-sm">Orçamentos</strong>
              <span className="block text-xs text-slate-400">Painel operacional</span>
            </span>
          </Link>
          <button className="rounded-md p-2 text-slate-300 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white",
                  active && "bg-cyan-800 text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:px-6">
          <button className="rounded-md border border-border p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm font-medium text-slate-600 lg:block">Ambiente de orçamento técnico</div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-md border border-border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 md:block">
              {workspace.currentWorkspace?.name ?? "Workspace"}
            </div>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              onClick={handleSignOut}
              disabled={signOut.isPending}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
