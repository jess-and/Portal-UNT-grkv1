import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Teacher = {
  id: string;
  name: string;
  shortName: string;
  rank: string;
  unit: string;
  email: string;
};

export const TEACHERS: Teacher[] = [
  {
    id: "t1",
    name: "Dra. Elena Vargas Mendoza",
    shortName: "Dra. Vargas",
    rank: "Docente principal",
    unit: "Escuela de Ciencia Política",
    email: "evargas@unitru.edu.pe",
  },
  {
    id: "t2",
    name: "Mg. Ricardo Solano Díaz",
    shortName: "Mg. Solano",
    rank: "Docente asociado",
    unit: "Escuela de Ciencia Política",
    email: "rsolano@unitru.edu.pe",
  },
  {
    id: "t3",
    name: "Dr. Martín Quispe Huamán",
    shortName: "Dr. Quispe",
    rank: "Docente principal",
    unit: "Facultad de Derecho y Ciencias Políticas",
    email: "mquispe@unitru.edu.pe",
  },
];

export type Kind = "curso" | "diplomado" | "maestria" | "doctorado" | "taller";
export type Destination = "escuela" | "facultad" | "rectorado";
export type Modality = "presencial" | "virtual" | "semipresencial";
export type Coverage = "matricula" | "pasajes" | "viaticos" | "materiales";
export type RequestStatus = "enviada" | "en_revision" | "observada" | "aprobada" | "anulada";
export type Role = "asesor" | "jurado" | "revisor";
export type Band = "verde" | "ambar" | "rojo" | "vencido";

export const KIND_LABEL: Record<Kind, string> = {
  curso: "Curso de actualización",
  diplomado: "Diplomado",
  maestria: "Maestría",
  doctorado: "Doctorado",
  taller: "Taller o seminario",
};

export const DEST_LABEL: Record<Destination, string> = {
  escuela: "Escuela de Ciencia Política",
  facultad: "Facultad de Derecho y Ciencias Políticas",
  rectorado: "Rectorado",
};

export const MODALITY_LABEL: Record<Modality, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
  semipresencial: "Semipresencial",
};

export const COVERAGE_LABEL: Record<Coverage, string> = {
  matricula: "Matrícula",
  pasajes: "Pasajes",
  viaticos: "Viáticos",
  materiales: "Materiales",
};

export const STATUS_LABEL: Record<RequestStatus, string> = {
  enviada: "Enviada",
  en_revision: "En revisión",
  observada: "Observada",
  aprobada: "Aprobada",
  anulada: "Anulada",
};

export const ROLE_LABEL: Record<Role, string> = {
  asesor: "Asesor",
  jurado: "Jurado",
  revisor: "Revisor de proyecto",
};

export type TrainingRequest = {
  id: string;
  teacherId: string;
  kind: Kind;
  title: string;
  provider: string;
  destination: Destination;
  modality: Modality;
  city: string;
  startDate: string;
  endDate: string;
  amount: number;
  covers: Coverage[];
  justification: string;
  status: RequestStatus;
  observation?: string;
  createdAt: string;
};

export type Assignment = { teacherId: string; role: Role };

export type Thesis = {
  id: string;
  title: string;
  student: string;
  code: string;
  program: string;
  defenseDate: string;
  stage: string;
  assignments: Assignment[];
};

export type Note = { blocked: boolean; note: string };

export type Notice = {
  id: string;
  thesis: Thesis;
  role: Role;
  days: number;
  band: Band;
  message: string;
};

export function teacherById(id: string): Teacher {
  return TEACHERS.find((t) => t.id === id) ?? TEACHERS[0];
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isoIn(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysUntil(iso: string): number {
  const target = parseISODate(iso);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseISODate(iso));
}

export function formatStamp(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function money(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function daysLabel(days: number): string {
  if (days < 0) {
    const n = Math.abs(days);
    return n === 1 ? "Venció hace 1 día" : `Venció hace ${n} días`;
  }
  if (days === 0) return "La sustentación es hoy";
  if (days === 1) return "Falta 1 día";
  return `Faltan ${days} días`;
}

export function bandOf(days: number): Band {
  if (days < 0) return "vencido";
  if (days <= 7) return "rojo";
  if (days <= 15) return "ambar";
  return "verde";
}

export function bandLabel(band: Band): string {
  switch (band) {
    case "verde":
      return "Verde · 30 días o más de margen";
    case "ambar":
      return "Ámbar · faltan 15 días o menos";
    case "rojo":
      return "Rojo · faltan 7 días o menos";
    case "vencido":
      return "Fecha vencida";
  }
}

export function markerPct(days: number): number {
  let raw: number;
  if (days < 0) raw = 96;
  else if (days >= 30) raw = 8;
  else if (days > 15) raw = 8 + ((29 - days) / 13) * 24;
  else if (days > 7) raw = 38 + ((15 - days) / 7) * 24;
  else raw = 68 + ((7 - Math.max(days, 0)) / 7) * 28;
  return Math.min(96, Math.max(4, raw));
}

function noticeMessage(days: number, band: Band, role: Role): string {
  const who = ROLE_LABEL[role].toLowerCase();
  if (band === "vencido") {
    return `La fecha de sustentación ya pasó y usted figura como ${who}. Confirme si el acto fue reprogramado.`;
  }
  if (band === "rojo") {
    if (days === 0) {
      return `La sustentación es hoy. Como ${who}, confirme que tiene el horario libre.`;
    }
    return `Faltan ${days} día${days === 1 ? "" : "s"}. Como ${who}, reserve el horario con prioridad.`;
  }
  if (band === "ambar") {
    return `Quedan ${days} días. Conviene cerrar la revisión del expediente y confirmar que puede asistir.`;
  }
  return `La sustentación es en ${days} días. Puede ir separando ese bloque en su horario.`;
}

export function noticesFor(teacherId: string, theses: Thesis[]): Notice[] {
  const list: Notice[] = [];
  for (const thesis of theses) {
    const assignment = thesis.assignments.find((a) => a.teacherId === teacherId);
    if (!assignment) continue;
    const days = daysUntil(thesis.defenseDate);
    if (days > 30) continue;
    const band = bandOf(days);
    list.push({
      id: `${thesis.id}:${thesis.defenseDate}:${band}`,
      thesis,
      role: assignment.role,
      days,
      band,
      message: noticeMessage(days, band, assignment.role),
    });
  }
  return list.sort((a, b) => a.days - b.days);
}

export function clashes(teacherId: string, theses: Thesis[], thesis: Thesis): Thesis[] {
  const day = daysUntil(thesis.defenseDate);
  return theses.filter((other) => {
    if (other.id === thesis.id) return false;
    if (!other.assignments.some((a) => a.teacherId === teacherId)) return false;
    return Math.abs(daysUntil(other.defenseDate) - day) <= 1;
  });
}

export function noteKey(teacherId: string, thesisId: string): string {
  return `${teacherId}:${thesisId}`;
}

export function noteFor(notes: Record<string, Note>, teacherId: string, thesisId: string): Note {
  return notes[noteKey(teacherId, thesisId)] ?? { blocked: false, note: "" };
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

function seedRequests(): TrainingRequest[] {
  return [
    {
      id: "sol-maestria-vargas",
      teacherId: "t1",
      kind: "maestria",
      title: "Maestría en Ciencia Política y Gobierno",
      provider: "Pontificia Universidad Católica del Perú",
      destination: "facultad",
      modality: "semipresencial",
      city: "Lima",
      startDate: isoIn(70),
      endDate: isoIn(800),
      amount: 12800,
      covers: ["matricula", "pasajes", "viaticos"],
      justification:
        "El programa refuerza el dictado de política comparada y métodos, línea que la Escuela necesita cubrir con docentes formados.",
      status: "en_revision",
      createdAt: daysAgoIso(12),
    },
    {
      id: "sol-curso-vargas",
      teacherId: "t1",
      kind: "curso",
      title: "Curso de métodos cualitativos para investigación social",
      provider: "Universidad Nacional de Trujillo",
      destination: "escuela",
      modality: "presencial",
      city: "Trujillo",
      startDate: isoIn(20),
      endDate: isoIn(24),
      amount: 2400,
      covers: ["matricula", "materiales"],
      justification:
        "Necesito actualizar el taller de tesis con técnicas de entrevista y análisis que los asesorados ya están usando.",
      status: "enviada",
      createdAt: daysAgoIso(2),
    },
    {
      id: "sol-diplomado-solano",
      teacherId: "t2",
      kind: "diplomado",
      title: "Diplomado en análisis político y opinión pública",
      provider: "Universidad del Pacífico",
      destination: "rectorado",
      modality: "virtual",
      city: "Virtual",
      startDate: isoIn(40),
      endDate: isoIn(160),
      amount: 4500,
      covers: ["matricula"],
      justification:
        "El diplomado permite incorporar encuestas y lectura de opinión pública en los cursos de comportamiento electoral.",
      status: "aprobada",
      createdAt: daysAgoIso(30),
    },
    {
      id: "sol-taller-solano",
      teacherId: "t2",
      kind: "taller",
      title: "Taller de evaluación de proyectos de investigación",
      provider: "CONCYTEC",
      destination: "escuela",
      modality: "presencial",
      city: "Trujillo",
      startDate: isoIn(14),
      endDate: isoIn(15),
      amount: 900,
      covers: ["pasajes", "viaticos"],
      justification:
        "Como revisor de proyectos de tesis requiero criterios actualizados de evaluación y de ética en investigación.",
      status: "enviada",
      createdAt: daysAgoIso(1),
    },
    {
      id: "sol-doctorado-quispe",
      teacherId: "t3",
      kind: "doctorado",
      title: "Doctorado en Derecho Constitucional",
      provider: "Universidad Nacional Mayor de San Marcos",
      destination: "facultad",
      modality: "semipresencial",
      city: "Lima",
      startDate: isoIn(100),
      endDate: isoIn(1400),
      amount: 18000,
      covers: ["matricula", "pasajes", "viaticos", "materiales"],
      justification:
        "La línea de derecho constitucional de la Facultad no cuenta con suficientes doctores para sostener el jurado de tesis.",
      status: "observada",
      observation: "Adjunte el plan de estudios y desagregue matrícula, pasajes y viáticos.",
      createdAt: daysAgoIso(18),
    },
  ];
}

function seedTheses(): Thesis[] {
  return [
    {
      id: "tesis-paredes",
      title: "Gobernanza local y participación ciudadana en La Libertad",
      student: "Camila Paredes León",
      code: "CP-2026-014",
      program: "Ciencia Política",
      defenseDate: isoIn(32),
      stage: "Borrador final",
      assignments: [{ teacherId: "t1", role: "asesor" }],
    },
    {
      id: "tesis-delgado",
      title: "Políticas de seguridad ciudadana en distritos de Trujillo",
      student: "José Delgado Ríos",
      code: "CP-2026-009",
      program: "Ciencia Política",
      defenseDate: isoIn(6),
      stage: "Listo para sustentación",
      assignments: [
        { teacherId: "t1", role: "jurado" },
        { teacherId: "t3", role: "jurado" },
      ],
    },
    {
      id: "tesis-herrera",
      title: "Presupuesto participativo en distritos de La Libertad",
      student: "Lucía Herrera Campos",
      code: "CP-2026-011",
      program: "Ciencia Política",
      defenseDate: isoIn(15),
      stage: "Revisión de jurado",
      assignments: [
        { teacherId: "t2", role: "asesor" },
        { teacherId: "t1", role: "jurado" },
      ],
    },
    {
      id: "tesis-angeles",
      title: "Organizaciones sociales y representación política",
      student: "Pedro Ángeles Vilca",
      code: "CP-2026-018",
      program: "Ciencia Política",
      defenseDate: isoIn(42),
      stage: "Proyecto observado",
      assignments: [{ teacherId: "t2", role: "revisor" }],
    },
    {
      id: "tesis-nolasco",
      title: "Debido proceso en la detención en flagrancia",
      student: "Andrea Nolasco Ruiz",
      code: "DE-2026-007",
      program: "Derecho",
      defenseDate: isoIn(4),
      stage: "Listo para sustentación",
      assignments: [{ teacherId: "t3", role: "revisor" }],
    },
    {
      id: "tesis-castro",
      title: "Control difuso y precedentes vinculantes",
      student: "Bruno Castro León",
      code: "DE-2026-012",
      program: "Derecho",
      defenseDate: isoIn(5),
      stage: "Jurado designado",
      assignments: [{ teacherId: "t3", role: "jurado" }],
    },
    {
      id: "tesis-diaz",
      title: "Descentralización fiscal y uso del canon",
      student: "Fiorella Díaz Montenegro",
      code: "CP-2026-021",
      program: "Ciencia Política",
      defenseDate: isoIn(21),
      stage: "Borrador en corrección",
      assignments: [
        { teacherId: "t3", role: "asesor" },
        { teacherId: "t2", role: "jurado" },
      ],
    },
  ];
}

function buildInitial() {
  return {
    teacherId: "t1",
    requests: seedRequests(),
    theses: seedTheses(),
    notes: {} as Record<string, Note>,
    readIds: [] as string[],
  };
}

type RequestInput = Omit<TrainingRequest, "id" | "teacherId" | "status" | "createdAt" | "observation">;

type ThesisInput = Omit<Thesis, "id" | "assignments"> & { role: Role };

type Store = ReturnType<typeof buildInitial> & {
  setTeacher: (id: string) => void;
  addRequest: (input: RequestInput) => void;
  cancelRequest: (id: string) => void;
  addThesis: (input: ThesisInput) => void;
  setNote: (thesisId: string, patch: Partial<Note>) => void;
  toggleRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  resetDemo: () => void;
};

export const useUnt = create<Store>()(
  persist(
    (set, get) => ({
      ...buildInitial(),
      setTeacher: (teacherId) => set({ teacherId }),
      addRequest: (input) => {
        const item: TrainingRequest = {
          ...input,
          id: crypto.randomUUID(),
          teacherId: get().teacherId,
          status: "enviada",
          createdAt: new Date().toISOString(),
        };
        set({ requests: [item, ...get().requests] });
      },
      cancelRequest: (id) => {
        const teacherId = get().teacherId;
        set({
          requests: get().requests.map((r) =>
            r.id === id && r.teacherId === teacherId && r.status !== "aprobada"
              ? { ...r, status: "anulada" }
              : r,
          ),
        });
      },
      addThesis: ({ role, ...rest }) => {
        const item: Thesis = {
          ...rest,
          id: crypto.randomUUID(),
          assignments: [{ teacherId: get().teacherId, role }],
        };
        set({ theses: [...get().theses, item] });
      },
      setNote: (thesisId, patch) => {
        const key = noteKey(get().teacherId, thesisId);
        const current = get().notes[key] ?? { blocked: false, note: "" };
        set({ notes: { ...get().notes, [key]: { ...current, ...patch } } });
      },
      toggleRead: (id) => {
        const readIds = get().readIds;
        set({
          readIds: readIds.includes(id) ? readIds.filter((x) => x !== id) : [...readIds, id],
        });
      },
      markAllRead: (ids) => {
        const merged = new Set([...get().readIds, ...ids]);
        set({ readIds: [...merged] });
      },
      resetDemo: () => set(buildInitial()),
    }),
    { name: "unt-gestion-docente-v1" },
  ),
);


