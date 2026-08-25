import { Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./BlockMuteInfoModal.module.css";

/**
 * Target-less "how blocking and muting work" explainer as a modal — the same
 * copy BlockMuteExplainer shows at /block-mute without a real member, but
 * without leaving the current flow (onboarding, guidelines) to reach it.
 */
export function BlockMuteInfoModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal
      title={
        <Translation
          i18nKey="safety:blockMute.choose.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("safety:blockMute.explainer.sub")}
      onClose={onClose}
    >
      <div className={styles.item}>
        <div className={styles.itemTitle}>
          {t("safety:blockMute.explainer.muteTitle")}
        </div>
        <p className={styles.itemDesc}>
          {t("safety:blockMute.choose.muteDesc")}
        </p>
      </div>
      <div className={styles.item}>
        <div className={styles.itemTitle}>
          {t("safety:blockMute.explainer.blockTitle")}
        </div>
        <p className={styles.itemDesc}>
          {t("safety:blockMute.choose.blockDesc")}
        </p>
      </div>
    </Modal>
  );
}
