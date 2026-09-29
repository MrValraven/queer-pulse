import { memo, useRef, type CSSProperties } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { usePingGaze } from "./usePingGaze";
import styles from "./Ping.module.css";

export type PingMood = "broken" | "searching";

interface PingProps {
  mood: PingMood;
  /** Broken mood only: skip the opening story (the beats and the break) and
   *  go straight to the recurring wake-up attempts, for a page that has
   *  already crashed once. */
  isSettled?: boolean;
  className?: string;
}

/** One ring per sonar beat; the broken story also lets the last one die
 *  halfway. The index staggers the broken heartbeat rings. */
const RING_INDEXES = [0, 1, 2];

/** A fine pointer that can hover: a mouse or a trackpad, never a finger. */
const CURSOR_QUERY = "(hover: hover) and (pointer: fine)";

const MOOD_CLASS: Record<PingMood, string | undefined> = {
  broken: styles.broken,
  searching: styles.searching,
};

function ringStyle(index: number): CSSProperties {
  return { "--ring": index } as CSSProperties;
}

/**
 * Ping, the QueerPulse pulse given a personality: the coral heartbeat of the
 * brand mark, drawn as a round coral core (Ping's body and eye) inside a
 * hairline orbit, with a soft glow behind and sonar rings breathing out. Ping
 * is the sibling of Blip, the sticker mascot: Blip turns up in sticker packs,
 * Ping on the system pages. Pure CSS, decorative, hidden from assistive tech.
 *
 * Ping fills its box at a 1:1 aspect, so the caller sizes it.
 *
 * `mood="broken"` (the crash screen): Ping beats twice, glitches, flickers and
 * deflates, then every 8s strains to power back up, flickering harder as it
 * rises, and crashes. `isSettled` skips straight to the wake-up attempts.
 *
 * `mood="searching"` (the 404): Ping is healthy and full and looks around for
 * the missing page on a 10s loop: a glance left and a sonar ping, a glance
 * right and a second ping, a curious stretch-and-squash, then a breathing
 * rest at centre. With a mouse or trackpad and motion allowed, Ping's eye
 * follows the cursor instead (see usePingGaze), and resumes looking around
 * 2.5s after the cursor goes still. Touch devices get the loop.
 *
 * Reduced motion (the OS setting or the in-app toggle) shows a still: broken
 * Ping lies dim and sagging, searching Ping sits centred and bright inside
 * two faint static rings.
 */
function PingMascot({ mood, isSettled = false, className }: PingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gazeRef = useRef<HTMLSpanElement>(null);
  const travelRef = useRef<HTMLSpanElement>(null);
  const coreRef = useRef<HTMLSpanElement>(null);
  const hasCursor = useMediaQuery(CURSOR_QUERY);
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldFollowCursor =
    mood === "searching" && hasCursor && !prefersReducedMotion;
  usePingGaze(rootRef, gazeRef, travelRef, coreRef, shouldFollowCursor);

  const rootClassName = [
    styles.ping,
    MOOD_CLASS[mood],
    isSettled ? styles.settled : "",
    className ?? "",
  ].join(" ");

  const rings = RING_INDEXES.map((ringIndex) => (
    <span
      key={ringIndex}
      className={styles.ring}
      style={ringStyle(ringIndex)}
    />
  ));

  // Searching: the rings ride inside the travelling eye, so each sonar ping
  // leaves from the core wherever it is looking. Broken: they stay centred.
  return (
    <div ref={rootRef} className={rootClassName} aria-hidden="true">
      {mood === "searching" ? (
        <span ref={gazeRef} className={styles.gaze}>
          <span ref={travelRef} className={styles.eyeTravel}>
            {rings}
            <span ref={coreRef} className={styles.core} />
          </span>
        </span>
      ) : (
        <>
          {rings}
          <span className={styles.core} />
        </>
      )}
    </div>
  );
}

export const Ping = memo(PingMascot);
