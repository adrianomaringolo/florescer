import type { Metadata } from "next";
import { FormularioLogin } from "@/components/formularios-acesso";
import { MolduraPublica } from "@/components/moldura-publica";

export const metadata: Metadata = { title: "Entrar" };

export default function Login() {
  return (
    <MolduraPublica largura={420}>
      <main className="flex w-full max-w-[420px] flex-col gap-6 rounded-2xl border border-linha bg-superficie px-8 py-9">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-[32px] font-semibold leading-tight text-ameixa">Entrar no painel</h1>
          <p className="text-sm text-tinta-suave">Acesso da equipe do Projeto Florescer.</p>
        </div>
        <FormularioLogin />
        <p className="text-xs text-tinta-suave">Esqueceu a senha? Peça a outra pessoa da equipe um novo convite.</p>
      </main>
    </MolduraPublica>
  );
}
