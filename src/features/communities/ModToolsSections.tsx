import { FiCheck, FiX, FiFlag, FiUserPlus, FiShield } from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
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
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  return (
    <>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.joinRequests.label")}{" "}
        {requests.length > 0 && (
          <span className={detail.tabCount}>{requests.length}</span>
        )}
      </div>
      {requests.length === 0 ? (
        <EmptyState
          compact
          title={t("communities:detail.modtools.joinRequests.empty.title")}
          description={t(
            "communities:detail.modtools.joinRequests.empty.description",
          )}
        />
      ) : (
        requests.map((r) => (
          <div className={styles.modRow} key={r.id}>
            <Avatar
              initials={r.person.initials}
              tint={r.person.tint}
              src={photoOf(r.person, demoMode)}
              size={42}
              alt={r.person.name}
            />
            <div className={styles.modMain}>
              <div className={styles.modName}>
                {r.person.name}
                <MemberStaffBadge slug={r.person.slug} />
              </div>
              {r.note && <div className={styles.modNote}>“{r.note}”</div>}
              <div className={styles.modMeta}>
                {t("communities:detail.modtools.joinRequests.requestedAgo", {
                  time: r.time,
                })}
              </div>
            </div>
            <div className={styles.modActions}>
              <Button
                variant="jade"
                onClick={() => onResolve(r.id, r.person.name, true)}
              >
                <FiCheck aria-hidden />{" "}
                {t("communities:detail.modtools.joinRequests.approveCta")}
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
                <FiX aria-hidden />{" "}
                {t("communities:detail.modtools.joinRequests.declineCta")}
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
  const { t } = useTranslation();
  return (
    <>
      <div className={detail.secLbl} style={{ marginTop: 32 }}>
        {t("communities:detail.modtools.reports.label")}{" "}
        {reports.length > 0 && (
          <span className={detail.tabCount}>{reports.length}</span>
        )}
      </div>
      {reports.length === 0 ? (
        <EmptyState
          compact
          title={t("communities:detail.modtools.reports.empty.title")}
          description={t(
            "communities:detail.modtools.reports.empty.description",
          )}
        />
      ) : (
        reports.map((rep) => (
          <div className={styles.reportCard} key={rep.id}>
            <div className={styles.reportReason}>
              <FiFlag aria-hidden /> {rep.reason}
            </div>
            <p className={styles.reportExcerpt}>“{rep.postExcerpt}”</p>
            <div className={styles.modMeta}>
              {t("communities:detail.modtools.reports.meta", {
                author: rep.author.name,
                reporter: rep.reporter.name,
                time: rep.time,
              })}
            </div>
            <div className={styles.modActions} style={{ marginTop: 12 }}>
              <Button variant="primary" onClick={() => onResolve(rep.id, true)}>
                {t("communities:detail.modtools.reports.removeCta")}
              </Button>
              <span
                role="button"
                tabIndex={0}
                className={styles.declineBtn}
                onClick={() => onResolve(rep.id, false)}
                onKeyDown={keyDownActivate(() => onResolve(rep.id, false))}
              >
                {t("communities:detail.modtools.reports.dismissCta")}
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
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  return (
    <>
      <div className={detail.secLbl} style={{ marginTop: 32 }}>
        {t("communities:detail.modtools.members.label")}{" "}
        <span className={detail.tabCount}>{members.length}</span>
      </div>
      {members.map((m) => {
        const key = memberKey(m.slug, m.name);
        const isMod = m.role !== "member" || promoted.includes(key);
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
                {m.name}{" "}
                <RoleBadge role={promoted.includes(key) ? "mod" : m.role} />
                <MemberStaffBadge slug={m.slug} />
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
                  <FiUserPlus aria-hidden />{" "}
                  {t("communities:detail.modtools.members.makeModCta")}
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
                  <FiX aria-hidden />{" "}
                  {t("communities:detail.modtools.members.removeCta")}
                </span>
              )}
              {m.role === "owner" && (
                <span className={styles.ownerTag}>
                  <FiShield aria-hidden />{" "}
                  {t("communities:detail.modtools.members.ownerTag")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
