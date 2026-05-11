import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WBR Dashboard — Fernando Moulin",
  description:
    "Painel executivo de WBR (Weekly Business Review) — comparativos rolling, trimestres fixos, projetado vs realizado e aprovação de conteúdo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
