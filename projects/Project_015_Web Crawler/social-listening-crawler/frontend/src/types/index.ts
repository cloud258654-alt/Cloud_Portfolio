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
  risk_score: number;
  risk_reason: string | null;
  crisis_keywords_matched: string | null;
  recommended_priority: string;
  resolved_at: string | null;
  root_cause_category: string | null;
  root_cause_tags: string | null;
  suggested_action: string | null;
  brand_health_impact: number;
}

export interface BrandHealth {
  brand_health_score: number;
  previous_score: number;
  score_change: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  total_mentions: number;
  high_risk_count: number;
  positive_ratio: number;
  negative_ratio: number;
  top_root_causes: { category: string; count: number }[];
  summary: string;
}

export interface SuggestedAction {
  action: string;
  priority: string;
  title: string;
}

export interface DashboardSummary {
  total_keywords: number;
  total_mentions: number;
  negative_count: number;
  high_risk_count: number;
  medium_risk_count: number;
  purchase_intent_count: number;
  reputation_risk_index: number;
  negative_ratio: number;
  unresolved_count: number;
  crisis_keywords_hit_count: number;
  platform_breakdown: Record<string, number>;
  sentiment_breakdown: Record<string, number>;
  keyword_breakdown: Record<string, number>;
  trend: TrendItem[];
  latest_mentions: Mention[];
  high_risk_events: Mention[];
  brand_health: BrandHealth;
  root_cause_ranking: Record<string, number>;
  priority_distribution: Record<string, number>;
  suggested_actions: SuggestedAction[];
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
