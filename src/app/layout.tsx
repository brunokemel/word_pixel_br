import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "World Pixel — pinte o mundo",
  description: "Um mapa colaborativo onde cada pixel conta uma história.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
