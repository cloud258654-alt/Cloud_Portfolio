import type {
  DocumentChunk,
  DocumentItem,
  DocumentListResponse,
  ChatAnswer,
  ConversationDetail,
  ConversationSummary,
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
