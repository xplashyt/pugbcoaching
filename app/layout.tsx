import type { Metadata } from "next";
import { Fira_Sans, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({ variable: "--font-syne", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const fira = Fira_Sans({ variable: "--font-fira", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://cotasegura.co"),
  title: "Cota Segura | Coaching independiente para PUBG",
  description: "Coaching para revisar aterrizaje, saqueo, control, rotación y cierre en PUBG: BATTLEGROUNDS.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Cota Segura | Sobrevivir empieza antes del primer disparo",
    description: "Coaching independiente para PUBG: BATTLEGROUNDS en PC y consola, sin boosting ni acceso a tu cuenta.",
    url: "/",
    siteName: "Cota Segura",
    locale: "es_CO",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Cota Segura, coaching independiente para PUBG: BATTLEGROUNDS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cota Segura | Sobrevivir empieza antes del primer disparo",
    description: "Coaching independiente para PUBG: BATTLEGROUNDS en PC y consola.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-CO"><body className={`${syne.variable} ${fira.variable}`}>{children}</body></html>;
}
