export type HealthResponse = {
  success: boolean;
  data: {
    status: string;
    services: Record<string, string>;
  };
  message: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  description?: string | null;
  department_id?: string | null;
  file_type?: string | null;
  storage_path: string;
  permission_scope: string;
  classification: string;
  status: string;
  current_version: string;
  metadata: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DocumentListResponse = {
  success: boolean;
  data: {
    items: DocumentItem[];
    total: number;
    page: number;
    page_size: number;
  };
  message: string;
};

export type StandardResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

export type ProcessingStatus = {
  document_id: string;
  document_status: string;
  ingestion: {
    id: string;
    status: string;
    stage: string;
    progress: number;
    retry_count: number;
    max_retries: number;
    error_message?: string | null;
    metadata: Record<string, unknown>;
  } | null;
  chunk_count: number;
  embedding_status: string;
  language?: string | null;
  summary?: string | null;
};

export type DocumentChunk = {
  id: string;
  document_id: string;
  chunk_index: number;
  title?: string | null;
  section?: string | null;
  page_number?: number | null;
  content: string;
  token_count: number;
  language?: string | null;
  metadata: Record<string, unknown>;
};

export type ChatCitation = {
  document_id: string;
  document_title: string;
  version?: string | null;
  page?: number | null;
  chunk_id?: string | null;
  section?: string | null;
  score: number;
};

export type ChatAnswer = {
  conversation_id: string;
  message_id: string;
  answer: string;
  citations: ChatCitation[];
  confidence: number;
  suggested_questions: string[];
};

export type ConversationSummary = {
  id: string;
  title?: string | null;
  channel: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ConversationMessage = {
  id: string;
  sender_type: string;
  message: string;
  created_at?: string | null;
};

export type ConversationDetail = {
  id: string;
  title?: string | null;
  messages: ConversationMessage[];
};

export type ExperienceRecord = {
  id: string;
  title: string;
  source_type?: string | null;
  category?: string | null;
  expert_name?: string | null;
  raw_storage_path?: string | null;
  transcript?: string | null;
  summary?: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ExperienceSegment = {
  id: string;
  segment_index: number;
  speaker?: string | null;
  start_time?: number | null;
  end_time?: number | null;
  text: string;
  confidence?: number | null;
};

export type ExperiencePackage = {
  transcript: string;
  summary: Record<string, unknown>;
  faq: Array<Record<string, unknown>>;
  best_practices: Array<Record<string, unknown>>;
  keywords: string[];
  tags: string[];
  related_documents: string[];
};
