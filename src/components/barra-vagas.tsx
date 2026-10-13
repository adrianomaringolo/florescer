export function BarraVagas({ nome, ocupadas, cap, ativo, cheio }: { nome?: string; ocupadas: number; cap: number; ativo: boolean; cheio: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[13px]">
        {nome && <span className="font-medium">{nome}</span>}
        <span className="text-tinta-suave">
          {ocupadas} de {cap}
          {!ativo && " · pausado"}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-linha-suave">
        <div
          className={!ativo ? "h-full bg-desativado" : cheio ? "h-full bg-vinho" : "h-full bg-caramelo"}
          style={{ width: `${Math.min(100, Math.round((ocupadas / cap) * 100))}%` }}
        />
      </div>
    </div>
  );
}
