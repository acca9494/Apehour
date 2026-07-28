import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App Preview — ApeHour",
  robots: { index: false },
};

const PAGES = [
  { label: "Home",     href: "/?mode=app" },
  { label: "Cerca",    href: "/search?mode=app" },
  { label: "Mappa",    href: "/search?view=map&mode=app" },
  { label: "Events",   href: "/events?mode=app" },
  { label: "Profilo",  href: "/profile?mode=app" },
];

export default async function PreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const activePage = sp.page ?? "/?mode=app";
  const iframeUrl = activePage;

  return (
    <div className="app-preview-page">
      <div className="app-preview-header">
        <span className="app-preview-header__logo">ApeHour <span>App Preview</span></span>
        <p className="app-preview-header__desc">
          Condividi questo link con i commercianti per mostrare l&apos;esperienza app.
        </p>
        <code className="app-preview-header__url">apehour.it/preview</code>
      </div>

      <div className="app-preview-stage">
        {/* Phone frame */}
        <div className="phone-frame">
          <div className="phone-frame__notch" />
          <div className="phone-frame__screen">
            <iframe
              src={iframeUrl}
              className="phone-frame__iframe"
              title="ApeHour App Preview"
            />
          </div>
          <div className="phone-frame__home-bar" />
        </div>
      </div>

      {/* Page switcher */}
      <div className="app-preview-nav">
        {PAGES.map((p) => (
          <a
            key={p.href}
            href={`/preview?page=${encodeURIComponent(p.href)}`}
            className={`app-preview-nav__btn${activePage === p.href ? " is-active" : ""}`}
          >
            {p.label}
          </a>
        ))}
      </div>
    </div>
  );
}
