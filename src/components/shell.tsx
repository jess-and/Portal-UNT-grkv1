import { Link } from "@tanstack/react-router";
import { Bell, GraduationCap, LayoutDashboard, RotateCcw, ScrollText } from "lucide-react";
import { useState } from "react";
import { noticesFor, teacherById, useUnt } from "@/lib/unt";
import { useHydrated } from "@/components/hydration";

const NAV = [
  { to: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
  { to: "/solicitudes", label: "Capacitaciones", icon: GraduationCap, exact: false },
  { to: "/tesis", label: "Tesis", icon: ScrollText, exact: false },
  { to: "/notificaciones", label: "Plazos", icon: Bell, exact: false },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const ready = useHydrated();
  const teacherId = useUnt((s) => s.teacherId);
  const setTeacher = useUnt((s) => s.setTeacher);
  const theses = useUnt((s) => s.theses);
  const readIds = useUnt((s) => s.readIds);
  const resetDemo = useUnt((s) => s.resetDemo);
  const [confirmReset, setConfirmReset] = useState(false);

  const teacher = teacherById(teacherId);
  const unread = ready
    ? noticesFor(teacherId, theses).filter((n) => !readIds.includes(n.id)).length
    : 0;

  return (
    <div className="min-h-screen">
      <div className="h-1.5 bg-gold" />
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="shrink-0 rounded-md" aria-label="Ir al inicio">
            <img
              src="/unt-logo.jpg"
              alt="Universidad Nacional de Trujillo"
              className="h-14 w-auto bg-surface object-contain sm:h-16"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg leading-tight text-navy">Gestión docente</p>
            <p className="truncate text-sm text-muted">
              Escuela de Ciencia Política · Facultad de Derecho y Ciencias Políticas
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl gap-3 px-4 pb-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-ink">Docente en sesión</span>
            <select
              className="min-h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink"
              value={ready ? teacherId : "t1"}
              onChange={(e) => setTeacher(e.target.value)}
              disabled={!ready}
            >
              <option value="t1">Dra. Elena Vargas Mendoza — Ciencia Política</option>
              <option value="t2">Mg. Ricardo Solano Díaz — Ciencia Política</option>
              <option value="t3">Dr. Martín Quispe Huamán — Facultad</option>
            </select>
          </label>
          <p className="text-sm text-muted sm:pb-2">
            {ready ? (
              <>
                {teacher.rank}
                <span className="px-1" aria-hidden>
                  ·
                </span>
                {teacher.email}
              </>
            ) : (
              "Cargando sesión local…"
            )}
          </p>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-3" aria-label="Secciones">
          {NAV.map((item) => {
            const Icon = item.icon;
            const badge = item.to === "/notificaciones" ? unread : 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-semibold"
                activeProps={{ className: "bg-navy text-surface", "aria-current": "page" }}
                inactiveProps={{ className: "text-navy hover:bg-gold-soft" }}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
                {badge > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-alert px-1.5 text-xs font-bold text-surface">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </header>
      <main id="contenido" className="mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-sm text-muted">
        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p>Universidad Nacional de Trujillo. Los registros se guardan en este navegador.</p>
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ink">Se reemplazarán sus registros locales.</span>
              <button
                type="button"
                className="min-h-11 rounded-xl bg-navy px-3 font-semibold text-surface"
                onClick={() => {
                  resetDemo();
                  setConfirmReset(false);
                }}
              >
                Restaurar ejemplos
              </button>
              <button
                type="button"
                className="min-h-11 rounded-xl border border-line bg-surface px-3 font-semibold text-ink"
                onClick={() => setConfirmReset(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-line bg-surface px-3 font-semibold text-navy"
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw className="size-4" aria-hidden />
              Restaurar datos de ejemplo
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
