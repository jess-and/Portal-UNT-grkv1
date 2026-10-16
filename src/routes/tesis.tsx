import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { BandPill, Card, Field, PageHeading, SemaphoreBar, Skeleton, cn, controlClass } from "@/components/bits";
import { useHydrated } from "@/components/hydration";
import {
  ROLE_LABEL,
  bandOf,
  clashes,
  daysUntil,
  formatDate,
  teacherById,
  useUnt,
  type Band,
  type Role,
  type Thesis,
} from "@/lib/unt";

export const Route = createFileRoute("/tesis")({
  component: TesisPage,
});

const PROGRAMS = ["Ciencia Política", "Derecho"];
const ROLES = Object.keys(ROLE_LABEL) as Role[];

type Filter = "todas" | Band;

function TesisPage() {
  const ready = useHydrated();
  if (!ready) return <Skeleton />;
  return <TesisBoard />;
}

function TesisBoard() {
  const teacherId = useUnt((s) => s.teacherId);
  const theses = useUnt((s) => s.theses);
  const addThesis = useUnt((s) => s.addThesis);
  const [filter, setFilter] = useState<Filter>("todas");
  const [roleFilter, setRoleFilter] = useState<Role | "todos">("todos");

  const mine = theses
    .filter((t) => t.assignments.some((a) => a.teacherId === teacherId))
    .sort((a, b) => daysUntil(a.defenseDate) - daysUntil(b.defenseDate));

  const visible = mine.filter((thesis) => {
    const role = thesis.assignments.find((a) => a.teacherId === teacherId)?.role;
    if (roleFilter !== "todos" && role !== roleFilter) return false;
    if (filter === "todas") return true;
    return bandOf(daysUntil(thesis.defenseDate)) === filter;
  });

  return (
    <div>
      <PageHeading
        eyebrow="Asesoría y jurado"
        title="Tesis asignadas"
        lede="El semáforo marca el plazo hasta la sustentación: verde desde 30 días, ámbar al llegar a 15 y rojo cuando faltan 7 o menos."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={filter === "todas"} onClick={() => setFilter("todas")}>
          Todas
        </FilterChip>
        <FilterChip active={filter === "verde"} onClick={() => setFilter("verde")}>
          Verde
        </FilterChip>
        <FilterChip active={filter === "ambar"} onClick={() => setFilter("ambar")}>
          Ámbar
        </FilterChip>
        <FilterChip active={filter === "rojo"} onClick={() => setFilter("rojo")}>
          Rojo
        </FilterChip>
        <FilterChip active={filter === "vencido"} onClick={() => setFilter("vencido")}>
          Vencidas
        </FilterChip>
      </div>
      <div className="mb-5 flex gap-2 overflow-x-auto">
        <FilterChip active={roleFilter === "todos"} onClick={() => setRoleFilter("todos")}>
          Cualquier rol
        </FilterChip>
        {ROLES.map((role) => (
          <FilterChip key={role} active={roleFilter === role} onClick={() => setRoleFilter(role)}>
            {ROLE_LABEL[role]}
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="mb-5">
          <p className="text-sm text-muted">No hay tesis con ese filtro.</p>
        </Card>
      ) : (
        <ul className="mb-6 space-y-3">
          {visible.map((thesis) => (
            <ThesisCard key={thesis.id} thesis={thesis} teacherId={teacherId} all={theses} />
          ))}
        </ul>
      )}

      <RegisterThesis
        onCreate={(input) => {
          addThesis(input);
          setFilter("todas");
          setRoleFilter("todos");
        }}
      />
    </div>
  );
}

function ThesisCard({
  thesis,
  teacherId,
  all,
}: {
  thesis: Thesis;
  teacherId: string;
  all: Thesis[];
}) {
  const days = daysUntil(thesis.defenseDate);
  const role = thesis.assignments.find((a) => a.teacherId === teacherId)?.role ?? "asesor";
  const others = thesis.assignments.filter((a) => a.teacherId !== teacherId);
  const busy = clashes(teacherId, all, thesis);

  return (
    <li>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-navy">
              {thesis.code} · {thesis.program}
            </p>
            <h2 className="mt-1 font-serif text-xl leading-snug text-ink">{thesis.title}</h2>
          </div>
          <BandPill days={days} />
        </div>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Tesista</dt>
            <dd className="font-semibold">{thesis.student}</dd>
          </div>
          <div>
            <dt className="text-muted">Su rol</dt>
            <dd>{ROLE_LABEL[role]}</dd>
          </div>
          <div>
            <dt className="text-muted">Sustentación</dt>
            <dd>{formatDate(thesis.defenseDate)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-sm text-muted">Etapa: {thesis.stage}</p>
        {others.length > 0 ? (
          <p className="mt-1 text-sm text-muted">
            También participan:{" "}
            {others
              .map((a) => `${teacherById(a.teacherId).shortName} (${ROLE_LABEL[a.role].toLowerCase()})`)
              .join(", ")}
          </p>
        ) : null}
        <div className="mt-4">
          <SemaphoreBar days={days} />
        </div>
        {busy.length > 0 ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">
            <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Cruza con {busy.map((t) => `${t.student} (${formatDate(t.defenseDate)})`).join("; ")}. Conviene
              mover uno de los horarios.
            </span>
          </p>
        ) : null}
      </Card>
    </li>
  );
}

function RegisterThesis({
  onCreate,
}: {
  onCreate: (input: {
    title: string;
    student: string;
    code: string;
    program: string;
    defenseDate: string;
    stage: string;
    role: Role;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [student, setStudent] = useState("");
  const [code, setCode] = useState("");
  const [program, setProgram] = useState(PROGRAMS[0]);
  const [defenseDate, setDefenseDate] = useState("");
  const [stage, setStage] = useState("Jurado designado");
  const [role, setRole] = useState<Role>("asesor");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 8 || student.trim().length < 5 || !defenseDate) {
      setError("Complete el título, el tesista y la fecha de sustentación.");
      setDone("");
      return;
    }
    onCreate({
      title: title.trim(),
      student: student.trim(),
      code: code.trim() || "SIN-CÓDIGO",
      program,
      defenseDate,
      stage: stage.trim() || "Registrada por el docente",
      role,
    });
    setTitle("");
    setStudent("");
    setCode("");
    setDefenseDate("");
    setError("");
    setDone("Tesis registrada. El semáforo usa la fecha de sustentación.");
  }

  return (
    <Card>
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>
          <span className="block font-serif text-xl text-navy">Registrar una tesis</span>
          <span className="mt-1 block text-sm text-muted">
            Si le asignan una asesoría, un jurado o una revisión, anótela aquí.
          </span>
        </span>
        <span className="text-sm font-semibold text-navy">{open ? "Cerrar" : "Abrir"}</span>
      </button>
      {open ? (
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <Field label="Título" className="sm:col-span-2">
            <input className={controlClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Tesista">
            <input className={controlClass} value={student} onChange={(e) => setStudent(e.target.value)} />
          </Field>
          <Field label="Código">
            <input className={controlClass} value={code} onChange={(e) => setCode(e.target.value)} placeholder="CP-2026-030" />
          </Field>
          <Field label="Programa">
            <select className={controlClass} value={program} onChange={(e) => setProgram(e.target.value)}>
              {PROGRAMS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Su rol">
            <select className={controlClass} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((item) => (
                <option key={item} value={item}>
                  {ROLE_LABEL[item]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha de sustentación" hint="Verde a partir de 30 días; ámbar a los 15; rojo a los 7.">
            <input
              type="date"
              className={controlClass}
              value={defenseDate}
              onChange={(e) => setDefenseDate(e.target.value)}
            />
          </Field>
          <Field label="Etapa">
            <input className={controlClass} value={stage} onChange={(e) => setStage(e.target.value)} />
          </Field>
          {error ? <p className="text-sm text-alert sm:col-span-2">{error}</p> : null}
          {done ? (
            <p className="text-sm font-semibold text-ok sm:col-span-2" role="status">
              {done}
            </p>
          ) : null}
          <button type="submit" className="min-h-11 rounded-xl bg-navy px-5 text-sm font-semibold text-surface">
            Guardar tesis
          </button>
        </form>
      ) : null}
    </Card>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 shrink-0 rounded-full px-3.5 text-sm font-semibold",
        active ? "bg-navy text-surface" : "border border-line bg-surface text-navy",
      )}
    >
      {children}
    </button>
  );
}
