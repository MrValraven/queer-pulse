import { useEffect, useRef } from "react";
import { Button, Tag } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingTeamPersonaCandidateView } from "../api/listingTeam.types";
import { ListingTeamPersonaAvatar } from "./ListingTeamPersonaAvatar";
import styles from "./ListingTeamInvitePicker.module.css";

const KEY = "marketing:listBusiness.team";

interface ListingTeamCandidateRowProps {
  candidate: ListingTeamPersonaCandidateView;
  isBusy: boolean;
  isInviteBlocked: boolean;
  /** This persona already asked to join, so the answer is waiting on you. */
  hasAskedYou: boolean;
  /** Focus the status chip once it replaces the pressed Invite button. */
  shouldFocusChip: boolean;
  onChipFocused: () => void;
  onInvite: (candidate: ListingTeamPersonaCandidateView) => void;
}

/** One search result: who the persona is and where they stand with this page. */
export function ListingTeamCandidateRow({
  candidate,
  isBusy,
  isInviteBlocked,
  hasAskedYou,
  shouldFocusChip,
  onChipFocused,
  onInvite,
}: ListingTeamCandidateRowProps) {
  const { t } = useTranslation();
  const { persona, teamStatus } = candidate;
  const isDisabled = isBusy || isInviteBlocked;
  const chipRef = useRef<HTMLSpanElement>(null);
  const hasChip = teamStatus !== null || hasAskedYou;

  useEffect(() => {
    if (!shouldFocusChip || !hasChip || !chipRef.current) return;
    chipRef.current.focus();
    onChipFocused();
  }, [shouldFocusChip, hasChip, onChipFocused]);

  return (
    <div className={styles.row}>
      <ListingTeamPersonaAvatar persona={persona} size={40} />
      <div className={styles.rowText}>
        <span className={styles.rowName}>{persona.nameBesideCraft}</span>
        <span className={styles.rowMeta}>
          @{persona.handle} · {t(persona.kindLabelKey)}
        </span>
      </div>
      {hasChip ? (
        <span ref={chipRef} tabIndex={-1} className={styles.chip}>
          <Tag data-status={hasAskedYou ? "askedYou" : teamStatus}>
            {t(`${KEY}.candidate.${hasAskedYou ? "askedYou" : teamStatus}`)}
          </Tag>
        </span>
      ) : (
        <Button
          size="sm"
          variant="soft"
          className={styles.rowAction}
          aria-disabled={isDisabled}
          aria-label={t(`${KEY}.inviteAria`, { name: persona.titleName })}
          onClick={() => {
            if (isDisabled) return;
            onInvite(candidate);
          }}
        >
          {t(`${KEY}.inviteCta`)}
        </Button>
      )}
    </div>
  );
}
