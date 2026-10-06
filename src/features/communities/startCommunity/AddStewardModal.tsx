import { useMemo, useState } from "react";
import {
  MemberSelectList,
  ModalSheet,
  type MemberSelectPerson,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useStaffMap } from "../../../shared/staff/useStaffRole";
import type { CohostCandidate } from "../../gatherings/manageCohosts.data";
import { InviteMembersListFooter } from "../../gatherings/InviteMembersListFooter";
import { useConnectionsSearch } from "../../connect/api/useConnectionsSearch";
import { connectionToCandidate } from "./stewardCandidates";
import styles from "./AddStewardModal.module.css";

/**
 * Pick one connection to appoint as a co-steward. The search runs on the
 * server across every page of connections, so a founder with more connections
 * than fit on the first page can still reach the rest. Demo mode takes the
 * same path, since `useConnectionsList` serves and searches the demo
 * connections itself. A tap hands the person straight to `onPick`, which
 * closes the sheet.
 */
export function AddStewardModal({
  /** Slugs already stewarding, hidden from the pool (owner + existing co-stewards). */
  excludeSlugs,
  onPick,
  onClose,
}: {
  excludeSlugs: string[];
  onPick: (candidate: CohostCandidate) => void;
  onClose: () => void;
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

  // The tapped row is always one of the rows on screen, so the current
  // answer holds the full connection the steward card needs.
  const pick = (candidateSlug: string) => {
    const connection = connections.find(
      (candidate) => candidate.slug === candidateSlug,
    );
    if (connection) onPick(connectionToCandidate(connection));
  };

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("communities:start.running.addStewardModal.eyebrow")}
    >
      <div className={styles.eyebrow}>
        {t("communities:start.running.addStewardModal.eyebrow")}
      </div>
      <div className={styles.title}>
        {t("communities:start.running.addStewardModal.title")}
      </div>
      <p className={styles.sub}>
        {t("communities:start.running.addStewardModal.sub")}
      </p>

      <MemberSelectList
        people={people}
        selected={new Set()}
        onToggle={pick}
        multiSelect={false}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t(
          "communities:start.running.addStewardModal.searchPlaceholder",
        )}
        searchAriaLabel={t(
          "communities:start.running.addStewardModal.searchLabel",
        )}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearchPending && searchQuery.trim() !== ""}
        emptyHint={
          isSearchPending
            ? t("gatherings:manage.invite.loadingPeople")
            : t("communities:start.running.addStewardModal.empty")
        }
        emptyMessage={
          connectionsSearch.isError
            ? t("gatherings:create.v2.who.cohostsLoadError")
            : !isSearchPending && people.length > 0
              ? t(
                  "communities:start.running.addStewardModal.allListedStewarding",
                )
              : undefined
        }
        listFooter={<InviteMembersListFooter connections={connectionsSearch} />}
      />
    </ModalSheet>
  );
}
