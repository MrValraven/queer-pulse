import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  Button,
  FormField,
  Select,
  StatGrid,
  StatTile,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useCreateReport } from "./api/useCreateReport";
import type { ReasonCode, ReportSubjectType } from "./reportReasons";
import { logError } from "../../shared/observability/logger";
import s from "./ReportPage.module.css";

/** The standalone form's categories, mapped to the shared reason taxonomy. */
const CATEGORIES: { code: ReasonCode; labelKey: string }[] = [
  { code: "harassment", labelKey: "safety:report.category.harassment" },
  {
    code: "unwanted_contact",
    labelKey: "safety:report.category.unwantedContact",
  },
  {
    code: "impersonation",
    labelKey: "safety:report.category.impersonation",
  },
  { code: "discrimination", labelKey: "safety:report.category.discrimination" },
  { code: "venue_safety", labelKey: "safety:report.category.venueSafety" },
  { code: "other", labelKey: "safety:report.category.other" },
];

/** i18n Pattern A — chrome list, sole consumer is `ReportFormSection`. */
const FLOW = [
  {
    number: "01",
    titleKey: "safety:report.flow.step1.title",
    descriptionKey: "safety:report.flow.step1.desc",
  },
  {
    number: "02",
    titleKey: "safety:report.flow.step2.title",
    descriptionKey: "safety:report.flow.step2.desc",
  },
  {
    number: "03",
    titleKey: "safety:report.flow.step3.title",
    descriptionKey: "safety:report.flow.step3.desc",
  },
  {
    number: "04",
    titleKey: "safety:report.flow.step4.title",
    descriptionKey: "safety:report.flow.step4.desc",
  },
];

const PRINCIPLES = [
  {
    strongKey: "safety:report.principles.believeReporter.strong",
    restKey: "safety:report.principles.believeReporter.rest",
  },
  {
    strongKey: "safety:report.principles.noVagueWarnings.strong",
    restKey: "safety:report.principles.noVagueWarnings.rest",
  },
  {
    strongKey: "safety:report.principles.transparency.strong",
    restKey: "safety:report.principles.transparency.rest",
  },
  {
    strongKey: "safety:report.principles.noPermanentDecisions.strong",
    restKey: "safety:report.principles.noPermanentDecisions.rest",
  },
  {
    strongKey: "safety:report.principles.communityOwns.strong",
    restKey: "safety:report.principles.communityOwns.rest",
  },
];

/** Aggregate moderation stats. The counts are mock report data (content —
 * the live-mode equivalent of a fetched quarterly report); only the label
 * next to each count is platform chrome and gets translated. */
const LOG = [
  { number: "14", labelKey: "safety:report.modLog.stat.received" },
  { number: "12", labelKey: "safety:report.modLog.stat.resolved" },
  { number: "3", labelKey: "safety:report.modLog.stat.removed" },
  { number: "2", labelKey: "safety:report.modLog.stat.appeals" },
  { number: "1", labelKey: "safety:report.modLog.stat.reversed" },
];

/**
 * This public form has no subject picker, so nothing a reporter types here
 * identifies a record. `subjectId` therefore carries a fixed sentinel rather
 * than the reporter's own words: sending free text as an id produced reports
 * addressed to things like "the guy from Friday", which no moderator can open
 * and no moderation action can attach to. The words themselves are far more
 * useful inside `detail`, where they read as the account they are.
 */
const UNLINKED_SUBJECT_ID = "unspecified";

/**
 * The reported category is the only real signal about what KIND of thing a
 * report concerns: venue-safety reports are about a place, everything else
 * about a person. This is a straight read of the reporter's own choice, not
 * the old heuristic that turned "contains a slash" into `subjectType: "post"`.
 * Neither branch carries an id — see {@link UNLINKED_SUBJECT_ID}.
 */
function subjectTypeForCategory(reason: ReasonCode): ReportSubjectType {
  return reason === "venue_safety" ? "venue" : "member";
}

/** The "how reporting works" preamble — flow steps 01–04. Lives on the
 *  guidelines page (ReportingGuidePage), separate from the form. */
export function ReportFlowSection() {
  const { t } = useTranslation();
  return (
    <section className={s.section}>
      <div className="wrap">
        <h2>
          <Translation
            i18nKey="safety:report.how.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={s.lead}>{t("safety:report.how.lead")}</p>
        <div className={s.flow}>
          {FLOW.map((f) => (
            <div key={f.number} className={s.flowStep}>
              <div className={s.flowN}>{f.number}</div>
              <div className={s.flowTitle}>{t(f.titleKey)}</div>
              <div className={s.flowDesc}>{t(f.descriptionKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReportFormSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createReport = useCreateReport();
  const [category, setCategory] = useState<ReasonCode | "">("");
  const [involved, setInvolved] = useState("");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!category) {
      showToast(t("safety:report.toast.chooseCategory"), "error");
      return;
    }
    const done = () => {
      showToast(t("safety:report.toast.received"), "success");
      setCategory("");
      setInvolved("");
      setDetail("");
      setEmail("");
    };
    // The "who or what was involved" line is a description, so it travels with
    // the account of what happened rather than posing as a subject id.
    const involvedText = involved.trim();
    const detailText = detail.trim();
    const describedSubject = involvedText
      ? t("safety:report.detail.involvedLine", { involved: involvedText })
      : "";
    const composedDetail = [describedSubject, detailText]
      .filter(Boolean)
      .join("\n\n");
    // Live POSTs /reports (anonymous unless an email is given); demo resolves
    // locally. The backend derives severity + SLA and sends the acknowledgement.
    createReport.mutate(
      {
        subjectType: subjectTypeForCategory(category),
        subjectId: UNLINKED_SUBJECT_ID,
        reasonCode: category,
        detail: composedDetail || undefined,
        anonymous: email.trim().length === 0,
        contactEmail: email.trim() || undefined,
      },
      {
        onSuccess: done,
        onError: (err) => {
          logError(err, { scope: "safety.reportPage" });
          // Never tell a reporter "received" when the report didn't land —
          // surface an honest error and leave the form filled in to retry.
          showToast(t("safety:report.toast.submitError"), "error");
        },
      },
    );
  };

  return (
    <section className={s.section}>
      <div className="wrap">
        <div className={s.formBox}>
          <div>
            <form onSubmit={handleSubmit}>
              <FormField label={t("safety:report.form.categoryLabel")}>
                <Select
                  placeholder={t("safety:report.form.categoryPlaceholder")}
                  value={category || null}
                  onChange={(value) =>
                    setCategory((value ?? "") as ReasonCode | "")
                  }
                  options={CATEGORIES.map((c) => ({
                    value: c.code,
                    label: t(c.labelKey),
                  }))}
                />
              </FormField>
              <FormField
                label={t("safety:report.form.involvedLabel")}
                helper={t("safety:report.form.involvedHelper")}
              >
                <input
                  type="text"
                  placeholder={t("safety:report.form.involvedPlaceholder")}
                  value={involved}
                  onChange={(e) => setInvolved(e.target.value)}
                />
              </FormField>
              <FormField label={t("safety:report.form.detailLabel")}>
                <textarea
                  placeholder={t("safety:report.form.detailPlaceholder")}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                />
              </FormField>
              <FormField label={t("safety:report.form.emailLabel")}>
                <input
                  type="email"
                  placeholder={t("safety:report.form.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
              <div style={{ marginTop: 16 }}>
                <Button type="submit" disabled={createReport.isPending}>
                  {createReport.isPending
                    ? t("safety:report.form.submitting")
                    : t("safety:report.form.submitCta")}
                </Button>
              </div>
              <div className={s.fineprint}>
                {t("safety:report.form.fineprint")}
              </div>
            </form>
          </div>
          <div>
            <div className={s.princLabel}>
              {t("safety:report.principles.eyebrow")}
            </div>
            {PRINCIPLES.map((p) => (
              <div key={p.strongKey} className={s.principle}>
                <span className={s.princDot} />
                <span>
                  <strong>{t(p.strongKey)}</strong> {t(p.restKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ModerationLogSection() {
  const { t } = useTranslation();
  return (
    <section className={s.section}>
      <div className="wrap">
        <h2>
          <Translation
            i18nKey="safety:report.transparency.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={s.lead}>{t("safety:report.transparency.lead")}</p>
        <div className={s.modLog}>
          <h3>
            <Translation
              i18nKey="safety:report.modLog.title"
              components={{ em: <em /> }}
            />
          </h3>
          <p>{t("safety:report.modLog.meta")}</p>
          <StatGrid tone="contrast">
            {LOG.map((stat) => (
              <StatTile
                key={stat.labelKey}
                value={stat.number}
                label={t(stat.labelKey)}
              />
            ))}
          </StatGrid>
          <div className={s.modActions}>
            <Button variant="ghost-dark" to={routes.governance}>
              {t("safety:report.modLog.viewReportCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
