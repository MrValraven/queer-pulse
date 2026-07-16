import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import type { PostKind, TopicPost } from "./topics.data";
import styles from "./TopicPage.module.css";

const KIND_LABEL_KEY: Record<PostKind, string> = {
  asking: "topics:postKind.asking",
  recommend: "topics:postKind.recommend",
  warn: "topics:postKind.warn",
  article: "topics:postKind.article",
  event: "topics:postKind.event",
  thread: "topics:postKind.thread",
};

// CSS-module class map — not copy, exempt from translation.
const KIND_CLASS: Partial<Record<PostKind, string>> = {
  event: styles.kindEvent,
  article: styles.kindArticle,
  warn: styles.kindWarn,
};

export function TopicPostCard({
  post,
  topicTag,
}: {
  post: TopicPost;
  topicTag: string;
}) {
  const { t } = useTranslation();
  const kindClass = [styles.kind, KIND_CLASS[post.kind]]
    .filter(Boolean)
    .join(" ");
  return (
    <Link to={linkToPath(post.href)} className={styles.post}>
      <div className={styles.postHead}>
        <Avatar initials={post.initials} tint={post.tone} size={32} />
        <div>
          <div className={styles.postName}>{post.author}</div>
          <div className={styles.postMeta}>{post.meta}</div>
        </div>
        <span className={kindClass}>{t(KIND_LABEL_KEY[post.kind])}</span>
      </div>
      <div className={styles.postTitle}>{post.title}</div>
      <div className={styles.postBody}>{post.body}</div>
      <div className={styles.postFoot}>
        <span>{post.stats}</span>
        <div className={styles.postTags}>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className={[
                styles.postTag,
                tag === topicTag && styles.postTagMatch,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
