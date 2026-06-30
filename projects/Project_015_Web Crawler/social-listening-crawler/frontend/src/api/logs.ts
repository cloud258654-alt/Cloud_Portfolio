import { get } from './client';
import type { CrawlLog } from '../types';

export function fetchCrawlLogs(limit = 50): Promise<CrawlLog[]> {
  return get<CrawlLog[]>(`/crawler/logs?limit=${limit}`);
}
