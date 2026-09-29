import { useEffect, useRef, type ReactNode } from "react";
import { Translation } from "../../i18n/Translation";
import { MAIN_CONTENT_ID } from "./SkipToContentLink";
import { stageRevealProps } from "./systemStageReveal";
import styles from "./SystemStage.module.css";

interface SystemStageProps {
  /** "route" sits inside a PageShell `<main>`; "app" is the whole-page
   *  catch with no router or frame, so the stage brings its own `<main>`
   *  and a wordmark. */
  level?: "app" | "route";
  /** The id of the page's SystemStageTitle, which names the section. */
  labelledBy: string;
  /** The small caps line above the title; the stage draws its coral dot. */
  eyebrow: ReactNode;
  /** The right-hand visual (usually Ping). Sized by the stage: a column on
   *  desktop, a 52px mark beside the eyebrow on phones. */
  visual: ReactNode;
  /** A small muted line under the visual, shown from 720px only. */
  visualCaption?: ReactNode;
  /** Render with no entrance, e.g. after a failed retry. */
  isSettled?: boolean;
  /** The copy column after the eyebrow: a SystemStageTitle, a
   *  SystemStageLead, then the page's own blocks as direct children. */
  children: ReactNode;
}

/** The three soft background orbs, drifting slowly. Decorative. */
function StageOrbs() {
  return (
    <div className={styles.orbs} aria-hidden="true">
      <span className={`${styles.orb} ${styles.orbCoral}`} />
      <span className={`${styles.orb} ${styles.orbJade}`} />
      <span className={`${styles.orb} ${styles.orbGlow}`} />
    </div>
  );
}

/** The app-level wordmark, where no navbar exists. */
function StageWordmark() {
  return (
    <p className={styles.brand}>
      <span className={styles.brandDot} aria-hidden="true" />
      {/* One span, so the dot and the word are the only two flex items and
          the gap never lands inside the wordmark. */}
      <span>
        <Translation
          i18nKey="shared:brand.wordmark"
          components={{ em: <em /> }}
        />
      </span>
    </p>
  );
}

/**
 * The drenched plum stage the system pages share (the crash screen, the 404).
 * It IS the page: no card, no panel. Plum and the cream channels do not flip
 * with the theme, so it reads the same in light and dark. Soft drifting orbs
 * behind, a calm copy column on the left and a visual on the right from 720px;
 * one column below that, visual on top; on phones the visual shrinks to a
 * small mark on the eyebrow's row, so the first screen reaches the actions.
 *
 * `level="route"`: as the first child of the shell's `<main>`, the stage runs
 * up under the floating nav and fills the window between the chrome; nested
 * deeper, it simply flows. `level="app"`: it renders its own `<main>` (the
 * page's one landmark and the skip-link target) and a wordmark, and fills the
 * viewport.
 *
 * The copy column is built from SystemStageTitle (the h1, which takes focus
 * on mount), SystemStageLead and the page's own blocks, each joining the
 * entrance through `stageRevealProps(index)`.
 */
export function SystemStage({
  level = "route",
  labelledBy,
  eyebrow,
  visual,
  visualCaption,
  isSettled = false,
  children,
}: SystemStageProps) {
  const isAppLevel = level === "app";
  const stageClassName = [
    styles.stage,
    isAppLevel ? styles.stageApp : styles.stageRoute,
    isSettled ? styles.stageSettled : "",
  ].join(" ");

  const stage = (
    <section className={stageClassName} aria-labelledby={labelledBy}>
      <StageOrbs />
      {isAppLevel && <StageWordmark />}

      <div className={styles.layout}>
        <div className={styles.copy}>
          <p {...stageRevealProps(0, styles.eyebrow)}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            {eyebrow}
          </p>
          {children}
        </div>

        <div className={`${styles.visual} ${styles.visualReveal}`}>
          {visual}
          {visualCaption && (
            <p className={styles.visualCaption}>{visualCaption}</p>
          )}
        </div>
      </div>
    </section>
  );

  if (isAppLevel) {
    return (
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.appMain}>
        {stage}
      </main>
    );
  }
  return stage;
}

interface SystemStageTitleProps {
  id: string;
  /** Extra text heard with the heading, such as a hint under the lead. */
  describedBy?: string;
  revealIndex?: number;
  children: ReactNode;
}

/**
 * The stage's h1. On mount it scrolls the window to the top and takes focus,
 * once, so a screen reader starts on it. It is tabIndex -1, never a Tab stop.
 */
export function SystemStageTitle({
  id,
  describedBy,
  revealIndex = 1,
  children,
}: SystemStageTitleProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasFocusedHeadingRef = useRef(false);

  useEffect(() => {
    if (hasFocusedHeadingRef.current) return;
    hasFocusedHeadingRef.current = true;
    // "instant" because the global `scroll-behavior: smooth` would otherwise
    // animate the jump the reader never asked for.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <h1
      id={id}
      ref={headingRef}
      tabIndex={-1}
      aria-describedby={describedBy}
      {...stageRevealProps(revealIndex, styles.title)}
    >
      {children}
    </h1>
  );
}

/** The stage's lead paragraph, under the title. */
export function SystemStageLead({
  revealIndex = 2,
  children,
}: {
  revealIndex?: number;
  children: ReactNode;
}) {
  return <p {...stageRevealProps(revealIndex, styles.lead)}>{children}</p>;
}
