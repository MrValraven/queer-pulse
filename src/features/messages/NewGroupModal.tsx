import { useEffect, useMemo, useState } from "react";
import {
  Button,
  MemberSelectList,
  Modal,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import type { ConnectionView } from "../connect/connections.data";
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
 * of the member's accepted connections. Reuses the same connection pool +
 * drain-all-pages behaviour as `NewMessageModal` (so search sees every
 * connection), this is the sibling the feature spec allows. The photo reuses
 * the shared presign upload pipeline via {@link GroupAvatarField}; skipping it
 * opens the group with a default initials avatar. Built on the shared `Modal`
 * (scroll-lock / focus-trap / Escape) and the shared `MemberSelectList`.
 */
export function NewGroupModal({ onClose, onCreate }: NewGroupModalProps) {
  const { t } = useTranslation();
  const { isBlocked } = useSocial();
  const staffMap = useStaffMap();
  const [title, setTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // The creator already occupies one seat, so the picker can offer at most
  // this many more (DES-229, never more than the server will accept). A
  // brand-new group's active count is always 1, so this is always
  // `MAX_MEMBERS_PER_REQUEST` (50): the group can never be FULL at creation
  // time the way an existing group's add-members picker can be.
  const cap = remainingGroupSlots(1);
  const isAtCap = selected.size >= cap;

  const { views, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");

  // Drain remaining pages so search sees every connection (mirrors NewMessageModal).
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const candidates = useMemo(
    () => views.filter((view) => !isBlocked(view.slug)),
    [views, isBlocked],
  );
  const bySlug = useMemo(() => {
    const map = new Map<string, ConnectionView>();
    for (const view of candidates) map.set(view.slug, view);
    return map;
  }, [candidates]);
  const people = useMemo<MemberSelectPerson[]>(
    () =>
      candidates.map((view) => ({
        slug: view.slug,
        name: view.name,
        avatarUrl: view.photo,
        pronouns: view.pron,
        staffRole: staffMap[view.slug]?.tier ?? undefined,
        staffBadgedRoles: staffMap[view.slug]?.badgedStaffRoles,
      })),
    [candidates, staffMap],
  );

  function toggle(slug: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  const canCreate = title.trim().length > 0 && selected.size > 0;

  function create() {
    const picks: GroupMemberPick[] = [...selected]
      .map((slug) => bySlug.get(slug))
      .filter((view): view is ConnectionView => !!view)
      .map((view) => ({
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
          {t("messages:group.createCta", { count: selected.size })}
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
      >
        {selected.size > 0 &&
          t("messages:group.selectedOfCap", {
            selected: selected.size,
            max: cap,
          })}
        {isAtCap && ` ${t("messages:group.capReachedExtra")}`}
      </p>
      <MemberSelectList
        people={people}
        selected={selected}
        onToggle={toggle}
        cap={cap}
        searchPlaceholder={t("messages:group.searchPlaceholder")}
      />
    </Modal>
  );
}
