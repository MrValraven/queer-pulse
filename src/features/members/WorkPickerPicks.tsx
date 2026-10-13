import { useId, type RefObject } from "react";
import { ChipList, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WorkPick } from "./workFieldPicker.data";
import styles from "./WorkFieldPicker.module.css";

interface WorkPickerPicksProps {
  /** The chips to show, from `workPicks`. The block folds away when empty. */
  picks: WorkPick[];
  /** Whether a picked field is one the directory never lists, which shows
   *  the privacy note under the chips. */
  hasSelectedUnlistedWork: boolean;
  /** Where focus goes when the last chip is removed: the search box. */
  emptyFocusRef: RefObject<HTMLElement | null>;
  onRemove: (pick: WorkPick) => void;
}

/**
 * The work picker's "Your picks" block: every picked role, and each picked
 * field that has no role yet, as one row of removable chips. It stays on
 * screen in every mode, so a member always sees what they chose, and it is
 * the whole picker while it shows only their picks.
 *
 * The whole block folds open with the first pick and away with the last.
 * The `Collapse` gives the `ChipList` the presence of its own that a
 * conditional mount needs (see `ChipList`).
 */
export function WorkPickerPicks({
  picks,
  hasSelectedUnlistedWork,
  emptyFocusRef,
  onRemove,
}: WorkPickerPicksProps) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <Collapse isOpen={picks.length > 0}>
      <div className={styles.picks}>
        <div className={styles.head} id={headingId}>
          {t("members:workPicker.picksHeading")}
        </div>
        <div role="group" aria-labelledby={headingId}>
          <ChipList
            items={picks}
            getKey={(pick) => `${pick.kind}:${pick.id}`}
            renderLabel={(pick) => t(pick.labelKey)}
            removeLabel={(pick) =>
              t("members:workPicker.removePick", { label: t(pick.labelKey) })
            }
            onRemove={(pick) => onRemove(pick)}
            emptyFocusRef={emptyFocusRef}
          />
        </div>
        <Collapse isOpen={hasSelectedUnlistedWork}>
          <p className={`${styles.prompt} ${styles.unlistedNote}`}>
            {t("members:workPicker.unlistedNote")}
          </p>
        </Collapse>
      </div>
    </Collapse>
  );
}
