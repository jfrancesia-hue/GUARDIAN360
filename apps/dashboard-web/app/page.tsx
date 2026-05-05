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
  image: string;
  alt: string;
  icon: LucideIcon;
}

type ModuleId = "command" | "events" | "cameras" | "map" | "patrols" | "evidence" | "reports" | "audit";

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

const moduleSummaries: Record<ModuleId, string> = {
  command: "Vista ejecutiva y operativa en vivo",
  events: "ACK, despacho y cierre de incidentes",
  cameras: "Salud, IA y detalle de camaras",
  map: "Capas, pins y zonas tacticas",
  patrols: "Asignacion de moviles y ETAs",
  evidence: "Hash, cadena de custodia y archivos",
  reports: "PDF ejecutivo, licitacion y metricas",
  audit: "Trazabilidad legal por usuario"
};

const generalFunctions: Array<[string, string]> = [
  ["Generar reporte ejecutivo", "PDF para reunion"],
  ["Cadena de custodia", "Hash y usuario"],
  ["Exportar licitacion", "Arquitectura + alcance"],
  ["Revisar auditoria", "Acciones sensibles"]
];

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

const defaultVisualScene: VisualScene = {
  title: "Comando integrado",
  label: "Centro operativo",
  detail: "Monitoreo, IA y despacho en una sola vista",
  image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=84",
  alt: "Operador trabajando con pantallas de monitoreo",
  icon: Radio
};

const visualScenes: VisualScene[] = [
  defaultVisualScene,
  {
    title: "Camara urbana",
    label: "VisionAI",
    detail: "Deteccion priorizada para operadores",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
    alt: "Ciudad iluminada de noche vista desde altura",
    icon: Camera
  },
  {
    title: "Cobertura satelital",
    label: "SatellitePatrol",
    detail: "Focos de calor y zonas rurales",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    alt: "Vista de la Tierra desde el espacio",
    icon: Satellite
  }
];

async function patchApi<TResponse>(
  path: string,
  body: Record<string, unknown> = {}
): Promise<TResponse | null> {
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
  const [selectedVisualScene, setSelectedVisualScene] = useState(0);
  const [activeModule, setActiveModule] = useState<ModuleId>("command");
  const [selectedEventId, setSelectedEventId] = useState(fallbackEvents[0]?.id ?? demoPanicEvent.id);
  const [selectedCameraName, setSelectedCameraName] = useState(fallbackCameras[0]?.name ?? "COM-000");
  const [selectedPatrolCode, setSelectedPatrolCode] = useState(fallbackPatrols[0]?.code ?? "M-00");
  const [selectedMapLayer, setSelectedMapLayer] = useState("Eventos + camaras");
  const selectedTenantProfile: TenantProfile =
    tenantProfiles[selectedTenant] ?? tenantProfiles[defaultTenant];
  const activeVisualScene = visualScenes[selectedVisualScene] ?? defaultVisualScene;
  const selectedEvent: DashboardEvent =
    events.find((event) => event.id === selectedEventId) ?? fallbackEvents[0] ?? demoPanicEvent;
  const selectedCamera: DashboardCamera =
    cameras.find((camera) => camera.name === selectedCameraName) ??
    fallbackCameras[0] ?? { name: "COM-000", zone: "Sin zona", status: "Offline", health: 0, aiEnabled: false };
  const selectedPatrol: Patrol =
    patrols.find((patrol) => patrol.code === selectedPatrolCode) ??
    fallbackPatrols[0] ?? { code: "M-00", area: "Sin area", status: "No disponible", eta: "--" };

  useEffect(() => {
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

        <section className="active-module-panel" aria-label="Modulo activo">
          <div>
            <p className="eyebrow">{activeModule}</p>
            <h2>{moduleNav.find((module) => module.id === activeModule)?.label}</h2>
            <span>{moduleSummaries[activeModule]}</span>
          </div>
          <div className="module-actions">
            <button type="button" onClick={() => centerMapOn(selectedEvent?.zone ?? "evento critico")}>
              <MapPin size={16} aria-hidden />
              Centrar mapa
            </button>
            <button type="button" onClick={() => window.print()}>
              <Download size={16} aria-hidden />
              Exportar
            </button>
          </div>
        </section>

        <section className="visual-command" aria-label="Vista visual del sistema">
          <article className="hero-visual">
            <img src={activeVisualScene.image} alt={activeVisualScene.alt} />
            <div className="holo-stage" aria-hidden="true">
              <span className="holo-ring" />
              <span className="holo-node node-camera">
                <Camera size={20} />
                <small>VisionAI</small>
              </span>
              <span className="holo-node node-dispatch">
                <Route size={20} />
                <small>Despacho</small>
              </span>
              <span className="holo-node node-satellite">
                <Satellite size={20} />
                <small>Satelite</small>
              </span>
              <span className="holo-node node-evidence">
                <LockKeyhole size={20} />
                <small>Evidencia</small>
              </span>
            </div>
            <div className="hero-visual-overlay">
              <p className="eyebrow">{activeVisualScene.label}</p>
              <h2>Guardian360 se ve como un centro de comando real</h2>
              <div className="hero-signal-grid">
                <span>
                  <strong>18</strong>
                  eventos activos
                </span>
                <span>
                  <strong>142</strong>
                  camaras conectadas
                </span>
                <span>
                  <strong>04m</strong>
                  movil en ruta
                </span>
              </div>
            </div>
          </article>

          <div className="scene-strip">
            {visualScenes.map((scene, index) => {
              const Icon = scene.icon;
              return (
                <button
                  className={`scene-card ${index === selectedVisualScene ? "active" : ""}`}
                  key={scene.title}
                  type="button"
                  onClick={() => setSelectedVisualScene(index)}
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
              <button type="button" onClick={() => toggleCameraAi(selectedCamera.name)}>
                {selectedCamera.aiEnabled ? <XCircle size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                {selectedCamera.aiEnabled ? "Pausar IA" : "Activar IA"}
              </button>
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
                {generalFunctions.map(([title, detail]) => (
                  <button key={title} type="button" onClick={() => setSessionState(title)}>
                    <span>{title}</span>
                    <small>{detail}</small>
                  </button>
                ))}
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
