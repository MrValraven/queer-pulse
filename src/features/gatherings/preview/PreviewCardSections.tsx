import {
  FiAlertTriangle,
  FiCheck,
  FiGlobe,
  FiImage,
  FiMapPin,
  FiMonitor,
  FiRepeat,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { VisibilityBadge } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import { ACCESSIBILITY_QUESTIONS } from "../../marketing/listBusiness/listingAccessibility.data";
import { audienceScopeLabelKey } from "../audienceScope.data";
import { findFamily } from "../gatheringCatalog";
import { CONTENT_NOTE_LABEL_KEYS, THEME_LABEL_KEYS } from "../gatheringExtras";
import type { GatheringForm } from "../useGatheringForm";
import {
  COVER_TINT_BY_FAMILY,
  DEFAULT_COVER_TINT,
  SCOPE_BADGE_TONE,
  type PreviewTint,
} from "./gatheringPreview.data";
import {
  isOnlineGathering,
  previewKind,
  previewLanguage,
  previewPlace,
  previewRepeatTag,
  previewSpots,
  type PreviewSchedule,
} from "./gatheringPreviewReading";
import styles from "./GatheringPreviewPanel.module.css";

const COVER_TINT_CLASS: Record<PreviewTint, string | undefined> = {
  coral: undefined,
  jade: styles.coverJade,
  plum: styles.coverPlum,
};

/** The cover photo, or a placeholder tinted by the family. */
export function PreviewCover({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const familyEntry = findFamily(form.family);
  const tint = form.family
    ? COVER_TINT_BY_FAMILY[form.family]
    : DEFAULT_COVER_TINT;
  return (
    <div className={cx(styles.cover, COVER_TINT_CLASS[tint])}>
      {form.coverPreviewUrl ? (
        <img src={form.coverPreviewUrl} alt="" />
      ) : (
        <span className={styles.coverPlaceholder}>
          <FiImage aria-hidden />
          {familyEntry
            ? t("gatherings:create.v2.preview.coverFamily", {
                family: t(familyEntry.nameKey),
              })
            : t("gatherings:create.v2.preview.coverEmpty")}
        </span>
      )}
    </div>
  );
}

/** The format chip and the audience badge. */
export function PreviewTopRow({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const { icon: KindIcon, label: kindLabel } = previewKind(form, t);
  return (
    <div className={styles.topRow}>
      <span className={cx(styles.kind, !kindLabel && styles.kindEmpty)}>
        {KindIcon && <KindIcon aria-hidden />}
        {kindLabel ?? t("gatherings:create.v2.preview.formatPlaceholder")}
      </span>
      <VisibilityBadge
        mode={SCOPE_BADGE_TONE[form.audienceScope]}
        label={t(audienceScopeLabelKey(form.audienceScope))}
        className={styles.scopeBadge}
      />
    </div>
  );
}

/** The big day number beside the weekday, month and clock. */
export function PreviewDateBlock({ schedule }: { schedule: PreviewSchedule }) {
  const { t } = useTranslation();
  return (
    <div className={styles.date}>
      <span className={cx(styles.day, !schedule.dayText && styles.dayEmpty)}>
        {schedule.dayText ?? t("gatherings:create.v2.preview.datePlaceholder")}
      </span>
      <span className={styles.dateLines}>
        {schedule.weekdayMonthText && <b>{schedule.weekdayMonthText}</b>}
        {schedule.timeText && <span>{schedule.timeText}</span>}
      </span>
    </div>
  );
}

/** Where, how many, and in which language. */
export function PreviewMetaRow({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const placeText = previewPlace(form, t);
  const spotsText = previewSpots(form, t);
  const languageText = previewLanguage(form, t);
  const PlaceIcon = isOnlineGathering(form) ? FiMonitor : FiMapPin;
  return (
    <div className={styles.meta}>
      <span>
        <PlaceIcon aria-hidden />
        {placeText ?? (
          <span className={styles.placeholder}>
            {t("gatherings:create.v2.preview.hoodPlaceholder")}
          </span>
        )}
      </span>
      {spotsText && (
        <span>
          <FiUsers aria-hidden />
          {spotsText}
        </span>
      )}
      {languageText && (
        <span>
          <FiGlobe aria-hidden />
          {languageText}
        </span>
      )}
    </div>
  );
}

/** Themes, then the repeat and accessibility tags, then content notes and
 *  house rules. Each line is left out while it has nothing in it. */
export function PreviewTagRows({
  form,
  occurrenceCount,
}: {
  form: GatheringForm;
  occurrenceCount: number;
}) {
  const { t } = useTranslation();
  const visibleThemes = form.themes.filter(
    (themeKey) => !form.hiddenThemeKeys.includes(themeKey),
  );
  const repeatTag = previewRepeatTag(form, occurrenceCount, t);
  const confirmedAccessQuestions = ACCESSIBILITY_QUESTIONS.filter(
    (question) => form.accessibilityAnswers[question.slug] === "yes",
  );
  const contentNoteLabels = form.contentNotes.map((noteKey) =>
    t(CONTENT_NOTE_LABEL_KEYS[noteKey]),
  );
  const hasTags = Boolean(repeatTag) || confirmedAccessQuestions.length > 0;
  const houseRules = form.houseRules.trim();
  return (
    <>
      {visibleThemes.length > 0 && (
        <div className={styles.tagRow}>
          {visibleThemes.map((themeKey) => (
            <span key={themeKey} className={styles.theme}>
              {t(THEME_LABEL_KEYS[themeKey])}
            </span>
          ))}
        </div>
      )}
      {hasTags && (
        <div className={styles.tagRow}>
          {repeatTag && (
            <span className={cx(styles.tag, styles.repeatTag)}>
              <FiRepeat aria-hidden />
              {repeatTag}
            </span>
          )}
          {confirmedAccessQuestions.map((question) => (
            <span key={question.slug} className={styles.tag}>
              <FiCheck aria-hidden />
              {t(question.labelKey)}
            </span>
          ))}
        </div>
      )}
      {contentNoteLabels.length > 0 && (
        <p className={styles.contentNotes}>
          <FiAlertTriangle aria-hidden />
          <span>
            {t("gatherings:create.v2.preview.contentNotes", {
              notes: contentNoteLabels.join(", "),
            })}
          </span>
        </p>
      )}
      {houseRules && (
        <p className={styles.houseRules}>
          <FiShield aria-hidden />
          <span>{houseRules}</span>
        </p>
      )}
    </>
  );
}
