import { useMemo, useState } from "react";
import {
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useConnectionsSearch } from "../connect/api/useConnectionsSearch";
import { InviteMembersListFooter } from "./InviteMembersListFooter";
import styles from "./RsvpConnectionInvites.module.css";

/**
 * The connections picker inside the RSVP invite section. It draws and ticks
 * the modal's picks; the modal's Save sends them. Picks are capped at the
 * seats the member has left, since demo sends never check the cap and a live
 * send past it only fails after the tap. The search runs on the server, and
 * a pick made under an earlier search stays pinned above the results.
 */
export function RsvpInvitePicker({
  remainingSlots,
  excludeSlugs,
  selected,
  activePicks,
  onToggle,
}: {
  remainingSlots: number;
  /** The member's own invitees, hidden from the pool. */
  excludeSlugs: string[];
  /** The slugs of the picks that still hold a seat. */
  selected: Set<string>;
  /** Those picks, pinned above the results under any search. */
  activePicks: MemberSelectPerson[];
  /** Ticks or unticks one connection; `person` is its row in the results. */
  onToggle: (memberSlug: string, person?: MemberSelectPerson) => void;
}) {
  const { t } = useTranslation();
  const staffMap = useStaffMap();
  const [searchQuery, setSearchQuery] = useState("");

  const connectionsSearch = useConnectionsSearch(searchQuery);
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

  const toggle = (memberSlug: string) =>
    onToggle(
      memberSlug,
      people.find((candidate) => candidate.slug === memberSlug),
    );

  return (
    <div className={styles.picker}>
      {/* Full height: in a dialog that already scrolls, a list cut to two
          rows hid that more connections were there. */}
      <MemberSelectList
        people={people}
        selected={selected}
        pinnedPeople={activePicks}
        onToggle={toggle}
        cap={remainingSlots}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t("gatherings:rsvpInvites.searchLabel")}
        searchAriaLabel={t("gatherings:rsvpInvites.searchLabel")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearchPending && searchQuery.trim() !== ""}
        emptyHint={
          isSearchPending
            ? t("gatherings:manage.invite.loadingPeople")
            : t("gatherings:manage.invite.noConnections")
        }
        emptyMessage={
          connectionsSearch.isError
            ? t("gatherings:create.v2.who.cohostsLoadError")
            : !isSearchPending && people.length > 0
              ? t("gatherings:rsvpInvites.allInvited")
              : undefined
        }
        listFooter={<InviteMembersListFooter connections={connectionsSearch} />}
      />
    </div>
  );
}
