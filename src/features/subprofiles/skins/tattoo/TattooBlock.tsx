import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useTattooEditHref } from "./TattooEditContext";
import { TATTOO_EDIT_TARGETS } from "./tattooEditLinks.data";
import type { TattooBlockKey } from "./tattooView";
import styles from "./TattooBlock.module.css";

/** The block's DOM id, the booking CTA's scroll target ("tattoo-booking"). */
export const tattooBlockAnchorId = (blockKey: TattooBlockKey): string =>
  `tattoo-${blockKey}`;

interface TattooBlockProps {
  blockKey: TattooBlockKey;
  heading: string;
  lede?: string;
  hasContent: boolean;
  /** i18n key of the owner's empty-state line. */
  emptyBodyKey: string;
  /** i18n key of the owner's empty-state link label ("Add flash"). */
  emptyActionKey: string;
  children: ReactNode;
}

/**
 * One block of the tattoo page. A visitor sees it only when it holds
 * something (a block the live preview fills grows in). The owner always sees
 * it: filled with a small "Edit" link beside the heading, or empty as a
 * dashed card that links to the editor field.
 */
export function TattooBlock({
  blockKey,
  heading,
  lede,
  hasContent,
  emptyBodyKey,
  emptyActionKey,
  children,
}: TattooBlockProps) {
  const { t } = useTranslation();
  const editHref = useTattooEditHref(TATTOO_EDIT_TARGETS[blockKey]);
  const headingId = `${tattooBlockAnchorId(blockKey)}-heading`;
  const isShown = hasContent || editHref !== null;
  const isEmptyForOwner = !hasContent && editHref !== null;
  return (
    <Collapse isOpen={isShown}>
      <section
        id={tattooBlockAnchorId(blockKey)}
        className={styles.block}
        aria-labelledby={headingId}
      >
        <div className={styles.head}>
          <h2 id={headingId} className={styles.heading}>
            {heading}
          </h2>
          {editHref && hasContent && (
            <Link
              to={editHref}
              className={styles.editLink}
              aria-label={`${t("subprofiles:tattoo.edit.link")}: ${heading}`}
            >
              <FiEdit2 aria-hidden className={styles.editIcon} />
              <span>{t("subprofiles:tattoo.edit.link")}</span>
            </Link>
          )}
        </div>
        {lede && hasContent && <p className={styles.lede}>{lede}</p>}
        {isEmptyForOwner ? (
          <div className={styles.emptyCard}>
            <p className={styles.emptyText}>{t(emptyBodyKey)}</p>
            <Link to={editHref} className={styles.emptyAction}>
              {t(emptyActionKey)}
            </Link>
          </div>
        ) : (
          children
        )}
      </section>
    </Collapse>
  );
}
