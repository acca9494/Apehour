import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa sul trattamento dei dati personali ai sensi del GDPR (Regolamento UE 2016/679).",
};

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__inner">
        <p className="eyebrow">Legale</p>
        <h1>Privacy Policy</h1>
        <p className="legal-page__updated">Ultimo aggiornamento: 25 maggio 2026</p>
        <PrivacyContent />
      </div>
    </div>
  );
}
