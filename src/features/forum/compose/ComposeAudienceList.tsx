import { useId, useMemo } from "react";
import { FiGlobe, FiLock, FiUsers } from "react-icons/fi";
import { Avatar } from "../../../shared/components/ui";
import { useRovingRadioGroup } from "../../../shared/hooks/useRovingRadioGroup";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ComposeAudience } from "./composeThread.types";
import styles from "./ComposeAudienceList.module.css";

// ── "Who sees it?" ──────────────────────────────────────────────────────────
// The town square plus the communities this member belongs to, as a real
// radiogroup: one tab stop, arrows move focus and selection.
//
// The town square is NOT passed in. `useComposeThreadPage` takes the member's
// communities and nothing else, because the town square is the empty slug and
// needs no record behind it; the row for it is UI copy, so it is built here.
// It leads the list because it is the default and, for most posts, the right
// answer.

/** The slug the town square is stored as. */
const TOWN_SQUARE_SLUG = "";

export interface ComposeAudienceListProps {
  /** The member's own communities, town square excluded. */
  communities: readonly ComposeAudience[];
  /** The chosen audience's slug. `""` is the town square. */
  communitySlug: string;
  onChangeCommunitySlug: (communitySlug: string) => void;
  /** Also surface a community post in the town square. */
  crossPost: boolean;
  onChangeCrossPost: (crossPost: boolean) => void;
}

export function ComposeAudienceList({
  communities,
  communitySlug,
  onChangeCommunitySlug,
  crossPost,
  onChangeCrossPost,
}: ComposeAudienceListProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const hintId = useId();
  const crossPostHintId = useId();

  const slugs = useMemo(
    () => [TOWN_SQUARE_SLUG, ...communities.map((one) => one.slug)],
    [communities],
  );
  const { getRadioProps } = useRovingRadioGroup<HTMLButtonElement>({
    optionCount: slugs.length,
    checkedIndex: Math.max(0, slugs.indexOf(communitySlug)),
    onSelect: (index) => {
      const nextSlug = slugs[index];
      if (nextSlug !== undefined) onChangeCommunitySlug(nextSlug);
    },
  });

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h2 id={headingId} className={styles.title}>
          {t("forum:composePage.section.audience.title")}
        </h2>
        <p id={hintId} className={styles.hint}>
          {t("forum:composePage.section.audience.hint")}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-describedby={hintId}
        className={styles.list}
      >
        <button
          {...getRadioProps(0)}
          type="button"
          role="radio"
          aria-checked={communitySlug === TOWN_SQUARE_SLUG}
          className={styles.row}
          onClick={() => onChangeCommunitySlug(TOWN_SQUARE_SLUG)}
        >
          <span className={styles.radioDot} aria-hidden />
          <span className={styles.townSquareMark} aria-hidden>
            <FiGlobe />
          </span>
          <span className={styles.rowText}>
            <span className={styles.rowName}>
              {t("forum:composePage.audience.townSquare")}
            </span>
            <span className={styles.rowSub}>
              {t("forum:composePage.audience.townSquareSub")}
            </span>
          </span>
        </button>

        {communities.map((audience, position) => (
          <AudienceRow
            key={audience.slug}
            audience={audience}
            isChecked={audience.slug === communitySlug}
            radioProps={getRadioProps(position + 1)}
            onSelect={onChangeCommunitySlug}
          />
        ))}
      </div>

      {/* Cross-posting is meaningless from the town square, so the row only
          exists once a community is chosen. `setCommunitySlug` clears the flag
          on the way back out, so nothing stale can ride along on publish. */}
      {communitySlug !== TOWN_SQUARE_SLUG && (
        <div className={styles.crossPost}>
          <label className={styles.crossPostLabel}>
            <input
              type="checkbox"
              className={styles.crossPostBox}
              checked={crossPost}
              onChange={(event) => onChangeCrossPost(event.target.checked)}
              aria-describedby={crossPostHintId}
            />
            <span>{t("forum:composePage.audience.crossPost")}</span>
          </label>
          <p id={crossPostHintId} className={styles.crossPostHint}>
            {t("forum:composePage.audience.crossPostHint")}
          </p>
        </div>
      )}
    </section>
  );
}

interface AudienceRowProps {
  audience: ComposeAudience;
  isChecked: boolean;
  radioProps: ReturnType<
    ReturnType<typeof useRovingRadioGroup<HTMLButtonElement>>["getRadioProps"]
  >;
  onSelect: (communitySlug: string) => void;
}

function AudienceRow({
  audience,
  isChecked,
  radioProps,
  onSelect,
}: AudienceRowProps) {
  const { t } = useTranslation();
  return (
    <button
      {...radioProps}
      type="button"
      role="radio"
      aria-checked={isChecked}
      className={styles.row}
      onClick={() => onSelect(audience.slug)}
    >
      <span className={styles.radioDot} aria-hidden />
      <Avatar initials={initialsOf(audience.name)} size={32} tint="plum" />
      <span className={styles.rowText}>
        <span className={styles.rowName}>
          {audience.name}
          {audience.isPrivate && (
            <span className={styles.privateTag}>
              <FiLock aria-hidden />
              {t("forum:composePage.audience.private")}
            </span>
          )}
        </span>
        <span className={styles.rowSub}>
          {t(
            audience.isPrivate
              ? "forum:composePage.audience.privateSub"
              : "forum:composePage.audience.openSub",
          )}
        </span>
      </span>
      {audience.memberCount !== undefined && (
        <span className={styles.memberCount}>
          <FiUsers aria-hidden />
          {t("forum:composePage.audience.memberCount", {
            count: audience.memberCount,
          })}
        </span>
      )}
    </button>
  );
}

/**
 * Up to two initials from a community's own name. Member-authored text, so it
 * is read defensively: a one-word name gives one letter, and a name that is
 * all punctuation gives none rather than throwing.
 */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
