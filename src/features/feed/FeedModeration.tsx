import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiMoreHorizontal,
  FiFlag,
  FiVolumeX,
  FiSlash,
  FiCheck,
  FiAlertTriangle,
  FiEyeOff,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useSocial } from "../../app/providers/useSocial";
import { useFeedMutes, type FeedMuteTarget } from "./api/useFeedMutes";
import { SAFETY_EMAIL } from "./feed.data";
import { useCreateReport } from "../safety/api/useCreateReport";
import { useReportSubmissionError } from "../safety/api/reportSubmissionError";
import { asReasonCode, useReportReasons } from "../safety/api/useReportReasons";
import type { ReportSubjectType } from "../safety/reportReasons";
import { logError } from "../../shared/observability/logger";
import styles from "./FeedPage.module.css";

interface MoreMenuProps {
  /** Author display name — used for toast/label copy only. */
  authorName: string;
  /** Author profile slug — the canonical key blocks/mutes are stored under. */
  slug: string;
  /** Opens the report flow. Omit it on a card whose reportable subject the
   *  feed item doesn't carry (a forum thread is reported through its opening
   *  post), and the Report item is left out rather than filing against the
   *  wrong id. */
  onReport?: () => void;
  /**
   * The SOURCE this card came from — a community or a thread (SOC-18). When
   * present the menu offers "show me less of this", which quiets that source
   * in this member's feed and NOTHING else: they stay in the community, keep
   * their access, and the community is never told. Omit it and the menu is
   * exactly the person-scoped one it always was.
   */
  muteTarget?: FeedMuteTarget;
}

/** Keyboard-accessible three-dot moderation menu (Report / Show less /
 *  Mute person / Block). */
export function MoreMenu({
  authorName,
  slug,
  onReport,
  muteTarget,
}: MoreMenuProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isMuted, toggleMute, isBlocked, toggleBlock } = useSocial();
  const { mutedIds, mute, unmute } = useFeedMutes();
  const isSourceMuted = muteTarget ? mutedIds.has(muteTarget.sourceId) : false;
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
    ...(onReport
      ? [
          {
            label: t("feed:moderation.reportPost"),
            icon: <FiFlag />,
            run: onReport,
          },
        ]
      : []),
    ...(muteTarget
      ? [
          {
            label: t(
              isSourceMuted ? "feed:mute.showAgain" : "feed:mute.showLess",
              { name: muteTarget.name },
            ),
            icon: <FiEyeOff />,
            run: () => (isSourceMuted ? unmute(muteTarget) : mute(muteTarget)),
          },
        ]
      : []),
    {
      label: t(muted ? "feed:moderation.unmute" : "feed:moderation.mute", {
        name: authorName,
      }),
      icon: <FiVolumeX />,
      run: () => {
        const now = toggleMute(slug);
        showToast(
          t(
            now ? "feed:moderation.mutedToast" : "feed:moderation.unmutedToast",
            { name: authorName },
          ),
          now ? "success" : "info",
        );
      },
    },
    {
      // Block is a mutual, destructive severance → confirm first. Unblocking is
      // low-stakes and reversible, so it toggles straight away.
      label: t(blocked ? "feed:moderation.unblock" : "feed:moderation.block", {
        name: authorName,
      }),
      icon: <FiSlash />,
      run: () => {
        if (blocked) {
          toggleBlock(slug);
          showToast(
            t("feed:moderation.unblockedToast", { name: authorName }),
            "info",
          );
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
        aria-label={t("feed:moderation.postOptionsAria")}
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
  const { t } = useTranslation();
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

  // Portaled to <body> so the fixed-position overlay stays full-screen: the
  // feed card now carries `content-visibility: auto`, whose always-on paint
  // containment would otherwise trap this overlay inside the card.
  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          done ? `${styles.dialog} ${styles.dialogConfirm}` : styles.dialog
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-title"
      >
        {done ? (
          <div className={styles.confirm}>
            <span className={styles.confirmIcon} aria-hidden>
              <FiCheck />
            </span>
            <h2 id="block-title" className={styles.confirmTitle}>
              <Translation
                i18nKey="feed:moderation.blockConfirm.title"
                components={{ em: <em /> }}
                values={{ name: authorName }}
              />
            </h2>
            <p className={styles.confirmBody}>
              {t("feed:moderation.blockConfirm.body", {
                reportNote: alsoReport
                  ? t("feed:moderation.blockConfirm.alsoReported")
                  : "",
              })}
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                {t("feed:action.done")}
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
              {t("feed:moderation.blockDialog.title", { name: authorName })}
            </h2>
            <p className={styles.dialogSub}>
              {t("feed:moderation.blockDialog.sub")}
            </p>
            <div className={styles.reasons}>
              <label className={styles.reasonRow}>
                <input
                  type="checkbox"
                  checked={alsoReport}
                  onChange={(e) => setAlsoReport(e.target.checked)}
                />
                {t("feed:moderation.blockDialog.alsoReportLabel", {
                  name: authorName,
                })}
              </label>
            </div>
            <div className={styles.dialogActions}>
              <Button variant="ghost" type="button" onClick={onClose}>
                {t("feed:action.cancel")}
              </Button>
              <Button variant="primary" type="submit">
                {t("feed:moderation.blockDialog.submitCta", {
                  name: authorName,
                })}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
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
  const { t } = useTranslation();
  useScrollLock();
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState(false);
  // A report that FAILED must never render the "we received your report"
  // confirmation: the reporter would believe moderators had it when nothing was
  // persisted. Failure keeps the form (and their reason/detail) on screen with
  // an honest retry note instead. The note holds the words to show: a rolling
  // flood cap refusal carries its own member-facing explanation from the
  // server, and that explanation replaces the generic line.
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const hasFailed = failureMessage !== null;
  const createReport = useCreateReport();
  const describeReportError = useReportSubmissionError();
  // Server-owned taxonomy, falling back to the local one instantly and
  // silently. Never a spinner, never an empty reason list.
  const reasons = useReportReasons(subjectType);

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
    setFailureMessage(null);
    // Live mode POSTs /reports; demo resolves locally. Only a resolved request
    // confirms.
    createReport.mutate(
      {
        subjectType,
        subjectId,
        reasonCode: asReasonCode(reason),
        detail: detail.trim(),
      },
      {
        onSuccess: () => setSent(true),
        onError: (err) => {
          logError(err, { scope: "feed.report" });
          setFailureMessage(
            describeReportError(err, t("feed:moderation.reportDialog.failed")),
          );
        },
      },
    );
  };

  // Portaled to <body> so the fixed-position overlay stays full-screen: the
  // feed card now carries `content-visibility: auto`, whose always-on paint
  // containment would otherwise trap this overlay inside the card.
  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          sent ? `${styles.dialog} ${styles.dialogConfirm}` : styles.dialog
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
      >
        {sent ? (
          <div className={styles.confirm}>
            <span className={styles.confirmIcon} aria-hidden>
              <FiCheck />
            </span>
            <h2 id="report-title" className={styles.confirmTitle}>
              <Translation
                i18nKey="feed:moderation.reportConfirm.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.confirmBody}>
              {t("feed:moderation.reportConfirm.body", {
                name: authorName,
                email: SAFETY_EMAIL,
              })}
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                {t("feed:action.done")}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 id="report-title" className={styles.dialogTitle}>
              {t("feed:moderation.reportDialog.title")}
            </h2>
            <p className={styles.dialogSub}>
              {t("feed:moderation.reportDialog.sub")}
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
              aria-label={t("feed:moderation.reportDialog.detailPlaceholder")}
              placeholder={t("feed:moderation.reportDialog.detailPlaceholder")}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
            />
            {failureMessage !== null && (
              <p className={styles.reportError} role="alert">
                <FiAlertTriangle aria-hidden />
                {failureMessage}
              </p>
            )}
            <div className={styles.dialogActions}>
              <Button variant="ghost" type="button" onClick={onClose}>
                {t("feed:action.cancel")}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!reason || createReport.isPending}
              >
                {createReport.isPending
                  ? t("feed:moderation.sending")
                  : hasFailed
                    ? t("feed:moderation.reportDialog.retryCta")
                    : t("feed:moderation.reportDialog.submitCta")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
