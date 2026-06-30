import { get, post } from './client';

interface SchedulerStatus {
  running: boolean;
  mock_mode: boolean;
  interval_hours: number;
  next_run_time: string | null;
}

export function fetchSchedulerStatus(): Promise<SchedulerStatus> {
  return get<SchedulerStatus>('/scheduler/status');
}

export function startScheduler(intervalHours = 6): Promise<unknown> {
  return post('/scheduler/start', { interval_hours: intervalHours });
}

export function stopScheduler(): Promise<unknown> {
  return post('/scheduler/stop');
}

export function runSchedulerNow(): Promise<unknown> {
  return post('/scheduler/run-now');
}
