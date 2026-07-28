import { Link } from "react-router-dom";
import { memberPath } from "../../features/forum/ForumAuthor";
import { communityPath } from "../../app/routeMap";
import { parseMentions } from "./parseMentions";
import styles from "./MentionText.module.css";

/** Render a plain reply-body string, linkifying `@member` and `c/community`
 *  tokens. Stateless and lookup-free, so it behaves identically in demo and
 *  live — an unknown slug simply renders as a link that 404s gracefully. */
export function MentionText({ text }: { text: string }) {
  const segments = parseMentions(text);
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.kind === "member") {
          return (
            <Link
              key={index}
              to={memberPath(segment.slug)}
              className={styles.mention}
            >
              @{segment.slug}
            </Link>
          );
        }
        if (segment.kind === "community") {
          return (
            <Link
              key={index}
              to={communityPath(segment.slug)}
              className={styles.mention}
            >
              c/{segment.slug}
            </Link>
          );
        }
        return <span key={index}>{segment.value}</span>;
      })}
    </>
  );
}
