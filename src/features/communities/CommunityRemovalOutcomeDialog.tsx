import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { CommunityRemovalOutcomeDTO } from "./api/communities.api";
import styles from "./ModToolsBanRatifications.module.css";

/**
 * What a removal actually did, when what it did is not what the moderator
 * probably thinks (PRD-25).
 *
 * Removing someone without a term is a request for a PERMANENT bar, and a
 * permanent bar now takes two people. So the same click lands in one of two
 * places the old 204 could never say out loud:
 *
 *  - the bar is in force at the fallback term and the permanence is waiting on
 *    a second owner, co-owner or moderator; or
 *  - this community has nobody else who could sign, so the fallback term is
 *    the whole sanction and there is no permanent bar to be had here.
 *
 * A moderator who believes they just barred somebody forever, and did not, has
 * been actively misled, which is why these two outcomes get a dialog rather
 * than the toast an ordinary removal gets. The server's own sentence leads,
 * unedited, because it is the authority on which outcome this was.
 */
export function CommunityRemovalOutcomeDialog({
  outcome,
  onOpenRatifications,
  onClose,
}: {
  outcome: CommunityRemovalOutcomeDTO;
  /** Opens the second-signature queue. Offered only on the pending outcome,
   *  where there is something waiting to look at. */
  onOpenRatifications: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isPending = outcome.isPendingRatification;

  const barDate = outcome.barExpiresAt
    ? fmt.date(new Date(outcome.barExpiresAt))
    : null;
  const lapseDate = outcome.ratificationExpiresAt
    ? `${fmt.date(new Date(outcome.ratificationExpiresAt), { day: "numeric", month: "short" })} ${fmt.time(new Date(outcome.ratificationExpiresAt))}`
    : null;

  return (
    <Modal
      title={t(
        isPending
          ? "communities:detail.modtools.removalOutcome.pending.title"
          : "communities:detail.modtools.removalOutcome.noSecond.title",
      )}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("communities:detail.modtools.removalOutcome.closeCta")}
          </Button>
          {isPending && (
            <Button onClick={onOpenRatifications}>
              {t("communities:detail.modtools.removalOutcome.openQueueCta")}
            </Button>
          )}
        </>
      }
    >
      <div className={styles.outcome}>
        <p className={styles.outcomeMessage}>{outcome.message}</p>

        <p className={styles.outcomeBody}>
          {t(
            isPending
              ? "communities:detail.modtools.removalOutcome.pending.body"
              : "communities:detail.modtools.removalOutcome.noSecond.body",
          )}
        </p>

        {isPending && lapseDate && (
          <p className={styles.outcomeBody}>
            {t("communities:detail.modtools.removalOutcome.pending.lapsesAt", {
              date: lapseDate,
            })}
          </p>
        )}

        {barDate && (
          <p className={styles.outcomeBody}>
            {t("communities:detail.modtools.removalOutcome.servingUntil", {
              date: barDate,
            })}
          </p>
        )}
      </div>
    </Modal>
  );
}
