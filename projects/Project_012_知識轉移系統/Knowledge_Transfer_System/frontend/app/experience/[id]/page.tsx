"use client";

import { Check, RefreshCw, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getExperience,
  getExperiencePackage,
  getExperienceSegments,
  processExperience,
  reviewExperience,
} from "@/lib/api";
import type { ExperiencePackage, ExperienceRecord, ExperienceSegment } from "@/types/api";

export default function ExperienceDetailPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<ExperienceRecord | null>(null);
  const [segments, setSegments] = useState<ExperienceSegment[]>([]);
  const [pkg, setPkg] = useState<ExperiencePackage | null>(null);

  async function load() {
    const [recordResponse, segmentResponse, packageResponse] = await Promise.all([
      getExperience(params.id),
      getExperienceSegments(params.id),
      getExperiencePackage(params.id),
    ]);
    setRecord(recordResponse.data);
    setSegments(segmentResponse.data);
    setPkg(packageResponse.data);
  }

  useEffect(() => {
    if (params.id) {
      load().catch(() => {
        setRecord(null);
        setSegments([]);
        setPkg(null);
      });
    }
  }, [params.id]);

  async function process() {
    await processExperience(params.id);
    await load();
  }

  async function review(action: "approve" | "reject") {
    await reviewExperience(params.id, action);
    await load();
  }

  if (!record) {
    return <main className="shell"><article className="panel">Loading experience</article></main>;
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Experience Detail</p>
          <h1>{record.title}</h1>
          <p className="lead">{record.summary ?? "Summary pending"}</p>
        </div>
      </section>

      <section className="grid">
        <article className="panel media-box">
          <h2>Media</h2>
          <p>Status: <strong>{record.status}</strong></p>
          <p>Expert: <strong>{record.expert_name ?? "Unknown"}</strong></p>
          <button className="action" type="button" onClick={process}>
            <RefreshCw size={18} />
            Process
          </button>
          <button className="action" type="button" onClick={() => review("approve")}>
            <Check size={18} />
            Approve
          </button>
          <button className="action" type="button" onClick={() => review("reject")}>
            <X size={18} />
            Reject
          </button>
        </article>

        <article className="panel">
          <h2>Summary</h2>
          <p>{record.summary ?? "No summary yet"}</p>
        </article>

        <article className="panel">
          <h2>FAQ</h2>
          {pkg?.faq?.length ? pkg.faq.map((item, index) => (
            <div className="citation" key={index}>
              <strong>{String(item.question ?? "Question")}</strong>
              <p>{String(item.answer ?? "")}</p>
            </div>
          )) : <p>No FAQ yet</p>}
        </article>
      </section>

      <section className="grid" style={{ marginTop: 16 }}>
        <article className="panel">
          <h2>Transcript Timeline</h2>
          <div className="timeline">
            {segments.length === 0 ? <p>No transcript segments yet</p> : null}
            {segments.map((segment) => (
              <div className="timeline-item" key={segment.id}>
                <strong>{segment.speaker ?? "Speaker"}</strong>
                <p>{segment.start_time?.toFixed(1) ?? "0.0"}s - {segment.end_time?.toFixed(1) ?? "0.0"}s</p>
                <p>{segment.text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Best Practices</h2>
          {pkg?.best_practices?.length ? pkg.best_practices.map((item, index) => (
            <div className="citation" key={index}>
              <strong>{String(item.title ?? "Best Practice")}</strong>
              <p>{String(item.content ?? "")}</p>
            </div>
          )) : <p>No best practices yet</p>}
        </article>

        <article className="panel">
          <h2>Knowledge Package</h2>
          <p>Keywords: {pkg?.keywords?.join(", ") || "pending"}</p>
          <p>Tags: {pkg?.tags?.join(", ") || "pending"}</p>
          <p>Related Documents: {pkg?.related_documents?.length ?? 0}</p>
        </article>
      </section>
    </main>
  );
}
