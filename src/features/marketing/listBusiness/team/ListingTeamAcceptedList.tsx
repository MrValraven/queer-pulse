import { useCallback, useState, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { FiUsers } from "react-icons/fi";
import { Collapse, EmptyState } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  LISTING_TEAM_LIMITS,
  type ListingTeamManagerRowView,
} from "../api/listingTeam.types";
import { moveMemberId } from "./listingTeamSection.data";
import {
  ListingTeamMemberRow,
  type ListingTeamMoveDirection,
} from "./ListingTeamMemberRow";
import styles from "./ListingTeam.module.css";

const HEADING_ID = "listing-team-accepted-heading";

interface ListingTeamAcceptedListProps {
  rows: ListingTeamManagerRowView[];
  busyMemberId: string | null;
  errorByMemberId: Record<string, string>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** Runs once a row that left has finished folding away. */
  onRowExitComplete: () => void;
  /** Sends the new order; resolves true when it was saved. */
  onReorder: (memberId: string, memberIds: string[]) => Promise<boolean>;
  onSaveRole: (memberId: string, roleLabel: string) => Promise<boolean>;
  onRemove: (row: ListingTeamManagerRowView) => void;
}

/**
 * "On your page": the members in page order with the count. After a move the
 * moved row's arrow keeps focus and the new place is announced.
 */
export function ListingTeamAcceptedList({
  rows,
  busyMemberId,
  errorByMemberId,
  headingRef,
  onRowExitComplete,
  onReorder,
  onSaveRole,
  onRemove,
}: ListingTeamAcceptedListProps) {
  const { t } = useTranslation();
  const [movedFocus, setMovedFocus] = useState<{
    memberId: string;
    direction: ListingTeamMoveDirection;
  } | null>(null);
  const [moveStatus, setMoveStatus] = useState("");
  const [raisedMemberId, setRaisedMemberId] = useState<string | null>(null);
  const clearMovedFocus = useCallback(() => setMovedFocus(null), []);
  const isBusy = busyMemberId !== null;
  const memberIds = rows.map((row) => row.id);

  const moveRow = async (
    row: ListingTeamManagerRowView,
    direction: ListingTeamMoveDirection,
  ) => {
    const nextMemberIds = moveMemberId(memberIds, row.id, direction);
    setRaisedMemberId(row.id);
    if (!(await onReorder(row.id, nextMemberIds))) return;
    setMovedFocus({ memberId: row.id, direction });
    setMoveStatus(
      t("marketing:listBusiness.team.movedStatus", {
        name:
          row.persona?.titleName ??
          t("marketing:listBusiness.team.hiddenPersona.name"),
        position: nextMemberIds.indexOf(row.id) + 1,
        count: nextMemberIds.length,
      }),
    );
  };

  return (
    <>
      <h3
        ref={headingRef}
        className={styles.heading}
        id={HEADING_ID}
        tabIndex={-1}
      >
        {t("marketing:listBusiness.team.accepted.heading")}
        <span className={styles.count}>
          {t("marketing:listBusiness.team.accepted.count", {
            count: rows.length,
            max: LISTING_TEAM_LIMITS.acceptedPerListing,
          })}
        </span>
      </h3>
      <ul className={styles.list} aria-labelledby={HEADING_ID}>
        <AnimatePresence initial={false} onExitComplete={onRowExitComplete}>
          {rows.map((row, index) => (
            <ListingTeamMemberRow
              key={row.id}
              row={row}
              isFirst={index === 0}
              isLast={index === rows.length - 1}
              isBusy={isBusy}
              isRowBusy={busyMemberId === row.id}
              errorMessage={errorByMemberId[row.id]}
              isRaised={raisedMemberId === row.id}
              focusMoveDirection={
                movedFocus?.memberId === row.id ? movedFocus.direction : null
              }
              onMoveFocused={clearMovedFocus}
              onMove={(direction) => void moveRow(row, direction)}
              onSaveRole={(roleLabel) => onSaveRole(row.id, roleLabel)}
              onRemove={() => onRemove(row)}
            />
          ))}
        </AnimatePresence>
      </ul>
      <p className="visuallyHidden" role="status">
        {moveStatus}
      </p>
      <Collapse isOpen={rows.length === 0}>
        <EmptyState
          compact
          icon={<FiUsers />}
          title={t("marketing:listBusiness.team.accepted.empty")}
        />
      </Collapse>
    </>
  );
}
