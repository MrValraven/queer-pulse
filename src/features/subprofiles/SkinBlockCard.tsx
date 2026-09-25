import type { ReactNode } from "react";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SkinBlockControl,
  SkinBlockDescriptor,
} from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinSelectControl } from "./SkinSelectControl";
import { SkinChoiceChipsControl } from "./SkinChoiceChipsControl";
import { SkinEntriesControl } from "./SkinEntriesControl";
import { SkinLinesControl } from "./SkinLinesControl";
import { SkinPairsControl } from "./SkinPairsControl";
import { SkinParagraphsControl } from "./SkinParagraphsControl";
import { SkinAvailabilityGrid } from "./SkinAvailabilityGrid";
import styles from "./SubprofileEditor.module.css";
import cardStyles from "./SkinBlockCard.module.css";

interface SkinBlockControlProps {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}

/** A single-line / multi-line text sub-field of an object block. */
function SkinTextControl({ control, editor }: SkinBlockControlProps) {
  const { t } = useTranslation();
  const raw = editor.getValue(control.path);
  const value = typeof raw === "string" ? raw : "";
  const placeholder = control.placeholderKey
    ? t(control.placeholderKey)
    : undefined;

  return (
    <FormField
      label={t(control.labelKey)}
      helper={control.helperKey ? t(control.helperKey) : undefined}
    >
      {control.kind === "textarea" ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            editor.setValue(control.path, event.target.value)
          }
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            editor.setValue(control.path, event.target.value)
          }
        />
      )}
    </FormField>
  );
}

/** A list control dressed as one of the card's FormFields
 *  (SkinBlockCard.module.css): the visible label is drawn here, in
 *  FormField's voice, while the list keeps its own label for assistive tech
 *  only, so the name is announced once. */
function SkinBlockListField({
  control,
  isLabelHidden,
  children,
}: {
  control: SkinBlockControl;
  isLabelHidden: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={cardStyles.listField}>
      {!isLabelHidden && (
        <span className={cardStyles.listLabel} aria-hidden="true">
          {t(control.labelKey)}
        </span>
      )}
      {children}
    </div>
  );
}

/** The list control for a list `kind`, or null for any other kind. The
 *  older `stringList` and `objectList` names route to `lines` and
 *  `entries`. */
function listControlFor({ control, editor }: SkinBlockControlProps) {
  const props = { control, editor, isLabelHidden: true };
  switch (control.kind) {
    case "lines":
    case "stringList":
      return <SkinLinesControl {...props} />;
    case "entries":
    case "objectList":
      return <SkinEntriesControl {...props} />;
    case "pairs":
      return <SkinPairsControl {...props} />;
    case "paragraphs":
      return <SkinParagraphsControl {...props} />;
    default:
      return null;
  }
}

/** One control of a block card, picked by its `kind`. Lists render the
 *  chaptered editor's row controls (drag grip, Alt+arrow, glide) inside
 *  `SkinBlockListField`, so they read as the card's other fields. */
function SkinBlockControlField({
  control,
  editor,
  isLabelHidden,
}: SkinBlockControlProps & { isLabelHidden: boolean }) {
  const listControl = listControlFor({ control, editor });
  if (listControl) {
    return (
      <SkinBlockListField control={control} isLabelHidden={isLabelHidden}>
        {listControl}
      </SkinBlockListField>
    );
  }
  switch (control.kind) {
    case "grid":
      return <SkinAvailabilityGrid control={control} editor={editor} />;
    case "select":
      return <SkinSelectControl control={control} editor={editor} />;
    case "choice":
    case "multiChoice":
      return (
        <SkinChoiceChipsControl
          control={control}
          editor={editor}
          isLabelHidden={isLabelHidden}
        />
      );
    default:
      return <SkinTextControl control={control} editor={editor} />;
  }
}

/** One `SkinData` block as a card: its heading (when it groups more than one
 *  control, or carries a helper) plus each labelled control. A helper always
 *  sits between the heading and the fields, and a list whose own label would
 *  repeat the heading drops that label. */
export function SkinBlockCard({
  block,
  editor,
}: {
  block: SkinBlockDescriptor;
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const isHeadingShown = block.controls.length > 1 || Boolean(block.helperKey);

  return (
    <section className={styles.card}>
      {isHeadingShown && (
        <h3 className={styles.cardTitle}>{t(block.titleKey)}</h3>
      )}
      {block.helperKey && (
        <p className={styles.cardNote}>{t(block.helperKey)}</p>
      )}
      {block.controls.map((control) => (
        <SkinBlockControlField
          key={control.path}
          control={control}
          editor={editor}
          isLabelHidden={isHeadingShown && control.labelKey === block.titleKey}
        />
      ))}
    </section>
  );
}
