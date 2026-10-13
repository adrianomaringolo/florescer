"use client";

import { useEffect, useId, useState } from "react";
import { api, ErroApi } from "@/lib/api";
import { botaoPublico, campoPublico } from "./moldura-publica";

interface EstadoForm {
  erro?: string;
  /** Devolvido para repreencher o campo após um erro. */
  email?: string;
}

/** Campo de senha com botão para mostrar o que foi digitado. */
function CampoSenha({ rotulo, ajuda, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { rotulo: string; ajuda?: string }) {
  const [visivel, setVisivel] = useState(false);
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5 text-[13px]">
      <label htmlFor={id} className="font-medium">{rotulo}</label>
      <div className="relative">
        <input id={id} type={visivel ? "text" : "password"} className={`${campoPublico} pr-12`} {...props} />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          aria-controls={id}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-tinta-suave hover:text-vinho focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vinho/40"
        >
          <IconeOlho aberto={!visivel} />
        </button>
      </div>
      {ajuda && <span className="text-xs text-tinta-suave">{ajuda}</span>}
    </div>
  );
}

function IconeOlho({ aberto }: { aberto: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!aberto && <path d="M4 4l16 16" />}
    </svg>
  );
}

function Erro({ estado }: { estado: EstadoForm }) {
  return estado.erro ? <p role="alert" className="text-sm font-medium text-terracota-tinta">{estado.erro}</p> : null;
}

/** Envia o formulário para um endpoint; em caso de sucesso, vai para o painel. */
function useEnvio(caminho: string, montar: (form: FormData) => Record<string, unknown>) {
  const [estado, setEstado] = useState<EstadoForm>({});
  const [enviando, setEnviando] = useState(false);
  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const corpo = montar(new FormData(e.currentTarget));
    setEnviando(true);
    try {
      await api(caminho, { corpo });
      window.location.assign("/");
    } catch (err) {
      setEstado({ erro: err instanceof ErroApi ? err.message : "Não foi possível concluir. Tente de novo.", email: String(corpo.email ?? "") });
      setEnviando(false);
    }
  };
  return { estado, enviar, enviando };
}

export function FormularioLogin() {
  const { estado, enviar, enviando } = useEnvio("/api/auth/login", (f) => ({ email: f.get("email"), senha: f.get("senha") }));
  // Quem já tem sessão vai direto para o painel.
  useEffect(() => {
    api("/api/painel").then(() => window.location.assign("/"), () => undefined);
  }, []);
  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-[13px]">
        <span className="font-medium">E-mail</span>
        <input key={estado.email} name="email" type="email" required autoComplete="email" defaultValue={estado.email} className={campoPublico} />
      </label>
      <CampoSenha rotulo="Senha" name="senha" required autoComplete="current-password" />
      <Erro estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPublico}>{enviando ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

export function FormularioConvite({ token }: { token: string }) {
  const { estado, enviar, enviando } = useEnvio("/api/auth/criar-senha", (f) => ({ token, senha: f.get("senha"), confirmacao: f.get("confirmacao") }));
  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <CampoSenha rotulo="Nova senha" ajuda="Pelo menos 8 caracteres." name="senha" required minLength={8} autoComplete="new-password" />
      <CampoSenha rotulo="Confirme a senha" name="confirmacao" required minLength={8} autoComplete="new-password" />
      <Erro estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPublico}>{enviando ? "Salvando…" : "Criar senha e entrar"}</button>
    </form>
  );
}
