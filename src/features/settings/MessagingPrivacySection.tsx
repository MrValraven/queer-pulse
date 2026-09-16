import { useMessagingPrivacy } from "./api/useMessagingPrivacy";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WhoCanMessage } from "../../shared/contracts/contracts";
import { Section } from "./SettingsControls";
import { ConsentToggleRow } from "./NotificationVolumeSections";
import styles from "./SettingsPage.module.css";

// Stable ids for the radio options, never the translated label.
const WHO_CAN_MESSAGE_OPTIONS: {
  v: WhoCanMessage;
  titleKey: string;
  hintKey: string;
}[] = [
  {
    v: "everyone",
    titleKey:
      "settings:visibility.messagingPrivacy.whoCanMessage.everyone.label",
    hintKey: "settings:visibility.messagingPrivacy.whoCanMessage.everyone.hint",
  },
  {
    v: "introduced",
    titleKey:
      "settings:visibility.messagingPrivacy.whoCanMessage.introduced.label",
    hintKey:
      "settings:visibility.messagingPrivacy.whoCanMessage.introduced.hint",
  },
  {
    v: "connections",
    titleKey:
      "settings:visibility.messagingPrivacy.whoCanMessage.connections.label",
    hintKey:
      "settings:visibility.messagingPrivacy.whoCanMessage.connections.hint",
  },
];

/**
 * PRD-364/PRD-366: read-receipt/typing/presence sharing (each reciprocal, see
 * `useMessagingPrivacy`'s own doc) plus "who can message me". Every control
 * saves the instant it changes, mirroring `GroupAddPolicySection` beside it
 * rather than joining the pane's dirty/save flow.
 */
export function MessagingPrivacySection() {
  const { t } = useTranslation();
  const {
    privacy,
    setShareReadReceipts,
    setShareTyping,
    setSharePresence,
    setWhoCanMessage,
    isLoading,
  } = useMessagingPrivacy();

  return (
    <>
      <Section label={t("settings:visibility.messagingPrivacy.title")}>
        <div className={styles.toggleList}>
          <ConsentToggleRow
            title={t("settings:visibility.messagingPrivacy.readReceipts.label")}
            description={t(
              "settings:visibility.messagingPrivacy.readReceipts.help",
            )}
            checked={privacy.shareReadReceipts}
            disabled={isLoading}
            onChange={setShareReadReceipts}
          />
          <ConsentToggleRow
            title={t("settings:visibility.messagingPrivacy.typing.label")}
            description={t("settings:visibility.messagingPrivacy.typing.help")}
            checked={privacy.shareTyping}
            disabled={isLoading}
            onChange={setShareTyping}
          />
          <ConsentToggleRow
            title={t("settings:visibility.messagingPrivacy.presence.label")}
            description={t(
              "settings:visibility.messagingPrivacy.presence.help",
            )}
            checked={privacy.sharePresence}
            disabled={isLoading}
            onChange={setSharePresence}
          />
        </div>
      </Section>
      <Section
        label={t("settings:visibility.messagingPrivacy.whoCanMessage.title")}
      >
        <div className={styles.toggleList}>
          {WHO_CAN_MESSAGE_OPTIONS.map((option) => (
            <label key={option.v} className={styles.radioRow}>
              <input
                type="radio"
                name="who-can-message"
                aria-label={t(option.titleKey)}
                value={option.v}
                checked={privacy.whoCanMessage === option.v}
                disabled={isLoading}
                onChange={() => setWhoCanMessage(option.v)}
              />
              <div>
                <div className={styles.toggleTitle}>{t(option.titleKey)}</div>
                <div className={styles.toggleDesc}>{t(option.hintKey)}</div>
              </div>
            </label>
          ))}
        </div>
      </Section>
    </>
  );
}
