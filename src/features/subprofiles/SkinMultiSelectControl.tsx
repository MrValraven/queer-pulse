import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinMultiSelectInline } from "./SkinMultiSelectInline";

/**
 * A `multiSelect` control (therapist lived experience, languages): the
 * featured options as a row of toggle chips, then what else is chosen, and a
 * trailing chip that opens a checklist of the other `options`. With
 * `allowsCustom`, the checklist also takes the owner's own words.
 *
 * The checklist renders in flow under the row and pushes the card's content
 * down. A popover would overlap the next card and the sticky savebar, and on
 * a phone the pane sits inside a sheet, so in flow reads the same everywhere.
 */
export function SkinMultiSelectControl(props: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  return <SkinMultiSelectInline {...props} />;
}
