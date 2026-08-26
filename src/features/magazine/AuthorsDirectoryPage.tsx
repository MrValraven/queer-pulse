import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Avatar, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { useAuthorsDirectory } from "./api/useAuthorsDirectory";
import { initialsFor, tintFor } from "./api/magazine.adapters";
import styles from "./AuthorsDirectoryPage.module.css";

function AuthorCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width={56} height={56} style={{ borderRadius: "50%" }} />
      <SkeletonLine width="60%" height={18} style={{ marginTop: 14 }} />
      <SkeletonLine width="90%" height={13} style={{ marginTop: 8 }} />
      <SkeletonLine width="45%" height={13} style={{ marginTop: 6 }} />
      <SkeletonLine width={70} height={12} style={{ marginTop: 18 }} />
    </div>
  );
}

/**
 * CNT-9 — every writer the magazine has ever published, in one browsable
 * index. Before this page existed, an individual author page was only
 * reachable by guessing its slug in the URL bar.
 *
 * CON-11 turned the cards from a list of strings into a list of people: each
 * one carries the writer's portrait (their member avatar when the byline has
 * no portrait of its own), a bio snippet, how many pieces they have
 * published, and a chip when the byline belongs to a member account. A card
 * links to the member profile when there is one, since that is the fuller
 * page, and to the magazine author page otherwise.
 */
export function AuthorsDirectoryPage() {
  const { t } = useTranslation();
  const { items: authors, isLoading, isError } = useAuthorsDirectory();
  const showEmpty = !isLoading && (isError || authors.length === 0);

  return (
    <PageShell>
      <MagazineMasthead active="authors" />
      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eyebrow}>
              {t("magazine:authorsDirectory.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              {t("magazine:authorsDirectory.title")}
            </h1>
            <p className={styles.sub}>{t("magazine:authorsDirectory.sub")}</p>
          </div>

          {showEmpty ? (
            <EmptyState
              title={
                isError
                  ? t("magazine:authorsDirectory.errorTitle")
                  : t("magazine:authorsDirectory.emptyTitle")
              }
              description={
                isError
                  ? t("magazine:authorsDirectory.errorBody")
                  : t("magazine:authorsDirectory.emptyBody")
              }
            />
          ) : (
            <div className={styles.grid}>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <AuthorCardSkeleton key={index} />
                  ))
                : authors.map((author) => (
                    <Link
                      key={author.slug}
                      to={`${routes.author}/${author.slug}`}
                      className={styles.card}
                    >
                      <Avatar
                        src={author.avatarUrl ?? undefined}
                        initials={initialsFor(author.initialsSeed)}
                        tint={tintFor(author.slug)}
                        size={56}
                        name={author.initialsSeed}
                      />
                      <div className={styles.cardName}>{author.name}</div>
                      {author.subtitle ? (
                        <p className={styles.cardSub}>{author.subtitle}</p>
                      ) : (
                        // An honest gap rather than a blank card: a byline
                        // auto-created on publish starts with no bio at all
                        // until staff or the writer fills one in.
                        <p className={styles.cardNoBio}>
                          {t("magazine:authorsDirectory.noBio")}
                        </p>
                      )}
                      <div className={styles.cardFoot}>
                        <span className={styles.cardCount}>
                          {t("magazine:authorsDirectory.pieceCount", {
                            count: author.pieceCount,
                          })}
                        </span>
                        {author.memberSlug && (
                          <span className={styles.memberChip}>
                            <FiUser aria-hidden />
                            {t("magazine:authorsDirectory.memberChip")}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
