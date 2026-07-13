import { useState } from "react";
import { FiAlertTriangle, FiShield, FiInfo, FiClock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { AdminDrawer, AdminChip, AdminCat, AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import {
  MOD_ACTIONS,
  MOD_REASONS,
  SEVERITY,
  type ModReport,
  type ReportDetail,
} from "./adminModeration.data";
import { useReportAudit } from "./api/useReportAudit";
import type { ReasonCode } from "../safety/reportReasons";
import type { ResolveOpts } from "./useModerationQueue";
import styles from "./AdminModerationPage.module.css";

/** Reported content + surrounding thread + people involved (read-only context). */
function ReportContext({ detail }: { detail: ReportDetail }) {
  return (
    <>
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>Reported content</h3>
        <p className={styles.dContentAuthor}>{detail.contentAuthor}</p>
        <blockquote className={styles.dExcerpt}>{detail.excerpt}</blockquote>
        {detail.redactionNote && (
          <p className={styles.dRedact}>
            <FiShield aria-hidden /> {detail.redactionNote}
          </p>
        )}
      </section>

      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>Surrounding thread</h3>
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
                      <FiAlertTriangle aria-hidden /> Flagged
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
        <h3 className={styles.dSecLabel}>People involved</h3>
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
                    {p.chips.map((c) => (
                      <AdminChip key={c.label} tone={c.tone}>
                        {c.label}
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
  const { data: entries } = useReportAudit(reportId);
  return (
    <section className={styles.dSec}>
      <h3 className={styles.dSecLabel}>Action history</h3>
      {entries && entries.length > 0 ? (
        <ul className={styles.dAudit}>
          {entries.map((e) => (
            <li key={e.id} className={styles.dAuditRow}>
              <FiClock aria-hidden />
              <span>
                <strong>{e.actorName}</strong> · {e.action.replace(/_/g, " ")}
                {e.note ? ` — ${e.note}` : ""}
              </span>
              <time>{new Date(e.at).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.dTransparency}>
          No actions recorded yet. Every decision you make is logged here.
        </p>
      )}
    </section>
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
  const { showToast } = useToast();
  const [action, setAction] = useState<string | null>(null);
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [note, setNote] = useState("");

  const sev = SEVERITY[report.severity];
  const detail = report.detail!;

  const handleConfirm = () => {
    if (!action) {
      showToast("Pick an action before confirming.", "error");
      return;
    }
    const chosen = MOD_ACTIONS.find((a) => a.id === action);
    onResolve(report.id, {
      verb: "Resolved",
      action,
      reasonCode: reason ?? "other",
      note,
    });
    showToast(
      `${report.reportedName} ${chosen?.done ?? "actioned"}. The member has been notified.`,
      "success",
    );
    onClose();
  };

  const handleEscalate = () => {
    onResolve(report.id, {
      verb: "Escalated",
      action: "escalate",
      reasonCode: reason ?? "other",
      note,
    });
    showToast(
      "Escalated to the safety team. They will take it from here.",
      "success",
    );
    onClose();
  };

  return (
    <AdminDrawer
      label={`Report — ${report.title}`}
      onClose={onClose}
      head={
        <>
          <div className={styles.dHeadChips}>
            <AdminCat tone={sev.cat}>{sev.label}</AdminCat>
            {report.chips.map((c) => (
              <AdminChip key={c.label} tone={c.tone}>
                {c.label}
              </AdminChip>
            ))}
          </div>
          <h2 className={styles.dTitle}>A private trans status was outed</h2>
        </>
      }
      foot={
        <div className={styles.dFoot}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="jade" onClick={handleEscalate}>
            Escalate to safety team
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm &amp; notify member
          </Button>
        </div>
      }
    >
      <ReportContext detail={detail} />

      {/* Action grid */}
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>Take a decision — protective first</h3>
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
              <span className={styles.dActionLabel}>{a.label}</span>
              <span className={styles.dActionDesc}>{a.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Reason + note */}
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          Reason — required, shown to the member
        </h3>
        <div className={styles.dReasons} role="radiogroup" aria-label="Reason">
          {MOD_REASONS.map((r) => (
            <label key={r.id} className={styles.dReason}>
              <input
                type="radio"
                name="mod-reason"
                value={r.id}
                checked={reason === r.id}
                onChange={() => setReason(r.id as ReasonCode)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>

        <textarea
          aria-label="Note to the member"
          className={styles.dNote}
          rows={3}
          placeholder="Add a human note. The member will read this — write it the way you’d want to be spoken to."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <p className={styles.dTransparency}>
          <FiInfo aria-hidden /> {report.reportedName} will be told exactly what
          was actioned and why, with a link to appeal. Nothing happens silently.
        </p>
      </section>

      <ReportAudit reportId={report.id} />
    </AdminDrawer>
  );
}
