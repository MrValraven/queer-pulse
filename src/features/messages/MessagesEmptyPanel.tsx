import { FiMessageCircle } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MessagesPage.module.css";

/** Right-pane state (desktop) when no conversation exists to open. */
export function MessagesEmptyPanel() {
  const { t } = useTranslation();
  return (
    <div className={styles.emptyPanel}>
      <EmptyState
        icon={<FiMessageCircle />}
        title={t("messages:conversation.emptyPanelTitle")}
        description={t("messages:conversation.emptyPanelBody")}
      />
    </div>
  );
}
