"use client";

import {
  Bell,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Flame,
  MapPin,
  Radio,
  Route,
  Satellite,
  Shield,
  Siren,
  Users,
  Video
} from "lucide-react";
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

const fallbackKpis = [
  { label: "Eventos activos", value: "18", trend: "+4", state: "critical" },
  { label: "Camaras online", value: "142", trend: "96%", state: "ok" },
  { label: "Tiempo ACK", value: "01:42", trend: "-18s", state: "info" },
  { label: "Moviles libres", value: "27", trend: "+3", state: "ok" }
];

const fallbackEvents = [
  {
    type: "Arma detectada",
    zone: "Av. Güemes y Vicario Segura",
    source: "Camara COM-014",
    severity: "Critico",
    time: "Hace 42s",
    icon: Siren
  },
  {
    type: "Patente con pedido",
    zone: "Ruta 38 - Acceso Sur",
    source: "LPR COM-088",
    severity: "Alto",
    time: "Hace 2m",
    icon: Camera
  },
  {
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

export default function Page() {
  const [events, setEvents] = useState(fallbackEvents);
  const [cameras, setCameras] = useState(fallbackCameras);
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null);
  const [cameraOverview, setCameraOverview] = useState<CameraOverview | null>(null);
  const [sessionState, setSessionState] = useState("Modo visual");

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
          <div className="operator-strip">
            <span className="live-dot" />
            <strong>Operativo en vivo</strong>
            <span>{sessionState}</span>
          </div>
        </header>

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
                  <article className="event-row" key={`${event.type}-${event.zone}`}>
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
      </section>
    </main>
  );
}

function toEventRow(event: ApiEvent) {
  const type = formatEventType(event.type);
  return {
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
