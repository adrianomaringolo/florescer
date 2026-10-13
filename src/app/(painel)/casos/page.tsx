"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Rosa } from "@/components/marca";
import { Botao, Ponto, Selo, TituloPagina } from "@/components/ui";
import type { Caso } from "@/lib/dados";
import { STATUS, parado, plural } from "@/lib/regras";
import { usePainel } from "@/lib/store";

function CartaoCaso({ c }: { c: Caso }) {
  const p = parado(c);
  const alerta = !!(p || c.risk);
  return (
    <Link
      href={`/casos/${c.id}`}
      className={clsx(
        "flex flex-col gap-1.5 rounded-[9px] border p-[11px] transition-colors hover:border-vinho/40",
        c.risk ? "border-terracota/50 bg-terracota-suave" : p ? "border-caramelo/60 bg-superficie" : "border-linha bg-superficie",
      )}
    >
      <span className="text-sm font-medium">{c.name}</span>
      <span className="text-xs text-tinta-suave">
        {c.age ?? "?"} anos · {c.ter || "sem terapeuta"}
      </span>
      <span className={clsx("text-xs", alerta ? "font-semibold text-terracota-tinta" : "text-tinta-suave")}>
        {p ? p.texto : c.risk ? "Risco — prioridade" : c.days === 0 ? "entrou hoje" : `${plural(c.days, "dia")} no status`}
      </span>
      {c.status === "atendimento" && (
        <span className="flex flex-wrap gap-1.5">
          <Selo tom={c.termoOk ? "ok" : "atencao"} className="!px-[7px] !py-0.5 !text-[11px]">
            {c.termoOk ? "Termo ✓" : "Termo pendente"}
          </Selo>
          <Selo tom={c.repasseOk ? "ok" : "atencao"} className="!px-[7px] !py-0.5 !text-[11px]">
            {c.repasseOk ? "Repasse ✓" : "Repasse pendente"}
          </Selo>
        </span>
      )}
    </Link>
  );
}

/** Link público de inscrição em destaque: é por ele que chegam os casos novos. */
function LinkFormulario() {
  const { avisar } = usePainel();
  // A origem vem do navegador, para o link sair certo em qualquer ambiente (local ou produção).
  const [url, setUrl] = useState("/solicitar");
  useEffect(() => setUrl(`${window.location.origin}/solicitar`), []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      avisar("Link do formulário copiado.");
    } catch {
      avisar("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  };

  return (
    <section className="relative flex flex-wrap items-center gap-x-6 gap-y-4 overflow-hidden rounded-xl bg-vinho px-5 py-4 text-creme sm:px-6">
      <Rosa className="pointer-events-none absolute -right-6 -top-8 h-36 w-auto text-vinho-escuro opacity-70" />
      <div className="relative flex min-w-[240px] flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-areia">Formulário público de inscrição</span>
        <span className="text-sm text-creme/90">Compartilhe este link com quem procura atendimento. Cada envio vira um caso novo aqui.</span>
        <a href={url} target="_blank" rel="noreferrer" className="mt-1 break-all font-mono text-[15px] font-medium text-creme underline decoration-areia/60 underline-offset-4 hover:decoration-creme">
          {url}
        </a>
      </div>
      <div className="relative flex flex-wrap gap-2">
        <Botao tamanho="sm" onClick={copiar} className="!border-transparent !bg-creme !text-vinho-escuro hover:!bg-areia">Copiar link</Botao>
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-lg border border-areia/60 px-3 py-[7px] text-[13px] font-medium text-creme hover:bg-vinho-escuro">
          Abrir formulário ↗
        </a>
      </div>
    </section>
  );
}

export default function Casos() {
  const { casos } = usePainel();
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <TituloPagina>Casos</TituloPagina>
          <span className="text-[13px] text-tinta-suave">{casos.length} pessoas · histórico preservado</span>
        </div>
        <Link href="/casos/novo" className="rounded-lg bg-vinho px-4 py-2.5 text-sm font-semibold text-creme hover:bg-vinho-escuro">
          Cadastrar caso
        </Link>
      </header>
      <LinkFormulario />
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="grid min-w-[900px] grid-cols-5 gap-2.5">
          {STATUS.map((s) => {
            const itens = casos.filter((c) => c.status === s.k);
            return (
              <div key={s.k} id={s.k} className="flex scroll-mt-6 flex-col gap-2 rounded-xl bg-linha-suave p-2.5">
                <div className="flex items-center gap-1.5 px-1 pb-1.5 pt-1 text-xs font-semibold leading-tight">
                  <Ponto className={s.dot} />
                  <span className="flex-1">{s.short}</span>
                  <span className="font-medium text-tinta-suave">{itens.length}</span>
                </div>
                {itens.map((c) => (
                  <CartaoCaso key={c.id} c={c} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
