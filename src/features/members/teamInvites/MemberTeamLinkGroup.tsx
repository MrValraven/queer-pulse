import type { ReactNode, RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse, CollapseListItem } from "../../../shared/components/ui";
import type { ListingTeamMemberLinkRowView } from "../../marketing/listBusiness/api/listingTeam.types";
import { ListingTeamRowError } from "../../marketing/listBusiness/team/ListingTeamRowError";
import {
  MemberTeamInviteRow,
  type MemberTeamLinkKind,
} from "./MemberTeamInviteRow";
import styles from "./MemberTeamInvites.module.css";

export interface MemberTeamLinkActions {
  onAccept: (row: ListingTeamMemberLinkRowView) => void;
  onDecline: (row: ListingTeamMemberLinkRowView) => void;
  onLeave: (row: ListingTeamMemberLinkRowView) => void;
}

interface MemberTeamLinkGroupProps {
  /** Ties the heading to its list (`aria-labelledby`). */
  headingId: string;
  heading: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** Shown beside the heading (the pending count). */
  headingAccessory?: ReactNode;
  intro?: string;
  rows: ListingTeamMemberLinkRowView[];
  kind: MemberTeamLinkKind;
  /** One answer runs at a time, so every row waits while any row is busy. */
  isBusy: boolean;
  errorByLinkId: Record<string, string>;
  actions: MemberTeamLinkActions;
  /** Runs once every leaving row has finished folding away, with this
   *  group's heading ref (read only inside the callback). */
  onRowsExited: (headingRef: RefObject<HTMLHeadingElement | null>) => void;
}

/**
 * A heading and the rows of one kind. The heading folds away with the last
 * row, each row folds in and out, and its refusal folds in under it.
 */
export function MemberTeamLinkGroup({
  headingId,
  heading,
  headingRef,
  headingAccessory,
  intro,
  rows,
  kind,
  isBusy,
  errorByLinkId,
  actions,
  onRowsExited,
}: MemberTeamLinkGroupProps) {
  return (
    <div className={styles.group}>
      <Collapse isOpen={rows.length > 0}>
        <div className={styles.groupHead}>
          <div className={styles.headingLine}>
            <h2
              ref={headingRef}
              id={headingId}
              tabIndex={-1}
              className={styles.heading}
            >
              {heading}
            </h2>
            {headingAccessory}
          </div>
          {intro && <p className={styles.intro}>{intro}</p>}
        </div>
      </Collapse>
      <ul className={styles.list} aria-labelledby={headingId}>
        <AnimatePresence
          initial={false}
          onExitComplete={() => onRowsExited(headingRef)}
        >
          {rows.map((row) => (
            <CollapseListItem key={row.id}>
              <div className={styles.item}>
                <MemberTeamInviteRow
                  row={row}
                  kind={kind}
                  isBusy={isBusy}
                  onAccept={() => actions.onAccept(row)}
                  onDecline={() => actions.onDecline(row)}
                  onLeave={() => actions.onLeave(row)}
                />
                <ListingTeamRowError
                  errorMessage={errorByLinkId[row.id] ?? null}
                />
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
