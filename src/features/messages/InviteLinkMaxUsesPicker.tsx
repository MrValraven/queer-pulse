import { SegmentedControl } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  INVITE_LINK_MAX_USES_OPTIONS,
  toInviteLinkMaxUses,
  type InviteLinkMaxUses,
} from "./inviteLinkUses";
import styles from "./GroupInfoModal.module.css";

const UNLIMITED_VALUE = "unlimited";

interface InviteLinkMaxUsesPickerProps {
  value: InviteLinkMaxUses;
  onChange: (maxUses: InviteLinkMaxUses) => void;
}

/**
 * PRD-400 (use cap): the small "Max uses" choice an owner or admin makes
 * when creating or resetting the group's invite link: 1, 5, 25 or Unlimited
 * (the default, so a link made without a choice behaves as it always has).
 */
export function InviteLinkMaxUsesPicker({
  value,
  onChange,
}: InviteLinkMaxUsesPickerProps) {
  const { t } = useTranslation();
  const label = t("messages:group.inviteLink.maxUses");
  const options = [
    ...INVITE_LINK_MAX_USES_OPTIONS.map((option) => ({
      value: String(option),
      label: String(option),
    })),
    {
      value: UNLIMITED_VALUE,
      label: t("messages:group.inviteLink.maxUsesUnlimited"),
    },
  ];

  return (
    <div className={styles.inviteMaxUses}>
      <span className={styles.inviteMaxUsesLabel} aria-hidden>
        {label}
      </span>
      <SegmentedControl
        label={label}
        fullWidth
        options={options}
        value={value == null ? UNLIMITED_VALUE : String(value)}
        onChange={(next) =>
          onChange(
            next === UNLIMITED_VALUE ? null : toInviteLinkMaxUses(Number(next)),
          )
        }
      />
    </div>
  );
}
