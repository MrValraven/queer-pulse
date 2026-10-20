import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Collapse,
  CollapseListItem,
  SearchInput,
} from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { usePersonaTeamLinkMutations } from "../../marketing/listBusiness/api/usePersonaTeamLinkMutations";
import {
  usePersonaTeamLinks,
  usePersonaTeamListingCandidates,
} from "../../marketing/listBusiness/api/usePersonaTeamLinks";
import { listingTeamErrorCopy } from "../../marketing/listBusiness/team/listingTeamErrors.data";
import { ListingTeamRowError } from "../../marketing/listBusiness/team/ListingTeamRowError";
import type { ListingTeamListingCandidateView } from "../../marketing/listBusiness/api/listingTeam.types";
import { WorksAtListingCandidateRow } from "./WorksAtListingCandidateRow";
import styles from "./WorksAtListingPicker.module.css";

const KEY = "subprofiles:worksAtEditor";

interface WorksAtListingPickerProps {
  subprofileId: string;
  isPersonaEligible: boolean;
}

/** Searches the directory for a business and asks to join its team. */
export function WorksAtListingPicker({
  subprofileId,
  isPersonaEligible,
}: WorksAtListingPickerProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [busyListingId, setBusyListingId] = useState<string | null>(null);
  const [errorByListingId, setErrorByListingId] = useState<
    Record<string, string>
  >({});
  const [focusChipListingId, setFocusChipListingId] = useState<string | null>(
    null,
  );
  const { candidates, isQueryReady, isSearching, isError } =
    usePersonaTeamListingCandidates(subprofileId, query);
  // The same cached links the pane lists, so an invite reads "Invited you".
  const { links } = usePersonaTeamLinks(subprofileId);
  const invitedListingIds = new Set(
    (links?.invitesReceived ?? []).map((row) => row.listing.id),
  );
  const { request } = usePersonaTeamLinkMutations(subprofileId);

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    setErrorByListingId({});
    setFocusChipListingId(null);
  }

  function handleRequest(candidate: ListingTeamListingCandidateView) {
    const listingId = candidate.listing.id;
    if (busyListingId !== null) return;
    setBusyListingId(listingId);
    setErrorByListingId((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([rowId]) => rowId !== listingId),
      ),
    );
    request.mutate(
      { listingId },
      {
        onSuccess: (row) => {
          setBusyListingId(null);
          setFocusChipListingId(listingId);
          showToast(
            t(
              row.status === "accepted"
                ? `${KEY}.toast.added`
                : `${KEY}.toast.requested`,
            ),
            "success",
          );
        },
        onError: (error) => {
          setBusyListingId(null);
          const { messageKey, values } = listingTeamErrorCopy(
            error,
            "persona",
            formatters,
          );
          setErrorByListingId((current) => ({
            ...current,
            [listingId]: t(messageKey, values),
          }));
        },
      },
    );
  }

  const isSettled = isQueryReady && !isSearching && !isError;
  const hasNoMatch = isSettled && candidates.length === 0;
  let statusText = "";
  if (hasNoMatch) statusText = t(`${KEY}.search.empty`);
  else if (isSettled) {
    statusText = t(`${KEY}.search.resultCount`, { count: candidates.length });
  }

  return (
    <div className={styles.picker}>
      <SearchInput
        value={query}
        onChange={handleQueryChange}
        ariaLabel={t(`${KEY}.search.label`)}
        placeholder={t(`${KEY}.search.placeholder`)}
      />
      <Collapse isOpen={!isQueryReady}>
        <p className={styles.hint}>{t(`${KEY}.search.hint`)}</p>
      </Collapse>
      <ListingTeamRowError
        errorMessage={
          isQueryReady && isError ? t(`${KEY}.search.loadError`) : null
        }
      />
      <Collapse isOpen={hasNoMatch}>
        <p className={styles.empty}>{t(`${KEY}.search.empty`)}</p>
      </Collapse>
      <ul className={styles.results}>
        <AnimatePresence initial={false}>
          {candidates.map((candidate) => (
            <CollapseListItem key={candidate.listing.id}>
              <div className={styles.item}>
                <WorksAtListingCandidateRow
                  candidate={candidate}
                  isBusy={busyListingId !== null}
                  isRequestBlocked={!isPersonaEligible}
                  hasInvitedYou={invitedListingIds.has(candidate.listing.id)}
                  shouldFocusChip={focusChipListingId === candidate.listing.id}
                  onChipFocused={() => setFocusChipListingId(null)}
                  onRequest={handleRequest}
                />
                <ListingTeamRowError
                  errorMessage={errorByListingId[candidate.listing.id] ?? null}
                />
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <span role="status" className="visuallyHidden">
        {statusText}
      </span>
    </div>
  );
}
