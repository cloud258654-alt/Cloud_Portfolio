"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";

import { getHealthStatus } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { HealthResponse } from "@/types/api";

const initialState: HealthResponse = {
  success: true,
  data: {
    status: "ok",
    services: {
      postgres: "unchecked",
      redis: "unchecked",
      minio: "unchecked",
    },
  },
  message: "system healthy",
};

export default function Home() {
  const { t, lang } = useTranslation();
  const [health, setHealth] = useState<HealthResponse>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      setHealth(await getHealthStatus());
    } catch {
      setError(t.home.healthCheckFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1>{t.home.title}</h1>
          <p className="lead">{t.home.subtitle}</p>
        </div>
        <button className="action" onClick={checkHealth} disabled={loading}>
          {loading ? <RefreshCw className="icon spin" size={18} /> : <CheckCircle2 className="icon" size={18} />}
          {loading ? t.home.checking : t.home.checkHealth}
        </button>
      </section>

      {loading && !error && (<p style={{ color: "#6B7280", marginBottom: 16 }}>{t.home.connecting}</p>)}

      <section className="grid">
        <article className="panel">
          <h2>{t.home.systemStatus}</h2>
          <div className={`status ${health.data.status}`}>{health.data.status}</div>
          <p>{health.message}</p>
          {error ? <p className="error">{error}</p> : null}
        </article>

        <article className="panel">
          <h2>{t.home.services}</h2>
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
          <h2>{t.home.backend}</h2>
          <p>{t.home.api}: <code>http://localhost:8000/api/v1/admin/health</code></p>
          <p>{t.home.docs}: <code>http://localhost:8000/docs</code></p>
        </article>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>
          {lang === "zh" ? "新進員工快速入門" : "New Employee Quick Start"}
        </h2>
        <div className="grid">
          <article className="panel">
            <h3>{lang === "zh" ? "1. 搜尋 SOP" : "1. Search SOP"}</h3>
            <p style={{ color: "#6B7280", fontSize: 14 }}>
              {lang === "zh"
                ? "到 AI 問答頁面，輸入您遇到的問題。例如：客人要求退換貨怎麼處理？"
                : "Go to AI Chat and ask your question. E.g., How to handle a return request?"}
            </p>
          </article>
          <article className="panel">
            <h3>{lang === "zh" ? "2. 查閱文件" : "2. Browse Docs"}</h3>
            <p style={{ color: "#6B7280", fontSize: 14 }}>
              {lang === "zh"
                ? "到文件中心瀏覽所有操作手冊、SOP、疑難雜症整理。"
                : "Browse all manuals, SOPs, and troubleshooting guides in Documents."}
            </p>
          </article>
          <article className="panel">
            <h3>{lang === "zh" ? "3. 學習測驗" : "3. Learn & Test"}</h3>
            <p style={{ color: "#6B7280", fontSize: 14 }}>
              {lang === "zh"
                ? "閱讀文件後，到學習確認頁面進行測驗，驗證您的理解。"
                : "Take a quiz after reading to verify your understanding."}
            </p>
          </article>
        </div>
        <article className="panel" style={{ marginTop: 16 }}>
          <h3>{lang === "zh" ? "常見問題快速查詢" : "Quick Reference"}</h3>
          <div className="suggestions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              lang === "zh" ? "如何處理客人客訴？" : "How to handle customer complaints?",
              lang === "zh" ? "退換貨的標準流程？" : "Return & exchange SOP?",
              lang === "zh" ? "遇到緊急狀況該怎麼通報？" : "Emergency reporting procedure?",
              lang === "zh" ? "新進員工的培訓計畫？" : "New hire training plan?",
              lang === "zh" ? "營業額結算的 SOP？" : "End-of-day settlement SOP?",
              lang === "zh" ? "食品安全檢查流程？" : "Food safety inspection process?",
            ].map((q) => (
              <button
                key={q}
                type="button"
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  background: "#FAFAF8",
                  cursor: "pointer",
                  fontSize: 13,
                  textAlign: "left",
                }}
                onClick={() => {
                  window.location.href = "/chat";
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
