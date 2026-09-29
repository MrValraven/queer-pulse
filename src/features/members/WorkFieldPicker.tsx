import { useId, useMemo, useState } from "react";
import { MeasuredHeightFrame } from "../../shared/components/layout/MeasuredHeightFrame";
import { ChipSelect, Collapse, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DISCIPLINES,
  isUnlistedDiscipline,
} from "./memberDirectoryFilter.data";
import {
  foldForSearch,
  matchingFields,
  matchingProfessionGroups,
  toggleWorkField,
  toggleWorkProfession,
  type WorkFieldSelection,
} from "./workFieldPicker.data";
import { WorkProfessionArea } from "./WorkProfessionArea";
import { ResultChipGlide } from "./WorkProfessionResults";
import styles from "./WorkFieldPicker.module.css";

interface WorkFieldPickerProps extends WorkFieldSelection {
  onChange: (next: WorkFieldSelection) => void;
  /** Class applied to the two visible sub-headings, so each host surface can
   *  render them in its own label style (the profile editors' uppercase field
   *  label). Defaults to the picker's own. */
  headingClassName?: string;
  className?: string;
}

/**
 * The shared "what do you do" picker: broad field(s) of work, then the
 * professions within them. Used by the profile editor, the onboarding wizard
 * and Settings → Interests, so the `profession ⊆ discipline` invariant and the
 * chip vocabulary live in one place instead of drifting across three.
 *
 * Both levels are multi-select: real bios already describe more than one role
 * ("Dancer, model & venture builder"), so a single-select would under-fit from
 * day one. Without a search, professions stay hidden until a field is chosen:
 * the flat pool is ~70 chips, too many to scan as one choice.
 *
 * The search box shows which roles exist: a query matching a field's name
 * lists all of that field's roles, and one matching a role's name lists that
 * role, all grouped by field so a member can pick a role straight away.
 * `toggleWorkProfession` adds the parent field, which keeps a searched pick
 * coherent with the field chips.
 *
 * Values are the ids the member directory filters on, so anything picked here
 * is immediately findable under "What they do" / "Profession" in /members.
 */
export function WorkFieldPicker({
  discipline,
  profession,
  onChange,
  headingClassName,
  className,
}: WorkFieldPickerProps) {
  const { t } = useTranslation();
  const uid = useId();
  const [query, setQuery] = useState("");
  // The fields selected when the query last changed. They stay among the field
  // chips until the next change, so deselecting one mid-search leaves its chip
  // (and keyboard focus) where it was.
  const [keptFieldIds, setKeptFieldIds] = useState<string[]>([]);
  // Whether the chips glide to their new places, set by what changed them
  // last. A keystroke can move a chip ten rows across others fading out, so
  // the query reflows the chips at once and only those joining or leaving
  // fade. A toggle keeps the glide, which carries a chip's neighbours over as
  // its tick changes its width.
  const [shouldChipsGlide, setShouldChipsGlide] = useState(true);
  const isSearching = foldForSearch(query) !== "";
  const headingClass = headingClassName ?? styles.head;
  const selection = { discipline, profession };
  const selectedProfessions = new Set(profession);
  // `toggleWorkField` / `toggleWorkProfession` keep profession ⊆ discipline, so
  // an unlisted field's chip (`adultWork`) is present here whenever any of its
  // professions is picked too, which is why checking `discipline` alone works.
  const hasSelectedUnlistedWork = discipline.some(isUnlistedDiscipline);

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setKeptFieldIds(discipline);
    setShouldChipsGlide(false);
  };
  const toggleField = (fieldId: string) => {
    setShouldChipsGlide(true);
    onChange(toggleWorkField(selection, fieldId));
  };

  // Matched against the resolved `t()` labels, so the search works in the
  // active language. The helpers fold the raw query themselves. Selected
  // fields stay among the field chips whatever the query, so a member never
  // loses sight of their picks while typing.
  const search = useMemo(
    () =>
      isSearching
        ? {
            fields: matchingFields(query, t, [
              ...new Set([...keptFieldIds, ...discipline]),
            ]),
            professionGroups: matchingProfessionGroups(query, t),
          }
        : null,
    [isSearching, query, t, keptFieldIds, discipline],
  );

  const fieldOptions = (search?.fields ?? DISCIPLINES).map((field) => ({
    value: field.id,
    label: t(field.labelKey),
  }));
  const professionGroups = search?.professionGroups ?? [];
  // Every field holds roles, and a matching field brings all of them, so a
  // search has results exactly when it has groups. With none, the message sits
  // under the search box and the role section stays only to list the member's
  // own fields' roles.
  const hasNoMatch = search !== null && professionGroups.length === 0;
  const shouldShowProfessionSection = !hasNoMatch || discipline.length > 0;
  const toggleProfession = (professionId: string) => {
    setShouldChipsGlide(true);
    onChange(toggleWorkProfession(selection, professionId));
  };

  return (
    <div className={className}>
      <SearchInput
        className={styles.searchField}
        placeholder={t("members:workPicker.searchPlaceholder")}
        value={query}
        onChange={changeQuery}
        ariaLabel={t("members:workPicker.searchAriaLabel")}
      />
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
      {/* The heading and its row fold away together once a search leaves
          no field to show, so the heading never stands alone, and the row's
          last chips fold with it. The frame eases the row's height as it
          gains or loses a line. The fold sits outside the frame, where the
          frame never chases it. */}
      <Collapse isOpen={fieldOptions.length > 0}>
        <div className={headingClass} id={`${uid}-field`}>
          {t("members:workPicker.fieldHeading")}
        </div>
        <MeasuredHeightFrame>
          <ChipSelect
            isPresenceAnimated
            shouldGlide={shouldChipsGlide}
            labelledBy={`${uid}-field`}
            options={fieldOptions}
            selected={new Set(discipline)}
            onToggle={toggleField}
          />
        </MeasuredHeightFrame>
      </Collapse>

      <Collapse isOpen={shouldShowProfessionSection}>
        <div className={styles.professionGroup}>
          <div className={headingClass} id={`${uid}-profession`}>
            {t("members:workPicker.professionHeading")}
          </div>
          <ResultChipGlide shouldGlide={shouldChipsGlide}>
            <WorkProfessionArea
              groups={professionGroups}
              discipline={discipline}
              roleHeadingId={`${uid}-profession`}
              selected={selectedProfessions}
              onToggle={toggleProfession}
            />
          </ResultChipGlide>
          <Collapse isOpen={hasSelectedUnlistedWork}>
            <p className={`${styles.prompt} ${styles.unlistedNote}`}>
              {t("members:workPicker.unlistedNote")}
            </p>
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}
