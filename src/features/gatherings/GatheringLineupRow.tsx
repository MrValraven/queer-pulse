import { FiX } from "react-icons/fi";
import {
  Badge,
  Button,
  MemberIdentity,
  Select,
  type BadgeTone,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "../subprofiles/api/subprofiles.api";
import { KIND_LABEL_KEYS } from "../subprofiles/subprofile-kinds";
import type { EventLineupEntryDTO, LineupEntryStatus } from "./api/events.api";
import { LINEUP_ROLES, lineupRoleToKind } from "./eventLineup.data";
import styles from "./GatheringLineupEditor.module.css";

const STATUS_TONE: Record<LineupEntryStatus, BadgeTone> = {
  pending: "amber",
  accepted: "jade",
  declined: "ghost",
};

/**
 * One lineup row in the host editor: identity, status, craft select and a
 * remove control, plus "Invite again" once declined. Removal and its confirm
 * live in `GatheringLineupEditor`, because the optimistic removal drops this
 * row before the request settles. While the invite that creates the row is
 * still in flight, its role and remove controls wait, so a PATCH or DELETE
 * cannot race the POST.
 */
export function GatheringLineupRow({
  entry,
  isCreating,
  isInviteAgainDisabled,
  onRoleChange,
  onRemove,
  onInviteAgain,
}: {
  entry: EventLineupEntryDTO;
  /** The invite POST for this row has not settled yet. */
  isCreating: boolean;
  /** Open rows are at the lineup cap, which a re-invite would exceed. */
  isInviteAgainDisabled: boolean;
  onRoleChange: (role: SubprofileKind) => void;
  onRemove: () => void;
  onInviteAgain: () => void;
}) {
  const { t } = useTranslation();
  const roleKind = lineupRoleToKind(entry.role) ?? LINEUP_ROLES[0]!;

  return (
    <div className={styles.row}>
      <div className={styles.rowLead}>
        <MemberIdentity
          person={{
            slug: entry.slug,
            name: entry.name,
            avatarUrl: entry.avatarUrl ?? undefined,
          }}
          size={38}
        />
        <Badge tone={STATUS_TONE[entry.status]} dot>
          {t(`gatherings:lineup.status.${entry.status}`)}
        </Badge>
      </div>
      <div className={styles.rowActions}>
        {entry.status === "declined" ? (
          <Button
            variant="ghost"
            size="sm"
            className={styles.inviteAgain}
            onClick={onInviteAgain}
            disabled={isInviteAgainDisabled}
          >
            {t("gatherings:lineup.inviteAgain")}
          </Button>
        ) : (
          <Select
            className={styles.roleSelect}
            size="sm"
            label={t("gatherings:lineup.roleLabel")}
            options={LINEUP_ROLES.map((role) => ({
              value: role,
              label: t(KIND_LABEL_KEYS[role]),
            }))}
            value={roleKind}
            disabled={isCreating}
            onChange={(value) => onRoleChange(value as SubprofileKind)}
          />
        )}
        <button
          type="button"
          className={styles.removeBtn}
          onClick={onRemove}
          disabled={isCreating}
          aria-label={t("gatherings:lineup.removeAria", { name: entry.name })}
        >
          <FiX size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
