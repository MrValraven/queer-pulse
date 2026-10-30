import { useState } from "react";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingTeamManagerRowView } from "../api/listingTeam.types";
import { listingTeamRowSubject } from "./listingTeamSection.data";
import { ListingTeamPersonaAvatar } from "./ListingTeamPersonaAvatar";
import { ListingTeamRoleLabelField } from "./ListingTeamRoleLabelField";
import { ListingTeamRowError } from "./ListingTeamRowError";
import styles from "./ListingTeam.module.css";

/** The id of the element holding a row's persona or member name. */
function listingTeamRowNameId(row: ListingTeamManagerRowView): string {
  return `listing-team-name-${row.id}`;
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
 * Avatar, name and kind of the persona on a row ("Member" and the @slug for a
 * member), or the hidden copy for either. `isRoleShown` reads the row's role
 * under the name.
 */
export function ListingTeamRowIdentity({
  row,
  isRoleShown = false,
}: {
  row: ListingTeamManagerRowView;
  isRoleShown?: boolean;
}) {
  const { t } = useTranslation();
  // The kind sits under the name, so a craft-named persona shows its owner.
  const subject = listingTeamRowSubject(row, t);
  return (
    <div className={styles.identity}>
      <ListingTeamPersonaAvatar persona={subject.avatar} size={40} />
      <div className={styles.identityText}>
        <span className={styles.personaName} id={listingTeamRowNameId(row)}>
          {subject.name}
        </span>
        {isRoleShown && <ListingTeamRoleMeta roleLabel={row.roleLabel} />}
        <span className={styles.personaMeta}>{subject.metaLine}</span>
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
 * Decline) or an invite waiting on the persona or member (Cancel invite).
 * Only a persona can ask to join, so a member row is always an invite.
 */
export function ListingTeamPendingRow({
  row,
  kind: requestedKind,
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
  // Titled for a persona ("Owner Name | Poet"), since an aria-label has no
  // craft beside it; a member is named.
  const name = listingTeamRowSubject(row, t).labelName;
  const kind = row.kind === "member" ? "invite" : requestedKind;
  const isApprovable =
    kind === "request" && row.kind === "persona" && row.persona !== null;
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
