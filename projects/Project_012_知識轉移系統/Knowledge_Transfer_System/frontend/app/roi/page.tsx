"use client";

import { useState } from "react";
import { Calculator, DollarSign, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function ROICalculator() {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState(100);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [searchesPerDay, setSearchesPerDay] = useState(5);
  const [minutesSaved, setMinutesSaved] = useState(3);

  const annualHoursSaved = (employees * searchesPerDay * (minutesSaved / 60) * 250).toFixed(0);
  const annualSavings = (employees * searchesPerDay * (minutesSaved / 60) * 250 * hourlyRate).toFixed(0);
  const roi = (((Number(annualSavings) - 50000) / 50000) * 100).toFixed(0);

  return (
    <main className="shell">
      <section className="hero" style={{ marginBottom: 24 }}>
        <div>
          <p className="eyebrow">{t.roi.eyebrow}</p>
          <h1>{t.roi.title}</h1>
          <p className="lead">{t.roi.subtitle}</p>
        </div>
      </section>

      <section className="grid">
        <article className="panel" style={{ gridColumn: "span 2" }}>
          <h2>{t.roi.parameters}</h2>
          <div className="form" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label>{t.roi.employees}</label>
              <input
                type="number"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label>{t.roi.hourlyRate}</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label>{t.roi.searchesPerDay}</label>
              <input
                type="number"
                value={searchesPerDay}
                onChange={(e) => setSearchesPerDay(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label>{t.roi.minutesSaved}</label>
              <input
                type="number"
                value={minutesSaved}
                onChange={(e) => setMinutesSaved(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </article>

        <article className="panel">
          <h2>{t.roi.results}</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Clock size={24} color="#2E7D32" />
              <div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{t.roi.annualHoursSaved}</div>
                <strong style={{ fontSize: 24 }}>{annualHoursSaved} hrs</strong>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <DollarSign size={24} color="#2E7D32" />
              <div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{t.roi.annualSavings}</div>
                <strong style={{ fontSize: 24 }}>${Number(annualSavings).toLocaleString()}</strong>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Calculator size={24} color="#42A5F5" />
              <div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{t.roi.estimatedRoi}</div>
                <strong style={{ fontSize: 24 }}>{roi}%</strong>
              </div>
            </div>
          </div>
        </article>
      </section>

      <article className="panel" style={{ marginTop: 16 }}>
        <h2>{t.roi.methodology}</h2>
        <p style={{ color: "#6B7280", fontSize: 14 }}>
          {t.roi.methodologyText}
        </p>
      </article>
    </main>
  );
}
