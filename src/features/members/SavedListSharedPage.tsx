import { Link, useParams } from "react-router-dom";
import { FiSlash } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Spinner } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isSavedItemUnavailable } from "../../app/providers/useSaved";
import { linkToPath } from "../../app/routeMap";
import type { SavedItemDTO } from "./api/saved.api";
import { useSharedSavedList } from "./api/SavedLists.queries";
import { SavedUnavailableNote } from "./SavedUnavailableNote";
import styles from "./SavedListSharedPage.module.css";

/** One item on the shared list. Every reader is a signed-in member, so an item
 *  the API reports openable links to its own page, the same rule the owner's
 *  `SavedListItemRow` follows. The API resolves `href` through the reader's
 *  eyes and sends `null` for anything they cannot open.
 *
 *  An item the API reports unavailable says so (PRD-169). This page is the case
 *  that hurt most: somebody sent a list to a friend, and a subject that has
 *  since gone left a row the reader cannot tell apart from a live one. No
 *  remove hint here, because the reader owns nothing on this page. */
function SharedSavedListRow({ item }: { item: SavedItemDTO }) {
  const isUnavailable = isSavedItemUnavailable(item);
  const canOpen = !isUnavailable && Boolean(item.href);

  return (
    <li
      className={`${styles.row}${isUnavailable ? ` ${styles.rowUnavailable}` : ""}`}
    >
      <span className={styles.rowBadge}>
        {item.kind.slice(0, 3).toUpperCase()}
      </span>
      <span>
        {canOpen && item.href ? (
          <Link to={linkToPath(item.href)} className={styles.rowTitle}>
            {item.title}
          </Link>
        ) : (
          <span className={styles.rowTitle}>{item.title}</span>
        )}
        {item.meta && <span className={styles.rowMeta}>{item.meta}</span>}
        {item.description && (
          <span className={styles.rowBlurb}>{item.description}</span>
        )}
        {isUnavailable && <SavedUnavailableNote />}
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
 * A saved list somebody shared, read by a signed-in member who holds the link.
 *
 * Members-only by product decision: opening a shared list always needs a
 * QueerPulse account. `/lists/*` is in `GATED_PATTERNS`, so a signed-out
 * visitor is sent to sign-in with a `?next=` back to this link, and the backend
 * read `GET /saved-lists/:token` sits behind `ActiveMemberGuard`. The token
 * decides WHICH list a signed-in member sees. The page renders in `AppShell`
 * like the rest of the member surface.
 *
 * It shows the list's name and its items and NOTHING about who made it. That
 * mirrors `SharedSavedListDTO`, which carries no owner id, slug, name, or
 * avatar: the recipient was given the places and nothing about the person. If
 * the member wants their friend to know the list is theirs, they say so in the
 * message they send with the link, which is a disclosure they make rather than
 * one this page makes for them.
 *
 * `noIndex` because a link that is meant for one person has no business in a
 * search index, the same reason `CardVerifyPage` carries it.
 */
export function SavedListSharedPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const { data: sharedList, isLoading, isError } = useSharedSavedList(token);

  // A list where nothing at all can be opened any more is still a real list the
  // sender meant to hand over, so it keeps its name, its count and its rows. It
  // gets one extra line so the reader knows the page is telling them something
  // rather than failing at them.
  const hasOnlyUnavailableItems = Boolean(
    sharedList &&
    sharedList.items.length > 0 &&
    sharedList.items.every(isSavedItemUnavailable),
  );

  return (
    <AppShell>
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
              {hasOnlyUnavailableItems && (
                <p className={styles.allUnavailable}>
                  {t("members:savedLists.shared.allUnavailable")}
                </p>
              )}
              <p className={styles.note}>
                {t("members:savedLists.shared.note")}
              </p>
            </>
          )}
        </article>
      </div>
    </AppShell>
  );
}
