import { createContext, type ReactNode, useContext, useId } from "react";
import { ChipSelect, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DISCIPLINES } from "./memberDirectoryFilter.data";
import type { ProfessionGroup } from "./workFieldPicker.data";
import styles from "./WorkFieldPicker.module.css";

/**
 * Above this many role chips across every group the search currently shows,
 * chips stop popping/gliding individually and each group instead only fades
 * with its own `Collapse` (see `isPresenceAnimated` below). A broad
 * substring query (a single common letter) can match most of `DISCIPLINES`'s
 * ~317 roles at once, which would otherwise mount hundreds of `m.button`
 * layout-projection nodes and re-measure all of them on every keystroke. A
 * typical search or picking a handful of fields stays well under this and
 * keeps the full per-chip motion.
 */
const PRESENCE_CHIP_LIMIT = 40;

/** Whether the result chips glide to their new places. Carried by context,
 *  so the picker can set it across the role area that renders the results. */
const ResultChipGlideContext = createContext(true);

/**
 * Sets whether the search results' chips glide (`ChipSelect`'s
 * `shouldGlide`). The work picker turns it off while the query drives the
 * change, so a keystroke reflows the chips at once and only the chips joining
 * or leaving fade, and turns it back on for a toggle, so a tick's width change
 * still glides its neighbours over.
 */
export function ResultChipGlide({
  shouldGlide,
  children,
}: {
  shouldGlide: boolean;
  children: ReactNode;
}) {
  return (
    <ResultChipGlideContext.Provider value={shouldGlide}>
      {children}
    </ResultChipGlideContext.Provider>
  );
}

interface WorkProfessionResultsProps {
  groups: ProfessionGroup[];
  /** `id` of the picker's "Your role" heading. Each group's chip row is named
   *  by it plus the field label, so a screen reader hears the group as roles
   *  within that field. */
  roleHeadingId: string;
  selected: Set<string>;
  onToggle: (professionId: string) => void;
}

/**
 * The work picker's search results: each profession the search reveals sits
 * under its parent field's label, so a result like "Nurse" always shows where
 * it belongs. Each group is its own chip row labelled by the role heading and
 * that field, matching the member directory's profession search
 * (`FilterProfessions.tsx`).
 *
 * As the query changes, a group that joins or leaves folds open or closed, so
 * the groups after it slide with the real layout and carry their chip rows
 * along, while the chips inside each group come and go on their own.
 *
 * Every field keeps its own `Collapse` slot, in field order, so a group keeps
 * its place. One shared AnimatePresence would reinsert leaving groups among
 * the staying ones, which React counts as a move, and in development
 * StrictMode re-runs a moved group's effects: that cancels any chip exit
 * inside it and leaves the chip stuck on screen.
 *
 * Past `PRESENCE_CHIP_LIMIT` total roles, every group's `ChipSelect` drops
 * its per-chip presence motion: the roles still appear and disappear as the
 * query changes, carried by that group's own `Collapse` fold, but individual
 * chips no longer pop in, pop out or glide to a new place.
 */
export function WorkProfessionResults({
  groups,
  roleHeadingId,
  selected,
  onToggle,
}: WorkProfessionResultsProps) {
  const { t } = useTranslation();
  const uid = useId();
  const groupsByField = new Map(groups.map((group) => [group.fieldId, group]));
  const totalProfessionCount = groups.reduce(
    (total, group) => total + group.professions.length,
    0,
  );
  const isPresenceAnimated = totalProfessionCount <= PRESENCE_CHIP_LIMIT;
  const shouldGlide = useContext(ResultChipGlideContext);

  return (
    <div className={styles.resultGroups}>
      {DISCIPLINES.map((field) => {
        const group = groupsByField.get(field.id);
        const groupLabelId = `${uid}-${field.id}`;
        return (
          <Collapse key={field.id} isOpen={group !== undefined}>
            {group && (
              <div className={styles.resultGroup}>
                <p id={groupLabelId} className={styles.resultGroupLabel}>
                  {t(group.labelKey)}
                </p>
                <ChipSelect
                  isPresenceAnimated={isPresenceAnimated}
                  shouldGlide={shouldGlide}
                  labelledBy={`${roleHeadingId} ${groupLabelId}`}
                  options={group.professions.map((option) => ({
                    value: option.id,
                    label: t(option.labelKey),
                  }))}
                  selected={selected}
                  onToggle={onToggle}
                />
              </div>
            )}
          </Collapse>
        );
      })}
    </div>
  );
}
