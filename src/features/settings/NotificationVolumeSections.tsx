import { Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyCommunities } from "../communities/api/useMyCommunities";
import {
  useCommunityPreferences,
  useSetCommunityNotificationLevel,
} from "../communities/api/useCommunityPreferences";
import type { CommunityNotificationLevel } from "../communities/api/communityPreferences.api";
import { NOTIFICATION_CATEGORY_GROUPS } from "./NotificationVolume.data";
import {
  QUIET_HOURS_WINDOWS,
  formatMinuteOfDay,
  windowOptionValue,
} from "./api/notificationDelivery.api";
import type { NotificationDeliveryDTO } from "./api/notificationDelivery.api";
import { detectTimeZone } from "./api/notificationDelivery.api";
import { useNotificationPreferences } from "./api/useNotificationPreferences";
import { Section, SelectRow, ToggleList } from "./SettingsControls";
import styles from "./SettingsPage.module.css";

/**
 * A toggle row backed by a genuinely-persisted preference. Saves on flip, so it
 * never participates in the pane's dirty/save bar.
 *
 * Lives here rather than in `SettingsPanes.tsx` so both files can use it without
 * an import cycle: this module is the one that owns it.
 */
export function ConsentToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
  disabledHint,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Disables the toggle when a prerequisite isn't met (e.g. the profile
   *  isn't public yet) without hiding the row. */
  disabled?: boolean;
  /** Shown below the description in place of normal interaction, explaining
   *  why the toggle is disabled. Only rendered when `disabled` is true. */
  disabledHint?: string;
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleLabel}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleDesc}>{description}</div>
        {disabled && disabledHint && (
          <div className={styles.toggleHint}>{disabledHint}</div>
        )}
      </div>
      <div
        className={disabled ? styles.disabledControl : undefined}
        inert={disabled}
      >
        <Toggle
          tone="coral"
          checked={checked}
          onChange={onChange}
          label={title}
        />
      </div>
    </div>
  );
}

/**
 * Every switched notification category, grouped. Each row is one real
 * preference, saved the moment it is flipped.
 */
export function NotificationCategorySections() {
  const { t } = useTranslation();
  const { isEnabled, setEnabled } = useNotificationPreferences();
  return (
    <>
      {NOTIFICATION_CATEGORY_GROUPS.map((group) => (
        <Section key={group.id} label={t(group.labelKey)}>
          <ToggleList>
            {group.rows.map((categoryRow) => (
              <ConsentToggleRow
                key={categoryRow.category}
                title={t(categoryRow.titleKey)}
                description={t(categoryRow.descKey)}
                checked={isEnabled(categoryRow.category)}
                onChange={(next) => setEnabled(categoryRow.category, next)}
              />
            ))}
          </ToggleList>
        </Section>
      ))}
      {/* Naming what stays unmutable, rather than leaving a member to discover
          it. Every type behind this sentence is listed in the backend's
          `ALWAYS_DELIVERED_NOTIFICATION_TYPES`. */}
      <Section label={t("settings:notifications.volume.alwaysOn.label")}>
        <div className={styles.toggleDesc}>
          {t("settings:notifications.volume.alwaysOn.desc")}
        </div>
      </Section>
    </>
  );
}

/**
 * The quiet-hours control, persisted through `PUT /me/notification-delivery`.
 *
 * The description states plainly that only the phone buzz is withheld and the
 * notification still arrives in the bell, because the previous version of this
 * control persisted nothing and a member who set it and then got a 3am push had
 * been actively misled. The copy now describes what the code does.
 */
export function QuietHoursSection({
  delivery,
  onChange,
}: {
  delivery: NotificationDeliveryDTO;
  onChange: (next: NotificationDeliveryDTO) => void;
}) {
  const { t } = useTranslation();
  const currentValue = delivery.isQuietHoursEnabled
    ? windowOptionValue(
        delivery.quietHoursStartMinute,
        delivery.quietHoursEndMinute,
      )
    : "none";
  return (
    <Section label={t("settings:notifications.section.delivery")}>
      <SelectRow
        title={t("settings:notifications.delivery.quietHours.title")}
        description={t("settings:notifications.delivery.quietHours.desc")}
        value={currentValue}
        options={[
          {
            value: "none",
            label: t("settings:notifications.delivery.quietHours.none"),
          },
          ...QUIET_HOURS_WINDOWS.map((window) => ({
            value: windowOptionValue(window.startMinute, window.endMinute),
            // A clock range is numeric data, not translatable chrome, so only
            // the "off" option above carries a label key.
            label: `${formatMinuteOfDay(window.startMinute)} - ${formatMinuteOfDay(
              window.endMinute,
            )}`,
          })),
        ]}
        onChange={(value) => {
          if (value === "none") {
            onChange({ ...delivery, isQuietHoursEnabled: false });
            return;
          }
          // The option value is minted by `windowOptionValue`, so both halves
          // are always present; the fallbacks keep the default window rather
          // than writing NaN if that ever stops being true.
          const [startMinute, endMinute] = value.split("-");
          onChange({
            isQuietHoursEnabled: true,
            quietHoursStartMinute: Number(startMinute ?? 22 * 60),
            quietHoursEndMinute: Number(endMinute ?? 8 * 60),
            // Always send the clock the member is actually reading. A window
            // without the zone it was set in means nothing.
            timeZone: detectTimeZone(),
          });
        }}
      />
    </Section>
  );
}

/** The three levels the settings-side picker offers, loudest to quietest. */
const SETTINGS_LEVELS: CommunityNotificationLevel[] = [
  "all",
  "announcements",
  "muted",
];

/**
 * One community's own volume level. Each row reads and writes its own
 * community's preferences, which is also what the control on the community page
 * itself does, so the two surfaces share a cache key and stay in step.
 */
function CommunityLevelRow({ slug, name }: { slug: string; name: string }) {
  const { t } = useTranslation();
  const preferences = useCommunityPreferences(slug);
  const setLevel = useSetCommunityNotificationLevel(slug);
  return (
    <SelectRow
      title={name}
      description={t("settings:notifications.perCommunity.rowDesc")}
      value={preferences.notificationLevel}
      options={SETTINGS_LEVELS.map((level) => ({
        value: level,
        label: t(`settings:notifications.perCommunity.level.${level}`),
      }))}
      onChange={(value) => setLevel.mutate(value as CommunityNotificationLevel)}
    />
  );
}

/**
 * Per-community volume, in settings.
 *
 * The same setting the community's own page offers, gathered in one place: the
 * point of SOC-10 is that a member in five busy communities can turn four of
 * them down without visiting five pages, and without leaving any of them.
 */
export function CommunityVolumeSection() {
  const { t } = useTranslation();
  const memberships = useMyCommunities();
  const entries = Object.entries(memberships);
  if (entries.length === 0) return null;
  return (
    <Section label={t("settings:notifications.perCommunity.label")}>
      <div className={styles.toggleDesc}>
        {t("settings:notifications.perCommunity.intro")}
      </div>
      {entries.map(([slug, membership]) => (
        <CommunityLevelRow
          key={slug}
          slug={slug}
          name={membership.name ?? slug}
        />
      ))}
    </Section>
  );
}
