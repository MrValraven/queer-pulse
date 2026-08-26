import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminModal } from "./ui";
import type { Ratification } from "./adminModeration.data";
import type { RatifyDecision } from "./AdminRatificationCard";
import styles from "./AdminModerationPage.module.css";

/**
 * The last step before a second moderator's signature removes an account, or
 * refuses to (TS-12).
 *
 * There is a confirmation dialog here and no Undo, which is the opposite of
 * every other action in this queue. That is deliberate. Undo exists so a
 * mis-click never reaches the member; on this surface the click IS the removal
 * of somebody's account, and the protection against a mistaken one is the
 * feature itself: a second person had to read the case and agree. Adding a
 * 5-second window on top would suggest the decision is casual, and would leave
 * a ban half-applied while the timer ran.
 *
 * Confirming restates what happens, including the parts a moderator may not
 * have thought about: the account is gone, every session ends, and the way back
 * is an appeal. Refusing restates the gentler truth: the member comes straight
 * back, and the first moderator can make the case again with more evidence.
 */
export function RatificationConfirmModal({
  ratification,
  decision,
  onClose,
  onConfirm,
}: {
  ratification: Ratification;
  decision: RatifyDecision;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [note, setNote] = useState("");
  const isRatifying = decision === "ratify";

  return (
    <AdminModal
      title={t(
        isRatifying
          ? "admin:moderation.ratification.confirmModal.title"
          : "admin:moderation.ratification.declineModal.title",
        { name: ratification.targetName },
      )}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant={isRatifying ? "danger" : "primary"}
            onClick={() => onConfirm(note.trim())}
          >
            {t(
              isRatifying
                ? "admin:moderation.ratification.confirmModal.cta"
                : "admin:moderation.ratification.declineModal.cta",
            )}
          </Button>
        </>
      }
    >
      <p className={styles.dTransparency}>
        {t(
          isRatifying
            ? "admin:moderation.ratification.confirmModal.body"
            : "admin:moderation.ratification.declineModal.body",
          { name: ratification.targetName },
        )}
      </p>

      <h3 className={styles.dSecLabel}>
        {t("admin:moderation.ratification.confirmModal.askedByLabel", {
          name: ratification.requestedByName,
        })}
      </h3>
      {/* The first moderator's own words, quoted in full rather than
          summarized: this is the case the ratifying moderator is agreeing
          with, and a paraphrase would be them agreeing with us instead. */}
      <blockquote className={styles.ratifyReason}>
        {ratification.note ?? t("admin:moderation.ratification.noReason")}
      </blockquote>

      <p className={styles.dTransparency}>
        {t("admin:moderation.ratification.confirmModal.lapseNote", {
          date: `${fmt.date(new Date(ratification.expiresAt), {
            day: "numeric",
            month: "short",
          })} ${fmt.time(new Date(ratification.expiresAt))}`,
        })}
      </p>

      <h3 className={styles.dSecLabel}>
        {t("admin:moderation.ratification.confirmModal.noteLabel")}
      </h3>
      <textarea
        aria-label={t("admin:moderation.ratification.confirmModal.noteLabel")}
        className={styles.dNote}
        rows={3}
        placeholder={t(
          isRatifying
            ? "admin:moderation.ratification.confirmModal.notePlaceholder"
            : "admin:moderation.ratification.declineModal.notePlaceholder",
        )}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
    </AdminModal>
  );
}
