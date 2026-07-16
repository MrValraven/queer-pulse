import styles from "./SubprofileNotFoundArt.module.css";

/** Abstract spot art for the persona not-found wall: a single coral node that
 *  has drifted loose of its ring — a page that came unmoored, not an error.
 *  Decorative (the copy carries the meaning), token-built so it themes in light
 *  and dark, and hidden from assistive tech. Flat, one idea, ≤2 stroke weights. */
export function SubprofileNotFoundArt() {
  return (
    <svg
      className={styles.art}
      viewBox="0 0 160 120"
      aria-hidden
      focusable="false"
    >
      {/* The empty berth it drifted from — a soft dashed ring left open */}
      <circle
        cx={60}
        cy={62}
        r={30}
        fill="none"
        stroke="rgba(var(--line-rgb), 0.35)"
        strokeWidth={1.4}
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      {/* A faint stem trailing toward where it used to sit */}
      <line
        x1={88}
        y1={50}
        x2={108}
        y2={40}
        stroke="rgba(var(--line-rgb), 0.28)"
        strokeWidth={1.3}
        strokeDasharray="1.5 5"
        strokeLinecap="round"
      />
      {/* The loose node, drifted up and to the right */}
      <circle
        cx={118}
        cy={36}
        r={13}
        fill="var(--accent)"
        stroke="rgba(var(--cream-rgb), 0.55)"
        strokeWidth={1.4}
      />
      {/* Two small companions still resting near the empty ring */}
      <circle cx={44} cy={82} r={5} fill="rgba(var(--jade-rgb), 0.85)" />
      <circle cx={74} cy={40} r={4} fill="rgba(var(--plum-rgb), 0.55)" />
    </svg>
  );
}
