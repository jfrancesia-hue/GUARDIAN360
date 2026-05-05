"use client";

import {
  BarChart3,
  Building2,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  Eye,
  FileText,
  Flame,
  Gavel,
  LockKeyhole,
  MapPin,
  PlayCircle,
  Radio,
  Route,
  Satellite,
  Send,
  Shield,
  Siren,
  Users,
  Video,
  XCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type EventUiStatus = "Nuevo" | "ACK" | "Despachado" | "Cerrado";

interface ApiEvent {
  id: string;
  type: string;
  severity: string;
  status: string;
  cameraName: string | null;
  detectedAt: string;
}

interface ApiCamera {
  id: string;
  externalId: string;
  name: string;
  zone: string | null;
  status: string;
  health: number;
  capabilities: string[];
}

interface EventSummary {
  active: number;
  critical: number;
  acknowledged: number;
  resolvedToday: number;
}

interface CameraOverview {
  total: number;
  online: number;
  degraded: number;
}

interface DashboardEvent {
  id: string;
  type: string;
  zone: string;
  source: string;
  severity: string;
  time: string;
  icon: LucideIcon;
  status?: EventUiStatus;
  assignedUnit?: string;
}

interface DashboardCamera {
  id?: string;
  name: string;
  zone: string;
  status: string;
  health: number;
  aiEnabled?: boolean;
  capabilities?: string[];
}

interface Patrol {
  code: string;
  area: string;
  status: string;
  eta: string;
}

interface ExecutiveMetric {
  label: string;
  value: string;
  detail: string;
}

interface TenantProfile {
  name: string;
  metrics: ExecutiveMetric[];
  pilotScope: string[];
}

interface VisualScene {
  title: string;
  label: string;
  detail: string;
  objective: string;
  image: string;
  alt: string;
  icon: LucideIcon;
  functions: ModuleFunction[];
}

type ModuleId = "command" | "events" | "cameras" | "map" | "patrols" | "evidence" | "reports" | "audit";

interface ModuleFunction {
  title: string;
  detail: string;
  icon: LucideIcon;
}

interface ModuleExperience {
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  icon: LucideIcon;
  signals: Array<{ value: string; label: string }>;
  scenes: VisualScene[];
  functions: ModuleFunction[];
}

const fallbackKpis = [
  { label: "Eventos activos", value: "18", trend: "+4", state: "critical" },
  { label: "Camaras online", value: "142", trend: "96%", state: "ok" },
  { label: "Tiempo ACK", value: "01:42", trend: "-18s", state: "info" },
  { label: "Moviles libres", value: "27", trend: "+3", state: "ok" }
];

const fallbackEvents: DashboardEvent[] = [
  {
    id: "fallback-weapon",
    type: "Arma detectada",
    zone: "Av. Guemes y Vicario Segura",
    source: "Camara COM-014",
    severity: "Critico",
    time: "Hace 42s",
    icon: Siren,
    status: "Nuevo"
  },
  {
    id: "fallback-license-plate",
    type: "Patente con pedido",
    zone: "Ruta 38 - Acceso Sur",
    source: "LPR COM-088",
    severity: "Alto",
    time: "Hace 2m",
    icon: Camera,
    status: "ACK"
  },
  {
    id: "fallback-fire",
    type: "Foco de calor",
    zone: "Sierra de Ancasti",
    source: "SatellitePatrol",
    severity: "Medio",
    time: "Hace 7m",
    icon: Flame,
    status: "Despachado",
    assignedUnit: "B-03"
  }
];

const fallbackPatrols: Patrol[] = [
  { code: "M-12", area: "Centro", status: "En ruta", eta: "04m" },
  { code: "M-07", area: "Norte", status: "Disponible", eta: "00m" },
  { code: "B-03", area: "Valle Viejo", status: "En sitio", eta: "00m" },
  { code: "M-18", area: "Sur", status: "Despachado", eta: "08m" }
];

const fallbackCameras: DashboardCamera[] = [
  { name: "COM-014", zone: "Centro", status: "IA activa", health: 98, aiEnabled: true },
  { name: "COM-088", zone: "Acceso Sur", status: "LPR", health: 92, aiEnabled: true },
  { name: "COM-031", zone: "Norte", status: "Degradada", health: 71, aiEnabled: false },
  { name: "COM-102", zone: "Terminal", status: "IA activa", health: 99, aiEnabled: true }
];

const defaultTenant = "Catamarca Provincia";

const demoTenants = [
  defaultTenant,
  "Municipalidad SFVC",
  "Valle Viejo",
  "Salta Demo"
] as const;

type DemoTenant = (typeof demoTenants)[number];

const defaultPilotScope = [
  "VisionAI con 25 camaras",
  "Centro de Comando web",
  "Auditoria Ley 25.326",
  "Reporte ejecutivo mensual",
  "Soporte local Nativos"
];

const tenantProfiles: Record<DemoTenant, TenantProfile> = {
  "Catamarca Provincia": {
    name: "Catamarca Provincia",
    metrics: [
      { label: "Respuesta promedio", value: "04:18", detail: "36% mas rapido" },
      { label: "Cobertura urbana", value: "91%", detail: "142 camaras activas" },
      { label: "Incidentes resueltos", value: "64", detail: "ultimas 24 horas" },
      { label: "Ahorro estimado", value: "58%", detail: "vs suite importada" }
    ],
    pilotScope: defaultPilotScope
  },
  "Municipalidad SFVC": {
    name: "Municipalidad SFVC",
    metrics: [
      { label: "Respuesta promedio", value: "03:52", detail: "alerta a despacho" },
      { label: "Cobertura urbana", value: "86%", detail: "zonas criticas" },
      { label: "Incidentes resueltos", value: "41", detail: "ultimas 24 horas" },
      { label: "Ahorro estimado", value: "52%", detail: "sin licencias externas" }
    ],
    pilotScope: [
      "VisionAI sobre anillo centrico",
      "Mapa tactico municipal",
      "Despacho de moviles",
      "Auditoria por usuario",
      "Reporte semanal al ejecutivo"
    ]
  },
  "Valle Viejo": {
    name: "Valle Viejo",
    metrics: [
      { label: "Respuesta promedio", value: "05:06", detail: "rutas y barrios" },
      { label: "Cobertura urbana", value: "74%", detail: "35 camaras activas" },
      { label: "Incidentes resueltos", value: "22", detail: "ultimas 24 horas" },
      { label: "Ahorro estimado", value: "61%", detail: "infraestructura local" }
    ],
    pilotScope: [
      "Lectura de patentes",
      "Corredores escolares",
      "Boton de panico ciudadano",
      "Mesa de evidencias",
      "Soporte local Nativos"
    ]
  },
  "Salta Demo": {
    name: "Salta Demo",
    metrics: [
      { label: "Respuesta promedio", value: "04:44", detail: "multi jurisdiccion" },
      { label: "Cobertura urbana", value: "88%", detail: "capital y accesos" },
      { label: "Incidentes resueltos", value: "57", detail: "ultimas 24 horas" },
      { label: "Ahorro estimado", value: "55%", detail: "vs suite importada" }
    ],
    pilotScope: [
      "Monitoreo multi tenant",
      "Camara + satelite",
      "Despacho por prioridad",
      "Evidencia con hash",
      "Tablero ejecutivo"
    ]
  }
};

const eventFlow = [
  { title: "IA detecta", detail: "Arma en via publica", icon: Siren, state: "done" },
  { title: "Operador confirma", detail: "ACK legal auditado", icon: CheckCircle2, state: "done" },
  { title: "Despacho movil", detail: "M-12 en ruta 04m", icon: Route, state: "active" },
  { title: "Cierre y evidencia", detail: "Hash inmutable", icon: LockKeyhole, state: "pending" }
];

const moduleNav: Array<{ id: ModuleId; label: string; icon: LucideIcon }> = [
  { id: "command", label: "Comando", icon: Radio },
  { id: "events", label: "Eventos", icon: CircleAlert },
  { id: "cameras", label: "Camaras", icon: Video },
  { id: "map", label: "Mapa", icon: MapPin },
  { id: "patrols", label: "Moviles", icon: Users },
  { id: "evidence", label: "Evidencia", icon: LockKeyhole },
  { id: "reports", label: "Reportes", icon: FileText },
  { id: "audit", label: "Auditoria", icon: Gavel }
];

const initialSceneIndexes: Record<ModuleId, number> = {
  command: 0,
  events: 0,
  cameras: 0,
  map: 0,
  patrols: 0,
  evidence: 0,
  reports: 0,
  audit: 0
};

const demoPanicEvent: DashboardEvent = {
  id: "demo-panic-button",
  type: "Boton de panico",
  zone: "Plaza 25 de Mayo",
  source: "CiudadanoApp",
  severity: "Critico",
  time: "Ahora",
  icon: Siren,
  status: "Nuevo"
};

const moduleExperiences: Record<ModuleId, ModuleExperience> = {
  command: {
    eyebrow: "Centro operativo",
    title: "Comando integral con IA, despacho y vision ejecutiva",
    summary: "Vista ejecutiva y operativa en vivo para vender el valor completo del sistema.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=84",
    alt: "Operador trabajando con pantallas de monitoreo",
    icon: Radio,
    signals: [
      { value: "18", label: "eventos activos" },
      { value: "142", label: "camaras conectadas" },
      { value: "04m", label: "movil en ruta" }
    ],
    scenes: [
      {
        title: "Centro operativo",
        label: "Comando 24/7",
        detail: "Coordina operador, supervisor y jefe de turno",
        objective: "Mantener una sala de situacion viva: eventos priorizados, recursos disponibles y decisiones claras en una sola pantalla.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        alt: "Puesto de operacion con computadora",
        icon: Radio,
        functions: [
          { title: "Abrir tablero vivo", detail: "KPIs y cola critica del turno", icon: BarChart3 },
          { title: "Activar protocolo", detail: "Flujo operativo para incidente critico", icon: PlayCircle },
          { title: "Coordinar recursos", detail: "Cruza eventos, camaras y moviles", icon: Route },
          { title: "Exportar briefing", detail: "Resumen para jefe de guardia", icon: Download }
        ]
      },
      {
        title: "VisionAI",
        label: "Deteccion inteligente",
        detail: "Analitica visual para convertir camaras en alertas",
        objective: "Detectar armas, peleas, caidas, patentes y situaciones anormales para que el operador reciba incidentes accionables.",
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
        alt: "Equipo trabajando en una sala tecnologica",
        icon: Eye,
        functions: [
          { title: "Revisar deteccion IA", detail: "Valida el evento sugerido por VisionAI", icon: Eye },
          { title: "Confirmar ACK", detail: "Operador toma el caso", icon: CheckCircle2 },
          { title: "Ajustar sensibilidad", detail: "Perfil por zona y horario", icon: Camera },
          { title: "Crear alerta critica", detail: "Genera evento para despacho", icon: Siren }
        ]
      },
      {
        title: "SatellitePatrol",
        label: "Cobertura territorial",
        detail: "Rural, periferia y focos de calor",
        objective: "Ampliar cobertura fuera del anillo urbano con capas satelitales, focos de calor y patrullaje territorial.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
        alt: "Vista de la Tierra desde el espacio",
        icon: Satellite,
        functions: [
          { title: "Abrir capa satelital", detail: "Mapa rural y periferia", icon: Satellite },
          { title: "Detectar foco de calor", detail: "Crea alerta territorial", icon: Flame },
          { title: "Enviar patrulla rural", detail: "Asigna unidad al area", icon: Send },
          { title: "Exportar cobertura", detail: "Informe para defensa civil", icon: Download }
        ]
      }
    ],
    functions: [
      { title: "Iniciar simulacion comercial", detail: "Crea un evento critico demostrable", icon: PlayCircle },
      { title: "Vista ejecutiva", detail: "KPIs, ahorro y paquete piloto", icon: BarChart3 },
      { title: "Brief operativo", detail: "Resumen para jefe de turno", icon: Radio },
      { title: "Exportar tablero", detail: "Salida imprimible para reunion", icon: Download }
    ]
  },
  events: {
    eyebrow: "Gestion de incidentes",
    title: "Eventos con ACK legal, despacho real y cierre con evidencia",
    summary: "Cada incidente tiene estado, prioridad, operador, unidad asignada y cierre trazable.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=84",
    alt: "Ciudad con edificios iluminados",
    icon: CircleAlert,
    signals: [
      { value: "3", label: "criticos" },
      { value: "2", label: "en ACK" },
      { value: "1", label: "despachado" }
    ],
    scenes: [
      {
        title: "Cola prioritaria",
        label: "Triaging",
        detail: "Los eventos criticos suben primero",
        objective: "Ordenar incidentes por severidad, tiempo y fuente para que el operador atienda lo que realmente requiere accion inmediata.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        alt: "Distrito urbano de noche",
        icon: CircleAlert,
        functions: [
          { title: "Filtrar criticos", detail: "Solo incidentes de mayor prioridad", icon: Siren },
          { title: "Confirmar ACK", detail: "Toma responsabilidad operativa", icon: CheckCircle2 },
          { title: "Ver fuente", detail: "Camara, app o satelite", icon: Camera },
          { title: "Escalar prioridad", detail: "Notifica a supervisor", icon: CircleAlert }
        ]
      },
      {
        title: "Despacho guiado",
        label: "Movil sugerido",
        detail: "Unidad mas cercana con ETA visible",
        objective: "Elegir la unidad correcta, mostrar ETA y dejar constancia del despacho para no depender de llamadas informales.",
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
        alt: "Calle residencial iluminada",
        icon: Send,
        functions: [
          { title: "Despachar unidad", detail: "Asigna el movil seleccionado", icon: Send },
          { title: "Cambiar movil", detail: "Busca alternativa por zona", icon: Route },
          { title: "Enviar instruccion", detail: "Mensaje operativo al movil", icon: Radio },
          { title: "Marcar arribo", detail: "Confirma llegada al sitio", icon: CheckCircle2 }
        ]
      },
      {
        title: "Cierre probatorio",
        label: "Resolucion",
        detail: "Caso cerrado con evidencia y auditoria",
        objective: "Cerrar el incidente con resolucion, evidencia y trazabilidad para que el caso pueda sostenerse legalmente.",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
        alt: "Documentos de trabajo sobre escritorio",
        icon: LockKeyhole,
        functions: [
          { title: "Cerrar incidente", detail: "Registra resolucion", icon: CheckCircle2 },
          { title: "Adjuntar evidencia", detail: "Vincula imagen o video", icon: FileText },
          { title: "Ver auditoria", detail: "Usuario, hora y accion", icon: Gavel },
          { title: "Enviar reporte", detail: "Resumen del caso", icon: Download }
        ]
      }
    ],
    functions: [
      { title: "Confirmar ACK", detail: "Operador toma responsabilidad", icon: CheckCircle2 },
      { title: "Despachar unidad", detail: "Asigna movil con ETA", icon: Send },
      { title: "Cerrar incidente", detail: "Genera cierre con evidencia", icon: LockKeyhole },
      { title: "Escalar prioridad", detail: "Marca caso critico supervisado", icon: Siren }
    ]
  },
  cameras: {
    eyebrow: "VisionAI",
    title: "Camaras con salud, capacidades IA y accion directa",
    summary: "Monitoreo de estado, IA activa, LPR, degradacion y mantenimiento por dispositivo.",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1800&q=84",
    alt: "Ciudad iluminada de noche vista desde altura",
    icon: Video,
    signals: [
      { value: "142", label: "online" },
      { value: "25", label: "VisionAI" },
      { value: "4", label: "degradadas" }
    ],
    scenes: [
      {
        title: "Anillo urbano",
        label: "Cobertura",
        detail: "Camaras organizadas por zona tactica",
        objective: "Ver cobertura real por zona, detectar puntos ciegos y priorizar camaras que sostienen eventos criticos.",
        image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
        alt: "Vista aerea de ciudad de noche",
        icon: Camera,
        functions: [
          { title: "Ubicar camara", detail: "Centra el dispositivo en mapa", icon: MapPin },
          { title: "Ver cobertura", detail: "Zona, fuente y estado", icon: Camera },
          { title: "Detectar punto ciego", detail: "Marca area sin vision", icon: Eye },
          { title: "Abrir stream", detail: "Vista operativa en vivo", icon: Video }
        ]
      },
      {
        title: "IA por camara",
        label: "Activacion",
        detail: "Pausar o activar analitica por dispositivo",
        objective: "Controlar que analitica corre en cada camara: VisionAI, LPR, deteccion de caidas o monitoreo basico.",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        alt: "Racks de servidores",
        icon: Eye,
        functions: [
          { title: "Pausar o activar IA", detail: "Cambia VisionAI para la camara", icon: Eye },
          { title: "Configurar LPR", detail: "Lectura de patentes", icon: Camera },
          { title: "Probar deteccion", detail: "Simula evento de IA", icon: PlayCircle },
          { title: "Ver capacidades", detail: "Modelos activos por camara", icon: CheckCircle2 }
        ]
      },
      {
        title: "Mantenimiento",
        label: "Salud",
        detail: "Degradacion visible antes de perder servicio",
        objective: "Anticipar fallas: salud de camara, conectividad, degradacion y orden tecnica antes de perder cobertura.",
        image: "https://images.unsplash.com/photo-1581091870622-7c12842b9f4f?auto=format&fit=crop&w=1200&q=80",
        alt: "Tecnico trabajando con equipamiento",
        icon: CheckCircle2,
        functions: [
          { title: "Diagnostico de salud", detail: "Porcentaje y motivo de degradacion", icon: CheckCircle2 },
          { title: "Crear orden tecnica", detail: "Deriva a mantenimiento", icon: FileText },
          { title: "Pausar IA", detail: "Evita falsos positivos", icon: XCircle },
          { title: "Exportar estado", detail: "Reporte de infraestructura", icon: Download }
        ]
      }
    ],
    functions: [
      { title: "Pausar o activar IA", detail: "Cambia VisionAI en la camara seleccionada", icon: Eye },
      { title: "Diagnostico de salud", detail: "Estado tecnico y degradacion", icon: CheckCircle2 },
      { title: "Abrir stream", detail: "Vista operativa de la camara", icon: Video },
      { title: "Orden de mantenimiento", detail: "Deriva camara degradada", icon: FileText }
    ]
  },
  map: {
    eyebrow: "Mapa tactico",
    title: "Capas operativas para eventos, camaras, moviles y zonas calientes",
    summary: "Mapa vivo con capas accionables para decidir rapido y explicar cobertura.",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1800&q=84",
    alt: "Mapa urbano extendido sobre una mesa",
    icon: MapPin,
    signals: [
      { value: "4", label: "capas" },
      { value: "18", label: "pins activos" },
      { value: "2", label: "zonas calientes" }
    ],
    scenes: [
      {
        title: "Eventos + camaras",
        label: "Pins vivos",
        detail: "Cruce visual entre fuente y evento",
        objective: "Cruzar cada incidente con su camara, zona y unidad cercana para que la decision salga del mapa.",
        image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80",
        alt: "Mapa urbano con marcadores",
        icon: MapPin,
        functions: [
          { title: "Capa eventos + camaras", detail: "Activa fuentes e incidentes", icon: MapPin },
          { title: "Centrar evento", detail: "Ubica el caso seleccionado", icon: CircleAlert },
          { title: "Ver camaras cercanas", detail: "Fuentes utiles para el caso", icon: Camera },
          { title: "Despachar desde mapa", detail: "Asigna movil al pin", icon: Send }
        ]
      },
      {
        title: "Zonas calientes",
        label: "Heatmap",
        detail: "Sectores de mayor recurrencia",
        objective: "Identificar recurrencia por barrio, horario y tipo de incidente para planificar prevencion y patrullaje.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        alt: "Paisaje urbano visto desde altura",
        icon: Flame,
        functions: [
          { title: "Zonas calientes", detail: "Activa heatmap tactico", icon: Flame },
          { title: "Analizar recurrencia", detail: "Eventos por zona y horario", icon: BarChart3 },
          { title: "Sugerir patrullaje", detail: "Cobertura preventiva", icon: Route },
          { title: "Exportar mapa", detail: "Imagen para reunion", icon: Download }
        ]
      },
      {
        title: "Cobertura satelital",
        label: "Rural",
        detail: "Focos de calor y areas amplias",
        objective: "Cubrir zonas rurales, serranas o perifericas con lectura satelital y alertas territoriales.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
        alt: "Vista de la Tierra desde el espacio",
        icon: Satellite,
        functions: [
          { title: "Cobertura satelital", detail: "Activa capa rural", icon: Satellite },
          { title: "Detectar foco de calor", detail: "Marca alerta ambiental", icon: Flame },
          { title: "Crear zona AOI", detail: "Area de interes operativa", icon: MapPin },
          { title: "Enviar patrulla rural", detail: "Deriva unidad al area", icon: Send }
        ]
      }
    ],
    functions: [
      { title: "Capa eventos + camaras", detail: "Muestra incidentes sobre fuentes", icon: MapPin },
      { title: "Capa moviles", detail: "Unidades disponibles y en ruta", icon: Route },
      { title: "Zonas calientes", detail: "Lectura tactica por recurrencia", icon: Flame },
      { title: "Cobertura satelital", detail: "Focos rurales y periferia", icon: Satellite }
    ]
  },
  patrols: {
    eyebrow: "Despacho movil",
    title: "Moviles con asignacion, ETA, arribo y liberacion operativa",
    summary: "Gestion de patrullas y unidades con estados claros para operadores y supervisores.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=84",
    alt: "Calle residencial con vehiculo en circulacion",
    icon: Users,
    signals: [
      { value: "27", label: "libres" },
      { value: "4", label: "en ruta" },
      { value: "04m", label: "ETA menor" }
    ],
    scenes: [
      {
        title: "Asignacion rapida",
        label: "Unidad cercana",
        detail: "Despacho basado en zona y ETA",
        objective: "Enviar la unidad correcta al evento correcto, con ETA visible y registro de quien ordeno el despacho.",
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
        alt: "Calle de barrio iluminada",
        icon: Send,
        functions: [
          { title: "Asignar al evento", detail: "Despacha el movil seleccionado", icon: Send },
          { title: "Buscar unidad cercana", detail: "Prioriza por zona y ETA", icon: Route },
          { title: "Enviar instruccion", detail: "Mensaje para la unidad", icon: Radio },
          { title: "Ver ruta", detail: "Camino estimado al incidente", icon: MapPin }
        ]
      },
      {
        title: "Seguimiento",
        label: "ETA vivo",
        detail: "Estado en ruta, en sitio o disponible",
        objective: "Dar seguimiento operativo al movil: en ruta, arribo, en sitio, cierre y liberacion para el siguiente incidente.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        alt: "Ruta y ciudad vista desde altura",
        icon: Route,
        functions: [
          { title: "Marcar arribo", detail: "Unidad llego al sitio", icon: CheckCircle2 },
          { title: "Actualizar ETA", detail: "Refresca tiempo operativo", icon: Clock3 },
          { title: "Liberar unidad", detail: "Vuelve a disponible", icon: Route },
          { title: "Reportar novedad", detail: "Nota del movil", icon: FileText }
        ]
      },
      {
        title: "Turno operativo",
        label: "Dotacion",
        detail: "Moviles por area y disponibilidad",
        objective: "Entender la dotacion por zona, disponibilidad y carga para justificar refuerzos o redistribucion.",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
        alt: "Equipo trabajando en oficina operativa",
        icon: Users,
        functions: [
          { title: "Brief de turno", detail: "Resumen de dotacion por area", icon: FileText },
          { title: "Redistribuir moviles", detail: "Balancea cobertura", icon: Route },
          { title: "Ver disponibles", detail: "Unidades listas", icon: CheckCircle2 },
          { title: "Exportar dotacion", detail: "Informe de guardia", icon: Download }
        ]
      }
    ],
    functions: [
      { title: "Asignar al evento", detail: "Despacha el movil seleccionado", icon: Send },
      { title: "Marcar arribo", detail: "Unidad en sitio con ETA cero", icon: CheckCircle2 },
      { title: "Liberar unidad", detail: "Vuelve a disponible", icon: Route },
      { title: "Brief de turno", detail: "Resumen de dotacion por area", icon: FileText }
    ]
  },
  evidence: {
    eyebrow: "Evidencia digital",
    title: "Cadena de custodia, hash y expediente listo para auditoria",
    summary: "Archivos, cierres, hashes y responsables organizados para sostener valor legal.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=84",
    alt: "Documentos legales y lapicera sobre escritorio",
    icon: LockKeyhole,
    signals: [
      { value: "Hash", label: "encadenado" },
      { value: "12", label: "archivos" },
      { value: "100%", label: "custodia" }
    ],
    scenes: [
      {
        title: "Expediente probatorio",
        label: "Caso",
        detail: "Evidencia vinculada al incidente",
        objective: "Organizar toda la evidencia del incidente en un expediente legible, auditable y preparado para revision.",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
        alt: "Documentos de caso",
        icon: FileText,
        functions: [
          { title: "Adjuntar evidencia", detail: "Video, foto o documento", icon: FileText },
          { title: "Vincular evento", detail: "Relaciona caso e incidente", icon: CircleAlert },
          { title: "Cerrar expediente", detail: "Bloquea resolucion", icon: CheckCircle2 },
          { title: "Exportar expediente", detail: "Salida documental", icon: Download }
        ]
      },
      {
        title: "Hash verificable",
        label: "Integridad",
        detail: "Firma y cadena inmutable",
        objective: "Probar que la evidencia no fue alterada mediante hash, versionado y cadena de integridad.",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        alt: "Infraestructura de servidores",
        icon: LockKeyhole,
        functions: [
          { title: "Ver hash del caso", detail: "Integridad del expediente", icon: LockKeyhole },
          { title: "Validar archivo", detail: "Compara huella digital", icon: CheckCircle2 },
          { title: "Recalcular hash", detail: "Control tecnico", icon: Shield },
          { title: "Exportar constancia", detail: "Prueba de integridad", icon: Download }
        ]
      },
      {
        title: "Custodia legal",
        label: "Auditable",
        detail: "Usuario, hora y tenant por accion",
        objective: "Mostrar quien accedio, modifico o cerro evidencia, con tenant, timestamp y accion sensible.",
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
        alt: "Personas revisando documentos",
        icon: Gavel,
        functions: [
          { title: "Cadena de custodia", detail: "Usuario, tenant y timestamp", icon: Gavel },
          { title: "Ver accesos", detail: "Lecturas y descargas", icon: Users },
          { title: "Bloquear evidencia", detail: "Protege caso sensible", icon: LockKeyhole },
          { title: "Informe legal", detail: "Resumen para auditoria", icon: FileText }
        ]
      }
    ],
    functions: [
      { title: "Ver hash del caso", detail: "Integridad del expediente", icon: LockKeyhole },
      { title: "Cadena de custodia", detail: "Usuario, tenant y timestamp", icon: Gavel },
      { title: "Adjuntar evidencia", detail: "Video, foto o documento", icon: FileText },
      { title: "Cerrar expediente", detail: "Bloquea caso con resolucion", icon: CheckCircle2 }
    ]
  },
  reports: {
    eyebrow: "Inteligencia ejecutiva",
    title: "Reportes para ministros, municipios, licitaciones y seguimiento",
    summary: "Salidas listas para decision: ejecutivo, operativo, licitacion y cumplimiento.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=84",
    alt: "Panel de analitica con graficos",
    icon: FileText,
    signals: [
      { value: "PDF", label: "ejecutivo" },
      { value: "90d", label: "piloto" },
      { value: "58%", label: "ahorro" }
    ],
    scenes: [
      {
        title: "Reporte ejecutivo",
        label: "Decision",
        detail: "Impacto, cobertura y ahorro",
        objective: "Preparar una salida clara para decision politica: impacto, ahorro, cobertura, tiempos y alcance del piloto.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        alt: "Graficos y analitica",
        icon: BarChart3,
        functions: [
          { title: "Generar ejecutivo", detail: "PDF para reunion politica", icon: Download },
          { title: "Comparar ahorro", detail: "Costo local vs suite externa", icon: BarChart3 },
          { title: "Ver cobertura", detail: "Camaras, zonas y moviles", icon: MapPin },
          { title: "Enviar resumen", detail: "Brief para decisores", icon: Send }
        ]
      },
      {
        title: "Carpeta licitacion",
        label: "Compra publica",
        detail: "Arquitectura, alcance y soberania",
        objective: "Ordenar argumentos tecnicos y comerciales para compra publica: arquitectura, soberania, soporte y cumplimiento.",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
        alt: "Documentacion de negocio",
        icon: FileText,
        functions: [
          { title: "Generar licitacion", detail: "Alcance y arquitectura", icon: FileText },
          { title: "Adjuntar anexos", detail: "Modulos, seguridad y SLA", icon: CheckCircle2 },
          { title: "Validar cumplimiento", detail: "Ley 25.326 y auditoria", icon: Gavel },
          { title: "Exportar carpeta", detail: "Paquete para compra", icon: Download }
        ]
      },
      {
        title: "Operacion diaria",
        label: "24 horas",
        detail: "Eventos, tiempos y resoluciones",
        objective: "Mostrar rendimiento real del turno: eventos, ACK, despachos, cierres, tiempos y recursos usados.",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        alt: "Equipo reunido en oficina",
        icon: Clock3,
        functions: [
          { title: "Reporte operativo", detail: "Turno, eventos y tiempos", icon: BarChart3 },
          { title: "Ver SLA", detail: "ACK y despacho promedio", icon: Clock3 },
          { title: "Filtrar por zona", detail: "Operacion por jurisdiccion", icon: MapPin },
          { title: "Exportar metricas", detail: "Datos para seguimiento", icon: Download }
        ]
      }
    ],
    functions: [
      { title: "Generar ejecutivo", detail: "PDF para reunion politica", icon: Download },
      { title: "Generar licitacion", detail: "Alcance y arquitectura", icon: FileText },
      { title: "Reporte operativo", detail: "Turno, eventos y tiempos", icon: BarChart3 },
      { title: "Exportar metricas", detail: "Datos para seguimiento", icon: CheckCircle2 }
    ]
  },
  audit: {
    eyebrow: "Trazabilidad legal",
    title: "Auditoria por usuario, permiso, accion sensible y tenant",
    summary: "Registro legal de acciones criticas para compras publicas, seguridad y cumplimiento.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1800&q=84",
    alt: "Personas revisando documentos de cumplimiento",
    icon: Gavel,
    signals: [
      { value: "100%", label: "trazable" },
      { value: "8", label: "usuarios" },
      { value: "Hash", label: "chain" }
    ],
    scenes: [
      {
        title: "Log sensible",
        label: "Auditoria",
        detail: "ACK, despacho, cierre y permisos",
        objective: "Revisar cada accion sensible del sistema y responder quien hizo que, cuando, desde que tenant y con que resultado.",
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
        alt: "Revision documental",
        icon: Gavel,
        functions: [
          { title: "Ver log legal", detail: "Acciones sensibles recientes", icon: Gavel },
          { title: "Filtrar por usuario", detail: "Responsabilidad individual", icon: Users },
          { title: "Ver accion", detail: "Detalle de cambio auditable", icon: FileText },
          { title: "Exportar auditoria", detail: "Informe para cumplimiento", icon: Download }
        ]
      },
      {
        title: "Roles y permisos",
        label: "Gobierno",
        detail: "Operador, supervisor y administrador",
        objective: "Controlar que cada persona vea y ejecute solo lo que corresponde segun rol, organismo y modulo.",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
        alt: "Equipo en sala de control",
        icon: Users,
        functions: [
          { title: "Revisar usuarios", detail: "Roles por organismo", icon: Users },
          { title: "Validar permisos", detail: "Control por modulo", icon: Shield },
          { title: "Bloquear usuario", detail: "Accion preventiva", icon: LockKeyhole },
          { title: "Exportar roles", detail: "Matriz de permisos", icon: Download }
        ]
      },
      {
        title: "Infraestructura soberana",
        label: "Compliance",
        detail: "Datos locales y control por tenant",
        objective: "Demostrar soberania de datos, aislamiento por tenant, infraestructura local y controles para organismos publicos.",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        alt: "Centro de datos con servidores",
        icon: Shield,
        functions: [
          { title: "Validar tenant", detail: "Aislamiento por organismo", icon: Building2 },
          { title: "Revisar infraestructura", detail: "Servicios y trazabilidad", icon: Shield },
          { title: "Ver backup", detail: "Continuidad operativa", icon: CheckCircle2 },
          { title: "Informe compliance", detail: "Soberania y seguridad", icon: FileText }
        ]
      }
    ],
    functions: [
      { title: "Ver log legal", detail: "Acciones sensibles recientes", icon: Gavel },
      { title: "Revisar usuarios", detail: "Roles por organismo", icon: Users },
      { title: "Validar permisos", detail: "Control por modulo", icon: Shield },
      { title: "Exportar auditoria", detail: "Informe para cumplimiento", icon: Download }
    ]
  }
};

async function patchApi<TResponse>(
  path: string,
  body: Record<string, unknown> = {}
): Promise<TResponse | null> {
  const demoSession = window.localStorage.getItem("guardian360.demoSession") === "true";
  if (demoSession) {
    return null;
  }

  const token = window.localStorage.getItem("guardian360.accessToken");
  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID()
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("La accion operativa no pudo completarse.");
  }

  return (await response.json()) as TResponse;
}

export default function Page() {
  const [events, setEvents] = useState(fallbackEvents);
  const [cameras, setCameras] = useState(fallbackCameras);
  const [patrols, setPatrols] = useState(fallbackPatrols);
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null);
  const [cameraOverview, setCameraOverview] = useState<CameraOverview | null>(null);
  const [sessionState, setSessionState] = useState("Modo visual");
  const [selectedTenant, setSelectedTenant] = useState<DemoTenant>(defaultTenant);
  const [demoRunning, setDemoRunning] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleId>("command");
  const [selectedSceneIndexes, setSelectedSceneIndexes] =
    useState<Record<ModuleId, number>>(initialSceneIndexes);
  const [selectedEventId, setSelectedEventId] = useState(fallbackEvents[0]?.id ?? demoPanicEvent.id);
  const [selectedCameraName, setSelectedCameraName] = useState(fallbackCameras[0]?.name ?? "COM-000");
  const [selectedPatrolCode, setSelectedPatrolCode] = useState(fallbackPatrols[0]?.code ?? "M-00");
  const [selectedMapLayer, setSelectedMapLayer] = useState("Eventos + camaras");
  const selectedTenantProfile: TenantProfile =
    tenantProfiles[selectedTenant] ?? tenantProfiles[defaultTenant];
  const activeModuleExperience = moduleExperiences[activeModule];
  const activeSceneIndex = selectedSceneIndexes[activeModule] ?? 0;
  const activeVisualScene =
    (activeModuleExperience.scenes[activeSceneIndex] ?? activeModuleExperience.scenes[0])!;
  const ActiveVisualSceneIcon = activeVisualScene.icon;
  const ActiveModuleIcon = activeModuleExperience.icon;
  const PrimarySceneIcon = activeModuleExperience.scenes[0]?.icon ?? ActiveModuleIcon;
  const SecondarySceneIcon = activeModuleExperience.scenes[1]?.icon ?? Route;
  const TertiarySceneIcon = activeModuleExperience.scenes[2]?.icon ?? Satellite;
  const selectedEvent: DashboardEvent =
    events.find((event) => event.id === selectedEventId) ?? fallbackEvents[0] ?? demoPanicEvent;
  const selectedCamera: DashboardCamera =
    cameras.find((camera) => camera.name === selectedCameraName) ??
    fallbackCameras[0] ?? { name: "COM-000", zone: "Sin zona", status: "Offline", health: 0, aiEnabled: false };
  const selectedPatrol: Patrol =
    patrols.find((patrol) => patrol.code === selectedPatrolCode) ??
    fallbackPatrols[0] ?? { code: "M-00", area: "Sin area", status: "No disponible", eta: "--" };

  useEffect(() => {
    const demoSession = window.localStorage.getItem("guardian360.demoSession") === "true";
    if (demoSession) {
      setSessionState("Modo visual demo");
      return;
    }

    const token = window.localStorage.getItem("guardian360.accessToken");
    if (!token) {
      setSessionState("Inicia sesion para datos reales");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const loadOperationalData = async () => {
      try {
        const [eventsResponse, camerasResponse, summaryResponse, cameraOverviewResponse] =
          await Promise.all([
            fetch(`${API_URL}/events?take=8`, { headers, cache: "no-store" }),
            fetch(`${API_URL}/cameras`, { headers, cache: "no-store" }),
            fetch(`${API_URL}/events/summary`, { headers, cache: "no-store" }),
            fetch(`${API_URL}/cameras/overview`, { headers, cache: "no-store" })
          ]);

        if (!eventsResponse.ok || !camerasResponse.ok) {
          throw new Error("No pudimos cargar datos operativos.");
        }

        const apiEvents = (await eventsResponse.json()) as ApiEvent[];
        const apiCameras = (await camerasResponse.json()) as ApiCamera[];
        setEvents(apiEvents.map(toEventRow));
        setCameras(apiCameras.map(toCameraRow));

        if (summaryResponse.ok) {
          setEventSummary((await summaryResponse.json()) as EventSummary);
        }

        if (cameraOverviewResponse.ok) {
          setCameraOverview((await cameraOverviewResponse.json()) as CameraOverview);
        }

        setSessionState("Datos reales conectados");
      } catch {
        setSessionState("API no disponible");
      }
    };

    void loadOperationalData();
  }, []);

  const kpis = useMemo(() => {
    if (!eventSummary || !cameraOverview) {
      return fallbackKpis;
    }

    const onlineRate =
      cameraOverview.total === 0
        ? "0%"
        : `${Math.round((cameraOverview.online / cameraOverview.total) * 100)}%`;

    return [
      {
        label: "Eventos activos",
        value: String(eventSummary.active),
        trend: `${eventSummary.critical} criticos`,
        state: eventSummary.critical > 0 ? "critical" : "ok"
      },
      {
        label: "Camaras online",
        value: String(cameraOverview.online),
        trend: onlineRate,
        state: cameraOverview.degraded > 0 ? "info" : "ok"
      },
      { label: "ACK pendientes", value: String(eventSummary.acknowledged), trend: "en curso", state: "info" },
      { label: "Resueltos hoy", value: String(eventSummary.resolvedToday), trend: "24h", state: "ok" }
    ];
  }, [cameraOverview, eventSummary]);

  const startDemoSimulation = () => {
    setDemoRunning(true);
    setSessionState("Simulacion comercial activa");
    setActiveModule("events");
    setSelectedEventId(demoPanicEvent.id);
    setEvents((currentEvents) => [
      demoPanicEvent,
      ...currentEvents.filter((event) => event.id !== demoPanicEvent.id).slice(0, 5)
    ]);
  };

  const openModule = (moduleId: ModuleId) => {
    setActiveModule(moduleId);
    setSessionState(`${moduleNav.find((module) => module.id === moduleId)?.label ?? "Modulo"} abierto`);
  };

  const updateEvent = (eventId: string, patch: Partial<DashboardEvent>) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) => (event.id === eventId ? { ...event, ...patch } : event))
    );
  };

  const acknowledgeEvent = async (eventId: string) => {
    updateEvent(eventId, { status: "ACK", time: "Ahora" });
    setSelectedEventId(eventId);
    setActiveModule("events");
    try {
      const apiEvent = await patchApi<ApiEvent>(`/events/${eventId}/ack`);
      if (apiEvent) {
        updateEvent(eventId, toEventRow(apiEvent));
        setSessionState("Evento confirmado por operador");
        return;
      }
      setSessionState("Evento confirmado en modo visual");
    } catch {
      setSessionState("No se pudo confirmar en API; cambio visual aplicado");
    }
  };

  const dispatchEvent = async (eventId: string, patrolCode = "M-12") => {
    updateEvent(eventId, { status: "Despachado", assignedUnit: patrolCode, time: "Ahora" });
    setPatrols((currentPatrols) =>
      currentPatrols.map((patrol) =>
        patrol.code === patrolCode ? { ...patrol, status: "Despachado", eta: "04m" } : patrol
      )
    );
    setSelectedEventId(eventId);
    setSelectedPatrolCode(patrolCode);
    setActiveModule("patrols");
    try {
      const apiEvent = await patchApi<ApiEvent>(`/events/${eventId}/dispatch`, {
        unitCode: patrolCode,
        notes: "Despacho desde Centro de Comando"
      });
      if (apiEvent) {
        updateEvent(eventId, { ...toEventRow(apiEvent), assignedUnit: patrolCode });
        setSessionState(`Movil ${patrolCode} despachado`);
        return;
      }
      setSessionState(`Movil ${patrolCode} despachado en modo visual`);
    } catch {
      setSessionState("No se pudo despachar en API; cambio visual aplicado");
    }
  };

  const closeEvent = async (eventId: string) => {
    updateEvent(eventId, { status: "Cerrado", time: "Cerrado" });
    setActiveModule("evidence");
    try {
      const apiEvent = await patchApi<ApiEvent>(`/events/${eventId}/close`, {
        resolutionNote: "Caso cerrado desde Centro de Comando"
      });
      if (apiEvent) {
        updateEvent(eventId, toEventRow(apiEvent));
        setSessionState("Caso cerrado con evidencia");
        return;
      }
      setSessionState("Caso cerrado con evidencia en modo visual");
    } catch {
      setSessionState("No se pudo cerrar en API; cambio visual aplicado");
    }
  };

  const toggleCameraAi = async (cameraName: string) => {
    const cameraBeforeUpdate = cameras.find((camera) => camera.name === cameraName);
    setCameras((currentCameras) =>
      currentCameras.map((camera) =>
        camera.name === cameraName
          ? {
              ...camera,
              aiEnabled: !camera.aiEnabled,
              status: camera.aiEnabled ? "IA pausada" : "IA activa"
            }
          : camera
      )
    );
    setSelectedCameraName(cameraName);
    setActiveModule("cameras");
    try {
      if (!cameraBeforeUpdate?.id) {
        setSessionState("Estado de IA actualizado en modo visual");
        return;
      }

      const apiCamera = await patchApi<ApiCamera>(`/cameras/${cameraBeforeUpdate.id}/ai`, {
        enabled: !cameraBeforeUpdate.aiEnabled
      });
      if (apiCamera) {
        const updatedCamera = toCameraRow(apiCamera);
        setCameras((currentCameras) =>
          currentCameras.map((camera) => (camera.id === updatedCamera.id ? updatedCamera : camera))
        );
      }
      setSessionState("Estado de IA actualizado");
    } catch {
      setSessionState("No se pudo actualizar IA en API; cambio visual aplicado");
    }
  };

  const centerMapOn = (label: string) => {
    setSelectedMapLayer(label);
    setActiveModule("map");
    setSessionState(`Mapa centrado en ${label}`);
  };

  const markPatrolArrived = (patrolCode: string) => {
    setPatrols((currentPatrols) =>
      currentPatrols.map((patrol) =>
        patrol.code === patrolCode ? { ...patrol, status: "En sitio", eta: "00m" } : patrol
      )
    );
    setSelectedPatrolCode(patrolCode);
    setActiveModule("patrols");
    setSessionState(`Movil ${patrolCode} marcado en sitio`);
  };

  const releasePatrol = (patrolCode: string) => {
    setPatrols((currentPatrols) =>
      currentPatrols.map((patrol) =>
        patrol.code === patrolCode ? { ...patrol, status: "Disponible", eta: "00m" } : patrol
      )
    );
    setSelectedPatrolCode(patrolCode);
    setActiveModule("patrols");
    setSessionState(`Movil ${patrolCode} disponible`);
  };

  const runModuleFunction = (moduleId: ModuleId, functionTitle: string) => {
    if (moduleId === "command" && functionTitle === "Iniciar simulacion comercial") {
      startDemoSimulation();
      return;
    }

    if (moduleId === "events" && functionTitle === "Confirmar ACK") {
      void acknowledgeEvent(selectedEvent.id);
      return;
    }

    if (moduleId === "events" && functionTitle === "Despachar unidad") {
      void dispatchEvent(selectedEvent.id, selectedPatrol.code);
      return;
    }

    if (moduleId === "events" && functionTitle === "Cerrar incidente") {
      void closeEvent(selectedEvent.id);
      return;
    }

    if (moduleId === "cameras" && functionTitle === "Pausar o activar IA") {
      void toggleCameraAi(selectedCamera.name);
      return;
    }

    if (moduleId === "map") {
      centerMapOn(functionTitle.replace("Capa ", ""));
      return;
    }

    if (moduleId === "patrols" && functionTitle === "Asignar al evento") {
      void dispatchEvent(selectedEvent.id, selectedPatrol.code);
      return;
    }

    if (moduleId === "patrols" && functionTitle === "Marcar arribo") {
      markPatrolArrived(selectedPatrol.code);
      return;
    }

    if (moduleId === "patrols" && functionTitle === "Liberar unidad") {
      releasePatrol(selectedPatrol.code);
      return;
    }

    if (moduleId === "evidence" && functionTitle === "Cerrar expediente") {
      void closeEvent(selectedEvent.id);
      return;
    }

    if (moduleId === "reports" && functionTitle.includes("Generar")) {
      window.print();
    }

    setSessionState(functionTitle);
  };

  const selectVisualScene = (sceneIndex: number, scene: VisualScene) => {
    setSelectedSceneIndexes((currentIndexes) => ({
      ...currentIndexes,
      [activeModule]: sceneIndex
    }));
    setSessionState(`${scene.title}: ${scene.detail}`);
  };

  const runVisualSceneFunction = (scene: VisualScene, moduleFunction: ModuleFunction) => {
    const title = moduleFunction.title;

    if (title.includes("Simulacion") || title.includes("Activar protocolo") || title.includes("Probar deteccion")) {
      startDemoSimulation();
      return;
    }

    if (title.includes("ACK") || title.includes("Revisar deteccion")) {
      void acknowledgeEvent(selectedEvent.id);
      return;
    }

    if (
      title.includes("Despachar") ||
      title.includes("Enviar patrulla") ||
      title.includes("Asignar") ||
      title.includes("Despacho")
    ) {
      void dispatchEvent(selectedEvent.id, selectedPatrol.code);
      return;
    }

    if (title.includes("Cerrar")) {
      void closeEvent(selectedEvent.id);
      return;
    }

    if (title.includes("Arribo")) {
      markPatrolArrived(selectedPatrol.code);
      return;
    }

    if (title.includes("Liberar")) {
      releasePatrol(selectedPatrol.code);
      return;
    }

    if (title.includes("IA") || title.includes("LPR") || title.includes("stream") || title.includes("Stream")) {
      if (title.includes("stream") || title.includes("Stream")) {
        setSessionState(`${scene.title}: stream abierto ${selectedCamera.name}`);
        return;
      }
      void toggleCameraAi(selectedCamera.name);
      return;
    }

    if (
      title.includes("Capa") ||
      title.includes("Mapa") ||
      title.includes("cobertura") ||
      title.includes("Cobertura") ||
      title.includes("zona") ||
      title.includes("Zona") ||
      title.includes("Ubicar") ||
      title.includes("Centrar")
    ) {
      centerMapOn(title.replace("Capa ", ""));
      return;
    }

    if (title.includes("Exportar") || title.includes("Generar") || title.includes("PDF")) {
      window.print();
    }

    setSessionState(`${scene.title}: ${title}`);
  };

  const renderModuleToolbar = () => {
    if (activeModule === "command") {
      return (
        <>
          <button type="button" onClick={startDemoSimulation}>
            <PlayCircle size={16} aria-hidden />
            Simular caso
          </button>
          <button type="button" onClick={() => centerMapOn(selectedEvent.zone)}>
            <MapPin size={16} aria-hidden />
            Ver mapa
          </button>
          <button type="button" onClick={() => window.print()}>
            <Download size={16} aria-hidden />
            Exportar tablero
          </button>
        </>
      );
    }

    if (activeModule === "events") {
      return (
        <>
          <button type="button" onClick={() => acknowledgeEvent(selectedEvent.id)}>
            <CheckCircle2 size={16} aria-hidden />
            ACK
          </button>
          <button type="button" onClick={() => dispatchEvent(selectedEvent.id, selectedPatrol.code)}>
            <Send size={16} aria-hidden />
            Despachar
          </button>
          <button type="button" onClick={() => closeEvent(selectedEvent.id)}>
            <LockKeyhole size={16} aria-hidden />
            Cerrar
          </button>
        </>
      );
    }

    if (activeModule === "cameras") {
      return (
        <>
          <button type="button" onClick={() => toggleCameraAi(selectedCamera.name)}>
            {selectedCamera.aiEnabled ? <XCircle size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            {selectedCamera.aiEnabled ? "Pausar IA" : "Activar IA"}
          </button>
          <button type="button" onClick={() => centerMapOn(selectedCamera.name)}>
            <MapPin size={16} aria-hidden />
            Ubicar camara
          </button>
          <button type="button" onClick={() => setSessionState(`Stream abierto: ${selectedCamera.name}`)}>
            <Video size={16} aria-hidden />
            Abrir stream
          </button>
        </>
      );
    }

    if (activeModule === "map") {
      return (
        <>
          {["Eventos + camaras", "Moviles", "Zonas calientes"].map((layer) => (
            <button key={layer} type="button" onClick={() => centerMapOn(layer)}>
              <MapPin size={16} aria-hidden />
              {layer}
            </button>
          ))}
        </>
      );
    }

    if (activeModule === "patrols") {
      return (
        <>
          <button type="button" onClick={() => dispatchEvent(selectedEvent.id, selectedPatrol.code)}>
            <Send size={16} aria-hidden />
            Asignar
          </button>
          <button type="button" onClick={() => markPatrolArrived(selectedPatrol.code)}>
            <CheckCircle2 size={16} aria-hidden />
            Arribo
          </button>
          <button type="button" onClick={() => releasePatrol(selectedPatrol.code)}>
            <Route size={16} aria-hidden />
            Liberar
          </button>
        </>
      );
    }

    if (activeModule === "evidence") {
      return (
        <>
          <button type="button" onClick={() => setSessionState(`Hash verificado: ${selectedEvent.id}`)}>
            <LockKeyhole size={16} aria-hidden />
            Ver hash
          </button>
          <button type="button" onClick={() => setSessionState("Cadena de custodia abierta")}>
            <Gavel size={16} aria-hidden />
            Custodia
          </button>
          <button type="button" onClick={() => closeEvent(selectedEvent.id)}>
            <CheckCircle2 size={16} aria-hidden />
            Cerrar caso
          </button>
        </>
      );
    }

    if (activeModule === "reports") {
      return (
        <>
          <button type="button" onClick={() => window.print()}>
            <Download size={16} aria-hidden />
            Ejecutivo
          </button>
          <button type="button" onClick={() => setSessionState("Carpeta de licitacion generada")}>
            <FileText size={16} aria-hidden />
            Licitacion
          </button>
          <button type="button" onClick={() => setSessionState("Metricas operativas exportadas")}>
            <BarChart3 size={16} aria-hidden />
            Metricas
          </button>
        </>
      );
    }

    return (
      <>
        <button type="button" onClick={() => setSessionState("Log legal abierto")}>
          <Gavel size={16} aria-hidden />
          Log legal
        </button>
        <button type="button" onClick={() => setSessionState("Permisos revisados")}>
          <Shield size={16} aria-hidden />
          Permisos
        </button>
        <button type="button" onClick={() => window.print()}>
          <Download size={16} aria-hidden />
          Exportar auditoria
        </button>
      </>
    );
  };

  return (
    <main className="command-shell">
      <aside className="sidebar" aria-label="Navegacion principal">
        <div className="brand-mark">
          <Shield size={28} aria-hidden />
          <span>Guardian360</span>
        </div>
        <nav className="nav-stack">
          {moduleNav.slice(0, 6).map((module) => {
            const Icon = module.icon;
            return (
              <button
                className={`nav-item ${activeModule === module.id ? "active" : ""}`}
                key={module.id}
                type="button"
                aria-label={module.label}
                onClick={() => openModule(module.id)}
              >
                <Icon size={20} aria-hidden />
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Ministerio de Seguridad de Catamarca</p>
            <h1>Centro de Comando</h1>
          </div>
          <div className="topbar-actions">
            <label className="tenant-selector">
              <Building2 size={16} aria-hidden />
              <select
                value={selectedTenant}
                onChange={(event) => setSelectedTenant(event.target.value as DemoTenant)}
              >
                {demoTenants.map((tenant) => (
                  <option key={tenant}>{tenant}</option>
                ))}
              </select>
            </label>
            <button className="primary-action" type="button" onClick={startDemoSimulation}>
              <PlayCircle size={18} aria-hidden />
              {demoRunning ? "Simulacion activa" : "Iniciar simulacion"}
            </button>
            <div className="operator-strip">
              <span className="live-dot" />
              <strong>Operativo en vivo</strong>
              <span>{sessionState}</span>
            </div>
          </div>
        </header>

        <section className="module-switcher" aria-label="Modulos de Guardian360">
          {moduleNav.map((module) => {
            const Icon = module.icon;
            return (
              <button
                className={activeModule === module.id ? "active" : ""}
                key={module.id}
                type="button"
                onClick={() => openModule(module.id)}
              >
                <Icon size={17} aria-hidden />
                <span>{module.label}</span>
              </button>
            );
          })}
        </section>

        <section className={`active-module-panel module-${activeModule}`} aria-label="Modulo activo">
          <div>
            <p className="eyebrow">{activeModuleExperience.eyebrow}</p>
            <h2>{activeModuleExperience.title}</h2>
            <span>{activeModuleExperience.summary}</span>
          </div>
          <div className="module-actions">
            {renderModuleToolbar()}
          </div>
        </section>

        <section className={`visual-command module-${activeModule}`} aria-label="Vista visual del sistema">
          <article className="hero-visual">
            <img src={activeVisualScene.image} alt={activeVisualScene.alt} />
            <div className="holo-stage" aria-hidden="true">
              <span className="holo-ring" />
              <span className="holo-node node-camera">
                <PrimarySceneIcon size={20} />
                <small>{activeModuleExperience.scenes[0]?.label ?? activeModuleExperience.eyebrow}</small>
              </span>
              <span className="holo-node node-dispatch">
                <SecondarySceneIcon size={20} />
                <small>{activeModuleExperience.scenes[1]?.label ?? "Operacion"}</small>
              </span>
              <span className="holo-node node-satellite">
                <TertiarySceneIcon size={20} />
                <small>{activeModuleExperience.scenes[2]?.label ?? "Cobertura"}</small>
              </span>
              <span className="holo-node node-evidence">
                <ActiveModuleIcon size={20} />
                <small>{moduleNav.find((module) => module.id === activeModule)?.label}</small>
              </span>
            </div>
            <div className="hero-visual-overlay">
              <p className="eyebrow">{activeVisualScene.label}</p>
              <h2>{activeVisualScene.title}</h2>
              <p className="hero-objective">{activeVisualScene.objective}</p>
              <div className="hero-signal-grid">
                {activeModuleExperience.signals.map((signal) => (
                  <span key={`${signal.value}-${signal.label}`}>
                    <strong>{signal.value}</strong>
                    {signal.label}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <div className="scene-strip">
            {activeModuleExperience.scenes.map((scene, index) => {
              const Icon = scene.icon;
              return (
                <button
                  className={`scene-card ${index === activeSceneIndex ? "active" : ""}`}
                  key={scene.title}
                  type="button"
                  onClick={() => selectVisualScene(index, scene)}
                >
                  <img src={scene.image} alt={scene.alt} />
                  <div>
                    <span>
                      <Icon size={16} aria-hidden />
                      {scene.label}
                    </span>
                    <strong>{scene.title}</strong>
                    <small>{scene.detail}</small>
                  </div>
                </button>
              );
            })}

            <article className="scene-action-panel" aria-label={`Funciones de ${activeVisualScene.title}`}>
              <div className="panel-title compact">
                <div>
                  <p className="eyebrow">Objetivo</p>
                  <h2>{activeVisualScene.title}</h2>
                </div>
                <ActiveVisualSceneIcon size={20} aria-hidden />
              </div>
              <p>{activeVisualScene.objective}</p>
              <div className="scene-action-grid">
                {activeVisualScene.functions.map((moduleFunction) => {
                  const Icon = moduleFunction.icon;
                  return (
                    <button
                      key={moduleFunction.title}
                      type="button"
                      onClick={() => runVisualSceneFunction(activeVisualScene, moduleFunction)}
                    >
                      <Icon size={17} aria-hidden />
                      <span>
                        <strong>{moduleFunction.title}</strong>
                        <small>{moduleFunction.detail}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          </div>
        </section>

        <section className="commercial-grid" aria-label="Demo comercial ejecutiva">
          <article className="executive-panel">
            <div className="panel-title compact">
              <div>
                <p className="eyebrow">Decision ejecutiva</p>
                <h2>Impacto para {selectedTenant}</h2>
              </div>
              <BarChart3 size={20} aria-hidden />
            </div>
            <div className="executive-metrics">
              {selectedTenantProfile.metrics.map((metric) => (
                <div key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.detail}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="flow-panel">
            <div className="panel-title compact">
              <div>
                <p className="eyebrow">Caso demo</p>
                <h2>Evento resuelto punta a punta</h2>
              </div>
              <Siren size={20} aria-hidden />
            </div>
            <div className="flow-steps">
              {eventFlow.map((step) => {
                const Icon = step.icon;
                return (
                  <div className={`flow-step ${step.state}`} key={step.title}>
                    <span>
                      <Icon size={17} aria-hidden />
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <small>{step.detail}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="pilot-panel">
            <div className="panel-title compact">
              <div>
                <p className="eyebrow">Piloto 90 dias</p>
                <h2>Paquete vendible</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Imprimir reporte" onClick={() => window.print()}>
                <Download size={18} aria-hidden />
              </button>
            </div>
            <ul className="pilot-list">
              {selectedTenantProfile.pilotScope.map((module) => (
                <li key={module}>
                  <CheckCircle2 size={16} aria-hidden />
                  {module}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="kpi-grid" aria-label="Indicadores">
          {kpis.map((kpi) => (
            <article className={`kpi-card ${kpi.state}`} key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <small>{kpi.trend}</small>
            </article>
          ))}
        </section>

        <section className="command-grid">
          <article className="map-panel" aria-label="Mapa operativo">
            <div className="panel-title">
              <div>
                <p className="eyebrow">San Fernando del Valle</p>
                <h2>Mapa tactico</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Centrar mapa">
                <Route size={18} aria-hidden />
              </button>
            </div>

            <div className="city-map">
              <span className="road horizontal one" />
              <span className="road horizontal two" />
              <span className="road vertical one" />
              <span className="road vertical two" />
              <span className="aoi aoi-center">Centro</span>
              <span className="aoi aoi-north">Norte</span>
              <button className="camera-pin pin-1" type="button" onClick={() => {
                setSelectedCameraName("COM-014");
                centerMapOn("COM-014");
              }}>
                <Camera size={15} aria-hidden />
              </button>
              <button className="camera-pin pin-2" type="button" onClick={() => {
                setSelectedCameraName("COM-088");
                centerMapOn("COM-088");
              }}>
                <Camera size={15} aria-hidden />
              </button>
              <button className="event-pin critical" type="button" onClick={() => {
                setSelectedEventId(selectedEvent.id);
                centerMapOn(selectedEvent.zone);
              }}>
                <Siren size={18} aria-hidden />
              </button>
              <button className="event-pin warning" type="button" onClick={() => {
                setSelectedEventId("fallback-fire");
                centerMapOn("Sierra de Ancasti");
              }}>
                <Flame size={18} aria-hidden />
              </button>
              <button className="patrol-unit unit-1" type="button" onClick={() => {
                setSelectedPatrolCode("M-12");
                centerMapOn("M-12");
              }}>M-12</button>
              <button className="patrol-unit unit-2" type="button" onClick={() => {
                setSelectedPatrolCode("B-03");
                centerMapOn("B-03");
              }}>B-03</button>
            </div>
          </article>

          <aside className="event-panel" aria-label="Eventos prioritarios">
            <div className="panel-title compact">
              <div>
                <p className="eyebrow">Cola critica</p>
                <h2>Eventos</h2>
              </div>
              <CircleAlert size={20} aria-hidden />
            </div>

            <div className="event-list">
              {events.map((event) => {
                const Icon = event.icon;
                return (
                  <article className={`event-row ${selectedEventId === event.id ? "selected" : ""}`} key={event.id}>
                    <div className="event-icon">
                      <Icon size={18} aria-hidden />
                    </div>
                    <button
                      className="event-main"
                      type="button"
                      onClick={() => {
                        setSelectedEventId(event.id);
                        openModule("events");
                      }}
                    >
                      <strong>{event.type}</strong>
                      <span>{event.zone}</span>
                      <small>{event.source}</small>
                    </button>
                    <div className="event-meta">
                      <time>{event.time}</time>
                      <small>{event.status ?? "Nuevo"}</small>
                    </div>
                  </article>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="operational-workbench" aria-label="Acciones por modulo">
          <article className="detail-panel">
            <div className="panel-title compact">
              <div>
                <p className="eyebrow">Detalle activo</p>
                <h2>{activeModule === "cameras" ? selectedCamera.name : activeModule === "patrols" ? selectedPatrol.code : selectedEvent.type}</h2>
              </div>
              {activeModule === "cameras" ? <Video size={20} aria-hidden /> : activeModule === "patrols" ? <Users size={20} aria-hidden /> : <CircleAlert size={20} aria-hidden />}
            </div>

            <div className="detail-grid">
              <span>
                <strong>Modulo</strong>
                {moduleNav.find((module) => module.id === activeModule)?.label}
              </span>
              <span>
                <strong>Estado</strong>
                {activeModule === "cameras" ? selectedCamera.status : activeModule === "patrols" ? selectedPatrol.status : selectedEvent.status ?? "Nuevo"}
              </span>
              <span>
                <strong>Ubicacion</strong>
                {activeModule === "cameras" ? selectedCamera.zone : activeModule === "patrols" ? selectedPatrol.area : selectedEvent.zone}
              </span>
              <span>
                <strong>Origen</strong>
                {activeModule === "cameras" ? `${selectedCamera.health}% salud` : activeModule === "patrols" ? `ETA ${selectedPatrol.eta}` : selectedEvent.source}
              </span>
            </div>

            <div className="action-row">
              {renderModuleToolbar()}
            </div>
          </article>

          <article className="module-panel">
            <div className="panel-title compact">
              <div>
                <p className="eyebrow">Funciones</p>
                <h2>{moduleNav.find((module) => module.id === activeModule)?.label}</h2>
              </div>
              <BarChart3 size={20} aria-hidden />
            </div>

            {activeModule === "events" ? (
              <div className="function-list">
                {events.map((event) => (
                  <button key={event.id} type="button" onClick={() => setSelectedEventId(event.id)}>
                    <span>{event.type}</span>
                    <small>{event.status ?? "Nuevo"}</small>
                  </button>
                ))}
              </div>
            ) : null}

            {activeModule === "cameras" ? (
              <div className="function-list">
                {cameras.map((camera) => (
                  <button key={camera.name} type="button" onClick={() => setSelectedCameraName(camera.name)}>
                    <span>{camera.name}</span>
                    <small>{camera.status}</small>
                  </button>
                ))}
              </div>
            ) : null}

            {activeModule === "patrols" ? (
              <div className="function-list">
                {patrols.map((patrol) => (
                  <button key={patrol.code} type="button" onClick={() => setSelectedPatrolCode(patrol.code)}>
                    <span>{patrol.code}</span>
                    <small>{patrol.status}</small>
                  </button>
                ))}
              </div>
            ) : null}

            {activeModule === "map" ? (
              <div className="layer-list">
                {["Eventos + camaras", "Moviles", "Zonas calientes", "Cobertura satelital"].map((layer) => (
                  <button
                    className={selectedMapLayer === layer ? "active" : ""}
                    key={layer}
                    type="button"
                    onClick={() => centerMapOn(layer)}
                  >
                    <MapPin size={15} aria-hidden />
                    {layer}
                  </button>
                ))}
              </div>
            ) : null}

            {activeModule === "evidence" || activeModule === "reports" || activeModule === "audit" || activeModule === "command" ? (
              <div className="function-list">
                {activeModuleExperience.functions.map((moduleFunction) => {
                  const Icon = moduleFunction.icon;
                  return (
                  <button
                    key={moduleFunction.title}
                    type="button"
                    onClick={() => runModuleFunction(activeModule, moduleFunction.title)}
                  >
                    <Icon size={17} aria-hidden />
                    <div>
                      <span>{moduleFunction.title}</span>
                      <small>{moduleFunction.detail}</small>
                    </div>
                  </button>
                  );
                })}
              </div>
            ) : null}
          </article>
        </section>

        <section className="lower-grid">
          <article className="ops-panel">
            <div className="panel-title compact">
              <h2>Moviles</h2>
              <Users size={19} aria-hidden />
            </div>
            <div className="patrol-table">
              {patrols.map((patrol) => (
                <button
                  className={`patrol-row ${selectedPatrolCode === patrol.code ? "selected" : ""}`}
                  key={patrol.code}
                  type="button"
                  onClick={() => {
                    setSelectedPatrolCode(patrol.code);
                    openModule("patrols");
                  }}
                >
                  <strong>{patrol.code}</strong>
                  <span>{patrol.area}</span>
                  <em>{patrol.status}</em>
                  <small>{patrol.eta}</small>
                </button>
              ))}
            </div>
          </article>

          <article className="ops-panel">
            <div className="panel-title compact">
              <h2>Camaras</h2>
              <Video size={19} aria-hidden />
            </div>
            <div className="camera-list">
              {cameras.map((camera) => (
                <button
                  className={`camera-row ${selectedCameraName === camera.name ? "selected" : ""}`}
                  key={camera.name}
                  type="button"
                  onClick={() => {
                    setSelectedCameraName(camera.name);
                    openModule("cameras");
                  }}
                >
                  <div>
                    <strong>{camera.name}</strong>
                    <span>{camera.zone}</span>
                  </div>
                  <div className="health-track">
                    <span style={{ width: `${camera.health}%` }} />
                  </div>
                  <small>{camera.status}</small>
                </button>
              ))}
            </div>
          </article>

          <article className="ops-panel timeline">
            <div className="panel-title compact">
              <h2>Protocolo</h2>
              <Clock3 size={19} aria-hidden />
            </div>
            <ol>
              <li>
                <CheckCircle2 size={17} aria-hidden />
                Evento clasificado por IA
              </li>
              <li>
                <CheckCircle2 size={17} aria-hidden />
                Operador COM notificado
              </li>
              <li>
                <Clock3 size={17} aria-hidden />
                Movil asignado esperando ACK
              </li>
            </ol>
          </article>
        </section>

        <section className="sales-grid" aria-label="Argumentos de contratacion">
          <article className="sales-card legal">
            <Gavel size={21} aria-hidden />
            <div>
              <h2>Trazabilidad legal nativa</h2>
              <p>
                Cada accion sensible queda con usuario, tenant, timestamp y hash encadenado para auditoria.
              </p>
            </div>
          </article>
          <article className="sales-card">
            <FileText size={21} aria-hidden />
            <div>
              <h2>Reporte para licitacion</h2>
              <p>
                Arquitectura, soberania de datos, alcance piloto, modulos y cumplimiento documentados.
              </p>
            </div>
          </article>
          <article className="sales-card">
            <Shield size={21} aria-hidden />
            <div>
              <h2>Implementacion local</h2>
              <p>
                Producto de Nativos, soporte en Catamarca y despliegue preparado para infraestructura soberana.
              </p>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

function toEventRow(event: ApiEvent) {
  const type = formatEventType(event.type);
  return {
    id: event.id,
    type,
    zone: event.cameraName ?? "Sin camara asignada",
    source: event.status,
    severity: event.severity,
    time: formatRelativeTime(event.detectedAt),
    icon: event.type === "FIRE_HOTSPOT" ? Flame : event.type === "LICENSE_PLATE" ? Camera : Siren,
    status: formatEventStatus(event.status)
  };
}

function toCameraRow(camera: ApiCamera) {
  return {
    id: camera.id,
    name: camera.externalId,
    zone: camera.zone ?? camera.name,
    status: formatCameraStatus(camera.status),
    health: camera.health,
    aiEnabled: camera.capabilities.includes("VISION_AI") || camera.status === "ONLINE",
    capabilities: camera.capabilities
  };
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    WEAPON: "Arma detectada",
    FIGHT: "Pelea detectada",
    FALL: "Caida detectada",
    LICENSE_PLATE: "Patente con pedido",
    PANIC_BUTTON: "Boton de panico",
    FIRE_HOTSPOT: "Foco de calor",
    TRAFFIC_INCIDENT: "Incidente vial"
  };

  return labels[type] ?? type.replaceAll("_", " ").toLowerCase();
}

function formatCameraStatus(status: string): string {
  const labels: Record<string, string> = {
    ONLINE: "IA activa",
    OFFLINE: "Offline",
    DEGRADED: "Degradada",
    MAINTENANCE: "Mantenimiento"
  };

  return labels[status] ?? status;
}

function formatEventStatus(status: string): EventUiStatus {
  const labels: Record<string, EventUiStatus> = {
    NEW: "Nuevo",
    ACKNOWLEDGED: "ACK",
    DISPATCHED: "Despachado",
    RESOLVED: "Cerrado"
  };

  return labels[status] ?? "Nuevo";
}

function formatRelativeTime(value: string): string {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (diffSeconds < 60) {
    return `Hace ${diffSeconds}s`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes}m`;
  }

  return `Hace ${Math.floor(diffMinutes / 60)}h`;
}
