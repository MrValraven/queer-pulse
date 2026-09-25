import { useId } from "react";
import {
  Collapse,
  FilterChips,
  SegmentedControl,
  Select,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CLOSE_AFTER_CATEGORIES,
  NEIGHBOURHOOD_CATEGORIES,
} from "./composeCategories.data";
import { detectLanguage } from "./composeDetectLanguage";
import { NEIGHBOURHOODS } from "./composeNeighbourhoods.data";
import type { CloseAfter, PostLanguage } from "./composeThread.types";
import { ComposeSwapText } from "./ComposeSwapText";
import styles from "./ComposeDetailsSection.module.css";

// ── The optional details ────────────────────────────────────────────────────
// Three rows that each apply to some posts and not others, so each one is
// shown only where it means something, and the section itself disappears when
// none of them do. A composer that asks every member for a Lisbon
// neighbourhood is asking most of them for nothing.
//
// Clearing a field the member can no longer see is NOT done here: `setCategory`
// in `useComposeThreadState` drops the fields its new category does not offer,
// on the one write path that can invalidate them. This file only decides what
// to draw.
//
// Every one of those appearances goes through `Collapse`: the section and each
// row open and close with a height and fade, because they come and go as the
// member types and picks a category, and a jump there moves the whole column.

/** The three language choices offered. `auto` is the fourth state and is what
 *  "none of these is pressed" means. */
const LANGUAGE_CHOICES: readonly Exclude<PostLanguage, "auto">[] = [
  "pt",
  "en",
  "both",
];

/** The auto-close options, in the order they are offered. `poll` is appended
 *  only while a poll is attached. */
const CLOSE_AFTER_CHOICES: readonly CloseAfter[] = [
  "never",
  "2w",
  "30d",
  "90d",
];

export interface ComposeDetailsSectionProps {
  /** The selected category. Decides which of the three rows apply. */
  category: string | null;
  /** True when a poll is attached, which is the other way the auto-close row
   *  earns its place. */
  hasPoll: boolean;
  /** The draft body, read only to detect what language it is written in. */
  body: string;
  language: PostLanguage;
  onChangeLanguage: (language: PostLanguage) => void;
  neighbourhood: string | null;
  onChangeNeighbourhood: (neighbourhood: string | null) => void;
  closeAfter: CloseAfter;
  onChangeCloseAfter: (closeAfter: CloseAfter) => void;
}

export function ComposeDetailsSection({
  category,
  hasPoll,
  body,
  language,
  onChangeLanguage,
  neighbourhood,
  onChangeNeighbourhood,
  closeAfter,
  onChangeCloseAfter,
}: ComposeDetailsSectionProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const languageLabelId = useId();
  const neighbourhoodLabelId = useId();
  const closeAfterLabelId = useId();

  // Asking what language an empty post is written in has no answer yet, so the
  // row waits for the first words. That is also what lets the whole section
  // disappear on a fresh composer.
  const showsLanguage = body.trim().length > 0;
  const showsNeighbourhood =
    !!category && NEIGHBOURHOOD_CATEGORIES.includes(category);
  const showsCloseAfter =
    hasPoll || (!!category && CLOSE_AFTER_CATEGORIES.includes(category));
  const showsSection = showsLanguage || showsNeighbourhood || showsCloseAfter;

  const detected = language === "auto" ? detectLanguage(body) : null;
  const closeAfterChoices = hasPoll
    ? [...CLOSE_AFTER_CHOICES, "poll" as const]
    : CLOSE_AFTER_CHOICES;

  return (
    <Collapse isOpen={showsSection}>
      <section className={styles.section} aria-labelledby={headingId}>
        <div className={styles.head}>
          <h2 id={headingId} className={styles.title}>
            {t("forum:composePage.section.details.title")}
          </h2>
          <span className={styles.optional}>
            {t("forum:composePage.section.optional")}
          </span>
          <p className={styles.hint}>
            {t("forum:composePage.section.details.hint")}
          </p>
        </div>

        <Collapse isOpen={showsLanguage}>
          <div className={styles.row}>
            <span id={languageLabelId} className={styles.rowLabel}>
              {t("forum:composePage.details.language")}
            </span>
            <SegmentedControl
              options={LANGUAGE_CHOICES.map((choice) => ({
                value: choice,
                label: t(`forum:composePage.details.language.${choice}`),
              }))}
              value={language}
              // Pressing the chosen one again hands the decision back to the
              // page, which is the escape hatch a three-way control with a
              // hidden fourth state needs.
              onChange={(value) =>
                onChangeLanguage(
                  value === language ? "auto" : (value as PostLanguage),
                )
              }
              label={t("forum:composePage.details.language")}
            />
            <ComposeSwapText
              swapKey={detected ?? ""}
              className={styles.rowHint}
            >
              {detected &&
                t("forum:composePage.details.languageDetected", {
                  language: t(`forum:composePage.details.language.${detected}`),
                })}
            </ComposeSwapText>
          </div>
        </Collapse>

        <Collapse isOpen={showsNeighbourhood}>
          <div className={styles.row}>
            <span id={neighbourhoodLabelId} className={styles.rowLabel}>
              {t("forum:composePage.details.neighbourhood")}
            </span>
            <FilterChips
              options={NEIGHBOURHOODS.map((place) => ({
                value: place.id,
                label:
                  place.name ?? (place.labelKey ? t(place.labelKey) : place.id),
              }))}
              value={neighbourhood ?? ""}
              onChange={(value) =>
                onChangeNeighbourhood(value === neighbourhood ? null : value)
              }
              labelledBy={neighbourhoodLabelId}
            />
            <span className={styles.rowNote}>
              {t("forum:composePage.details.neighbourhoodHint")}
            </span>
          </div>
        </Collapse>

        <Collapse isOpen={showsCloseAfter}>
          <div className={styles.row}>
            <span id={closeAfterLabelId} className={styles.rowLabel}>
              {t("forum:composePage.details.closeAfter")}
            </span>
            <Select
              size="sm"
              labelledBy={closeAfterLabelId}
              value={closeAfter}
              onChange={(value) =>
                onChangeCloseAfter((value as CloseAfter | null) ?? "never")
              }
              options={closeAfterChoices.map((choice) => ({
                value: choice,
                label: t(`forum:composePage.closeAfter.${choice}`),
              }))}
            />
            <span className={styles.rowNote}>
              {t("forum:composePage.details.closeAfterHint")}
            </span>
          </div>
        </Collapse>
      </section>
    </Collapse>
  );
}
