"use client";

import { Modal } from "@/components/ui/modal";
import { PrivacyContent } from "./privacy-content";
import { CookieContent } from "./cookie-content";

export function LegalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Privacy & Cookie" wide>
      <div className="legal-page legal-page--modal">
        <div className="legal-page__inner">
          <h2 style={{ marginTop: 0 }}>Privacy Policy</h2>
          <PrivacyContent />
          <hr style={{ margin: "2rem 0", border: "none", borderTop: "1px solid var(--border)" }} />
          <h2>Cookie Policy</h2>
          <CookieContent />
        </div>
      </div>
    </Modal>
  );
}
