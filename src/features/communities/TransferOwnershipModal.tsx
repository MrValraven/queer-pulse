import { useMemo, useState } from "react";
import {
  Button,
  LoadErrorState,
  MemberSelectList,
  Modal,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useDebouncedValue } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RosterMember } from "./community.model";
import { photoOf } from "./communityPeople";
import { useRosterSearch } from "./api/useRoster";
import { useTransferOwnership } from "./api/useCommunityMutations";

/** How long typing has to settle before the roster search reaches the server.
 *  Matches the other search-as-you-type surfaces in the app. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Who this owner may actually hand the community to.
 *
 * Mirrors the server's own guards on `POST /communities/:slug/transfer`, so the
 * picker can never offer somebody the transfer would refuse: the target has to
 * be on this roster, and it cannot be the current owner (that is the caller
 * themself, and a self-transfer answers 400). A roster row whose profile no
 * longer resolves carries no handle to address, so it is no target either.
 *
 * One server guard has no client-side counterpart: a `User.isSystem` house
 * account is refused, and `RosterEntryDTO.member` carries no system flag to
 * filter on. A house account is a platform account nobody signs in as and it is
 * dropped from every invite path, so it does not reach a community roster; if
 * one ever did, the server would still refuse the transfer.
 */
function transferCandidates(
  members: RosterMember[],
  demoMode: boolean,
): MemberSelectPerson[] {
  return members
    .filter((member) => member.role !== "owner" && member.slug)
    .map((member) => ({
      slug: member.slug!,
      name: member.name,
      avatarUrl: photoOf(member, demoMode),
      pronouns: member.pronouns,
    }));
}

/** Demo-mode matching. Live mode asks the server the same question. */
function matchesQuery(person: MemberSelectPerson, needle: string): boolean {
  return (
    person.name.toLowerCase().includes(needle) ||
    person.slug.toLowerCase().includes(needle)
  );
}

/**
 * Confirm step for the danger zone's "Transfer ownership" action —
 * owner-only. Reuses the shared `MemberSelectList` (the same roster/connection
 * picker used across the app's other member pickers) in single-select mode,
 * scoped to this community's own roster rather than the caller's connections —
 * ownership can only pass to someone already on this roster. Picking and
 * confirming are two separate steps, mirroring `LeaveCommunityModal`'s and
 * `InviteCoOwnerModal`'s pattern: an action this consequential shouldn't fire
 * on the first tap.
 *
 * The search box asks the SERVER (`useRosterSearch`, PRD-149). It used to filter
 * the `roster` pages the caller had already loaded, which in a 200-member
 * community meant the successor was findable only after nine presses of "Load
 * more" in the Members pane. An untouched box still shows those loaded rows, so
 * the resting state is unchanged.
 */
export function TransferOwnershipModal({
  slug,
  name,
  roster,
  onClose,
}: {
  slug: string;
  name: string;
  roster: RosterMember[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const transfer = useTransferOwnership(slug);
  const [picked, setPicked] = useState<MemberSelectPerson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const trimmedQuery = searchQuery.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const isSearchActive = trimmedQuery.length > 0;
  // The debounced term has not caught up with what is in the box, so whatever
  // is on screen answers an older question: still searching.
  const isDebouncePending = debouncedQuery !== trimmedQuery;
  const search = useRosterSearch(slug, debouncedQuery);

  const rosterCandidates = useMemo(
    () => transferCandidates(roster, demoMode),
    [roster, demoMode],
  );
  const searchCandidates = useMemo(
    () => transferCandidates(search.members, demoMode),
    [search.members, demoMode],
  );

  const hasSearchFailed = !demoMode && isSearchActive && search.isError;
  const isSearching =
    !demoMode &&
    isSearchActive &&
    !hasSearchFailed &&
    (isDebouncePending || search.isSearching);

  const people = useMemo(() => {
    // Resting state: the roster pages the caller already holds, exactly as
    // before. Demo mode stays entirely local, filtering that same mock roster.
    if (!isSearchActive) return rosterCandidates;
    if (demoMode) {
      const needle = trimmedQuery.toLowerCase();
      return rosterCandidates.filter((person) => matchesQuery(person, needle));
    }
    // A failed request must never be drawn as "nobody matches" (DES-22): fall
    // back to the loaded roster and let `LoadErrorState` say what broke.
    if (hasSearchFailed) return rosterCandidates;
    return searchCandidates;
  }, [
    isSearchActive,
    demoMode,
    trimmedQuery,
    hasSearchFailed,
    rosterCandidates,
    searchCandidates,
  ]);

  // Whoever is picked stays on the list even once the query has moved past
  // them, so the confirm button is never armed against a name nobody can see.
  const listPeople = useMemo(
    () =>
      !picked || people.some((person) => person.slug === picked.slug)
        ? people
        : [picked, ...people],
    [picked, people],
  );

  const selected = useMemo(
    () => new Set(picked ? [picked.slug] : []),
    [picked],
  );

  const toggle = (memberSlug: string) => {
    setPicked((previous) =>
      previous?.slug === memberSlug
        ? null
        : (listPeople.find((person) => person.slug === memberSlug) ?? null),
    );
  };

  const onConfirm = () => {
    if (!picked) return;
    transfer.mutate(
      { memberSlug: picked.slug },
      {
        onSuccess: () => {
          showToast(
            t("communities:detail.dangerZone.transfer.successToast", {
              owner: picked.name,
            }),
            "success",
          );
          onClose();
        },
        onError: () =>
          showToast(t("communities:detail.dangerZone.errorToast"), "error"),
      },
    );
  };

  // "Nobody to hand this to" is only true of a roster with no other members.
  // A search that found nobody is the picker's own empty state, and saying it
  // here would take the search box away with it.
  const hasNobodyToPick = !isSearchActive && rosterCandidates.length === 0;

  return (
    <Modal
      title={t("communities:detail.dangerZone.transfer.confirm.title", {
        name,
      })}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={transfer.isPending}
          >
            {t("communities:detail.dangerZone.transfer.confirm.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={!picked || transfer.isPending}
          >
            {t("communities:detail.dangerZone.transfer.confirm.confirmCta")}
          </Button>
        </>
      }
    >
      <p>
        {t("communities:detail.dangerZone.transfer.confirm.body", { name })}
      </p>
      {hasNobodyToPick ? (
        <p>{t("communities:detail.dangerZone.transfer.confirm.empty")}</p>
      ) : (
        <>
          {hasSearchFailed && (
            <LoadErrorState
              compact
              onRetry={search.retry}
              title={t(
                "communities:detail.dangerZone.transfer.confirm.searchErrorTitle",
              )}
              description={t(
                "communities:detail.dangerZone.transfer.confirm.searchErrorBody",
              )}
            />
          )}
          <MemberSelectList
            people={listPeople}
            selected={selected}
            onToggle={toggle}
            multiSelect={false}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isSearching}
            searchPlaceholder={t(
              "communities:detail.dangerZone.transfer.confirm.searchPlaceholder",
            )}
            searchAriaLabel={t(
              "communities:detail.dangerZone.transfer.confirm.searchAria",
            )}
          />
          {/* The picker announces "looking" and "no matches" itself; this says
              how many a finished search found, which is the part a screen
              reader cannot get from a list it has not walked yet. Counts
              `people`, so a pinned current pick is never miscounted as a
              match. */}
          <p className="visuallyHidden" role="status">
            {isSearchActive && !isSearching && !hasSearchFailed
              ? t(
                  "communities:detail.dangerZone.transfer.confirm.searchMatches",
                  { count: people.length },
                )
              : ""}
          </p>
        </>
      )}
    </Modal>
  );
}
