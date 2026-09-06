import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { hasPreviewContent } from "../messages/api/useLinkPreview";
import { useForumLinkPreview } from "./api/useForumLinkPreview";
import styles from "./ThreadPage.module.css";

/**
 * The unfurl card under a forum post's body (PRD-171).
 *
 * A pasted URL used to be plain text everywhere in the forum, so a
 * resource-sharing thread read as a column of bare addresses with no way to
 * tell a useful one from a dud without leaving the page.
 *
 * Three states, and only three:
 *  - no link, or the post is not near the viewport yet → nothing;
 *  - loading → still nothing, deliberately. A skeleton here would reserve
 *    height under every linked post and then take it back on the (common)
 *    un-previewable URL, which is a jump for no information;
 *  - resolved with something to show → the card.
 *
 * A failed request and an all-null card land in the same place: the post keeps
 * the plain link it already renders, with no error state to read past.
 */
export function ForumLinkPreview({
  url,
  isEnabled,
}: {
  /** The first http(s) URL in this post's body, or null when it has none. */
  url: string | null;
  /** Whether the post is near enough the viewport to spend a request on. See
   *  `useInViewOnce` and the rate-limit note in `useForumLinkPreview`. */
  isEnabled: boolean;
}) {
  const { t } = useTranslation();
  const { data } = useForumLinkPreview(isEnabled ? url : null);
  const [hasImageFailed, setHasImageFailed] = useState(false);

  if (!url || !hasPreviewContent(data)) return null;

  const { siteName, title, description, imageUrl } = data;
  const shouldShowImage = !!imageUrl && !hasImageFailed;
  const accessibleName = title
    ? t("forum:linkPreview.aria", { title })
    : t("forum:linkPreview.ariaGeneric", { site: siteName ?? url });

  return (
    <a
      className={styles.linkPreview}
      // The card links to the URL the member actually pasted, not the
      // post-redirect `url` the server resolved: the address in the body and
      // the address the card opens must be the same one.
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleName}
    >
      {shouldShowImage && (
        <img
          className={styles.linkPreviewThumb}
          src={imageUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setHasImageFailed(true)}
        />
      )}
      <span className={styles.linkPreviewBody}>
        {siteName && <span className={styles.linkPreviewSite}>{siteName}</span>}
        {title && <span className={styles.linkPreviewTitle}>{title}</span>}
        {description && (
          <span className={styles.linkPreviewDesc}>{description}</span>
        )}
      </span>
    </a>
  );
}
