import { useParams } from "react-router-dom";
import { FiSlash } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Spinner } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SavedItemDTO } from "./api/saved.api";
import { useSharedSavedList } from "./api/SavedLists.queries";
import styles from "./SavedListSharedPage.module.css";

/** One item on the shared list. Read-only and inert: a recipient may not have
 *  an account, so nothing here links into the member surface. */
function SharedSavedListRow({ item }: { item: SavedItemDTO }) {
  return (
    <li className={styles.row}>
      <span className={styles.rowBadge}>
        {item.kind.slice(0, 3).toUpperCase()}
      </span>
      <span>
        <span className={styles.rowTitle}>{item.title}</span>
        {item.meta && <span className={styles.rowMeta}>{item.meta}</span>}
        {item.description && (
          <span className={styles.rowBlurb}>{item.description}</span>
        )}
      </span>
    </li>
  );
}

/** What a revoked, mistyped, or never-real link shows. All three land here on
 *  purpose: the API answers them identically so the page cannot be used to tell
 *  "this list was un-shared" apart from "this link was never real". */
function SharedSavedListGone() {
  const { t } = useTranslation();
  return (
    <div className={styles.gone}>
      <FiSlash aria-hidden />
      <h1 className={styles.goneTitle}>
        {t("members:savedLists.shared.gone.title")}
      </h1>
      <p className={styles.goneBody}>
        {t("members:savedLists.shared.gone.body")}
      </p>
    </div>
  );
}

/**
 * A saved list somebody shared, read by whoever holds the link.
 *
 * OUTSIDE THE WALLED GARDEN, deliberately, and matching what the backend
 * already does: `SharedSavedListController` is `@Public()`, so the token is the
 * one and only credential. The point is a friend who has just moved to the city
 * and does not have an account yet. `/lists/:token` is therefore not in
 * `GATED_PATTERNS`, and this page uses the marketing `PageShell` rather than
 * `AppShell` so it renders for a signed-out reader.
 *
 * It shows the list's name and its items and NOTHING about who made it. That
 * mirrors `SharedSavedListDTO`, which carries no owner id, slug, name, or
 * avatar: the recipient was given the places, not the person. If the member
 * wants their friend to know the list is theirs, they say so in the message
 * they send with the link, which is a disclosure they make rather than one this
 * page makes for them.
 *
 * `noIndex` because a link that is meant for one person has no business in a
 * search index, the same reason `CardVerifyPage` carries it.
 */
export function SavedListSharedPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const { data: sharedList, isLoading, isError } = useSharedSavedList(token);

  return (
    <PageShell>
      <PageMeta title={t("members:savedLists.shared.metaTitle")} noIndex />
      <div className={styles.page}>
        <article className={styles.panel}>
          {isLoading ? (
            <p className={styles.checking}>
              <Spinner /> {t("members:savedLists.shared.loading")}
            </p>
          ) : isError || !sharedList ? (
            <SharedSavedListGone />
          ) : (
            <>
              <div className={styles.eyebrow}>
                {t("members:savedLists.shared.eyebrow")}
              </div>
              <h1 className={styles.title}>{sharedList.name}</h1>
              <p className={styles.count}>
                {t("members:savedLists.shared.count", {
                  count: sharedList.itemCount,
                })}
              </p>
              <ul className={styles.list}>
                {sharedList.items.map((item) => (
                  <SharedSavedListRow key={item.id} item={item} />
                ))}
              </ul>
              <p className={styles.note}>
                {t("members:savedLists.shared.note")}
              </p>
            </>
          )}
        </article>
      </div>
    </PageShell>
  );
}
