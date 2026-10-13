import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (senha: string, sal: Buffer, tamanho: number) => Promise<Buffer>;

/** Formato: scrypt$<sal hex>$<hash hex> */
export async function gerarHash(senha: string) {
  const sal = randomBytes(16);
  const hash = await scrypt(senha, sal, 64);
  return `scrypt$${sal.toString("hex")}$${hash.toString("hex")}`;
}

export async function conferirSenha(senha: string, guardado: string) {
  const [alg, salHex, hashHex] = guardado.split("$");
  if (alg !== "scrypt" || !salHex || !hashHex) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const hash = await scrypt(senha, Buffer.from(salHex, "hex"), esperado.length);
  return timingSafeEqual(hash, esperado);
}

export const SENHA_MINIMA = 8;
