// Cliente dos endpoints /api. O front só fala com o banco por aqui.

export type Resultado = { ok: true; mensagem?: string; link?: string; id?: string } | { ok: false; erro: string };

export class ErroApi extends Error {
  constructor(
    readonly status: number,
    mensagem: string,
    /** Corpo da resposta de erro, para quem precisa de mais que a mensagem. */
    readonly dados: Record<string, unknown> = {},
  ) {
    super(mensagem);
  }
}

export async function api<T>(caminho: string, opcoes?: { metodo?: "GET" | "POST"; corpo?: unknown }): Promise<T> {
  const r = await fetch(caminho, {
    method: opcoes?.metodo ?? (opcoes?.corpo === undefined ? "GET" : "POST"),
    headers: opcoes?.corpo === undefined ? undefined : { "Content-Type": "application/json" },
    body: opcoes?.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
    cache: "no-store",
  });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) throw new ErroApi(r.status, (dados as { erro?: string }).erro ?? "Não foi possível concluir.", dados as Record<string, unknown>);
  return dados as T;
}

/** POST de uma ação do painel; devolve sempre um Resultado, mesmo quando o servidor recusa. */
export async function acao(caminho: string, corpo: unknown = {}): Promise<Resultado> {
  try {
    return await api<Resultado>(caminho, { corpo });
  } catch (e) {
    if (e instanceof ErroApi) {
      if (typeof window !== "undefined") {
        if (e.status === 401) window.location.assign("/login");
        else if (e.dados.trocarSenha) window.location.assign("/trocar-senha");
      }
      return { ok: false, erro: e.message };
    }
    throw e;
  }
}
