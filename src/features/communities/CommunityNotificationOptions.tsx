import { FiAtSign, FiBell, FiBellOff, FiVolume2 } from "react-icons/fi";
import type { IconType } from "react-icons";
import { RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COMMUNITY_NOTIFICATION_LEVELS,
  type CommunityNotificationLevel,
} from "./api/communityPreferences.api";
import styles from "./CommunityNotificationControl.module.css";

const LEVEL_ICON: Record<CommunityNotificationLevel, IconType> = {
  all: FiVolume2,
  announcements: FiBell,
  mentions: FiAtSign,
  muted: FiBellOff,
};

/**
 * The four levels as a radiogroup, each stating in plain words what the member
 * will actually receive. Split out of `CommunityNotificationControl` so the
 * control keeps only the trigger + dialog wiring and both stay well under the
 * 200-line limit.
 *
 * Built on the shared `RadioCardGroup`, so the whole set carries real
 * radiogroup semantics: roving tabindex, arrow-key selection, `aria-checked`.
 */
export function CommunityNotificationOptions({
  value,
  onChange,
  labelledBy,
  describedBy,
}: {
  value: CommunityNotificationLevel;
  onChange: (level: CommunityNotificationLevel) => void;
  /** id of the visible group label the dialog already renders. */
  labelledBy: string;
  /** id of the visible hint under that label. */
  describedBy: string;
}) {
  const { t } = useTranslation();

  return (
    <RadioCardGroup<CommunityNotificationLevel>
      value={value}
      onChange={onChange}
      ariaLabel={t("communities:detail.notifications.groupLabel")}
      ariaLabelledBy={labelledBy}
      ariaDescribedBy={describedBy}
      className={styles.options}
      optionClassName={styles.option}
      checkedClassName={styles.optionChecked}
      options={COMMUNITY_NOTIFICATION_LEVELS.map((level) => {
        const Icon = LEVEL_ICON[level];
        return {
          id: level,
          render: (
            <>
              <span className={styles.optionIcon} aria-hidden>
                <Icon />
              </span>
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>
                  {t(`communities:detail.notifications.level.${level}.title`)}
                </span>
                <span className={styles.optionDescription}>
                  {t(
                    `communities:detail.notifications.level.${level}.description`,
                  )}
                </span>
              </span>
            </>
          ),
        };
      })}
    />
  );
}
