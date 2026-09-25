import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinChipsControl } from "./SkinChipsControl";
import { SkinChoiceChipsRefined } from "./SkinChoiceChipsRefined";
import { SkinEntriesControl } from "./SkinEntriesControl";
import { SkinLinesControl } from "./SkinLinesControl";
import { SkinMultiSelectControl } from "./SkinMultiSelectControl";
import { SkinCountControl, SkinMoneyControl } from "./SkinNumberControls";
import { SkinPairsControl } from "./SkinPairsControl";
import { SkinParagraphsControl } from "./SkinParagraphsControl";
import { SkinQuoteControl } from "./SkinQuoteControl";
import { SkinSegmentedControl } from "./SkinSegmentedControl";
import { SkinSelectControl } from "./SkinSelectControl";
import { SkinTextFieldControl } from "./SkinTextFieldControl";
import { TherapistTopicsControl } from "./TherapistTopicsControl";

/**
 * One control of the chaptered skin editor, picked by its `kind`. Every
 * control is fully controlled by `editor` and saves with the global "Save
 * all". The older `stringList` and `objectList` names route to `lines` and
 * `entries`, as in the blocks editor. `grid` never appears in a chapter, so
 * it renders nothing here. The quote (a text control with
 * `hasEmphasisPreview`) gets its own writing surface. Choice chips render `SkinChoiceChipsRefined` directly:
 * `SkinChoiceChipsControl` and `SkinSelectControl` keep the older look for
 * the generic blocks editor (SubprofileSkinBlocksEditor), and no chapter
 * declares a `select`.
 */
export function SkinChapterControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const props = { control, editor, isLabelHidden };
  const isTextKind = control.kind === "text" || control.kind === "textarea";
  if (isTextKind && control.hasEmphasisPreview) {
    return <SkinQuoteControl {...props} />;
  }
  switch (control.kind) {
    case "chips":
      return <SkinChipsControl {...props} />;
    case "pairs":
      return <SkinPairsControl {...props} />;
    case "entries":
    case "objectList":
      return <SkinEntriesControl {...props} />;
    case "paragraphs":
      return <SkinParagraphsControl {...props} />;
    case "money":
      return <SkinMoneyControl {...props} />;
    case "count":
      return <SkinCountControl {...props} />;
    case "segmented":
      return <SkinSegmentedControl {...props} />;
    case "choice":
    case "multiChoice":
      return <SkinChoiceChipsRefined {...props} />;
    case "multiSelect":
      return <SkinMultiSelectControl {...props} />;
    // `isWrapping` text is still a text control; SkinTextFieldControl reads it.
    case "text":
    case "textarea":
      return <SkinTextFieldControl {...props} />;
    case "select":
      return <SkinSelectControl control={control} editor={editor} />;
    case "lines":
    case "stringList":
      return <SkinLinesControl {...props} />;
    // Edits the persona section's rows through the editor context.
    case "sectionItems":
      return (
        <TherapistTopicsControl
          control={control}
          isLabelHidden={isLabelHidden}
        />
      );
    case "grid":
      return null;
  }
}
