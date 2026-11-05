import type { RefObject } from "react";
import { FiCopy, FiLink } from "react-icons/fi";
import { useShareLink } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatItemDate } from "../../../shared/lib/date";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import styles from "./PoemReaderContent.module.css";

export interface PoemReaderHeaderProps {
  item: SubprofileItemView;
  /** The persona's display name, set as the byline under the title. */
  authorName: string;
  /** See `PoemReaderModalProps.shareUrl`. */
  shareUrl: string | null;
  /** The plain text "Copy poem" copies: the active version, with newlines. */
  poemPlainText: string;
  /** The h2, observed by the reader so its top bar can take over the title. */
  titleRef: RefObject<HTMLHeadingElement | null>;
}

/** The poem's title page: title, byline, meta line, collaborators and the two
 *  copy actions. */
export function PoemReaderHeader({
  item,
  authorName,
  shareUrl,
  poemPlainText,
  titleRef,
}: PoemReaderHeaderProps) {
  const { t, language } = useTranslation();
  const { share: copyShareLink } = useShareLink({
    copied: t("subprofiles:share.copied"),
  });
  const { share: copyPoemText } = useShareLink({
    copied: t("subprofiles:poem.reader.copied"),
  });

  const formattedDate = item.date ? formatItemDate(item.date, language) : "";
  const meta = [item.subtitle, formattedDate].filter(Boolean).join(" · ");

  return (
    <header className={styles.head}>
      <h2 ref={titleRef} className={styles.title}>
        {item.title}
      </h2>
      {authorName && <p className={styles.byline}>{authorName}</p>}
      {meta && <p className={styles.meta}>{meta}</p>}
      {item.collaborators.length > 0 && (
        <p className={styles.collab}>
          {t("subprofiles:poem.reader.withLabel", {
            names: item.collaborators
              .map((collaborator) => collaborator.name)
              .join(", "),
          })}
        </p>
      )}
      <div className={styles.actions}>
        {shareUrl && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => void copyShareLink(shareUrl)}
            aria-label={t("subprofiles:poem.reader.copyLinkAria", {
              title: item.title,
            })}
          >
            <FiLink aria-hidden /> {t("subprofiles:poem.reader.copyLink")}
          </button>
        )}
        <button
          type="button"
          className={styles.actionButton}
          onClick={() =>
            void copyPoemText(poemPlainText || item.description || "")
          }
          aria-label={t("subprofiles:poem.reader.copy")}
        >
          <FiCopy aria-hidden /> {t("subprofiles:poem.reader.copy")}
        </button>
      </div>
    </header>
  );
}
