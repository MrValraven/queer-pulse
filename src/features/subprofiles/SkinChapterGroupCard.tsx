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
import { skinFieldAnchorId } from "./skinFieldAnchor";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinChapterControl } from "./SkinChapterControl";
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

/** The quiet "still empty" mark: an amber dot in the card's left gutter, and
 *  "(empty)" for screen readers. */
function EmptyMark() {
  const { t } = useTranslation();
  return (
    <>
      <span className={styles.emptyDot} aria-hidden />
      <span className="visuallyHidden">
        {t("subprofiles:skinChapter.empty")}
      </span>
    </>
  );
}

/** One control in its wrapper: the jump target (`skinFieldAnchorId`), the
 *  empty mark before its label (the card heading carries it when the label is
 *  hidden) and, for a `showWhen` control, the fade-in as it appears. */
function ControlSlot({
  control,
  editor,
  headingKey,
  extraClassName,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  headingKey: string | undefined;
  extraClassName?: string;
}) {
  const isLabelHidden = isLabelHiddenFor(control, headingKey);
  const isMarkedEmpty = !isLabelHidden && !isControlFilled(control, editor);
  const className = [
    styles.slot,
    control.showWhen ? styles.revealed : "",
    extraClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div id={skinFieldAnchorId(control.path)} className={className}>
      {isMarkedEmpty && <EmptyMark />}
      <SkinChapterControl
        control={control}
        editor={editor}
        isLabelHidden={isLabelHidden}
      />
    </div>
  );
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
            headingKey={headingKey}
          />
        ))}
      </>
    );
  }

  return (
    <div className={styles.rowGroup}>
      {helper}
      <div className={styles.row}>
        {visibleControls.map((control, index) => (
          <Fragment key={control.path}>
            {index > 0 && group.joinerKey && (
              <span className={styles.joiner}>{t(group.joinerKey)}</span>
            )}
            <ControlSlot
              control={control}
              editor={editor}
              headingKey={headingKey}
              extraClassName={styles.rowControl}
            />
          </Fragment>
        ))}
      </div>
      {group.check && <RowCheckWarning group={group} editor={editor} />}
    </div>
  );
}

/**
 * One card of a chapter: the first group's serif heading and helper, then
 * that group's controls and those of any untitled groups folded in after it
 * (the sliding scale's range, places and rules read as one card). A control
 * whose label repeats the heading drops its own label. Each visible control
 * still empty gets a quiet amber mark. Controls hidden by `showWhen` are left
 * out, and fade in when they appear.
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

  return (
    <section className={`${editorStyles.card} ${styles.card}`}>
      {headGroup.titleKey && (
        <h4 className={`${editorStyles.cardTitle} ${styles.cardHeading}`}>
          {isHeadingMarkedEmpty && <EmptyMark />}
          {t(headGroup.titleKey)}
        </h4>
      )}
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
