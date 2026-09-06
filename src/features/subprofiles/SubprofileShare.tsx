import { FiShare2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { personaPublicPathOrNull } from "./personaLinks.data";
import { shareSubprofile } from "./shareSubprofile";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import styles from "./SubprofileShare.module.css";

/**
 * Share control for a public persona page: hands off to the native share
 * sheet where available (mobile browsers), falling back to copy-link +
 * toast. The behaviour lives in `shareSubprofile`, shared with the
 * `SubprofileMoreMenu` overflow item.
 *
 * An unlinked persona with no handle has no public address, and the owner is
 * the only viewer who can ever be looking at one (it is their own unpublished
 * draft). The control stays visible and DISABLED there rather than vanishing:
 * an owner who cannot find Share reads the feature as broken. The reason rides
 * the accessible name, and the hero's meta line right below already spells out
 * "No address yet: set a handle to give it one" on screen.
 */
export function SubprofileShare({ view }: { view: PublicSubprofileView }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const hasPublicAddress = personaPublicPathOrNull(view) !== null;

  return (
    <Button
      variant="ghost"
      size="md"
      className={styles.shareButton}
      disabled={!hasPublicAddress}
      aria-label={t(
        hasPublicAddress
          ? "subprofiles:share.ariaLabel"
          : "subprofiles:share.noAddressAria",
      )}
      onClick={() => void shareSubprofile(view, t, showToast)}
    >
      <FiShare2 aria-hidden />
      {t("subprofiles:share.cta")}
    </Button>
  );
}
