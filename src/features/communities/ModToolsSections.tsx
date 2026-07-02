import { FiCheck, FiX, FiFlag, FiUserPlus, FiShield } from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import type { LivingCommunity } from "./community.model";
import { photoOf } from "./communityPeople";
import { RoleBadge } from "./CommunityBadges";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

type JoinRequest = NonNullable<LivingCommunity["joinRequests"]>[number];
type Report = NonNullable<LivingCommunity["reports"]>[number];
type RosterMember = LivingCommunity["roster"][number];

function keyDownActivate(fn: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

export function ModJoinRequests({
  requests,
  onResolve,
}: {
  requests: JoinRequest[];
  onResolve: (id: string, name: string, approved: boolean) => void;
}) {
  return (
    <>
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
                onClick={() => onResolve(r.id, r.person.name, true)}
              >
                <FiCheck aria-hidden /> Approve
              </Button>
              <span
                role="button"
                tabIndex={0}
                className={styles.declineBtn}
                onClick={() => onResolve(r.id, r.person.name, false)}
                onKeyDown={keyDownActivate(() =>
                  onResolve(r.id, r.person.name, false),
                )}
              >
                <FiX aria-hidden /> Decline
              </span>
            </div>
          </div>
        ))
      )}
    </>
  );
}

export function ModReportedPosts({
  reports,
  onResolve,
}: {
  reports: Report[];
  onResolve: (id: string, removedPost: boolean) => void;
}) {
  return (
    <>
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
              <Button variant="primary" onClick={() => onResolve(rep.id, true)}>
                Remove post
              </Button>
              <span
                role="button"
                tabIndex={0}
                className={styles.declineBtn}
                onClick={() => onResolve(rep.id, false)}
                onKeyDown={keyDownActivate(() => onResolve(rep.id, false))}
              >
                Dismiss
              </span>
            </div>
          </div>
        ))
      )}
    </>
  );
}

export function ModMemberManagement({
  members,
  memberKey,
  promoted,
  onPromote,
  onRemove,
}: {
  members: RosterMember[];
  memberKey: (slug?: string, name?: string) => string;
  promoted: string[];
  onPromote: (slug: string | undefined, name: string) => void;
  onRemove: (slug: string | undefined, name: string) => void;
}) {
  return (
    <>
      <div className={detail.secLbl} style={{ marginTop: 32 }}>
        Members <span className={detail.tabCount}>{members.length}</span>
      </div>
      {members.map((m) => {
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
                  onClick={() => onPromote(m.slug, m.name)}
                  onKeyDown={keyDownActivate(() => onPromote(m.slug, m.name))}
                >
                  <FiUserPlus aria-hidden /> Make mod
                </span>
              )}
              {m.role !== "owner" && (
                <span
                  role="button"
                  tabIndex={0}
                  className={[styles.declineBtn, styles.removeBtn].join(" ")}
                  onClick={() => onRemove(m.slug, m.name)}
                  onKeyDown={keyDownActivate(() => onRemove(m.slug, m.name))}
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
    </>
  );
}
