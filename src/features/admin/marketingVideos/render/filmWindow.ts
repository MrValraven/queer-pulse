/**
 * The contract every film in public/marketing-videos exposes on its window
 * (see any <id>.scene.js). The CLI renderer (scripts/launch-video/render.mjs)
 * drives the same functions, so a film that renders there renders here.
 */
export interface FilmWindow extends Window {
  /** Draws the frame at `seconds`; every frame is a pure function of time. */
  seek(seconds: number): void;
  /** Resolves once fonts and images are loaded. */
  ready(): Promise<unknown>;
  DURATION: number;
  /** "jpeg" for films full of grain (only the CLI's capture uses it). */
  CAPTURE?: string;
  /** Sub-frames to average per frame, for motion blur. */
  SHUTTER?: number;
  /** Added by <id>.score.js: the score as a base64 16-bit WAV. */
  renderScore?: () => Promise<string>;
}

export class FilmLoadError extends Error {
  override name = "FilmLoadError";
}

function hasFilmContract(win: Window | null): win is FilmWindow {
  return (
    win !== null &&
    typeof Reflect.get(win, "seek") === "function" &&
    typeof Reflect.get(win, "ready") === "function"
  );
}

/**
 * The film inside a same-origin iframe, once its scripts have run and its
 * fonts and avatars are ready. Call after the iframe's `load` event.
 */
export async function filmIn(iframe: HTMLIFrameElement): Promise<FilmWindow> {
  const win = iframe.contentWindow;
  if (!hasFilmContract(win)) {
    throw new FilmLoadError("The film did not load its scene script.");
  }
  await win.ready();
  return win;
}

/** Waits for an iframe to finish loading (resolves at once if it has). */
export function iframeLoaded(iframe: HTMLIFrameElement): Promise<void> {
  if (
    iframe.contentDocument?.readyState === "complete" &&
    hasFilmContract(iframe.contentWindow)
  ) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    iframe.addEventListener("load", () => resolve(), { once: true });
  });
}

const SAMPLE_RATE = 48000;

/**
 * Composes the film's score inside its own frame (the score reads the film's
 * window.CUES) and decodes it to an AudioBuffer. Takes a few seconds: it is
 * an offline render of the whole soundtrack.
 */
export async function composeScore(
  film: FilmWindow,
  scoreUrl: string,
): Promise<AudioBuffer> {
  if (!film.renderScore) {
    await new Promise<void>((resolve, reject) => {
      const script = film.document.createElement("script");
      script.src = scoreUrl;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new FilmLoadError(`Could not load the score ${scoreUrl}.`));
      film.document.head.appendChild(script);
    });
  }
  if (!film.renderScore) {
    throw new FilmLoadError("The score script did not define renderScore().");
  }
  const wavBase64 = await film.renderScore();
  const binary = atob(wavBase64);
  const bytes = new Uint8Array(binary.length);
  for (let byteIndex = 0; byteIndex < binary.length; byteIndex++) {
    bytes[byteIndex] = binary.charCodeAt(byteIndex);
  }
  // An offline context decodes without starting audio output, and keeps the
  // score at its own 48 kHz instead of the device's rate.
  const decoder = new OfflineAudioContext(2, 1, SAMPLE_RATE);
  return decoder.decodeAudioData(bytes.buffer);
}
