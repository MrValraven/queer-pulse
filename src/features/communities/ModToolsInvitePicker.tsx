import { useMemo, useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import {
  Button,
  EmptyState,
  LoadErrorState,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../shared/hooks/useDebouncedValue";
import { CONNECTIONS_SEARCH_DEBOUNCE_MS } from "../connect/api/useConnectionsSearch";
import {
  InviteMembersListFooter,
  type InviteMembersListPaging,
} from "../gatherings/InviteMembersListFooter";
import {
  MAX_INVITES_PER_CALL,
  type CommunityInvitesResponseDTO,
} from "./api/communityInvites.api";
import { useCommunityInviteCandidates } from "./api/useCommunityInviteCandidates";
import { useInviteCommunityMembers } from "./api/useCommunityInvites";
import styles from "./ModToolsPanels.module.css";

/**
 * The invite form itself: search the sender's connections, tick up to
 * `MAX_INVITES_PER_CALL` of them, send.
 *
 * The search runs on the server once typing pauses, and the list pages in
 * with "Load more", so every connection is reachable however far down it sits.
 * Selection is kept per person: a new search replaces the rows, and the
 * people already ticked stay ticked, counted and sent.
 */
export function ModToolsInvitePicker({
  slug,
  isStaff,
  onSent,
}: {
  slug: string;
  /** Owner, co-owner or moderator. The candidates endpoint 403s anybody
   *  else, so this keeps the request from being made at all. */
  isStaff: boolean;
  /** Called with the server's answer and the people who were named in it,
   *  so the result panel can name them after the selection clears. */
  onSent: (
    response: CommunityInvitesResponseDTO,
    sentPeople: ReadonlyMap<string, MemberSelectPerson>,
  ) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedSearchTerm = searchQuery.trim();
  const debouncedSearchTerm = useDebouncedValue(
    trimmedSearchTerm,
    CONNECTIONS_SEARCH_DEBOUNCE_MS,
  );
  const isSearchSettling = isDebounceSettling(
    trimmedSearchTerm,
    debouncedSearchTerm,
  );
  const candidates = useCommunityInviteCandidates(slug, debouncedSearchTerm, {
    enabled: isStaff,
  });
  const invite = useInviteCommunityMembers(slug);
  const [selectedPeople, setSelectedPeople] = useState<
    ReadonlyMap<string, MemberSelectPerson>
  >(() => new Map());
  const selectedSlugs = useMemo(
    () => new Set(selectedPeople.keys()),
    [selectedPeople],
  );

  const toggle = (memberSlug: string) => {
    setSelectedPeople((previous) => {
      const next = new Map(previous);
      if (next.delete(memberSlug)) return next;
      const person = candidates.people.find(
        (candidate) => candidate.slug === memberSlug,
      );
      if (!person || next.size >= MAX_INVITES_PER_CALL) return previous;
      next.set(memberSlug, person);
      return next;
    });
  };

  const send = () => {
    const sentPeople = selectedPeople;
    if (sentPeople.size === 0) return;
    invite.mutate([...sentPeople.keys()], {
      onSuccess: (response) => {
        onSent(response, sentPeople);
        setSelectedPeople(new Map());
      },
      onError: () =>
        showToast(t("communities:detail.modtools.invites.errorToast"), "error"),
    });
  };

  // A failed first page must never read as "nobody left to invite".
  if (candidates.isError) {
    return <LoadErrorState compact onRetry={candidates.refetch} />;
  }

  // Only an unfiltered answer can say the pool is empty. With a term typed,
  // zero rows is the list's own "no matches" line.
  const isPoolEmpty =
    trimmedSearchTerm === "" &&
    !isSearchSettling &&
    !candidates.isLoading &&
    candidates.people.length === 0;
  if (isPoolEmpty) {
    return (
      <EmptyState
        compact
        icon={<FiUserPlus />}
        title={t("communities:detail.modtools.invites.empty.title")}
        description={t("communities:detail.modtools.invites.empty.description")}
      />
    );
  }

  // The next page belongs to the term on screen, so it waits while a new
  // term is still settling.
  const paging: InviteMembersListPaging = {
    ...candidates,
    hasNextPage: candidates.hasNextPage && !isSearchSettling,
  };

  return (
    <div className={styles.picker}>
      <MemberSelectList
        people={candidates.people}
        selected={selectedSlugs}
        onToggle={toggle}
        cap={MAX_INVITES_PER_CALL}
        searchPlaceholder={t(
          "communities:detail.modtools.invites.searchPlaceholder",
        )}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearchSettling || candidates.isLoading}
        listFooter={<InviteMembersListFooter connections={paging} />}
      />
      <div className={styles.pickerFoot}>
        <p className={styles.hint}>
          {t("communities:detail.modtools.invites.selectedCount", {
            selected: fmt.number(selectedPeople.size),
            max: fmt.number(MAX_INVITES_PER_CALL),
          })}
        </p>
        <Button
          onClick={send}
          disabled={selectedPeople.size === 0 || invite.isPending}
        >
          {invite.isPending
            ? t("communities:common.loading")
            : t("communities:detail.modtools.invites.sendCta")}
        </Button>
      </div>
    </div>
  );
}
