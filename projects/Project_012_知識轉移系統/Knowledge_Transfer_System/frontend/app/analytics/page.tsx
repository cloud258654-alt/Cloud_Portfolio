"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, FileText, MessageSquare, Star } from "lucide-react";

import { getAnalyticsSummary, getDepartmentAnalytics, getKnowledgeGaps } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const COLORS = ["#2E7D32", "#90CAF9", "#F9A825", "#E53935", "#42A5F5"];

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [gaps, setGaps] = useState<Record<string, any>>({});
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getAnalyticsSummary(),
      getKnowledgeGaps(),
      getDepartmentAnalytics(),
    ])
      .then(([s, g, d]) => {
        setSummary(s.data || {});
        setGaps((g.data as any)?.gap_summary || {});
        setDepartments(d.data || []);
      })
      .catch(() => setError(t.analytics.failedToLoad))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="shell">
        <h1>{t.analytics.title}</h1>
        <div className="panel">{t.common.loading}</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="shell">
        <h1>{t.analytics.title}</h1>
        <div className="panel"><p className="error">{error}</p></div>
      </main>
    );
  }

  const deptData = departments.slice(0, 8).map((d: any) => ({
    name: d.department_id?.slice(0, 8) || "N/A",
    documents: d.document_count,
  }));

  return (
    <main className="shell">
      <section className="hero" style={{ marginBottom: 24 }}>
        <div>
          <p className="eyebrow">{t.analytics.eyebrow}</p>
          <h1>{t.analytics.title}</h1>
          <p className="lead">{t.analytics.subtitle}</p>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FileText size={20} color="#2E7D32" />
            <div>
              <h2 style={{ margin: 0, fontSize: 14 }}>{t.analytics.totalDocuments}</h2>
              <strong style={{ fontSize: 28 }}>{summary.documents?.total ?? 0}</strong>
            </div>
          </div>
        </article>
        <article className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MessageSquare size={20} color="#42A5F5" />
            <div>
              <h2 style={{ margin: 0, fontSize: 14 }}>{t.analytics.conversations}</h2>
              <strong style={{ fontSize: 28 }}>{summary.conversations?.total ?? 0}</strong>
            </div>
          </div>
        </article>
        <article className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Star size={20} color="#F9A825" />
            <div>
              <h2 style={{ margin: 0, fontSize: 14 }}>{t.analytics.avgRating}</h2>
              <strong style={{ fontSize: 28 }}>{summary.feedback?.average_rating ?? "N/A"}</strong>
            </div>
          </div>
        </article>
        <article className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <TrendingUp size={20} color="#E53935" />
            <div>
              <h2 style={{ margin: 0, fontSize: 14 }}>{t.analytics.totalCitations}</h2>
              <strong style={{ fontSize: 28 }}>{summary.citations?.total ?? 0}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="grid" style={{ marginTop: 24 }}>
        <article className="panel">
          <h2>{t.analytics.documentsByDept}</h2>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="documents" fill="#2E7D32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted">{t.analytics.noDeptData}</p>
          )}
        </article>

        <article className="panel">
          <h2>{t.analytics.knowledgeGaps}</h2>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 12 }}>
            {gaps.recommendation || "No significant gaps detected."}
          </p>
          {gaps.top_gaps?.length > 0 && (
            <ul className="services">
              {gaps.top_gaps.map((gap: string, i: number) => (
                <li key={i}>
                  <span>{gap.slice(0, 60)}</span>
                  <span className="pill">gap</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
