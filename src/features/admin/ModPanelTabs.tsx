import { useState } from "react";
import {
  FiCheck,
  FiX,
  FiFlag,
  FiSearch,
  FiUserPlus,
  FiShield,
  FiAlertTriangle,
} from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import type { LivingCommunity } from "../communities/community.model";
import { photoOf } from "../communities/communityPeople";
import { RoleBadge } from "../communities/CommunityBadges";
import { defaultSettings } from "./adminMod.data";
import styles from "./ModPanel.module.css";

/* -------------------------------------------------------------------------- */
/* RequestsTab                                                                  */
/* -------------------------------------------------------------------------- */

export function RequestsTab({ living }: { living: LivingCommunity }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { approveRequest } = useCommunityMembership();
  // Intentional: snapshot the prop into local state once, then mutate locally as
  // the moderator approves/dismisses. Not a live sync with the source list.
  const [requests, setRequests] = useState(living.joinRequests ?? []);
  const [search, setSearch] = useState("");

  const filtered = requests.filter((r) =>
    r.person.name.toLowerCase().includes(search.toLowerCase()),
  );

  const resolveRequest = (id: string, name: string, approved: boolean) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (approved) approveRequest(living.slug);
    showToast(
      t(
        approved
          ? "admin:modPanel.requests.approvedToast"
          : "admin:modPanel.requests.declinedToast",
        { name },
      ),
      approved ? "success" : "info",
    );
  };

  const approveAll = () => {
    requests.forEach(() => approveRequest(living.slug));
    setRequests([]);
    showToast(
      t("admin:modPanel.requests.approvedAllToast", {
        count: requests.length,
      }),
      "success",
    );
  };

  return (
    <div>
      <div className={styles.searchRow}>
        <FiSearch className={styles.searchIcon} aria-hidden />
        <input
          className={styles.search}
          placeholder={t("admin:modPanel.requests.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {requests.length > 1 && (
        <div className={styles.bulkRow}>
          <Button variant="jade" onClick={approveAll}>
            <FiCheck aria-hidden />{" "}
            {t("admin:modPanel.requests.approveAllCta", {
              count: requests.length,
            })}
          </Button>
        </div>
      )}
      <div className={styles.secLbl}>
        {t("admin:modPanel.requests.sectionLabel")}{" "}
        {requests.length > 0 && (
          <span className={styles.tabCount}>{requests.length}</span>
        )}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          compact
          title={t("admin:modPanel.requests.emptyTitle")}
          description={t("admin:modPanel.requests.emptyDesc")}
        />
      ) : (
        filtered.map((r) => (
          <div className={styles.modRow} key={r.id}>
            <Avatar
              initials={r.person.initials}
              tint={r.person.tint}
              src={photoOf(r.person)}
              size={42}
              alt={r.person.name}
            />
            <div className={styles.modMain}>
              <div className={styles.modName}>{r.person.name}</div>
              {r.note && <div className={styles.modNote}>"{r.note}"</div>}
              <div className={styles.modMeta}>
                {t("admin:modPanel.requests.requestedAgo", { time: r.time })}
              </div>
            </div>
            <div className={styles.modActions}>
              <Button
                variant="jade"
                onClick={() => resolveRequest(r.id, r.person.name, true)}
              >
                <FiCheck aria-hidden />{" "}
                {t("admin:modPanel.requests.approveCta")}
              </Button>
              <span
                role="button"
                tabIndex={0}
                className={styles.declineBtn}
                onClick={() => resolveRequest(r.id, r.person.name, false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    resolveRequest(r.id, r.person.name, false);
                  }
                }}
              >
                <FiX aria-hidden /> {t("admin:modPanel.requests.declineCta")}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ReportsTab                                                                   */
/* -------------------------------------------------------------------------- */

export function ReportsTab({ living }: { living: LivingCommunity }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // Intentional: snapshot the prop into local state once, then mutate locally as
  // the moderator resolves/dismisses. Not a live sync with the source list.
  const [reports, setReports] = useState(living.reports ?? []);

  const removeReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(t("admin:modPanel.reports.removedToast"), "success");
  };
  const warnAuthor = (id: string, authorName: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(
      t("admin:modPanel.reports.warnedToast", { name: authorName }),
      "info",
    );
  };
  const dismissReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(t("admin:modPanel.reports.dismissedToast"), "info");
  };
  const escalate = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(t("admin:modPanel.reports.escalatedToast"), "info");
  };

  return (
    <div>
      <div className={styles.secLbl}>
        {t("admin:modPanel.reports.sectionLabel")}{" "}
        {reports.length > 0 && (
          <span className={styles.tabCount}>{reports.length}</span>
        )}
      </div>
      {reports.length === 0 ? (
        <EmptyState
          compact
          title={t("admin:modPanel.reports.emptyTitle")}
          description={t("admin:modPanel.reports.emptyDesc")}
        />
      ) : (
        reports.map((rep) => (
          <div className={styles.reportCard} key={rep.id}>
            <div className={styles.reportReason}>
              <FiFlag aria-hidden /> {rep.reason}
            </div>
            <p className={styles.reportExcerpt}>"{rep.postExcerpt}"</p>
            <div className={styles.modMeta}>
              {t("admin:modPanel.reports.metaLine", {
                author: rep.author.name,
                reporter: rep.reporter.name,
                time: rep.time,
              })}
            </div>
            <div className={styles.modActions} style={{ marginTop: 12 }}>
              <Button variant="primary" onClick={() => removeReport(rep.id)}>
                {t("admin:modPanel.reports.removeCta")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => warnAuthor(rep.id, rep.author.name)}
              >
                {t("admin:modPanel.reports.warnCta")}
              </Button>
              <Button variant="ghost" onClick={() => dismissReport(rep.id)}>
                {t("admin:modPanel.reports.dismissCta")}
              </Button>
              <Button variant="ghost" onClick={() => escalate(rep.id)}>
                <FiAlertTriangle aria-hidden />{" "}
                {t("admin:modPanel.reports.escalateCta")}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MembersTab                                                                   */
/* -------------------------------------------------------------------------- */

const ROLE_FILTER_KEYS = [
  ["all", "modPanel.members.roleFilter.all"],
  ["mod", "modPanel.members.roleFilter.mod"],
  ["member", "modPanel.members.roleFilter.member"],
] as const;

export function MembersTab({ living }: { living: LivingCommunity }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { promoteToMod } = useCommunityMembership();
  const [promoted, setPromoted] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<"all" | "mod" | "member">("all");
  const [search, setSearch] = useState("");

  const memberKey = (slug?: string, name?: string) => slug ?? name ?? "";

  const promote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    setPromoted((p) => [...p, key]);
    promoteToMod(living.slug, key);
    showToast(t("admin:modPanel.members.promotedToast", { name }), "success");
  };
  const demote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    setPromoted((p) => p.filter((k) => k !== key));
    showToast(t("admin:modPanel.members.demotedToast", { name }), "info");
  };
  const removeMember = (slug: string | undefined, name: string) => {
    setRemoved((p) => [...p, memberKey(slug, name)]);
    showToast(t("admin:modPanel.members.removedToast", { name }), "info");
  };

  const manageable = living.roster
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
              src={photoOf(m)}
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

/* -------------------------------------------------------------------------- */
/* SettingsTab                                                                  */
/* -------------------------------------------------------------------------- */

export function SettingsTab({ living }: { living: LivingCommunity }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const init = defaultSettings(living);
  const [name, setName] = useState(init.name);
  const [description, setDescription] = useState(init.description);
  const [mode, setMode] = useState(init.membershipMode);
  const [rules, setRules] = useState(init.rules);

  const MODE_KEYS = [
    ["open", "modPanel.settings.mode.open"],
    ["request", "modPanel.settings.mode.request"],
    ["invite", "modPanel.settings.mode.invite"],
  ] as const;

  const save = () => {
    showToast(t("admin:modPanel.settings.savedToast"), "success");
  };

  const archive = () => {
    showToast(t("admin:modPanel.settings.archive.toast"), "info");
  };

  const transfer = () => {
    showToast(t("admin:modPanel.settings.transfer.toast"), "info");
  };

  return (
    <div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel} htmlFor="mod-name">
          {t("admin:modPanel.settings.nameLabel")}
        </label>
        <input
          id="mod-name"
          className={styles.settingsInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel} htmlFor="mod-desc">
          {t("admin:modPanel.settings.descLabel")}
        </label>
        <input
          id="mod-desc"
          className={styles.settingsInput}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("admin:modPanel.settings.descPlaceholder")}
        />
      </div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel}>
          {t("admin:modPanel.settings.modeLabel")}
        </label>
        <div className={styles.modeRow}>
          {MODE_KEYS.map(([val, labelKey]) => (
            <button
              key={val}
              type="button"
              className={[
                styles.modeChip,
                mode === val && styles.modeChipActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setMode(val)}
            >
              {t(`admin:${labelKey}`)}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel} htmlFor="mod-rules">
          {t("admin:modPanel.settings.rulesLabel")}
        </label>
        <textarea
          id="mod-rules"
          className={styles.rulesArea}
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder={t("admin:modPanel.settings.rulesPlaceholder")}
        />
      </div>
      <div className={styles.saveRow}>
        <Button variant="primary" onClick={save}>
          {t("admin:modPanel.settings.saveCta")}
        </Button>
      </div>

      <div className={styles.secLbl}>
        {t("admin:modPanel.settings.dangerZone")}
      </div>
      <div className={styles.dangerZone}>
        <div className={styles.danger}>
          {t("admin:modPanel.settings.irreversible")}
        </div>
        <div className={styles.dangerRow}>
          <div className={styles.dangerInfo}>
            <div className={styles.dangerTitle}>
              {t("admin:modPanel.settings.archive.title")}
            </div>
            <div className={styles.dangerDesc}>
              {t("admin:modPanel.settings.archive.desc")}
            </div>
          </div>
          <Button variant="ghost" onClick={archive}>
            {t("admin:modPanel.settings.archive.cta")}
          </Button>
        </div>
        <div className={styles.dangerRow}>
          <div className={styles.dangerInfo}>
            <div className={styles.dangerTitle}>
              {t("admin:modPanel.settings.transfer.title")}
            </div>
            <div className={styles.dangerDesc}>
              {t("admin:modPanel.settings.transfer.desc")}
            </div>
          </div>
          <Button variant="ghost" onClick={transfer}>
            {t("admin:modPanel.settings.transfer.cta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
