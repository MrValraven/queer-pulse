import { DirectoryAccessibilityAnswers } from "../marketing/DirectoryAccessibilityAnswers";
import {
  ACCESSIBILITY_QUESTIONS,
  listingAnswerOf,
  normalizeAccessibilityAnswers,
} from "../marketing/listBusiness/listingAccessibility.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import styles from "./GatheringDetailPanels.module.css";

/**
 * The gathering's six accessibility answers, read by somebody deciding whether
 * they can leave the house for it.
 *
 * This renders through the DIRECTORY's own answers component on purpose. A
 * member who uses a wheelchair should meet the same six questions in the same
 * three-valued words whether they are reading a bar's page or a Tuesday supper
 * club's: the confirmed yeses leading as a list, then one quiet line for the
 * noes and one for what nobody has said yet, kept apart in both places. Two
 * components would drift; one cannot.
 *
 * The whole panel, heading included, stays hidden until the host has said
 * something: at least one yes or no, or a note. Six "not mentioned yet"
 * answers under their own heading would only tell a reader the form is blank.
 */
export function GatheringAccessPanel({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const answers = normalizeAccessibilityAnswers(gathering.accessibilityAnswers);
  const note = gathering.accessibilityNote?.trim() || null;
  const hasAnsweredQuestion = ACCESSIBILITY_QUESTIONS.some(
    (question) => listingAnswerOf(answers, question.slug) !== "unknown",
  );
  if (!hasAnsweredQuestion && note === null) return null;

  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>
        {t("gatherings:gathering.access.heading")}
      </h2>
      <p className={styles.lead}>{t("gatherings:gathering.access.lead")}</p>
      <DirectoryAccessibilityAnswers
        accessibility={{ answers, note }}
        ownerFirstName={gathering.hostFirst ?? ""}
      />
    </section>
  );
}
