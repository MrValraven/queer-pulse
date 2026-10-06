import { useMemo, useRef, useState } from "react";
import {
  Button,
  MemberSelectList,
  Modal,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useConnectionsSearch } from "../connect/api/useConnectionsSearch";
import type { ConnectionView } from "../connect/connections.data";
import { InviteMembersListFooter } from "../gatherings/InviteMembersListFooter";
import { MAX_GROUP_MEMBERS, remainingGroupSlots } from "./groupLimits";
import type { GroupMemberPick } from "./NewGroupModal";
import styles from "./NewMessageModal.module.css";

interface GroupAddMembersModalProps {
  /** Slugs already in the group, excluded from the picker. */
  existingSlugs: string[];
  /** The group's current active member count (DES-229, caps how many more
   *  this request can pick, mirroring the server's member limit). */
  activeMemberCount: number;
  onClose: () => void;
  /** Fired with the picked members (owner/admin only; server re-checks). */
  onAdd: (members: GroupMemberPick[]) => void;
  /** True while the add mutation is in flight. */
  busy: boolean;
}

/**
 * Add-members picker for an existing group: the same server-searched
 * connection pool as NewGroupModal (`useConnectionsSearch`, demo mode
 * included), minus the group-name field, and with the current roster filtered
 * out. Multi-select; picks are kept by slug, so one made under an earlier
 * search still reaches `onAdd`. Confirms with the picked members.
 * Adds are owner/admin-gated server-side (each member must also be a connection +
 * not blocked), this UI only surfaces for a caller whose can-flags allow it.
 * Built on the shared `Modal` and `MemberSelectList`.
 */
export function GroupAddMembersModal({
  existingSlugs,
  activeMemberCount,
  onClose,
  onAdd,
  busy,
}: GroupAddMembersModalProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { isBlocked } = useSocial();
  const staffMap = useStaffMap();
  const [searchQuery, setSearchQuery] = useState("");
  // Picks keyed by slug, filled at toggle time, so a pick stays named and
  // tinted after a new search drops it from the rows on screen.
  const [picksBySlug, setPicksBySlug] = useState<Map<string, ConnectionView>>(
    () => new Map(),
  );
  // Everyone picked in this modal session, kept through an untick, so an
  // unticked pinned row that has left the results can be ticked again.
  const everPickedBySlugRef = useRef<Map<string, ConnectionView>>(new Map());
  // The picks that still count: one blocked or added to the group since it was
  // ticked drops out of the count, the cap, the pinned rows and the payload
  // alike.
  const activePicks = useMemo(() => {
    const existingSlugSet = new Set(existingSlugs);
    return [...picksBySlug.values()].filter(
      (view) => !isBlocked(view.slug) && !existingSlugSet.has(view.slug),
    );
  }, [picksBySlug, isBlocked, existingSlugs]);
  const selected = useMemo(
    () => new Set(activePicks.map((view) => view.slug)),
    [activePicks],
  );
  const cap = remainingGroupSlots(activeMemberCount);
  const isGroupFull = cap === 0;
  const isAtCap = cap > 0 && selected.size >= cap;

  const connectionsSearch = useConnectionsSearch(searchQuery);
  const { views: connections, isSearchPending } = connectionsSearch;

  const candidates = useMemo(
    () => connections.filter((connection) => !isBlocked(connection.slug)),
    [connections, isBlocked],
  );
  const people = useMemo<MemberSelectPerson[]>(
    () => candidates.map((view) => toMemberSelectPerson(view, staffMap)),
    [candidates, staffMap],
  );
  // Every pick stays listed above the results, so one made under an earlier
  // search can still be seen and unticked.
  const pinnedPeople = useMemo<MemberSelectPerson[]>(
    () => activePicks.map((view) => toMemberSelectPerson(view, staffMap)),
    [activePicks, staffMap],
  );

  function toggle(slug: string) {
    const candidate =
      candidates.find((connection) => connection.slug === slug) ??
      everPickedBySlugRef.current.get(slug);
    if (candidate) everPickedBySlugRef.current.set(slug, candidate);
    setPicksBySlug((previous) => {
      const next = new Map(previous);
      if (next.has(slug)) next.delete(slug);
      else if (candidate) next.set(slug, candidate);
      return next;
    });
  }

  // One figure for the CTA and the cap hint; each mount rolls on its own. The
  // CTA wraps its sentence in a span so the button's flex gap stays outside it.
  const selectedCountFigure = (
    <RollingNumber
      value={fmt.number(selected.size)}
      numericValue={selected.size}
    />
  );

  function add() {
    const picks: GroupMemberPick[] = activePicks.map((view) => ({
      slug: view.slug,
      name: view.name,
      initials: view.initials,
      tint: view.tint,
    }));
    onAdd(picks);
  }

  return (
    <Modal
      title={t("messages:group.addTitle")}
      onClose={onClose}
      footer={
        <Button
          variant="primary"
          disabled={selected.size === 0 || busy}
          onClick={add}
        >
          <span>
            <Translation
              i18nKey="messages:group.addCta"
              values={{ count: selected.size }}
              slots={{ count: selectedCountFigure }}
            />
          </span>
        </Button>
      }
    >
      {isGroupFull ? (
        <p className={styles.groupFull}>
          <span className={styles.groupFullTitle}>
            {t("messages:group.full")}
          </span>
          {t("messages:group.fullBody", { max: MAX_GROUP_MEMBERS })}
        </p>
      ) : (
        <>
          <p
            className={[styles.capHint, isAtCap && styles.capHintAtLimit]
              .filter(Boolean)
              .join(" ")}
            aria-live="polite"
            aria-atomic="true"
          >
            {selected.size > 0 && (
              <Translation
                i18nKey="messages:group.selectedOfCap"
                values={{ selected: selected.size, max: cap }}
                slots={{ selected: selectedCountFigure }}
              />
            )}
            {isAtCap && ` ${t("messages:group.capReachedExtra")}`}
          </p>
          <MemberSelectList
            people={people}
            pinnedPeople={pinnedPeople}
            selected={selected}
            onToggle={toggle}
            excludeSlugs={existingSlugs}
            cap={cap}
            searchPlaceholder={t("messages:group.searchPlaceholder")}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isSearchPending && searchQuery.trim() !== ""}
            emptyHint={
              isSearchPending
                ? t("messages:newMessage.loading")
                : t("messages:newMessage.none")
            }
            emptyMessage={
              connectionsSearch.isError
                ? t("messages:group.connectionsLoadError")
                : !isSearchPending && people.length > 0
                  ? t("messages:group.allListedInGroup")
                  : undefined
            }
            listFooter={
              <InviteMembersListFooter connections={connectionsSearch} />
            }
          />
        </>
      )}
    </Modal>
  );
}

/** One connection as a picker row, staff badge included. */
function toMemberSelectPerson(
  view: ConnectionView,
  staffMap: ReturnType<typeof useStaffMap>,
): MemberSelectPerson {
  return {
    slug: view.slug,
    name: view.name,
    avatarUrl: view.photo,
    pronouns: view.pron,
    staffRole: staffMap[view.slug]?.tier ?? undefined,
    staffBadgedRoles: staffMap[view.slug]?.badgedStaffRoles,
  };
}
