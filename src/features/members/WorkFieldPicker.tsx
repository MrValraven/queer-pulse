import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Collapse, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isUnlistedDiscipline } from "./memberDirectoryFilter.data";
import {
  foldForSearch,
  matchingFields,
  matchingProfessionGroups,
  pickCountsByGroup,
  removeWorkPick,
  toggleWorkField,
  toggleWorkProfession,
  workPicks,
  type PickerFieldGroupId,
  type WorkFieldSelection,
  type WorkPick,
} from "./workFieldPicker.data";
import { WorkPickerBrowse } from "./WorkPickerBrowse";
import { WorkPickerPicks } from "./WorkPickerPicks";
import { WorkPickerSearchResults } from "./WorkPickerSearchResults";
import { WorkPickerShowAllToggle } from "./WorkPickerShowAllToggle";
import { useKeepInPlace } from "./useKeepInPlace";
import styles from "./WorkFieldPicker.module.css";

interface WorkFieldPickerProps extends WorkFieldSelection {
  onChange: (next: WorkFieldSelection) => void;
  className?: string;
}

/**
 * The shared "what do you do" picker: broad field(s) of work and the
 * professions within them. Used by the profile editor, the onboarding wizard
 * and Settings → Interests, so the `profession ⊆ discipline` invariant and the
 * chip vocabulary live in one place for all three.
 *
 * Both levels are multi-select: real bios already describe more than one role
 * ("Dancer, model & venture builder"), so a single-select would under-fit from
 * day one.
 *
 * Search comes first, since most members can name their job faster than they
 * can find it among ~460 roles. A query matching a field's name lists all of
 * that field's roles, and one matching a role's name lists that role, all
 * grouped by field so a member can pick a role straight away. The roles come
 * first, then the fields whose own name matches.
 * `toggleWorkProfession` adds the parent field, which keeps a searched pick
 * coherent with the field chips. Under the search sit the member's picks as
 * removable chips, then a list of field groups to browse, one open at a time.
 * A search that finds something folds the browse list away while it runs;
 * one that finds nothing leaves it open as the way on.
 *
 * A member who already has a field and a role opens on just their picks,
 * with the search and the browse list folded away and a quiet toggle under
 * them to show everything. Any pick or search keeps the full picker open, so
 * it never folds away under a member who is still choosing. The toggle only
 * shows for a picker that has shown just the picks, so a member picking their
 * first field and role in onboarding gets no second link above its Continue
 * button. A member back in onboarding with a field and a role already saved
 * opens folded and gets the toggle, as they do everywhere else.
 *
 * The picker owns its sub-heading style, a quiet label one step under a
 * host's field label, so it reads as one field on every surface.
 *
 * A pressed browse or result button stays under the member's finger while
 * the picker reflows around it (`useKeepInPlace`).
 *
 * Values are the ids the member directory filters on, so anything picked here
 * is immediately findable under "What they do" / "Profession" in /members.
 */
export function WorkFieldPicker({
  discipline,
  profession,
  onChange,
  className,
}: WorkFieldPickerProps) {
  const { t } = useTranslation();
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  useKeepInPlace(rootRef);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Set when a removal empties the picks row. While the picker showed only
  // the picks, the search box was folded away and `ChipList` found nothing
  // to focus, so focus would drop to the page as the row folds. The effect
  // below hands it to the search box once the box is back on screen.
  const shouldFocusSearchRef = useRef(false);
  useLayoutEffect(() => {
    const searchInput = searchInputRef.current;
    if (!shouldFocusSearchRef.current || !searchInput) return;
    shouldFocusSearchRef.current = false;
    searchInput.focus();
  });
  const [query, setQuery] = useState("");
  // Whether the chips glide to their new places, set by what changed them
  // last. A keystroke can move a chip ten rows across others fading out, so
  // the query reflows the chips at once and only those joining or leaving
  // fade. A toggle keeps the glide, which carries a chip's neighbours over as
  // its tick changes its width.
  const [shouldChipsGlide, setShouldChipsGlide] = useState(true);
  // Whether the member opened the full list. It only counts once a field and
  // a role are both picked, so a draft that loads late with both still opens
  // folded, and onboarding (nothing picked yet) shows everything. While folded
  // the query is set aside, so no search results show under the picks.
  const [isExpanded, setIsExpanded] = useState(false);
  // The browse group open right now. Held here, so a group a member opened
  // is open again once a search clears and the browse list comes back.
  const [openGroupId, setOpenGroupId] = useState<PickerFieldGroupId | null>(
    null,
  );
  const hasFieldAndRole = discipline.length > 0 && profession.length > 0;
  const isShowingOnlyPicks = hasFieldAndRole && !isExpanded;
  // Latched the first time the picker shows just the picks: a member who
  // opened with a field and a role, including a draft that loads late. Only
  // they get the toggle. A member who picks their first field and role here
  // sets `isExpanded` with that pick, so the picker never folds for them.
  const [hasShownOnlyPicks, setHasShownOnlyPicks] = useState(false);
  if (isShowingOnlyPicks && !hasShownOnlyPicks) setHasShownOnlyPicks(true);
  const isSearching = !isShowingOnlyPicks && foldForSearch(query) !== "";
  const selection = { discipline, profession };
  const selectedFields = new Set(discipline);
  const selectedProfessions = new Set(profession);
  const picks = workPicks(selection);
  // `toggleWorkField` / `toggleWorkProfession` keep profession ⊆ discipline, so
  // an unlisted field's chip (`adultWork`) is present here whenever any of its
  // professions is picked too, which is why checking `discipline` alone works.
  const hasSelectedUnlistedWork = discipline.some(isUnlistedDiscipline);

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setShouldChipsGlide(false);
    setIsExpanded(true);
  };
  const toggleField = (fieldId: string) => {
    setShouldChipsGlide(true);
    setIsExpanded(true);
    onChange(toggleWorkField(selection, fieldId));
  };
  const toggleProfession = (professionId: string) => {
    setShouldChipsGlide(true);
    setIsExpanded(true);
    onChange(toggleWorkProfession(selection, professionId));
  };
  // Removing a pick leaves `isExpanded` alone, so trimming the picks while
  // the picker shows only them keeps it folded. A removal that leaves no
  // field and role opens the picker by itself, and the next pick there sets
  // `isExpanded`, so it never folds away under the member.
  const removePick = (pick: WorkPick) => {
    setShouldChipsGlide(true);
    const nextSelection = removeWorkPick(selection, pick);
    if (workPicks(nextSelection).length === 0)
      shouldFocusSearchRef.current = true;
    onChange(nextSelection);
  };
  const toggleShowAll = () => {
    setShouldChipsGlide(true);
    // Folding clears the query, so opening again shows the plain list.
    if (isExpanded) setQuery("");
    setIsExpanded(!isExpanded);
  };

  // Matched against the resolved `t()` labels, so the search works in the
  // active language. The helpers fold the raw query themselves. The member's
  // own picks stay in view in "Your picks" below whatever they type.
  const search = useMemo(
    () =>
      isSearching
        ? {
            fields: matchingFields(query, t),
            professionGroups: matchingProfessionGroups(query, t),
          }
        : null,
    [isSearching, query, t],
  );

  const fieldOptions = (search?.fields ?? []).map((field) => ({
    value: field.id,
    label: t(field.labelKey),
  }));
  const professionGroups = search?.professionGroups ?? [];
  // Every field holds roles, and a matching field brings all of them, so a
  // search has results exactly when it has groups. With none, the message sits
  // under the search box and points on to the browse list, which stays open.
  const hasNoMatch = search !== null && professionGroups.length === 0;

  return (
    <div ref={rootRef} className={className}>
      <div id={`${uid}-body`}>
        {/* The search folds away while the picker shows only the member's
          picks. The live region below stays mounted either way. */}
        <Collapse isOpen={!isShowingOnlyPicks}>
          <SearchInput
            inputRef={searchInputRef}
            className={styles.searchField}
            placeholder={t("members:workPicker.searchPlaceholder")}
            value={query}
            onChange={changeQuery}
            ariaLabel={t("members:workPicker.searchAriaLabel")}
          />
        </Collapse>
        {/* Always mounted so the live region exists before its text arrives.
          The message folds open and closed inside it; empty, it takes no
          space. */}
        <div role="status">
          <Collapse isOpen={hasNoMatch}>
            <p className={`${styles.prompt} ${styles.noMatch}`}>
              {t("members:workPicker.noMatch", { query: query.trim() })}
            </p>
          </Collapse>
        </div>
        <WorkPickerSearchResults
          isSearching={isSearching}
          fieldOptions={fieldOptions}
          professionGroups={professionGroups}
          selectedFields={selectedFields}
          selectedProfessions={selectedProfessions}
          shouldChipsGlide={shouldChipsGlide}
          onToggleField={toggleField}
          onToggleProfession={toggleProfession}
        />
        <WorkPickerPicks
          picks={picks}
          hasSelectedUnlistedWork={hasSelectedUnlistedWork}
          emptyFocusRef={searchInputRef}
          onRemove={removePick}
        />
        <Collapse isOpen={!isShowingOnlyPicks && (!isSearching || hasNoMatch)}>
          <WorkPickerBrowse
            discipline={discipline}
            profession={profession}
            pickCounts={pickCountsByGroup(picks)}
            openGroupId={openGroupId}
            onOpenGroupChange={setOpenGroupId}
            onToggleField={toggleField}
            onToggleProfession={toggleProfession}
          />
        </Collapse>
      </div>
      <Collapse isOpen={hasShownOnlyPicks && hasFieldAndRole}>
        <WorkPickerShowAllToggle
          isShowingOnlyPicks={isShowingOnlyPicks}
          controlsId={`${uid}-body`}
          onToggle={toggleShowAll}
        />
      </Collapse>
    </div>
  );
}
