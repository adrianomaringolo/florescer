"use client";

import clsx from "clsx";
import { useState } from "react";
import { api, ErroApi } from "@/lib/api";
import Link from "next/link";
import { DIAS_SEMANA, EMAIL_PROJETO, INSTAGRAM_PROJETO as INSTAGRAM, PERIODOS_DIA, VALOR_SESSAO } from "@/lib/dados";
import { Rosa } from "./marca";
import { botaoPublico, campoPublico } from "./moldura-publica";
import { Caixa } from "./ui";


type Grade = Record<string, string[]>;

function Secao({ numero, titulo, children }: { numero: string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-linha-suave px-6 py-7 sm:px-9">
      <h2 className="flex items-baseline gap-3 font-serif text-2xl font-semibold text-ameixa">
        <span className="text-lg text-vinho">{numero}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Campo({
  nome,
  rotulo,
  ajuda,
  erro,
  children,
}: {
  nome: string;
  rotulo: string;
  ajuda?: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-[13px]">
      <label htmlFor={nome} className="font-medium">
        {rotulo}
      </label>
      {ajuda && <span className="-mt-1 text-xs text-tinta-suave">{ajuda}</span>}
      {children}
      {erro && <span className="text-xs font-medium text-terracota-tinta">{erro}</span>}
    </div>
  );
}

function Escolha({
  nome,
  opcoes,
  valor,
  aoMudar,
  outro,
}: {
  nome: string;
  opcoes: string[];
  valor: string;
  aoMudar: (v: string) => void;
  outro?: boolean;
}) {
  const ehOutro = outro && valor !== "" && !opcoes.includes(valor);
  const [textoOutro, setTextoOutro] = useState(ehOutro ? valor : "");
  const [marcouOutro, setMarcouOutro] = useState(ehOutro);
  return (
    <div role="radiogroup" id={nome} className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={!marcouOutro && valor === o}
          onClick={() => {
            setMarcouOutro(false);
            aoMudar(o);
          }}
          className={clsx(
            "rounded-full border px-4 py-2 text-sm",
            !marcouOutro && valor === o ? "border-vinho bg-vinho text-creme" : "border-linha-forte bg-superficie hover:border-vinho/50",
          )}
        >
          {o}
        </button>
      ))}
      {outro && (
        <span className="flex items-center gap-2">
          <button
            type="button"
            role="radio"
            aria-checked={marcouOutro}
            onClick={() => {
              setMarcouOutro(true);
              aoMudar(textoOutro);
            }}
            className={clsx(
              "rounded-full border px-4 py-2 text-sm",
              marcouOutro ? "border-vinho bg-vinho text-creme" : "border-linha-forte bg-superficie hover:border-vinho/50",
            )}
          >
            Outro
          </button>
          {marcouOutro && (
            <input
              autoFocus
              aria-label="Outro"
              value={textoOutro}
              onChange={(e) => {
                setTextoOutro(e.target.value);
                aoMudar(e.target.value);
              }}
              className={clsx(campoPublico, "w-48 py-2")}
            />
          )}
        </span>
      )}
    </div>
  );
}

function Confirmacao({ id, marcado, aoMudar, children }: { id: string; marcado: boolean; aoMudar: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button id={id} type="button" role="checkbox" aria-checked={marcado} onClick={() => aoMudar(!marcado)} className="flex items-start gap-2.5 text-left text-sm leading-normal">
      <span className="mt-px">
        <Caixa marcado={marcado} />
      </span>
      <span>{children}</span>
    </button>
  );
}

export function FormularioSolicitacao() {
  const [v, setV] = useState<Record<string, string>>({});
  const [consentimento, setConsentimento] = useState(false);
  const [cienteValor, setCienteValor] = useState(false);
  const [grade, setGrade] = useState<Grade>({});
  const [erro, setErro] = useState<{ texto: string; campo?: string }>();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const campo = (k: string) => ({
    id: k,
    name: k,
    value: v[k] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((x) => ({ ...x, [k]: e.target.value })),
    "aria-invalid": erro?.campo === k || undefined,
    className: clsx(campoPublico, erro?.campo === k && "border-terracota"),
  });
  const erroDe = (k: string) => (erro?.campo === k ? erro.texto : undefined);
  const alternar = (dia: string, periodo: string) =>
    setGrade((g) => {
      const atual = g[dia] ?? [];
      return { ...g, [dia]: atual.includes(periodo) ? atual.filter((p) => p !== periodo) : [...atual, periodo] };
    });

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnviando(true);
    setErro(undefined);
    const site = String(new FormData(e.currentTarget).get("site") ?? "");
    try {
      await api("/api/inscricoes", { corpo: { ...v, site, consentimento, cienteValor, disponibilidade: grade } });
      setEnviado(true);
      window.scrollTo(0, 0);
    } catch (err) {
      const texto = err instanceof ErroApi ? err.message : "Não foi possível enviar agora. Verifique sua conexão e tente de novo.";
      // O servidor indica o campo com problema; levamos a pessoa até ele.
      const campoErro = err instanceof ErroApi && typeof err.dados.campo === "string" ? err.dados.campo : undefined;
      setErro({ texto, campo: campoErro });
      if (campoErro) document.getElementById(campoErro)?.scrollIntoView({ behavior: "smooth", block: "center" });
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <main className="flex w-full max-w-[720px] flex-col items-start gap-3.5 rounded-2xl border border-linha bg-superficie px-9 py-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vinho text-areia">
          <Rosa className="h-7 w-7" />
        </span>
        <h1 className="font-serif text-[34px] font-semibold leading-tight text-ameixa">Recebemos sua solicitação.</h1>
        <p className="text-[15px] leading-relaxed text-tinta-suave text-pretty">
          Obrigado pela confiança, {(v.nome ?? "").trim().split(/\s+/)[0]}. Em até 5 dias você vai receber um e-mail com os termos de participação. Se
          estiver de acordo, você será encaminhado(a) para um de nossos psicoterapeutas.
        </p>
        <p className="text-sm text-tinta-suave">
          Dúvidas? Fale com a gente pelo Instagram {INSTAGRAM} ou pelo e-mail {EMAIL_PROJETO}.
        </p>
      </main>
    );
  }

  return (
    <main className="flex w-full max-w-[720px] flex-col rounded-2xl border border-linha bg-superficie">
      <div className="flex flex-col gap-3 px-6 pb-7 pt-8 sm:px-9">
        <h1 className="font-serif text-[38px] font-semibold leading-tight text-ameixa">Solicitação de atendimento</h1>
        <p className="text-[15px] leading-relaxed text-tinta-suave text-pretty">
          Seja bem-vindo(a) ao Projeto Florescer. Somos um grupo de psicoterapeutas junguianos comprometidos em tornar o cuidado emocional mais
          acessível, com atendimentos on-line a valor social para quem deseja iniciar ou seguir seu processo de autoconhecimento.
        </p>
        <p className="text-[15px] leading-relaxed text-tinta-suave text-pretty">
          Preencha com sinceridade: cada detalhe nos ajuda a conectar você ao psicoterapeuta mais compatível com o seu perfil. Após o envio, você
          receberá em até 5 dias um e-mail com os termos de participação.
        </p>
        <div className="mt-1 grid gap-2 rounded-[10px] bg-fundo px-4 py-3.5 text-sm sm:grid-cols-2">
          <span>
            <b className="font-semibold text-vinho">Valor por sessão:</b> {VALOR_SESSAO}
          </span>
          <span>
            <b className="font-semibold text-vinho">Atendimento:</b> on-line, para adultos
          </span>
          <span className="text-tinta-suave sm:col-span-2">Não atendemos crianças, adolescentes, famílias e casais.</span>
        </div>
      </div>

      <form onSubmit={enviar} noValidate>
        {/* Campo-isca para robôs: invisível para pessoas e leitores de tela. */}
        <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label>
            Site <input name="site" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <Secao numero="01" titulo="Seus dados e o valor social">
          <details className="rounded-[10px] border border-linha-suave px-4 py-3 text-sm leading-relaxed">
            <summary className="cursor-pointer font-medium text-vinho">Termo de tratamento de dados (LGPD)</summary>
            <div className="mt-3 flex flex-col gap-2 text-tinta-suave">
              <p>
                Em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais), este termo registra a sua manifestação livre,
                informada e inequívoca para que possamos coletar e tratar os seus dados pessoais.
              </p>
              <p>
                <b className="text-tinta">Finalidade.</b> Os dados coletados (nome, contatos, endereço, data de nascimento, profissão, escolaridade,
                estado civil e informações de saúde) têm como única finalidade entrar em contato com você e realizar a seleção e o encaminhamento
                para atendimento psicoterapêutico.
              </p>
              <p>
                <b className="text-tinta">Armazenamento.</b> Seus dados serão armazenados de forma segura e preservados pelo tempo necessário ao
                cumprimento da finalidade acima.
              </p>
              <p>
                <b className="text-tinta">Seus direitos.</b> A qualquer momento, você pode solicitar acesso, atualização, correção ou eliminação dos
                seus dados, e revogar este consentimento. Para isso, escreva para {EMAIL_PROJETO} informando seu nome completo e telefone.
              </p>
              <p>
                Os detalhes estão na nossa{" "}
                <Link href="/privacidade" target="_blank" className="font-medium text-vinho underline underline-offset-2">
                  política de privacidade
                </Link>
                .
              </p>
            </div>
          </details>
          <div className="flex flex-col gap-1.5">
            <Confirmacao id="consentimento" marcado={consentimento} aoMudar={setConsentimento}>
              Li, concordo e aceito o termo de tratamento de dados.
            </Confirmacao>
            {erroDe("consentimento") && <span className="text-xs font-medium text-terracota-tinta">{erroDe("consentimento")}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Confirmacao id="cienteValor" marcado={cienteValor} aoMudar={setCienteValor}>
              Estou ciente do valor social do atendimento psicoterapêutico ({VALOR_SESSAO} por sessão) e desejo seguir com a solicitação.
            </Confirmacao>
            {erroDe("cienteValor") && <span className="text-xs font-medium text-terracota-tinta">{erroDe("cienteValor")}</span>}
          </div>
        </Secao>

        <Secao numero="02" titulo="Dados pessoais">
          <Campo nome="nome" rotulo="Nome completo" erro={erroDe("nome")}>
            <input {...campo("nome")} autoComplete="name" />
          </Campo>
          <div className="flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium">Gênero</span>
            <Escolha nome="genero" opcoes={["Feminino", "Masculino", "Prefiro não me identificar"]} valor={v.genero ?? ""} aoMudar={(g) => setV((x) => ({ ...x, genero: g }))} outro />
            {erroDe("genero") && <span className="text-xs font-medium text-terracota-tinta">{erroDe("genero")}</span>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo nome="nascimento" rotulo="Data de nascimento" erro={erroDe("nascimento")}>
              <input {...campo("nascimento")} type="date" autoComplete="bday" />
            </Campo>
            <Campo nome="estadoCivil" rotulo="Estado civil" erro={erroDe("estadoCivil")}>
              <input {...campo("estadoCivil")} />
            </Campo>
          </div>
          <Campo nome="escolaridade" rotulo="Escolaridade / formação acadêmica" erro={erroDe("escolaridade")}>
            <input {...campo("escolaridade")} />
          </Campo>
          <Campo nome="trabalho" rotulo="Está trabalhando no momento? Se sim, em qual área?" erro={erroDe("trabalho")}>
            <input {...campo("trabalho")} />
          </Campo>
          <Campo nome="endereco" rotulo="Endereço completo" ajuda="Inclua cidade e estado." erro={erroDe("endereco")}>
            <input {...campo("endereco")} autoComplete="street-address" />
          </Campo>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo nome="telefone" rotulo="WhatsApp" ajuda="Contato principal, com DDD." erro={erroDe("telefone")}>
              <input {...campo("telefone")} type="tel" autoComplete="tel" placeholder="(11) 90000-0000" />
            </Campo>
            <Campo nome="contatoEmergencia" rotulo="Telefone para emergências" ajuda="De outra pessoa, com DDD." erro={erroDe("contatoEmergencia")}>
              <input {...campo("contatoEmergencia")} type="tel" placeholder="(11) 90000-0000" />
            </Campo>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo nome="email" rotulo="E-mail" erro={erroDe("email")}>
              <input {...campo("email")} type="email" autoComplete="email" />
            </Campo>
            <Campo nome="rg" rotulo="RG" erro={erroDe("rg")}>
              <input {...campo("rg")} />
            </Campo>
          </div>
        </Secao>

        <Secao numero="03" titulo="Sobre o atendimento">
          <Campo nome="psicoterapiaAnterior" rotulo="Já fez psicoterapia antes? Se sim, por quanto tempo?" erro={erroDe("psicoterapiaAnterior")}>
            <textarea {...campo("psicoterapiaAnterior")} rows={2} />
          </Campo>
          <Campo nome="medicamentos" rotulo="Toma remédios? Se sim, quais?" erro={erroDe("medicamentos")}>
            <textarea {...campo("medicamentos")} rows={2} />
          </Campo>
          <Campo nome="diagnostico" rotulo="Tem algum diagnóstico? Se sim, qual?" erro={erroDe("diagnostico")}>
            <input {...campo("diagnostico")} />
          </Campo>
          <Campo nome="motivo" rotulo="O que te traz à psicoterapia?" ajuda="Conte com suas palavras, no seu tempo." erro={erroDe("motivo")}>
            <textarea {...campo("motivo")} rows={5} />
          </Campo>

          <fieldset className="flex flex-col gap-2 text-[13px]">
            <legend className="mb-1.5 font-medium">Disponibilidade de dias e horários</legend>
            <span className="-mt-1 mb-1 text-xs text-tinta-suave">Marque todos os períodos em que você pode ser atendido(a).</span>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th />
                    {PERIODOS_DIA.map((p) => (
                      <th key={p} className="px-2 pb-2 text-center font-medium text-tinta-suave">
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DIAS_SEMANA.map((d) => (
                    <tr key={d} className="border-t border-linha-suave">
                      <th scope="row" className="py-2 pr-3 text-left font-normal">
                        {d}-feira
                      </th>
                      {PERIODOS_DIA.map((p) => {
                        const marcado = grade[d]?.includes(p) ?? false;
                        return (
                          <td key={p} className="text-center">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={marcado}
                              aria-label={`${d}-feira, ${p.toLowerCase()}`}
                              onClick={() => alternar(d, p)}
                              className="inline-flex p-2"
                            >
                              <Caixa marcado={marcado} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5 text-[13px]">
            <span className="font-medium">Tem preferência de terapeuta?</span>
            <Escolha
              nome="preferenciaTerapeuta"
              opcoes={["Homem", "Mulher", "Não tenho preferência"]}
              valor={v.preferenciaTerapeuta ?? ""}
              aoMudar={(g) => setV((x) => ({ ...x, preferenciaTerapeuta: g }))}
              outro
            />
            {erroDe("preferenciaTerapeuta") && <span className="text-xs font-medium text-terracota-tinta">{erroDe("preferenciaTerapeuta")}</span>}
          </div>
          <Campo nome="comentarios" rotulo="Comentários (opcional)" erro={erroDe("comentarios")}>
            <textarea {...campo("comentarios")} rows={3} />
          </Campo>
        </Secao>

        <div className="flex flex-col gap-4 rounded-b-2xl border-t border-linha-suave bg-fundo px-6 pb-8 pt-6 sm:px-9">
          <div className="flex flex-col gap-1 rounded-[10px] bg-terracota-suave px-4 py-3.5 text-sm text-terracota-tinta">
            <span className="font-semibold">Em caso de emergência</span>
            <span className="leading-normal">O projeto não oferece atendimento de urgência. Se precisar de ajuda imediata, ligue para o CVV (188) ou SAMU (192).</span>
          </div>
          {erro && (
            <p role="alert" className="text-sm font-medium text-terracota-tinta">
              {erro.texto}
            </p>
          )}
          <button type="submit" disabled={enviando} className={clsx(botaoPublico, "self-start")}>
            {enviando ? "Enviando…" : "Enviar solicitação"}
          </button>
          <p className="text-xs text-tinta-suave">
            Dúvidas? Instagram {INSTAGRAM} · {EMAIL_PROJETO}
          </p>
        </div>
      </form>
    </main>
  );
}
