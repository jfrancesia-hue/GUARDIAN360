"use client";

import { Shield, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const DEMO_TENANT = "catamarca-provincia";
const DEMO_EMAIL = "admin@catamarca.gob.ar";
const DEMO_PASSWORD = "Guardian360!2026";

export default function LoginPage() {
  const [tenantSlug, setTenantSlug] = useState(DEMO_TENANT);
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedTenant = tenantSlug.trim();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug: normalizedTenant, email: normalizedEmail, password })
      });

      if (!response.ok) {
        throw new Error("No pudimos iniciar sesion con esos datos.");
      }

      const payload = (await response.json()) as {
        accessToken: string;
        refreshToken: string;
        user: { fullName: string; role: string };
      };

      window.localStorage.setItem("guardian360.accessToken", payload.accessToken);
      window.localStorage.setItem("guardian360.refreshToken", payload.refreshToken);
      window.localStorage.setItem("guardian360.user", JSON.stringify(payload.user));
      window.localStorage.removeItem("guardian360.demoSession");
      window.location.href = "/dashboard";
    } catch (loginError) {
      if (
        normalizedTenant === DEMO_TENANT &&
        normalizedEmail === DEMO_EMAIL &&
        password === DEMO_PASSWORD
      ) {
        window.localStorage.removeItem("guardian360.accessToken");
        window.localStorage.removeItem("guardian360.refreshToken");
        window.localStorage.setItem("guardian360.demoSession", "true");
        window.localStorage.setItem(
          "guardian360.user",
          JSON.stringify({ fullName: "Admin Catamarca", role: "TENANT_ADMIN" })
        );
        window.location.href = "/dashboard";
        return;
      }

      setError(
        loginError instanceof Error
          ? `${loginError.message} Si estas en local, usa la clave demo exacta o levanta la API en 3001.`
          : "No pudimos iniciar sesion."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-brand">
          <Shield size={34} aria-hidden />
          <div>
            <p className="eyebrow">Guardian360</p>
            <h1>Acceso operativo</h1>
          </div>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Tenant
            <input value={tenantSlug} onChange={(event) => setTenantSlug(event.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Contrasena
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Guardian360!2026"
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <button disabled={loading} type="submit">
            <LogIn size={18} aria-hidden />
            {loading ? "Validando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}
