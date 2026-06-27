"use client";

import { Send, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { askChat, listConversations, sendFeedback } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import type { ChatAnswer, ChatCitation, ConversationMessage, ConversationSummary } from "@/types/api";

export default function ChatPage() {
  const { t, lang } = useTranslation();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [citations, setCitations] = useState<ChatCitation[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(
    lang === "zh"
      ? ["客人要求退換貨該怎麼處理？", "如何處理顧客抱怨？", "新人報到的標準流程是什麼？"]
      : ["How to handle a customer return?", "Customer complaint procedure?", "New employee onboarding SOP?"]
  );
  const [confidenceTier, setConfidenceTier] = useState<string>("uncertain");
  const [groundingRatio, setGroundingRatio] = useState<number>(0);
  const [question, setQuestion] = useState("");
  const [lastAnswer, setLastAnswer] = useState<ChatAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listConversations()
      .then((response) => setConversations(response.data))
      .catch(() => setConversations([]));
  }, []);

  async function submit(nextQuestion = question) {
    if (!nextQuestion.trim()) {
      return;
    }
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), sender_type: "user", message: nextQuestion },
    ]);
    setQuestion("");
    try {
      const response = await askChat(nextQuestion, conversationId);
      setConversationId(response.data.conversation_id);
      setLastAnswer(response.data);
      setCitations(response.data.citations);
      setConfidenceTier(response.data.confidence_tier || "uncertain");
      setGroundingRatio(response.data.grounding_ratio || 0);
      setSuggestions(response.data.suggested_questions);
      setMessages((current) => [
        ...current,
        {
          id: response.data.message_id,
          sender_type: "assistant",
          message: response.data.answer,
        },
      ]);
      const list = await listConversations();
      setConversations(list.data);
      setError(null);
    } catch {
      setError(t.chat.failedToAnswer);
    } finally {
      setLoading(false);
    }
  }

  async function feedback() {
    if (!conversationId || !lastAnswer) {
      return;
    }
    await sendFeedback(conversationId, lastAnswer.message_id, 5, "Helpful answer");
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">{t.chat.eyebrow}</p>
          <h1>{t.chat.title}</h1>
          <p className="lead">{t.chat.subtitle}</p>
        </div>
      </section>

      <section className="chat-layout">
        <aside className="conversation-list">
          <h2>{t.chat.conversations}</h2>
          <div className="list">
            {conversations.map((item) => (
              <button key={item.id} type="button" onClick={() => setConversationId(item.id)}>
                {item.title ?? t.chat.untitled}
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-window">
          <div className="messages">
            {messages.length === 0 ? <p className="lead">{t.chat.startPrompt}</p> : null}
            {messages.map((message) => (
              <div className={`bubble ${message.sender_type}`} key={message.id}>
                {message.message}
              </div>
            ))}
            {loading ? <div className="bubble">{t.chat.typing}</div> : null}
            {error ? <p className="error" style={{ padding: "8px 12px" }}>{error}</p> : null}
          </div>
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t.chat.placeholder} />
            <button className="action" type="submit" disabled={loading}>
              <Send size={18} />
              {t.chat.send}
            </button>
          </form>
          <div className="suggestions">
            {suggestions.map((item) => (
              <button key={item} type="button" onClick={() => submit(item)}>
                {item}
              </button>
            ))}
          </div>
        </section>

        <aside className="citation-panel">
          <h2>{t.chat.answerQuality}</h2>
          <div style={{ marginBottom: 16 }}>
            <div className={`status ${confidenceTier}`}>
              {confidenceTier === "verified" ? "Verified" : confidenceTier === "partial" ? "Partial" : "Uncertain"}
            </div>
            <p style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
              {(groundingRatio * 100).toFixed(0)}% {t.chat.grounding}
            </p>
          </div>
          <h2>{t.chat.citations}</h2>
          {citations.length === 0 ? <p>{t.chat.noCitations}</p> : null}
          {citations.map((citation) => (
            <div className="citation" key={`${citation.document_id}-${citation.chunk_id}`}>
              <strong>{citation.document_title}</strong>
              <p>{t.chat.version}: {citation.version ?? "n/a"}</p>
              <p>{t.chat.score}: {citation.score.toFixed(2)}</p>
            </div>
          ))}
          <button className="action" type="button" onClick={feedback} disabled={!lastAnswer}>
            <ThumbsUp size={18} />
            {t.chat.helpful}
          </button>
        </aside>
      </section>
    </main>
  );
}
