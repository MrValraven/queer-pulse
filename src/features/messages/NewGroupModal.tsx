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
import { GroupAvatarField } from "./GroupAvatarField";
import { remainingGroupSlots } from "./groupLimits";
import styles from "./NewMessageModal.module.css";

/** One picked group member (identity only; the server/demo fills history). */
export interface GroupMemberPick {
  slug: string;
  name: string;
  initials: string;
  tint: ConnectionView["tint"];
}

interface NewGroupModalProps {
  onClose: () => void;
  /**
   * Fired with the group name, picked members, and an optional avatar storage
   * key when the creator confirms.
   */
  onCreate: (
    title: string,
    members: GroupMemberPick[],
    avatarUrl?: string,
  ) => void;
}

/**
 * Create-group picker: an optional group photo + a group name + a MULTI-select
 * of the member's accepted connections. The search runs on the server across
 * every page of connections (`useConnectionsSearch`, demo mode included), so
 * connection 25 and beyond stay reachable; each pick is kept by slug, so a
 * pick made under an earlier search still reaches the create payload. This is
 * the sibling of `NewMessageModal` the feature spec allows. The photo reuses
 * the shared presign upload pipeline via {@link GroupAvatarField}; skipping it
 * opens the group with a default initials avatar. Built on the shared `Modal`
 * (scroll-lock / focus-trap / Escape) and the shared `MemberSelectList`.
 */
export function NewGroupModal({ onClose, onCreate }: NewGroupModalProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { isBlocked } = useSocial();
  const staffMap = useStaffMap();
  const [title, setTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // Picks keyed by slug, filled at toggle time, so a pick stays named and
  // tinted after a new search drops it from the rows on screen.
  const [picksBySlug, setPicksBySlug] = useState<Map<string, ConnectionView>>(
    () => new Map(),
  );
  // Everyone picked in this modal session, kept through an untick, so an
  // unticked pinned row that has left the results can be ticked again.
  const everPickedBySlugRef = useRef<Map<string, ConnectionView>>(new Map());
  // The picks that still count: one blocked since it was ticked drops out of
  // the count, the cap, the pinned rows and the payload alike.
  const activePicks = useMemo(
    () => [...picksBySlug.values()].filter((view) => !isBlocked(view.slug)),
    [picksBySlug, isBlocked],
  );
  const selected = useMemo(
    () => new Set(activePicks.map((view) => view.slug)),
    [activePicks],
  );
  // The creator already occupies one seat, so the picker can offer at most
  // this many more (DES-229, at most what the server will accept). A
  // brand-new group's active count is always 1, so this is always
  // `MAX_MEMBERS_PER_REQUEST` (50): the group can never be FULL at creation
  // time the way an existing group's add-members picker can be.
  const cap = remainingGroupSlots(1);
  const isAtCap = selected.size >= cap;

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

  const canCreate = title.trim().length > 0 && selected.size > 0;

  // One figure for the CTA and the cap hint; each mount rolls on its own. The
  // CTA wraps its sentence in a span so the button's flex gap stays outside it.
  const selectedCountFigure = (
    <RollingNumber
      value={fmt.number(selected.size)}
      numericValue={selected.size}
    />
  );

  function create() {
    const picks: GroupMemberPick[] = activePicks.map((view) => ({
      slug: view.slug,
      name: view.name,
      initials: view.initials,
      tint: view.tint,
    }));
    onCreate(title.trim(), picks, avatarUrl.trim() || undefined);
  }

  return (
    <Modal
      title={t("messages:group.newTitle")}
      sub={t("messages:group.newSub")}
      onClose={onClose}
      footer={
        <Button variant="primary" disabled={!canCreate} onClick={create}>
          <span>
            <Translation
              i18nKey="messages:group.createCta"
              values={{ count: selected.size }}
              slots={{ count: selectedCountFigure }}
            />
          </span>
        </Button>
      }
    >
      <GroupAvatarField
        currentAvatarUrl={avatarUrl || undefined}
        groupName={title.trim()}
        onChange={setAvatarUrl}
      />
      <input
        className={styles.groupNameField}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={t("messages:group.namePlaceholder")}
        aria-label={t("messages:group.nameAria")}
        maxLength={80}
      />
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
            : undefined
        }
        listFooter={<InviteMembersListFooter connections={connectionsSearch} />}
      />
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
