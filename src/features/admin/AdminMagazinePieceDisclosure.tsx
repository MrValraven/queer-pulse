import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminMagazinePieceDisclosure.module.css";

/** The member's full text on a submission row, folded away until the reader
 *  asks for it. The chevron turns as the piece opens. */
export function AdminMagazinePieceDisclosure({ body }: { body: string }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const bodyId = useId();

  return (
    <div className={styles.disclosure}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiChevronDown
          aria-hidden
          className={styles.chevron}
          data-open={isOpen || undefined}
        />
        {t("admin:adminMagazineSubmissions.row.readPiece")}
      </button>
      <div id={bodyId}>
        <Collapse isOpen={isOpen}>
          <p className={styles.body}>{body}</p>
        </Collapse>
      </div>
    </div>
  );
}
