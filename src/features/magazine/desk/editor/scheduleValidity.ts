/**
 * Whether a `DatePicker` `datetime`-mode value (`"yyyy-mm-ddThh:mm"`, local
 * wall-clock time, no zone offset — parses as local time per the ISO 8601
 * date-time grammar `Date.parse` implements) names an instant strictly in
 * the future. Shared by `PublishRail` (gates the Publish button) and
 * `ArticleEditorPage` (gates the header's mirrored button and builds the
 * actual publish payload), so the two can never disagree about whether a
 * chosen schedule is valid.
 */
export function isFutureInstant(value: string | null): boolean {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now();
}
