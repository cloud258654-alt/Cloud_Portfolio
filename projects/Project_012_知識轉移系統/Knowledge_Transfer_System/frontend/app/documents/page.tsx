"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { listDocuments } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { DocumentItem } from "@/types/api";

export default function DocumentsPage() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listDocuments()
      .then((response) => setDocuments(response.data.items))
      .catch(() => setError(t.documents.backendUnreachable))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="shell">
      <section className="toolbar">
        <div>
          <p className="eyebrow">{t.documents.eyebrow}</p>
          <h1>{t.documents.title}</h1>
        </div>
        <Link className="action" href="/documents/upload">
          <Upload size={18} />
          {t.documents.uploadBtn}
        </Link>
      </section>

      <section className="list">
        {loading ? <article className="panel">{t.common.loading}</article> : null}
        {error ? <article className="panel"><p className="error">{error}</p></article> : null}
        {!loading && !error && documents.length === 0 ? <article className="panel">{t.documents.noDocs}</article> : null}
        {documents.map((document) => (
          <article className="document-row" key={document.id}>
            <div>
              <h2>{document.title}</h2>
              <p>{document.description ?? t.documents.noDescription}</p>
              <div className="meta">
                <span className="pill">{document.status}</span>
                <span className="pill">{document.current_version}</span>
                <span className="pill">{document.file_type ?? "file"}</span>
              </div>
            </div>
            <Link className="link-button" href={`/documents/${document.id}`}>
              {t.common.detail}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
