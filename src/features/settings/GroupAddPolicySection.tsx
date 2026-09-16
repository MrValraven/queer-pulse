import { useGroupAddPolicy } from "./api/useGroupAddPolicy";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupAddPolicy } from "../../shared/contracts/contracts";
import { Section } from "./SettingsControls";
import styles from "./SettingsPage.module.css";

// Stable ids for the radio options, never the translated label.
const GROUP_ADD_POLICY_OPTIONS: { policy: GroupAddPolicy; titleKey: string }[] =
  [
    {
      policy: "connections",
      titleKey: "settings:visibility.groupAddPolicy.connections.label",
    },
    {
      policy: "invite_only",
      titleKey: "settings:visibility.groupAddPolicy.inviteOnly.label",
    },
  ];

/**
 * PRD-353: "Who can add me to groups". `connections` (default) lets an
 * owner/admin who is an accepted connection seat the caller directly;
 * `invite_only` turns every add into an invite the caller accepts or
 * declines. Saves the moment it is chosen, mirroring every other row in this
 * pane (`useSuggestionVisibility`, `useActivityVisibility`) rather than
 * joining the page's dirty/save flow.
 */
export function GroupAddPolicySection() {
  const { t } = useTranslation();
  const { policy, setPolicy, isLoading } = useGroupAddPolicy();
  return (
    <Section label={t("settings:visibility.groupAddPolicy.title")}>
      <div className={styles.toggleList}>
        {GROUP_ADD_POLICY_OPTIONS.map((option) => (
          <label key={option.policy} className={styles.radioRow}>
            <input
              type="radio"
              name="group-add-policy"
              value={option.policy}
              checked={policy === option.policy}
              disabled={isLoading}
              onChange={() => setPolicy(option.policy)}
            />
            <div className={styles.toggleTitle}>{t(option.titleKey)}</div>
          </label>
        ))}
      </div>
      <p className={styles.toggleHint}>
        {t("settings:visibility.groupAddPolicy.explanation")}
      </p>
    </Section>
  );
}
