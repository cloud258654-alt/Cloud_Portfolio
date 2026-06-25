"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { uploadExperience } from "@/lib/api";

export default function ExperienceUploadPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await uploadExperience(new FormData(event.currentTarget));
      event.currentTarget.reset();
      setMessage("Experience uploaded");
    } catch {
      setMessage("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Experience Transfer</p>
          <h1>Upload Interview</h1>
          <p className="lead">Upload audio or video for transcript, summary, FAQ, and knowledge package extraction.</p>
        </div>
      </section>

      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Audio or Video</span>
            <input name="file" type="file" accept=".mp3,.wav,.mp4,.mov,.m4a" required />
          </label>
          <label className="field">
            <span>Title</span>
            <input name="title" placeholder="Interview title" required />
          </label>
          <label className="field">
            <span>Expert</span>
            <input name="expert_name" placeholder="Expert name" />
          </label>
          <label className="field">
            <span>Category</span>
            <input name="category" placeholder="Operations, PM, Engineering" />
          </label>
          <button className="action" type="submit" disabled={loading}>
            {loading ? "Uploading" : "Upload"}
          </button>
          {message ? <p>{message}</p> : null}
        </form>
      </section>
    </main>
  );
}
