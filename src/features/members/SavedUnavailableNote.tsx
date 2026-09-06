import { FiSlash } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SavedUnavailableNote.module.css";

/**
 * What a saved item says once its subject can no longer be opened (PRD-169).
 *
 * Saved items used to be a snapshot with a link and nothing else, so a save
 * whose subject was gone kept rendering as a live card and the only signal was
 * the not-found page after the tap. Worse on a list somebody shared: a friend
 * who does not have an account got a page of dead links.
 *
 * Three rules this state holds to, and every surface using it has to keep:
 *
 * 1. The snapshot STAYS. Title, meta and blurb are what the member recognises,
 *    and taking them away turns a loss into a mystery.
 * 2. It never says WHY. The API does not tell us whether the subject was
 *    deleted, made private, or hidden from this reader in particular, because
 *    saying so would leak. So neither do we.
 * 3. It is not announced as a link and does not carry one. The card around it
 *    goes inert; this line is the perceivable reason, in text, so it does not
 *    rest on colour or dimming alone.
 *
 * `shouldShowRemoveHint` is for the surfaces where the member owns the save and
 * taking it out is the one useful thing left. A shared list gets it false: the
 * reader owns nothing on that page.
 */
export function SavedUnavailableNote({
  shouldShowRemoveHint = false,
}: {
  shouldShowRemoveHint?: boolean;
}) {
  const { t } = useTranslation();

  // A <span> rather than a <p>: this renders inside an <article>, inside a
  // <div> row, and inside a <span> on the shared-list page, and only a span is
  // valid in all three.
  return (
    <span className={styles.note}>
      <FiSlash aria-hidden />
      <span>
        <span className={styles.label}>
          {t("members:savedItem.unavailable.label")}
        </span>
        {shouldShowRemoveHint && (
          <span className={styles.hint}>
            {t("members:savedItem.unavailable.hint")}
          </span>
        )}
      </span>
    </span>
  );
}
