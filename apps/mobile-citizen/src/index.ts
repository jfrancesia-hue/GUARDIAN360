export type CitizenReportKind = "PANIC" | "SUSPICIOUS_ACTIVITY" | "TRAFFIC" | "FIRE_HOTSPOT";
export type CitizenReportStatus = "DRAFT" | "SENT" | "ACKNOWLEDGED" | "UNIT_ASSIGNED" | "RESOLVED";

export interface CitizenLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export interface CitizenReport {
  id: string;
  kind: CitizenReportKind;
  status: CitizenReportStatus;
  location: CitizenLocation;
  description: string;
  createdAt: string;
  lastUpdate: string;
}

export interface CitizenScreen {
  id: "home" | "panic" | "report" | "tracking" | "profile";
  title: string;
  purpose: string;
  primaryAction: string;
}

export const citizenScreens: CitizenScreen[] = [
  {
    id: "home",
    title: "Inicio ciudadano",
    purpose: "Mostrar estado de cobertura, accesos rapidos y canal de emergencia.",
    primaryAction: "Abrir boton de panico"
  },
  {
    id: "panic",
    title: "Boton de panico",
    purpose: "Enviar alerta geolocalizada con prioridad critica al centro operativo.",
    primaryAction: "Enviar alerta"
  },
  {
    id: "report",
    title: "Reportar incidente",
    purpose: "Crear reporte con ubicacion, tipo, descripcion y adjuntos.",
    primaryAction: "Enviar reporte"
  },
  {
    id: "tracking",
    title: "Seguimiento",
    purpose: "Ver estado del caso, ACK, unidad asignada y cierre.",
    primaryAction: "Ver actualizacion"
  },
  {
    id: "profile",
    title: "Perfil seguro",
    purpose: "Mantener datos minimos de contacto, privacidad y organismo asociado.",
    primaryAction: "Actualizar datos"
  }
];

export function createPanicReport(location: CitizenLocation, now = new Date()): CitizenReport {
  const timestamp = now.toISOString();

  return {
    id: `citizen-${now.getTime()}`,
    kind: "PANIC",
    status: "DRAFT",
    location,
    description: "Alerta de panico iniciada desde app ciudadana.",
    createdAt: timestamp,
    lastUpdate: timestamp
  };
}

export function sendReport(report: CitizenReport, now = new Date()): CitizenReport {
  return {
    ...report,
    status: "SENT",
    lastUpdate: now.toISOString()
  };
}

export function nextCitizenStatus(status: CitizenReportStatus): CitizenReportStatus {
  const transitions: Record<CitizenReportStatus, CitizenReportStatus> = {
    DRAFT: "SENT",
    SENT: "ACKNOWLEDGED",
    ACKNOWLEDGED: "UNIT_ASSIGNED",
    UNIT_ASSIGNED: "RESOLVED",
    RESOLVED: "RESOLVED"
  };

  return transitions[status];
}
