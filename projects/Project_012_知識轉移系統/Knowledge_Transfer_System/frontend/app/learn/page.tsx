"use client";

import { useState } from "react";
import { Brain, CheckCircle, XCircle, RotateCcw } from "lucide-react";

import { getDocument, getDocumentChunks, generateQuiz, gradeQuiz } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function LearnConfirm() {
  const { t } = useTranslation();
  const [documentId, setDocumentId] = useState("");
  const [quiz, setQuiz] = useState<any[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDocument = async () => {
    if (!documentId) return;
    setLoading(true);
    setError("");
    try {
      const docRes = await getDocument(documentId);
      const doc = docRes.data;

      const chunkRes = await getDocumentChunks(documentId);
      const chunks = chunkRes.data || [];
      const text = (Array.isArray(chunks) ? chunks.map((c: any) => c.content).join("\n") : "") || doc.title;

      const quizRes = await generateQuiz(text, (doc as any).title || "Document", 5);
      setQuiz((quizRes.data as any[]) || []);
      setAnswers([]);
      setResult(null);
    } catch {
      setError(t.learn.failedToLoad);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async () => {
    if (!quiz.length) return;
    setLoading(true);
    setError("");
    try {
      const filled = quiz.map((_, i) => answers[i] ?? 0);
      const data = await gradeQuiz(quiz, filled);
      setResult(data.data);
    } catch {
      setError(t.learn.gradingFailed);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuiz([]);
    setAnswers([]);
    setResult(null);
    setDocumentId("");
    setError("");
  };

  return (
    <main className="shell">
      <section className="hero" style={{ marginBottom: 24 }}>
        <div>
          <p className="eyebrow">{t.learn.eyebrow}</p>
          <h1>{t.learn.title}</h1>
          <p className="lead">{t.learn.subtitle}</p>
        </div>
      </section>

      {!quiz.length && !result && (
        <article className="panel">
          <h2>{t.learn.loadDoc}</h2>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <input
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder={t.learn.docIdPlaceholder}
              style={{ flex: 1 }}
            />
            <button className="action" onClick={loadDocument} disabled={loading}>
              {loading ? t.learn.loading : t.learn.generateQuiz}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </article>
      )}

      {quiz.length > 0 && !result && (
        <article className="panel">
          <h2>{t.learn.quiz}</h2>
          <p style={{ color: "#6B7280", marginBottom: 16 }}>{t.learn.answerAll.replace("{count}", String(quiz.length))}</p>
          {error && <p className="error">{error}</p>}
          {quiz.map((q, qi) => (
            <div key={qi} style={{ marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
              <strong>Q{qi + 1}. {q.question}</strong>
              <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                {q.options.map((opt: string, oi: number) => (
                  <label key={oi} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                    <input
                      type="radio"
                      name={`q${qi}`}
                      checked={answers[qi] === oi}
                      onChange={() => {
                        const updated = [...answers];
                        updated[qi] = oi;
                        setAnswers(updated);
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button className="action" onClick={submitAnswers} disabled={answers.length < quiz.length || loading}>
            {loading ? t.learn.grading : t.learn.submitAnswers}
          </button>
        </article>
      )}

      {result && (
        <article className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>{t.learn.results}</h2>
            <button className="action" onClick={reset} style={{ gap: 8 }}>
              <RotateCcw size={16} /> {t.learn.retry}
            </button>
          </div>

          <div className={`status ${result.passed ? "ok" : "uncertain"}`} style={{ marginBottom: 16, fontSize: 16 }}>
            {result.passed ? (
              <CheckCircle size={18} style={{ marginRight: 8 }} />
            ) : (
              <XCircle size={18} style={{ marginRight: 8 }} />
            )}
            {t.learn.score}: {result.score} / {result.total} ({result.percentage}%)
            {result.passed ? ` -- ${t.learn.passed}` : " -- Try again"}
          </div>

          {result.results.map((r: any, i: number) => (
            <div key={i} style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: r.is_correct ? "#dff2ea" : "#fdecea" }}>
              <strong>Q{i + 1}:</strong> {r.is_correct ? t.learn.correct : t.learn.incorrect}
              <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{r.explanation}</p>
            </div>
          ))}
        </article>
      )}
    </main>
  );
}
