import { useEffect, useRef, useState } from "react";
import { Avatar, Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  isAccountRestricted,
  isInviteBlocked,
  reasonFor,
} from "../../shared/api/errorMessage";
import { initialsFromName } from "../../shared/lib/initials";
import { useMyPersonaInvites } from "./api/useMyPersonaInvites";
import type { MyInviteDTO } from "./api/subprofiles.api";
import { AcceptPersonaInviteModal } from "./AcceptPersonaInviteModal";
import styles from "./PersonaInvitesBanner.module.css";

/** An invite whose row is about to leave the list, and where it sat. */
interface DepartingInvite {
  inviteId: string;
  index: number;
}

/**
 * Design review N4: a resolved invite's row leaves the list once the invites
 * refetch (a blocked accept closes the invite on the server too), and the
 * button focus sat on goes with it. When that drops focus, this moves it to
 * the Accept of the row that took its place (or the new last row), or, with
 * no row left and the banner gone, to the page's `<main>` (the app's focus
 * target for orientation, `tabIndex={-1}` in `AppShell`). A member who moved
 * focus elsewhere meanwhile keeps their place.
 */
function useFocusAfterInviteLeaves(invites: MyInviteDTO[] | undefined) {
  const regionRef = useRef<HTMLDivElement>(null);
  const acceptButtonsRef = useRef(new Map<string, HTMLButtonElement>());
  const departingRef = useRef<DepartingInvite | null>(null);
  const pageMainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const departing = departingRef.current;
    if (!departing) return;
    const remaining = invites ?? [];
    if (remaining.some((invite) => invite.id === departing.inviteId)) return;
    departingRef.current = null;
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) return;
    const nextInvite =
      remaining[Math.min(departing.index, remaining.length - 1)];
    const nextAccept = nextInvite
      ? acceptButtonsRef.current.get(nextInvite.id)
      : undefined;
    (nextAccept ?? pageMainRef.current)?.focus({ preventScroll: !nextAccept });
  }, [invites]);

  /** Call once an invite resolved, before its row can leave. */
  function markInviteLeaving(inviteId: string) {
    const index = (invites ?? []).findIndex((invite) => invite.id === inviteId);
    departingRef.current = { inviteId, index: Math.max(index, 0) };
    pageMainRef.current = regionRef.current?.closest("main") ?? null;
  }

  /** Ref callback registering one row's Accept button. */
  function acceptButtonRef(inviteId: string) {
    return (button: HTMLButtonElement | null) => {
      if (!button) return;
      acceptButtonsRef.current.set(inviteId, button);
      return () => {
        acceptButtonsRef.current.delete(inviteId);
      };
    };
  }

  return { regionRef, markInviteLeaving, acceptButtonRef };
}

/** A restriction (ENG-448) gets the copy naming the appeal; any other failure
 *  its backend reason, else the action's own fallback copy. */
function inviteFailureMessage(
  error: unknown,
  fallback: string,
  restricted: string,
): string {
  if (isAccountRestricted(error)) return restricted;
  return reasonFor(error) ?? fallback;
}

/**
 * "You've been invited" surface, sat above the persona grid on the owner
 * dashboard: one compact accent-tinted `.banner` row (global class, ported
 * in `persona-dashboard.css`) per incoming co-owner invite — a call-to-action
 * nudge, not the plum-panel confirmation treatment — with Accept / Decline
 * inline. Renders nothing when there are no pending invites — this is a
 * celebratory add-on, never an empty-state placeholder. Each row tracks its
 * own in-flight mutation by `invite.id` so accepting one invite never
 * disables the buttons on another.
 *
 * "Accept" no longer fires the mutation directly (IDN-2): it opens
 * `AcceptPersonaInviteModal`, a disclosure/confirm step stating plainly that
 * accepting grants full management access and, for an Unlinked persona,
 * reveals the accepting member's real identity to its other co-owners. The
 * mutation only runs once that modal's own acknowledgment checkbox is
 * ticked and Confirm is tapped. Decline is unaffected — it isn't a grant of
 * access, so it stays a single tap.
 */
export function PersonaInvitesBanner() {
  const { t } = useTranslation();
  const { data: invites, accept, decline } = useMyPersonaInvites();
  const { showToast } = useToast();
  // Keyed by invite id + which action is in flight, so accepting one card's
  // invite never disables another card, and the busy button reads correctly
  // ("Accepting…" vs "Declining…") without a global flag.
  const [busy, setBusy] = useState<{
    id: string;
    action: "accept" | "decline";
  } | null>(null);
  // The invite currently showing the accept-confirmation disclosure
  // (IDN-2) — accepting is no longer a single tap, it opens this modal
  // first so the invitee sees exactly what access it grants (and, for an
  // Unlinked persona, what it reveals) before the invite is actually
  // accepted.
  const [confirmingInvite, setConfirmingInvite] = useState<MyInviteDTO | null>(
    null,
  );
  const { regionRef, markInviteLeaving, acceptButtonRef } =
    useFocusAfterInviteLeaves(invites);

  const pending = invites ?? [];
  if (pending.length === 0) return null;

  async function handleAccept(invite: MyInviteDTO) {
    setBusy({ id: invite.id, action: "accept" });
    try {
      await accept.mutateAsync(invite.id);
      markInviteLeaving(invite.id);
      showToast(
        t("subprofiles:invites.toastAccepted", { name: invite.personaName }),
        "success",
      );
      setConfirmingInvite(null);
    } catch (error) {
      // ENG-450: a block-refused accept has already closed the invite on the
      // server (see `SubprofileInvitesService.accept`). This closes the modal
      // the same way the success path does, so the member never sees a dead
      // "Confirm" button that can only fail again.
      if (isInviteBlocked(error)) {
        markInviteLeaving(invite.id);
        showToast(t("subprofiles:invites.toastAcceptBlocked"), "error");
        setConfirmingInvite(null);
      } else {
        showToast(
          inviteFailureMessage(
            error,
            t("subprofiles:invites.toastAcceptError"),
            t("shared:apiError.accountRestricted"),
          ),
          "error",
        );
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleDecline(invite: MyInviteDTO) {
    setBusy({ id: invite.id, action: "decline" });
    try {
      await decline.mutateAsync(invite.id);
      markInviteLeaving(invite.id);
      showToast(t("subprofiles:invites.toastDeclined"), "info");
    } catch (error) {
      showToast(
        inviteFailureMessage(
          error,
          t("subprofiles:invites.toastDeclineError"),
          t("shared:apiError.accountRestricted"),
        ),
        "error",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      ref={regionRef}
      className={styles.list}
      role="region"
      aria-label={t("subprofiles:invites.regionLabel")}
    >
      {pending.map((invite) => {
        const isBusy = busy?.id === invite.id;
        const isAccepting = isBusy && busy?.action === "accept";
        const isDeclining = isBusy && busy?.action === "decline";
        return (
          <div key={invite.id} className="banner">
            <Avatar
              initials={initialsFromName(invite.personaName, "?")}
              src={invite.personaAvatarUrl ?? undefined}
              name={invite.personaName}
              size={40}
              tint="jade"
            />
            <p>
              <Translation
                i18nKey="subprofiles:invites.message"
                components={{ em: <em /> }}
                values={{
                  inviter: invite.invitedByName,
                  persona: invite.personaName,
                }}
              />
            </p>
            <div className={styles.actions}>
              <Button
                ref={acceptButtonRef(invite.id)}
                variant="jade"
                size="sm"
                onClick={() => setConfirmingInvite(invite)}
                disabled={isBusy}
              >
                {isAccepting
                  ? t("subprofiles:invites.accepting")
                  : t("subprofiles:invites.accept")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleDecline(invite)}
                disabled={isBusy}
              >
                {isDeclining
                  ? t("subprofiles:invites.declining")
                  : t("subprofiles:invites.decline")}
              </Button>
            </div>
          </div>
        );
      })}

      {confirmingInvite && (
        <AcceptPersonaInviteModal
          invite={confirmingInvite}
          busy={busy?.id === confirmingInvite.id && busy.action === "accept"}
          onConfirm={() => void handleAccept(confirmingInvite)}
          onClose={() => setConfirmingInvite(null)}
        />
      )}
    </div>
  );
}
