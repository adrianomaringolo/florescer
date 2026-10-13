"use client";

import { useEffect, useState } from "react";
import { api, ErroApi } from "@/lib/api";
import { botaoPublico, campoPublico } from "./moldura-publica";

interface EstadoForm {
  erro?: string;
  /** Devolvido para repreencher o campo após um erro. */
  email?: string;
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
      <label className="flex flex-col gap-1.5 text-[13px]">
        <span className="font-medium">Senha</span>
        <input name="senha" type="password" required autoComplete="current-password" className={campoPublico} />
      </label>
      <Erro estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPublico}>{enviando ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

export function FormularioConvite({ token }: { token: string }) {
  const { estado, enviar, enviando } = useEnvio("/api/auth/criar-senha", (f) => ({ token, senha: f.get("senha"), confirmacao: f.get("confirmacao") }));
  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-[13px]">
        <span className="font-medium">Nova senha</span>
        <input name="senha" type="password" required minLength={8} autoComplete="new-password" className={campoPublico} />
        <span className="text-xs text-tinta-suave">Pelo menos 8 caracteres.</span>
      </label>
      <label className="flex flex-col gap-1.5 text-[13px]">
        <span className="font-medium">Confirme a senha</span>
        <input name="confirmacao" type="password" required minLength={8} autoComplete="new-password" className={campoPublico} />
      </label>
      <Erro estado={estado} />
      <button type="submit" disabled={enviando} className={botaoPublico}>{enviando ? "Salvando…" : "Criar senha e entrar"}</button>
    </form>
  );
}
