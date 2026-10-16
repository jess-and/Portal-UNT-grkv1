import {
  bandLabel,
  bandOf,
  daysLabel,
  markerPct,
  type Band,
  type RequestStatus,
} from "@/lib/unt";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const controlClass =
  "min-h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink outline-none focus:border-navy";

export function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <span className="font-semibold text-ink">{label}</span>
      {children}
      {error ? (
        <span className="text-sm text-alert">{error}</span>
      ) : hint ? (
        <span className="text-sm text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface p-4 sm:p-5", className)}>
      {children}
    </section>
  );
}

export function PageHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mb-5 max-w-3xl">
      <p className="text-sm font-semibold text-navy">{eyebrow}</p>
      <h1 className="mt-1 font-serif text-3xl leading-tight text-navy">{title}</h1>
      {lede ? <p className="mt-2 text-base text-muted">{lede}</p> : null}
    </header>
  );
}

const statusClass: Record<RequestStatus, string> = {
  enviada: "bg-navy/10 text-navy",
  en_revision: "bg-gold-soft text-warn",
  observada: "bg-alert-soft text-alert",
  aprobada: "bg-ok-soft text-ok",
  anulada: "bg-line text-muted",
};

export function StatusPill({ status, label }: { status: RequestStatus; label: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", statusClass[status])}>
      {label}
    </span>
  );
}

const bandSoft: Record<Band, string> = {
  verde: "bg-ok-soft text-ok",
  ambar: "bg-warn-soft text-warn",
  rojo: "bg-alert-soft text-alert",
  vencido: "bg-alert-soft text-alert",
};

export function BandPill({ days }: { days: number }) {
  const band = bandOf(days);
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", bandSoft[band])}>
      {band === "verde" ? "Verde" : band === "ambar" ? "Ámbar" : band === "rojo" ? "Rojo" : "Vencida"}
      {" · "}
      {daysLabel(days)}
    </span>
  );
}

export function SemaphoreBar({ days }: { days: number }) {
  const band = bandOf(days);
  const pct = markerPct(days);
  const zones: Array<{ id: Band | "verde"; label: string; on: boolean; tone: string }> = [
    { id: "verde", label: "30 días o más", on: band === "verde", tone: "bg-ok" },
    { id: "ambar", label: "15 días", on: band === "ambar", tone: "bg-warn" },
    { id: "rojo", label: "7 días o menos", on: band === "rojo" || band === "vencido", tone: "bg-alert" },
  ];

  return (
    <div role="img" aria-label={`${bandLabel(band)}. ${daysLabel(days)}.`}>
      <div className="relative">
        <div className="flex h-2.5 overflow-hidden rounded-full">
          {zones.map((zone) => (
            <div key={zone.label} className={cn("h-full flex-1", zone.on ? zone.tone : "bg-line")} />
          ))}
        </div>
        <span
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-navy"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-3 text-center text-xs text-muted">
        {zones.map((zone) => (
          <span key={zone.label} className={zone.on ? "font-semibold text-ink" : undefined}>
            {zone.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted">Cargando el panel docente…</p>
      <div className="h-8 w-56 rounded-lg bg-line" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 rounded-2xl bg-line" />
        <div className="h-24 rounded-2xl bg-line" />
        <div className="h-24 rounded-2xl bg-line" />
      </div>
      <div className="h-40 rounded-2xl bg-line" />
    </div>
  );
}
