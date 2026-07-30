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
import { parseMentions, type MentionSegment } from "./parseMentions";
import { mentionNameKey, useMentionNameMap } from "./MentionNames";
import styles from "./MentionText.module.css";

type MentionKind = Exclude<MentionSegment["kind"], "text">;

/** Per-kind sigil (the visible marker in the raw text) and route builder. */
const MENTION_CONFIG: Record<
  MentionKind,
  { sigil: string; to: (slug: string) => string }
> = {
  member: { sigil: "@", to: memberPath },
  community: { sigil: "c/", to: communityPath },
  topic: { sigil: "#", to: topicPath },
  business: { sigil: "b/", to: businessPath },
  event: { sigil: "e/", to: gatheringPath },
  thread: { sigil: "t/", to: thread },
};

/** Render a plain reply/message body, linkifying `@member`, `c/community`,
 *  `#topic`, `b/business`, `e/event`, and `t/thread` tokens.
 *
 *  When a MentionNamesProvider is present (e.g. the messages view), a resolvable
 *  mention shows the target's display name with no sigil, and the underlying
 *  `sigil+slug` becomes the link's `title` so same-named targets stay
 *  distinguishable on hover. Topics always keep their `#tag`. Without a provider
 *  — or when a slug can't be resolved — it renders `sigil+slug` exactly as
 *  before, so it stays lookup-free and 404s gracefully on unknown slugs. */
export function MentionText({
  text,
  renderText,
}: {
  text: string;
  renderText?: (value: string) => ReactNode;
}) {
  const nameMap = useMentionNameMap();
  const segments = parseMentions(text);
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.kind === "text") {
          return (
            <span key={index}>
              {renderText ? renderText(segment.value) : segment.value}
            </span>
          );
        }
        const config = MENTION_CONFIG[segment.kind];
        const sigilSlug = `${config.sigil}${segment.slug}`;
        // Topics keep their #tag; every other kind resolves to a name if known.
        const resolvedName =
          segment.kind === "topic"
            ? undefined
            : nameMap.get(mentionNameKey(segment.kind, segment.slug));
        return (
          <Link
            key={index}
            to={config.to(segment.slug)}
            className={styles.mention}
            title={resolvedName ? sigilSlug : undefined}
          >
            {resolvedName ?? sigilSlug}
          </Link>
        );
      })}
    </>
  );
}
