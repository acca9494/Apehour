"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SVGProps } from "react";
import { todayInputValue } from "@/lib/utils";
import { CalendarDropdown } from "@/components/ui/calendar-dropdown";
import { useLang } from "@/lib/i18n/context";

type IconProps = SVGProps<SVGSVGElement>;

function MapPinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function BeeHexIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.6 19.1 6.8v8.4L12 19.4 4.9 15.2V6.8L12 2.6Z" />
      <path d="m12 6.2 4 2.3v4.9l-4 2.3-4-2.3V8.5l4-2.3Z" />
    </svg>
  );
}


function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ── Shared types ──────────────────────────────────── */
type DropdownOption = {
  value: string;
  label: string;
  detail?: string;
  Icon: (props: IconProps) => React.ReactElement;
};

/* ── List Dropdown ─────────────────────────────────── */
type SearchDropdownProps = {
  label: string;
  FieldIcon: (props: IconProps) => React.ReactElement;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
};

function SearchDropdown({ label, FieldIcon, options, value, onChange }: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  return (
    <div
      ref={ref}
      className={`hero-search__field hero-search__field--dropdown${open ? " hero-search__field--open" : ""}`}
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
      aria-haspopup="listbox"
      aria-expanded={open}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((v) => !v); }}
    >
      <span className={`hero-search__icon${open || value ? " hero-search__icon--active" : ""}`}>
        <FieldIcon aria-hidden="true" />
      </span>
      <span className="hero-search__copy">
        <span className="hero-search__label">{label}</span>
        <span className="hero-search__value">{selected?.label}</span>
      </span>
      <span className={`hero-search__chevron${open ? " hero-search__chevron--up" : ""}`}>
        <ChevronDownIcon aria-hidden="true" />
      </span>

      {open && (
        <ul className="hsdd" role="listbox" onClick={(e) => e.stopPropagation()}>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={active}
                className={`hsdd__item${active ? " hsdd__item--active" : ""}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                <span className="hsdd__icon"><opt.Icon aria-hidden="true" /></span>
                <span className="hsdd__text">
                  {opt.label}
                  {opt.detail && <span className="hsdd__detail">({opt.detail})</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── Data ──────────────────────────────────────────── */
const CITY_COUNTS: Record<string, string> = {
  Milano: "48", Roma: "61", Firenze: "29",
  Venezia: "17", Napoli: "34", Torino: "22", Bologna: "19",
};
const CITIES = ["Milano", "Roma", "Firenze", "Venezia", "Napoli", "Torino", "Bologna"];

function GridIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

const TYPE_PILLS: {
  value: string;
  label: string;
  budget: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "",
    label: "Tutti",
    budget: "",
    icon: <GridIcon className="hstp__pill-icon" aria-hidden="true" />,
  },
  {
    value: "vespa-sprint",
    label: "Vespa Sprint",
    budget: "€",
    icon: (
      <img
        src="/vespa.png"
        alt=""
        className="hstp__pill-icon hstp__pill-icon--img"
      />
    ),
  },
  {
    value: "ape-plus",
    label: "Ape Plus",
    budget: "€€",
    icon: (
      <img
        src="/plus.png"
        alt=""
        className="hstp__pill-icon hstp__pill-icon--img"
      />
    ),
  },
  {
    value: "bombo-queen",
    label: "Bombo Queen",
    budget: "€€€",
    icon: (
      <img
        src="/bombo.png"
        alt=""
        className="hstp__pill-icon hstp__pill-icon--img"
      />
    ),
  },
];

type TypePill = { value: string; label: string; budget: string; icon: React.ReactNode };

function TypeDropdownTranslated({ value, onChange, pills, budgetLabel }: {
  value: string;
  onChange: (v: string) => void;
  pills: TypePill[];
  budgetLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = pills.find((o) => o.value === value) ?? pills[0]!;

  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  return (
    <div
      ref={ref}
      className={`hero-search__field hero-search__field--dropdown${open ? " hero-search__field--open" : ""}`}
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
      aria-haspopup="listbox"
      aria-expanded={open}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((v) => !v); }}
    >
      <span className={`hero-search__icon hero-search__icon--type${open || value ? " hero-search__icon--active" : ""}`}>
        {selected.icon}
      </span>
      <span className="hero-search__copy">
        <span className="hero-search__label">{budgetLabel}</span>
        <span className="hero-search__value">
          {selected.label}{selected.budget ? <span className="hero-search__budget">{selected.budget}</span> : null}
        </span>
      </span>
      <span className={`hero-search__chevron${open ? " hero-search__chevron--up" : ""}`}>
        <ChevronDownIcon aria-hidden="true" />
      </span>

      {open && (
        <ul className="hsdd hsdd--type" role="listbox" onClick={(e) => e.stopPropagation()}>
          {pills.map((opt) => {
            const active = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={active}
                className={`hsdd__item hsdd__item--type${active ? " hsdd__item--active" : ""}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                <span className="hsdd__icon hsdd__icon--type">{opt.icon}</span>
                <span className="hsdd__text">{opt.label}</span>
                {opt.budget && <span className="hsdd__budget">{opt.budget}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── Form ──────────────────────────────────────────── */
export function HeroSearchForm() {
  const router = useRouter();
  const { t } = useLang();
  const [city,   setCity]   = useState("");
  const [date,   setDate]   = useState("");
  const [guests, setGuests] = useState("2");
  const [type,   setType]   = useState("");

  const cityOptions: DropdownOption[] = [
    { value: "", label: t.heroSearch.allItaly, detail: t.heroSearch.allCities, Icon: MapPinIcon },
    ...CITIES.map((c) => ({ value: c, label: c, detail: `${CITY_COUNTS[c]} ${t.heroSearch.people.toLowerCase()}`, Icon: MapPinIcon })),
  ];

  const guestOptions: DropdownOption[] = t.guestOptions.map((o) => ({
    value: o.value, label: o.label, detail: o.detail, Icon: UserIcon,
  }));

  const typePillsTranslated = [
    { ...TYPE_PILLS[0]!, label: t.apetypes.all },
    ...TYPE_PILLS.slice(1),
  ];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city)  params.set("city",   city);
    if (date)  params.set("date",   date);
    if (type)  params.set("type",   type);
    params.set("guests", guests);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form className="hero-search" onSubmit={onSubmit}>

      <SearchDropdown label={t.heroSearch.where}   FieldIcon={MapPinIcon} options={cityOptions}  value={city}   onChange={setCity}   />
      <div className="hero-search__divider" />
      <CalendarDropdown value={date} onChange={setDate} />
      <div className="hero-search__divider" />
      <SearchDropdown label={t.heroSearch.people} FieldIcon={UserIcon}   options={guestOptions} value={guests} onChange={setGuests} />
      <div className="hero-search__divider" />
      <TypeDropdownTranslated value={type} onChange={setType} pills={typePillsTranslated} budgetLabel={t.heroSearch.budget} />

      <button type="submit" className="hero-search__button">
        <SearchIcon aria-hidden="true" />
        {t.heroSearch.search}
      </button>

    </form>
  );
}
