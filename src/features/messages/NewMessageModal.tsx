import { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { Avatar, SearchInput } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/SocialProvider";
import { conversations, type Conversation } from "./data";
import styles from "./NewMessageModal.module.css";

interface NewMessageModalProps {
  onClose: () => void;
  onPick: (recipient: Conversation) => void;
}

/** Self-contained recipient picker — opens (or reuses) a thread for the chosen member. */
export function NewMessageModal({ onClose, onPick }: NewMessageModalProps) {
  useScrollLock();
  const { t } = useTranslation();
  const { isBlocked } = useSocial();
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const people = useMemo(() => {
    // Blocked members are unreachable — never offer them as a recipient.
    const candidates = conversations.filter(
      (c) => !c.official && !(c.slug && isBlocked(c.slug)),
    );
    const q = query.trim().toLowerCase();
    return q
      ? candidates.filter((c) => c.name.toLowerCase().includes(q))
      : candidates;
  }, [query, isBlocked]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-message-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.head}>
          <h2 id="new-message-title" className={styles.title}>
            {t("messages:newMessage.title")}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("messages:newMessage.close")}
          >
            <FiX />
          </button>
        </div>
        <p className={styles.sub}>{t("messages:newMessage.sub")}</p>
        <SearchInput
          className={styles.searchField}
          value={query}
          onChange={setQuery}
          placeholder={t("messages:newMessage.searchPlaceholder")}
          ariaLabel={t("messages:newMessage.searchAria")}
        />
        <ul className={styles.list}>
          {people.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                className={styles.row}
                onClick={() => onPick(person)}
              >
                <Avatar
                  initials={person.initials}
                  tint={person.tint}
                  size={40}
                />
                <div className={styles.rowBody}>
                  <span className={styles.rowName}>{person.name}</span>
                  <span className={styles.rowMeta}>{person.pronouns}</span>
                </div>
              </button>
            </li>
          ))}
          {people.length === 0 && (
            <li className={styles.empty}>
              {t("messages:newMessage.empty", { query })}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
