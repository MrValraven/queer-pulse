import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { EDITORS, type Editor } from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

/** Issue title, "viewing as" editor switch, and the Commission action. */
export function EditorDashboardHeader({
  me,
  onMeChange,
}: {
  me: Editor;
  onMeChange: (editor: Editor) => void;
}) {
  return (
    <header className={styles.edHead}>
      <div>
        <div className={styles.edEyebrow}>Editorial · Issue 10 dashboard</div>
        <h1 className={styles.edH1}>
          Issue 10 · <em>“On Care.”</em>
        </h1>
        <p className={styles.edMeta}>
          Closes <b>14 July</b> · publishes <b>1 September</b> ·{" "}
          <b>Marta &amp; Sara</b> editing
        </p>
      </div>
      <div className={styles.edHeadR}>
        <label className={styles.viewing}>
          Viewing as
          <select
            value={me}
            onChange={(e) => onMeChange(e.target.value as Editor)}
            aria-label="View the dashboard as this editor"
          >
            {EDITORS.map((ed) => (
              <option key={ed} value={ed}>
                {ed}
              </option>
            ))}
          </select>
        </label>
        <Button variant="primary" to={routes.submitStory}>
          + Commission
        </Button>
      </div>
    </header>
  );
}
