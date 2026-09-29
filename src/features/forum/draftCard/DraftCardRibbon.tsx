import { useId } from "react";
import { FiArrowRight, FiEdit3 } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import type { ForumDraftCardDetails } from "../useForumThreadDraftPreview";
import { DraftCardRibbonFacts } from "./DraftCardRibbonFacts";
import styles from "./DraftCardRibbon.module.css";

/**
 * The ribbon: the unfinished post as one white band under the forum search,
 * compact so the board stays close.
 *
 * Reading order runs left to right the way a member recognises a draft: the
 * pen badge (its dot pulses to say the words are autosaved), then the title in
 * the hero's serif with a glimpse of the body, then what the member already
 * chose, then the way back in. On a phone it folds into two rows so the
 * button can span the width. The button's link stretches over the whole band
 * (see the CSS), and it is described by the draft's title, so "Continue
 * writing" is announced with the post it continues.
 *
 * No discard control, for the reason given in `ForumDraftResumeNotice`.
 */
export function DraftCardRibbon({
  details,
}: {
  details: ForumDraftCardDetails;
}) {
  const { t } = useTranslation();
  const titleId = useId();

  return (
    <section
      className={styles.ribbon}
      aria-label={t("forum:draftNotice.cardLabel")}
    >
      <span className={styles.badge} aria-hidden>
        <FiEdit3 className={styles.badgeIcon} />
      </span>

      <div className={styles.body}>
        <div className={styles.eyebrow}>
          <span>{t("forum:draftNotice.eyebrow")}</span>
          <span className={styles.saved}>
            {t("forum:draftNotice.autosaved")}
          </span>
        </div>
        <DraftRibbonLine
          titleId={titleId}
          title={details.title}
          excerpt={details.excerpt}
        />
      </div>

      <DraftCardRibbonFacts details={details} />

      <Button
        variant="primary"
        size="sm"
        className={styles.cta}
        to={routes.forumNew}
        aria-describedby={titleId}
      >
        {t("forum:draftNotice.continueCta")}
        <FiArrowRight className={styles.ctaArrow} aria-hidden />
      </Button>
    </section>
  );
}

/**
 * The serif title and, after a hairline, a muted glimpse of the body. With no
 * title the body's opening takes the title's place in italic, so the member
 * still sees their own words first; with neither, a plain "Untitled post".
 */
function DraftRibbonLine({
  titleId,
  title,
  excerpt,
}: {
  titleId: string;
  title: string;
  excerpt: string;
}) {
  const { t } = useTranslation();
  const hasTitle = title.length > 0;
  const hasExcerpt = excerpt.length > 0;

  if (!hasTitle && hasExcerpt) {
    return (
      <div className={styles.line}>
        <span
          id={titleId}
          className={`${styles.title} ${styles.titleFromBody}`}
        >
          {excerpt}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.line}>
      <span
        id={titleId}
        className={`${styles.title} ${hasTitle ? "" : styles.titleUntitled}`}
      >
        {hasTitle ? title : t("forum:draftNotice.untitled")}
      </span>
      <span
        className={`${styles.excerpt} ${hasExcerpt ? "" : styles.excerptEmpty}`}
      >
        {hasExcerpt ? excerpt : t("forum:draftNotice.emptyBody")}
      </span>
    </div>
  );
}
