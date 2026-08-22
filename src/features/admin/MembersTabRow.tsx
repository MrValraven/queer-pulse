import type { ReactNode } from "react";
import { FiX, FiUserPlus, FiShield } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { photoOf } from "../communities/communityPeople";
import { RoleBadge } from "../communities/CommunityBadges";
import type { RosterMember } from "../communities/community.model";
import styles from "./ModPanel.module.css";

/** One roster action. A `<span role="button">` rather than a `<button>`
 *  because the row it sits in is already a link target in other mod surfaces
 *  (see the repo rule against nesting a button inside a router Link). */
function RowAction({
  className,
  isDisabled,
  onActivate,
  icon,
  label,
}: {
  className: string | undefined;
  isDisabled: boolean;
  onActivate: () => void;
  icon: ReactNode;
  label: string;
}) {
  const activate = () => {
    if (!isDisabled) onActivate();
  };
  return (
    <span
      role="button"
      tabIndex={0}
      aria-disabled={isDisabled || undefined}
      className={className}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      }}
    >
      {icon} {label}
    </span>
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
    <div className={styles.modRow}>
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
            className={styles.declineBtn}
            isDisabled={isBusy}
            onActivate={onPromote}
            icon={<FiUserPlus aria-hidden />}
            label={t("admin:modPanel.members.makeModCta")}
          />
        )}
        {isPromotedMod && (
          <RowAction
            className={styles.declineBtn}
            isDisabled={isBusy}
            onActivate={onDemote}
            icon={<FiX aria-hidden />}
            label={t("admin:modPanel.members.removeModCta")}
          />
        )}
        {member.role !== "owner" && (
          <RowAction
            className={[styles.declineBtn, styles.removeBtn].join(" ")}
            isDisabled={isBusy}
            onActivate={onRequestRemove}
            icon={<FiX aria-hidden />}
            label={t("admin:modPanel.members.removeCta")}
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
