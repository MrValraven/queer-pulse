import { useMemo, useState } from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import {
  Button,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStaffMap } from "../../../../shared/staff/useStaffRole";
import { useConnectionsSearch } from "../../../connect/api/useConnectionsSearch";
import { InviteMembersListFooter } from "../../../gatherings/InviteMembersListFooter";
import { normalizeRoleLabel } from "../api/listingTeam.adapters";
import { useListingTeam } from "../api/useListingTeam";
import type { useListingTeamMutations } from "../api/useListingTeamMutations";
import { listingTeamErrorCopy } from "./listingTeamErrors.data";
import { ListingTeamRowError } from "./ListingTeamRowError";
import styles from "./ListingTeamMemberInvitePanel.module.css";

const KEY = "marketing:listBusiness.team";

interface ListingTeamMemberInvitePanelProps {
  listingRef: string;
  isListingOpen: boolean;
  /** The role typed in the shared field; sent as `normalizeRoleLabel(roleLabel)`. */
  roleLabel: string;
  /** Counts the typing in the shared role field, so a refusal clears on an edit. */
  roleLabelEditCount: number;
  inviteMember: ReturnType<typeof useListingTeamMutations>["inviteMember"];
  /** Called after an invite went through, so the shared role field empties. */
  onInvited: () => void;
}

/**
 * The Members tab: the business asking one of the acting member's own
 * connections to join the team. Candidates are searched on the server as
 * typing pauses and paged at the end of the list; members already invited or
 * on the team drop out. The pick is held as the whole person, so it stays on
 * screen above the results after a new search leaves it out.
 */
export function ListingTeamMemberInvitePanel({
  listingRef,
  isListingOpen,
  roleLabel,
  roleLabelEditCount,
  inviteMember,
  onInvited,
}: ListingTeamMemberInvitePanelProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { showToast } = useToast();
  const { team } = useListingTeam(listingRef);
  const [query, setQuery] = useState("");
  const [pickedPerson, setPickedPerson] = useState<MemberSelectPerson | null>(
    null,
  );
  // Everyone picked in this panel, by slug. An unticked pinned row stays on
  // screen until the query changes while the current results may leave it
  // out, so ticking it again resolves the person from here.
  const [earlierPicks, setEarlierPicks] = useState<
    Map<string, MemberSelectPerson>
  >(() => new Map());
  const [refusalMessage, setRefusalMessage] = useState<string | null>(null);
  const [seenRoleLabelEditCount, setSeenRoleLabelEditCount] =
    useState(roleLabelEditCount);
  if (seenRoleLabelEditCount !== roleLabelEditCount) {
    setSeenRoleLabelEditCount(roleLabelEditCount);
    setRefusalMessage(null);
  }

  const excludeSlugs = useMemo(() => {
    const slugs: string[] = [];
    for (const row of [
      ...(team?.invitesSent ?? []),
      ...(team?.accepted ?? []),
    ]) {
      if (row.kind === "member" && row.member) slugs.push(row.member.slug);
    }
    return slugs;
  }, [team]);

  const staffMap = useStaffMap();
  const connectionsSearch = useConnectionsSearch(query);
  const { views: connections, isSearchPending } = connectionsSearch;

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      connections.map((connection) => ({
        slug: connection.slug,
        name: connection.name,
        avatarUrl: connection.photo,
        pronouns: connection.pron,
        staffRole: staffMap[connection.slug]?.tier ?? undefined,
        staffBadgedRoles: staffMap[connection.slug]?.badgedStaffRoles,
      })),
    [connections, staffMap],
  );

  // A pick who has since joined the roster or been invited no longer counts,
  // so the button can only ever reach a person still shown in the list.
  const activePick =
    pickedPerson && !excludeSlugs.includes(pickedPerson.slug)
      ? pickedPerson
      : null;
  const selected = useMemo(
    () => new Set(activePick ? [activePick.slug] : []),
    [activePick],
  );
  const pinnedPeople = useMemo(
    () => (activePick ? [activePick] : []),
    [activePick],
  );

  const toggle = (memberSlug: string) => {
    setRefusalMessage(null);
    if (activePick?.slug === memberSlug) {
      setPickedPerson(null);
      return;
    }
    // Single select: ticking somebody else replaces the pick. The current
    // rows answer first, then the picks held from an earlier search.
    const person =
      people.find((candidate) => candidate.slug === memberSlug) ??
      earlierPicks.get(memberSlug);
    if (!person) return;
    setPickedPerson(person);
    if (!earlierPicks.has(person.slug)) {
      setEarlierPicks((previous) => new Map(previous).set(person.slug, person));
    }
  };

  const isInviteBlocked = !isListingOpen || inviteMember.isPending;
  const isInviteDisabled = isInviteBlocked || activePick === null;

  const sendInvite = () => {
    if (isInviteDisabled || activePick === null) return;
    setRefusalMessage(null);
    inviteMember.mutate(
      { memberSlug: activePick.slug, roleLabel: normalizeRoleLabel(roleLabel) },
      {
        onSuccess: () => {
          onInvited();
          setPickedPerson(null);
          setQuery("");
          showToast(t(`${KEY}.toast.invited`), "success");
        },
        onError: (error) => {
          const { messageKey, values } = listingTeamErrorCopy(
            error,
            "listing",
            formatters,
            "member",
          );
          setRefusalMessage(t(messageKey, values));
        },
      },
    );
  };

  let emptyMessage: string | undefined;
  if (connectionsSearch.isError) {
    emptyMessage = t(`${KEY}.member.connectionsLoadError`);
  } else if (!isSearchPending && people.length > 0) {
    emptyMessage = t(`${KEY}.member.allListed`);
  }

  return (
    <div className={styles.panel}>
      <p className={styles.hint}>{t(`${KEY}.member.hint`)}</p>
      <MemberSelectList
        people={people}
        selected={selected}
        onToggle={toggle}
        multiSelect={false}
        selectedIndicator="radio"
        pinnedPeople={pinnedPeople}
        excludeSlugs={excludeSlugs}
        searchQuery={query}
        onSearchChange={(nextQuery) => {
          setRefusalMessage(null);
          setQuery(nextQuery);
        }}
        isSearching={isSearchPending && query.trim() !== ""}
        emptyHint={
          isSearchPending
            ? t(`${KEY}.member.loadingConnections`)
            : t(`${KEY}.member.noConnections`)
        }
        emptyMessage={emptyMessage}
        searchPlaceholder={t(`${KEY}.search.placeholder`)}
        searchAriaLabel={t(`${KEY}.member.searchLabel`)}
        listFooter={<InviteMembersListFooter connections={connectionsSearch} />}
      />
      <div className={styles.foot}>
        <Button
          aria-disabled={isInviteDisabled}
          aria-label={
            activePick && !inviteMember.isPending
              ? t(`${KEY}.member.inviteAria`, { name: activePick.name })
              : undefined
          }
          onClick={sendInvite}
        >
          {t(
            inviteMember.isPending
              ? `${KEY}.member.sendingCta`
              : `${KEY}.member.inviteCta`,
          )}
        </Button>
        <ListingTeamRowError errorMessage={refusalMessage} />
      </div>
    </div>
  );
}
