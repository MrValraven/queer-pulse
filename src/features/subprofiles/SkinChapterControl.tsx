import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinChipsControl } from "./SkinChipsControl";
import { SkinChoiceChipsControl } from "./SkinChoiceChipsControl";
import { SkinEntriesControl } from "./SkinEntriesControl";
import { SkinLinesControl } from "./SkinLinesControl";
import { SkinMultiSelectControl } from "./SkinMultiSelectControl";
import { SkinCountControl, SkinMoneyControl } from "./SkinNumberControls";
import { SkinPairsControl } from "./SkinPairsControl";
import { SkinParagraphsControl } from "./SkinParagraphsControl";
import { SkinSegmentedControl } from "./SkinSegmentedControl";
import { SkinSelectControl } from "./SkinSelectControl";
import { SkinTextFieldControl } from "./SkinTextFieldControl";
import { SkinStringListControl } from "./SubprofileSkinBlocksEditor";

/**
 * One control of the chaptered skin editor, picked by its `kind`. Every
 * control is fully controlled by `editor` and saves with the global "Save
 * all". `grid` and `objectList` never appear in a chapter, so they render
 * nothing here.
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
  switch (control.kind) {
    case "chips":
      return <SkinChipsControl {...props} />;
    case "pairs":
      return <SkinPairsControl {...props} />;
    case "entries":
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
      return <SkinChoiceChipsControl {...props} />;
    case "multiSelect":
      return <SkinMultiSelectControl {...props} />;
    // `isWrapping` text is still a text control; SkinTextFieldControl reads it.
    case "text":
    case "textarea":
      return <SkinTextFieldControl {...props} />;
    case "select":
      return <SkinSelectControl control={control} editor={editor} />;
    case "lines":
      return <SkinLinesControl {...props} />;
    case "stringList":
      return <SkinStringListControl {...props} />;
    case "grid":
    case "objectList":
      return null;
  }
}
