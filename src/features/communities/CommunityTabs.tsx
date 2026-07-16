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
import { routes } from "../../app/routeMap";
import type {
  CommunityDetail,
  Person,
  Thread as ThreadData,
} from "./communityDetails";
import { CommunityThread } from "./CommunityThread";
import { AV_CLASS } from "./communityAvatar";
import styles from "./CommunityDetailPage.module.css";

const GATHERING = routes.gathering;
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

      <div className={styles.secLbl}>{t("communities:detail.about.whoFor")}</div>
      {detail.whoFor.map((w) => (
        <div className={styles.bullet} key={w}>
          <div className={styles.bulletDot} />
          <span>{w}</span>
        </div>
      ))}

      <div className={styles.secLbl}>
        {t("communities:detail.about.upcomingGathering")}
      </div>
      <Link to={GATHERING} className={styles.gCard}>
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
          : members.map((m, i) => (
              <FadeIn
                as={Link}
                to={MEMBER}
                className={styles.mCard}
                key={i}
                delay={Math.min(i, 8) * 60}
              >
                <div className={[styles.mAv, AV_CLASS[m.tint]].join(" ")}>
                  {m.initials}
                </div>
                <div className={styles.mName}>{m.name}</div>
                <div className={styles.mRole}>{m.role}</div>
              </FadeIn>
            ))}
      </div>
      {!loading && (
        <p className={styles.showing}>
          {hasCount
            ? t("communities:detail.members.showingOf", {
                shown: 8,
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
  loading = false,
}: {
  threads: ThreadData[];
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [newPost, setNewPost] = useState("");
  const [extraThreads, setExtraThreads] = useState<ThreadData[]>([]);

  const post = () => {
    const text = newPost.trim();
    if (!text) return;
    const title = text.length > 70 ? `${text.slice(0, 67)}…` : text;
    setExtraThreads((prev) => [
      {
        votes: 1,
        title,
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
  };

  if (loading) {
    return (
      <div aria-busy="true">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
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
      {extraThreads.map((t, i) => (
        <CommunityThread data={t} key={`x${i}`} />
      ))}
      {threads.map((t, i) => (
        <FadeIn key={i} delay={Math.min(i, 8) * 60}>
          <CommunityThread data={t} />
        </FadeIn>
      ))}
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
          placeholder={t("communities:detail.forum.newPostPlaceholder")}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <Button
          variant="ghost"
          onClick={post}
          style={{ whiteSpace: "nowrap", fontSize: 13 }}
        >
          {t("communities:detail.forum.postCta")}
        </Button>
      </div>
    </div>
  );
}
