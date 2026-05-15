"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, Building2, ClipboardList, FileText, Home, Menu, Settings, Users, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-800 bg-slate-950 text-white transition-transform lg:translate-x-0",
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
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white px-4">
          <button className="rounded-md border border-border p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm font-medium text-slate-600 lg:block">Ambiente de orçamento técnico</div>
          <div className="rounded-md border border-border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">MVP sem login</div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6">{children}</main>
      </div>
    </div>
  );
}
