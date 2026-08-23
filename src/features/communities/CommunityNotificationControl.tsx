import { useId, useState } from "react";
import { FiAtSign, FiBell, FiBellOff, FiVolume2 } from "react-icons/fi";
import type { IconType } from "react-icons";
import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityNotificationLevel } from "./api/communityPreferences.api";
import {
  useCommunityPreferences,
  useSetCommunityNotificationLevel,
} from "./api/useCommunityPreferences";
import { CommunityNotificationOptions } from "./CommunityNotificationOptions";
import styles from "./CommunityNotificationControl.module.css";

const LEVEL_ICON: Record<CommunityNotificationLevel, IconType> = {
  all: FiVolume2,
  announcements: FiBell,
  mentions: FiAtSign,
  muted: FiBellOff,
};

/**
 * A member's own notification level for ONE community: everything,
 * announcements only, mentions only, or muted.
 *
 * Sits in the community's tab row rather than in mod tools, because every
 * member needs it and only staff can reach mod tools. The tab bar is the one
 * strip that stays on screen whichever tab is open, and it is where the
 * community's own controls already live, so a member turning a busy room down
 * finds it in the same place they switch between Pulse and Members. It renders
 * only for members: there is nothing to turn down until you have joined.
 *
 * The chosen level is applied at once and held locally, so the picker never
 * snaps back to the server's answer mid-interaction. A refused write rolls the
 * selection back to what the server still holds and says so.
 */
export function CommunityNotificationControl({
  slug,
  communityName,
}: {
  slug: string;
  communityName: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const preferences = useCommunityPreferences(slug);
  const setLevel = useSetCommunityNotificationLevel(slug);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] =
    useState<CommunityNotificationLevel | null>(null);
  const labelId = useId();
  const hintId = useId();

  // Once the member has chosen, their choice owns the picker; until then the
  // server's answer does. One community's selection can't leak onto the next
  // because the caller keys this component by slug, so a different community
  // is a different instance with fresh state.
  const currentLevel = selectedLevel ?? preferences.notificationLevel;
  const CurrentIcon = LEVEL_ICON[currentLevel];

  const chooseLevel = (nextLevel: CommunityNotificationLevel) => {
    if (nextLevel === currentLevel) return;
    const previousLevel = currentLevel;
    setSelectedLevel(nextLevel);
    setLevel.mutate(nextLevel, {
      onSuccess: () =>
        showToast(
          t(`communities:detail.notifications.savedToast.${nextLevel}`, {
            name: communityName,
          }),
          "success",
        ),
      onError: () => {
        setSelectedLevel(previousLevel);
        showToast(t("communities:detail.notifications.errorToast"), "error");
      },
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={isPickerOpen}
        // Names the control for assistive tech without a visible second line.
        // The visible level title is contained in this string, so the spoken
        // name still starts from what a member can read (WCAG 2.5.3).
        aria-label={t("communities:detail.notifications.triggerAria", {
          name: communityName,
          level: t(
            `communities:detail.notifications.level.${currentLevel}.title`,
          ),
        })}
        onClick={() => setIsPickerOpen(true)}
      >
        <CurrentIcon aria-hidden />
        <span className={styles.triggerLabel}>
          {t(`communities:detail.notifications.level.${currentLevel}.title`)}
        </span>
      </Button>

      {isPickerOpen && (
        <Modal
          title={t("communities:detail.notifications.title")}
          sub={t("communities:detail.notifications.subtitle", {
            name: communityName,
          })}
          onClose={() => setIsPickerOpen(false)}
          footer={
            <Button variant="primary" onClick={() => setIsPickerOpen(false)}>
              {t("communities:detail.notifications.doneCta")}
            </Button>
          }
        >
          <div className={styles.groupLabel} id={labelId}>
            {t("communities:detail.notifications.groupLabel")}
          </div>
          <p className={styles.groupHint} id={hintId}>
            {t("communities:detail.notifications.groupHint")}
          </p>
          <CommunityNotificationOptions
            value={currentLevel}
            onChange={chooseLevel}
            labelledBy={labelId}
            describedBy={hintId}
          />
        </Modal>
      )}
    </>
  );
}
