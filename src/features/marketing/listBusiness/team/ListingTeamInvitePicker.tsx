import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import {
  Collapse,
  CollapseListItem,
  SearchInput,
} from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { normalizeRoleLabel } from "../api/listingTeam.adapters";
import type { ListingTeamPersonaCandidateView } from "../api/listingTeam.types";
import {
  useListingTeam,
  useListingTeamCandidates,
} from "../api/useListingTeam";
import { useListingTeamMutations } from "../api/useListingTeamMutations";
import { listingTeamErrorCopy } from "./listingTeamErrors.data";
import { ListingTeamCandidateRow } from "./ListingTeamCandidateRow";
import { ListingTeamRowError } from "./ListingTeamRowError";
import { ListingTeamRoleLabelField } from "./ListingTeamRoleLabelField";
import styles from "./ListingTeamInvitePicker.module.css";

const KEY = "marketing:listBusiness.team";
const ROLE_FIELD_ID = "listing-team-invite-role";

interface PickerNoteProps {
  text: string | null;
  isAlert?: boolean;
}

/** A hint or status line that folds in and out and keeps its last text while folding. */
function PickerNote({ text, isAlert = false }: PickerNoteProps) {
  const [shownText, setShownText] = useState(text ?? "");
  if (text !== null && text !== shownText) setShownText(text);
  return (
    <Collapse isOpen={text !== null}>
      <p
        className={isAlert ? styles.errorLine : styles.note}
        role={isAlert ? "alert" : undefined}
      >
        {text ?? shownText}
      </p>
    </Collapse>
  );
}

interface ListingTeamInvitePickerProps {
  listingRef: string;
  isListingOpen: boolean;
}

/** Role field, persona search and the invite buttons of the Team section. */
export function ListingTeamInvitePicker({
  listingRef,
  isListingOpen,
}: ListingTeamInvitePickerProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { showToast } = useToast();
  const [roleLabel, setRoleLabel] = useState("");
  const [searchText, setSearchText] = useState("");
  const [refusalByPersonaId, setRefusalByPersonaId] = useState<
    Record<string, string>
  >({});
  const [justInvitedPersonaId, setJustInvitedPersonaId] = useState<
    string | null
  >(null);
  const { team } = useListingTeam(listingRef);
  const askedPersonaIds = new Set(
    (team?.requestsReceived ?? []).flatMap((row) =>
      row.persona ? [row.persona.id] : [],
    ),
  );
  const { candidates, isQueryReady, isSearching, isError } =
    useListingTeamCandidates(listingRef, searchText);
  const { invite } = useListingTeamMutations(listingRef);

  const handleInvite = (candidate: ListingTeamPersonaCandidateView) => {
    if (invite.isPending || !isListingOpen) return;
    const personaId = candidate.persona.id;
    setRefusalByPersonaId({});
    invite.mutate(
      {
        subprofileId: personaId,
        roleLabel: normalizeRoleLabel(roleLabel),
      },
      {
        onSuccess: (row) => {
          setRoleLabel("");
          setJustInvitedPersonaId(personaId);
          showToast(
            t(
              row.status === "accepted"
                ? `${KEY}.toast.added`
                : `${KEY}.toast.invited`,
            ),
            "success",
          );
        },
        onError: (error) => {
          const { messageKey, values } = listingTeamErrorCopy(
            error,
            "listing",
            formatters,
          );
          setRefusalByPersonaId({ [personaId]: t(messageKey, values) });
        },
      },
    );
  };

  const isSettled = isQueryReady && !isSearching && !isError;
  const hasNoMatch = isSettled && candidates.length === 0;

  return (
    <div className={styles.picker}>
      <h3 className={styles.heading}>{t(`${KEY}.inviteHeading`)}</h3>
      <ListingTeamRoleLabelField
        id={ROLE_FIELD_ID}
        value={roleLabel}
        onChange={(nextRoleLabel) => {
          setRefusalByPersonaId({});
          setJustInvitedPersonaId(null);
          setRoleLabel(nextRoleLabel);
        }}
        isDisabled={invite.isPending}
      />
      <SearchInput
        value={searchText}
        onChange={(nextSearchText) => {
          setRefusalByPersonaId({});
          setJustInvitedPersonaId(null);
          setSearchText(nextSearchText);
        }}
        placeholder={t(`${KEY}.search.placeholder`)}
        ariaLabel={t(`${KEY}.search.label`)}
      />
      <PickerNote text={isQueryReady ? null : t(`${KEY}.search.hint`)} />
      <PickerNote text={hasNoMatch ? t(`${KEY}.search.empty`) : null} />
      <PickerNote
        isAlert
        text={isQueryReady && isError ? t(`${KEY}.search.loadError`) : null}
      />
      <ul className={styles.results}>
        <AnimatePresence initial={false}>
          {candidates.map((candidate) => (
            <CollapseListItem key={candidate.persona.id}>
              <div className={styles.item}>
                <ListingTeamCandidateRow
                  candidate={candidate}
                  isBusy={invite.isPending}
                  isInviteBlocked={!isListingOpen}
                  hasAskedYou={askedPersonaIds.has(candidate.persona.id)}
                  shouldFocusChip={
                    justInvitedPersonaId === candidate.persona.id
                  }
                  onChipFocused={() => setJustInvitedPersonaId(null)}
                  onInvite={handleInvite}
                />
                <ListingTeamRowError
                  errorMessage={refusalByPersonaId[candidate.persona.id]}
                />
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <p className="visuallyHidden" role="status">
        {isSettled
          ? t(`${KEY}.search.resultCount`, { count: candidates.length })
          : ""}
      </p>
    </div>
  );
}
