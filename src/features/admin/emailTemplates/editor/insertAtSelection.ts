/** Replaces the selected range (or inserts at the caret) with `token`, and
 *  returns where the caret belongs afterwards: right after the token. */
export function insertAtSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  token: string,
): { value: string; caret: number } {
  const start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(start, Math.min(selectionEnd, value.length));
  return {
    value: value.slice(0, start) + token + value.slice(end),
    caret: start + token.length,
  };
}
