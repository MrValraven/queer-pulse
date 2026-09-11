/** "14:02" in the given UI language. */
export function formatGuideTime(iso: string, language: string): string {
  return new Date(iso).toLocaleTimeString(language, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "11 Sep, 14:02" in the given UI language. */
export function formatGuideDateTime(iso: string, language: string): string {
  return new Date(iso).toLocaleString(language, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
