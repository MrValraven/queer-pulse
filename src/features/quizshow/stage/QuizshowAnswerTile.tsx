import type { CSSProperties } from "react";
import { m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowTeamColorKey } from "../../../shared/contracts/quizshow";
import { QuizshowShape } from "../QuizshowShape";
import { QUIZSHOW_SWATCHES } from "../quizshowSwatches";
import styles from "./QuizshowStage.module.css";
import type { QuizshowStageSize } from "./quizshowText";

type QuizshowAnswerTileState = "idle" | "selected" | "correct" | "dimmed";

/** How many players picked this answer, and their share of everyone who answered (0 to 100). */
export interface QuizshowAnswerShare {
  count: number;
  percent: number;
}

interface QuizshowAnswerTileProps {
  colorKey: QuizshowTeamColorKey;
  letter: string;
  text: string;
  size: QuizshowStageSize;
  state: QuizshowAnswerTileState;
  onSelect?: () => void;
  isDisabled?: boolean;
  ariaLabel: string;
  /** The vote share at reveal. Drawn only on a `correct` or `dimmed` tile. */
  share?: QuizshowAnswerShare | null;
}

const STATE_CLASS_NAMES: Record<QuizshowAnswerTileState, string> = {
  idle: styles.tileIdle ?? "",
  selected: styles.tileSelected ?? "",
  correct: styles.tileCorrect ?? "",
  dimmed: styles.tileDimmed ?? "",
};

const SHAPE_SIZES = {
  screen: "screen",
  phone: "medium",
  preview: "small",
} as const;

const PERCENT_FORMAT: Intl.NumberFormatOptions = {
  style: "percent",
  maximumFractionDigits: 0,
};

const SHARE_EASE = [0.22, 0.68, 0.16, 1] as const;

/** The bar along the tile's bottom. It grows from the left once, at reveal. */
function TileShareBar({ percent }: { percent: number }) {
  const { reducedMotion } = useMotionPrefs();
  const shareStyle = {
    "--quizshow-share": Math.min(100, Math.max(0, percent)),
  } as CSSProperties;
  return (
    <m.span
      className={styles.shareBar}
      style={shareStyle}
      aria-hidden="true"
      initial={{ scaleX: reducedMotion ? 1 : 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.6, ease: SHARE_EASE }}
    />
  );
}

/** The share as text on the right: the percent rolls up from zero, the count sits under it. */
function TileShareText({ share }: { share: QuizshowAnswerShare }) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <span className={styles.share}>
      <RollingNumber
        className={styles.sharePercent}
        value={format.number(share.percent / 100, PERCENT_FORMAT)}
        numericValue={share.percent}
        revealFrom={{
          value: format.number(0, PERCENT_FORMAT),
          numericValue: 0,
        }}
      />
      <span className={styles.shareCount}>
        {t("quizshow:stage.votes", { count: share.count })}
      </span>
    </span>
  );
}

/** One answer: a letter, a shape and a colour, so no answer rests on colour alone.
 *  A button when `onSelect` is set (phones), a plain group otherwise (the screen). */
export function QuizshowAnswerTile({
  colorKey,
  letter,
  text,
  size,
  state,
  onSelect,
  isDisabled = false,
  ariaLabel,
  share = null,
}: QuizshowAnswerTileProps) {
  const swatch = QUIZSHOW_SWATCHES[colorKey];
  const tileStyle = {
    "--quizshow-tile-fill": swatch.fillVar,
    "--quizshow-tile-ink": swatch.inkVar,
  } as CSSProperties;
  const className = [styles.tile, styles[size], STATE_CLASS_NAMES[state]]
    .filter(Boolean)
    .join(" ");
  const shownShare =
    share !== null && (state === "correct" || state === "dimmed")
      ? share
      : null;
  const content = (
    <>
      {shownShare !== null && <TileShareBar percent={shownShare.percent} />}
      <QuizshowShape
        colorKey={colorKey}
        size={SHAPE_SIZES[size]}
        label={null}
        isGlowing
      />
      <span className={styles.letter} aria-hidden="true">
        {letter}
      </span>
      <span className={styles.tileText}>{text}</span>
      {shownShare !== null && <TileShareText share={shownShare} />}
      {/* The correct answer carries a check as well as its jade edge, so it never rests on colour. The caller's label names it. */}
      {state === "correct" && (
        <span className={styles.tileCheck} aria-hidden="true">
          <FiCheck fill="none" focusable="false" />
        </span>
      )}
    </>
  );

  if (onSelect === undefined) {
    return (
      <div
        role="group"
        aria-label={ariaLabel}
        className={className}
        style={tileStyle}
      >
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      className={className}
      style={tileStyle}
      aria-label={ariaLabel}
      aria-pressed={state === "selected"}
      aria-disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) onSelect();
      }}
    >
      {content}
    </button>
  );
}
