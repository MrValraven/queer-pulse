import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  FadeIn,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";
import type {
  CommunityDetail,
  Person,
  Thread as ThreadData,
} from "./communityDetails";
import { CommunityThread } from "./CommunityThread";
import { photoOf } from "./communityPeople";
import { AV_CLASS } from "./communityAvatar";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useCreatePost } from "./api/useCommunityMutations";
import type { PulsePaging } from "./api/useCommunityPosts";
import styles from "./CommunityDetailPage.module.css";

const GATHERING = routes.gatherings;
const MEMBER = routes.members;

export function AboutTab({ detail }: { detail: CommunityDetail }) {
  const { t } = useTranslation();
  return (
    <div>
      {detail.about.map((p, i) => (
        <p className={styles.aboutP} key={i}>
          {p}
        </p>
      ))}

      <div className={styles.secLbl}>
        {t("communities:detail.about.whoFor")}
      </div>
      {detail.whoFor.map((w) => (
        <div className={styles.bullet} key={w}>
          <div className={styles.bulletDot} />
          <span>{w}</span>
        </div>
      ))}

      <div className={styles.secLbl}>
        {t("communities:detail.about.upcomingGathering")}
      </div>
      <Link
        to={
          detail.nextEvent.slug
            ? gatheringPath(detail.nextEvent.slug)
            : GATHERING
        }
        className={styles.gCard}
      >
        <div className={styles.gDate}>
          <div className={styles.gDd}>{detail.nextEvent.dd}</div>
          <div className={styles.gDm}>{detail.nextEvent.mm}</div>
        </div>
        <div>
          <div className={styles.gTitle}>{detail.nextEvent.title}</div>
          <div className={styles.gMeta}>
            {detail.nextEvent.meta} · {detail.nextEvent.spots}
          </div>
        </div>
      </Link>

      <div className={styles.tagRow}>
        {detail.tags.map((t) => (
          <span className={styles.tag} key={t}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MembersTab({
  members,
  hasCount,
  memberNum,
  loading = false,
}: {
  members: Person[];
  hasCount: boolean;
  memberNum: number;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  return (
    <div>
      <div className={styles.memberGrid} aria-busy={loading}>
        {loading
          ? Array.from({ length: members.length || 8 }).map((_, i) => (
              <div className={styles.mCard} key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <SkeletonAvatar size={48} />
                </div>
                <SkeletonLine
                  height={12}
                  width="70%"
                  style={{ margin: "0 auto 6px" }}
                />
                <SkeletonLine
                  height={10}
                  width="50%"
                  style={{ margin: "0 auto" }}
                />
              </div>
            ))
          : members.map((member, memberIndex) => {
              const photo = photoOf(member, demoMode);
              return (
                <FadeIn
                  as={Link}
                  to={MEMBER}
                  className={styles.mCard}
                  key={member.slug ?? `${member.name}-${member.initials}`}
                  delay={Math.min(memberIndex, 8) * 60}
                >
                  <div
                    className={[styles.mAv, AV_CLASS[member.tint]].join(" ")}
                  >
                    {photo ? (
                      <img
                        src={resolveAvatarSrc(photo)}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      member.initials
                    )}
                  </div>
                  <div className={styles.mName}>{member.name}</div>
                  <div className={styles.mRole}>{member.role}</div>
                </FadeIn>
              );
            })}
      </div>
      {!loading && (
        <p className={styles.showing}>
          {hasCount
            ? t("communities:detail.members.showingOf", {
                shown: members.length,
                count: memberNum,
              })
            : t("communities:detail.members.showingCore")}
        </p>
      )}
    </div>
  );
}

export function ForumTab({
  threads,
  slug,
  isMember,
  loading = false,
  paging,
}: {
  threads: ThreadData[];
  slug: string;
  isMember: boolean;
  loading?: boolean;
  paging: PulsePaging;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const createPost = useCreatePost(slug);
  const [newPost, setNewPost] = useState("");
  const [extraThreads, setExtraThreads] = useState<ThreadData[]>([]);

  const post = () => {
    const text = newPost.trim();
    if (!text) return;
    const heading = text.length > 70 ? `${text.slice(0, 67)}…` : text;
    setExtraThreads((prev) => [
      {
        id: crypto.randomUUID(),
        votes: 0,
        title: heading,
        author: { initials: "Me", name: "You", tint: "plum" },
        time: t("communities:common.justNow"),
        replyCount: 0,
        post: text,
        replies: [],
      },
      ...prev,
    ]);
    setNewPost("");
    showToast(t("communities:detail.forum.postedToast"), "success");
    if (demoMode) return;
    createPost.mutate(
      { body: text },
      {
        onSuccess: () => setExtraThreads([]),
        onError: () => showToast(t("communities:common.error"), "error"),
      },
    );
  };

  if (loading) {
    return (
      <div aria-busy="true">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className={styles.mCard}
            style={{ textAlign: "left", marginBottom: 14, padding: 18 }}
          >
            <SkeletonLine
              height={16}
              width="55%"
              style={{ marginBottom: 12 }}
            />
            <SkeletonLine height={12} style={{ marginBottom: 6 }} />
            <SkeletonLine height={12} width="80%" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {extraThreads.map((thread, index) => (
        <CommunityThread
          data={thread}
          slug={slug}
          key={thread.id ?? `local-${index}`}
        />
      ))}
      {threads.map((thread, index) => (
        <FadeIn
          key={thread.id ?? `thread-${index}`}
          delay={Math.min(index, 8) * 60}
        >
          <CommunityThread data={thread} slug={slug} />
        </FadeIn>
      ))}
      {paging.hasNextPage && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Button
            variant="ghost"
            disabled={paging.isFetchingNextPage}
            onClick={paging.fetchNextPage}
          >
            {paging.isFetchingNextPage
              ? t("communities:common.loading")
              : t("communities:detail.discussion.loadMore")}
          </Button>
        </div>
      )}
      {isMember && (
        <div className={styles.newPost}>
          <div
            className={[styles.rAv, styles.tPlum].join(" ")}
            style={{ width: 30, height: 30 }}
          >
            Me
          </div>
          <textarea
            className={styles.npTa}
            rows={1}
            aria-label={t("communities:detail.forum.newPostPlaceholder")}
            placeholder={t("communities:detail.forum.newPostPlaceholder")}
            value={newPost}
            onChange={(event) => setNewPost(event.target.value)}
          />
          <Button
            variant="ghost"
            onClick={post}
            style={{ whiteSpace: "nowrap", fontSize: 13 }}
          >
            {t("communities:detail.forum.postCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
