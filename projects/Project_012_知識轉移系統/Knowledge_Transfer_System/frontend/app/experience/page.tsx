"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { listExperiences } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { ExperienceRecord } from "@/types/api";

export default function ExperiencePage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ExperienceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listExperiences()
      .then((response) => setItems(response.data))
      .catch(() => setError(t.experience.backendUnreachable))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="shell">
      <section className="toolbar">
        <div>
          <p className="eyebrow">{t.experience.eyebrow}</p>
          <h1>{t.experience.title}</h1>
        </div>
        <Link className="action" href="/experience/upload">
          <Upload size={18} />
          {t.experience.uploadBtn}
        </Link>
      </section>

      <section className="list">
        {loading ? <article className="panel">{t.common.loading}</article> : null}
        {error ? <article className="panel"><p className="error">{error}</p></article> : null}
        {!loading && !error && items.length === 0 ? <article className="panel">{t.experience.noRecords}</article> : null}
        {items.map((item) => (
          <article className="document-row" key={item.id}>
            <div>
              <h2>{item.title}</h2>
              <p>{item.summary ?? t.experience.transcriptPending}</p>
              <div className="meta">
                <span className="pill">{item.status}</span>
                <span className="pill">{item.source_type ?? "experience"}</span>
                <span className="pill">{item.expert_name ?? t.experience.unknownExpert}</span>
              </div>
            </div>
            <Link className="link-button" href={`/experience/${item.id}`}>
              {t.common.detail}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
