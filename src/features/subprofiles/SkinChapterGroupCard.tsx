import { Fragment } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SkinBlockControl,
  SkinChapterDescriptor,
  SkinChapterGroup,
} from "./skinBlockFields.data";
import {
  isControlFilled,
  isControlVisible,
  numericValue,
} from "./skinChapterFill";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinChapterCardHeadingRow } from "./SkinChapterCardCount";
import { ControlSlot, EmptyMark } from "./SkinChapterControlSlot";
import editorStyles from "./SubprofileEditor.module.css";
import styles from "./SkinChapterEditor.module.css";

/** Whether a two-control row breaks its `check`. Blank or non-numeric values
 *  never warn. Both rules read "first ≤ second". */
function isRowCheckFailing(
  group: SkinChapterGroup,
  editor: SubprofileSkinBlocksEditor,
): boolean {
  const [firstControl, secondControl] = group.controls;
  if (!group.check || !firstControl || !secondControl) return false;
  const first = numericValue(editor.getValue(firstControl.path));
  const second = numericValue(editor.getValue(secondControl.path));
  if (first === null || second === null) return false;
  return first > second;
}

/** A row's warning, in a polite live region that is always mounted, so the
 *  message is announced as it appears. */
function RowCheckWarning({
  group,
  editor,
}: {
  group: SkinChapterGroup;
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const isFailing = isRowCheckFailing(group, editor);
  return (
    <div aria-live="polite">
      {isFailing && group.checkMessageKey && (
        <p className={styles.checkWarning}>
          <FiAlertCircle size={15} aria-hidden />
          {t(group.checkMessageKey)}
        </p>
      )}
    </div>
  );
}

/** A control's own label repeats the card heading, so the control drops it. */
function isLabelHiddenFor(
  control: SkinBlockControl,
  headingKey: string | undefined,
): boolean {
  return headingKey !== undefined && control.labelKey === headingKey;
}

/** One group's controls inside a card: stacked, or side by side
 *  (`layout: "row"`) with the joiner word between them. */
function GroupBody({
  group,
  editor,
  visibleControls,
  headingKey,
}: {
  group: SkinChapterGroup;
  editor: SubprofileSkinBlocksEditor;
  visibleControls: SkinBlockControl[];
  headingKey: string | undefined;
}) {
  const { t } = useTranslation();
  const helper = group.helperKey && group.titleKey === undefined && (
    <p className={styles.continuationNote}>{t(group.helperKey)}</p>
  );

  if (group.layout !== "row") {
    return (
      <>
        {helper}
        {visibleControls.map((control) => (
          <ControlSlot
            key={control.path}
            control={control}
            editor={editor}
            isLabelHidden={isLabelHiddenFor(control, headingKey)}
          />
        ))}
      </>
    );
  }

  return (
    <div className={styles.rowGroup}>
      <div className={styles.row}>
        {visibleControls.map((control, index) => (
          <Fragment key={control.path}>
            {index > 0 && group.joinerKey && (
              <span className={styles.joiner}>{t(group.joinerKey)}</span>
            )}
            <ControlSlot
              control={control}
              editor={editor}
              isLabelHidden={isLabelHiddenFor(control, headingKey)}
              extraClassName={styles.rowControl}
            />
          </Fragment>
        ))}
      </div>
      {helper}
      {group.check && <RowCheckWarning group={group} editor={editor} />}
    </div>
  );
}

/**
 * One card of a chapter: the first group's serif heading and helper, then
 * that group's controls and those of any untitled groups folded in after it
 * (the sliding scale's range, places and rules read as one card). A control
 * whose label repeats the heading drops its own label. The heading carries
 * the card's fill count, and each visible control still empty says "(empty)"
 * to screen readers. Controls hidden by `showWhen` are left out, and fade in
 * when they appear.
 */
export function SkinChapterGroupCard({
  groups,
  editor,
  chapters,
}: {
  groups: SkinChapterGroup[];
  editor: SubprofileSkinBlocksEditor;
  chapters: SkinChapterDescriptor[];
}) {
  const { t } = useTranslation();
  const headGroup = groups[0];
  const shownGroups = groups
    .map((group) => ({
      group,
      visibleControls: group.controls.filter((control) =>
        isControlVisible(control, editor, chapters),
      ),
    }))
    .filter(({ visibleControls }) => visibleControls.length > 0);
  if (!headGroup || shownGroups.length === 0) return null;
  const isHeadingMarkedEmpty = shownGroups.some(({ visibleControls }) =>
    visibleControls.some(
      (control) =>
        isLabelHiddenFor(control, headGroup.titleKey) &&
        !isControlFilled(control, editor),
    ),
  );
  const heading = headGroup.titleKey && (
    <h4 className={`${editorStyles.cardTitle} ${styles.cardHeading}`}>
      {isHeadingMarkedEmpty && <EmptyMark />}
      {t(headGroup.titleKey)}
    </h4>
  );

  return (
    <section className={`${editorStyles.card} ${styles.card}`}>
      {heading ? (
        <SkinChapterCardHeadingRow
          heading={heading}
          controls={shownGroups.flatMap(
            ({ visibleControls }) => visibleControls,
          )}
          editor={editor}
        />
      ) : null}
      {headGroup.helperKey && headGroup.titleKey && (
        <p className={editorStyles.cardNote}>{t(headGroup.helperKey)}</p>
      )}
      <div className={styles.stack}>
        {shownGroups.map(({ group, visibleControls }, groupIndex) => (
          <GroupBody
            key={group.controls[0]?.path ?? groupIndex}
            group={group}
            editor={editor}
            visibleControls={visibleControls}
            headingKey={headGroup.titleKey}
          />
        ))}
      </div>
    </section>
  );
}
