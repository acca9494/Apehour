import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { AuthProvider } from "@/lib/auth/context";
import { MobileMenuProvider } from "@/lib/mobile-menu-context";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SiteHeader } from "@/components/navigation/site-header";
import { GlobalChat } from "@/components/chat/global-chat";
import { SearchViewPill } from "@/components/search/search-view-pill";
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

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const headersList = await headers();
  const isMaintenance = headersList.get("x-maintenance") === "1";

  return (
    <html lang="it" className={inter.variable}>
      <body>
        <AuthProvider>
          <MobileMenuProvider>
            {!isMaintenance && <SiteHeader />}
            <main>
              {children}
            </main>
            {!isMaintenance && <Footer />}
            {!isMaintenance && <BottomNav />}
            {!isMaintenance && <GlobalChat />}
            {!isMaintenance && <Suspense><SearchViewPill /></Suspense>}
          </MobileMenuProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
