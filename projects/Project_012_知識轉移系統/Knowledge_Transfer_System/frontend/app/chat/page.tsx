"use client";

import { Send, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { askChat, listConversations, sendFeedback } from "@/lib/api";
import type { ChatAnswer, ChatCitation, ConversationMessage, ConversationSummary } from "@/types/api";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [citations, setCitations] = useState<ChatCitation[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "ISO 9001 相關 SOP 是什麼？",
    "採購流程有哪些注意事項？",
    "如何查詢 ERP 操作文件？",
  ]);
  const [question, setQuestion] = useState("");
  const [lastAnswer, setLastAnswer] = useState<ChatAnswer | null>(null);
  const [loading, setLoading] = useState(false);

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
          <p className="eyebrow">Enterprise AI QA</p>
          <h1>Chat</h1>
          <p className="lead">Ask questions against indexed enterprise knowledge with citations.</p>
        </div>
      </section>

      <section className="chat-layout">
        <aside className="conversation-list">
          <h2>Conversations</h2>
          <div className="list">
            {conversations.map((item) => (
              <button key={item.id} type="button" onClick={() => setConversationId(item.id)}>
                {item.title ?? "Untitled"}
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-window">
          <div className="messages">
            {messages.length === 0 ? <p className="lead">Start with a question.</p> : null}
            {messages.map((message) => (
              <div className={`bubble ${message.sender_type}`} key={message.id}>
                {message.message}
              </div>
            ))}
            {loading ? <div className="bubble">Typing...</div> : null}
          </div>
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question" />
            <button className="action" type="submit" disabled={loading}>
              <Send size={18} />
              Send
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
          <h2>Citations</h2>
          {citations.length === 0 ? <p>No citations yet</p> : null}
          {citations.map((citation) => (
            <div className="citation" key={`${citation.document_id}-${citation.chunk_id}`}>
              <strong>{citation.document_title}</strong>
              <p>Version: {citation.version ?? "n/a"}</p>
              <p>Score: {citation.score.toFixed(2)}</p>
            </div>
          ))}
          <button className="action" type="button" onClick={feedback} disabled={!lastAnswer}>
            <ThumbsUp size={18} />
            Helpful
          </button>
        </aside>
      </section>
    </main>
  );
}
