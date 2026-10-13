"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { usePainel } from "@/lib/store";
import { Logo } from "./marca";

async function sair() {
  await api("/api/auth/logout", { corpo: {} }).catch(() => undefined);
  window.location.assign("/login");
}

export function BarraLateral() {
  const pathname = usePathname();
  const { casos, terapeutas, usuarios, usuario } = usePainel();
  const itens = [
    { href: "/", label: "Visão geral", count: null },
    { href: "/casos", label: "Casos", count: casos.length },
    { href: "/terapeutas", label: "Terapeutas", count: terapeutas.length },
    { href: "/usuarios", label: "Usuários", count: usuarios.length },
  ];
  const ativo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="sticky top-0 z-10 flex flex-col gap-4 bg-vinho px-4 py-4 text-creme lg:h-screen lg:gap-8 lg:px-4 lg:py-7">
      <div className="flex items-center justify-between gap-4 px-2 lg:flex-col lg:items-start lg:gap-1.5">
        <Link href="/" aria-label="Visão geral" className="text-areia">
          <Logo className="h-9 w-auto lg:h-[68px]" />
        </Link>
        <div className="flex items-center gap-3 text-xs text-areia/80">
          <span className="hidden sm:inline">Encaminhamentos terapêuticos</span>
          <button type="button" onClick={sair} className="rounded-md border border-creme/25 px-2.5 py-1 text-creme hover:bg-creme/10 lg:hidden">Sair</button>
        </div>
      </div>

      <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
        {itens.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={ativo(n.href) ? "page" : undefined}
            className={clsx(
              "flex flex-none items-center justify-between gap-3 rounded-lg px-2.5 py-[9px] text-sm transition-colors",
              ativo(n.href) ? "bg-creme/15 font-semibold text-creme" : "text-creme/85 hover:bg-creme/10 hover:text-creme",
            )}
          >
            <span>{n.label}</span>
            {n.count !== null && <span className="text-xs text-areia/75">{n.count}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-auto hidden flex-col gap-2 rounded-[10px] border border-creme/15 bg-ameixa/35 p-3 lg:flex">
        <div className="flex flex-col gap-0.5">
          <span className="truncate text-[13px] font-medium">{usuario.nome}</span>
          <span className="truncate text-xs text-areia/75">{usuario.email}</span>
        </div>
        <button type="button" onClick={sair} className="self-start text-xs text-areia/80 underline-offset-2 hover:text-creme hover:underline">
          Sair
        </button>
      </div>
    </aside>
  );
}
