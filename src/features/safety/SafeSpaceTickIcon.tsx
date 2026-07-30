/** The small checkmark glyph used by the trust banner's seal and each promise
 * row's check bullet. Hoisted out of `SafeSpaceTrustBanner`/
 * `SafeSpacePromisesList` (both need the identical mark) rather than
 * duplicated between them. */
export function SafeSpaceTickIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
