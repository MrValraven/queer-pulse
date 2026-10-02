import {
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { FiSearch } from "react-icons/fi";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { ConnectionView } from "../connect/connections.data";
import { useConnectionCandidates } from "../connect/useConnectionCandidates";
import type { CollaboratorDTO } from "./api/subprofiles.api";
import {
  COLLABORATOR_RESULT_LIMIT,
  COLLABORATOR_SEARCH_DEBOUNCE_MS,
  MAX_COLLABORATORS,
} from "./collaborators.data";
import { CollaboratorPills, CollaboratorResults } from "./CollaboratorResults";
import styles from "./CollaboratorPicker.module.css";

interface CollaboratorPickerProps {
  collaborators: CollaboratorDTO[];
  onChange: (collaborators: CollaboratorDTO[]) => void;
}

/** The credit a picked connection becomes. Only `.handle` is sent on save
 *  (`itemsToInputDto`); the rest is the card the pill shows until the next
 *  read replaces it with the server's own. */
function toCollaborator(person: ConnectionView): CollaboratorDTO {
  return {
    handle: person.slug,
    type: "member",
    name: person.name,
    avatarUrl: person.photo ?? null,
    slug: person.slug,
  };
}

/**
 * Credit collaborators on an item, from your own network only. Candidates are
 * your accepted connections (`useConnectionCandidates`, the same source the
 * gathering co-host picker uses), so a stranger can never be tagged onto your
 * work. Credits saved before this rule — or for someone you've since
 * disconnected from — stay listed as pills and can still be removed; they
 * just can't be added again.
 *
 * Results open inline under the search rather than as a floating layer: the
 * picker lives in the drawer's narrow settings rail, where a popover would be
 * clipped by the scrolling body.
 */
export function CollaboratorPicker({
  collaborators,
  onChange,
}: CollaboratorPickerProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const fieldId = useId();
  const searchId = `${fieldId}-search`;
  const helperId = `${fieldId}-helper`;
  const resultsId = `${fieldId}-results`;
  const [searchTerm, setSearchTerm] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);
  const [hasOpenedList, setHasOpenedList] = useState(false);
  const pickedSlugs = collaborators.map((collaborator) => collaborator.handle);
  const candidates = useConnectionCandidates({
    searchTerm,
    hasOpenedList,
    pickedSlugs,
    resultLimit: COLLABORATOR_RESULT_LIMIT,
    debounceMs: COLLABORATOR_SEARCH_DEBOUNCE_MS,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isAtCap = collaborators.length >= MAX_COLLABORATORS;

  const openList = () => {
    setIsListOpen(true);
    setHasOpenedList(true);
  };
  const closeList = () => setIsListOpen(false);
  useOutsideDismiss(isListOpen, containerRef, closeList);

  const pick = (person: ConnectionView) => {
    if (isAtCap) return;
    onChange([...collaborators, toCollaborator(person)]);
    setSearchTerm("");
    // Keep the list open with focus in the search, so crediting a whole
    // table is type, Enter, type, Enter.
    inputRef.current?.focus();
  };

  const remove = (handle: string) => {
    onChange(collaborators.filter((c) => c.handle !== handle));
    // The pill and its button are gone after this press.
    inputRef.current?.focus();
    closeList();
  };

  const focusOption = (index: number) => {
    const options =
      listRef.current?.querySelectorAll<HTMLButtonElement>("button");
    if (!options || options.length === 0) return;
    options[(index + options.length) % options.length]?.focus();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openList();
      window.setTimeout(() => focusOption(0), 0);
    } else if (event.key === "Enter") {
      // Enter in the search picks the top match instead of submitting.
      event.preventDefault();
      const [first] = candidates.matches;
      if (isListOpen && first) pick(first);
    } else if (event.key === "Escape" && isListOpen) {
      // Close the list, not the whole drawer.
      event.preventDefault();
      event.stopPropagation();
      closeList();
    }
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index === 0) inputRef.current?.focus();
      else focusOption(index - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      inputRef.current?.focus();
      closeList();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocus = event.relatedTarget as Node | null;
    if (nextFocus && !event.currentTarget.contains(nextFocus)) closeList();
  };

  return (
    <div className={styles.picker}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={searchId}>
          {t("subprofiles:itemEditor.collaboratorsLabel")}
        </label>
        {collaborators.length > 0 && (
          <span className={styles.count}>
            {t("subprofiles:itemEditor.collaboratorsCount", {
              taken: fmt.number(collaborators.length),
              max: fmt.number(MAX_COLLABORATORS),
            })}
          </span>
        )}
      </div>
      <p className={styles.helper} id={helperId}>
        {isAtCap
          ? t("subprofiles:itemEditor.collaboratorsCapHint")
          : t("subprofiles:itemEditor.collaboratorsHelper")}
      </p>

      <CollaboratorPills collaborators={collaborators} onRemove={remove} />

      {!isAtCap && (
        <div ref={containerRef} className={styles.search} onBlur={handleBlur}>
          <span className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} aria-hidden />
            <input
              ref={inputRef}
              id={searchId}
              type="search"
              autoComplete="off"
              className={styles.searchInput}
              placeholder={t("subprofiles:itemEditor.collaboratorsPlaceholder")}
              aria-describedby={helperId}
              aria-controls={isListOpen ? resultsId : undefined}
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                openList();
              }}
              onFocus={openList}
              onKeyDown={handleSearchKeyDown}
            />
          </span>
          {isListOpen && (
            <CollaboratorResults
              resultsId={resultsId}
              listRef={listRef}
              candidates={candidates}
              onPick={pick}
              onOptionKeyDown={handleOptionKeyDown}
            />
          )}
        </div>
      )}
    </div>
  );
}
