"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { listExperiences } from "@/lib/api";
import type { ExperienceRecord } from "@/types/api";

export default function ExperiencePage() {
  const [items, setItems] = useState<ExperienceRecord[]>([]);

  useEffect(() => {
    listExperiences()
      .then((response) => setItems(response.data))
      .catch(() => setItems([]));
  }, []);

  return (
    <main className="shell">
      <section className="toolbar">
        <div>
          <p className="eyebrow">Experience Transfer</p>
          <h1>Experience Library</h1>
        </div>
        <Link className="action" href="/experience/upload">
          <Upload size={18} />
          Upload
        </Link>
      </section>

      <section className="list">
        {items.length === 0 ? <article className="panel">No experience records yet</article> : null}
        {items.map((item) => (
          <article className="document-row" key={item.id}>
            <div>
              <h2>{item.title}</h2>
              <p>{item.summary ?? "Transcript and summary pending"}</p>
              <div className="meta">
                <span className="pill">{item.status}</span>
                <span className="pill">{item.source_type ?? "experience"}</span>
                <span className="pill">{item.expert_name ?? "Unknown expert"}</span>
              </div>
            </div>
            <Link className="link-button" href={`/experience/${item.id}`}>
              Detail
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
