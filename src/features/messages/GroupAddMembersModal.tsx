import { useEffect, useMemo, useState } from "react";
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
import { useConnectionsList } from "../connect/api/useConnectionsList";
import type { ConnectionView } from "../connect/connections.data";
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
 * Add-members picker for an existing group: the same connection pool + drain-
 * all-pages behaviour as NewGroupModal, minus the group-name field, and with the
 * current roster filtered out. Multi-select; confirms with the picked members.
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const cap = remainingGroupSlots(activeMemberCount);
  const isGroupFull = cap === 0;
  const isAtCap = cap > 0 && selected.size >= cap;

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

  // One figure for the CTA and the cap hint; each mount rolls on its own. The
  // CTA wraps its sentence in a span so the button's flex gap stays outside it.
  const selectedCountFigure = (
    <RollingNumber
      value={fmt.number(selected.size)}
      numericValue={selected.size}
    />
  );

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
            selected={selected}
            onToggle={toggle}
            excludeSlugs={existingSlugs}
            cap={cap}
            searchPlaceholder={t("messages:group.searchPlaceholder")}
          />
        </>
      )}
    </Modal>
  );
}
