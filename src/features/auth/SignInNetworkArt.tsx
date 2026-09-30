import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";
import {
  createNetworkArtEngine,
  type NetworkArtEngine,
} from "./signInNetworkArt.engine";
import {
  measureTextAnchor,
  useTextReveal,
} from "./signInNetworkArt.textReveal";
import styles from "./signInNetworkArt.module.css";

/** The animated "queer network" in the sign-in card's art (a column on
 *  desktop, a poster band on phones): people in
 *  a plum night gather into the Q of QueerPulse, a warm coral hearth glowing
 *  in its counter, and find each other through soft threads that draw
 *  themselves in, carry small lights between them, and reach out to welcome
 *  newcomers. Once the Q has formed, its last light travels down to the
 *  wordmark, which writes itself in, and `caption` fades up under it. Fills
 *  its column (the parent is `position: relative`). Decorative, so the
 *  canvas is hidden from assistive tech; the wordmark and caption stay real
 *  text in the DOM throughout. Under reduced motion it paints one composed
 *  still frame, never starts a loop, and shows the text from the start. */
export function SignInNetworkArt({ caption }: { caption: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordmarkRef = useRef<HTMLParagraphElement>(null);
  const engineRef = useRef<NetworkArtEngine | null>(null);
  const isReducedMotion = usePrefersReducedMotion();
  // The latest preference, for an engine created after it last changed.
  const isReducedMotionRef = useRef(isReducedMotion);
  const { textPhase, cues } = useTextReveal(isReducedMotion);
  const visibleTextPhase = isReducedMotion ? "shown" : textPhase;
  const isWaitingForLight = visibleTextPhase === "waiting";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createNetworkArtEngine(canvas, cues);
    engine.setReducedMotion(isReducedMotionRef.current);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [cues]);

  useEffect(() => {
    isReducedMotionRef.current = isReducedMotion;
    engineRef.current?.setReducedMotion(isReducedMotion);
  }, [isReducedMotion]);

  // Tells the engine where the wordmark starts while the text still waits
  // for the light, and again whenever the art changes size. Once the text
  // shows, there is nothing left to hand off to. Runs again for a new
  // engine, after the one above.
  useEffect(() => {
    const engine = engineRef.current;
    const root = rootRef.current;
    const wordmark = wordmarkRef.current;
    if (!engine || !root || !wordmark) return;
    if (!isWaitingForLight) {
      engine.setTextAnchor(null);
      return;
    }
    // A wordmark that is not rendered has nothing to land on.
    const measure = () =>
      engine.setTextAnchor(
        wordmark.getClientRects().length > 0
          ? measureTextAnchor(wordmark, root)
          : null,
      );
    measure();
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    resizeObserver?.observe(root);
    return () => resizeObserver?.disconnect();
  }, [isWaitingForLight, cues]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-text-phase={visibleTextPhase}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
      <div className={styles.scrim} aria-hidden />
      <div className={styles.captionStack}>
        <div className={styles.wordmarkRow}>
          <p ref={wordmarkRef} className={styles.wordmark}>
            {"Queer"}
            <em>{"Pulse"}</em>
          </p>
          <span className={styles.writingLight} aria-hidden />
        </div>
        <p className={styles.caption}>{caption}</p>
      </div>
    </div>
  );
}
