"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarraVagas } from "@/components/barra-vagas";
import { Botao, Cartao, Ponto, TituloPagina } from "@/components/ui";
import { usePainel } from "@/lib/store";
import { STATUS, decisoesPendentes, lotado, ocupacao, parado, plural, statusInfo, vagasLivres, type TipoDecisao } from "@/lib/regras";

function useSaudacao() {
  const [s, setS] = useState({ data: "", ola: "Olá" });
  useEffect(() => {
    const agora = new Date();
    const data = agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    const h = agora.getHours();
    setS({ data: data.charAt(0).toUpperCase() + data.slice(1), ola: h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite" });
  }, []);
  return s;
}

const PONTO: Record<TipoDecisao, string> = {
  risco: "bg-terracota",
  contato: "bg-terracota",
  parado: "bg-caramelo",
  escolha: statusInfo("escolha").dot,
  acolhimento: statusInfo("acolhimento").dot,
};

export default function VisaoGeral() {
  const { casos, terapeutas, enviarLembrete, ocupado } = usePainel();
  const router = useRouter();
  const { data, ola } = useSaudacao();

  const decisoes = decisoesPendentes(casos).map((d) => {
    const c = d.caso;
    const p = d.tipo === "parado" ? parado(c) : undefined;
    return {
      id: `${d.tipo}-${c.id}`,
      name: c.name,
      text: d.texto,
      dot: PONTO[d.tipo],
      cta: p ? "Enviar lembrete" : d.tipo === "escolha" ? "Ver sugestões" : d.tipo === "contato" ? "Revisar dados" : "Abrir caso",
      acao: p
        ? () => void enviarLembrete(c.id)
        : () => router.push(`/casos/${c.id}`),
    };
  });

  const livres = terapeutas.reduce((a, t) => a + vagasLivres(t, casos), 0);

  return (
    <>
      <header className="flex flex-col gap-1.5">
        <div className="min-h-[18px] text-[13px] text-tinta-suave">{data}</div>
        <TituloPagina>
          {ola}. {decisoes.length === 1 ? "1 caso precisa" : `${decisoes.length} casos precisam`} de você.
        </TituloPagina>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {STATUS.map((s) => (
          <Link
            key={s.k}
            href={`/casos#${s.k}`}
            className="flex min-h-[104px] flex-col gap-2.5 rounded-[10px] border border-linha bg-superficie p-3.5 transition-colors hover:border-vinho/30"
          >
            <span className="flex items-center gap-1.5 text-xs leading-tight text-tinta-suave">
              <Ponto className={s.dot} />
              {s.short}
            </span>
            <span className="mt-auto font-serif text-[40px] font-semibold leading-none text-ameixa">
              {casos.filter((c) => c.status === s.k).length}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Cartao className="overflow-hidden">
          <div className="flex items-baseline justify-between border-b border-linha-suave px-[18px] py-4">
            <h2 className="text-[15px] font-semibold">Precisa da sua decisão</h2>
            <span className="text-xs text-tinta-suave">ordenado por urgência</span>
          </div>
          {decisoes.map((d) => (
            <div key={d.id} className="flex items-center gap-3.5 border-b border-linha-suave px-[18px] py-3.5 last:border-b-0">
              <Ponto className={d.dot} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="text-sm font-medium">{d.name}</div>
                <div className="text-[13px] text-tinta-suave text-pretty">{d.text}</div>
              </div>
              <Botao tamanho="sm" onClick={d.acao} disabled={ocupado && d.cta === "Enviar lembrete"}>
                {d.cta}
              </Botao>
            </div>
          ))}
          {!decisoes.length && <p className="px-[18px] py-6 text-sm text-tinta-suave">Nada pendente. Tudo em dia.</p>}
        </Cartao>

        <Cartao className="flex flex-col gap-3.5 px-[18px] py-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold">Vagas por terapeuta</h2>
            <span className="text-xs text-tinta-suave">{plural(livres, "vaga livre", "vagas livres")}</span>
          </div>
          {terapeutas.map((t) => (
            <BarraVagas key={t.id} nome={t.name} ocupadas={ocupacao(t, casos)} cap={t.cap} ativo={t.active} cheio={lotado(t, casos)} />
          ))}
        </Cartao>
      </div>
    </>
  );
}
