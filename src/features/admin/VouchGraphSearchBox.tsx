import {
  useEffect,
  useId,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { AdminAvatar, type AvatarTone } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import {
  useVouchGraphSearchResults,
  vouchSearchOptionId,
  type VouchGraphSearchResults,
  type VouchSearchOption,
} from "./useVouchGraphSearchResults";
import styles from "./vouchGraphShell.module.css";

export interface VouchGraphSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  /** A loaded member was picked: select them, or recentre when hidden. */
  onSelectInGraph: (id: string) => void;
  /** A member outside the loaded graph was picked: jump focus (refetch). */
  onJumpToMember: (slug: string) => void;
  className?: string;
}

/**
 * The trust network's one search box (A4), an ARIA 1.2 combobox. Typing
 * highlights matches on the canvas (the caller derives them from `search`)
 * and opens a listbox with two groups: "In this graph" (local, instant) and
 * "All members" (server, debounced). Arrow keys move the active option,
 * Enter picks it, Escape folds the list away and keeps the modal open.
 */
export function VouchGraphSearch({
  search,
  onSearchChange,
  onSelectInGraph,
  onJumpToMember,
  className,
}: VouchGraphSearchProps) {
  const { t } = useTranslation();
  const results = useVouchGraphSearchResults(search);
  const listboxId = useId();
  const [isListOpen, setIsListOpen] = useState(false);
  // The active option is tracked by key: when results swap under it, the
  // highlight drops and Enter can never retarget a different member.
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const optionCount = results.options.length;
  const currentIndex = results.options.findIndex(
    (option) => option.key === activeKey,
  );
  const isListVisible = isListOpen && results.hasTerm;
  const activeOptionId =
    isListVisible && currentIndex >= 0
      ? vouchSearchOptionId(listboxId, currentIndex)
      : undefined;

  useEffect(() => {
    if (!activeOptionId) return;
    document
      .getElementById(activeOptionId)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId]);

  function closeList() {
    setIsListOpen(false);
    setActiveKey(null);
  }

  function changeTerm(value: string) {
    onSearchChange(value);
    setIsListOpen(true);
    setActiveKey(null);
  }

  function activateIndex(index: number) {
    setActiveKey(results.options[index]?.key ?? null);
  }

  function pick(option: VouchSearchOption) {
    closeList();
    if (option.kind === "graph") {
      onSelectInGraph(option.person.id);
      return;
    }
    onJumpToMember(option.member.slug);
    onSearchChange("");
  }

  function moveActive(step: 1 | -1) {
    setIsListOpen(true);
    if (optionCount === 0) return;
    if (currentIndex < 0) {
      activateIndex(step === 1 ? 0 : optionCount - 1);
      return;
    }
    activateIndex((currentIndex + step + optionCount) % optionCount);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Enter" && isListVisible) {
      const option = results.options[currentIndex] ?? results.options[0];
      if (!option) return;
      event.preventDefault();
      pick(option);
      return;
    }
    if (event.key !== "Escape") return;
    // This Escape belongs to the search: the modal listens on `document`,
    // so stopping it here keeps the modal open.
    if (isListVisible) {
      event.stopPropagation();
      closeList();
    } else if (search) {
      event.stopPropagation();
      onSearchChange("");
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (
      nextTarget instanceof Node &&
      event.currentTarget.contains(nextTarget)
    ) {
      return;
    }
    closeList();
  }

  const hasValue = search.length > 0;
  return (
    <div className={cx(styles.searchBox, className)} onBlur={handleBlur}>
      <div className={styles.searchField}>
        <FiSearch aria-hidden className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          value={search}
          placeholder={t("admin:vouchGraph.search.placeholder")}
          aria-label={t("admin:vouchGraph.search.ariaLabel")}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isListVisible}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => changeTerm(event.target.value)}
          onFocus={() => setIsListOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={styles.searchClear}
          data-visible={hasValue}
          inert={!hasValue}
          aria-label={t("admin:vouchGraph.search.clearCta")}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            onSearchChange("");
            closeList();
          }}
        >
          <FiX aria-hidden />
        </button>
      </div>
      <p className="visuallyHidden" role="status" aria-live="polite">
        {results.hasTerm && results.isSettled
          ? t("admin:vouchGraph.search.matchCount", {
              count: results.graphMatches.length,
            })
          : ""}
      </p>
      <Collapse isOpen={isListVisible} className={styles.searchPopover}>
        <VouchGraphSearchList
          listboxId={listboxId}
          results={results}
          activeIndex={currentIndex}
          onPick={pick}
          onHoverOption={activateIndex}
        />
      </Collapse>
    </div>
  );
}

interface VouchGraphSearchListProps {
  listboxId: string;
  results: VouchGraphSearchResults;
  activeIndex: number;
  onPick: (option: VouchSearchOption) => void;
  onHoverOption: (index: number) => void;
}

/** The listbox under the search box: "In this graph" then "All members".
 *  Options are buttons out of the tab order; the input keeps focus and
 *  points at the active one through `aria-activedescendant`. */
function VouchGraphSearchList({
  listboxId,
  results,
  activeIndex,
  onPick,
  onHoverOption,
}: VouchGraphSearchListProps) {
  const { t } = useTranslation();
  const inGraphLabelId = `${listboxId}-in-graph`;
  const allMembersLabelId = `${listboxId}-all-members`;
  const memberOffset = results.graphMatches.length;
  let allMembersNote: string | null = null;
  if (!results.isAllMembersReady) {
    allMembersNote = t("admin:vouchGraph.search.typeMore");
  } else if (results.memberMatches.length === 0) {
    allMembersNote = results.isSearchingMembers
      ? t("admin:vouchGraph.search.searching")
      : t("admin:vouchGraph.search.noMatches");
  }

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label={t("admin:vouchGraph.search.ariaLabel")}
      className={styles.searchList}
    >
      <div role="group" aria-labelledby={inGraphLabelId}>
        <div
          id={inGraphLabelId}
          role="presentation"
          className={styles.searchGroupLabel}
        >
          {t("admin:vouchGraph.search.groupInGraph")}
        </div>
        {results.graphMatches.length === 0 && (
          <div role="presentation" className={styles.searchNote}>
            {t("admin:vouchGraph.search.noMatches")}
          </div>
        )}
        {results.graphMatches.map((person, index) => (
          <VouchGraphSearchOption
            key={person.id}
            optionId={vouchSearchOptionId(listboxId, index)}
            isActive={index === activeIndex}
            name={person.name}
            handle={person.id}
            initials={person.initials}
            tone={person.tone}
            avatarUrl={person.avatarUrl ?? null}
            onPick={() => onPick(results.options[index]!)}
            onHover={() => onHoverOption(index)}
          />
        ))}
      </div>
      <div role="group" aria-labelledby={allMembersLabelId}>
        <div
          id={allMembersLabelId}
          role="presentation"
          className={styles.searchGroupLabel}
        >
          {t("admin:vouchGraph.search.groupAllMembers")}
        </div>
        {allMembersNote !== null && (
          <div role="presentation" className={styles.searchNote}>
            {allMembersNote}
          </div>
        )}
        {results.memberMatches.map((member, memberIndex) => {
          const optionIndex = memberOffset + memberIndex;
          return (
            <VouchGraphSearchOption
              key={member.slug}
              optionId={vouchSearchOptionId(listboxId, optionIndex)}
              isActive={optionIndex === activeIndex}
              name={member.name}
              handle={member.slug}
              initials={member.initials}
              tone="plum"
              avatarUrl={member.avatarUrl}
              onPick={() => onPick(results.options[optionIndex]!)}
              onHover={() => onHoverOption(optionIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface VouchGraphSearchOptionProps {
  optionId: string;
  isActive: boolean;
  name: string;
  handle: string;
  initials: string;
  tone: AvatarTone;
  avatarUrl: string | null;
  onPick: () => void;
  onHover: () => void;
}

/** One member row of the listbox: avatar, name and @slug. A press keeps
 *  focus in the input. */
function VouchGraphSearchOption({
  optionId,
  isActive,
  name,
  handle,
  initials,
  tone,
  avatarUrl,
  onPick,
  onHover,
}: VouchGraphSearchOptionProps) {
  return (
    <button
      type="button"
      id={optionId}
      role="option"
      tabIndex={-1}
      aria-selected={isActive}
      className={cx(styles.searchOption, isActive && styles.searchOptionActive)}
      onMouseDown={(event) => event.preventDefault()}
      onMouseMove={isActive ? undefined : onHover}
      onClick={onPick}
    >
      <AdminAvatar
        initials={initials}
        tone={tone}
        src={avatarUrl ?? undefined}
        size="sm"
      />
      <span className={styles.searchOptionText}>
        <span className={styles.searchOptionName}>{name}</span>
        <span className={styles.searchOptionHandle}>@{handle}</span>
      </span>
    </button>
  );
}
