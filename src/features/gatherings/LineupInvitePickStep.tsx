import { useMemo } from "react";
import {
  MemberSelectList,
  Modal,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useConnectionsSearch } from "../connect/api/useConnectionsSearch";
import { useAttendees } from "./api/useAttendees";
import { InviteMembersListFooter } from "./InviteMembersListFooter";
import { buildLineupCandidates } from "./lineupCandidates";
import styles from "./GatheringLineupEditor.module.css";

/**
 * Step one of a lineup invite: tap a connection, or anyone going, to pick
 * them. Connections are searched on the server across every page, as in the
 * co-host picker; the going list is merged in and filtered locally. The query
 * lives in the parent so "Pick someone else" returns to what was typed.
 */
export function LineupInvitePickStep({
  slug,
  excludeSlugs,
  searchQuery,
  onSearchChange,
  onPick,
  onClose,
}: {
  slug: string;
  /** Slugs already on the lineup in any status. */
  excludeSlugs: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPick: (person: MemberSelectPerson) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const staffMap = useStaffMap();
  const connectionsSearch = useConnectionsSearch(searchQuery);
  const { views: connectionViews, isSearchPending } = connectionsSearch;
  const { data: attendees } = useAttendees(slug);

  const people = useMemo<MemberSelectPerson[]>(() => {
    const connections = connectionViews.map((connection) => ({
      slug: connection.slug,
      name: connection.name,
      avatarUrl: connection.photo,
      pronouns: connection.pron,
      staffRole: staffMap[connection.slug]?.tier ?? undefined,
      staffBadgedRoles: staffMap[connection.slug]?.badgedStaffRoles,
    }));
    return buildLineupCandidates(
      connections,
      attendees?.going ?? [],
      searchQuery,
    );
  }, [connectionViews, staffMap, attendees, searchQuery]);

  const pick = (candidateSlug: string) => {
    const person = people.find((candidate) => candidate.slug === candidateSlug);
    if (person) onPick(person);
  };

  const isQueryTyped = searchQuery.trim() !== "";
  const excludedSlugs = new Set(excludeSlugs);
  const visibleCount = people.filter(
    (person) => !excludedSlugs.has(person.slug),
  ).length;
  // The list shows its empty line only when no row is visible, so a failed
  // connections load beside going rows gets its own line in the footer.
  const hasConnectionsErrorBesideRows =
    connectionsSearch.isError && visibleCount > 0;
  const emptyMessage =
    connectionsSearch.isError && visibleCount === 0
      ? t("gatherings:lineup.pickerLoadError")
      : isSearchPending
        ? undefined
        : people.length > 0 && visibleCount === 0
          ? t("gatherings:lineup.pickerAllListed")
          : isQueryTyped
            ? t("gatherings:lineup.pickerEmpty")
            : undefined;

  return (
    <Modal
      eyebrow={t("gatherings:lineup.title")}
      title={t("gatherings:lineup.pickerTitle")}
      sub={t("gatherings:lineup.pickerSub")}
      onClose={onClose}
    >
      <MemberSelectList
        people={people}
        selected={new Set()}
        onToggle={pick}
        multiSelect={false}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t("gatherings:lineup.pickerSearchPlaceholder")}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        isSearching={isSearchPending && isQueryTyped}
        emptyHint={
          isSearchPending
            ? t("gatherings:manage.invite.loadingPeople")
            : t("gatherings:manage.invite.noConnections")
        }
        emptyMessage={emptyMessage}
        listFooter={
          <>
            {/* Always mounted so the status region exists before its text
                arrives and screen readers announce it. */}
            <p className={styles.pickerError} role="status">
              {hasConnectionsErrorBesideRows &&
                t("gatherings:lineup.pickerLoadError")}
            </p>
            <InviteMembersListFooter connections={connectionsSearch} />
          </>
        }
      />
    </Modal>
  );
}
