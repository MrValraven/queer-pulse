import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button, FormField, StatGrid, StatTile } from "../../shared/components/ui";
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

/** Infer the subject from the reason + the free-text "who/what" field. */
function inferSubject(
  reason: ReasonCode | "",
  involved: string,
): ReportSubjectType {
  if (reason === "venue_safety") return "venue";
  if (/https?:\/\/|\//.test(involved)) return "post";
  return "member";
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
    // Live POSTs /reports (anonymous unless an email is given); demo resolves
    // locally. The backend derives severity + SLA and sends the acknowledgement.
    createReport.mutate(
      {
        subjectType: inferSubject(category, involved),
        subjectId: involved.trim() || "unspecified",
        reasonCode: category,
        detail: detail.trim() || undefined,
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

        <div className={s.formBox}>
          <div>
            <h3>
              <Translation
                i18nKey="safety:report.form.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("safety:report.form.lead")}</p>
            <form onSubmit={handleSubmit}>
              <FormField label={t("safety:report.form.categoryLabel")}>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ReasonCode | "")
                  }
                >
                  <option value="" disabled>
                    {t("safety:report.form.categoryPlaceholder")}
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {t(c.labelKey)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label={t("safety:report.form.involvedLabel")}>
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
