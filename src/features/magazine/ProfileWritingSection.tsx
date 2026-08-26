import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { formatMonthYear } from "./api/magazine.adapters";
import { useMemberWriting } from "./api/useMemberWriting";
import styles from "./ProfileWritingSection.module.css";

/** How many pieces the profile shows before deferring to the author page. */
const MAX_PIECES_ON_PROFILE = 4;

/**
 * CON-11 — "Writing": the magazine credit a member gets on their own profile.
 *
 * On a community platform the byline is the reward, and until now a member
 * could write a commissioned piece, see it publish, and have nothing about it
 * attach to their identity. This section appears only for members whose
 * byline is actually linked to their account and who have published
 * something, so it is never an empty shell on the profiles of the many
 * members who have never written.
 */
export function ProfileWritingSection({
  memberSlug,
  isSelf,
  firstName,
}: {
  memberSlug: string;
  /** Owner view: "Your writing" instead of "{firstName}'s writing". */
  isSelf: boolean;
  firstName: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { writing, isLoading } = useMemberWriting(memberSlug);

  if (isLoading) {
    return (
      <section className={`${styles.section} wrap`} aria-hidden>
        <SkeletonLine width={220} height={26} />
        <SkeletonLine width="90%" height={14} style={{ marginTop: 16 }} />
        <SkeletonLine width="70%" height={14} style={{ marginTop: 8 }} />
      </section>
    );
  }

  // No linked byline, or a byline with nothing published yet: show nothing
  // rather than an empty "Writing" heading.
  if (!writing || writing.articles.length === 0) return null;

  const { author, articles } = writing;
  const shown = articles.slice(0, MAX_PIECES_ON_PROFILE);

  return (
    <section id="writing" className={`${styles.section} wrap`}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          {isSelf ? (
            <Translation
              i18nKey="magazine:profileWriting.selfTitle"
              components={{ em: <em /> }}
            />
          ) : (
            <Translation
              i18nKey="magazine:profileWriting.visitorTitle"
              values={{ firstName }}
              components={{ em: <em /> }}
            />
          )}
        </h2>
        <p className={styles.sub}>
          {t("magazine:profileWriting.sub", { count: articles.length })}
        </p>
      </div>

      <ul className={styles.list}>
        {shown.map((article) => (
          <li key={article.slug}>
            <Link
              className={styles.piece}
              to={`${routes.article}?id=${article.slug}`}
            >
              {/* Content: the piece's own title and dek stay as written. */}
              <span className={styles.pieceTitle}>{article.title}</span>
              {article.dek && (
                <span className={styles.pieceDek}>{article.dek}</span>
              )}
              <span className={styles.pieceMeta}>
                {[
                  article.issueNumber
                    ? t("magazine:live.issueBadge", {
                        number: article.issueNumber,
                      })
                    : formatMonthYear(article.publishedAt, fmt),
                  t("magazine:live.readMinutes", {
                    minutes: article.readMinutes,
                  }),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link className={styles.allLink} to={`${routes.author}/${author.slug}`}>
        {t("magazine:profileWriting.allCta", { count: articles.length })}{" "}
        <FiArrowRight aria-hidden />
      </Link>
    </section>
  );
}
