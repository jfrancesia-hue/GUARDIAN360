import {
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  CircleAlert,
  FileText,
  Gavel,
  LockKeyhole,
  MapPin,
  Radio,
  Route,
  Satellite,
  Shield,
  Smartphone,
  Users,
  Video
} from "lucide-react";
import Link from "next/link";

const publicModules = [
  {
    title: "Centro operativo",
    detail: "Sala de situacion para visualizar eventos, camaras, moviles y protocolos en un mismo tablero.",
    icon: Radio
  },
  {
    title: "VisionAI",
    detail: "Analitica para convertir fuentes de video en incidentes accionables y auditables.",
    icon: Camera
  },
  {
    title: "SatellitePatrol",
    detail: "Cobertura territorial para zonas rurales, focos de calor y areas fuera del anillo urbano.",
    icon: Satellite
  },
  {
    title: "Evidencia",
    detail: "Expediente digital con hash, cadena de custodia y trazabilidad por usuario.",
    icon: LockKeyhole
  }
];

const workflow = [
  { title: "Deteccion", detail: "Camara, app ciudadana o capa territorial genera una senal.", icon: Bell },
  { title: "Validacion", detail: "El operador confirma, descarta o escala con registro legal.", icon: CheckCircle2 },
  { title: "Respuesta", detail: "Se despacha una unidad, se controla ETA y se marca arribo.", icon: Route },
  { title: "Cierre", detail: "El caso queda con evidencia, reporte y auditoria completa.", icon: FileText }
];

const appSurfaces = [
  {
    title: "App ciudadana",
    detail: "Boton de panico, reporte geolocalizado, estado del caso y canal de seguimiento.",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "App agente",
    detail: "Eventos asignados, ruta al incidente, arribo, evidencia movil y cierre de intervencion.",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80"
  }
];

export default function HomePage() {
  return (
    <main className="public-shell">
      <header className="public-nav">
        <Link className="public-brand" href="/" aria-label="Inicio Guardian360">
          <Shield size={28} aria-hidden />
          <span>Guardian360</span>
        </Link>
        <nav aria-label="Accesos principales">
          <Link href="#plataforma">Plataforma</Link>
          <Link href="#flujo">Flujo</Link>
          <Link href="#apps">Apps</Link>
          <Link className="nav-login" href="/login">Ingresar</Link>
        </nav>
      </header>

      <section className="public-hero">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2100&q=86"
          alt="Puesto de monitoreo con pantallas operativas"
        />
        <div className="public-hero-content">
          <p className="eyebrow">Seguridad ciudadana e inteligencia urbana</p>
          <h1>Una vista ilustrativa de como opera Guardian360 en territorio</h1>
          <p>
            La plataforma se organiza como un sistema operativo de seguridad: senales, operadores,
            recursos moviles, evidencia y reportes conectados por trazabilidad.
          </p>
          <div className="public-actions">
            <Link className="primary-link" href="/dashboard">Abrir centro operativo</Link>
            <Link className="secondary-link" href="/login">Acceso institucional</Link>
          </div>
        </div>
      </section>

      <section className="public-band" id="plataforma" aria-label="Modulos de plataforma">
        <div className="public-section-title">
          <p className="eyebrow">Plataforma</p>
          <h2>Modulos con objetivo operativo claro</h2>
        </div>
        <div className="public-module-grid">
          {publicModules.map((module) => {
            const Icon = module.icon;
            return (
              <article className="public-module" key={module.title}>
                <Icon size={24} aria-hidden />
                <h3>{module.title}</h3>
                <p>{module.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="public-split" id="flujo" aria-label="Flujo operativo">
        <div className="public-map-visual">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=82"
            alt="Mapa urbano con referencias geograficas"
          />
          <span className="public-pin public-pin-event">
            <CircleAlert size={18} aria-hidden />
            Evento
          </span>
          <span className="public-pin public-pin-camera">
            <Video size={18} aria-hidden />
            Camara
          </span>
          <span className="public-pin public-pin-unit">
            <Users size={18} aria-hidden />
            Movil
          </span>
          <span className="public-pin public-pin-zone">
            <MapPin size={18} aria-hidden />
            AOI
          </span>
        </div>
        <div className="public-flow">
          <p className="eyebrow">Flujo de intervencion</p>
          <h2>Del incidente al cierre sin perder trazabilidad</h2>
          <div className="public-flow-list">
            {workflow.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title}>
                  <span>
                    <Icon size={18} aria-hidden />
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-band" id="apps" aria-label="Aplicaciones moviles">
        <div className="public-section-title">
          <p className="eyebrow">Superficies moviles</p>
          <h2>Apps pensadas para campo y ciudadania</h2>
        </div>
        <div className="public-app-grid">
          {appSurfaces.map((surface) => (
            <article className="public-app" key={surface.title}>
              <img src={surface.image} alt={surface.title} />
              <div>
                <Smartphone size={22} aria-hidden />
                <h3>{surface.title}</h3>
                <p>{surface.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="public-architecture" aria-label="Arquitectura institucional">
        <div>
          <p className="eyebrow">Arquitectura</p>
          <h2>Dashboard, backend, auditoria y apps bajo un mismo modelo de datos</h2>
        </div>
        <div className="architecture-lane">
          <span><Building2 size={18} aria-hidden /> Multi tenant</span>
          <span><Shield size={18} aria-hidden /> Autenticacion</span>
          <span><Gavel size={18} aria-hidden /> Auditoria</span>
          <span><FileText size={18} aria-hidden /> Reportes</span>
        </div>
      </section>
    </main>
  );
}
