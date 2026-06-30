export interface Keyword {
  id: number;
  name: string;
  group_name: string | null;
  is_active: boolean;
  platforms: string;
  created_at: string;
  updated_at: string;
}

export interface Mention {
  id: number;
  keyword_id: number;
  platform: string;
  title: string | null;
  content: string;
  url: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
  sentiment: string;
  sentiment_score: number;
  risk_level: string;
  purchase_intent: boolean;
  ai_summary: string | null;
  ai_suggestion: string | null;
  status: string;
  raw_data: string | null;
  keyword_name?: string | null;
}

export interface DashboardSummary {
  total_keywords: number;
  total_mentions: number;
  negative_count: number;
  high_risk_count: number;
  medium_risk_count: number;
  purchase_intent_count: number;
  platform_breakdown: Record<string, number>;
  sentiment_breakdown: Record<string, number>;
  keyword_breakdown: Record<string, number>;
  trend: TrendItem[];
  latest_mentions: Mention[];
  high_risk_events: Mention[];
}

export interface TrendItem {
  date: string;
  count: number;
}

export interface CrawlLog {
  id: number;
  keyword_id: number | null;
  platform: string;
  status: string;
  items_count: number | null;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
}
