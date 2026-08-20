// Pure formatting helpers shared between server and client components —
// deliberately not "server-only" so client components (e.g. the service
// multi-select form) can import them too.

export interface DurationRange {
  durationMinMinutes: number;
  durationMaxMinutes: number;
}

export function sumDurationRange(services: DurationRange[]) {
  return {
    min: services.reduce((sum, s) => sum + s.durationMinMinutes, 0),
    max: services.reduce((sum, s) => sum + s.durationMaxMinutes, 0),
  };
}

export function formatDurationRange(min: number, max: number): string {
  return min === max ? `${min} 分鐘` : `${min}–${max} 分鐘`;
}

export function formatServiceDuration(service: DurationRange): string {
  return formatDurationRange(service.durationMinMinutes, service.durationMaxMinutes);
}
