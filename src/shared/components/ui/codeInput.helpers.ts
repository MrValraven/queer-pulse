/** How many digits a sign-in code has. */
export const CODE_LENGTH = 6;

/**
 * Strips everything but digits and keeps the first `length`, so a paste like
 * "Your code: 123-456" lands as "123456".
 */
export function digitsOnly(raw: string, length: number = CODE_LENGTH): string {
  return raw.replace(/\D/g, "").slice(0, length);
}

/**
 * Writes `incoming` digits over the value from box `index` on. The value is
 * always a contiguous prefix, so an index past its end writes at its end.
 * Digits past `length` are dropped. `nextIndex` is the box to focus next,
 * clamped to the last box.
 */
export function writeDigits(
  value: string,
  index: number,
  incoming: string,
  length: number = CODE_LENGTH,
): { value: string; nextIndex: number } {
  const start = Math.min(index, value.length);
  const digits = digitsOnly(incoming, length);
  const written = (
    value.slice(0, start) +
    digits +
    value.slice(start + digits.length)
  ).slice(0, length);
  return {
    value: written,
    nextIndex: Math.min(start + digits.length, length - 1),
  };
}

/**
 * The text a box's change event actually added. A box holding "3" with the
 * caret beside it reports "37" or "73" when 7 is typed; this keeps only the 7,
 * so one keystroke replaces the box's digit. Anything longer (an OS autofill
 * of the whole code) passes through whole.
 */
export function typedText(raw: string, current: string): string {
  if (!current || raw.length !== current.length + 1) return raw;
  if (raw.startsWith(current)) return raw.slice(current.length);
  if (raw.endsWith(current)) return raw.slice(0, 1);
  return raw;
}
