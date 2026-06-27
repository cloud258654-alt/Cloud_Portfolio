import type {
  ChatAnswer,
  ConversationDetail,
  ConversationSummary,
  DocumentChunk,
  DocumentItem,
  DocumentListResponse,
  ExperiencePackage,
  ExperienceRecord,
  ExperienceSegment,
  HealthResponse,
  ProcessingStatus,
  StandardResponse,
} from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function getHealthStatus(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/admin/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json();
}

export async function listDocuments(): Promise<DocumentListResponse> {
  const response = await fetch(`${API_BASE}/documents`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Document list failed");
  }

  return response.json();
}

export async function getDocument(id: string): Promise<StandardResponse<DocumentItem>> {
  const response = await fetch(`${API_BASE}/documents/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Document detail failed");
  }

  return response.json();
}

export async function uploadDocument(formData: FormData): Promise<StandardResponse<DocumentItem>> {
  const response = await fetch(`${API_BASE}/documents`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Document upload failed");
  }

  return response.json();
}

export async function getDocumentProcessing(id: string): Promise<StandardResponse<ProcessingStatus>> {
  const response = await fetch(`${API_BASE}/documents/${id}/processing`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Document processing status failed");
  }

  return response.json();
}

export async function getDocumentChunks(id: string): Promise<StandardResponse<DocumentChunk[]>> {
  const response = await fetch(`${API_BASE}/documents/${id}/chunks`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Document chunks failed");
  }

  return response.json();
}

export async function reprocessDocument(id: string): Promise<StandardResponse<ProcessingStatus["ingestion"]>> {
  const response = await fetch(`${API_BASE}/documents/${id}/reprocess`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Document reprocess failed");
  }

  return response.json();
}

export async function askChat(question: string, conversationId?: string): Promise<StandardResponse<ChatAnswer>> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      conversation_id: conversationId,
    }),
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  return response.json();
}

export async function listConversations(): Promise<StandardResponse<ConversationSummary[]>> {
  const response = await fetch(`${API_BASE}/chat`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Conversation list failed");
  }

  return response.json();
}

export async function getConversation(id: string): Promise<StandardResponse<ConversationDetail>> {
  const response = await fetch(`${API_BASE}/chat/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Conversation detail failed");
  }

  return response.json();
}

export async function sendFeedback(
  conversationId: string,
  messageId: string,
  rating: number,
  comment?: string,
): Promise<StandardResponse<{ id: string }>> {
  const response = await fetch(`${API_BASE}/chat/${conversationId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message_id: messageId,
      rating,
      feedback_type: rating >= 4 ? "positive" : "negative",
      comment,
    }),
  });

  if (!response.ok) {
    throw new Error("Feedback failed");
  }

  return response.json();
}

export async function listExperiences(): Promise<StandardResponse<ExperienceRecord[]>> {
  const response = await fetch(`${API_BASE}/experience`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Experience list failed");
  }

  return response.json();
}

export async function getExperience(id: string): Promise<StandardResponse<ExperienceRecord>> {
  const response = await fetch(`${API_BASE}/experience/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Experience detail failed");
  }

  return response.json();
}

export async function uploadExperience(formData: FormData): Promise<StandardResponse<ExperienceRecord>> {
  const response = await fetch(`${API_BASE}/experience`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Experience upload failed");
  }

  return response.json();
}

export async function processExperience(id: string): Promise<StandardResponse<ExperienceRecord>> {
  const response = await fetch(`${API_BASE}/experience/${id}/process`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Experience process failed");
  }

  return response.json();
}

export async function getExperienceSegments(id: string): Promise<StandardResponse<ExperienceSegment[]>> {
  const response = await fetch(`${API_BASE}/experience/${id}/segments`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Experience segments failed");
  }

  return response.json();
}

export async function getExperiencePackage(id: string): Promise<StandardResponse<ExperiencePackage>> {
  const response = await fetch(`${API_BASE}/experience/${id}/package`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Experience package failed");
  }

  return response.json();
}

export async function reviewExperience(id: string, action: "approve" | "reject"): Promise<StandardResponse<ExperienceRecord>> {
  const response = await fetch(`${API_BASE}/experience/${id}/${action}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Experience review failed");
  }

  return response.json();
}

// ─── Analytics ────────────────────────────────────────────

export async function getAnalyticsSummary(): Promise<StandardResponse<Record<string, unknown>>> {
  const response = await fetch(`${API_BASE}/admin/analytics/summary`, { cache: "no-store" });
  if (!response.ok) throw new Error("Analytics summary failed");
  return response.json();
}

export async function getKnowledgeGaps(): Promise<StandardResponse<Record<string, unknown>>> {
  const response = await fetch(`${API_BASE}/admin/gaps`, { cache: "no-store" });
  if (!response.ok) throw new Error("Knowledge gaps failed");
  return response.json();
}

export async function getDepartmentAnalytics(): Promise<StandardResponse<Record<string, unknown>[]>> {
  const response = await fetch(`${API_BASE}/admin/analytics/departments`, { cache: "no-store" });
  if (!response.ok) throw new Error("Department analytics failed");
  return response.json();
}

export async function runHealthCheck(): Promise<StandardResponse<Record<string, unknown>>> {
  const response = await fetch(`${API_BASE}/admin/health/run`, { method: "POST" });
  if (!response.ok) throw new Error("Health check run failed");
  return response.json();
}

// ─── Quiz ──────────────────────────────────────────────────

export async function generateQuiz(documentText: string, title: string, count = 5): Promise<StandardResponse<Record<string, unknown>[]>> {
  const response = await fetch(`${API_BASE}/quiz/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_text: documentText, title, count }),
  });
  if (!response.ok) throw new Error("Quiz generation failed");
  return response.json();
}

export async function gradeQuiz(quiz: Record<string, unknown>[], answers: number[]): Promise<StandardResponse<Record<string, unknown>>> {
  const response = await fetch(`${API_BASE}/quiz/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quiz, answers }),
  });
  if (!response.ok) throw new Error("Quiz grading failed");
  return response.json();
}

// ─── Collaboration ─────────────────────────────────────────

export async function createComment(documentId: string, content: string, authorName = "Anonymous"): Promise<StandardResponse<{ id: string }>> {
  const response = await fetch(`${API_BASE}/collaboration/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_id: documentId, content, author_name: authorName }),
  });
  if (!response.ok) throw new Error("Comment creation failed");
  return response.json();
}

export async function listComments(documentId: string): Promise<StandardResponse<Record<string, unknown>[]>> {
  const response = await fetch(`${API_BASE}/collaboration/documents/${documentId}/comments`, { cache: "no-store" });
  if (!response.ok) throw new Error("Comments list failed");
  return response.json();
}

export async function createKnowledgeRequest(title: string, description?: string, requestorName?: string): Promise<StandardResponse<{ id: string }>> {
  const response = await fetch(`${API_BASE}/collaboration/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, requestor_name: requestorName || "Anonymous" }),
  });
  if (!response.ok) throw new Error("Request creation failed");
  return response.json();
}

export async function listKnowledgeRequests(status?: string): Promise<StandardResponse<Record<string, unknown>[]>> {
  const url = status ? `${API_BASE}/collaboration/requests?status=${status}` : `${API_BASE}/collaboration/requests`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Requests list failed");
  return response.json();
}

export async function endorseDocument(documentId: string): Promise<StandardResponse<{ endorsement_count: number }>> {
  const response = await fetch(`${API_BASE}/collaboration/documents/${documentId}/endorse`, { method: "POST" });
  if (!response.ok) throw new Error("Endorsement failed");
  return response.json();
}
