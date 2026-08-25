import { FiEyeOff, FiLink, FiRotateCcw } from "react-icons/fi";
import { ConfirmDialog } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./ListingTrading.module.css";

/**
 * The step between choosing "permanently closed" and it being true.
 *
 * Permanently closed is the one state that takes a business out of browse,
 * search, map and safe-space results, so it is the one state that must not be
 * a click away. This says what actually happens, in the order an owner would
 * want to hear it: what disappears, what survives, and that it can be undone.
 * Every line is the real behaviour, so nobody discovers a consequence
 * afterwards.
 */
export function ListingPermanentClosureDialog({
  placeName,
  isSaving,
  onConfirm,
  onClose,
}: {
  placeName: string;
  isSaving: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={isSaving}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("marketing:listBusiness.trading.closeConfirm.title", {
        name: placeName,
      })}
      description={t("marketing:listBusiness.trading.closeConfirm.lead")}
      cancelLabel={t("marketing:listBusiness.trading.closeConfirm.cancel")}
      confirmLabel={t("marketing:listBusiness.trading.closeConfirm.confirm")}
    >
      <ul className={styles.consequences}>
        <li>
          <FiEyeOff aria-hidden className={styles.consequenceIcon} />
          <span>
            {t("marketing:listBusiness.trading.closeConfirm.removed")}
          </span>
        </li>
        <li>
          <FiLink aria-hidden className={styles.consequenceIcon} />
          <span>{t("marketing:listBusiness.trading.closeConfirm.kept")}</span>
        </li>
        <li>
          <FiRotateCcw aria-hidden className={styles.consequenceIcon} />
          <span>
            {t("marketing:listBusiness.trading.closeConfirm.reversible")}
          </span>
        </li>
      </ul>
    </ConfirmDialog>
  );
}
