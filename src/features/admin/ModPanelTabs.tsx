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
  const { showToast } = useToast();
  const { approveRequest } = useCommunityMembership();
  const [requests, setRequests] = useState(living.joinRequests ?? []);
  const [search, setSearch] = useState("");

  const filtered = requests.filter((r) =>
    r.person.name.toLowerCase().includes(search.toLowerCase()),
  );

  const resolveRequest = (id: string, name: string, approved: boolean) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (approved) approveRequest(living.slug);
    showToast(
      approved
        ? `${name} approved — welcome them in.`
        : `${name}'s request wasn't approved this time.`,
      approved ? "success" : "info",
    );
  };

  const approveAll = () => {
    requests.forEach(() => approveRequest(living.slug));
    setRequests([]);
    showToast(
      `All ${requests.length} requests approved — the community grows.`,
      "success",
    );
  };

  return (
    <div>
      <div className={styles.searchRow}>
        <FiSearch className={styles.searchIcon} aria-hidden />
        <input
          className={styles.search}
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {requests.length > 1 && (
        <div className={styles.bulkRow}>
          <Button variant="jade" onClick={approveAll}>
            <FiCheck aria-hidden /> Approve all ({requests.length})
          </Button>
        </div>
      )}
      <div className={styles.secLbl}>
        Requests{" "}
        {requests.length > 0 && (
          <span className={styles.tabCount}>{requests.length}</span>
        )}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          compact
          title="No requests waiting"
          description="You're all caught up — new requests will appear here."
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
              <div className={styles.modMeta}>Requested {r.time} ago</div>
            </div>
            <div className={styles.modActions}>
              <Button
                variant="jade"
                onClick={() => resolveRequest(r.id, r.person.name, true)}
              >
                <FiCheck aria-hidden /> Approve
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
                <FiX aria-hidden /> Decline
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
  const { showToast } = useToast();
  const [reports, setReports] = useState(living.reports ?? []);

  const removeReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast("Post removed. The author has been notified.", "success");
  };
  const warnAuthor = (id: string, authorName: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(`A warning has been sent to ${authorName}.`, "info");
  };
  const dismissReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast("Report dismissed.", "info");
  };
  const escalate = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(
      "Escalated to the QueerPulse team — it's now in the platform queue.",
      "info",
    );
  };

  return (
    <div>
      <div className={styles.secLbl}>
        Reported posts{" "}
        {reports.length > 0 && (
          <span className={styles.tabCount}>{reports.length}</span>
        )}
      </div>
      {reports.length === 0 ? (
        <EmptyState
          compact
          title="All clear"
          description="Nothing has been flagged — the community looks after each other."
        />
      ) : (
        reports.map((rep) => (
          <div className={styles.reportCard} key={rep.id}>
            <div className={styles.reportReason}>
              <FiFlag aria-hidden /> {rep.reason}
            </div>
            <p className={styles.reportExcerpt}>"{rep.postExcerpt}"</p>
            <div className={styles.modMeta}>
              From {rep.author.name} · flagged by {rep.reporter.name} ·{" "}
              {rep.time} ago
            </div>
            <div className={styles.modActions} style={{ marginTop: 12 }}>
              <Button variant="primary" onClick={() => removeReport(rep.id)}>
                Remove post
              </Button>
              <Button
                variant="ghost"
                onClick={() => warnAuthor(rep.id, rep.author.name)}
              >
                Warn author
              </Button>
              <Button variant="ghost" onClick={() => dismissReport(rep.id)}>
                Dismiss
              </Button>
              <Button variant="ghost" onClick={() => escalate(rep.id)}>
                <FiAlertTriangle aria-hidden /> Escalate to staff
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

const ROLE_FILTERS = [
  ["all", "All"],
  ["mod", "Mods"],
  ["member", "Members"],
] as const;

export function MembersTab({ living }: { living: LivingCommunity }) {
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
    showToast(`${name} is now a mod.`, "success");
  };
  const demote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    setPromoted((p) => p.filter((k) => k !== key));
    showToast(`${name} is no longer a mod.`, "info");
  };
  const removeMember = (slug: string | undefined, name: string) => {
    setRemoved((p) => [...p, memberKey(slug, name)]);
    showToast(`${name} has been removed from the community.`, "info");
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
          placeholder="Search members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.chips}>
        {ROLE_FILTERS.map(([val, label]) => (
          <button
            key={val}
            type="button"
            className={[styles.chip, roleFilter === val && styles.chipOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setRoleFilter(val)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.secLbl}>
        Members <span className={styles.tabCount}>{manageable.length}</span>
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
                  <FiUserPlus aria-hidden /> Make mod
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
                  <FiX aria-hidden /> Remove mod
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
                  <FiX aria-hidden /> Remove
                </span>
              )}
              {m.role === "owner" && (
                <span className={styles.ownerTag}>
                  <FiShield aria-hidden /> Owner
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
  const { showToast } = useToast();
  const init = defaultSettings(living);
  const [name, setName] = useState(init.name);
  const [description, setDescription] = useState(init.description);
  const [mode, setMode] = useState(init.membershipMode);
  const [rules, setRules] = useState(init.rules);

  const MODES = [
    ["open", "Open"],
    ["request", "Request to join"],
    ["invite", "Invite only"],
  ] as const;

  const save = () => {
    showToast("Community settings saved.", "success");
  };

  const archive = () => {
    showToast("Community archived. Members have been notified.", "info");
  };

  const transfer = () => {
    showToast(
      "Ownership transfer initiated — the new owner will receive an invite.",
      "info",
    );
  };

  return (
    <div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel} htmlFor="mod-name">
          Community name
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
          Description
        </label>
        <input
          id="mod-desc"
          className={styles.settingsInput}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe what this community is about…"
        />
      </div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel}>Membership mode</label>
        <div className={styles.modeRow}>
          {MODES.map(([val, label]) => (
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
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel} htmlFor="mod-rules">
          Community rules
        </label>
        <textarea
          id="mod-rules"
          className={styles.rulesArea}
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="Enter rules, one per line…"
        />
      </div>
      <div className={styles.saveRow}>
        <Button variant="primary" onClick={save}>
          Save settings
        </Button>
      </div>

      <div className={styles.secLbl}>Danger zone</div>
      <div className={styles.dangerZone}>
        <div className={styles.danger}>Irreversible actions</div>
        <div className={styles.dangerRow}>
          <div className={styles.dangerInfo}>
            <div className={styles.dangerTitle}>Archive community</div>
            <div className={styles.dangerDesc}>
              Members keep their history but new posts are disabled.
            </div>
          </div>
          <Button variant="ghost" onClick={archive}>
            Archive
          </Button>
        </div>
        <div className={styles.dangerRow}>
          <div className={styles.dangerInfo}>
            <div className={styles.dangerTitle}>Transfer ownership</div>
            <div className={styles.dangerDesc}>
              Hand the community to another member. You'll lose owner
              permissions.
            </div>
          </div>
          <Button variant="ghost" onClick={transfer}>
            Transfer
          </Button>
        </div>
      </div>
    </div>
  );
}
