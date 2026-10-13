import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiChevronDown } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { ChipSelect, Collapse } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { CHIP_EASE } from "../../shared/components/ui/useChipMotion";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PROFESSIONS_BY_FIELD } from "./memberDirectoryFilter.data";
import {
  PICKER_FIELD_GROUPS,
  type PickerFieldGroup,
  type PickerFieldGroupId,
  type WorkFieldSelection,
} from "./workFieldPicker.data";
import { fieldLabelKey } from "./workTaxonomy.data";
import styles from "./WorkFieldPicker.module.css";

/** How long a group's pick count takes to fade in or out, in seconds. */
const COUNT_FADE_DURATION = 0.18;

interface WorkPickerBrowseProps extends WorkFieldSelection {
  /** How many of the member's picks sit in each group (`pickCountsByGroup`). */
  pickCounts: ReadonlyMap<PickerFieldGroupId, number>;
  /** The one group open right now, or null with every group closed. */
  openGroupId: PickerFieldGroupId | null;
  onOpenGroupChange: (groupId: PickerFieldGroupId | null) => void;
  onToggleField: (fieldId: string) => void;
  onToggleProfession: (professionId: string) => void;
}

/**
 * The work picker's "browse by field" list: ten group rows, each opening
 * onto its fields. One group is open at a time, so the list stays short
 * enough to scan. Opening a group closes the one before, and pressing the
 * open one closes it.
 *
 * Inside an open group a picked field brings its roles under its own name,
 * so a role always shows which field it belongs to.
 *
 * `data-keep-in-place` holds a pressed row or chip under the member's finger
 * while the list reflows around it (`useKeepInPlace`): a group closing above
 * the one just opened, "Your picks" opening above a first pick.
 */
export function WorkPickerBrowse({
  discipline,
  profession,
  pickCounts,
  openGroupId,
  onOpenGroupChange,
  onToggleField,
  onToggleProfession,
}: WorkPickerBrowseProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const selectedFields = new Set(discipline);
  const selectedProfessions = new Set(profession);
  return (
    <div className={styles.browse} data-keep-in-place="">
      <div className={styles.head} id={headingId}>
        {t("members:workPicker.browseHeading")}
      </div>
      <ul className={styles.groupList} aria-labelledby={headingId}>
        {PICKER_FIELD_GROUPS.map((group) => (
          <WorkPickerGroup
            key={group.id}
            group={group}
            isOpen={openGroupId === group.id}
            pickCount={pickCounts.get(group.id) ?? 0}
            selectedFields={selectedFields}
            selectedProfessions={selectedProfessions}
            onToggleOpen={() =>
              onOpenGroupChange(openGroupId === group.id ? null : group.id)
            }
            onToggleField={onToggleField}
            onToggleProfession={onToggleProfession}
          />
        ))}
      </ul>
    </div>
  );
}

interface WorkPickerGroupProps {
  group: PickerFieldGroup;
  isOpen: boolean;
  pickCount: number;
  selectedFields: Set<string>;
  selectedProfessions: Set<string>;
  onToggleOpen: () => void;
  onToggleField: (fieldId: string) => void;
  onToggleProfession: (professionId: string) => void;
}

/** One group: a full-width row button over a body that folds open with its
 *  field chips, then the roles of each picked field. Every field keeps its
 *  own `Collapse` slot in the group's order, so a field's roles fold in at
 *  that field's place and the others keep theirs. The chevron turns over off
 *  `aria-expanded`. */
function WorkPickerGroup({
  group,
  isOpen,
  pickCount,
  selectedFields,
  selectedProfessions,
  onToggleOpen,
  onToggleField,
  onToggleProfession,
}: WorkPickerGroupProps) {
  const { t } = useTranslation();
  const uid = useId();
  const labelId = `${uid}-label`;
  const panelId = `${uid}-panel`;
  return (
    <li className={styles.group}>
      <button
        type="button"
        className={styles.groupToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggleOpen}
      >
        <span id={labelId} className={styles.groupLabel}>
          {t(group.labelKey)}
        </span>
        <GroupPickCount count={pickCount} />
        <FiChevronDown className={styles.groupChevron} aria-hidden />
      </button>
      {/* Always mounted, so `aria-controls` names an element that exists
        while the body is folded away. */}
      <div id={panelId}>
        <Collapse isOpen={isOpen}>
          <div className={styles.groupBody}>
            <ChipSelect
              isPresenceAnimated
              labelledBy={labelId}
              options={group.fieldIds.map((fieldId) => ({
                value: fieldId,
                label: t(fieldLabelKey(fieldId)),
              }))}
              selected={selectedFields}
              onToggle={onToggleField}
            />
            {group.fieldIds.map((fieldId) => (
              <Collapse key={fieldId} isOpen={selectedFields.has(fieldId)}>
                <FieldRoles
                  fieldId={fieldId}
                  selectedProfessions={selectedProfessions}
                  onToggleProfession={onToggleProfession}
                />
              </Collapse>
            ))}
          </div>
        </Collapse>
      </div>
    </li>
  );
}

/** A picked field's roles under the field's name, which also names the chip
 *  row for a screen reader. */
function FieldRoles({
  fieldId,
  selectedProfessions,
  onToggleProfession,
}: {
  fieldId: string;
  selectedProfessions: Set<string>;
  onToggleProfession: (professionId: string) => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <div className={styles.fieldRoles}>
      <p id={headingId} className={styles.resultGroupLabel}>
        {t(fieldLabelKey(fieldId))}
      </p>
      <ChipSelect
        isPresenceAnimated
        labelledBy={headingId}
        options={(PROFESSIONS_BY_FIELD[fieldId] ?? []).map((option) => ({
          value: option.id,
          label: t(option.labelKey),
        }))}
        selected={selectedProfessions}
        onToggle={onToggleProfession}
      />
    </div>
  );
}

/** The quiet "{count} picked" beside a group's label. It fades in with the
 *  group's first pick and out with its last, and the figure rolls as it
 *  changes. Reduced motion makes the fade instant. */
function GroupPickCount({ count }: { count: number }) {
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: COUNT_FADE_DURATION, ease: CHIP_EASE };
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="count"
          className={styles.groupCount}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <Translation
            i18nKey="members:workPicker.groupPickCount"
            values={{ count }}
            slots={{
              count: (
                <RollingNumber value={fmt.number(count)} numericValue={count} />
              ),
            }}
          />
        </m.span>
      )}
    </AnimatePresence>
  );
}
