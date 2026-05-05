"use client";

import {
  BarChart3,
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  FileText,
  Flame,
  Gavel,
  LockKeyhole,
  MapPin,
  PlayCircle,
  Radio,
  Route,
  Satellite,
  Shield,
  Siren,
  Users,
  Video
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
    icon: Siren
  },
  {
    id: "fallback-license-plate",
    type: "Patente con pedido",
    zone: "Ruta 38 - Acceso Sur",
    source: "LPR COM-088",
    severity: "Alto",
    time: "Hace 2m",
    icon: Camera
  },
  {
    id: "fallback-fire",
    type: "Foco de calor",
    zone: "Sierra de Ancasti",
    source: "SatellitePatrol",
    severity: "Medio",
    time: "Hace 7m",
    icon: Flame
  }
];

const patrols = [
  { code: "M-12", area: "Centro", status: "En ruta", eta: "04m" },
  { code: "M-07", area: "Norte", status: "Disponible", eta: "00m" },
  { code: "B-03", area: "Valle Viejo", status: "En sitio", eta: "00m" },
  { code: "M-18", area: "Sur", status: "Despachado", eta: "08m" }
];

const fallbackCameras = [
  { name: "COM-014", zone: "Centro", status: "IA activa", health: 98 },
  { name: "COM-088", zone: "Acceso Sur", status: "LPR", health: 92 },
  { name: "COM-031", zone: "Norte", status: "Degradada", health: 71 },
  { name: "COM-102", zone: "Terminal", status: "IA activa", health: 99 }
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

const demoPanicEvent: DashboardEvent = {
  id: "demo-panic-button",
  type: "Boton de panico",
  zone: "Plaza 25 de Mayo",
  source: "CiudadanoApp",
  severity: "Critico",
  time: "Ahora",
  icon: Siren
};

const visualScenes: VisualScene[] = [
  {
    title: "Comando integrado",
    label: "Centro operativo",
    detail: "Monitoreo, IA y despacho en una sola vista",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    alt: "Sala tecnologica con servidores y luces de monitoreo",
    icon: Radio
  },
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

export default function Page() {
  const [events, setEvents] = useState(fallbackEvents);
  const [cameras, setCameras] = useState(fallbackCameras);
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null);
  const [cameraOverview, setCameraOverview] = useState<CameraOverview | null>(null);
  const [sessionState, setSessionState] = useState("Modo visual");
  const [selectedTenant, setSelectedTenant] = useState<DemoTenant>(defaultTenant);
  const [demoRunning, setDemoRunning] = useState(false);
  const selectedTenantProfile: TenantProfile =
    tenantProfiles[selectedTenant] ?? tenantProfiles[defaultTenant];

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
    setEvents((currentEvents) => [
      demoPanicEvent,
      ...currentEvents.filter((event) => event.id !== demoPanicEvent.id).slice(0, 5)
    ]);
  };

  return (
    <main className="command-shell">
      <aside className="sidebar" aria-label="Navegacion principal">
        <div className="brand-mark">
          <Shield size={28} aria-hidden />
          <span>Guardian360</span>
        </div>
        <nav className="nav-stack">
          <button className="nav-item active" type="button" aria-label="Comando">
            <Radio size={20} aria-hidden />
          </button>
          <button className="nav-item" type="button" aria-label="Camaras">
            <Video size={20} aria-hidden />
          </button>
          <button className="nav-item" type="button" aria-label="Mapa">
            <MapPin size={20} aria-hidden />
          </button>
          <button className="nav-item" type="button" aria-label="Satelital">
            <Satellite size={20} aria-hidden />
          </button>
          <button className="nav-item" type="button" aria-label="Alertas">
            <Bell size={20} aria-hidden />
          </button>
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

        <section className="visual-command" aria-label="Vista visual del sistema">
          <article className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=82"
              alt="Operador trabajando con pantallas de monitoreo"
            />
            <div className="hero-visual-overlay">
              <p className="eyebrow">Demo visual vendible</p>
              <h2>Guardián360 muestra el operativo, no solo los datos</h2>
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
            {visualScenes.map((scene) => {
              const Icon = scene.icon;
              return (
                <article className="scene-card" key={scene.title}>
                  <img src={scene.image} alt={scene.alt} />
                  <div>
                    <span>
                      <Icon size={16} aria-hidden />
                      {scene.label}
                    </span>
                    <strong>{scene.title}</strong>
                    <small>{scene.detail}</small>
                  </div>
                </article>
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
              <span className="camera-pin pin-1">
                <Camera size={15} aria-hidden />
              </span>
              <span className="camera-pin pin-2">
                <Camera size={15} aria-hidden />
              </span>
              <span className="event-pin critical">
                <Siren size={18} aria-hidden />
              </span>
              <span className="event-pin warning">
                <Flame size={18} aria-hidden />
              </span>
              <span className="patrol-unit unit-1">M-12</span>
              <span className="patrol-unit unit-2">B-03</span>
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
                  <article className="event-row" key={event.id}>
                    <div className="event-icon">
                      <Icon size={18} aria-hidden />
                    </div>
                    <div>
                      <strong>{event.type}</strong>
                      <span>{event.zone}</span>
                      <small>{event.source}</small>
                    </div>
                    <time>{event.time}</time>
                  </article>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="lower-grid">
          <article className="ops-panel">
            <div className="panel-title compact">
              <h2>Moviles</h2>
              <Users size={19} aria-hidden />
            </div>
            <div className="patrol-table">
              {patrols.map((patrol) => (
                <div className="patrol-row" key={patrol.code}>
                  <strong>{patrol.code}</strong>
                  <span>{patrol.area}</span>
                  <em>{patrol.status}</em>
                  <small>{patrol.eta}</small>
                </div>
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
                <div className="camera-row" key={camera.name}>
                  <div>
                    <strong>{camera.name}</strong>
                    <span>{camera.zone}</span>
                  </div>
                  <div className="health-track">
                    <span style={{ width: `${camera.health}%` }} />
                  </div>
                  <small>{camera.status}</small>
                </div>
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
    icon: event.type === "FIRE_HOTSPOT" ? Flame : event.type === "LICENSE_PLATE" ? Camera : Siren
  };
}

function toCameraRow(camera: ApiCamera) {
  return {
    name: camera.externalId,
    zone: camera.zone ?? camera.name,
    status: formatCameraStatus(camera.status),
    health: camera.health
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
