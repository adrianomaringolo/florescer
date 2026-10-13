"use client";

import clsx from "clsx";
import { useEffect } from "react";

type BotaoVariante = "primario" | "secundario" | "texto";

export function Botao({
  variante = "secundario",
  tamanho = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: BotaoVariante; tamanho?: "sm" | "md" }) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex flex-none items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed",
        tamanho === "sm" ? "px-3 py-[7px] text-[13px]" : "px-4 py-2.5 text-sm",
        variante === "primario" &&
          "bg-vinho font-semibold text-creme hover:bg-vinho-escuro disabled:bg-desativado disabled:text-superficie",
        variante === "secundario" &&
          "border border-linha-forte bg-superficie font-medium text-tinta hover:border-vinho/40 hover:bg-vinho-suave",
        variante === "texto" && "p-0 text-[13px] text-tinta-suave hover:text-vinho",
        className,
      )}
      {...props}
    />
  );
}

export function Cartao({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={clsx("rounded-xl border border-linha bg-superficie", className)} {...props} />;
}

export function CabecalhoCartao({ titulo, children, className }: { titulo: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("flex flex-col gap-0.5 border-b border-linha-suave px-[18px] py-4", className)}>
      <h2 className="text-[15px] font-semibold">{titulo}</h2>
      {children && <div className="text-[13px] text-tinta-suave text-pretty">{children}</div>}
    </div>
  );
}

export function Ponto({ className, tamanho = 8 }: { className: string; tamanho?: number }) {
  return <span aria-hidden className={clsx("inline-block flex-none rounded-full", className)} style={{ width: tamanho, height: tamanho }} />;
}

export type Tom = "ok" | "atencao" | "problema" | "neutro";
const TONS: Record<Tom, string> = {
  ok: "bg-ameixa-suave text-ameixa",
  atencao: "bg-caramelo-suave text-caramelo-tinta",
  problema: "bg-terracota-suave text-terracota-tinta",
  neutro: "bg-linha-suave text-tinta-suave",
};

export function Selo({ tom, children, className }: { tom: Tom; children: React.ReactNode; className?: string }) {
  return <span className={clsx("inline-flex whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs", TONS[tom], className)}>{children}</span>;
}

export function TituloPagina({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={clsx("font-serif text-[34px] font-semibold leading-[1.1] tracking-[-0.01em] text-ameixa", className)}>{children}</h1>;
}

export function Caixa({ marcado }: { marcado: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "flex h-5 w-5 flex-none items-center justify-center rounded-[5px] border-[1.5px] text-[13px] text-creme",
        marcado ? "border-vinho bg-vinho" : "border-linha-forte bg-superficie",
      )}
    >
      {marcado ? "✓" : ""}
    </span>
  );
}

export function Radio({ marcado, tamanho = 18 }: { marcado: boolean; tamanho?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block flex-none rounded-full bg-superficie"
      style={{
        width: tamanho,
        height: tamanho,
        border: marcado ? `${Math.round(tamanho / 3)}px solid rgb(var(--vinho))` : "1.5px solid rgb(var(--linha-forte))",
      }}
    />
  );
}

export function OpcaoRadio({ marcado, onClick, children }: { marcado: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={marcado}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 rounded-[10px] border px-3.5 py-[11px] text-left text-sm text-tinta",
        marcado ? "border-vinho bg-vinho-suave" : "border-linha bg-superficie hover:border-linha-forte",
      )}
    >
      <Radio marcado={marcado} tamanho={16} />
      {children}
    </button>
  );
}

const campoBase =
  "w-full rounded-lg border border-linha-forte bg-superficie px-3 py-2.5 text-sm text-tinta placeholder:text-tinta-apagada focus:border-vinho focus:outline-none focus:ring-2 focus:ring-vinho/20";

export function Campo({ rotulo, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { rotulo: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px]">
      <span className="font-medium">{rotulo}</span>
      <input className={clsx(campoBase, className)} {...props} />
    </label>
  );
}

export function AreaTexto({ rotulo, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { rotulo?: string }) {
  const area = <textarea className={clsx(campoBase, "resize-y leading-relaxed", className)} {...props} />;
  if (!rotulo) return area;
  return (
    <label className="flex flex-col gap-1.5 text-[13px]">
      <span className="font-medium">{rotulo}</span>
      {area}
    </label>
  );
}

export const inputClasse = campoBase;

export function Modal({
  aberto,
  aoFechar,
  largura = 560,
  sobretitulo,
  titulo,
  descricao,
  rodape,
  children,
}: {
  aberto: boolean;
  aoFechar: () => void;
  largura?: number;
  sobretitulo?: string;
  titulo: string;
  descricao?: React.ReactNode;
  rodape: React.ReactNode;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [aberto, aoFechar]);

  if (!aberto) return null;
  return (
    <div
      onClick={aoFechar}
      className="fixed inset-0 z-20 flex items-center justify-center bg-ameixa/40 p-4 backdrop-blur-[2px] sm:p-10"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full flex-col overflow-y-auto rounded-2xl bg-superficie shadow-modal"
        style={{ maxWidth: largura }}
      >
        <div className="flex flex-col gap-0.5 border-b border-linha-suave px-[22px] py-[18px]">
          {sobretitulo && <div className="text-xs text-tinta-suave">{sobretitulo}</div>}
          <div className="font-serif text-2xl font-semibold text-ameixa">{titulo}</div>
          {descricao && <div className="text-[13px] text-tinta-suave text-pretty">{descricao}</div>}
        </div>
        <div className="flex flex-col gap-4 px-[22px] py-[18px] text-[13px]">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-linha-suave px-[22px] py-3.5">{rodape}</div>
      </div>
    </div>
  );
}
