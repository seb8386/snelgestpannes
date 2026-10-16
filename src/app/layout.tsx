import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SNEL CVS Kitambo — Système de Gestion des Réclamations",
  description:
    "Application web intelligente de gestion des réclamations clients - Société Nationale d'Électricité, Centre de Vente et Service Kitambo",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
