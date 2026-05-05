export type OfficerEventStatus = "ASSIGNED" | "EN_ROUTE" | "ON_SITE" | "EVIDENCE_UPLOADED" | "CLOSED";
export type OfficerPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface OfficerAssignment {
  eventId: string;
  title: string;
  priority: OfficerPriority;
  status: OfficerEventStatus;
  zone: string;
  etaMinutes: number;
  assignedUnit: string;
  evidenceCount: number;
}

export interface OfficerScreen {
  id: "queue" | "route" | "event" | "evidence" | "closeout";
  title: string;
  purpose: string;
  primaryAction: string;
}

export const officerScreens: OfficerScreen[] = [
  {
    id: "queue",
    title: "Eventos asignados",
    purpose: "Ver incidentes enviados desde el centro operativo con prioridad y ETA.",
    primaryAction: "Tomar evento"
  },
  {
    id: "route",
    title: "Ruta al incidente",
    purpose: "Guiar al movil hacia el punto asignado y mantener ETA actualizada.",
    primaryAction: "Marcar en ruta"
  },
  {
    id: "event",
    title: "Intervencion",
    purpose: "Registrar arribo, novedades y estado de la intervencion en sitio.",
    primaryAction: "Marcar arribo"
  },
  {
    id: "evidence",
    title: "Evidencia movil",
    purpose: "Adjuntar imagenes, video o notas al expediente digital.",
    primaryAction: "Adjuntar evidencia"
  },
  {
    id: "closeout",
    title: "Cierre operativo",
    purpose: "Cerrar la intervencion con resultado, observaciones y trazabilidad.",
    primaryAction: "Cerrar caso"
  }
];

export const sampleAssignment: OfficerAssignment = {
  eventId: "evt-weapon-001",
  title: "Arma detectada",
  priority: "CRITICAL",
  status: "ASSIGNED",
  zone: "Av. Guemes y Vicario Segura",
  etaMinutes: 4,
  assignedUnit: "M-12",
  evidenceCount: 0
};

export function markEnRoute(assignment: OfficerAssignment): OfficerAssignment {
  return {
    ...assignment,
    status: "EN_ROUTE"
  };
}

export function markOnSite(assignment: OfficerAssignment): OfficerAssignment {
  return {
    ...assignment,
    status: "ON_SITE",
    etaMinutes: 0
  };
}

export function attachEvidence(assignment: OfficerAssignment): OfficerAssignment {
  return {
    ...assignment,
    status: "EVIDENCE_UPLOADED",
    evidenceCount: assignment.evidenceCount + 1
  };
}

export function closeAssignment(assignment: OfficerAssignment): OfficerAssignment {
  return {
    ...assignment,
    status: "CLOSED",
    etaMinutes: 0
  };
}
