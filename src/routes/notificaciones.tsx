import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { BandPill, Card, PageHeading, Skeleton, controlClass } from "@/components/bits";
import { useHydrated } from "@/components/hydration";
import {
  ROLE_LABEL,
  clashes,
  formatDate,
  noteFor,
  noticesFor,
  useUnt,
  type Notice,
} from "@/lib/unt";

export const Route = createFileRoute("/notificaciones")({
  component: AvisosPage,
});

function AvisosPage() {
  const ready = useHydrated();
  if (!ready) return <Skeleton />;
  return <Avisos />;
}

function Avisos() {
  const teacherId = useUnt((s) => s.teacherId);
  const theses = useUnt((s) => s.theses);
  const notes = useUnt((s) => s.notes);
  const readIds = useUnt((s) => s.readIds);
  const toggleRead = useUnt((s) => s.toggleRead);
  const markAllRead = useUnt((s) => s.markAllRead);
  const setNote = useUnt((s) => s.setNote);

  const notices = noticesFor(teacherId, theses);
  const unread = notices.filter((n) => !readIds.includes(n.id)).length;

  return (
    <div>
      <PageHeading
        eyebrow="Agenda de sustentación"
        title="Plazos por vencer"
        lede="Desde los 30 días previos el panel avisa para que reserve horario. Ámbar a los 15 días y rojo a los 7."
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {notices.length === 0
            ? "Ninguna sustentación entra todavía en la ventana de 30 días."
            : `${unread} aviso${unread === 1 ? "" : "s"} sin leer de ${notices.length}.`}
        </p>
        {unread > 0 ? (
          <button
            type="button"
            className="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-navy"
            onClick={() => markAllRead(notices.map((n) => n.id))}
          >
            Marcar todo como leído
          </button>
        ) : null}
      </div>
      {notices.length === 0 ? (
        <Card>
          <p className="text-sm text-ink">
            Cuando una tesis asignada entre en los 30 días previos a la sustentación, aparecerá aquí con el
            semáforo correspondiente.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              read={readIds.includes(notice.id)}
              note={noteFor(notes, teacherId, notice.thesis.id)}
              clashNames={clashes(teacherId, theses, notice.thesis).map(
                (t) => `${t.student} · ${formatDate(t.defenseDate)}`,
              )}
              onToggle={() => toggleRead(notice.id)}
              onBlocked={(blocked) => setNote(notice.thesis.id, { blocked })}
              onNote={(note) => setNote(notice.thesis.id, { note })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function NoticeCard({
  notice,
  read,
  note,
  clashNames,
  onToggle,
  onBlocked,
  onNote,
}: {
  notice: Notice;
  read: boolean;
  note: { blocked: boolean; note: string };
  clashNames: string[];
  onToggle: () => void;
  onBlocked: (blocked: boolean) => void;
  onNote: (note: string) => void;
}) {
  const { thesis, role, days } = notice;
  return (
    <li>
      <Card className={read ? "opacity-80" : undefined}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-navy">
              {ROLE_LABEL[role]} · {thesis.student}
            </p>
            <h2 className="mt-1 font-serif text-xl leading-snug text-ink">{thesis.title}</h2>
          </div>
          <BandPill days={days} />
        </div>
        <p className="mt-3 text-sm text-ink">{notice.message}</p>
        <p className="mt-2 text-sm text-muted">
          Sustentación: {formatDate(thesis.defenseDate)} · {thesis.code} · {thesis.stage}
        </p>
        {clashNames.length > 0 ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">
            <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>Choque de agenda con {clashNames.join("; ")}.</span>
          </p>
        ) : null}
        <label className="mt-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            className="size-4 accent-navy"
            checked={note.blocked}
            onChange={(e) => onBlocked(e.target.checked)}
          />
          Ya reservé este horario en mi agenda
        </label>
        <label className="mt-3 block text-sm">
          <span className="mb-1.5 block font-semibold text-ink">Nota de horario</span>
          <textarea
            className={controlClass + " min-h-24 py-2"}
            rows={3}
            value={note.note}
            placeholder="Ej. Bloquear el jueves 10:00 a 12:00. Aula por confirmar."
            onChange={(e) => onNote(e.target.value)}
          />
        </label>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {note.blocked ? (
            <span className="text-sm font-semibold text-ok">Horario marcado como reservado</span>
          ) : (
            <span className="text-sm text-muted">Aún sin reserva confirmada</span>
          )}
          <button
            type="button"
            className="min-h-11 rounded-xl border border-line px-3 text-sm font-semibold text-navy"
            onClick={onToggle}
          >
            {read ? "Marcar como pendiente" : "Marcar como leída"}
          </button>
        </div>
      </Card>
    </li>
  );
}
