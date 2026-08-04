import { useState } from "react";
import { FiX, FiSearch, FiUserPlus, FiShield } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  useRemoveMember,
  useSetMemberRole,
} from "../communities/api/useCommunityMutations";
import { useRoster } from "../communities/api/useRoster";
import { photoOf } from "../communities/communityPeople";
import { RoleBadge } from "../communities/CommunityBadges";
import styles from "./ModPanel.module.css";

const ROLE_FILTER_KEYS = [
  ["all", "modPanel.members.roleFilter.all"],
  ["mod", "modPanel.members.roleFilter.mod"],
  ["member", "modPanel.members.roleFilter.member"],
] as const;

export function MembersTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  // Live: GET /communities/:slug/roster (real member slugs); demo: the mock
  // roster. The role/remove mutations below already key off `slug`, so a live
  // promote/demote/remove now targets a real member instead of a mock id.
  const { roster } = useRoster(slug);
  const setMemberRole = useSetMemberRole(slug);
  const removeMemberMutation = useRemoveMember(slug);
  const [promoted, setPromoted] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<"all" | "mod" | "member">("all");
  const [search, setSearch] = useState("");

  const memberKey = (slug?: string, name?: string) => slug ?? name ?? "";

  const promote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    // Local list drives the row's badge + the role filter immediately; the PATCH
    // is the real change, and its invalidation refetches the roster.
    setPromoted((p) => [...p, key]);
    if (slug) setMemberRole.mutate({ memberSlug: slug, role: "mod" });
    showToast(t("admin:modPanel.members.promotedToast", { name }), "success");
  };
  const demote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    setPromoted((p) => p.filter((k) => k !== key));
    if (slug) setMemberRole.mutate({ memberSlug: slug, role: "member" });
    showToast(t("admin:modPanel.members.demotedToast", { name }), "info");
  };
  const removeMember = (slug: string | undefined, name: string) => {
    // Local list hides the row immediately; the DELETE is the real change and
    // its invalidation refetches the roster (same optimistic pattern as
    // promote/demote above).
    setRemoved((p) => [...p, memberKey(slug, name)]);
    if (slug) removeMemberMutation.mutate(slug);
    showToast(t("admin:modPanel.members.removedToast", { name }), "info");
  };

  const manageable = roster
    .filter((m) => !removed.includes(memberKey(m.slug, m.name)))
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => {
      if (roleFilter === "all") return true;
      const effectiveRole = promoted.includes(memberKey(m.slug, m.name))
        ? "mod"
        : m.role;
      return (
        effectiveRole === roleFilter ||
        (roleFilter === "mod" && m.role === "owner")
      );
    });

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
        const isMod = m.role !== "member" || promoted.includes(key);
        const isPromotedMod = promoted.includes(key) && m.role === "member";
        return (
          <div className={styles.modRow} key={key}>
            <Avatar
              initials={m.initials}
              tint={m.tint}
              src={photoOf(m, demoMode)}
              size={38}
              alt={m.name}
            />
            <div className={styles.modMain}>
              <div className={styles.modName}>
                {m.name} <RoleBadge role={isPromotedMod ? "mod" : m.role} />
              </div>
              {m.title && <div className={styles.modMeta}>{m.title}</div>}
            </div>
            <div className={styles.modActions}>
              {!isMod && (
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.declineBtn}
                  onClick={() => promote(m.slug, m.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      promote(m.slug, m.name);
                    }
                  }}
                >
                  <FiUserPlus aria-hidden />{" "}
                  {t("admin:modPanel.members.makeModCta")}
                </span>
              )}
              {isPromotedMod && (
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.declineBtn}
                  onClick={() => demote(m.slug, m.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      demote(m.slug, m.name);
                    }
                  }}
                >
                  <FiX aria-hidden /> {t("admin:modPanel.members.removeModCta")}
                </span>
              )}
              {m.role !== "owner" && (
                <span
                  role="button"
                  tabIndex={0}
                  className={[styles.declineBtn, styles.removeBtn].join(" ")}
                  onClick={() => removeMember(m.slug, m.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      removeMember(m.slug, m.name);
                    }
                  }}
                >
                  <FiX aria-hidden /> {t("admin:modPanel.members.removeCta")}
                </span>
              )}
              {m.role === "owner" && (
                <span className={styles.ownerTag}>
                  <FiShield aria-hidden />{" "}
                  {t("admin:modPanel.members.ownerTag")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
