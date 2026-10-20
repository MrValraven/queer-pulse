import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingTeamPersonaRowView } from "../../marketing/listBusiness/api/listingTeam.types";
import { ListingTeamListingImage } from "../../marketing/listBusiness/team/ListingTeamListingImage";
import { ListingTeamRowError } from "../../marketing/listBusiness/team/ListingTeamRowError";
import styles from "./WorksAtEditor.module.css";

export type WorksAtLinkKind = "invite" | "request" | "accepted";

interface WorksAtLinkRowProps {
  row: ListingTeamPersonaRowView;
  kind: WorksAtLinkKind;
  isBusy: boolean;
  /** Accept is the one action a draft persona cannot take. */
  isAcceptBlocked?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onLeave?: () => void;
}

/** One link between this persona and a business, with the actions its kind allows. */
export function WorksAtLinkRow({
  row,
  kind,
  isBusy,
  isAcceptBlocked = false,
  onAccept,
  onDecline,
  onCancel,
  onLeave,
}: WorksAtLinkRowProps) {
  const { t } = useTranslation();
  const { listing } = row;
  // Busy and blocked buttons keep focus: aria-disabled, with the handler
  // returning early.
  const guard = (action?: () => void) => () => {
    if (!isBusy) action?.();
  };
  return (
    <div className={styles.row}>
      <ListingTeamListingImage listing={listing} size={40} />
      <div className={styles.text}>
        {row.isListingLive ? (
          <Link to={listing.href} className={styles.name}>
            {listing.name}
          </Link>
        ) : (
          <span className={styles.name}>{listing.name}</span>
        )}
        {row.roleLabel && (
          <span className={styles.meta}>
            {t("subprofiles:worksAtEditor.roleLine", { role: row.roleLabel })}
          </span>
        )}
        {!row.isListingLive && (
          <span className={styles.meta}>
            {t("subprofiles:worksAtEditor.listingHidden")}
          </span>
        )}
      </div>
      <div className={styles.actions}>
        {kind === "invite" && (
          <>
            <Button
              size="sm"
              variant="primary"
              aria-disabled={isBusy || isAcceptBlocked}
              aria-label={t("subprofiles:worksAtEditor.acceptAria", {
                listing: listing.name,
              })}
              onClick={() => {
                if (!isAcceptBlocked) guard(onAccept)();
              }}
            >
              {t("subprofiles:worksAtEditor.acceptCta")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-disabled={isBusy}
              aria-label={t("subprofiles:worksAtEditor.declineAria", {
                listing: listing.name,
              })}
              onClick={guard(onDecline)}
            >
              {t("subprofiles:worksAtEditor.declineCta")}
            </Button>
          </>
        )}
        {kind === "request" && (
          <Button
            size="sm"
            variant="ghost"
            aria-disabled={isBusy}
            aria-label={t("subprofiles:worksAtEditor.cancelRequestAria", {
              listing: listing.name,
            })}
            onClick={guard(onCancel)}
          >
            {t("subprofiles:worksAtEditor.cancelRequestCta")}
          </Button>
        )}
        {kind === "accepted" && (
          <Button
            size="sm"
            variant="ghost"
            aria-disabled={isBusy}
            aria-label={t("subprofiles:worksAtEditor.leaveAria", {
              listing: listing.name,
            })}
            onClick={guard(onLeave)}
          >
            {t("subprofiles:worksAtEditor.leaveCta")}
          </Button>
        )}
      </div>
    </div>
  );
}

export interface WorksAtLinkActions {
  onAccept: (row: ListingTeamPersonaRowView) => void;
  onDecline: (row: ListingTeamPersonaRowView) => void;
  onCancel: (row: ListingTeamPersonaRowView) => void;
  onLeave: (row: ListingTeamPersonaRowView) => void;
}

interface WorksAtLinkGroupProps {
  /** Ties the heading to its list (`aria-labelledby`). */
  headingId: string;
  heading: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** Shown under the heading when there are no rows; without it the whole
   *  group folds away once its last row leaves. */
  emptyText?: string;
  rows: ListingTeamPersonaRowView[];
  kind: WorksAtLinkKind;
  /** One answer runs at a time, so every row waits while any row is busy. */
  isBusy: boolean;
  errorByLinkId: Record<string, string>;
  isAcceptBlocked: boolean;
  actions: WorksAtLinkActions;
  /** Runs once every leaving row has finished folding away, with this
   *  group's heading ref (read only inside the callback). */
  onRowsExited: (headingRef: RefObject<HTMLHeadingElement | null>) => void;
}

/**
 * A heading and the rows of one kind. Each row folds in and out, its refusal
 * folds in under it, and the heading takes focus back once a row has left.
 */
export function WorksAtLinkGroup({
  headingId,
  heading,
  headingRef,
  emptyText,
  rows,
  kind,
  isBusy,
  errorByLinkId,
  isAcceptBlocked,
  actions,
  onRowsExited,
}: WorksAtLinkGroupProps) {
  const isHeadingKept = emptyText !== undefined;
  const headingElement = (
    <h3
      ref={headingRef}
      id={headingId}
      tabIndex={-1}
      className={styles.heading}
    >
      {heading}
    </h3>
  );
  return (
    <div className={isHeadingKept ? styles.group : styles.foldingGroup}>
      {isHeadingKept ? (
        headingElement
      ) : (
        <Collapse isOpen={rows.length > 0}>{headingElement}</Collapse>
      )}
      {isHeadingKept && (
        <Collapse isOpen={rows.length === 0}>
          <p className={styles.empty}>{emptyText}</p>
        </Collapse>
      )}
      <ul className={styles.list} aria-labelledby={headingId}>
        <AnimatePresence
          initial={false}
          onExitComplete={() => onRowsExited(headingRef)}
        >
          {rows.map((row) => (
            <CollapseListItem key={row.id}>
              <div className={styles.item}>
                <WorksAtLinkRow
                  row={row}
                  kind={kind}
                  isBusy={isBusy}
                  isAcceptBlocked={isAcceptBlocked}
                  onAccept={() => actions.onAccept(row)}
                  onDecline={() => actions.onDecline(row)}
                  onCancel={() => actions.onCancel(row)}
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
