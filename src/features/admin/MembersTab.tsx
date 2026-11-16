import { useState } from "react";
import {
  ConfirmDialog,
  FilterChips,
  SearchInput,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRoster } from "../communities/api/useRoster";
import { MembersTabRow } from "./MembersTabRow";
import { memberKey, useMembersTabActions } from "./useMembersTabActions";
import {
  AdminEmptyState,
  AdminPanel,
  AdminToolbar,
  adminToolbarClasses,
} from "./ui";
import styles from "./ModPanel.module.css";

const ROLE_FILTER_KEYS = [
  ["all", "modPanel.members.roleFilter.all"],
  ["mod", "modPanel.members.roleFilter.mod"],
  ["member", "modPanel.members.roleFilter.member"],
] as const;

type RoleFilter = (typeof ROLE_FILTER_KEYS)[number][0];

/**
 * The mod panel's Members tab: search, role filter, promote/demote and remove.
 *
 * The writes and their optimistic bookkeeping live in `useMembersTabActions`;
 * a row is `MembersTabRow`. Taking someone off the roster goes through a
 * confirm dialog, because there is nothing to undo it with afterwards.
 */
export function MembersTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  // Live: GET /communities/:slug/roster (real member slugs); demo: the mock
  // roster. The role/remove mutations already key off `slug`, so a live
  // promote/demote/remove targets a real member.
  const { roster } = useRoster(slug);
  const actions = useMembersTabActions(slug);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
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
    <div className={styles.tabStack}>
      <AdminToolbar label={t("admin:modPanel.members.toolbarLabel")}>
        <SearchInput
          className={adminToolbarClasses.search}
          value={search}
          onChange={setSearch}
          placeholder={t("admin:modPanel.members.searchPlaceholder")}
          ariaLabel={t("admin:modPanel.members.searchPlaceholder")}
        />
        <FilterChips
          className={adminToolbarClasses.chips}
          options={ROLE_FILTER_KEYS.map(([value, labelKey]) => ({
            value,
            label: t(`admin:${labelKey}`),
          }))}
          value={roleFilter}
          onChange={(value) => setRoleFilter(value as RoleFilter)}
        />
      </AdminToolbar>
      <AdminPanel
        title={t("admin:modPanel.members.sectionLabel")}
        actions={<span className={styles.tabCount}>{manageable.length}</span>}
        padding="flush"
      >
        {manageable.length === 0 && (
          <div className={styles.panelEmpty}>
            <AdminEmptyState
              size="inline"
              title={t("admin:officialMessages.member.noResults")}
            />
          </div>
        )}
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
      </AdminPanel>

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
