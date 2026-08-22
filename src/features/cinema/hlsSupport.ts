/**
 * Whether this browser can play the HLS (`.m3u8`) sources the cinema serves
 * (`MuxService` mints `https://stream.mux.com/<id>.m3u8`).
 *
 * Safari on macOS and every browser on iOS play HLS natively. Chrome and
 * Firefox do not, and a `<video>` pointed at an `.m3u8` there fails with the
 * native broken-media glyph and nothing else. Detecting it up front lets the
 * watch page say so instead of minting a playback session the member can
 * never use. (Loading hls.js for those browsers is the real fix; it is not a
 * dependency of this app yet.)
 */
export function hasNativeHlsSupport(): boolean {
  if (typeof document === "undefined") return false;
  const probe = document.createElement("video");
  // Browsers answer "probably" / "maybe" / "" — anything other than the empty
  // string is a claim of support.
  return (
    probe.canPlayType("application/vnd.apple.mpegurl") !== "" ||
    probe.canPlayType("application/x-mpegURL") !== ""
  );
}
