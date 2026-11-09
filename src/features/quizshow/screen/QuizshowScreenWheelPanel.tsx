import { Fragment, type ReactNode } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowWheelBonusView,
  QuizshowWheelPick,
  QuizshowWheelSlice,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { wheelSliceTones, type QuizshowWheelSliceTone } from "../quizshowWheel";
import {
  QuizshowWheelBonusChip,
  QuizshowWheelContentChip,
  QuizshowWheelKindLabel,
  QuizshowWheelSwatch,
} from "../stage/QuizshowWheelChips";
import {
  wheelBonusTargetKey,
  wheelSliceMetaCopy,
  wheelSliceTitleOf,
  type QuizshowRoundKindRows,
} from "../stage/quizshowWheelCopy";
import {
  drawnWheelSlicesOf,
  playedWheelSlicesOf,
} from "../stage/quizshowWheelView";
import { EmphasisText } from "./QuizshowScreenChrome";
import { QuizshowScreenWheelBonus } from "./QuizshowScreenWheelBonus";
import styles from "./QuizshowScreenWheel.module.css";

/** At this many drawn slices the list rows tighten, so eight rows, the played line and a bonus fit. */
const TIGHT_LIST_FROM = 7;
/** A result title longer than this steps down a size, so it stays within three lines. */
const LONG_RESULT_TITLE_FROM = 22;

/**
 * One of the two panels sharing the left cell. The hidden one fades out,
 * then leaves the accessibility tree and the tab order.
 */
function WheelPanelFrame({
  isShown,
  panel,
  children,
}: {
  isShown: boolean;
  panel: "choose" | "result";
  children: ReactNode;
}) {
  return (
    <section
      className={styles.panel}
      data-panel={panel}
      data-shown={String(isShown)}
      aria-hidden={isShown ? undefined : "true"}
      inert={!isShown}
    >
      {children}
    </section>
  );
}

function SliceRow({
  slice,
  rounds,
  tone,
  pick,
  language,
}: {
  slice: QuizshowWheelSlice;
  rounds: QuizshowRoundKindRows;
  tone: QuizshowWheelSliceTone;
  pick: QuizshowWheelPick;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  const hasChips = slice.wheelBonus > 0 || pick === "question";
  return (
    <li className={styles.sliceRow} data-round-index={slice.roundIndex}>
      <span className={styles.swatchCell}>
        <QuizshowWheelSwatch tone={tone} />
      </span>
      <span className={styles.sliceTitle}>
        {wheelSliceTitleOf(slice, rounds, language, t)}
      </span>
      <span className={styles.sliceEnd}>
        {hasChips && (
          <span className={styles.sliceChips}>
            {slice.wheelBonus > 0 && (
              <QuizshowWheelBonusChip points={slice.wheelBonus} />
            )}
            {pick === "question" && (
              <QuizshowWheelContentChip contentLabel={slice.contentLabel} />
            )}
          </span>
        )}
        <QuizshowWheelKindLabel kind={slice.kind} />
      </span>
    </li>
  );
}

/** "Played: Eurovision, Ballroom", each title struck through, two lines at most. */
function PlayedLine({
  playedSlices,
  rounds,
  language,
}: {
  playedSlices: readonly QuizshowWheelSlice[];
  rounds: QuizshowRoundKindRows;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  if (playedSlices.length === 0) return null;
  return (
    <p className={styles.played}>
      {t("quizshow:stage.wheel.playedLabel")}{" "}
      {playedSlices.map((slice, sliceIndex) => (
        <Fragment key={slice.roundIndex}>
          {sliceIndex > 0 && ", "}
          <s>{wheelSliceTitleOf(slice, rounds, language, t)}</s>
        </Fragment>
      ))}
    </p>
  );
}

/** "Still on the wheel": the drawn slices with their chips, what has played, and a just-awarded bonus at the foot. */
export function WheelChoosePanel({
  wheel,
  wheelBonus,
  rounds,
  language,
  isShown,
}: {
  wheel: QuizshowWheelView;
  wheelBonus: QuizshowWheelBonusView | null;
  rounds: QuizshowRoundKindRows;
  language: QuizshowLanguage;
  isShown: boolean;
}): ReactNode {
  const { t } = useTranslation();
  const drawnSlices = drawnWheelSlicesOf(wheel);
  const tones = wheelSliceTones(drawnSlices);
  return (
    <WheelPanelFrame isShown={isShown} panel="choose">
      <p className={styles.eyebrow}>{t("quizshow:stage.wheel.eyebrow")}</p>
      <h1 className={styles.chooseTitle}>
        <EmphasisText i18nKey="quizshow:stage.wheel.titleEm" />
      </h1>
      <ul
        className={styles.sliceList}
        data-density={drawnSlices.length >= TIGHT_LIST_FROM ? "tight" : "roomy"}
      >
        {drawnSlices.map((slice, sliceIndex) => (
          <SliceRow
            key={slice.roundIndex}
            slice={slice}
            rounds={rounds}
            tone={tones[sliceIndex] ?? "plum"}
            pick={wheel.pick}
            language={language}
          />
        ))}
      </ul>
      <PlayedLine
        playedSlices={playedWheelSlicesOf(wheel)}
        rounds={rounds}
        language={language}
      />
      <div className={styles.panelFoot}>
        <QuizshowScreenWheelBonus
          bonus={wheelBonus}
          rounds={rounds}
          language={language}
          variant="panel"
        />
      </div>
    </WheelPanelFrame>
  );
}

/** "Up next": the landed slice's full title, its meta line, its content label and its bonus. */
export function WheelResultPanel({
  slice,
  rounds,
  pick,
  language,
  isShown,
}: {
  /** The slice to draw; null only when the spin's index falls outside the drawn slices. */
  slice: QuizshowWheelSlice | null;
  rounds: QuizshowRoundKindRows;
  pick: QuizshowWheelPick;
  language: QuizshowLanguage;
  isShown: boolean;
}): ReactNode {
  const { t } = useTranslation();
  const title =
    slice === null ? "" : wheelSliceTitleOf(slice, rounds, language, t);
  const meta = slice === null ? null : wheelSliceMetaCopy(slice, pick);
  return (
    <WheelPanelFrame isShown={isShown} panel="result">
      <p className={styles.eyebrow}>{t("quizshow:stage.wheel.upNext")}</p>
      <h1
        className={styles.resultTitle}
        data-long={String(title.length > LONG_RESULT_TITLE_FROM)}
      >
        {title}
      </h1>
      {slice !== null && meta !== null && (
        <div className={styles.resultMetaRow}>
          <p className={styles.resultMeta}>{t(meta.key, meta.values)}</p>
          <span className={styles.resultChip}>
            <QuizshowWheelContentChip contentLabel={slice.contentLabel} />
          </span>
        </div>
      )}
      {slice !== null && slice.wheelBonus > 0 && (
        <p className={styles.callout}>
          <b className={styles.calloutNumber}>
            {t("quizshow:stage.wheel.bonusPoints", {
              points: slice.wheelBonus,
            })}
          </b>
          <span>{t(wheelBonusTargetKey(pick))}</span>
        </p>
      )}
      <p className={styles.readyHint}>
        {t("quizshow:stage.wheel.startsWhenReady")}
      </p>
    </WheelPanelFrame>
  );
}
