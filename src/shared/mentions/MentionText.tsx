import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { memberPath } from "../../features/forum/forumAuthor.helpers";
import {
  communityPath,
  topicPath,
  thread,
  businessPath,
} from "../../app/routeMap";
import { gatheringPath } from "../../features/gatherings/gatheringPaths";
import { parseMentions, type MentionSegment } from "./parseMentions";
import { mentionNameKey } from "./mentionNameKey";
import { useIsMemberMentionInert } from "./MentionLinkPolicyContext";
import {
  isMentionRefKnownUnresolved,
  useMentionNameAuthority,
  useMentionNameMap,
} from "./MentionNamesContext";
import { useTranslation } from "../i18n/useTranslation";
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

/** The placeholder for a member mention a matched Go together chat cannot
 *  name. Its own component, so `MentionText` reads the i18n context only
 *  inside such a chat. */
function UnnamedMemberMention() {
  const { t } = useTranslation();
  return <>{t("messages:mention.member")}</>;
}

/** Render a plain reply/message body, linkifying `@member`, `c/community`,
 *  `#topic`, `b/business`, `e/event`, and `t/thread` tokens.
 *
 *  When a MentionNamesProvider is present (e.g. the messages view), a resolvable
 *  mention shows the target's display name with no sigil, and the underlying
 *  `sigil+slug` becomes the link's `title` so same-named targets stay
 *  distinguishable on hover. Topics always keep their `#tag`. Without a provider
 *  or when a slug can't be resolved it renders `sigil+slug` exactly as
 *  before, so it stays lookup-free and 404s gracefully on unknown slugs.
 *
 *  A non-topic mention the name map vouches for as unresolved
 *  (`ResolvedMentionNamesProvider` once a lookup that asked about it settled,
 *  or demo mode) points at nothing, for example a half-typed `b/caf`, and
 *  renders as plain text: `sigil+slug`, no link, no mention styling, no title.
 *  Topics always link.
 *
 *  `linkify={false}` keeps every mention's styling but renders it as inert
 *  text. The public profile and persona pages pass `loggedIn` here: those two
 *  are the only mention surfaces reachable signed out, and almost everything a
 *  bio can point at (`/members/*`, `/communities/*`) sits behind the auth gate,
 *  so a visitor following one would land on a wall where the person or
 *  place named should be. Auth is read at those call sites and this
 *  renderer stays a pure function of its props. */
export function MentionText({
  text,
  renderText,
  linkify = true,
}: {
  text: string;
  renderText?: (value: string) => ReactNode;
  linkify?: boolean;
}) {
  const nameMap = useMentionNameMap();
  const isMemberMentionInert = useIsMemberMentionInert();
  const nameAuthority = useMentionNameAuthority();
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
        const refKey = mentionNameKey(segment.kind, segment.slug);
        const resolvedName =
          segment.kind === "topic" ? undefined : nameMap.get(refKey);
        const label = resolvedName ?? sigilSlug;
        const title = resolvedName ? sigilSlug : undefined;
        // PRD-423: a matched Go together chat names a member by first name
        // and links to no profile; the hover title would hand over the slug.
        // A handle can carry a surname, so a member the chat cannot name yet
        // (lookup pending or failed, or someone outside the roster) reads as
        // a neutral "@member" and the slug stays out of the page.
        if (isMemberMentionInert && segment.kind === "member") {
          return (
            <span
              key={index}
              className={`${styles.mentionFlat} ${styles.mentionInert}`}
            >
              {resolvedName ?? <UnnamedMemberMention />}
            </span>
          );
        }
        if (
          segment.kind !== "topic" &&
          !resolvedName &&
          isMentionRefKnownUnresolved(nameAuthority, refKey)
        ) {
          return <span key={index}>{sigilSlug}</span>;
        }
        if (!linkify) {
          return (
            <span key={index} className={styles.mentionFlat} title={title}>
              {label}
            </span>
          );
        }
        return (
          <Link
            key={index}
            to={config.to(segment.slug)}
            className={styles.mention}
            title={title}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
