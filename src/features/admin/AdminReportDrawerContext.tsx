import {
  FiAlertTriangle,
  FiShield,
  FiInfo,
  FiClock,
  FiUserCheck,
} from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip, AdminAvatar } from "./ui";
import { useDemoPortrait } from "./useDemoPortrait";
import {
  chipKey,
  chipLabel,
  reporterCredibilityText,
  type ModReport,
  type ReportDetail,
} from "./adminModeration.data";
import { auditActionLabel } from "./moderationActionLabels";
import { isAnonymousReporter, reporterDisplayName } from "./moderationReporter";
import { useReportAudit } from "./api/useReportAudit";
import styles from "./AdminModerationPage.module.css";

/**
 * The read-only half of the report drawer: the case a moderator reads before
 * they decide anything. The reported content and its thread, the people
 * involved, the loading placeholder, the honest fallback for a report with no
 * rich detail attached, and the immutable audit trail.
 *
 * Split out of `AdminReportDrawer.tsx` so the evidence a moderator reads and
 * the sanction they file are separate files. Nothing here takes a decision or
 * gates one: every component is display-only.
 */

/**
 * The subject types whose report can name two different authors.
 *
 * Each covers a statement AND the answer posted under it, under one subject and
 * one "Report this" control, and records neither which half was reported nor
 * who wrote the second one:
 *
 *  - `listing_public_question`: a member's public question on a business
 *    listing and the owner's answer beneath it. The answerer is nullable, it
 *    survives the listing changing hands, and it can be a moderator.
 *  - `review`: a review and the reviewed party's single public reply under it,
 *    on all three surfaces that carry one (a directory listing, an employer,
 *    a home). Added by PRD-47 when housing and employer reviews gained the
 *    reply the business directory already had.
 *
 * A SET, so the day a third one arrives there is an obvious place to declare
 * it. This list mirrors the backend resolver: exactly the two statements in
 * `queerpulse-backend/src/moderation/report-subject-resolver.service.ts` that
 * select `is_author_ambiguous` belong here, and nothing else does. It is a
 * hardcoded mirror only because the flag never reaches the wire:
 * `ReportSubjectResolution.isAuthorAmbiguous` is consumed inside
 * `AccountEnforcementService` and no field on `ModReportDTO` or `ReportDetail`
 * carries it. If one is ever added, delete this set and read the flag instead.
 *
 * The mirror is deliberately WIDER than the backend flag: the backend only sets
 * it when a second half actually exists, and nothing on the wire says whether
 * it does, so the note warns that restrict and ban CAN be refused rather than
 * promising they will be.
 */
const AMBIGUOUS_AUTHOR_SUBJECTS: ReadonlySet<ModReport["subjectType"]> =
  new Set(["listing_public_question", "review"]);

/**
 * Says out loud that the author named just above may not be the person who
 * wrote the reported half.
 *
 * The drawer has to name somebody, and it names whoever posted first, because
 * they opened the exchange: the member who asked the question, or the member
 * who wrote the review. Without this line a moderator reads one handle, decides
 * about that person, and only learns two people are involved from the refusal
 * toast after they have already tried to ban one of them. Rendered at the
 * moment the naming happens, so the refusal confirms what they already knew
 * rather than contradicting what they just read.
 */
function AmbiguousAuthorsNote({
  subjectType,
}: {
  subjectType: ModReport["subjectType"];
}) {
  const { t } = useTranslation();
  if (!AMBIGUOUS_AUTHOR_SUBJECTS.has(subjectType)) return null;
  return (
    <p className={styles.dAmbiguous}>
      <FiInfo aria-hidden />{" "}
      {t("admin:moderation.reportDrawer.ambiguousAuthorsNote")}
    </p>
  );
}

/** Reported content + surrounding thread + people involved (read-only context). */
export function ReportContext({
  detail,
  subjectType,
}: {
  detail: ReportDetail;
  /** Carried in solely so the two-authors note can render beside the author
   *  name. `ReportDetail` has no subject type of its own. */
  subjectType: ModReport["subjectType"];
}) {
  const { t } = useTranslation();
  // Demo fixtures only. The registry is keyed by name, and in live mode every
  // name in a report belongs to a real member the moderator is judging.
  const demoPortrait = useDemoPortrait();
  return (
    <>
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.reportDrawer.contentTitle")}
        </h3>
        <p className={styles.dContentAuthor}>{detail.contentAuthor}</p>
        <blockquote className={styles.dExcerpt}>{detail.excerpt}</blockquote>
        <AmbiguousAuthorsNote subjectType={subjectType} />
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
          <blockquote className={styles.dClaim}>
            {detail.disputeReason}
          </blockquote>
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
                src={demoPortrait(m.author)}
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
                src={demoPortrait(p.name)}
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
export function ReportAudit({ reportId }: { reportId: string }) {
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
                {/* Raw server codes ("hide_content") used to be rendered with
                    the underscores swapped for spaces, which read as lowercase
                    English in every locale. */}
                <strong>{e.actorName}</strong> · {auditActionLabel(e.action, t)}
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
export function ReportContextLoading() {
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
 *  detail is attached, so a moderator can still act on an honest summary
 *  rather than the report auto-resolving out from under them. */
export function ReportContextFallback({ report }: { report: ModReport }) {
  const { t } = useTranslation();
  // Demo fixtures only. See `ReportContext`.
  const demoPortrait = useDemoPortrait();
  const anonReporter = isAnonymousReporter(report.reporterName);
  const reportedInitials = (
    report.reportedName.replace(/^@/, "")[0] ?? "?"
  ).toUpperCase();
  return (
    <>
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.reportDrawer.contentTitle")}
        </h3>
        <p className={styles.dContentAuthor}>{report.reportedName}</p>
        <blockquote className={styles.dExcerpt}>{report.preview}</blockquote>
        {/* The fallback names somebody too, so it needs the same warning. */}
        <AmbiguousAuthorsNote subjectType={report.subjectType} />
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
                anonReporter
                  ? "?"
                  : (report.reporterName[0] ?? "?").toUpperCase()
              }
              tone={anonReporter ? "anon" : "plum"}
              size="md"
            />
            <div className={styles.dPersonTx}>
              <span className={styles.dPersonName}>
                {reporterDisplayName(report.reporterName, t)}
              </span>
              <span className={styles.dPersonMeta}>
                {t("admin:moderation.reportDrawer.reporterRole")}
              </span>
              {report.reporterCredibility && (
                <span
                  className={styles.reporterFlag}
                  style={{ alignSelf: "flex-start" }}
                >
                  <FiUserCheck aria-hidden />{" "}
                  {reporterCredibilityText(report.reporterCredibility, t)}
                </span>
              )}
            </div>
          </div>
          <div className={styles.dPerson}>
            <AdminAvatar
              initials={reportedInitials}
              tone="coral"
              size="md"
              src={demoPortrait(report.reportedName)}
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
