"use client";

import { use, useEffect } from "react";
import { DetalheCaso } from "@/components/detalhe-caso";
import { acao } from "@/lib/api";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // 5.2: todo acesso a dados de pacientes fica registrado (feito pelo servidor).
  useEffect(() => {
    void acao(`/api/casos/${id}/visualizacao`);
  }, [id]);
  return <DetalheCaso id={id} />;
}
