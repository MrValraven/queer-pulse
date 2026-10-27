/** Whether two names read the same, ignoring case and outer spaces. A
 *  single named after its track, or a release named after its artist, would
 *  print a name twice, so a row drops the release when this holds. */
export function isSameName(first: string, second: string): boolean {
  return first.trim().toLowerCase() === second.trim().toLowerCase();
}
