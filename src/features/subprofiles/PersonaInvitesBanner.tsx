import { useState } from "react";
import { Avatar, Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { reasonFor } from "../../shared/api/errorMessage";
import { initialsFromName } from "../../shared/lib/initials";
import { useMyPersonaInvites } from "./api/useMyPersonaInvites";
import type { MyInviteDTO } from "./api/subprofiles.api";
import styles from "./PersonaInvitesBanner.module.css";

/**
 * "You've been invited" surface, sat above the persona grid on the owner
 * dashboard: one compact accent-tinted `.banner` row (global class, ported
 * in `persona-dashboard.css`) per incoming co-owner invite — a call-to-action
 * nudge, not the plum-panel confirmation treatment — with Accept / Decline
 * inline. Renders nothing when there are no pending invites — this is a
 * celebratory add-on, never an empty-state placeholder. Each row tracks its
 * own in-flight mutation by `invite.id` so accepting one invite never
 * disables the buttons on another.
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

  const pending = invites ?? [];
  if (pending.length === 0) return null;

  async function handleAccept(invite: MyInviteDTO) {
    setBusy({ id: invite.id, action: "accept" });
    try {
      await accept.mutateAsync(invite.id);
      showToast(
        t("subprofiles:invites.toastAccepted", { name: invite.personaName }),
        "success",
      );
    } catch (error) {
      showToast(
        reasonFor(error) ?? t("subprofiles:invites.toastAcceptError"),
        "error",
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleDecline(invite: MyInviteDTO) {
    setBusy({ id: invite.id, action: "decline" });
    try {
      await decline.mutateAsync(invite.id);
      showToast(t("subprofiles:invites.toastDeclined"), "info");
    } catch (error) {
      showToast(
        reasonFor(error) ?? t("subprofiles:invites.toastDeclineError"),
        "error",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
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
                variant="jade"
                size="sm"
                onClick={() => void handleAccept(invite)}
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
    </div>
  );
}
