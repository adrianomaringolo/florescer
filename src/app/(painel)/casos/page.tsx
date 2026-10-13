"use client";

import clsx from "clsx";
import Link from "next/link";
import { Ponto, Selo, TituloPagina } from "@/components/ui";
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

export default function Casos() {
  const { casos } = usePainel();
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-2">
        <TituloPagina>Casos</TituloPagina>
        <span className="text-[13px] text-tinta-suave">{casos.length} pessoas · histórico preservado</span>
      </header>
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
