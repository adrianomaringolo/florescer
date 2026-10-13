"use client";

import { useCallback, useEffect, useState } from "react";
import type { AceiteTermo } from "@/lib/dados";
import { api } from "@/lib/api";
import { FormularioTermo } from "./formulario-termo";
import { MolduraPublica } from "./moldura-publica";

interface DadosTermo {
  primeiroNome: string;
  menorDeIdade: boolean;
  aceite: AceiteTermo | null;
}

export function ConteudoTermo({ token }: { token: string }) {
  const [caso, setCaso] = useState<DadosTermo | null | undefined>(undefined);
  const carregar = useCallback(() => api<DadosTermo>(`/api/termo/${encodeURIComponent(token)}`).then(setCaso, () => setCaso(null)), [token]);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (caso === undefined) return null;
  if (!caso) {
    return (
      <MolduraPublica largura={560}>
        <main className="w-full max-w-[560px] rounded-2xl border border-linha bg-superficie px-9 py-10">
          <h1 className="font-serif text-3xl font-semibold text-ameixa">Link inválido</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-tinta-suave">
            Este link de termo não corresponde a nenhum pedido. Confira o e-mail que você recebeu ou responda a ele para falar com a equipe.
          </p>
        </main>
      </MolduraPublica>
    );
  }
  return (
    <MolduraPublica>
      <FormularioTermo token={token} primeiroNome={caso.primeiroNome} menorDeIdade={caso.menorDeIdade} aceite={caso.aceite} aoAceitar={carregar} />
    </MolduraPublica>
  );
}
