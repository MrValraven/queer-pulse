import { useState } from "react";
import { FiAlertTriangle, FiShield, FiInfo, FiClock } from "react-icons/fi";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminDrawer, AdminChip, AdminCat, AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import {
  MOD_ACTIONS,
  MOD_REASONS,
  SEVERITY,
  chipKey,
  chipLabel,
  type ModReport,
  type ReportDetail,
} from "./adminModeration.data";
import { useReportAudit } from "./api/useReportAudit";
import { useModReportDetail } from "./api/useModReportDetail";
import type { ReasonCode } from "../safety/reportReasons";
import type { ResolveOpts } from "./useModerationQueue";
import styles from "./AdminModerationPage.module.css";

/** Reported content + surrounding thread + people involved (read-only context). */
function ReportContext({ detail }: { detail: ReportDetail }) {
  const { t } = useTranslation();
  return (
    <>
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.reportDrawer.contentTitle")}
        </h3>
        <p className={styles.dContentAuthor}>{detail.contentAuthor}</p>
        <blockquote className={styles.dExcerpt}>{detail.excerpt}</blockquote>
        {detail.redactionNote && (
          <p className={styles.dRedact}>
            <FiShield aria-hidden /> {detail.redactionNote}
          </p>
        )}
      </section>

      {detail.disputeReason && (
        <section className={styles.dSec}>
          <h3 className={styles.dSecLabel}>
            {t("admin:moderation.reportDrawer.disputeReasonTitle")}
          </h3>
          <blockquote className={styles.dClaim}>{detail.disputeReason}</blockquote>
        </section>
      )}

      {detail.listingEvidence && (
        <section className={styles.dSec}>
          <h3 className={styles.dSecLabel}>
            {t("admin:moderation.reportDrawer.listingEvidenceTitle")}
          </h3>
          <blockquote className={styles.dClaim}>
            {detail.listingEvidence}
          </blockquote>
        </section>
      )}

      {detail.contactEmail && (
        <section className={styles.dSec}>
          <h3 className={styles.dSecLabel}>
            {t("admin:moderation.reportDrawer.contactEmailTitle")}
          </h3>
          <p className={styles.dContentAuthor}>
            <a href={`mailto:${detail.contactEmail}`}>{detail.contactEmail}</a>
          </p>
        </section>
      )}

      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.reportDrawer.threadTitle")}
        </h3>
        <div className={styles.dThread}>
          {detail.thread.map((m, i) => (
            <div
              key={i}
              className={[styles.dMsg, m.flagged && styles.dMsgFlag]
                .filter(Boolean)
                .join(" ")}
            >
              <AdminAvatar
                initials={m.initials}
                tone={m.tone}
                size="sm"
                src={portrait(m.author)}
              />
              <div className={styles.dMsgBody}>
                <div className={styles.dMsgMeta}>
                  <span className={styles.dMsgAuthor}>{m.author}</span>
                  <span className={styles.dMsgTime}>{m.time}</span>
                  {m.flagged && (
                    <span className={styles.dMsgFlagTag}>
                      <FiAlertTriangle aria-hidden />{" "}
                      {t("admin:moderation.reportDrawer.flaggedTag")}
                    </span>
                  )}
                </div>
                <p className={styles.dMsgText}>{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.reportDrawer.peopleTitle")}
        </h3>
        <div className={styles.dPeople}>
          {detail.people.map((p) => (
            <div key={p.role} className={styles.dPerson}>
              <AdminAvatar
                initials={p.initials}
                tone={p.tone}
                size="md"
                verified={p.verified}
                src={portrait(p.name)}
              />
              <div className={styles.dPersonTx}>
                <span className={styles.dPersonName}>
                  {p.name}
                  {p.pronoun && (
                    <span className={styles.dPersonPronoun}>{p.pronoun}</span>
                  )}
                </span>
                <span className={styles.dPersonMeta}>{p.meta}</span>
                {p.chips && p.chips.length > 0 && (
                  <span className={styles.dPersonChips}>
                    {p.chips.map((chip) => (
                      <AdminChip key={chipKey(chip)} tone={chip.tone}>
                        {chipLabel(chip, t)}
                      </AdminChip>
                    ))}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/** Read-only immutable action history for a report (spec 04 audit trail). */
function ReportAudit({ reportId }: { reportId: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { data: entries } = useReportAudit(reportId);
  return (
    <section className={styles.dSec}>
      <h3 className={styles.dSecLabel}>
        {t("admin:moderation.reportDrawer.auditTitle")}
      </h3>
      {entries && entries.length > 0 ? (
        <ul className={styles.dAudit}>
          {entries.map((e) => (
            <li key={e.id} className={styles.dAuditRow}>
              <FiClock aria-hidden />
              <span>
                <strong>{e.actorName}</strong> · {e.action.replace(/_/g, " ")}
                {e.note ? `: ${e.note}` : ""}
              </span>
              <time>{fmt.date(new Date(e.at))}</time>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.dTransparency}>
          {t("admin:moderation.reportDrawer.auditEmpty")}
        </p>
      )}
    </section>
  );
}

/** Placeholder while the single-report detail is being fetched (live mode). */
function ReportContextLoading() {
  const { t } = useTranslation();
  return (
    <section
      className={styles.dSec}
      aria-busy="true"
      aria-label={t("admin:moderation.reportDrawer.contextLoading")}
    >
      <SkeletonLine height={14} width="40%" />
      <SkeletonLine height={64} style={{ marginTop: 12, borderRadius: 10 }} />
      <SkeletonLine height={48} style={{ marginTop: 12, borderRadius: 10 }} />
    </section>
  );
}

/** Minimal context assembled from the report's own summary, shown when no rich
 *  detail is attached — so a moderator can still act on an honest summary
 *  rather than the report auto-resolving out from under them. */
function ReportContextFallback({ report }: { report: ModReport }) {
  const { t } = useTranslation();
  const anonReporter = report.reporterName === "anonymous";
  const reportedInitials =
    (report.reportedName.replace(/^@/, "")[0] ?? "?").toUpperCase();
  return (
    <>
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.reportDrawer.contentTitle")}
        </h3>
        <p className={styles.dContentAuthor}>{report.reportedName}</p>
        <blockquote className={styles.dExcerpt}>{report.preview}</blockquote>
        <p className={styles.dTransparency}>
          <FiInfo aria-hidden />{" "}
          {t("admin:moderation.reportDrawer.limitedContext")}
        </p>
      </section>

      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.reportDrawer.peopleTitle")}
        </h3>
        <div className={styles.dPeople}>
          <div className={styles.dPerson}>
            <AdminAvatar
              initials={
                anonReporter ? "?" : (report.reporterName[0] ?? "?").toUpperCase()
              }
              tone={anonReporter ? "anon" : "plum"}
              size="md"
            />
            <div className={styles.dPersonTx}>
              <span className={styles.dPersonName}>{report.reporterName}</span>
              <span className={styles.dPersonMeta}>
                {t("admin:moderation.reportDrawer.reporterRole")}
              </span>
            </div>
          </div>
          <div className={styles.dPerson}>
            <AdminAvatar
              initials={reportedInitials}
              tone="coral"
              size="md"
              src={portrait(report.reportedName)}
            />
            <div className={styles.dPersonTx}>
              <span className={styles.dPersonName}>{report.reportedName}</span>
              <span className={styles.dPersonMeta}>
                {t("admin:moderation.reportDrawer.reportedRole")}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function AdminReportDrawer({
  report,
  onClose,
  onResolve,
}: {
  report: ModReport;
  onClose: () => void;
  /** Called when a report leaves the open queue (confirm or escalate). */
  onResolve: (id: string, opts?: ResolveOpts) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [action, setAction] = useState<string | null>(null);
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [note, setNote] = useState("");
  const { detail, loading } = useModReportDetail(report);

  const sev = SEVERITY[report.severity];

  const handleConfirm = () => {
    if (!action) {
      showToast(t("admin:moderation.reportDrawer.pickActionToast"), "error");
      return;
    }
    const chosen = MOD_ACTIONS.find((a) => a.id === action);
    onResolve(report.id, {
      verb: "resolved",
      action,
      reasonCode: reason ?? "other",
      note,
    });
    showToast(
      t("admin:moderation.reportDrawer.confirmedToast", {
        name: report.reportedName,
        verb: chosen
          ? t(chosen.doneKey)
          : t("admin:moderation.actions.actionedFallback"),
      }),
      "success",
    );
    onClose();
  };

  const handleEscalate = () => {
    onResolve(report.id, {
      verb: "escalated",
      action: "escalate",
      reasonCode: reason ?? "other",
      note,
    });
    showToast(t("admin:moderation.reportDrawer.escalatedToast"), "success");
    onClose();
  };

  return (
    <AdminDrawer
      label={t("admin:moderation.reportDrawer.label", { title: report.title })}
      onClose={onClose}
      head={
        <>
          <div className={styles.dHeadChips}>
            <AdminCat tone={sev.category}>{t(sev.labelKey)}</AdminCat>
            {report.chips.map((chip) => (
              <AdminChip key={chipKey(chip)} tone={chip.tone}>
                {chipLabel(chip, t)}
              </AdminChip>
            ))}
          </div>
          <h2 className={styles.dTitle}>
            {t("admin:moderation.reportDrawer.title")}
          </h2>
        </>
      }
      foot={
        <div className={styles.dFoot}>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:moderation.reportDrawer.cancelCta")}
          </Button>
          <Button variant="jade" onClick={handleEscalate}>
            {t("admin:moderation.reportDrawer.escalateCta")}
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            {t("admin:moderation.reportDrawer.confirmCta")}
          </Button>
        </div>
      }
    >
      {loading ? (
        <ReportContextLoading />
      ) : detail ? (
        <ReportContext detail={detail} />
      ) : (
        <ReportContextFallback report={report} />
      )}

      {/* Action grid */}
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.reportDrawer.decisionTitle")}
        </h3>
        <div className={styles.dActions}>
          {MOD_ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={action === a.id}
              className={[
                styles.dAction,
                styles[`dAction_${a.kind}`],
                action === a.id && styles.dActionOn,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setAction(a.id)}
            >
              <span className={styles.dActionLabel}>{t(a.labelKey)}</span>
              <span className={styles.dActionDesc}>{t(a.descriptionKey)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Reason + note */}
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.reportDrawer.reasonTitle")}
        </h3>
        <div
          className={styles.dReasons}
          role="radiogroup"
          aria-label={t("admin:moderation.reportDrawer.reasonAriaLabel")}
        >
          {MOD_REASONS.map((r) => (
            <label key={r.id} className={styles.dReason}>
              <input
                type="radio"
                name="mod-reason"
                value={r.id}
                checked={reason === r.id}
                onChange={() => setReason(r.id as ReasonCode)}
              />
              <span>{t(r.labelKey)}</span>
            </label>
          ))}
        </div>

        <textarea
          aria-label={t("admin:moderation.reportDrawer.noteAriaLabel")}
          className={styles.dNote}
          rows={3}
          placeholder={t("admin:moderation.reportDrawer.notePlaceholder")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <p className={styles.dTransparency}>
          <FiInfo aria-hidden />{" "}
          {t("admin:moderation.reportDrawer.transparency", {
            name: report.reportedName,
          })}
        </p>
      </section>

      <ReportAudit reportId={report.id} />
    </AdminDrawer>
  );
}
