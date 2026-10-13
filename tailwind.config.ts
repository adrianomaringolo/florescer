import type { Config } from "tailwindcss";

// Paleta da identidade visual (apresentação de logotipos, opção 01).
// Os valores vivem como variáveis CSS em src/app/globals.css.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vinho: { DEFAULT: v("vinho"), escuro: v("vinho-escuro"), suave: v("vinho-suave"), claro: v("vinho-claro") },
        ameixa: { DEFAULT: v("ameixa"), suave: v("ameixa-suave") },
        creme: v("creme"),
        areia: v("areia"),
        caramelo: { DEFAULT: v("caramelo"), suave: v("caramelo-suave"), tinta: v("caramelo-tinta") },
        bruma: { DEFAULT: v("bruma"), escura: v("bruma-escura") },
        terracota: { DEFAULT: v("terracota"), suave: v("terracota-suave"), tinta: v("terracota-tinta") },
        fundo: v("fundo"),
        superficie: v("superficie"),
        linha: { DEFAULT: v("linha"), suave: v("linha-suave"), forte: v("linha-forte") },
        tinta: { DEFAULT: v("tinta"), suave: v("tinta-suave"), apagada: v("tinta-apagada") },
        desativado: v("desativado"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        modal: "0 24px 64px rgb(var(--ameixa) / 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
