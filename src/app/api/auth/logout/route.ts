import { NextResponse } from "next/server";
import { sair } from "@/server/acoes-publicas";

export async function POST() {
  await sair();
  return NextResponse.json({});
}
