"use client";

import { useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";

import { getHealthStatus } from "@/lib/api";
import type { HealthResponse } from "@/types/api";

const initialState: HealthResponse = {
  success: true,
  data: {
    status: "ok",
    services: {
      postgres: "configured",
      redis: "configured",
      minio: "configured",
    },
  },
  message: "system healthy",
};

export default function Home() {
  const [health, setHealth] = useState<HealthResponse>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      setHealth(await getHealthStatus());
    } catch {
      setError("Health check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Sprint 00</p>
          <h1>AI Knowledge Transfer System</h1>
          <p className="lead">Project foundation is live and ready for the next sprint.</p>
        </div>
        <button className="action" onClick={checkHealth} disabled={loading}>
          {loading ? <RefreshCw className="icon spin" size={18} /> : <CheckCircle2 className="icon" size={18} />}
          {loading ? "Checking" : "Check Health"}
        </button>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>System Status</h2>
          <div className={`status ${health.data.status}`}>{health.data.status}</div>
          <p>{health.message}</p>
          {error ? <p className="error">{error}</p> : null}
        </article>

        <article className="panel">
          <h2>Services</h2>
          <ul className="services">
            {Object.entries(health.data.services).map(([name, value]) => (
              <li key={name}>
                <span>{name}</span>
                <strong>{value}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Backend</h2>
          <p>API: <code>http://localhost:8000/api/v1/admin/health</code></p>
          <p>Docs: <code>http://localhost:8000/docs</code></p>
        </article>
      </section>
    </main>
  );
}
