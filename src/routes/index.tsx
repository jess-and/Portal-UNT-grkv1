import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, GraduationCap } from "lucide-react";
import { BandPill, Card, SemaphoreBar, Skeleton } from "@/components/bits";
import { useHydrated } from "@/components/hydration";
import {
  DEST_LABEL,
  KIND_LABEL,
  STATUS_LABEL,
  daysUntil,
  formatDate,
  greeting,
  money,
  noticesFor,
  teacherById,
  useUnt,
  type TrainingRequest,
} from "@/lib/unt";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const ready = useHydrated();
  if (!ready) return <Skeleton />;
  return <Dashboard />;
}

function Dashboard() {
  const teacherId = useUnt((s) => s.teacherId);
  const requests = useUnt((s) => s.requests);
  const theses = useUnt((s) => s.theses);
  const readIds = useUnt((s) => s.readIds);
  const teacher = teacherById(teacherId);

  const mine = requests.filter((r) => r.teacherId === teacherId);
  const open = mine.filter((r) => r.status !== "anulada" && r.status !== "aprobada");
  const support = open.reduce((sum, r) => sum + r.amount, 0);
  const assigned = theses
    .filter((t) => t.assignments.some((a) => a.teacherId === teacherId))
    .sort((a, b) => daysUntil(a.defenseDate) - daysUntil(b.defenseDate));
  const urgent = assigned.filter((t) => daysUntil(t.defenseDate) <= 7);
  const unread = noticesFor(teacherId, theses).filter((n) => !readIds.includes(n.id)).length;
  const recent = [...mine].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img
          src="/unt-logo.jpg"
          alt=""
          className="h-20 w-auto shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy">{teacher.unit}</p>
          <h1 className="mt-1 font-serif text-3xl leading-tight text-navy">
            {greeting()}, {teacher.shortName}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted">
            Solicite apoyo económico para cursos y maestrías, y revise los plazos de sustentación
            de las tesis que asesora o evalúa.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-stretch">
          <Link
            to="/solicitudes"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-surface"
          >
            <GraduationCap className="size-4" aria-hidden />
            Solicitar capacitación
          </Link>
          <Link
            to="/notificaciones"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-navy"
          >
            <CalendarClock className="size-4" aria-hidden />
            Ver plazos
            {unread > 0 ? ` (${unread})` : ""}
          </Link>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Solicitudes en trámite" value={String(open.length)} detail={money(support)} />
        <Stat label="Tesis a su cargo" value={String(assigned.length)} detail={`${urgent.length} en rojo`} />
        <Stat
          label="Avisos de sustentación"
          value={String(unread)}
          detail={unread === 1 ? "sin leer" : "sin leer"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-navy">Próximas sustentaciones</h2>
            <Link to="/tesis" className="text-sm font-semibold text-navy underline-offset-2 hover:underline">
              Ver todas
            </Link>
          </div>
          {assigned.length === 0 ? (
            <p className="text-sm text-muted">No tiene tesis asignadas.</p>
          ) : (
            <ul className="space-y-4">
              {assigned.slice(0, 3).map((thesis) => {
                const days = daysUntil(thesis.defenseDate);
                return (
                  <li key={thesis.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink">{thesis.student}</p>
                      <BandPill days={days} />
                    </div>
                    <p className="mb-2 text-sm text-muted">{thesis.title}</p>
                    <p className="mb-3 text-sm text-ink">{formatDate(thesis.defenseDate)}</p>
                    <SemaphoreBar days={days} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-navy">Capacitaciones</h2>
            <Link
              to="/solicitudes"
              className="text-sm font-semibold text-navy underline-offset-2 hover:underline"
            >
              Nueva solicitud
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Aún no registra pedidos de capacitación.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="py-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl text-navy">{value}</p>
      <p className="text-sm font-semibold text-ink">{detail}</p>
    </Card>
  );
}

function RequestRow({ request }: { request: TrainingRequest }) {
  return (
    <li className="rounded-xl border border-line bg-paper px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-semibold text-ink">{request.title}</p>
        <span className="text-xs font-semibold text-navy">{STATUS_LABEL[request.status]}</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {KIND_LABEL[request.kind]} · {DEST_LABEL[request.destination]}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">{money(request.amount)}</p>
    </li>
  );
}
