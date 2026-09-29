import type { ReactNode } from "react";
import { FiX, FiUserPlus, FiShield } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { photoOf } from "../communities/communityPeople";
import { RoleBadge } from "../communities/CommunityBadges";
import type { RosterMember } from "../communities/community.model";
import styles from "./ModPanel.module.css";

/** One roster action (DES-425). The shared `<Button>` brings the house focus
 *  ring. A busy row's action is `aria-disabled`, which the Button styles as
 *  disabled while keeping it focusable, and the guard stops it firing. The row
 *  itself is a plain container, so a real button nests safely.
 *  `accessibleName` names the member the action applies to. */
function RowAction({
  className,
  isDisabled,
  onActivate,
  icon,
  label,
  accessibleName,
}: {
  className?: string;
  isDisabled: boolean;
  onActivate: () => void;
  icon: ReactNode;
  label: string;
  accessibleName: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={[styles.rowAction, className].filter(Boolean).join(" ")}
      aria-disabled={isDisabled || undefined}
      onClick={() => {
        if (!isDisabled) onActivate();
      }}
      aria-label={accessibleName}
    >
      {icon} {label}
    </Button>
  );
}

/**
 * One roster row in the mod panel's Members tab, split out of `MembersTab` so
 * that component stays under the per-component line limit. Purely
 * presentational: the tab owns the promote/demote/remove writes, their
 * optimistic state and their toasts.
 *
 * "Remove" asks the tab to open a confirm dialog rather than acting on the
 * tap, so a mis-tap cannot take someone off the roster with nothing to undo
 * it.
 */
export function MembersTabRow({
  member,
  isMod,
  isPromotedMod,
  isBusy,
  onPromote,
  onDemote,
  onRequestRemove,
}: {
  member: RosterMember;
  /** Already a mod/owner, or promoted in this session. */
  isMod: boolean;
  /** Promoted in this session from `member`, so the demote action applies. */
  isPromotedMod: boolean;
  /** A role or removal write for this row is still in flight. */
  isBusy: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onRequestRemove: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  return (
    <div className={[styles.modRow, styles.modRowWithActions].join(" ")}>
      <Avatar
        initials={member.initials}
        tint={member.tint}
        src={photoOf(member, demoMode)}
        size={38}
        alt={member.name}
      />
      <div className={styles.modMain}>
        <div className={styles.modName}>
          {member.name} <RoleBadge role={isPromotedMod ? "mod" : member.role} />
        </div>
        {member.title && <div className={styles.modMeta}>{member.title}</div>}
      </div>
      <div className={styles.modActions}>
        {!isMod && (
          <RowAction
            isDisabled={isBusy}
            onActivate={onPromote}
            icon={<FiUserPlus aria-hidden />}
            label={t("admin:modPanel.members.makeModCta")}
            accessibleName={t("admin:modPanel.members.makeModAriaLabel", {
              name: member.name,
            })}
          />
        )}
        {isPromotedMod && (
          <RowAction
            isDisabled={isBusy}
            onActivate={onDemote}
            icon={<FiX aria-hidden />}
            label={t("admin:modPanel.members.removeModCta")}
            accessibleName={t("admin:modPanel.members.removeModAriaLabel", {
              name: member.name,
            })}
          />
        )}
        {member.role !== "owner" && (
          <RowAction
            className={styles.removeBtn}
            isDisabled={isBusy}
            onActivate={onRequestRemove}
            icon={<FiX aria-hidden />}
            label={t("admin:modPanel.members.removeCta")}
            accessibleName={t("admin:modPanel.members.removeAriaLabel", {
              name: member.name,
            })}
          />
        )}
        {member.role === "owner" && (
          <span className={styles.ownerTag}>
            <FiShield aria-hidden /> {t("admin:modPanel.members.ownerTag")}
          </span>
        )}
      </div>
    </div>
  );
}
