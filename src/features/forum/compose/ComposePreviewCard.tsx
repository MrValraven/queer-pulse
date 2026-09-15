import { useId, useState } from "react";
import { FiEye, FiLink2, FiUsers } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { toPlainText } from "../../../shared/markdown";
import { ForumCategoryBadge } from "../ForumCategoryBadge";
import { ForumAvatar } from "../ForumAuthor";
import { CONTENT_WARNINGS } from "./composeWarnings.data";
import { firstLinkIn } from "./composeText";
import type {
  ComposeAudience,
  ComposePhoto,
  ComposePoll,
} from "./composeThread.types";
import styles from "./ComposePreviewCard.module.css";

// ── "How it will look" ──────────────────────────────────────────────────────
// The same card the forum list draws, built from the draft instead of from a
// published thread: category badge, content-warning pill, tags, title,
// excerpt, photos, poll, byline, audience.
//
// It is deliberately honest about what it does NOT know. A poll shows its
// options with empty bars and says there are no votes yet rather than
// inventing plausible percentages, and a link shows an unfurl PLACEHOLDER
// rather than a fabricated headline. A preview that guesses is a preview
// nobody can trust.

/** Longest excerpt the list shows before it cuts. */
const EXCERPT_MAX_LENGTH = 220;

/** The identity the byline draws. */
export interface ComposePreviewAuthor {
  name: string;
  /** Fallback when there is no photo. */
  initials: string;
  photo?: string;
}

export interface ComposePreviewCardProps {
  title: string;
  /** The body in markdown-lite; the excerpt is cut from its plain text. */
  body: string;
  category: string | null;
  tags: readonly string[];
  /** Ids from `CONTENT_WARNINGS`. */
  contentWarnings: readonly string[];
  photos: readonly ComposePhoto[];
  poll: ComposePoll | null;
  /** Publishing under the QueerPulse Official byline. */
  isOfficial: boolean;
  /** Publishing without the author's name. */
  isAnonymous: boolean;
  author: ComposePreviewAuthor;
  /** The second name on the byline, already resolved. */
  coAuthorName?: string;
  /** The community this posts inside, or null for the town square. */
  community: ComposeAudience | null;
  isCrossPosted: boolean;
  className?: string;
}

export function ComposePreviewCard({
  title,
  body,
  category,
  tags,
  contentWarnings,
  photos,
  poll,
  isOfficial,
  isAnonymous,
  author,
  coAuthorName,
  community,
  isCrossPosted,
  className,
}: ComposePreviewCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const excerptId = useId();
  const [isWarningRevealed, setWarningRevealed] = useState(false);

  const excerpt = toPlainText(body).slice(0, EXCERPT_MAX_LENGTH);
  // Only a written excerpt is covered. Blurring the placeholder would hide a
  // sentence explaining what the excerpt is, which helps nobody.
  const hasCoverableExcerpt = contentWarnings.length > 0 && excerpt.length > 0;
  const isExcerptCovered = hasCoverableExcerpt && !isWarningRevealed;
  const linkHost = hostOf(firstLinkIn(body));

  return (
    <section
      className={[styles.block, className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <h2 className={styles.heading} id={headingId}>
        {t("forum:composePage.preview.heading")}
      </h2>

      <article className={styles.card}>
        <PreviewBadges
          category={category}
          tags={tags}
          contentWarnings={contentWarnings}
          translate={t}
        />

        <p className={[styles.title, !title && styles.placeholder].join(" ")}>
          {title || t("forum:composePage.preview.titlePlaceholder")}
        </p>

        <p
          id={excerptId}
          aria-hidden={isExcerptCovered}
          className={[
            styles.excerpt,
            !excerpt && styles.placeholder,
            isExcerptCovered && styles.excerptCovered,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {excerpt || t("forum:composePage.preview.excerptPlaceholder")}
        </p>

        {hasCoverableExcerpt && (
          <button
            type="button"
            className={styles.reveal}
            aria-expanded={isWarningRevealed}
            aria-controls={excerptId}
            onClick={() => setWarningRevealed((wasRevealed) => !wasRevealed)}
          >
            {t(
              isWarningRevealed
                ? "forum:composePage.preview.hideAgain"
                : "forum:composePage.preview.showAnyway",
            )}
          </button>
        )}

        {photos.length > 0 && (
          <ul className={styles.photos}>
            {photos.map((photo) => (
              <li key={photo.key} className={styles.photo}>
                <img src={photo.previewUrl} alt={photo.alt} />
              </li>
            ))}
          </ul>
        )}

        {poll && <PreviewPoll poll={poll} translate={t} />}

        <PreviewByline
          isOfficial={isOfficial}
          isAnonymous={isAnonymous}
          author={author}
          coAuthorName={coAuthorName}
          translate={t}
          replyCount={format.number(0)}
        />

        <p className={styles.audience}>
          <FiUsers aria-hidden="true" />
          {audienceLine(community, isCrossPosted, t, format.number)}
        </p>
      </article>

      {linkHost && <LinkUnfurlPlaceholder host={linkHost} translate={t} />}
    </section>
  );
}

function PreviewBadges({
  category,
  tags,
  contentWarnings,
  translate,
}: {
  category: string | null;
  tags: readonly string[];
  contentWarnings: readonly string[];
  translate: TFunction;
}) {
  if (!category && tags.length === 0 && contentWarnings.length === 0)
    return null;
  const warningLabels = contentWarnings
    .map(
      (id) =>
        CONTENT_WARNINGS.find((warning) => warning.id === id)?.labelKey ?? null,
    )
    .filter((labelKey): labelKey is string => labelKey !== null)
    .map((labelKey) => translate(labelKey));
  return (
    <div className={styles.badges}>
      {category && <ForumCategoryBadge category={category} />}
      {warningLabels.length > 0 && (
        <span className={styles.warningPill}>
          <FiEye aria-hidden="true" />
          {translate("forum:composePage.preview.contentWarningPill", {
            warnings: warningLabels.join(", "),
          })}
        </span>
      )}
      {tags.map((tag) => (
        <span key={tag} className={styles.tag}>
          #{tag}
        </span>
      ))}
    </div>
  );
}

function PreviewPoll({
  poll,
  translate,
}: {
  poll: ComposePoll;
  translate: TFunction;
}) {
  const options = poll.options.filter((option) => option.trim().length > 0);
  if (options.length === 0) return null;
  return (
    <div className={styles.poll}>
      {options.map((option, optionIndex) => (
        <p key={`${optionIndex}-${option}`} className={styles.pollBar}>
          <span>{option}</span>
        </p>
      ))}
      <p className={styles.pollNote}>
        {translate(
          poll.allowMultiple
            ? "forum:composePage.preview.pollPickMany"
            : "forum:composePage.preview.pollPickOne",
        )}
        <span className={styles.metaDot} aria-hidden="true" />
        {translate("forum:composePage.preview.pollNoVotes")}
      </p>
    </div>
  );
}

function PreviewByline({
  isOfficial,
  isAnonymous,
  author,
  coAuthorName,
  translate,
  replyCount,
}: {
  isOfficial: boolean;
  isAnonymous: boolean;
  author: ComposePreviewAuthor;
  coAuthorName?: string;
  translate: TFunction;
  replyCount: string;
}) {
  // Official and anonymous are mutually exclusive, and the hook's setters are
  // what enforce that; this only reflects whichever one is set.
  const anonymousName = translate("forum:composePage.preview.anonymousName");
  const person = isOfficial
    ? {
        // The institutional account wears the brand mark, so `ForumAvatar`
        // never reaches for initials here.
        initials: "",
        name: translate("forum:composePage.preview.officialName"),
        official: true,
      }
    : isAnonymous
      ? { initials: anonymousName.slice(0, 1), name: anonymousName }
      : { initials: author.initials, name: author.name, photo: author.photo };
  return (
    <p className={styles.byline}>
      <ForumAvatar className={styles.bylineAvatar} person={person} />
      <span className={styles.bylineName}>{person.name}</span>
      {isOfficial && (
        <span className={styles.bylineVia}>
          {translate("forum:composePage.preview.officialVia", {
            name: author.name,
          })}
        </span>
      )}
      {!isOfficial && !isAnonymous && coAuthorName && (
        <span className={styles.bylineVia}>
          {translate("forum:composePage.preview.withCoAuthor", {
            name: coAuthorName,
          })}
        </span>
      )}
      <span className={styles.metaDot} aria-hidden="true" />
      <span>{translate("forum:time.justNow")}</span>
      <span className={styles.metaDot} aria-hidden="true" />
      <span>
        {translate("forum:repliesCount", { count: 0, formatted: replyCount })}
      </span>
    </p>
  );
}

function LinkUnfurlPlaceholder({
  host,
  translate,
}: {
  host: string;
  translate: TFunction;
}) {
  return (
    <div className={styles.unfurl}>
      <div className={styles.unfurlThumb} aria-hidden="true" />
      <div className={styles.unfurlBody}>
        <span className={styles.unfurlHost}>
          <FiLink2 aria-hidden="true" />
          {host}
        </span>
        <span className={styles.unfurlNote}>
          {translate("forum:composePage.preview.linkUnfurlPlaceholder")}
        </span>
      </div>
    </div>
  );
}

/** The hostname of the first link in the body, without `www.`, or null. */
function hostOf(link: string | null): string | null {
  if (!link) return null;
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Who will be able to read this, said the way the published card says it. */
function audienceLine(
  community: ComposeAudience | null,
  isCrossPosted: boolean,
  translate: TFunction,
  formatNumber: (value: number) => string,
): string {
  if (!community) return translate("forum:composePage.preview.seenByEveryone");
  if (isCrossPosted)
    return translate("forum:composePage.preview.seenByEveryoneAndCommunity", {
      community: community.name,
    });
  if (community.memberCount === undefined)
    return translate("forum:composePage.preview.seenByCommunity", {
      community: community.name,
    });
  return translate("forum:composePage.preview.seenByCommunityMembers", {
    count: community.memberCount,
    formatted: formatNumber(community.memberCount),
    community: community.name,
  });
}
