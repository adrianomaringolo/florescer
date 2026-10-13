"use client";

import Link from "next/link";
import { useState } from "react";
import { BarraVagas } from "@/components/barra-vagas";
import { CamposTerapeuta, formDe, formValido, type FormTerapeuta } from "@/components/campos-terapeuta";
import { Botao, CabecalhoCartao, Cartao, OpcaoRadio, Selo, TituloPagina } from "@/components/ui";
import type { Terapeuta } from "@/lib/dados";
import { lotado, ocupacao, pacientesDe, plural } from "@/lib/regras";
import { usePainel } from "@/lib/store";

const igual = (f: FormTerapeuta & { active: boolean }, t: Terapeuta) => JSON.stringify(f) === JSON.stringify({ ...formDe(t), active: t.active });

export function EdicaoTerapeuta({ id }: { id: string }) {
  const p = usePainel();
  const t = p.terapeutas.find((x) => x.id === id);
  const [f, setF] = useState(() => (t ? { ...formDe(t), active: t.active } : null));

  if (!t || !f) {
    return (
      <div className="flex flex-col gap-3">
        <Link href="/terapeutas" className="text-[13px] text-vinho hover:text-vinho-escuro">← Terapeutas</Link>
        <TituloPagina>Terapeuta não encontrado</TituloPagina>
      </div>
    );
  }

  const pacientes = pacientesDe(t, p.casos);
  const ocupadas = ocupacao(t, p.casos);
  const alterado = !igual(f, t);
  const valido = formValido(f);

  const salvar = () =>
    p.editarTerapeuta(t.id, { ...f, name: f.name.trim(), email: f.email.trim(), disp: f.disp.trim() });

  return (
    <>
      <Link href="/terapeutas" className="self-start text-[13px] text-vinho hover:text-vinho-escuro">← Terapeutas</Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <TituloPagina>{t.name}</TituloPagina>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-tinta-suave">
            <Selo tom={t.active ? "ok" : "neutro"}>{t.active ? "Ativo" : "Pausado"}</Selo>
            <span>{plural(ocupadas, "pessoa em atendimento", "pessoas em atendimento")} · {t.cap} vagas</span>
          </div>
        </div>
      </header>

      {!t.genero && (
        <div className="rounded-xl border border-caramelo/40 bg-caramelo-suave px-4 py-3 text-[13px] text-caramelo-tinta text-pretty">
          <span className="font-semibold">Falta o gênero.</span> Sem ele, a preferência de quem pede terapeuta mulher ou homem não é considerada nas sugestões.
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Cartao>
          <CabecalhoCartao titulo="Cadastro" />
          <div className="flex flex-col gap-4 px-[18px] py-4 text-[13px]">
            <CamposTerapeuta valor={f} aoMudar={(x) => setF({ ...x, active: f.active })} minimoVagas={ocupadas} />
            <div className="flex flex-col gap-2">
              <span className="font-medium" id="rotulo-status">Status</span>
              <div role="radiogroup" aria-labelledby="rotulo-status" className="grid gap-2 sm:grid-cols-2">
                <OpcaoRadio marcado={f.active} onClick={() => setF({ ...f, active: true })}>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">Ativo</span>
                    <span className="text-xs text-tinta-suave">Aparece nas sugestões quando tem vaga.</span>
                  </span>
                </OpcaoRadio>
                <OpcaoRadio marcado={!f.active} onClick={() => setF({ ...f, active: false })}>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">Pausado</span>
                    <span className="text-xs text-tinta-suave">Não recebe novos casos; quem já está em atendimento continua.</span>
                  </span>
                </OpcaoRadio>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-linha-suave px-[18px] py-3.5">
            {alterado && (
              <>
                <span className="mr-auto text-xs text-tinta-suave">Alterações não salvas</span>
                <Botao tamanho="sm" disabled={p.ocupado} onClick={() => setF({ ...formDe(t), active: t.active })}>Descartar</Botao>
              </>
            )}
            <Botao variante="primario" tamanho="sm" disabled={!alterado || !valido || p.ocupado} onClick={salvar}>Salvar alterações</Botao>
          </div>
        </Cartao>

        <Cartao>
          <CabecalhoCartao titulo="Em atendimento">
            {pacientes.length ? "Casos ligados a este terapeuta agora." : "Ninguém em atendimento no momento."}
          </CabecalhoCartao>
          <div className="flex flex-col gap-3 px-[18px] py-4">
            <BarraVagas ocupadas={ocupadas} cap={t.cap} ativo={t.active} cheio={lotado(t, p.casos)} />
            {pacientes.length > 0 && (
              <ul className="flex flex-col divide-y divide-linha-suave text-[13px]">
                {pacientes.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link href={`/casos/${c.id}`} className="font-medium text-tinta hover:text-vinho">{c.name}</Link>
                    <span className="text-xs text-tinta-suave">{c.encaminhadoEm ? `desde ${c.encaminhadoEm}` : ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Cartao>
      </div>
    </>
  );
}
