"use client";

import { Avisos } from "@/components/avisos";
import { BarraLateral } from "@/components/barra-lateral";
import { PainelProvider } from "@/lib/store";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PainelProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
        <BarraLateral />
        <main className="flex w-full min-w-0 max-w-[1240px] flex-col gap-6 px-4 pb-12 pt-6 sm:px-8 lg:px-10 lg:pt-8">{children}</main>
      </div>
      <Avisos />
    </PainelProvider>
  );
}
