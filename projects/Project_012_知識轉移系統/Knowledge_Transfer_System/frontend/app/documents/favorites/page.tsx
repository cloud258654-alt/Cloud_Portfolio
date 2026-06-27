"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

import { listDocuments } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { DocumentItem } from "@/types/api";

export default function FavoriteDocumentsPage() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDocuments()
      .then((response) => setDocuments(response.data.items))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">{t.documents.eyebrow}</p>
          <h1>{t.documents.favorites}</h1>
          <p className="lead">{t.documents.favoritesSubtitle}</p>
        </div>
      </section>

      <article className="panel" style={{ marginBottom: 16 }}>
        <Heart size={16} style={{ display: "inline", marginRight: 8 }} />
        {t.documents.favoritesComingSoon}
      </article>

      <section className="list">
        {loading ? <article className="panel">{t.common.loading}</article> : null}
        {!loading && documents.length === 0 ? <article className="panel">{t.documents.noDocs}</article> : null}
        {documents.map((doc) => (
          <article className="document-row" key={doc.id}>
            <div>
              <h2>{doc.title}</h2>
              <p>{doc.description ?? t.documents.noDescription}</p>
              <div className="meta">
                <span className="pill">{doc.status}</span>
                <span className="pill">{doc.current_version}</span>
                <span className="pill">{doc.file_type ?? "file"}</span>
              </div>
            </div>
            <Link className="link-button" href={`/documents/${doc.id}`}>
              {t.common.detail}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
