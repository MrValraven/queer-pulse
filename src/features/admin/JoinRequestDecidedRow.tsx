import { useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { FiCheck, FiChevronDown, FiCopy } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Collapse, IconButton } from "../../shared/components/ui";
import { useClipboard } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { approvalReasonLabelKey } from "../auth/api/joinRequestApprovalReason";
import { declineReasonLabelKey } from "../auth/api/joinRequestDeclineReason";
import type { JoinRequestView } from "./api/useJoinRequests";
import { joinRequestInviteState } from "./joinRequestInviteState";
import { JoinRequestDecidedApplication } from "./JoinRequestDecidedApplication";
import { JoinRequestDecidedDates } from "./JoinRequestDecidedDates";
import { JoinRequestDecidedInvitePanel } from "./JoinRequestDecidedInvitePanel";
import { JoinRequestDeclineNote } from "./JoinRequestDeclineNote";
import { AdminAvatar, AdminChip } from "./ui";
import rowStyles from "./AdminSubmissionList.module.css";
import styles from "./AdminVerifyDecided.module.css";

/**
 * One settled request in the Decided tab: who asked, how to reach them, when
 * they applied, when it was decided and by whom, then what they sent us so a
 * reviewer can re-read it, and then the part the tab exists for.
 *
 * An approval keeps its invite link here, with the link's own status and how
 * long it has left, because QueerPulse delivers no email: handing that link
 * over is the reviewer's job, and until this row existed the link lived only in
 * a card held in React state that a refresh threw away. A lapsed link gets a
 * reissue action, and a live one can be revoked. Above the link sits the
 * reason the reviewer approved on, so the people working the queue can read
 * each other's calls against one bar. A decline shows its reason and, under
 * it, the note staff keep for each other on it.
 *
 * The row opens collapsed to a one-glance summary (who, the decision, and
 * whether the link was claimed), because a page of fully expanded invite
 * panels made the history too long to scan. The applicant's name is the
 * toggle, and its overlay stretches across the whole summary, so a click
 * anywhere in the header still opens the row. The one control the summary
 * carries, the copy button beside the email, is a sibling of the toggle that
 * sits above that overlay, so no interactive element ever sits inside the
 * button. Everything else with a control in it lives in the details below.
 */
export function JoinRequestDecidedRow({
  item,
  currentUserId,
}: {
  item: JoinRequestView;
  /** The signed-in reviewer, so their own calls read as "by you". Null while
   *  the session is still loading. */
  currentUserId: string | null;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const detailsId = `${baseId}-details`;
  const statusId = `${baseId}-status`;
  const emailId = `${baseId}-email`;
  const datesId = `${baseId}-dates`;

  // A reissue or revoke swaps the invite's status, and the refetched row drops
  // the button that was just pressed, which leaves focus on <body>. Hand it to
  // this row's toggle so a keyboard user stays where they were working. It
  // only fires when focus was last inside these details, so a background
  // refetch never pulls focus (and the scroll) to a row nobody was using.
  const isFocusInDetailsRef = useRef(false);
  const previousInviteStatusRef = useRef(item.inviteStatus);
  useEffect(() => {
    if (previousInviteStatusRef.current === item.inviteStatus) return;
    previousInviteStatusRef.current = item.inviteStatus;
    const focused = document.activeElement;
    const isFocusLost = !focused || focused === document.body;
    if (isFocusLost && isFocusInDetailsRef.current) {
      isFocusInDetailsRef.current = false;
      toggleRef.current?.focus();
    }
  }, [item.inviteStatus]);

  // A removed button can blur with no destination, so only a blur that lands
  // somewhere else (or leaves a still-mounted element) counts as leaving.
  // Focus inside the portalled confirm dialog bubbles here through React too.
  function trackDetailsBlur(event: FocusEvent<HTMLDivElement>) {
    const destination = event.relatedTarget;
    const hasLeft = destination
      ? !event.currentTarget.contains(destination)
      : event.target.isConnected;
    if (hasLeft) isFocusInDetailsRef.current = false;
  }

  const isApproved = item.status === "approved";
  const inviteState = joinRequestInviteState(item, t);
  const approvalReasonKey = approvalReasonLabelKey(item.approvalReason);

  return (
    <div className={rowStyles.row}>
      <div className={styles.decidedBody}>
        <div className={styles.summary} data-open={isOpen ? "true" : undefined}>
          <AdminAvatar initials={item.initials} tone={item.tone} size="md" />
          <div className={rowStyles.rowMain}>
            <div className={rowStyles.rowTop}>
              <button
                ref={toggleRef}
                type="button"
                className={styles.summaryToggle}
                aria-expanded={isOpen}
                aria-controls={detailsId}
                aria-label={t(
                  isOpen
                    ? "admin:members.verify.decided.hideDetails"
                    : "admin:members.verify.decided.showDetails",
                  { name: item.name },
                )}
                aria-describedby={`${statusId} ${emailId} ${datesId}`}
                onClick={() => setIsOpen((wasOpen) => !wasOpen)}
              >
                <span className={rowStyles.rowName}>{item.name}</span>
              </button>
              <span id={statusId} className={styles.summaryChips}>
                <AdminChip tone={isApproved ? "jade" : "ghost"} dot>
                  {t(
                    `admin:members.verify.status.${isApproved ? "approved" : "declined"}`,
                  )}
                </AdminChip>
                {isApproved && inviteState && (
                  <AdminChip tone={inviteState.chipTone}>
                    {inviteState.chipLabel}
                  </AdminChip>
                )}
              </span>
            </div>
            <div className={`${rowStyles.rowMeta} ${styles.emailLine}`}>
              <span id={emailId} className={styles.emailText}>
                {item.email}
              </span>
              <CopyEmailButton name={item.name} email={item.email} />
            </div>
            <JoinRequestDecidedDates
              id={datesId}
              item={item}
              currentUserId={currentUserId}
            />
          </div>
          <FiChevronDown className={styles.chevron} aria-hidden />
        </div>

        <div
          id={detailsId}
          className={styles.details}
          onFocus={() => {
            isFocusInDetailsRef.current = true;
          }}
          onBlur={trackDetailsBlur}
        >
          <Collapse isOpen={isOpen}>
            <JoinRequestDecidedApplication item={item} />
            {!isApproved && (
              <>
                <div className={rowStyles.rowNote}>
                  {t("admin:members.verify.decided.declineReasonLine", {
                    reason: t(declineReasonLabelKey(item.declineReason)),
                  })}
                </div>
                <JoinRequestDeclineNote item={item} />
              </>
            )}
            {isApproved && approvalReasonKey && (
              <div className={rowStyles.rowNote}>
                {t("admin:members.verify.decided.approvalReasonLine", {
                  reason: t(approvalReasonKey),
                })}
              </div>
            )}
            {isApproved && !approvalReasonKey && (
              <div className={`${rowStyles.rowNote} ${styles.reasonMissing}`}>
                {t("admin:members.verify.decided.approvalReasonMissing")}
              </div>
            )}
            {isApproved && inviteState && (
              <JoinRequestDecidedInvitePanel
                item={item}
                inviteState={inviteState}
              />
            )}
            {isApproved && !inviteState && (
              <div className={rowStyles.rowNote}>
                {t("admin:members.verify.invite.noneMinted")}
              </div>
            )}
          </Collapse>
        </div>
      </div>
    </div>
  );
}

/**
 * Copies the applicant's email in one click, so reaching them never starts
 * with selecting the address by hand. The check mark stands in for the
 * copy icon for a moment after a copy, and a toast says how it went either way.
 */
function CopyEmailButton({ name, email }: { name: string; email: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { copy, copied: isCopied } = useClipboard();

  async function copyEmail() {
    const didCopy = await copy(email);
    showToast(
      t(
        didCopy
          ? "admin:members.verify.decided.emailCopied"
          : "admin:members.verify.decided.emailCopyFailed",
      ),
      didCopy ? "success" : "error",
    );
  }

  return (
    <IconButton
      size="sm"
      className={styles.copyEmail}
      aria-label={t("admin:members.verify.decided.copyEmail", { name })}
      onClick={() => void copyEmail()}
    >
      {isCopied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
    </IconButton>
  );
}
