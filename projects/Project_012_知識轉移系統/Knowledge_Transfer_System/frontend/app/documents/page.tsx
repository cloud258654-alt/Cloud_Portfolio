"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { listDocuments } from "@/lib/api";
import type { DocumentItem } from "@/types/api";

export default function DocumentsPage() {
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
      <section className="toolbar">
        <div>
          <p className="eyebrow">Document Center</p>
          <h1>Documents</h1>
        </div>
        <Link className="action" href="/documents/upload">
          <Upload size={18} />
          Upload
        </Link>
      </section>

      <section className="list">
        {loading ? <article className="panel">Loading documents</article> : null}
        {!loading && documents.length === 0 ? <article className="panel">No documents yet</article> : null}
        {documents.map((document) => (
          <article className="document-row" key={document.id}>
            <div>
              <h2>{document.title}</h2>
              <p>{document.description ?? "No description"}</p>
              <div className="meta">
                <span className="pill">{document.status}</span>
                <span className="pill">{document.current_version}</span>
                <span className="pill">{document.file_type ?? "file"}</span>
              </div>
            </div>
            <Link className="link-button" href={`/documents/${document.id}`}>
              Detail
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
