import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-body">

        {/* ── Brand ── */}
        <div className="footer-brand">
          <Link className="brand" href="/">
            <span className="brand__mark" aria-hidden="true">
              <Image src="/apeapplogo1.png" alt="" width={200} height={200} className="brand__logo-img" />
            </span>
            <span className="brand__text">
              Ape<span className="brand__text-accent">Hour</span>
            </span>
          </Link>
          <p className="footer-brand__desc">
            Prenota il tuo aperitivo nei migliori bar d&apos;Italia. Disponibilità live, offerte esclusive, conferma immediata.
          </p>
          <div className="footer-trust">
            <span>⭐ 4.8 rating medio</span>
            <span>⚡ Conferma istantanea</span>
            <span>🍋 Offerte a ore d&apos;oro</span>
          </div>
        </div>

        {/* ── Esplora ── */}
        <div className="footer-col">
          <p className="footer-col__label">Esplora</p>
          <nav>
            <Link href="/search">Cerca locali</Link>
            <Link href="/booking">Prenota aperitivo</Link>
            <Link href="/events">Eventi</Link>
            <Link href="/favorites">Preferiti</Link>
          </nav>
        </div>

        {/* ── Account ── */}
        <div className="footer-col">
          <p className="footer-col__label">Account</p>
          <nav>
            <Link href="/login">Accedi</Link>
            <Link href="/register">Registrati gratis</Link>
            <Link href="/profile">Il mio profilo</Link>
          </nav>
        </div>

        {/* ── Locali ── */}
        <div className="footer-col">
          <p className="footer-col__label">Sei un locale?</p>
          <nav>
            <Link href="/#per-i-locali">Registra il tuo bar</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/come-funziona">Come funziona</Link>
          </nav>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ApeHour — tutti i diritti riservati</span>
        <div className="footer-bottom__links">
          <Link href="#">Privacy policy</Link>
          <Link href="#">Termini di servizio</Link>
          <Link href="#">Cookie</Link>
        </div>
      </div>
    </footer>
  );
}
