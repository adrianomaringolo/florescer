"use client";

import clsx from "clsx";
import { useState } from "react";
import { usePainel } from "@/lib/store";
import { Rosa } from "./marca";

function CopiarLink({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <span className="mt-2 flex flex-col gap-1.5">
      <span className="text-xs text-areia/80">Sem provedor de e-mail configurado — envie este link à pessoa:</span>
      <span className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-creme/10 px-2 py-1 text-[11px]">{link}</code>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(link).then(() => setCopiado(true))}
          className="flex-none rounded bg-creme px-2 py-1 text-xs font-semibold text-ameixa"
        >
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </span>
    </span>
  );
}

export function Avisos() {
  const { avisos, dispensarAviso } = usePainel();
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-30 flex w-[min(400px,calc(100vw-32px))] flex-col gap-2">
      {avisos.map((a) => (
        <div
          key={a.id}
          role={a.erro ? "alert" : "status"}
          className={clsx(
            "pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-[13px] leading-snug shadow-modal",
            a.erro ? "bg-terracota-tinta text-creme" : "bg-ameixa text-creme",
          )}
        >
          <Rosa className="mt-0.5 h-4 w-4 flex-none text-areia" />
          <span className="flex min-w-0 flex-1 flex-col text-pretty">
            {a.texto}
            {a.link && <CopiarLink link={a.link} />}
          </span>
          <button type="button" onClick={() => dispensarAviso(a.id)} aria-label="Fechar aviso" className="text-areia/80 hover:text-creme">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
