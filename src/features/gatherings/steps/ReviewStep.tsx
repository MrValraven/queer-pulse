import { FiCheck } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { audienceScopeLabelKey } from "../audienceScope.data";
import {
  ACCESSIBILITY_ANSWER_BY_ID,
  ACCESSIBILITY_QUESTIONS,
} from "../../marketing/listBusiness/listingAccessibility.data";
import {
  CONFIRM_CHECK_KEYS,
  hoodLabelKey,
  langLabelKey,
  typeNameKey,
} from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import styles from "../CreateGatheringPage.module.css";

export function ReviewStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const TypeIcon = form.typeIcon;
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

  const scheduledAt = form.date
    ? new Date(`${form.date}T${form.time || "00:00"}`)
    : undefined;
  const dateTimeValue =
    scheduledAt && !Number.isNaN(scheduledAt.getTime())
      ? t("gatherings:create.step5.dateTimeValue", {
          date: fmt.date(scheduledAt, { day: "numeric", month: "short" }),
          time: fmt.time(scheduledAt),
        })
      : "—";

  const hoodLabel = form.hood ? t(hoodLabelKey(form.hood) ?? form.hood) : "—";
  const langLabel = t(langLabelKey(form.lang) ?? form.lang);
  const typeLabel = form.type ? t(typeNameKey(form.type) ?? form.type) : "—";

  const review = [
    {
      l: t("gatherings:create.step5.row.type"),
      v: (
        <>
          {TypeIcon && <TypeIcon />} <strong>{typeLabel}</strong>
        </>
      ),
    },
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
      {CONFIRM_CHECK_KEYS.map((textKey, i) => (
        <div
          key={textKey}
          className={styles.checkRow}
          onClick={() => form.toggleCheck(i)}
          role="checkbox"
          aria-checked={form.checks[i]}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              form.toggleCheck(i);
            }
          }}
        >
          <div
            className={[styles.check, form.checks[i] && styles.checkOn]
              .filter(Boolean)
              .join(" ")}
          >
            {form.checks[i] ? <FiCheck /> : ""}
          </div>
          <span className={styles.checkText}>{t(textKey)}</span>
        </div>
      ))}
      <div
        className={[
          styles.publishStatus,
          form.allChecked && styles.publishStatusReady,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {form.allChecked ? (
          t("gatherings:create.step5.allSet")
        ) : (
          <Translation
            i18nKey="gatherings:create.step5.progress"
            values={{ count: remaining, checkedCount: form.checkedCount }}
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
