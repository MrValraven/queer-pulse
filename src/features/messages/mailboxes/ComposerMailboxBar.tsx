import { Avatar, Button, ConfirmDialog } from "../../../shared/components/ui";
import { initialsFromName } from "../../../shared/lib/initials";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  claimStatusOf,
  useConversationClaim,
  useTakeOverConfirm,
} from "../api/useConversationClaim";
import { useMailboxes } from "../api/useMailboxes";
import type { Conversation } from "../data";
import { useMessageViewer } from "../useMessageViewer";
import styles from "./ComposerMailboxBar.module.css";

interface TakeOverConfirmDialogProps {
  open: boolean;
  /** The first name of the colleague holding the thread. */
  claimantName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** The confirm every take-over goes through, from the composer bar and from
 *  the inbox row's menu alike. */
export function TakeOverConfirmDialog({
  open,
  claimantName,
  loading = false,
  onClose,
  onConfirm,
}: TakeOverConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={open}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("messages:mailbox.claim.takeOverTitle", { name: claimantName })}
      description={t("messages:mailbox.claim.takeOverBody", {
        name: claimantName,
      })}
      confirmLabel={t("messages:mailbox.claim.takeOverConfirm")}
    />
  );
}

/**
 * The "Replying as" chip above the composer on a thread the member answers
 * as a business, with the thread's claim and the one claim action that fits
 * it: Claim while unclaimed, Release on the member's own claim, Take over
 * (behind a confirm) on a colleague's. Claims are advisory, so the input
 * below stays live in every state. Renders nothing on a personal thread and
 * on a read-only mailbox, whose composer `ComposerBlockedState` replaces.
 *
 * The action is one button in one slot whose label and handler follow the
 * claim, so keyboard focus stays on it when an action flips the state, and
 * the take-over confirm returns focus to it. The toast announces each
 * outcome, so the status text carries no live region of its own.
 */
export function ComposerMailboxBar({ active }: { active: Conversation }) {
  const { t } = useTranslation();
  const { data: mailboxes } = useMailboxes();
  const viewer = useMessageViewer();
  const { claim, release, takeOver, isPending } = useConversationClaim(active);
  const status = claimStatusOf(active, viewer.myHandle);
  const takeOverConfirm = useTakeOverConfirm(active, status);
  if (status === "none") return null;

  const mailbox = mailboxes?.find(
    (candidate) => candidate.identityId === active.mailboxSeatIdentityId,
  );
  const mailboxName = mailbox?.displayName ?? t("messages:mailbox.untitled");
  const claimantFirstName = active.claimedBy?.firstName ?? "";
  const previousFirstName = active.claimTakenOverFrom?.firstName;

  const statusLine =
    status === "unclaimed"
      ? t("messages:mailbox.claim.unclaimed")
      : status === "mine"
        ? t("messages:mailbox.claim.mine")
        : t("messages:mailbox.claim.theirs", { name: claimantFirstName });
  const takeOverLine =
    status === "unclaimed" || !previousFirstName
      ? null
      : status === "mine"
        ? t("messages:mailbox.claim.tookOverToast", { name: previousFirstName })
        : t("messages:mailbox.claim.tookOverFrom", {
            name: claimantFirstName,
            previous: previousFirstName,
          });

  return (
    <div className={styles.bar}>
      <span className={styles.chip}>
        <Avatar
          initials={initialsFromName(mailboxName)}
          src={mailbox?.avatarUrl ?? undefined}
          size={20}
          tint="plum"
        />
        <span className={styles.chipText}>
          {t("messages:mailbox.composer.replyingAs", { name: mailboxName })}
        </span>
      </span>
      <div className={styles.status}>
        <span className={styles.statusLine}>{statusLine}</span>
        {takeOverLine && (
          <span className={styles.takeOverLine}>{takeOverLine}</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        // `aria-disabled` keeps the focused button focusable while a request
        // is in flight; a `disabled` button would drop focus to the page.
        aria-disabled={isPending || undefined}
        onClick={() => {
          if (isPending) return;
          if (status === "unclaimed") void claim();
          else if (status === "mine") void release();
          else takeOverConfirm.open();
        }}
      >
        {status === "unclaimed"
          ? t("messages:mailbox.claim.claim")
          : status === "mine"
            ? t("messages:mailbox.claim.release")
            : t("messages:mailbox.claim.takeOver")}
      </Button>
      <TakeOverConfirmDialog
        open={takeOverConfirm.isOpen}
        claimantName={takeOverConfirm.claimantName}
        loading={isPending}
        onClose={takeOverConfirm.close}
        onConfirm={() => {
          takeOverConfirm.close();
          void takeOver();
        }}
      />
    </div>
  );
}
