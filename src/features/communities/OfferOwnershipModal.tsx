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
import { useFormat } from "../../shared/i18n/format";
import type { RosterMember } from "./community.model";
import { photoOf } from "./communityPeople";
import { useRosterSearch } from "./api/useRoster";
import {
  communityErrorText,
  OWNERSHIP_OFFER_OWNER_SIDE_KEYS,
} from "./communityErrors";
import { useOfferCommunityOwnership } from "./api/useCommunityOwnershipOffers";
import { RosterPickerSkeleton } from "./RosterPickerSkeleton";

/** How long typing has to settle before the roster search reaches the server.
 *  Matches the other search-as-you-type surfaces in the app. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Who this owner may actually offer the community to.
 *
 * Mirrors the server's own guards on `POST /communities/:slug/ownership-offer`,
 * so the picker never lists somebody the offer would refuse: the target has to
 * be on this roster, and it cannot be the current owner (the caller themself,
 * which answers OWNERSHIP_OFFER_SELF). A roster row whose profile no longer
 * resolves carries no handle to address, so it is no target either.
 *
 * One server guard has no client-side counterpart: a `User.isSystem` house
 * account is refused (OWNERSHIP_OFFER_HOUSE_ACCOUNT), and
 * `RosterEntryDTO.member` carries no system flag to filter on. A house account
 * is dropped from every invite path, so it does not reach a community roster;
 * if one ever did, the server's refusal names the reason.
 */
function offerCandidates(
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

/** Where the caller's roster read stands, for the resting list. */
type RosterStatus = "loading" | "error" | "settled";

/** Sends the offer to the picked member, toasts the pending line once the
 *  server agrees, and closes; a refusal names its cause. */
function useSendOwnershipOffer(slug: string, onClose: () => void) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const offerOwnership = useOfferCommunityOwnership(slug);
  const sendOffer = (picked: MemberSelectPerson) =>
    offerOwnership.mutate(
      {
        memberSlug: picked.slug,
        offeree: {
          slug: picked.slug,
          firstName: picked.name,
          lastName: "",
          avatarUrl: picked.avatarUrl ?? null,
        },
      },
      {
        onSuccess: (offer) => {
          showToast(
            t("communities:ownershipOffer.pending", {
              name: picked.name,
              date: fmt.date(new Date(offer.expiresAt)),
            }),
            "success",
          );
          onClose();
        },
        onError: (error) =>
          showToast(
            communityErrorText(t, error, OWNERSHIP_OFFER_OWNER_SIDE_KEYS),
            "error",
          ),
      },
    );
  return { offerOwnership, sendOffer };
}

/** Demo-mode matching. Live mode asks the server the same question. */
function matchesQuery(person: MemberSelectPerson, needle: string): boolean {
  return (
    person.name.toLowerCase().includes(needle) ||
    person.slug.toLowerCase().includes(needle)
  );
}

/**
 * PRD-514. The owner picks who to offer the community to, then sends the
 * offer. Nothing moves yet: the member accepts or declines from their inbox,
 * and the offer lapses after 14 days. Reuses the shared `MemberSelectList` in
 * single-select mode, scoped to this community's own roster, since ownership
 * can only pass to someone already on it. Picking and sending are two separate
 * steps, so the offer never fires on the first tap.
 *
 * The search box asks the SERVER (`useRosterSearch`, PRD-149). It used to filter
 * the `roster` pages the caller had already loaded, which in a 200-member
 * community meant the successor was findable only after nine presses of "Load
 * more" in the Members pane. An untouched box still shows those loaded rows, so
 * the resting state is unchanged.
 */
export function OfferOwnershipModal({
  slug,
  roster,
  isRosterLoading = false,
  isRosterError = false,
  onRosterRetry,
  onClose,
}: {
  slug: string;
  roster: RosterMember[];
  /** The caller's roster read is still on its way. */
  isRosterLoading?: boolean;
  /** The caller's roster read failed; `onRosterRetry` asks again. */
  isRosterError?: boolean;
  onRosterRetry?: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { offerOwnership, sendOffer } = useSendOwnershipOffer(slug, onClose);
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
    () => offerCandidates(roster, demoMode),
    [roster, demoMode],
  );
  const searchCandidates = useMemo(
    () => offerCandidates(search.members, demoMode),
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
    if (picked) sendOffer(picked);
  };

  // The roster the resting list draws from is still loading, or failed: the
  // picker waits on it, and neither state is ever read as an empty roster.
  // A failed next page leaves the loaded rows standing (the read is shared
  // with the Members tab), so only a failure with nothing loaded counts.
  const rosterStatus: RosterStatus = isRosterLoading
    ? "loading"
    : isRosterError && roster.length === 0
      ? "error"
      : "settled";
  // "Nobody to hand this to" is only true of a roster that loaded with no
  // other members. A search that found nobody is the picker's own empty
  // state, and saying it here would take the search box away with it.
  const hasNobodyToPick =
    rosterStatus === "settled" &&
    !isSearchActive &&
    rosterCandidates.length === 0;

  return (
    <Modal
      title={t("communities:ownershipOffer.title")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={offerOwnership.isPending}
          >
            {t("communities:detail.dangerZone.transfer.confirm.cancel")}
          </Button>
          {/* With nobody else on the roster, or no roster to pick from,
              there is no offer to send. */}
          {!hasNobodyToPick && rosterStatus !== "error" && (
            <Button
              variant="primary"
              onClick={onConfirm}
              disabled={!picked || offerOwnership.isPending}
            >
              {picked
                ? t("communities:ownershipOffer.sendTo", { name: picked.name })
                : t("communities:ownershipOffer.send")}
            </Button>
          )}
        </>
      }
    >
      <p>{t("communities:ownershipOffer.explainer")}</p>
      {rosterStatus === "loading" ? (
        <RosterPickerSkeleton />
      ) : rosterStatus === "error" ? (
        <LoadErrorState
          compact
          onRetry={onRosterRetry}
          title={t("communities:ownershipOffer.rosterErrorTitle")}
          description={t("communities:ownershipOffer.rosterErrorBody")}
        />
      ) : hasNobodyToPick ? (
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
            selectedIndicator="radio"
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
          {/* How many a finished search found, which a screen reader cannot
              get from an unwalked list. Counts `people`, so a pinned current
              pick never reads as a match. */}
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
