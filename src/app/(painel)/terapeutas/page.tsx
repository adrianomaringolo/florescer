"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { BarraVagas } from "@/components/barra-vagas";
import { CamposTerapeuta, FORM_VAZIO, formValido } from "@/components/campos-terapeuta";
import { Botao, Cartao, Modal, Selo, TituloPagina } from "@/components/ui";
import { formatarPublico, lotado, ocupacao, pacientesDe, plural, vagasLivres } from "@/lib/regras";
import { usePainel } from "@/lib/store";

const COLUNAS = "grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)_150px_minmax(0,1.5fr)_90px]";

export default function Terapeutas() {
  const { terapeutas, casos, cadastrarTerapeuta, ocupado } = usePainel();
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState(FORM_VAZIO);

  const livres = terapeutas.reduce((a, t) => a + vagasLivres(t, casos), 0);
  const aguardando = casos.filter((c) => c.status === "escolha").length;
  const valido = formValido(f);

  const salvar = async () => {
    if (!valido) return;
    if (await cadastrarTerapeuta({ name: f.name.trim(), email: f.email.trim(), genero: f.genero, publico: f.publico, disp: f.disp.trim(), cap: f.cap })) setAberto(false);
  };

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <TituloPagina>Terapeutas</TituloPagina>
          <span className="text-[13px] text-tinta-suave">
            {plural(livres, "vaga livre", "vagas livres")} · {plural(aguardando, "pessoa aguardando", "pessoas aguardando")}
          </span>
        </div>
        <Botao variante="primario" onClick={() => { setF(FORM_VAZIO); setAberto(true); }}>Cadastrar terapeuta</Botao>
      </header>

      <Cartao className="overflow-x-auto">
        <div className={clsx("grid min-w-[760px] gap-4 border-b border-linha-suave px-[18px] py-3 text-[11px] uppercase tracking-[0.06em] text-tinta-suave", COLUNAS)}>
          <span>Terapeuta</span><span>Disponibilidade</span><span>Vagas</span><span>Em atendimento</span><span>Status</span>
        </div>
        {terapeutas.map((t) => {
          const pts = pacientesDe(t, casos);
          return (
            <div key={t.id} className={clsx("relative grid min-w-[760px] items-center gap-4 border-b border-linha-suave px-[18px] py-3.5 text-[13px] last:border-b-0 hover:bg-vinho-suave/40", COLUNAS)}>
              <span className="flex flex-col gap-0.5">
                {/* O link cobre a linha inteira (after:inset-0). */}
                <Link href={`/terapeutas/${t.id}`} className="text-sm font-medium after:absolute after:inset-0 hover:text-vinho">
                  {t.name}
                </Link>
                <span className="text-xs text-tinta-suave">
                  {t.genero ? `${t.genero} · ` : <span className="text-caramelo-tinta">Gênero não informado · </span>}
                  {formatarPublico(t.publico)}
                </span>
              </span>
              <span className="text-tinta-suave">{t.disp}</span>
              <BarraVagas ocupadas={ocupacao(t, casos)} cap={t.cap} ativo={t.active} cheio={lotado(t, casos)} />
              <span className="text-tinta-suave text-pretty">{pts.length ? pts.map((c) => c.name).join(", ") : "—"}</span>
              <Selo tom={t.active ? "ok" : "neutro"} className="justify-self-start">{t.active ? "Ativo" : "Pausado"}</Selo>
            </div>
          );
        })}
      </Cartao>

      <Modal
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Cadastrar terapeuta"
        descricao="Entra como ativo, com 0 pacientes, e passa a ser sugerido na hora."
        rodape={
          <>
            <Botao tamanho="sm" onClick={() => setAberto(false)}>Cancelar</Botao>
            <Botao variante="primario" tamanho="sm" disabled={!valido || ocupado} onClick={salvar}>Cadastrar</Botao>
          </>
        }
      >
        <CamposTerapeuta valor={f} aoMudar={setF} />
      </Modal>
    </>
  );
}

