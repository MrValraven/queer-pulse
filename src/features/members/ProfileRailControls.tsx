import { FiDownload, FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfileRailControls.module.css";

interface ProfileRailControlsProps {
  onOpenWhoSeesWhat: () => void;
  onOpenAccountData: () => void;
  onToggleHidden: () => void;
  hiddenUntil: string | null;
}

export function ProfileRailControls({
  onOpenWhoSeesWhat,
  onOpenAccountData,
  onToggleHidden,
  hiddenUntil,
}: ProfileRailControlsProps) {
  const { t } = useTranslation();
  const isHidden = !!hiddenUntil && new Date(hiddenUntil) > new Date();

  return (
    <div className={styles.railctl}>
      <button type="button" onClick={onOpenWhoSeesWhat}>
        <FiEye aria-hidden />
        {t("members:profile.rail.whoSeesWhat")}
      </button>
      <button type="button" onClick={onToggleHidden}>
        <FiEyeOff aria-hidden />
        {isHidden
          ? t("members:profile.rail.bringMeBack")
          : t("members:profile.rail.hideMe24h")}
      </button>
      <button type="button" onClick={onOpenAccountData}>
        <FiDownload aria-hidden />
        {t("members:profile.rail.yourData")}
        <span className={styles.quiet}>{t("members:profile.rail.yourDataSub")}</span>
      </button>
    </div>
  );
}
