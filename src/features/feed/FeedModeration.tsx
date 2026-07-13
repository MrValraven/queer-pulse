import { useEffect, useRef, useState } from "react";
import {
  FiMoreHorizontal,
  FiFlag,
  FiVolumeX,
  FiSlash,
  FiCheck,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSocial } from "../../app/providers/SocialProvider";
import { SAFETY_EMAIL } from "./feed.data";
import { useCreateReport } from "../safety/api/useCreateReport";
import {
  reasonsFor,
  type ReasonCode,
  type ReportSubjectType,
} from "../safety/reportReasons";
import { logError } from "../../shared/observability/logger";
import styles from "./FeedPage.module.css";

interface MoreMenuProps {
  /** Author display name — used for toast/label copy only. */
  authorName: string;
  /** Author profile slug — the canonical key blocks/mutes are stored under. */
  slug: string;
  onReport: () => void;
}

/** Keyboard-accessible three-dot moderation menu (Report / Mute / Block). */
export function MoreMenu({ authorName, slug, onReport }: MoreMenuProps) {
  const { showToast } = useToast();
  const { isMuted, toggleMute, isBlocked, toggleBlock } = useSocial();
  const muted = isMuted(slug);
  const blocked = isBlocked(slug);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items: { label: string; icon: React.ReactNode; run: () => void }[] = [
    { label: "Report post", icon: <FiFlag />, run: onReport },
    {
      label: muted ? `Unmute ${authorName}` : `Mute ${authorName}`,
      icon: <FiVolumeX />,
      run: () => {
        const now = toggleMute(slug);
        showToast(
          now ? `Muted ${authorName}` : `Unmuted ${authorName}`,
          now ? "success" : "info",
        );
      },
    },
    {
      // Block is a mutual, destructive severance → confirm first. Unblocking is
      // low-stakes and reversible, so it toggles straight away.
      label: blocked ? `Unblock ${authorName}` : `Block ${authorName}`,
      icon: <FiSlash />,
      run: () => {
        if (blocked) {
          toggleBlock(slug);
          showToast(`Unblocked ${authorName}`, "info");
        } else {
          setConfirming(true);
        }
      },
    },
  ];

  return (
    <div className={styles.moreWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.moreBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Post options"
        onClick={() => setOpen((o) => !o)}
      >
        <FiMoreHorizontal />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => {
                setOpen(false);
                item.run();
              }}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
      {confirming && (
        <BlockConfirmModal
          authorName={authorName}
          slug={slug}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

interface BlockConfirmModalProps {
  authorName: string;
  slug: string;
  onClose: () => void;
}

/** Destructive-block confirmation naming the consequences, with an inline
 *  "Also report" affordance. Ends in the plum-panel confirmation pattern. */
export function BlockConfirmModal({
  authorName,
  slug,
  onClose,
}: BlockConfirmModalProps) {
  useScrollLock();
  const { toggleBlock } = useSocial();
  const [alsoReport, setAlsoReport] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={
          done ? `${styles.dialog} ${styles.dialogConfirm}` : styles.dialog
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-title"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className={styles.confirm}>
            <span className={styles.confirmIcon} aria-hidden>
              <FiCheck />
            </span>
            <h2 id="block-title" className={styles.confirmTitle}>
              You blocked <em>{authorName}</em>
            </h2>
            <p className={styles.confirmBody}>
              They can no longer message you, see your profile, or find you here
              {alsoReport ? ", and our safety team has your report" : ""}. You
              can undo this anytime from your connections.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toggleBlock(slug, { alsoReport });
              setDone(true);
            }}
          >
            <h2 id="block-title" className={styles.dialogTitle}>
              Block {authorName}?
            </h2>
            <p className={styles.dialogSub}>
              They won't be able to message you, see your profile, or find you —
              and any connection between you will be removed. This works both
              ways.
            </p>
            <div className={styles.reasons}>
              <label className={styles.reasonRow}>
                <input
                  type="checkbox"
                  checked={alsoReport}
                  onChange={(e) => setAlsoReport(e.target.checked)}
                />
                Also report {authorName} to our safety team
              </label>
            </div>
            <div className={styles.dialogActions}>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Block {authorName}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

interface ReportModalProps {
  authorName: string;
  /** Content id of the reported post/reply — the report's `subjectId`. */
  subjectId: string;
  /** Defaults to "post"; forum replies pass "reply". */
  subjectType?: ReportSubjectType;
  onClose: () => void;
}

/** Accessible report dialog ending in a plum-panel confirmation. */
export function ReportModal({
  authorName,
  subjectId,
  subjectType = "post",
  onClose,
}: ReportModalProps) {
  useScrollLock();
  const [reason, setReason] = useState<ReasonCode | "">("");
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState(false);
  const createReport = useCreateReport();
  const reasons = reasonsFor(subjectType);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    // Live mode POSTs /reports; demo resolves locally. Same success UI either way.
    createReport.mutate(
      { subjectType, subjectId, reasonCode: reason, detail: detail.trim() },
      {
        onSuccess: () => setSent(true),
        onError: (err) => {
          logError(err, { scope: "feed.report" });
          setSent(true);
        },
      },
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={
          sent ? `${styles.dialog} ${styles.dialogConfirm}` : styles.dialog
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className={styles.confirm}>
            <span className={styles.confirmIcon} aria-hidden>
              <FiCheck />
            </span>
            <h2 id="report-title" className={styles.confirmTitle}>
              Thank you — <em>we're on it</em>
            </h2>
            <p className={styles.confirmBody}>
              Our moderation team will review this post about {authorName}. For
              anything urgent, reach us directly at{" "}
              <strong>{SAFETY_EMAIL}</strong>.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 id="report-title" className={styles.dialogTitle}>
              Report this post
            </h2>
            <p className={styles.dialogSub}>
              Tell us what's wrong. Reports are confidential and reviewed by our
              safety team.
            </p>
            <div className={styles.reasons}>
              {reasons.map((r) => (
                <label key={r.code} className={styles.reasonRow}>
                  <input
                    type="radio"
                    name="reason"
                    value={r.code}
                    checked={reason === r.code}
                    onChange={() => setReason(r.code)}
                  />
                  {r.label}
                </label>
              ))}
            </div>
            <textarea
              className={styles.detail}
              placeholder="Add any details (optional)"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
            />
            <div className={styles.dialogActions}>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!reason || createReport.isPending}
              >
                {createReport.isPending ? "Sending…" : "Submit report"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
