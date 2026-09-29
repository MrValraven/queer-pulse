/** First letter of a first name, for the avatar fallback. Shared by the
 *  gathering-card entry and the full group sheet. */
export function memberInitial(firstName: string): string {
  return (Array.from(firstName.trim())[0] ?? "").toLocaleUpperCase();
}
