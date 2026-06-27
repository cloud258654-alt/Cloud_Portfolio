"use client";

import { useEffect, useState } from "react";
import { Plus, User, CheckCircle } from "lucide-react";

import { createKnowledgeRequest, listKnowledgeRequests } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface KnowledgeRequest {
  id: string;
  title: string;
  description: string | null;
  requestor_name: string;
  status: string;
  assigned_to: string | null;
  created_at: string | null;
}

export default function RequestBoard() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<KnowledgeRequest[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  const loadRequests = () => {
    setListLoading(true);
    listKnowledgeRequests()
      .then((d) => setRequests((d.data as unknown as KnowledgeRequest[]) || []))
      .catch(() => setError(t.requests.failedToLoad))
      .finally(() => setListLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createKnowledgeRequest(title, description || undefined, name || undefined);
      setTitle("");
      setDescription("");
    } catch {
      setError(t.requests.failedToSubmit);
    } finally {
      setLoading(false);
      loadRequests();
    }
  };

  const claim = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1"}/collaboration/requests/${id}/claim`, { method: "POST" });
    } catch {
      setError(t.requests.failedToClaim);
    }
    loadRequests();
  };

  return (
    <main className="shell">
      <section className="hero" style={{ marginBottom: 24 }}>
        <div>
          <p className="eyebrow">{t.requests.eyebrow}</p>
          <h1>{t.requests.title}</h1>
          <p className="lead">{t.requests.subtitle}</p>
        </div>
      </section>

      {error && <article className="panel" style={{ marginBottom: 16 }}><p className="error">{error}</p></article>}

      <article className="panel" style={{ marginBottom: 24 }}>
        <h2>{t.requests.newRequest}</h2>
        <form className="form" onSubmit={submit}>
          <div className="field">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.requests.titlePlaceholder}
            />
          </div>
          <div className="field">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.requests.descPlaceholder}
              rows={3}
            />
          </div>
          <div className="field">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.requests.namePlaceholder}
            />
          </div>
          <button className="action" type="submit" disabled={loading}>
            <Plus size={18} />
            {t.requests.submitRequest}
          </button>
        </form>
      </article>

      <section className="list">
        {listLoading && <article className="panel">{t.requests.loadingRequests}</article>}
        {!listLoading && requests.length === 0 && <article className="panel">{t.requests.noRequests}</article>}
        {requests.map((req) => (
          <article className="document-row" key={req.id}>
            <div>
              <h2>{req.title}</h2>
              {req.description && <p>{req.description}</p>}
              <div className="meta">
                <span className="pill">
                  <User size={12} style={{ marginRight: 4, display: "inline" }} />
                  {req.requestor_name}
                </span>
                <span className="pill">{req.status}</span>
                {req.created_at && <span className="pill">{req.created_at.slice(0, 10)}</span>}
              </div>
            </div>
            <button
              className="action"
              onClick={() => claim(req.id)}
              disabled={req.status !== "open"}
            >
              <CheckCircle size={16} />
              {req.status === "open" ? t.requests.claim : req.status === "in_progress" ? t.requests.inProgress : t.requests.done}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
