"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FormularioConvite } from "./formularios-acesso";
import { MolduraPublica } from "./moldura-publica";

type Convite = { nome: string; email: string } | null;

export function ConteudoConvite({ token }: { token: string }) {
  const [u, setU] = useState<Convite | undefined>(undefined);
  useEffect(() => {
    api<NonNullable<Convite>>(`/api/convites/${encodeURIComponent(token)}`).then(setU, () => setU(null));
  }, [token]);

  if (u === undefined) return null;
  return (
    <MolduraPublica largura={420}>
      <main className="flex w-full max-w-[420px] flex-col gap-6 rounded-2xl border border-linha bg-superficie px-8 py-9">
        {u ? (
          <>
            <div className="flex flex-col gap-1">
              <h1 className="font-serif text-[32px] font-semibold leading-tight text-ameixa">Olá, {u.nome.split(" ")[0]}</h1>
              <p className="text-sm text-tinta-suave">Crie sua senha para acessar o painel com {u.email}.</p>
            </div>
            <FormularioConvite token={token} />
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-[32px] font-semibold leading-tight text-ameixa">Convite inválido</h1>
            <p className="text-sm text-tinta-suave">Este convite expirou ou já foi usado. Peça um novo a alguém da equipe.</p>
          </div>
        )}
      </main>
    </MolduraPublica>
  );
}
