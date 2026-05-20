import Image from "next/image";

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f1117",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      textAlign: "center",
      padding: "2rem",
      gap: "1.5rem",
    }}>
      <Image src="/apeapplogo1.png" alt="ApeHour" width={80} height={80} style={{ opacity: 0.9 }} />

      <div>
        <p style={{ color: "#f5a800", fontWeight: 800, letterSpacing: "0.1em", fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          In manutenzione
        </p>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
          Stiamo migliorando<br />ApeHour per te
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem", lineHeight: 1.7, maxWidth: "420px" }}>
          Torneremo online a breve con tante novità.<br />
          Nel frattempo seguici sui social.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <a
          href="https://instagram.com"
          style={{ padding: "0.6rem 1.4rem", background: "#f5a800", color: "#fff", borderRadius: "999px", fontWeight: 800, fontSize: "0.88rem", textDecoration: "none" }}
        >
          Seguici su Instagram
        </a>
      </div>

      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", marginTop: "1rem" }}>
        © {new Date().getFullYear()} ApeHour
      </p>
    </div>
  );
}
