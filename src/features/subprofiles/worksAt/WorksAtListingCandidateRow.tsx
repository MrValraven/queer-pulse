import { useEffect, useRef } from "react";
import { Button, Tag } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingTeamListingCandidateView } from "../../marketing/listBusiness/api/listingTeam.types";
import { ListingTeamListingImage } from "../../marketing/listBusiness/team/ListingTeamListingImage";
import styles from "./WorksAtListingPicker.module.css";

interface WorksAtListingCandidateRowProps {
  candidate: ListingTeamListingCandidateView;
  /** A request is in flight somewhere in the picker; one runs at a time. */
  isBusy: boolean;
  isRequestBlocked: boolean;
  /** This business already invited the persona: the answer lives in Invites. */
  hasInvitedYou: boolean;
  /** The request from this row just went through: focus the chip that
   *  replaced its button. */
  shouldFocusChip: boolean;
  onChipFocused: () => void;
  onRequest: (candidate: ListingTeamListingCandidateView) => void;
}

function chipLabelKey(
  teamStatus: ListingTeamListingCandidateView["teamStatus"],
  hasInvitedYou: boolean,
): string {
  if (hasInvitedYou) return "subprofiles:worksAtEditor.candidate.invitedYou";
  return teamStatus === "accepted"
    ? "subprofiles:worksAtEditor.candidate.accepted"
    : "subprofiles:worksAtEditor.candidate.pending";
}

/** One business in the search results: its name and where the link stands. */
export function WorksAtListingCandidateRow({
  candidate,
  isBusy,
  isRequestBlocked,
  hasInvitedYou,
  shouldFocusChip,
  onChipFocused,
  onRequest,
}: WorksAtListingCandidateRowProps) {
  const { t } = useTranslation();
  const { listing, teamStatus } = candidate;
  const isDisabled = isBusy || isRequestBlocked;
  const isAskShown = teamStatus === null && !hasInvitedYou;
  const chipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!shouldFocusChip || isAskShown || !chipRef.current) return;
    chipRef.current.focus();
    onChipFocused();
  }, [shouldFocusChip, isAskShown, onChipFocused]);

  return (
    <div className={styles.row}>
      <ListingTeamListingImage listing={listing} size={40} />
      <span className={styles.name}>{listing.name}</span>
      {isAskShown ? (
        <Button
          type="button"
          variant="soft"
          size="sm"
          className={styles.action}
          aria-disabled={isDisabled}
          aria-label={t("subprofiles:worksAtEditor.askAria", {
            listing: listing.name,
          })}
          onClick={() => {
            if (isDisabled) return;
            onRequest(candidate);
          }}
        >
          {t("subprofiles:worksAtEditor.askCta")}
        </Button>
      ) : (
        <span ref={chipRef} tabIndex={-1} className={styles.chip}>
          <Tag>{t(chipLabelKey(teamStatus, hasInvitedYou))}</Tag>
        </span>
      )}
    </div>
  );
}
