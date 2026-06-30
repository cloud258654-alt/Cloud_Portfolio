import { post, getAuthToken, API_BASE } from './client';

export function triggerImportMentions(data: string | File): Promise<unknown> {
  if (typeof data === 'string') {
    return post('/crawler/import-csv/mentions', { file_path: data });
  }
  const formData = new FormData();
  formData.append('file', data);
  const headers: Record<string, string> = {};
  const t = getAuthToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return fetch(`${API_BASE}/crawler/import-csv/mentions`, { method: 'POST', body: formData, headers }).then(r => r.json());
}

export function triggerImportGoogleReviews(data: string | File): Promise<unknown> {
  if (typeof data === 'string') {
    return post('/crawler/import-csv/google-reviews', { file_path: data });
  }
  const formData = new FormData();
  formData.append('file', data);
  const headers: Record<string, string> = {};
  const t = getAuthToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return fetch(`${API_BASE}/crawler/import-csv/google-reviews`, { method: 'POST', body: formData, headers }).then(r => r.json());
}

export function getExportMentionsCsvUrl(filters?: Record<string, string>): string {
  const base = `${API_BASE}/exports/mentions.csv`;
  if (!filters) return base;
  const params = new URLSearchParams(filters);
  return `${base}?${params.toString()}`;
}

export function reanalyzeMention(mentionId: number): Promise<unknown> {
  return post(`/mentions/${mentionId}/reanalyze`);
}
