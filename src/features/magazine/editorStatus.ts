import type { Editor } from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

/**
 * The status-dot class for an editor's avatar chip on the editor dashboard.
 * Extracted here so the identical helper isn't copy-pasted into every card,
 * row, and popover that renders an editor chip.
 */
export function editorDot(editor: Editor): string | undefined {
  return editor === "Marta" ? styles.edMarta : styles.edSara;
}
