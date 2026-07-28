import {
  ProgressCard,
  EditorLoadCard,
  SectionBudgetCard,
  ContributorMixCard,
  ActivityCard,
  QuickActionsCard,
} from "./EditorSideCards";
import type { Piece, Editor } from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

/** The sticky right rail: progress, load, section budget, contributors, activity, quick actions. */
export function EditorSidebar({
  pieces,
  me,
  query,
  onStub,
}: {
  pieces: Piece[];
  me: Editor;
  query: string;
  onStub: (message: string) => void;
}) {
  return (
    <aside className={styles.edSide}>
      <ProgressCard pieces={pieces} />
      <EditorLoadCard pieces={pieces} me={me} />
      <SectionBudgetCard />
      <ContributorMixCard pieces={pieces} query={query} />
      <ActivityCard />
      <QuickActionsCard onStub={onStub} />
    </aside>
  );
}
