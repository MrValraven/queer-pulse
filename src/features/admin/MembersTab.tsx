import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRoster } from "../communities/api/useRoster";
import { MembersTabRow } from "./MembersTabRow";
import { memberKey, useMembersTabActions } from "./useMembersTabActions";
import styles from "./ModPanel.module.css";

const ROLE_FILTER_KEYS = [
  ["all", "modPanel.members.roleFilter.all"],
  ["mod", "modPanel.members.roleFilter.mod"],
  ["member", "modPanel.members.roleFilter.member"],
] as const;

/**
 * The mod panel's Members tab: search, role filter, promote/demote and remove.
 *
 * The writes and their optimistic bookkeeping live in `useMembersTabActions`;
 * a row is `MembersTabRow`. Taking someone off the roster goes through a
 * confirm dialog rather than a single tap, because there is nothing to undo it
 * with afterwards.
 */
export function MembersTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  // Live: GET /communities/:slug/roster (real member slugs); demo: the mock
  // roster. The role/remove mutations already key off `slug`, so a live
  // promote/demote/remove targets a real member instead of a mock id.
  const { roster } = useRoster(slug);
  const actions = useMembersTabActions(slug);
  const [roleFilter, setRoleFilter] = useState<"all" | "mod" | "member">("all");
  const [search, setSearch] = useState("");

  const manageable = roster
    .filter((m) => !actions.removed.includes(memberKey(m.slug, m.name)))
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => {
      if (roleFilter === "all") return true;
      const effectiveRole = actions.promoted.includes(memberKey(m.slug, m.name))
        ? "mod"
        : m.role;
      return (
        effectiveRole === roleFilter ||
        (roleFilter === "mod" && m.role === "owner")
      );
    });

  const removalTarget = actions.removalTarget;

  return (
    <div>
      <div className={styles.searchRow}>
        <FiSearch className={styles.searchIcon} aria-hidden />
        <input
          className={styles.search}
          aria-label={t("admin:modPanel.members.searchPlaceholder")}
          placeholder={t("admin:modPanel.members.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.chips}>
        {ROLE_FILTER_KEYS.map(([val, labelKey]) => (
          <button
            key={val}
            type="button"
            className={[styles.chip, roleFilter === val && styles.chipOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setRoleFilter(val)}
          >
            {t(`admin:${labelKey}`)}
          </button>
        ))}
      </div>
      <div className={styles.secLbl}>
        {t("admin:modPanel.members.sectionLabel")}{" "}
        <span className={styles.tabCount}>{manageable.length}</span>
      </div>
      {manageable.map((m) => {
        const key = memberKey(m.slug, m.name);
        return (
          <MembersTabRow
            key={key}
            member={m}
            isMod={m.role !== "member" || actions.promoted.includes(key)}
            isPromotedMod={
              actions.promoted.includes(key) && m.role === "member"
            }
            isBusy={actions.busyKey === key}
            onPromote={() => actions.setRole(m.slug, m.name, "mod")}
            onDemote={() => actions.setRole(m.slug, m.name, "member")}
            onRequestRemove={() =>
              actions.setRemovalTarget({ memberSlug: m.slug, name: m.name })
            }
          />
        );
      })}

      {removalTarget && (
        <ConfirmDialog
          open
          onClose={() => actions.setRemovalTarget(null)}
          onConfirm={actions.confirmRemoval}
          title={t("admin:modPanel.members.removeConfirm.title", {
            name: removalTarget.name,
          })}
          description={t("admin:modPanel.members.removeConfirm.body", {
            name: removalTarget.name,
          })}
          tone="destructive"
          loading={actions.isRemoving}
          confirmLabel={t("admin:modPanel.members.removeConfirm.cta")}
          cancelLabel={t("admin:modPanel.settings.cancel")}
        />
      )}
    </div>
  );
}
