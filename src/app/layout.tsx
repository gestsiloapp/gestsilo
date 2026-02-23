import type { Metadata } from "next";
import "./globals.css";
import { DatabaseProvider } from "@/components/providers/DatabaseProvider";
import { MainLayout } from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "GestSilo",
  description: "Gestão de Silagem Offline-First",
  manifest: "/manifest.json", // Preparando terreno para PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <DatabaseProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </DatabaseProvider>
      </body>
    </html>
  );
}
