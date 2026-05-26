"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { todayInputValue } from "@/lib/utils";

const MONTHS_IT = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const DAYS_IT   = ["Lu","Ma","Me","Gi","Ve","Sa","Do"];

type Props = {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
};

export function CalendarDropdown({ value, onChange, compact = false }: Props) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function toISO(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function isPast(day: number) {
    return new Date(viewYear, viewMonth, day) < todayDate;
  }
  function isToday(day: number) {
    return viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth() && day === todayDate.getDate();
  }
  function isSelected(day: number) {
    return value === toISO(day);
  }

  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })
    : "Seleziona data";

  const hasValue = Boolean(value);

  if (compact) {
    return (
      <div ref={ref} className="filter-cal">
        <button
          type="button"
          className={`filter-cal__trigger${open ? " is-open" : ""}${hasValue ? " has-value" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <svg className="filter-cal__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 3.5v3M17 3.5v3" /><rect x="4" y="6.5" width="16" height="13" rx="2.5" /><path d="M4 10.5h16" />
          </svg>
          <span className="filter-cal__value">{displayValue}</span>
          {hasValue && (
            <button
              type="button"
              className="filter-cal__clear"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              aria-label="Rimuovi data"
            >✕</button>
          )}
          <svg className={`filter-cal__chevron${open ? " is-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {open && <CalendarPopup
          cells={cells} isPast={isPast} isToday={isToday} isSelected={isSelected}
          viewMonth={viewMonth} viewYear={viewYear} prevMonth={prevMonth} nextMonth={nextMonth}
          toISO={toISO} onChange={onChange} setOpen={setOpen}
        />}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`hero-search__field hero-search__field--dropdown${open ? " hero-search__field--open" : ""}`}
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded={open}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((v) => !v); }}
    >
      <span className={`hero-search__icon${open || hasValue ? " hero-search__icon--active" : ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1.15em", height: "1.15em" }}>
          <path d="M7 3.5v3M17 3.5v3" /><rect x="4" y="6.5" width="16" height="13" rx="2.5" /><path d="M4 10.5h16" />
        </svg>
      </span>
      <span className="hero-search__copy">
        <span className="hero-search__label">Data</span>
        <span className={`hero-search__value${!hasValue ? " hero-search__value--placeholder" : ""}`}>
          {displayValue}
        </span>
      </span>
      <span className={`hero-search__chevron${open ? " hero-search__chevron--up" : ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
      {open && <CalendarPopup
        cells={cells} isPast={isPast} isToday={isToday} isSelected={isSelected}
        viewMonth={viewMonth} viewYear={viewYear} prevMonth={prevMonth} nextMonth={nextMonth}
        toISO={toISO} onChange={onChange} setOpen={setOpen}
        onClick={(e) => e.stopPropagation()}
      />}
    </div>
  );
}

type PopupProps = {
  cells: (number | null)[];
  isPast: (d: number) => boolean;
  isToday: (d: number) => boolean;
  isSelected: (d: number) => boolean;
  viewMonth: number;
  viewYear: number;
  prevMonth: () => void;
  nextMonth: () => void;
  toISO: (d: number) => string;
  onChange: (v: string) => void;
  setOpen: (v: boolean) => void;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

function CalendarPopup({ cells, isPast, isToday, isSelected, viewMonth, viewYear, prevMonth, nextMonth, toISO, onChange, setOpen, onClick }: PopupProps) {
  return (
    <div className="hscal" role="dialog" aria-label="Seleziona data" onClick={onClick}>
      <div className="hscal__header">
        <span className="hscal__month">{MONTHS_IT[viewMonth]} {viewYear}</span>
        <div className="hscal__navs">
          <button type="button" className="hscal__nav" onClick={prevMonth} aria-label="Mese precedente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button type="button" className="hscal__nav" onClick={nextMonth} aria-label="Mese successivo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="hscal__grid">
        {DAYS_IT.map((d) => (
          <div key={d} className="hscal__weekday">{d}</div>
        ))}
        {cells.map((day, idx) =>
          day === null ? (
            <div key={`e-${idx}`} />
          ) : (
            <button
              key={day}
              type="button"
              disabled={isPast(day)}
              className={[
                "hscal__day",
                isPast(day)     ? "hscal__day--past"     : "",
                isToday(day)    ? "hscal__day--today"    : "",
                isSelected(day) ? "hscal__day--selected" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => { onChange(toISO(day)); setOpen(false); }}
            >
              {day}
            </button>
          )
        )}
      </div>
      <div className="hscal__quick">
        <button type="button" className="hscal__quick-btn" onClick={() => { onChange(todayInputValue()); setOpen(false); }}>Oggi</button>
        <button type="button" className="hscal__quick-btn" onClick={() => {
          const d = new Date(); d.setDate(d.getDate() + 1);
          onChange(d.toISOString().split("T")[0]!); setOpen(false);
        }}>Domani</button>
        <button type="button" className="hscal__quick-btn" onClick={() => {
          const delta = (6 - new Date().getDay() + 7) % 7;
          const d = new Date(); d.setDate(d.getDate() + (delta || 7));
          onChange(d.toISOString().split("T")[0]!); setOpen(false);
        }}>Weekend</button>
      </div>
    </div>
  );
}
