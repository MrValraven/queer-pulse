import { useState } from "react";
import { FiEyeOff, FiShield } from "react-icons/fi";
import { Button, ModalSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MyInviteDTO } from "./api/subprofiles.api";
import styles from "./AcceptPersonaInviteModal.module.css";

interface AcceptPersonaInviteModalProps {
  invite: MyInviteDTO;
  /** Whether the accept mutation this invite belongs to is in flight. */
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Disclosure/confirm step shown before an incoming co-owner invite is
 * actually accepted (IDN-2) — the "more important" half of the fix, per the
 * audit: accepting grants full, unrestricted management access, and for an
 * Unlinked (pseudonymous) persona specifically, it's the moment the
 * invitee's real account becomes visible to the persona's other co-owners
 * (and theirs to the invitee). `PersonaInvitesBanner`'s one-tap "Accept" used
 * to fire the mutation immediately with no disclosure at all — this gates it
 * behind an explicit acknowledgment checkbox instead, the invitee-side twin
 * of `InviteCoOwnerModal`'s send-side confirm step.
 */
export function AcceptPersonaInviteModal({
  invite,
  busy,
  onConfirm,
  onClose,
}: AcceptPersonaInviteModalProps) {
  const { t } = useTranslation();
  const [acknowledged, setAcknowledged] = useState(false);
  const isUnlinkedPersona = invite.linkVisibility === "unlinked";

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("subprofiles:invites.confirmTitle")}
    >
      <header className={styles.head}>
        <h3 className={styles.title}>
          {t("subprofiles:invites.confirmTitle")}
        </h3>
        <p className={styles.sub}>
          {t("subprofiles:invites.confirmSub", { name: invite.personaName })}
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.notice}>
          <FiShield size={20} aria-hidden className={styles.noticeIcon} />
          <div className={styles.noticeBody}>
            <b>{t("subprofiles:invites.disclosureAccessTitle")}</b>
            <p>
              {t("subprofiles:invites.disclosureAccessBody", {
                name: invite.personaName,
              })}
            </p>
          </div>
        </div>

        {isUnlinkedPersona && (
          <div className={styles.notice}>
            <FiEyeOff size={20} aria-hidden className={styles.noticeIcon} />
            <div className={styles.noticeBody}>
              <b>{t("subprofiles:invites.disclosureIdentityTitle")}</b>
              <p>
                {t("subprofiles:invites.disclosureIdentityBody", {
                  name: invite.personaName,
                })}
              </p>
            </div>
          </div>
        )}

        <label
          className={styles.acknowledgeRow}
          htmlFor="accept-persona-invite-acknowledge"
        >
          <input
            id="accept-persona-invite-acknowledge"
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          <span>
            {t(
              isUnlinkedPersona
                ? "subprofiles:invites.acknowledgeUnlinked"
                : "subprofiles:invites.acknowledgeLinked",
              { name: invite.personaName },
            )}
          </span>
        </label>
      </div>

      <div className={styles.foot}>
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          {t("subprofiles:invites.confirmCancel")}
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={!acknowledged || busy}
        >
          {busy
            ? t("subprofiles:invites.accepting")
            : t("subprofiles:invites.confirmAccept")}
        </Button>
      </div>
    </ModalSheet>
  );
}
