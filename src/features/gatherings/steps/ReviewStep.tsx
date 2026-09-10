import type { IconType } from "react-icons";
import { FiCheck, FiCheckCircle, FiCircle } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { audienceScopeLabelKey } from "../audienceScope.data";
import {
  ACCESSIBILITY_ANSWER_BY_ID,
  ACCESSIBILITY_QUESTIONS,
} from "../../marketing/listBusiness/listingAccessibility.data";
import {
  CONFIRM_CHECK_KEYS,
  confirmAnchor,
  hoodLabelKey,
  langLabelKey,
} from "../createGathering.data";
import {
  findFamily,
  findFormat,
  hasAnyDetail,
  OTHER_FORMAT_ICON,
  OTHER_FORMAT_KEY,
  TERRAIN_LABEL_KEYS,
  type FormatDetails,
} from "../gatheringCatalog";
import { gatheringWhen } from "../gatheringSchedule";
import type { GatheringForm } from "../useGatheringForm";
import { StepRequirementBadge } from "./StepRequirement";
import styles from "../CreateGatheringPage.module.css";

/** The day shape the review row has always used. A weekday would push the row
 *  wide on a span, and the host picked these dates a screen ago. */
const REVIEW_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

/**
 * The schedule row: the whole span the host is about to publish, read through
 * the one shared formatter every other surface uses, so the review says what
 * the gathering page will say.
 *
 * The next-day note travels with it. An overnight party belongs on the screen a
 * host confirms rather than in the surprise afterwards.
 *
 * An end that does not land after the start is left off the reading entirely.
 * Step 2 is where a backwards schedule gets fixed and says so; this row is a
 * reading of the form rather than a second gate on it.
 */
function reviewScheduleValue(
  form: GatheringForm,
  fmt: Formatters,
  t: TFunction,
): string {
  // The `time || "19:00"` and `endDate || date` fallbacks are the ones
  // `useGatheringForm` and `formToCreateEventDto` both apply, so the host is
  // shown the instants that will actually be submitted.
  const startAt = form.date
    ? new Date(`${form.date}T${form.time || "19:00"}`)
    : null;
  if (!startAt || Number.isNaN(startAt.getTime())) return "—";
  const endAt = form.endTime
    ? new Date(`${form.endDate || form.date}T${form.endTime}`)
    : null;
  // `form.scheduleValid` is the one rule about whether an end is usable: it is
  // step 2's own gate and it mirrors the backend's `assertScheduleValid`. A
  // hand-rolled "is the end after the start?" here would be a second, laxer
  // copy that accepts a span past the 14-day cap and describes a schedule the
  // wizard refuses. It is true for a form with no end time at all, which is
  // why `endAt` is still checked for existence.
  const hasReadableEnd =
    form.scheduleValid && endAt !== null && !Number.isNaN(endAt.getTime());
  const when = gatheringWhen(
    startAt,
    hasReadableEnd ? endAt : null,
    fmt,
    t,
    REVIEW_DATE_OPTIONS,
  );
  const scheduleLine = t("gatherings:create.step5.dateTimeValue", {
    date: when.dateText,
    time: when.timeText,
  });
  if (!when.nextDayNote) return scheduleLine;
  return t("gatherings:create.step5.dateTimeNote", {
    when: scheduleLine,
    note: when.nextDayNote,
  });
}

/**
 * What the type row reads. Family and format come together, since neither half
 * alone says what the evening is: "Eat and drink, Supper club", or the host's
 * own words beside the family when they picked "something else".
 *
 * The icon is read off the catalog rather than carried in form state: the pick
 * is a key, and a key is enough to find the glyph again.
 *
 * A family with no format yet reads as the family alone, and a form with
 * neither reads as the em dash every other unanswered row uses.
 */
function reviewTypeReading(
  form: GatheringForm,
  t: TFunction,
): { icon: IconType | undefined; label: string } {
  const familyEntry = findFamily(form.family);
  const formatEntry = findFormat(form.format);
  const isHostWritten = form.format === OTHER_FORMAT_KEY;
  const formatText = isHostWritten
    ? form.otherText.trim()
    : formatEntry
      ? t(formatEntry.nameKey)
      : "";
  const label =
    familyEntry && formatText
      ? t("gatherings:create.step5.typeValue", {
          family: t(familyEntry.nameKey),
          format: formatText,
        })
      : familyEntry
        ? t(familyEntry.nameKey)
        : "—";
  return {
    icon: isHostWritten ? OTHER_FORMAT_ICON : formatEntry?.icon,
    label,
  };
}

/**
 * The family's own questions, answered, one tag each, in the order the wizard
 * asked them. The bag handed in is the stripped one the submit will carry, so
 * this reads back what will actually be stored rather than what was typed and
 * then made irrelevant by a change of family.
 */
function FormatDetailTags({ details }: { details: FormatDetails | null }) {
  const { t } = useTranslation();
  return (
    <span className={styles.reviewAccess}>
      {details?.bring && (
        <span className={styles.reviewAccessTag}>
          {t("gatherings:catalog.goodToKnow.bring", { value: details.bring })}
        </span>
      )}
      {details?.isAdultsOnly && (
        <span className={styles.reviewAccessTag}>
          {t("gatherings:catalog.goodToKnow.adultsOnly")}
        </span>
      )}
      {details?.isSoberFriendly && (
        <span className={styles.reviewAccessTag}>
          {t("gatherings:catalog.goodToKnow.soberFriendly")}
        </span>
      )}
      {details?.terrain && (
        <span className={styles.reviewAccessTag}>
          {t("gatherings:catalog.goodToKnow.terrain", {
            value: t(TERRAIN_LABEL_KEYS[details.terrain]),
          })}
        </span>
      )}
      {details?.isBeginnerFriendly && (
        <span className={styles.reviewAccessTag}>
          {t("gatherings:catalog.goodToKnow.beginnerFriendly")}
        </span>
      )}
      {details?.runtimeMinutes !== undefined && (
        <span className={styles.reviewAccessTag}>
          {t("gatherings:catalog.goodToKnow.runtime", {
            minutes: details.runtimeMinutes,
          })}
        </span>
      )}
    </span>
  );
}

export function ReviewStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // Only the questions the host actually answered are listed back, each with
  // its own word: an unanswered question is reported as a count underneath
  // rather than shown as a quiet "no". The pledge below is about exactly this.
  const answered = ACCESSIBILITY_QUESTIONS.filter(
    (question) => form.accessibilityAnswers[question.slug] !== "unknown",
  );
  const unansweredCount = ACCESSIBILITY_QUESTIONS.length - answered.length;
  const accessVal =
    answered.length || form.accessNotes.trim() ? (
      <span className={styles.reviewAccess}>
        {answered.map((question) => {
          const answer = form.accessibilityAnswers[question.slug];
          const AnswerIcon = ACCESSIBILITY_ANSWER_BY_ID[answer].icon;
          return (
            <span
              key={question.slug}
              className={styles.reviewAccessTag}
              data-answer={answer}
            >
              <AnswerIcon aria-hidden />{" "}
              {t("gatherings:create.step5.accessAnswer", {
                question: t(question.labelKey),
                answer: t(ACCESSIBILITY_ANSWER_BY_ID[answer].readerKey),
              })}
            </span>
          );
        })}
        {form.accessNotes.trim() && (
          <span className={styles.reviewAccessNote}>
            {form.accessNotes.trim()}
          </span>
        )}
        {unansweredCount > 0 && (
          <span className={styles.reviewAccessEmpty}>
            {t("gatherings:create.step5.accessUnanswered", {
              count: unansweredCount,
            })}
          </span>
        )}
      </span>
    ) : (
      <span className={styles.reviewAccessEmpty}>
        {t("gatherings:create.step5.accessEmpty")}
      </span>
    );

  const dateTimeValue = reviewScheduleValue(form, fmt, t);

  const hoodLabel = form.hood ? t(hoodLabelKey(form.hood) ?? form.hood) : "—";
  const langLabel = t(langLabelKey(form.lang) ?? form.lang);
  const { icon: TypeIcon, label: typeLabel } = reviewTypeReading(form, t);

  const review = [
    {
      l: t("gatherings:create.step5.row.type"),
      v: (
        <>
          {TypeIcon && <TypeIcon />} <strong>{typeLabel}</strong>
        </>
      ),
    },
    // Only when the host actually answered one of the family's questions. A
    // row reading "Good to know: nothing" is worse than no row.
    ...(hasAnyDetail(form.submittedFormatDetails)
      ? [
          {
            l: t("gatherings:create.step5.row.formatDetails"),
            v: <FormatDetailTags details={form.submittedFormatDetails} />,
          },
        ]
      : []),
    {
      l: t("gatherings:create.step5.row.title"),
      v: <strong>{form.title || "—"}</strong>,
    },
    { l: t("gatherings:create.step5.row.dateTime"), v: dateTimeValue },
    {
      l: t("gatherings:create.step5.row.location"),
      v: t("gatherings:create.step5.locationValue", {
        venue: form.venue || "—",
        hood: hoodLabel,
      }),
    },
    {
      l: t("gatherings:create.step5.row.capacity"),
      v: t("gatherings:create.step5.capacityValue", {
        cap: form.cap || "—",
        lang: langLabel,
      }),
    },
    {
      l: t("gatherings:create.step5.row.cost"),
      v: form.cost.trim() ? (
        <strong>{form.cost.trim()}</strong>
      ) : (
        t("gatherings:create.step5.costFree")
      ),
    },
    {
      l: t("gatherings:create.step5.row.audience"),
      v: <strong>{t(audienceScopeLabelKey(form.audienceScope))}</strong>,
    },
    { l: t("gatherings:create.step5.row.accessibility"), v: accessVal },
    {
      l: t("gatherings:create.step5.row.repeats"),
      v: form.repeats ? (
        <strong>
          {t(`gatherings:create.repeats.cadence.${form.cadence}`)}
          {form.endType === "count"
            ? ` · ${t("gatherings:create.step5.repeatsUntilCount", { occurrences: form.endCount || "—" })}`
            : ` · ${t("gatherings:create.step5.repeatsUntilDate", {
                date: form.endUntil
                  ? fmt.date(new Date(form.endUntil), {
                      day: "numeric",
                      month: "short",
                    })
                  : "—",
              })}`}
        </strong>
      ) : (
        t("gatherings:create.step5.repeatsOff")
      ),
    },
  ];
  const PublishStatusIcon = form.allChecked ? FiCheckCircle : FiCircle;
  const remaining = CONFIRM_CHECK_KEYS.length - form.checkedCount;
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step5.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step5.sub")}</p>
      <StepRequirementBadge required={true} />
      <div className={styles.reviewGrid}>
        {review.map((r) => (
          <div className={styles.reviewRow} key={r.l}>
            <div className={styles.reviewLbl}>{r.l}</div>
            <div className={styles.reviewVal}>{r.v}</div>
          </div>
        ))}
      </div>
      <div className={styles.label} style={{ marginBottom: 4 }}>
        {t("gatherings:create.step5.confirmHeading")}
      </div>
      <p className={styles.checkIntro}>
        <Translation
          i18nKey="gatherings:create.step5.confirmIntro"
          components={{ strong: <strong /> }}
        />
      </p>
      {CONFIRM_CHECK_KEYS.map((textKey, index) => (
        <ConfirmCheckRow
          key={textKey}
          anchorId={confirmAnchor(index)}
          label={t(textKey)}
          isChecked={form.checks[index] ?? false}
          onToggle={() => form.toggleCheck(index)}
        />
      ))}
      <div
        className={[
          styles.publishStatus,
          form.allChecked && styles.publishStatusReady,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <PublishStatusIcon aria-hidden />
        {form.allChecked ? (
          t("gatherings:create.step5.allSet")
        ) : (
          <Translation
            i18nKey="gatherings:create.step5.progress"
            values={{
              count: remaining,
              checkedCount: form.checkedCount,
              total: CONFIRM_CHECK_KEYS.length,
            }}
            components={{
              num: <span className={styles.checkCount} />,
              remaining: <span className={styles.checkCount} />,
            }}
          />
        )}
      </div>
    </div>
  );
}

/** One publish-gating confirmation. Kept out of `ReviewStep` so the step
 *  reads as its own sections rather than as one long checkbox body. */
function ConfirmCheckRow({
  anchorId,
  label,
  isChecked,
  onToggle,
}: {
  /** What the "still to do" checklist jumps to for this pledge. */
  anchorId: string;
  label: string;
  isChecked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      id={anchorId}
      className={styles.checkRow}
      onClick={onToggle}
      role="checkbox"
      aria-checked={isChecked}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <div
        className={[styles.check, isChecked && styles.checkOn]
          .filter(Boolean)
          .join(" ")}
      >
        {isChecked ? <FiCheck /> : ""}
      </div>
      <span className={styles.checkText}>{label}</span>
    </div>
  );
}
