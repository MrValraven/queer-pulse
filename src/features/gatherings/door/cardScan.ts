/**
 * Turning what a camera read into the card code the door endpoint wants.
 *
 * A membership card's QR encodes the verification URL the platform already
 * issues (`{origin}/cards/verify/{token}` — see `CardBackFace`), so the last
 * path segment is the card's own permanent code. Anything else that scans is
 * passed through unchanged, which covers a host typing or pasting the code
 * straight off the card.
 *
 * This never decides whether a code is valid. `CardTokenService` does that
 * server-side, on every scan, because a card the issuer revoked must stop
 * opening doors the moment they revoke it.
 */
export function cardTokenFromScan(scanned: string): string {
  const text = scanned.trim();
  if (text === "") return "";
  const match = /\/cards\/verify\/([^/?#]+)/.exec(text);
  if (!match?.[1]) return text;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    // A malformed escape sequence is not worth failing over: hand the raw
    // segment on and let the server be the one to say it cannot read it.
    return match[1];
  }
}

/** Whether this browser can read a QR code from a live camera at all.
 *  Safari and every iOS browser answer no today, which is why the door always
 *  offers a typed code as well. */
export function isCameraScanSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "BarcodeDetector" in window &&
    typeof navigator !== "undefined" &&
    navigator.mediaDevices?.getUserMedia !== undefined
  );
}
