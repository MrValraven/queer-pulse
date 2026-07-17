import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberPicker } from "./MemberPicker";
import { MEMBER_POOL, type CohostCandidate } from "./manageCohosts.data";
import modal from "./GatheringModals.module.css";

export function AddCohostModal({
  /** Slugs already cohosting — hidden from the pool. */
  excludeSlugs,
  onPick,
  onClose,
}: {
  excludeSlugs: string[];
  onPick: (candidate: CohostCandidate) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  useScrollLock();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pick = (slug: string) => {
    const candidate = MEMBER_POOL.find((c) => c.slug === slug);
    if (candidate) onPick(candidate);
  };

  return (
    <div
      className={modal.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("gatherings:cohost.addModal.eyebrow")}
        className={modal.modal}
      >
        <button
          type="button"
          className={modal.close}
          onClick={onClose}
          aria-label={t("gatherings:cohost.closeAria")}
        >
          <FiX />
        </button>
        <div className={modal.eye}>
          {t("gatherings:cohost.addModal.eyebrow")}
        </div>
        <div className={modal.title}>
          <Translation
            i18nKey="gatherings:cohost.addModal.title"
            components={{ em: <em /> }}
          />
        </div>
        <p className={modal.sub}>{t("gatherings:cohost.addModal.sub")}</p>

        <MemberPicker
          candidates={MEMBER_POOL}
          excludeSlugs={excludeSlugs}
          onToggle={pick}
          searchLabel={t("gatherings:cohost.addModal.searchLabel")}
        />
      </div>
    </div>
  );
}
