import { AnimatePresence, m } from "motion/react";
import { useRef } from "react";
import { FiExternalLink } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatRelative } from "../../shared/lib/date";
import { parseStudioLink } from "../studio/share/studioLinkTarget";
import { StudioPostCard } from "../studio/share/StudioPostCard";
import type { PersonaPostView } from "./api/personaPosts.adapters";
import { PersonaPostComposer } from "./PersonaPostComposer";
import { PersonaPostMenu, type PersonaPostMenuItem } from "./PersonaPostMenu";
import styles from "./PersonaUpdates.module.css";

const ABSOLUTE_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  hourCycle: "h23",
  minute: "2-digit",
};

/** The post's own content: body as written, a 4:3 photo frame, and the
 *  Studio card or a link card (inert in the editor preview). */
function PersonaPostContent({
  post,
  isInteractive,
}: {
  post: PersonaPostView;
  isInteractive: boolean;
}) {
  const { t } = useTranslation();
  // A Studio link gets the Studio card; any other https link keeps the host
  // card. Signed out, the card shows its no-access state and asks nothing.
  const studioTarget = post.linkUrl ? parseStudioLink(post.linkUrl) : null;
  return (
    <>
      <p className={styles.postBody}>{post.body}</p>
      {post.imageUrl && (
        <span className={styles.photoFrame}>
          <img
            src={post.imageUrl}
            alt=""
            width={480}
            height={360}
            className={styles.photo}
            loading="lazy"
            decoding="async"
          />
        </span>
      )}
      {studioTarget ? (
        <StudioPostCard target={studioTarget} isInteractive={isInteractive} />
      ) : (
        post.link &&
        (isInteractive ? (
          <a
            className={styles.linkCard}
            href={post.link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.linkHost}>{post.link.host}</span>
            <FiExternalLink aria-hidden />
            <span className="visuallyHidden">
              {t("subprofiles:updates.post.opensInNewTab")}
            </span>
          </a>
        ) : (
          <span className={styles.linkCard}>
            <span className={styles.linkHost}>{post.link.host}</span>
          </span>
        ))
      )}
    </>
  );
}

/** One update. While the owner edits it, the composer takes the body's
 *  place (both sides fold through Collapse). Leaving the editor returns
 *  focus to the post. */
export function PersonaPostItem({
  post,
  subprofileId,
  isInteractive,
  isEditing,
  menuItems,
  onEditDone,
  onEditGone,
}: {
  post: PersonaPostView;
  subprofileId: string;
  /** False in the persona editor preview: links inert, no menu. */
  isInteractive: boolean;
  isEditing: boolean;
  menuItems: PersonaPostMenuItem[];
  /** `isSaved` is true when a save reached the server. */
  onEditDone: (isSaved: boolean) => void;
  /** The save answered 404: the post left the list, and the parent says so. */
  onEditGone?: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const articleRef = useRef<HTMLElement>(null);
  const finishEdit = (isSaved: boolean) => {
    onEditDone(isSaved);
    articleRef.current?.focus();
  };
  return (
    <article ref={articleRef} tabIndex={-1} className={styles.post}>
      <header className={styles.postHead}>
        <time
          dateTime={post.createdAt}
          title={formatters.date(new Date(post.createdAt), ABSOLUTE_DATE)}
          className={styles.postTime}
        >
          {formatRelative(post.createdAt, formatters)}
        </time>
        <AnimatePresence initial={false}>
          {post.isEdited && (
            <m.span
              key="edited"
              className={styles.edited}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.72 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              {t("subprofiles:updates.post.edited")}
            </m.span>
          )}
        </AnimatePresence>
        {isInteractive && <PersonaPostMenu items={menuItems} />}
      </header>
      <Collapse isOpen={isEditing}>
        <PersonaPostComposer
          subprofileId={subprofileId}
          post={post}
          onDone={() => finishEdit(true)}
          onCancel={() => finishEdit(false)}
          onGone={onEditGone}
        />
      </Collapse>
      <Collapse isOpen={!isEditing}>
        <PersonaPostContent post={post} isInteractive={isInteractive} />
      </Collapse>
    </article>
  );
}
