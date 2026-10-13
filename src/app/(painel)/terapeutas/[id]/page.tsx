"use client";

import { use } from "react";
import { EdicaoTerapeuta } from "@/components/edicao-terapeuta";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EdicaoTerapeuta key={id} id={id} />;
}
