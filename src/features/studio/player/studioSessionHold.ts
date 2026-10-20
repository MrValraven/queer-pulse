/** The session hold: one hidden <audio> looping digital silence while Studio
 *  plays on Android. Chrome there drops the tab's media session the moment
 *  no player is playing (the gap between two songs), and a locked phone then
 *  freezes the app a few seconds into the next one. The hold keeps a player
 *  playing across every gap. */

const SILENCE_SAMPLE_RATE = 8000;
/** Chrome reads audio shorter than 5 seconds as a one-shot sound that holds
 *  no media session, so the loop runs 6 seconds. */
const SILENCE_SECONDS = 6;
const BYTES_PER_SAMPLE = 2;
const WAV_HEADER_BYTES = 44;

let silentUrl: string | null = null;

/** A WAV of silence (16-bit mono PCM, every sample zero), built once and
 *  kept as an object URL for the page's life. */
function silentAudioUrl(): string {
  if (silentUrl) return silentUrl;
  const dataBytes = SILENCE_SAMPLE_RATE * SILENCE_SECONDS * BYTES_PER_SAMPLE;
  const buffer = new ArrayBuffer(WAV_HEADER_BYTES + dataBytes);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1)
      view.setUint8(offset + index, text.charCodeAt(index));
  };
  writeText(0, "RIFF");
  view.setUint32(4, WAV_HEADER_BYTES - 8 + dataBytes, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SILENCE_SAMPLE_RATE, true);
  view.setUint32(28, SILENCE_SAMPLE_RATE * BYTES_PER_SAMPLE, true);
  view.setUint16(32, BYTES_PER_SAMPLE, true);
  view.setUint16(34, BYTES_PER_SAMPLE * 8, true);
  writeText(36, "data");
  view.setUint32(40, dataBytes, true);
  silentUrl = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  return silentUrl;
}

/** True on Android only. iOS keeps its own session, and a second looping
 *  element there would take over the lock screen's Now Playing. */
export function needsSessionHold(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData?.platform;
  if (platform) return platform === "Android";
  return /Android/i.test(navigator.userAgent);
}

/** The hidden hold element, placed beside the decks. It stays unmuted at
 *  full volume: Chrome pauses muted audio in the background, and the
 *  content is silence. */
export function createSessionHoldElement(
  anchor: HTMLAudioElement,
): HTMLAudioElement {
  const element = document.createElement("audio");
  element.hidden = true;
  element.loop = true;
  element.preload = "auto";
  element.muted = false;
  element.volume = 1;
  element.src = silentAudioUrl();
  (anchor.parentElement ?? document.body).append(element);
  return element;
}
