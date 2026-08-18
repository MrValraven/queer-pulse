import { FiCheck, FiX, FiFlag, FiUserPlus, FiUserMinus, FiShield } from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { REASON_LABEL_KEYS } from "../safety/reportReasons";
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
  onRemove,
  onDismiss,
}: {
  reports: Report[];
  onRemove: (report: Report) => void;
  onDismiss: (report: Report) => void;
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
        reports.map((rep) => {
          // Demo mocks author a free-text `reason`; live rows only carry a
          // stable `reasonCode` (the leaner `GET /communities/:slug/reports`
          // shape), resolved to a label here.
          const reasonLabel =
            rep.reason ?? (rep.reasonCode ? t(REASON_LABEL_KEYS[rep.reasonCode]) : "");
          // "Remove" deletes a post by id — this queue has no parent-post id
          // for a reply report, so that action only wires up for posts.
          const canRemove = rep.subjectType == null || rep.subjectType === "post";
          return (
            <div className={styles.reportCard} key={rep.id}>
              <div className={styles.reportReason}>
                <FiFlag aria-hidden /> {reasonLabel}
              </div>
              {rep.postExcerpt && (
                <p className={styles.reportExcerpt}>“{rep.postExcerpt}”</p>
              )}
              <div className={styles.modMeta}>
                {rep.author && rep.reporter
                  ? t("communities:detail.modtools.reports.meta", {
                      author: rep.author.name,
                      reporter: rep.reporter.name,
                      time: rep.time,
                    })
                  : t("communities:detail.modtools.reports.metaLive", {
                      time: rep.time,
                    })}
              </div>
              {!canRemove && (
                <p className={styles.modMeta}>
                  {t("communities:detail.modtools.reports.replyNote")}
                </p>
              )}
              <div className={styles.modActions} style={{ marginTop: 12 }}>
                {canRemove && (
                  <Button variant="primary" onClick={() => onRemove(rep)}>
                    {t("communities:detail.modtools.reports.removeCta")}
                  </Button>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.declineBtn}
                  onClick={() => onDismiss(rep)}
                  onKeyDown={keyDownActivate(() => onDismiss(rep))}
                >
                  {t("communities:detail.modtools.reports.dismissCta")}
                </span>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}

export function ModMemberManagement({
  members,
  memberKey,
  promoted,
  demoted,
  onPromote,
  onDemote,
  onRemove,
}: {
  members: RosterMember[];
  memberKey: (slug?: string, name?: string) => string;
  promoted: string[];
  demoted: string[];
  onPromote: (slug: string | undefined, name: string) => void;
  onDemote: (slug: string | undefined, name: string) => void;
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
        const isOwner = m.role === "owner";
        const isMod =
          !isOwner &&
          !demoted.includes(key) &&
          (m.role === "mod" || promoted.includes(key));
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
                <RoleBadge role={isOwner ? "owner" : isMod ? "mod" : "member"} />
                <MemberStaffBadge slug={m.slug} />
              </div>
              {m.title && <div className={styles.modMeta}>{m.title}</div>}
            </div>
            <div className={styles.modActions}>
              {!isOwner && !isMod && (
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
              {!isOwner && isMod && (
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.declineBtn}
                  onClick={() => onDemote(m.slug, m.name)}
                  onKeyDown={keyDownActivate(() => onDemote(m.slug, m.name))}
                >
                  <FiUserMinus aria-hidden />{" "}
                  {t("communities:detail.modtools.members.demoteCta")}
                </span>
              )}
              {!isOwner && (
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
              {isOwner && (
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
