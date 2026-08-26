import { useState } from "react";
import { FiFlag } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SafeSpaceFlagModal } from "./SafeSpaceFlagModal";
import { useWithdrawSafeSpaceFlag } from "./api/useSafeSpaceFlag";
import styles from "./SafeSpaceBadgeStatus.module.css";

/**
 * The member's affordance on a badged safe space: "something has changed
 * here".
 *
 * Deliberately calm. It sits below the badge state as a quiet ghost action
 * rather than a red alarm, because the common case is a member noticing a
 * ramp blocked or a change of ownership, and a frightening control gets used
 * only in a crisis, which is exactly when it is least reliable.
 *
 * A member who has already raised one sees that plainly, plus a way to
 * withdraw it. Nobody sees a running count: the tally lives behind the
 * moderator queue, so this can never turn into a public pillory and the
 * person who raised it stays unnamed.
 */
export function SafeSpaceFlagControl({
  slug,
  spaceName,
  hasAlreadyFlagged,
  flagThreshold,
}: {
  slug: string;
  spaceName: string;
  hasAlreadyFlagged: boolean;
  /** The published threshold, carried down from the badge-state payload so no
   *  copy hardcodes the promise a second time. */
  flagThreshold?: number;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const withdraw = useWithdrawSafeSpaceFlag();

  function handleWithdraw() {
    withdraw.mutate(
      { slug },
      {
        onSuccess: () => showToast(t("safety:flag.withdrawnToast"), "success"),
        onError: () => showToast(t("safety:flag.errorToast"), "error"),
      },
    );
  }

  if (hasAlreadyFlagged) {
    return (
      <div className={styles.flagRow} role="status">
        <span className={styles.flagNote}>{t("safety:flag.alreadyNote")}</span>
        <Button
          variant="ghost"
          size="md"
          onClick={handleWithdraw}
          disabled={withdraw.isPending}
        >
          {t("safety:flag.withdrawCta")}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.flagRow}>
      <span className={styles.flagNote}>{t("safety:flag.prompt")}</span>
      <Button variant="ghost" size="md" onClick={() => setIsModalOpen(true)}>
        <FiFlag aria-hidden /> {t("safety:flag.openCta")}
      </Button>

      {isModalOpen && (
        <SafeSpaceFlagModal
          slug={slug}
          spaceName={spaceName}
          flagThreshold={flagThreshold}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
