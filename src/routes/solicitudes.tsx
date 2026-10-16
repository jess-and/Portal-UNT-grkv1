import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Field, PageHeading, Skeleton, StatusPill, cn, controlClass } from "@/components/bits";
import { useHydrated } from "@/components/hydration";
import {
  COVERAGE_LABEL,
  DEST_LABEL,
  KIND_LABEL,
  MODALITY_LABEL,
  STATUS_LABEL,
  formatDate,
  formatStamp,
  money,
  useUnt,
  type Coverage,
  type Destination,
  type Kind,
  type Modality,
  type TrainingRequest,
} from "@/lib/unt";

export const Route = createFileRoute("/solicitudes")({
  component: SolicitudesPage,
});

const KINDS = Object.keys(KIND_LABEL) as Kind[];
const DESTS = Object.keys(DEST_LABEL) as Destination[];
const MODS = Object.keys(MODALITY_LABEL) as Modality[];
const COVERS = Object.keys(COVERAGE_LABEL) as Coverage[];

type FormState = {
  kind: Kind;
  title: string;
  provider: string;
  destination: Destination;
  modality: Modality;
  city: string;
  startDate: string;
  endDate: string;
  amount: string;
  covers: Coverage[];
  justification: string;
};

const EMPTY: FormState = {
  kind: "curso",
  title: "",
  provider: "",
  destination: "escuela",
  modality: "presencial",
  city: "Trujillo",
  startDate: "",
  endDate: "",
  amount: "",
  covers: ["matricula"],
  justification: "",
};

function SolicitudesPage() {
  const ready = useHydrated();
  if (!ready) return <Skeleton />;
  return <Solicitudes />;
}

function Solicitudes() {
  const teacherId = useUnt((s) => s.teacherId);
  const requests = useUnt((s) => s.requests);
  const addRequest = useUnt((s) => s.addRequest);
  const cancelRequest = useUnt((s) => s.cancelRequest);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);

  const mine = requests
    .filter((r) => r.teacherId === teacherId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCover(cover: Coverage) {
    setForm((current) => {
      const has = current.covers.includes(cover);
      const covers = has ? current.covers.filter((c) => c !== cover) : [...current.covers, cover];
      return { ...current, covers };
    });
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSent(null);
      return;
    }
    addRequest({
      kind: form.kind,
      title: form.title.trim(),
      provider: form.provider.trim(),
      destination: form.destination,
      modality: form.modality,
      city: form.city.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      amount: Number(form.amount),
      covers: form.covers,
      justification: form.justification.trim(),
    });
    setSent(`Solicitud enviada a ${DEST_LABEL[form.destination]}.`);
    setForm(EMPTY);
  }

  return (
    <div>
      <PageHeading
        eyebrow="Apoyo económico"
        title="Solicitar capacitación"
        lede="Pida a la Escuela de Ciencia Política, a la Facultad o al Rectorado el respaldo para un curso, diplomado, maestría o doctorado."
      />

      <Card>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
          <Field label="Tipo de programa" error={errors.kind}>
            <select
              className={controlClass}
              value={form.kind}
              onChange={(e) => update("kind", e.target.value as Kind)}
            >
              {KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_LABEL[kind]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Se solicita a" error={errors.destination}>
            <select
              className={controlClass}
              value={form.destination}
              onChange={(e) => update("destination", e.target.value as Destination)}
            >
              {DESTS.map((dest) => (
                <option key={dest} value={dest}>
                  {DEST_LABEL[dest]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre del programa" error={errors.title} className="sm:col-span-2">
            <input
              className={controlClass}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Ej. Maestría en Gestión Pública"
            />
          </Field>
          <Field label="Institución que lo ofrece" error={errors.provider}>
            <input
              className={controlClass}
              value={form.provider}
              onChange={(e) => update("provider", e.target.value)}
              placeholder="Universidad o centro"
            />
          </Field>
          <Field label="Modalidad">
            <select
              className={controlClass}
              value={form.modality}
              onChange={(e) => update("modality", e.target.value as Modality)}
            >
              {MODS.map((mod) => (
                <option key={mod} value={mod}>
                  {MODALITY_LABEL[mod]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ciudad" error={errors.city}>
            <input className={controlClass} value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field label="Inicio" error={errors.startDate}>
            <input
              type="date"
              className={controlClass}
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
          </Field>
          <Field label="Término" error={errors.endDate}>
            <input
              type="date"
              className={controlClass}
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
            />
          </Field>
          <Field
            label="Apoyo económico solicitado (S/)"
            error={errors.amount}
            hint="Monto total que pide a la universidad."
          >
            <input
              inputMode="decimal"
              className={controlClass}
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="2400"
            />
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-ink">El apoyo debe cubrir</legend>
            <div className="grid gap-2 sm:grid-cols-4">
              {COVERS.map((cover) => (
                <label
                  key={cover}
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-navy"
                    checked={form.covers.includes(cover)}
                    onChange={() => toggleCover(cover)}
                  />
                  {COVERAGE_LABEL[cover]}
                </label>
              ))}
            </div>
            {errors.covers ? <p className="mt-1.5 text-sm text-alert">{errors.covers}</p> : null}
          </fieldset>
          <Field
            label="Por qué necesita esta capacitación"
            error={errors.justification}
            hint="Relacione el programa con sus cursos, asesorías o jurados."
            className="sm:col-span-2"
          >
            <textarea
              className={cn(controlClass, "min-h-28 py-2")}
              value={form.justification}
              onChange={(e) => update("justification", e.target.value)}
              rows={4}
            />
          </Field>
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-navy px-5 text-sm font-semibold text-surface"
            >
              Enviar solicitud
            </button>
            {sent ? (
              <p className="text-sm font-semibold text-ok" role="status">
                {sent}
              </p>
            ) : null}
          </div>
        </form>
      </Card>

      <h2 className="mb-3 mt-8 font-serif text-2xl text-navy">Sus solicitudes</h2>
      {mine.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">Todavía no hay solicitudes de este docente.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {mine.map((request) => (
            <RequestCard key={request.id} request={request} onCancel={() => cancelRequest(request.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestCard({ request, onCancel }: { request: TrainingRequest; onCancel: () => void }) {
  const canCancel = request.status === "enviada" || request.status === "observada" || request.status === "en_revision";
  return (
    <li>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-navy">{KIND_LABEL[request.kind]}</p>
            <h3 className="font-serif text-xl text-ink">{request.title}</h3>
          </div>
          <StatusPill status={request.status} label={STATUS_LABEL[request.status]} />
        </div>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Institución</dt>
            <dd>{request.provider}</dd>
          </div>
          <div>
            <dt className="text-muted">Destino</dt>
            <dd>{DEST_LABEL[request.destination]}</dd>
          </div>
          <div>
            <dt className="text-muted">Fechas</dt>
            <dd>
              {formatDate(request.startDate)} — {formatDate(request.endDate)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Modalidad</dt>
            <dd>
              {MODALITY_LABEL[request.modality]} · {request.city}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Apoyo pedido</dt>
            <dd className="font-semibold text-navy">{money(request.amount)}</dd>
          </div>
          <div>
            <dt className="text-muted">Cubre</dt>
            <dd>{request.covers.map((c) => COVERAGE_LABEL[c]).join(", ")}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-ink">{request.justification}</p>
        {request.observation ? (
          <p className="mt-3 rounded-xl bg-alert-soft px-3 py-2 text-sm text-alert">
            Observación: {request.observation}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted">Registrada el {formatStamp(request.createdAt)}</p>
          {canCancel ? (
            <button
              type="button"
              className="min-h-11 rounded-xl border border-line px-3 text-sm font-semibold text-alert"
              onClick={onCancel}
            >
              Anular solicitud
            </button>
          ) : null}
        </div>
      </Card>
    </li>
  );
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.title.trim().length < 6) errors.title = "Indique el nombre del programa.";
  if (form.provider.trim().length < 3) errors.provider = "Indique quién ofrece el programa.";
  if (form.city.trim().length < 2) errors.city = "Indique la ciudad o escriba Virtual.";
  if (!form.startDate) errors.startDate = "Indique la fecha de inicio.";
  if (!form.endDate) errors.endDate = "Indique la fecha de término.";
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "El término no puede ser anterior al inicio.";
  }
  const amount = Number(form.amount);
  if (!form.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Indique un monto mayor a cero.";
  }
  if (form.covers.length === 0) errors.covers = "Marque al menos un concepto.";
  if (form.justification.trim().length < 40) {
    errors.justification = "Explique la necesidad con al menos 40 caracteres.";
  }
  return errors;
}
