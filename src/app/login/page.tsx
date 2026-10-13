import type { Metadata } from "next";
import Link from "next/link";
import { FormularioLogin } from "@/components/formularios-acesso";
import { Logo } from "@/components/marca";
import { RodapePublico } from "@/components/moldura-publica";

export const metadata: Metadata = { title: "Entrar" };

export default function Login() {
  return (
    // Fundo: padrão Jardim do manual da marca (rosas sobre vinho), sob um véu vinho-escuro que o deixa como textura e garante a leitura.
    <div className="relative isolate flex min-h-screen flex-col bg-vinho bg-[url(/brand/padrao-jardim.svg)] bg-cover bg-center">
      <div aria-hidden className="absolute inset-0 -z-10 bg-vinho-escuro/75" />

      <div className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col items-center justify-center gap-10 px-4 py-10 lg:flex-row lg:justify-between lg:gap-16 lg:px-10">
        <section className="flex max-w-[440px] flex-col items-center gap-5 text-center text-areia lg:items-start lg:text-left">
          <Logo className="h-16 w-auto drop-shadow-[0_2px_12px_rgb(0_0_0/0.25)] lg:h-24" />
          <p className="hidden font-serif text-[34px] font-semibold leading-[1.15] text-creme [text-shadow:0_2px_16px_rgb(0_0_0/0.3)] lg:block">
            Florescer também é um direito.
          </p>
          <p className="hidden max-w-[360px] text-[15px] leading-relaxed text-creme/90 [text-shadow:0_1px_10px_rgb(0_0_0/0.35)] lg:block">
            Painel da equipe para acompanhar cada pessoa do pedido de atendimento ao encaminhamento.
          </p>
        </section>

        <main className="flex w-full max-w-[420px] flex-col gap-6 rounded-2xl bg-superficie px-7 py-8 shadow-modal sm:px-9 sm:py-10">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-serif text-[34px] font-semibold leading-tight text-ameixa">Entrar no painel</h1>
            <p className="text-sm text-tinta-suave">Acesso da equipe do Projeto Florescer.</p>
          </div>
          <FormularioLogin />
          <div className="flex flex-col gap-2 border-t border-linha-suave pt-5 text-xs leading-relaxed text-tinta-suave">
            <p>Esqueceu a senha? Peça a outra pessoa da equipe um novo convite.</p>
            <p>
              Procura atendimento?{" "}
              <Link href="/solicitar" className="font-medium text-vinho underline-offset-2 hover:underline">
                Preencha o formulário de solicitação
              </Link>
              .
            </p>
          </div>
        </main>
      </div>

      <div className="px-4 pb-6">
        <RodapePublico className="text-creme/85 [text-shadow:0_1px_8px_rgb(0_0_0/0.4)]" destaque="hover:text-creme" />
      </div>
    </div>
  );
}
