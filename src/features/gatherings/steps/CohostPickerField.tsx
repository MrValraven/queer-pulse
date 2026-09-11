import {
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
} from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { tintForSlug } from "../../../shared/api/refs";
import { Avatar, Button } from "../../../shared/components/ui";
import { useOutsideDismiss } from "../../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ConnectionView } from "../../connect/connections.data";
import { afterRender } from "../createGatheringChapters";
import { Field, TextInput } from "../CreateGatheringFields";
import type { CohostPick, GatheringForm } from "../useGatheringForm";
import { useCohostCandidates } from "./useCohostCandidates";
import styles from "./WhoChapter.module.css";

/**
 * Co-hosts: search your network, pick people, see them as removable pills.
 *
 * Candidates are the host's connections, the same source
 * `CohostInviteComposerModal` offers (ruling R12), searched on the server
 * through `useCohostCandidates`, which loads nothing until the list first
 * opens. Picking records the person on the form with the name, initials and
 * photo the pill shows; `usePublishGathering` sends each one an invite after
 * the gathering is created, which is what the hint promises.
 */
export function CohostPickerField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const searchId = `${fieldId}-cohost-search`;
  const resultsId = `${fieldId}-cohost-results`;
  const [searchTerm, setSearchTerm] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);
  const [hasOpenedList, setHasOpenedList] = useState(false);
  const { matches, isAwaitingMatches, hasConnections, isError, refetch } =
    useCohostCandidates({
      searchTerm,
      hasOpenedList,
      pickedSlugs: form.cohostSlugs,
    });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const openList = () => {
    setIsListOpen(true);
    setHasOpenedList(true);
  };
  const closeList = () => setIsListOpen(false);
  useOutsideDismiss(isListOpen, containerRef, closeList);

  /** Hand focus back to the search input and close the list. The order
   *  matters: focusing the input runs its `onFocus`, which opens the list, so
   *  the close has to come after it to be the update that lands. */
  const returnFocusAndClose = () => {
    inputRef.current?.focus();
    closeList();
  };

  const pickPerson = (person: ConnectionView) => {
    form.toggleCohost({
      slug: person.slug,
      name: person.name,
      initials: person.initials,
      avatarUrl: person.photo ?? null,
    });
    setSearchTerm("");
    returnFocusAndClose();
  };

  const focusOption = (index: number) => {
    const optionButtons =
      listRef.current?.querySelectorAll<HTMLButtonElement>("button");
    if (!optionButtons || optionButtons.length === 0) return;
    optionButtons[
      (index + optionButtons.length) % optionButtons.length
    ]?.focus();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openList();
      afterRender(() => focusOption(0));
    } else if (event.key === "Escape" && isListOpen) {
      event.preventDefault();
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
      returnFocusAndClose();
    }
  };

  // Focus that lands on a real element outside the picker closes the list. A
  // press on a result can blur the input with no related target (Safari does
  // not focus buttons on click), so that case is left to the outside press.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocus = event.relatedTarget as Node | null;
    if (nextFocus && !event.currentTarget.contains(nextFocus)) closeList();
  };

  return (
    <Field
      label={t("gatherings:create.v2.who.cohostsLabel")}
      htmlFor={searchId}
      isOptional
      hint={t("gatherings:create.v2.who.cohostsHint")}
    >
      <div ref={containerRef} className={styles.people} onBlur={handleBlur}>
        <TextInput
          ref={inputRef}
          id={searchId}
          type="search"
          icon={FiSearch}
          autoComplete="off"
          placeholder={t("gatherings:create.v2.who.cohostsPlaceholder")}
          aria-describedby={`${searchId}-hint`}
          aria-controls={isListOpen ? resultsId : undefined}
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            openList();
          }}
          onFocus={openList}
          onKeyDown={handleSearchKeyDown}
        />
        {isListOpen && (
          <div className={styles.peopleList}>
            <CohostResults
              resultsId={resultsId}
              listRef={listRef}
              matches={matches}
              hasConnections={hasConnections}
              isLoading={isAwaitingMatches}
              isError={isError}
              onRetry={refetch}
              onPick={pickPerson}
              onOptionKeyDown={handleOptionKeyDown}
            />
          </div>
        )}
      </div>
      {form.cohosts.length > 0 && (
        <ul
          className={styles.hostPills}
          aria-label={t("gatherings:create.v2.who.cohostsPickedLabel")}
        >
          {form.cohosts.map((cohost) => (
            <CohostPill
              key={cohost.slug}
              cohost={cohost}
              onRemove={() => {
                form.toggleCohost(cohost);
                // The pill and its button are gone after this press, so focus
                // returns to the search input, which stays put.
                returnFocusAndClose();
              }}
            />
          ))}
        </ul>
      )}
    </Field>
  );
}

/**
 * What the open dropdown shows. A failed load comes first (DES-22: an outage
 * must not read as an empty network), then the loading line, then the matches
 * or the empty state that fits.
 */
function CohostResults({
  resultsId,
  listRef,
  matches,
  hasConnections,
  isLoading,
  isError,
  onRetry,
  onPick,
  onOptionKeyDown,
}: {
  resultsId: string;
  listRef: Ref<HTMLUListElement>;
  matches: ConnectionView[];
  hasConnections: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPick: (person: ConnectionView) => void;
  onOptionKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => void;
}) {
  const { t } = useTranslation();
  if (isError) {
    return (
      <div id={resultsId} className={styles.peopleError}>
        <p role="status" className={styles.peopleErrorText}>
          {t("gatherings:create.v2.who.cohostsLoadError")}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
          {t("shared:loadError.retryCta")}
        </Button>
      </div>
    );
  }
  if (isLoading || matches.length === 0) {
    const statusKey = isLoading
      ? "gatherings:create.v2.who.cohostsLoading"
      : hasConnections
        ? "gatherings:create.v2.who.cohostsNoMatch"
        : "gatherings:create.v2.who.cohostsNoConnections";
    return (
      <p id={resultsId} role="status" className={styles.peopleEmpty}>
        {t(statusKey)}
      </p>
    );
  }
  return (
    <ul
      ref={listRef}
      id={resultsId}
      className={styles.peopleOptions}
      aria-label={t("gatherings:create.v2.who.cohostsResultsLabel")}
    >
      {matches.map((person, index) => (
        <li key={person.slug}>
          <button
            type="button"
            className={styles.personOption}
            onClick={() => onPick(person)}
            onKeyDown={(event) => onOptionKeyDown(event, index)}
          >
            <Avatar
              initials={person.initials}
              tint={person.tint}
              src={person.photo}
              size={30}
            />
            <span className={styles.personText}>
              <span className={styles.personName}>{person.name}</span>
              {(person.pron ?? person.role) && (
                <span className={styles.personMeta}>
                  {person.pron ?? person.role}
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** One picked co-host: avatar, name and a remove button, drawn from what the
 *  form stored at pick time (ruling F10), so a pill stays whole whatever the
 *  search list holds now. */
function CohostPill({
  cohost,
  onRemove,
}: {
  cohost: CohostPick;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const name = cohost.name || cohost.slug;
  return (
    <li className={styles.hostPill}>
      <Avatar
        initials={cohost.initials}
        tint={tintForSlug(cohost.slug)}
        src={cohost.avatarUrl ?? undefined}
        size={24}
      />
      <span>{name}</span>
      <button
        type="button"
        className={styles.hostRemove}
        aria-label={t("gatherings:create.v2.who.cohostRemove", { name })}
        onClick={onRemove}
      >
        <FiX aria-hidden />
      </button>
    </li>
  );
}
