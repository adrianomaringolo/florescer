import { LOGO_PATHS, LOGO_VIEWBOX, ROSA_PATHS, ROSA_VIEWBOX } from "./brand-paths";

// Logo principal (opção 01): wordmark Astrid + rosa em camadas.
// A cor segue `currentColor` — use as combinações aprovadas da apresentação:
// areia sobre vinho (principal), vinho sobre creme, bruma sobre ameixa.

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      role="img"
      aria-label="Florescer"
      className={className}
      dangerouslySetInnerHTML={{ __html: LOGO_PATHS }}
    />
  );
}

export function Rosa({ className }: { className?: string }) {
  return <svg viewBox={ROSA_VIEWBOX} aria-hidden="true" className={className} dangerouslySetInnerHTML={{ __html: ROSA_PATHS }} />;
}
