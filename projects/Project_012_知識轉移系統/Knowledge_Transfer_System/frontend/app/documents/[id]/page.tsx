"use client";

import { Download, Eye, RefreshCw, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getDocument, getDocumentChunks, getDocumentProcessing, reprocessDocument } from "@/lib/api";
import type { DocumentChunk, DocumentItem, ProcessingStatus } from "@/types/api";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [processing, setProcessing] = useState<ProcessingStatus | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);

  async function load() {
    if (!params.id) {
      return;
    }
    const [documentResponse, processingResponse, chunksResponse] = await Promise.all([
      getDocument(params.id),
      getDocumentProcessing(params.id),
      getDocumentChunks(params.id),
    ]);
    setDocument(documentResponse.data);
    setProcessing(processingResponse.data);
    setChunks(chunksResponse.data);
  }

  useEffect(() => {
    load().catch(() => {
      setDocument(null);
      setProcessing(null);
      setChunks([]);
    });
  }, [params.id]);

  async function handleReprocess() {
    if (!params.id) {
      return;
    }
    await reprocessDocument(params.id);
    await load();
  }

  if (!document) {
    return (
      <main className="shell">
        <article className="panel">Loading document</article>
      </main>
    );
  }

  const progress = processing?.ingestion?.progress ?? 0;

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Document Detail</p>
          <h1>{document.title}</h1>
          <p className="lead">{document.description ?? "No description"}</p>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Metadata</h2>
          <p>Status: <strong>{document.status}</strong></p>
          <p>Version: <strong>{document.current_version}</strong></p>
          <p>Scope: <strong>{document.permission_scope}</strong></p>
          <p>Classification: <strong>{document.classification}</strong></p>
        </article>

        <article className="panel">
          <h2>Processing</h2>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
          <p>Stage: <strong>{processing?.ingestion?.stage ?? "not_started"}</strong></p>
          <p>Progress: <strong>{progress}%</strong></p>
          <p>Chunks: <strong>{processing?.chunk_count ?? 0}</strong></p>
          <p>Embedding: <strong>{processing?.embedding_status ?? "not_started"}</strong></p>
          <p>Language: <strong>{processing?.language ?? "unknown"}</strong></p>
          <button className="action" type="button" onClick={handleReprocess}>
            <RefreshCw size={18} />
            Reprocess
          </button>
        </article>

        <article className="panel">
          <h2>Actions</h2>
          <button className="action" type="button"><Eye size={18} />Preview</button>
          <button className="action" type="button"><Download size={18} />Download</button>
          <button className="action" type="button"><Star size={18} />Favorite</button>
        </article>
      </section>

      <section className="grid" style={{ marginTop: 16 }}>
        <article className="panel">
          <h2>Summary</h2>
          <p>{processing?.summary ?? "No extracted summary yet"}</p>
        </article>
        <article className="panel">
          <h2>Chunks</h2>
          <div className="chunk-list">
            {chunks.length === 0 ? <p>No chunks yet</p> : null}
            {chunks.map((chunk) => (
              <div className="chunk" key={chunk.id}>
                <strong>Chunk {chunk.chunk_index + 1}</strong>
                <p>{chunk.content.slice(0, 180)}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <h2>Activity</h2>
          <p>Parser, OCR, chunk, embedding, retry, and processing time events are tracked by the backend pipeline.</p>
        </article>
      </section>
    </main>
  );
}
