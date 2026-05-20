import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SiteHeader } from "@/components/navigation/site-header";
import { GlobalChat } from "@/components/chat/global-chat";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ApeTable | Prenota il tuo aperitivo",
    template: "%s | ApeTable",
  },
  description:
    "Scopri e prenota i migliori bar per l'aperitivo a Milano, Venezia, Roma e in tutta Europa. Disponibilità live, offerte esclusive, conferma immediata.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="it" className={inter.variable}>
      <body>
        <AuthProvider>
          <SiteHeader />
          <main>
            {children}
          </main>
          <Footer />
          <BottomNav />
          <GlobalChat />
        </AuthProvider>
      </body>
    </html>
  );
}
