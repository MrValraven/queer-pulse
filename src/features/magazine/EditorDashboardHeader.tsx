import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { EDITORS, CURRENT_ISSUE, type Editor } from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

/** Issue title, "viewing as" editor switch, and the Commission action. */
export function EditorDashboardHeader({
  me,
  onMeChange,
}: {
  me: Editor;
  onMeChange: (editor: Editor) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <header className={styles.edHead}>
      <div>
        <div className={styles.edEyebrow}>
          {t("magazine:editor.header.eyebrow", { number: CURRENT_ISSUE.number })}
        </div>
        <h1 className={styles.edH1}>
          <Translation
            i18nKey="magazine:editor.header.title"
            components={{ em: <em /> }}
            values={{ number: CURRENT_ISSUE.number, theme: CURRENT_ISSUE.theme }}
          />
        </h1>
        <p className={styles.edMeta}>
          <Translation
            i18nKey="magazine:editor.header.meta"
            components={{ b: <b /> }}
            values={{
              closes: fmt.date(CURRENT_ISSUE.closesDate, {
                day: "numeric",
                month: "long",
              }),
              publishes: fmt.date(CURRENT_ISSUE.publishesDate, {
                day: "numeric",
                month: "long",
              }),
              editors: CURRENT_ISSUE.editorsLabel,
            }}
          />
        </p>
      </div>
      <div className={styles.edHeadR}>
        <label className={styles.viewing}>
          {t("magazine:editor.header.viewingAs")}
          <select
            value={me}
            onChange={(e) => onMeChange(e.target.value as Editor)}
            aria-label={t("magazine:editor.header.viewingAsAria")}
          >
            {EDITORS.map((ed) => (
              <option key={ed} value={ed}>
                {ed}
              </option>
            ))}
          </select>
        </label>
        <Button variant="primary" to={routes.submitStory}>
          {t("magazine:editor.header.commissionCta")}
        </Button>
      </div>
    </header>
  );
}
