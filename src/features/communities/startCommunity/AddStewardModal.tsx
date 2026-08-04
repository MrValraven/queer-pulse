import { useMemo } from "react";
import { ModalSheet } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MemberPicker } from "../../gatherings/MemberPicker";
import type { CohostCandidate } from "../../gatherings/manageCohosts.data";
import { useConnectionsList } from "../../connect/api/useConnectionsList";
import { connectionToCandidate } from "./stewardCandidates";
import styles from "./AddStewardModal.module.css";

export function AddStewardModal({
  /** Slugs already stewarding — hidden from the pool (owner + existing co-stewards). */
  excludeSlugs,
  onPick,
  onClose,
}: {
  excludeSlugs: string[];
  onPick: (candidate: CohostCandidate) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { views } = useConnectionsList("all");
  const candidates = useMemo(
    () => views.map(connectionToCandidate),
    [views],
  );
  const selectable = useMemo(
    () => candidates.filter((candidate) => !excludeSlugs.includes(candidate.slug)),
    [candidates, excludeSlugs],
  );

  const pick = (slug: string) => {
    const candidate = candidates.find((entry) => entry.slug === slug);
    if (candidate) onPick(candidate);
  };

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("communities:start.running.addStewardModal.eyebrow")}
    >
      <div className={styles.eyebrow}>
        {t("communities:start.running.addStewardModal.eyebrow")}
      </div>
      <div className={styles.title}>
        {t("communities:start.running.addStewardModal.title")}
      </div>
      <p className={styles.sub}>
        {t("communities:start.running.addStewardModal.sub")}
      </p>

      {selectable.length === 0 ? (
        <p className={styles.empty}>
          {t("communities:start.running.addStewardModal.empty")}
        </p>
      ) : (
        <MemberPicker
          candidates={candidates}
          excludeSlugs={excludeSlugs}
          onToggle={pick}
          secondaryField="slug"
          searchLabel={t(
            "communities:start.running.addStewardModal.searchLabel",
          )}
          placeholder={t(
            "communities:start.running.addStewardModal.searchPlaceholder",
          )}
        />
      )}
    </ModalSheet>
  );
}
