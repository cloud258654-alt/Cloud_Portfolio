import { get } from './client';
import type { Mention } from '../types';

export function fetchMentions(params?: {
  platform?: string;
  sentiment?: string;
  risk_level?: string;
  recommended_priority?: string;
  root_cause_category?: string;
  keyword_id?: number;
  search?: string;
  limit?: number;
  skip?: number;
}): Promise<Mention[]> {
  const sp = new URLSearchParams();
  if (params?.platform) sp.set('platform', params.platform);
  if (params?.sentiment) sp.set('sentiment', params.sentiment);
  if (params?.risk_level) sp.set('risk_level', params.risk_level);
  if (params?.recommended_priority) sp.set('recommended_priority', params.recommended_priority);
  if (params?.root_cause_category) sp.set('root_cause_category', params.root_cause_category);
  if (params?.keyword_id) sp.set('keyword_id', String(params.keyword_id));
  if (params?.search) sp.set('search', params.search);
  if (params?.limit) sp.set('limit', String(params.limit));
  if (params?.skip) sp.set('skip', String(params.skip));
  const qs = sp.toString();
  return get<Mention[]>(`/mentions/${qs ? `?${qs}` : ''}`);
}
