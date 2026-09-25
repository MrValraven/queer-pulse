import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";

/**
 * A pending-changes sentence whose count rolls as edits land or clear. The
 * `savebar-count` span keeps the sentence one flex item and resets the
 * generic `.savebar span` rule (`persona-editor.css`) for the figure inside.
 */
export function PendingCountLabel({
  i18nKey,
  count,
}: {
  i18nKey: string;
  count: number;
}) {
  const fmt = useFormat();
  return (
    <span className="savebar-count">
      <Translation
        i18nKey={i18nKey}
        values={{ count }}
        slots={{
          count: (
            <RollingNumber value={fmt.number(count)} numericValue={count} />
          ),
        }}
      />
    </span>
  );
}

/** Phone-only "{count} unsaved changes" line that reveals the itemized list. */
export function SavebarSummaryToggle({
  count,
  isOpen,
  listId,
  onToggle,
}: {
  count: number;
  isOpen: boolean;
  listId: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="savebar-summary"
      aria-expanded={isOpen}
      aria-controls={listId}
      onClick={onToggle}
    >
      <PendingCountLabel i18nKey="subprofiles:pending.summary" count={count} />
      {isOpen ? (
        <FiChevronUp size={16} aria-hidden />
      ) : (
        <FiChevronDown size={16} aria-hidden />
      )}
    </button>
  );
}
