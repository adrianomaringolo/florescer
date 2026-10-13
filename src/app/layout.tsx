import type { Metadata } from "next";
import { Cormorant_Garamond, Public_Sans } from "next/font/google";
import "./globals.css";

const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Florescer", template: "%s · Florescer" },
  description: "Encaminhamentos terapêuticos do Projeto Florescer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
