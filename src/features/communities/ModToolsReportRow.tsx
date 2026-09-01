import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiAlertOctagon,
  FiAlertTriangle,
  FiClock,
  FiEyeOff,
  FiFlag,
  FiInfo,
  FiSlash,
  FiTrash2,
  FiArrowUpCircle,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { Avatar, Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { REASON_LABEL_KEYS } from "../safety/reportReasons";
import type { ModReport } from "./community.model";
import type { CommunityReportSeverity } from "./api/communities.api";
import { photoOf } from "./communityPeople";
import { useCommunityTime } from "./communityTime";
import styles from "./ModToolsPanels.module.css";

/** Icon + class + label key per severity. The class only tints the badge: the
 *  level is spelled out in words beside the icon, so nothing here is carried
 *  by colour alone. */
const SEVERITY_LOOK: Record<
  CommunityReportSeverity,
  { icon: IconType; className: string; labelKey: string }
> = {
  emergency: {
    icon: FiAlertOctagon,
    className: styles.severityEmergency!,
    labelKey: "communities:detail.modtools.reports.severity.emergency",
  },
  high: {
    icon: FiAlertTriangle,
    className: styles.severityHigh!,
    labelKey: "communities:detail.modtools.reports.severity.high",
  },
  medium: {
    icon: FiAlertCircle,
    className: styles.severityMedium!,
    labelKey: "communities:detail.modtools.reports.severity.medium",
  },
  low: {
    icon: FiInfo,
    className: styles.severityLow!,
    labelKey: "communities:detail.modtools.reports.severity.low",
  },
};

/**
 * Subject types whose reported content the platform will not show a community
 * moderator, so the row offers them escalation and nothing else (TS-14). Today
 * that is a gathering photograph: the moderation evidence route is platform
 * staff only, the gathering's album is served to that gathering's participants
 * only, and the stored file is served to its uploader only. A moderator asked
 * to take a photo down would be deciding on the reason code and the caption
 * alone, and the server refuses them for exactly that reason
 * (`assertCommunityModMaySettle`), so showing the button would only produce a
 * 403 on press.
 *
 * Written as a list of plain strings rather than of `ModReport["subjectType"]`
 * members so this row keeps compiling while the shared subject union grows,
 * which is where the next entry will come from.
 */
const SUBJECT_TYPES_A_COMMUNITY_MOD_CANNOT_SEE: readonly string[] = [
  "event_photo",
];

/**
 * One row of the community reports queue: the content a moderator is being
 * asked to judge, then the two answers they can give.
 *
 * This used to be a reason label, a timestamp and a Remove button, which asked
 * a moderator to act on something they could not read. The row now leads with
 * the reported body and its author, states how urgent the report is in words,
 * says when the response window has already closed, and links through to the
 * thread so the excerpt is never the whole story.
 *
 * Demo and live both arrive here as a `ModReport`: the mocks author the
 * excerpt and author by hand, live rows get them from
 * `GET /communities/:slug/reports`. Nothing here reads the mock registry.
 */
export function ModToolsReportRow({
  report,
  slug,
  onRemove,
  onDismiss,
  onEscalate,
}: {
  report: ModReport;
  /** The community this queue belongs to, for the link into its thread. */
  slug: string;
  onRemove: (report: ModReport) => void;
  onDismiss: (report: ModReport) => void;
  /** Hands the report to platform staff. The only answer offered on an
   *  emergency report (TS-07) and on a report about something the moderator
   *  cannot be shown (TS-14). */
  onEscalate: (report: ModReport) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const communityTime = useCommunityTime();

  // Demo mocks author a free-text `reason`; live rows carry a stable
  // `reasonCode`, resolved to a label here.
  const reasonLabel =
    report.reason ??
    (report.reasonCode ? t(REASON_LABEL_KEYS[report.reasonCode]) : "");
  const severity = report.severity ? SEVERITY_LOOK[report.severity] : null;
  const SeverityIcon = severity?.icon;
  const author = report.author;
  const threadHref = report.threadPostId
    ? `/community/${slug}?tab=discussion#post-${report.threadPostId}`
    : null;
  // Two separate reasons a report is not this moderator's to settle, and the
  // row has to tell them apart because the sentence it shows differs.
  //
  // TS-07: outing and doxxing are emergency severity, and the server refuses
  // to let a community moderator settle one. A dismissal here would be
  // platform-wide, terminal, and filed before anyone trained had seen it.
  //
  // TS-14: the reported thing cannot be shown to them at all. Severity says
  // nothing about this, so gating on severity alone left Take it down and
  // Dismiss on every non-emergency photo report (harassment, hate speech,
  // discrimination, impersonation, spam, other), where pressing either one
  // returned a 403 from a server that had already decided.
  //
  // Either way the two buttons that would 403 are absent rather than
  // refusing: an action offered and then denied is worse than an action never
  // offered.
  const isEmergency = report.severity === "emergency";
  const isSubjectUnviewable =
    report.subjectType !== undefined &&
    SUBJECT_TYPES_A_COMMUNITY_MOD_CANNOT_SEE.includes(report.subjectType);
  const isStaffOnly = isEmergency || isSubjectUnviewable;

  return (
    <div className={styles.reportRow}>
      <div className={styles.reportHead}>
        {severity && SeverityIcon && (
          <span className={`${styles.severityBadge} ${severity.className}`}>
            <SeverityIcon aria-hidden /> {t(severity.labelKey)}
          </span>
        )}
        <span className={styles.reportReason}>
          <FiFlag aria-hidden /> {reasonLabel}
        </span>
        {report.isOverdue && (
          <span className={styles.overdueChip}>
            <FiClock aria-hidden />{" "}
            {t("communities:detail.modtools.reports.overdue")}
          </span>
        )}
      </div>

      {report.isContentMissing ? (
        <p className={styles.reportNote}>
          {t("communities:detail.modtools.reports.contentMissing")}
        </p>
      ) : (
        report.postExcerpt && (
          <>
            <blockquote className={styles.reportExcerpt}>
              {report.postExcerpt}
              {report.isExcerptTruncated ? "…" : ""}
            </blockquote>
            {report.isExcerptTruncated && (
              <p className={styles.reportNote}>
                {t("communities:detail.modtools.reports.excerptTruncated")}
              </p>
            )}
          </>
        )
      )}

      <div className={styles.reportStates}>
        {report.isContentHidden && (
          <span className={styles.stateChip}>
            <FiEyeOff aria-hidden />{" "}
            {t("communities:detail.modtools.reports.state.hidden")}
          </span>
        )}
        {report.isContentRemoved && (
          <span className={styles.stateChip}>
            <FiSlash aria-hidden />{" "}
            {t("communities:detail.modtools.reports.state.removed")}
          </span>
        )}
        {report.isContentDeleted && (
          <span className={styles.stateChip}>
            <FiTrash2 aria-hidden />{" "}
            {t("communities:detail.modtools.reports.state.deleted")}
          </span>
        )}
      </div>

      <div className={styles.reportAuthor}>
        {author && (
          <Avatar
            initials={author.initials}
            tint={author.tint}
            src={photoOf(author, demoMode)}
            size={28}
          />
        )}
        <span className={styles.reportMeta}>
          {author && report.reporter
            ? t("communities:detail.modtools.reports.meta", {
                author: author.name,
                reporter: report.reporter.name,
                time: communityTime.ago(report),
              })
            : author
              ? t("communities:detail.modtools.reports.metaAuthor", {
                  author: author.name,
                  time: communityTime.ago(report),
                })
              : t("communities:detail.modtools.reports.metaErasedAuthor", {
                  time: communityTime.ago(report),
                })}
        </span>
      </div>

      {isStaffOnly && (
        <p className={styles.reportNote}>
          {/* The emergency sentence names outing and doxxing, which is not
              true of a photo report on `spam`. Say the reason that actually
              applies, so a moderator reads a limit rather than a slight. */}
          {isEmergency
            ? t("communities:detail.modtools.reports.staffOnlyNote")
            : t("communities:detail.modtools.reports.unviewableSubjectNote")}
        </p>
      )}

      <div className={styles.reportActions}>
        {!isStaffOnly && (
          <Button variant="primary" onClick={() => onRemove(report)}>
            {t("communities:detail.modtools.reports.removeCta")}
          </Button>
        )}
        <Button
          variant={isStaffOnly ? "primary" : "ghost"}
          size={isStaffOnly ? undefined : "sm"}
          className={isStaffOnly ? undefined : styles.quietBtn}
          onClick={() => onEscalate(report)}
        >
          <FiArrowUpCircle aria-hidden />{" "}
          {t("communities:detail.modtools.reports.escalateCta")}
        </Button>
        {!isStaffOnly && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.quietBtn}
            onClick={() => onDismiss(report)}
          >
            {t("communities:detail.modtools.reports.dismissCta")}
          </Button>
        )}
        {threadHref && (
          <Link
            to={threadHref}
            className={styles.threadLink}
            aria-label={t(
              "communities:detail.modtools.reports.openThreadLabel",
            )}
          >
            {t("communities:detail.modtools.reports.openThread")}
          </Link>
        )}
      </div>
    </div>
  );
}
