import { useMemo } from "react";
import { FiDisc } from "react-icons/fi";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowScreenStage } from "../screen/QuizshowScreenStage";
import { wheelSliceRoundIndexes } from "../quizshowWheel";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import {
  studioScreenClientStateOf,
  studioScreenStateFor,
} from "./quizshowStudioPreview";
import styles from "./QuizshowStudioSlide.module.css";

/**
 * A wheel row: the TV wheel at rest, drawn by the real big screen renderer
 * from the draft, so the studio shows what the TV shows. With fewer than two
 * rounds right after it, a panel says what is missing instead.
 */
export function QuizshowStudioSlideWheel({
  roundIndex,
}: {
  roundIndex: number;
}) {
  const { t } = useTranslation();
  const { controller, viewLanguage } = useQuizshowStudio();
  const { draft, pickedPreviewUrls } = controller;
  const clientState = useMemo(
    () =>
      studioScreenClientStateOf(
        studioScreenStateFor(
          draft,
          { kind: "round", roundIndex },
          { language: viewLanguage, phase: "open", pickedPreviewUrls },
        ),
      ),
    [draft, roundIndex, viewLanguage, pickedPreviewUrls],
  );
  const sliceCount = wheelSliceRoundIndexes(draft.rounds, roundIndex).length;
  if (sliceCount < QUIZSHOW_LIMITS.wheelSlicesMin) {
    return (
      <div className={styles.slide}>
        <div className={`${styles.centred} ${styles.wheelTooFew}`}>
          <FiDisc
            className={styles.wheelTooFewIcon}
            aria-hidden="true"
            focusable="false"
          />
          <p className={styles.wheelTooFewText}>
            {t("quizshow:studio.inspector.wheel.tooFew")}
          </p>
        </div>
      </div>
    );
  }
  return (
    <QuizshowScreenStage
      state={clientState}
      clockOffsetMs={0}
      size="screen"
      isJoinHidden
      isFixedCanvas
    />
  );
}
