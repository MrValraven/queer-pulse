import { useEditorDesk } from "./desk/useEditorDesk";
import { EditorDashboardView } from "./EditorDashboardView";

/**
 * The magazine editor desk. Thin by design: `useEditorDesk` composes the
 * dual-mode data hooks, the table's filter, grouping and selection state,
 * the peek panel, pitch triage, the overlay slot and the keyboard layer;
 * `EditorDashboardView` renders the page and its overlays. The command
 * palette lives in `MagazineDeskShell` (it runs on every editor surface), and
 * the desk's shortcuts stay off while it is open.
 */
export function EditorDashboardPage() {
  const desk = useEditorDesk();
  return <EditorDashboardView desk={desk} />;
}
