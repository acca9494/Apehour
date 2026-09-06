import type { Metadata } from "next";
import { CookieContent } from "@/components/legal/cookie-content";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Informativa sull'uso dei cookie ai sensi del D. Lgs. 196/2003 e del GDPR.",
};

export default function CookiePolicyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__inner">
        <p className="eyebrow">Legale</p>
        <h1>Cookie Policy</h1>
        <CookieContent />
      </div>
    </div>
  );
}
