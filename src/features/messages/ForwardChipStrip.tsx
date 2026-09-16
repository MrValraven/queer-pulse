import { useEffect, useRef, type RefObject } from "react";
import { FiX } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Conversation } from "./data";
import styles from "./ForwardPickerModal.module.css";

interface ForwardChipStripProps {
  selected: Conversation[];
  isSending: boolean;
  remove: (id: string) => void;
  /** The picker's own search field, focused as the removal fallback once no
   *  chip remains to take focus instead. Owned by `ForwardPickerModal`,
   *  since this component doesn't render that field itself. */
  searchInputRef: RefObject<HTMLInputElement | null>;
}

/**
 * The selected-recipient chip strip above the picker's search field. Owns
 * its own focus management for chip removal: after removing one, focus
 * moves to the next chip, else the previous chip, else the search field.
 * Extracted purely to keep `ForwardPickerModal` under the line cap.
 */
export function ForwardChipStrip({
  selected,
  isSending,
  remove,
  searchInputRef,
}: ForwardChipStripProps) {
  const { t } = useTranslation();
  const chipButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const pendingChipFocusIdRef = useRef<string | undefined>(undefined);
  const hasPendingChipFocusRef = useRef(false);

  // Runs after `selected` has re-rendered, so the target chip's button ref
  // (if any) already exists.
  useEffect(() => {
    if (!hasPendingChipFocusRef.current) return;
    hasPendingChipFocusRef.current = false;
    const targetId = pendingChipFocusIdRef.current;
    const target = targetId ? chipButtonRefs.current.get(targetId) : undefined;
    if (target) target.focus();
    else searchInputRef.current?.focus();
  }, [selected, searchInputRef]);

  if (selected.length === 0) return null;

  function handleRemove(recipient: Conversation) {
    const index = selected.findIndex((entry) => entry.id === recipient.id);
    const nextId = selected[index + 1]?.id;
    const previousId = index > 0 ? selected[index - 1]?.id : undefined;
    pendingChipFocusIdRef.current = nextId ?? previousId;
    hasPendingChipFocusRef.current = true;
    remove(recipient.id);
  }

  return (
    <div
      className={styles.chipStrip}
      role="list"
      aria-label={t("messages:forward.selectedAria", {
        count: selected.length,
      })}
    >
      {selected.map((recipient) => (
        <span key={recipient.id} className={styles.chip} role="listitem">
          <Avatar
            initials={recipient.initials}
            tint={recipient.tint}
            src={recipient.avatarUrl}
            alt=""
            size={22}
          />
          <span className={styles.chipName}>{recipient.name}</span>
          <button
            type="button"
            ref={(element) => {
              if (element) chipButtonRefs.current.set(recipient.id, element);
              else chipButtonRefs.current.delete(recipient.id);
            }}
            className={styles.chipRemove}
            disabled={isSending}
            onClick={() => handleRemove(recipient)}
            aria-label={t("messages:forward.removeRecipient", {
              name: recipient.name,
            })}
          >
            <FiX />
          </button>
        </span>
      ))}
    </div>
  );
}
