import { FiShare2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { shareSubprofile } from "./shareSubprofile";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import styles from "./SubprofileShare.module.css";

/**
 * Share control for a public persona page: hands off to the native share
 * sheet where available (mobile browsers), falling back to copy-link +
 * toast. The behaviour lives in `shareSubprofile`, shared with the
 * `SubprofileMoreMenu` overflow item.
 */
export function SubprofileShare({ view }: { view: PublicSubprofileView }) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return (
    <Button
      variant="ghost"
      size="md"
      className={styles.shareButton}
      aria-label={t("subprofiles:share.ariaLabel")}
      onClick={() => void shareSubprofile(view, t, showToast)}
    >
      <FiShare2 aria-hidden />
      {t("subprofiles:share.cta")}
    </Button>
  );
}
