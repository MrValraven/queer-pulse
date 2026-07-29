import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { memberPath } from "../../features/forum/forumAuthor.helpers";
import {
  communityPath,
  topicPath,
  thread,
  businessPath,
} from "../../app/routeMap";
import { gatheringPath } from "../../features/gatherings/data";
import { parseMentions } from "./parseMentions";
import styles from "./MentionText.module.css";

/** Render a plain reply-body string, linkifying `@member`, `c/community`,
 *  `#topic`, `b/business`, `e/event`, and `t/thread` tokens. Stateless and
 *  lookup-free, so it behaves identically in demo and live — an unknown slug
 *  simply renders as a link that 404s gracefully. */
export function MentionText({
  text,
  renderText,
}: {
  text: string;
  renderText?: (value: string) => ReactNode;
}) {
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
        if (segment.kind === "topic") {
          return (
            <Link key={index} to={topicPath(segment.slug)} className={styles.mention}>
              #{segment.slug}
            </Link>
          );
        }
        if (segment.kind === "business") {
          return (
            <Link key={index} to={businessPath(segment.slug)} className={styles.mention}>
              b/{segment.slug}
            </Link>
          );
        }
        if (segment.kind === "event") {
          return (
            <Link key={index} to={gatheringPath(segment.slug)} className={styles.mention}>
              e/{segment.slug}
            </Link>
          );
        }
        if (segment.kind === "thread") {
          return (
            <Link key={index} to={thread(segment.slug)} className={styles.mention}>
              t/{segment.slug}
            </Link>
          );
        }
        return (
          <span key={index}>
            {renderText ? renderText(segment.value) : segment.value}
          </span>
        );
      })}
    </>
  );
}
