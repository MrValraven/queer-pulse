import { useState } from "react";
import { FiCheck, FiX, FiFlag, FiUserPlus, FiShield } from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import type { LivingCommunity } from "./community.model";
import { photoOf } from "./communityPeople";
import { RoleBadge } from "./CommunityBadges";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

export function ModToolsTab({ living }: { living: LivingCommunity }) {
  const { showToast } = useToast();
  const { approveRequest, promoteToMod } = useCommunityMembership();

  const [requests, setRequests] = useState(living.joinRequests ?? []);
  const [reports, setReports] = useState(living.reports ?? []);
  const [promoted, setPromoted] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

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
  const resolveReport = (id: string, removedPost: boolean) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(
      removedPost
        ? "Post removed. The author has been reached."
        : "Report dismissed.",
      removedPost ? "success" : "info",
    );
  };
  const memberKey = (slug?: string, name?: string) => slug ?? name ?? "";
  const promote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    setPromoted((p) => [...p, key]);
    promoteToMod(living.slug, key);
    showToast(`${name} is now a mod.`, "success");
  };
  const remove = (slug: string | undefined, name: string) => {
    setRemoved((p) => [...p, memberKey(slug, name)]);
    showToast(`${name} has been removed.`, "info");
  };

  const manageable = living.roster.filter(
    (m) => !removed.includes(memberKey(m.slug, m.name)),
  );

  return (
    <div>
      {/* Join requests */}
      <div className={detail.secLbl}>
        People asking to join{" "}
        {requests.length > 0 && (
          <span className={detail.tabCount}>{requests.length}</span>
        )}
      </div>
      {requests.length === 0 ? (
        <EmptyState
          compact
          title="No requests waiting"
          description="You're all caught up — new requests will appear here."
        />
      ) : (
        requests.map((r) => (
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
              {r.note && <div className={styles.modNote}>“{r.note}”</div>}
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

      {/* Reported posts */}
      <div className={detail.secLbl} style={{ marginTop: 32 }}>
        Reported posts{" "}
        {reports.length > 0 && (
          <span className={detail.tabCount}>{reports.length}</span>
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
            <p className={styles.reportExcerpt}>“{rep.postExcerpt}”</p>
            <div className={styles.modMeta}>
              From {rep.author.name} · flagged by {rep.reporter.name} ·{" "}
              {rep.time} ago
            </div>
            <div className={styles.modActions} style={{ marginTop: 12 }}>
              <Button
                variant="primary"
                onClick={() => resolveReport(rep.id, true)}
              >
                Remove post
              </Button>
              <span
                role="button"
                tabIndex={0}
                className={styles.declineBtn}
                onClick={() => resolveReport(rep.id, false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    resolveReport(rep.id, false);
                  }
                }}
              >
                Dismiss
              </span>
            </div>
          </div>
        ))
      )}

      {/* Member management */}
      <div className={detail.secLbl} style={{ marginTop: 32 }}>
        Members <span className={detail.tabCount}>{manageable.length}</span>
      </div>
      {manageable.map((m) => {
        const key = memberKey(m.slug, m.name);
        const isMod = m.role !== "member" || promoted.includes(key);
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
                {m.name}{" "}
                <RoleBadge role={promoted.includes(key) ? "mod" : m.role} />
              </div>
              {m.title && <div className={styles.modMeta}>{m.title}</div>}
            </div>
            <div className={styles.modActions}>
              {!isMod && m.role === "member" && (
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
              {m.role !== "owner" && (
                <span
                  role="button"
                  tabIndex={0}
                  className={[styles.declineBtn, styles.removeBtn].join(" ")}
                  onClick={() => remove(m.slug, m.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      remove(m.slug, m.name);
                    }
                  }}
                >
                  <FiX aria-hidden /> Remove from community
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
