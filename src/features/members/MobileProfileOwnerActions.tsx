import { FiEdit3, FiEye } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ProfileSettingsMenu } from "./ProfileSettingsMenu";
import type { MemberProfile } from "./data/memberProfiles";
import styles from "./MobileProfile.module.css";

/** The page's three owner-only settings handlers. The page hands over all
 *  three or none, and the settings menu renders only with all three. */
type OwnerSettingsHandlers = {
  onOpenWhoSeesWhat?: () => void;
  onOpenAccountData?: () => void;
  onToggleHidden?: () => void;
};

/**
 * The owner's settings "..." menu for the phone header. Visibility settings,
 * per-person hiding, report receipts, data export, step-away and DSAR all
 * live behind this menu. It used to render only in the desktop hero, which
 * left every one of them unreachable from a phone; it now shares the quiet
 * 44px icon with the desktop toolbar.
 */
function OwnerSettingsMenu({
  profile,
  handlers,
}: {
  profile: MemberProfile;
  handlers: OwnerSettingsHandlers;
}) {
  const { onOpenWhoSeesWhat, onOpenAccountData, onToggleHidden } = handlers;
  if (!onOpenWhoSeesWhat || !onOpenAccountData || !onToggleHidden) return null;
  return (
    <ProfileSettingsMenu
      profile={profile}
      onOpenWhoSeesWhat={onOpenWhoSeesWhat}
      onOpenAccountData={onOpenAccountData}
      onToggleHidden={onToggleHidden}
      hiddenUntil={profile.hiddenUntil ?? null}
    />
  );
}

/**
 * The owner's action row in the phone header, straight under the identity
 * block: two equal-width labelled ghost buttons, Edit and Preview, then the
 * settings "…" menu. No QR button here: the settings menu already offers
 * "Show QR". Short labels (11 characters at most) keep each half on one line
 * at 375px. The Edit button carries `id="profileEditCta"`, because
 * `useProfileEditGuard` refocuses that id when edit mode closes. Rendered
 * only on a genuine self view.
 */
export function MobileProfileOwnerActions({
  profile,
  onEdit,
  onPreview,
  settingsHandlers,
}: {
  profile: MemberProfile;
  onEdit?: () => void;
  onPreview?: () => void;
  settingsHandlers: OwnerSettingsHandlers;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.actionRow}>
      <Button
        id="profileEditCta"
        variant="ghost"
        className={styles.actionButton}
        aria-label={t("members:profile.hero.editCta")}
        onClick={onEdit}
      >
        <FiEdit3 aria-hidden /> {t("members:profile.hero.editShort")}
      </Button>
      <Button
        variant="ghost"
        className={styles.actionButton}
        onClick={onPreview}
      >
        <FiEye aria-hidden /> {t("members:profile.hero.previewShort")}
      </Button>
      <OwnerSettingsMenu profile={profile} handlers={settingsHandlers} />
    </div>
  );
}
