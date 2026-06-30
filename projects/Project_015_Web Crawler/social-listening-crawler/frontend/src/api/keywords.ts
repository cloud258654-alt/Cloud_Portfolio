import { get, post, put, del } from './client';
import type { Keyword } from '../types';

export function fetchKeywords(): Promise<Keyword[]> {
  return get<Keyword[]>('/keywords/');
}

export function createKeyword(data: { name: string; group_name?: string; platforms?: string }): Promise<Keyword> {
  return post<Keyword>('/keywords/', data);
}

export function updateKeyword(id: number, data: Partial<Keyword>): Promise<Keyword> {
  return put<Keyword>(`/keywords/${id}`, data);
}

export function deleteKeyword(id: number): Promise<void> {
  return del(`/keywords/${id}`);
}

export function postCrawlRun(keywordId?: number): Promise<unknown> {
  const path = keywordId != null ? `/crawler/run/${keywordId}` : '/crawler/run';
  return post(path);
}
