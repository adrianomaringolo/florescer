import Link from "next/link";
import { EMAIL_PROJETO } from "@/lib/dados";
import { Logo } from "./marca";

/** Fundo creme com logo vinho — usado nas páginas fora do painel. */
export function MolduraPublica({ children, largura = 720 }: { children: React.ReactNode; largura?: number }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-creme px-4 pb-14 pt-10">
      <header className="w-full text-vinho" style={{ maxWidth: largura }}>
        <Link href="/solicitar" aria-label="Florescer — solicitar atendimento" className="inline-block">
          <Logo className="h-14 w-auto" />
        </Link>
      </header>
      {children}
      <RodapePublico />
    </div>
  );
}

/** Contato e links legais, presentes em todas as páginas públicas. */
export function RodapePublico({ className = "text-tinta-suave", destaque = "hover:text-vinho" }: { className?: string; destaque?: string }) {
  return (
    <footer className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs ${className}`}>
      <span>Projeto Florescer</span>
      <span aria-hidden>·</span>
      <a href={`mailto:${EMAIL_PROJETO}`} className={`underline-offset-2 hover:underline ${destaque}`}>{EMAIL_PROJETO}</a>
      <span aria-hidden>·</span>
      <Link href="/privacidade" className={`underline-offset-2 hover:underline ${destaque}`}>Privacidade</Link>
      <span aria-hidden>·</span>
      <Link href="/termos" className={`underline-offset-2 hover:underline ${destaque}`}>Termos de uso</Link>
    </footer>
  );
}

export const campoPublico =
  "w-full rounded-lg border border-linha-forte bg-superficie px-3.5 py-3 text-[15px] text-tinta placeholder:text-tinta-apagada focus:border-vinho focus:outline-none focus:ring-2 focus:ring-vinho/20";

export const botaoPublico =
  "rounded-lg bg-vinho px-6 py-3.5 text-[15px] font-semibold text-creme hover:bg-vinho-escuro disabled:cursor-not-allowed disabled:bg-desativado disabled:text-superficie";
