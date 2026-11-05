import { ModalSheet } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { VjPackList, type VjPackListProps } from "./VjPackList";
import styles from "./VjPacks.module.css";

/**
 * The phone's pack manager: the same rail as on desktop, in a bottom sheet.
 * Choosing or creating a pack shows it and closes the sheet. Mount it inside
 * an `AnimatePresence` so the sheet slides away on close.
 */
export function VjPackManageSheet({
  onClose,
  onSelect,
  ...listProps
}: VjPackListProps & { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("vj:packs.heading")}
      className={styles.sheet}
    >
      <VjPackList
        {...listProps}
        onSelect={(packId) => {
          onSelect(packId);
          onClose();
        }}
      />
    </ModalSheet>
  );
}
