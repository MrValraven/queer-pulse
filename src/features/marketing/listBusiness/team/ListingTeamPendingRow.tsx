import { useState } from "react";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingTeamManagerRowView } from "../api/listingTeam.types";
import { ListingTeamPersonaAvatar } from "./ListingTeamPersonaAvatar";
import { ListingTeamRoleLabelField } from "./ListingTeamRoleLabelField";
import { ListingTeamRowError } from "./ListingTeamRowError";
import styles from "./ListingTeam.module.css";

const HIDDEN_PERSONA_AVATAR = { avatarUrl: null, initials: "?" } as const;

/** The id of the element holding a row's persona name. */
function listingTeamRowNameId(row: ListingTeamManagerRowView): string {
  return `listing-team-name-${row.id}`;
}

/** The name a row's controls are labelled with, hidden personas included.
 *  Titled ("Owner Name | Poet"), since an aria-label has no craft beside it. */
function useListingTeamRowName(row: ListingTeamManagerRowView): string {
  const { t } = useTranslation();
  return (
    row.persona?.titleName ??
    t("marketing:listBusiness.team.hiddenPersona.name")
  );
}

/** A role shown under the name; the last label stays while it folds away. */
function ListingTeamRoleMeta({ roleLabel }: { roleLabel: string | null }) {
  const [shownLabel, setShownLabel] = useState(roleLabel ?? "");
  if (roleLabel && roleLabel !== shownLabel) {
    setShownLabel(roleLabel);
  }
  return (
    <Collapse isOpen={Boolean(roleLabel)}>
      <p className={styles.roleMeta}>{roleLabel || shownLabel}</p>
    </Collapse>
  );
}

/**
 * Avatar, name and kind of the persona on a row, or the hidden-persona copy.
 * `isRoleShown` reads the row's role under the name.
 */
export function ListingTeamRowIdentity({
  row,
  isRoleShown = false,
}: {
  row: ListingTeamManagerRowView;
  isRoleShown?: boolean;
}) {
  const { t } = useTranslation();
  const persona = row.persona;
  const hiddenName = t("marketing:listBusiness.team.hiddenPersona.name");
  // The kind sits under the name, so a craft-named persona shows its owner.
  const name = persona ? persona.nameBesideCraft : hiddenName;
  return (
    <div className={styles.identity}>
      <ListingTeamPersonaAvatar
        persona={persona ?? HIDDEN_PERSONA_AVATAR}
        size={40}
      />
      <div className={styles.identityText}>
        <span className={styles.personaName} id={listingTeamRowNameId(row)}>
          {name}
        </span>
        {isRoleShown && <ListingTeamRoleMeta roleLabel={row.roleLabel} />}
        <span className={styles.personaMeta}>
          {persona
            ? t(persona.kindLabelKey)
            : t("marketing:listBusiness.team.hiddenPersona.hint")}
        </span>
      </div>
    </div>
  );
}

interface ListingTeamPendingRowProps {
  row: ListingTeamManagerRowView;
  kind: "request" | "invite";
  isBusy: boolean;
  /** True only while this row's own answer is in flight. */
  isRowBusy?: boolean;
  /** Approval needs the listing open; the button stays focusable but inert. */
  isApproveBlocked?: boolean;
  errorMessage?: string;
  onApprove?: (roleLabel: string) => void;
  onDecline?: () => void;
  onCancel?: () => void;
}

/**
 * A request waiting for the business to answer (Approve with a role, or
 * Decline) or an invite waiting on the persona (Cancel invite).
 */
export function ListingTeamPendingRow({
  row,
  kind,
  isBusy,
  isRowBusy = false,
  isApproveBlocked = false,
  errorMessage,
  onApprove,
  onDecline,
  onCancel,
}: ListingTeamPendingRowProps) {
  const { t } = useTranslation();
  const [roleLabel, setRoleLabel] = useState(row.roleLabel ?? "");
  const name = useListingTeamRowName(row);
  const isApprovable = kind === "request" && row.persona !== null;
  return (
    <CollapseListItem>
      <div className={styles.row}>
        <ListingTeamRowIdentity row={row} isRoleShown={kind === "invite"} />
        {isApprovable && (
          <ListingTeamRoleLabelField
            id={`listing-team-role-${row.id}`}
            value={roleLabel}
            onChange={setRoleLabel}
            isDisabled={isRowBusy}
            describedById={listingTeamRowNameId(row)}
          />
        )}
        <div className={styles.actions}>
          {isApprovable && (
            <Button
              size="sm"
              aria-label={t("marketing:listBusiness.team.approveAria", {
                name,
              })}
              aria-disabled={isBusy || isApproveBlocked}
              onClick={() => {
                if (isBusy || isApproveBlocked) return;
                onApprove?.(roleLabel);
              }}
            >
              {t("marketing:listBusiness.team.approveCta")}
            </Button>
          )}
          {kind === "request" && (
            <Button
              size="sm"
              variant="ghost"
              aria-label={t("marketing:listBusiness.team.declineAria", {
                name,
              })}
              aria-disabled={isBusy}
              onClick={() => {
                if (!isBusy) onDecline?.();
              }}
            >
              {t("marketing:listBusiness.team.declineCta")}
            </Button>
          )}
          {kind === "invite" && (
            <Button
              size="sm"
              variant="ghost"
              aria-label={t("marketing:listBusiness.team.cancelInviteAria", {
                name,
              })}
              aria-disabled={isBusy}
              onClick={() => {
                if (!isBusy) onCancel?.();
              }}
            >
              {t("marketing:listBusiness.team.cancelInviteCta")}
            </Button>
          )}
        </div>
        <ListingTeamRowError errorMessage={errorMessage} />
      </div>
    </CollapseListItem>
  );
}
