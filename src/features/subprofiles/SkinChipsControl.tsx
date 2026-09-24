import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinChipsRefined } from "./SkinChipsRefined";

/**
 * A `chips` control: an ordered `string[]` edited as a row of chips above
 * an add input (therapist modalities, access, ...). Type and press Enter to
 * add, click a chip to edit it in place, drag or Alt+arrow to reorder,
 * Delete or the cross to remove. Only trimmed, non-blank,
 * case-insensitively unique entries are ever stored. `SkinChipsRefined`
 * renders it over the `useSkinChipsField` wiring.
 */
export function SkinChipsControl(props: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  return <SkinChipsRefined {...props} />;
}
