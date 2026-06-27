"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { uploadDocument } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function DocumentUploadPage() {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const form = new FormData(event.currentTarget);
      const tags = String(form.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      form.set("tags", JSON.stringify(tags));
      await uploadDocument(form);
      setMessage(t.documents.uploadSuccess);
      event.currentTarget.reset();
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
          <p className="eyebrow">{t.documents.eyebrow}</p>
          <h1>{t.documents.uploadTitle}</h1>
          <p className="lead">{t.documents.uploadSubtitle}</p>
        </div>
      </section>

      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t.documents.fileField}</span>
            <input name="file" type="file" required />
          </label>
          <label className="field">
            <span>{t.documents.titleField}</span>
            <input name="title" placeholder="Document title" required />
          </label>
          <label className="field">
            <span>{t.documents.descriptionField}</span>
            <textarea name="description" rows={5} placeholder="Short description" />
          </label>
          <label className="field">
            <span>Category</span>
            <input name="category" placeholder="Policy, SOP, Training" />
          </label>
          <label className="field">
            <span>{t.documents.tagsField}</span>
            <input name="tags" placeholder="policy, onboarding" />
          </label>
          <button className="action" type="submit" disabled={loading}>
            {loading ? t.documents.uploading : t.documents.uploadTitle}
          </button>
          {message ? <p>{message}</p> : null}
        </form>
      </section>
    </main>
  );
}
