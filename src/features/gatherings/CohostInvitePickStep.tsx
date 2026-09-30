import { useMemo } from "react";
import {
  MemberSelectList,
  Modal,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useConnectionsSearch } from "../connect/api/useConnectionsSearch";
import { InviteMembersListFooter } from "./InviteMembersListFooter";

/**
 * Step one of the cohost invite: tap a connection to pick them. The search
 * runs on the server across every page of connections, because filtering only
 * the first page locally left connection 25 and beyond unreachable. Demo mode
 * takes the same path, since `useConnectionsList` serves and searches the demo
 * connections itself. The query lives in the parent modal so "Pick someone
 * else" returns to what was typed.
 */
export function CohostInvitePickStep({
  excludeSlugs,
  searchQuery,
  onSearchChange,
  onPick,
  onClose,
}: {
  /** Slugs already cohosting, hidden from the pool. */
  excludeSlugs: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPick: (person: MemberSelectPerson) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const staffMap = useStaffMap();
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

  const pick = (candidateSlug: string) => {
    const person = people.find((candidate) => candidate.slug === candidateSlug);
    if (person) onPick(person);
  };

  return (
    <Modal
      eyebrow={t("gatherings:cohost.addModal.eyebrow")}
      title={
        <Translation
          i18nKey="gatherings:cohost.addModal.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("gatherings:cohost.addModal.sub")}
      onClose={onClose}
    >
      <MemberSelectList
        people={people}
        selected={new Set()}
        onToggle={pick}
        multiSelect={false}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t("gatherings:cohost.addModal.searchLabel")}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
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
              ? t("gatherings:cohost.addModal.allListedCohosting")
              : undefined
        }
        listFooter={<InviteMembersListFooter connections={connectionsSearch} />}
      />
    </Modal>
  );
}
