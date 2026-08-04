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
import type { GroupMemberPick } from "./NewGroupModal";

interface GroupAddMembersModalProps {
  /** Slugs already in the group — excluded from the picker. */
  existingSlugs: string[];
  onClose: () => void;
  /** Fired with the picked members (owner/admin only; server re-checks). */
  onAdd: (members: GroupMemberPick[]) => void;
  /** True while the add mutation is in flight. */
  busy: boolean;
}

/**
 * Add-members picker for an existing group — the same connection pool + drain-
 * all-pages behaviour as NewGroupModal, minus the group-name field, and with the
 * current roster filtered out. Multi-select; confirms with the picked members.
 * Adds are owner/admin-gated server-side (each member must also be a connection +
 * not blocked) — this UI only surfaces for a caller whose can-flags allow it.
 * Built on the shared `Modal` and `MemberSelectList`.
 */
export function GroupAddMembersModal({
  existingSlugs,
  onClose,
  onAdd,
  busy,
}: GroupAddMembersModalProps) {
  const { t } = useTranslation();
  const { isBlocked } = useSocial();
  const staffMap = useStaffMap();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { views, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");

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
        staffRole: staffMap[view.slug],
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

  function add() {
    const picks: GroupMemberPick[] = [...selected]
      .map((slug) => bySlug.get(slug))
      .filter((view): view is ConnectionView => !!view)
      .map((view) => ({
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
          {t("messages:group.addCta", { count: selected.size })}
        </Button>
      }
    >
      <MemberSelectList
        people={people}
        selected={selected}
        onToggle={toggle}
        excludeSlugs={existingSlugs}
        searchPlaceholder={t("messages:group.searchPlaceholder")}
      />
    </Modal>
  );
}
