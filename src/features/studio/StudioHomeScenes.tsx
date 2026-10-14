import { useId } from "react";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioScenes } from "./api/useStudioScenes";
import { StudioSceneCard } from "./StudioSceneCard";
import styles from "./studio.module.css";
import css from "./StudioCuration.module.css";

/** "Local scenes" on Studio home. It grows in once scenes arrive and stays
 *  folded while there are none or the read fails. */
export function StudioHomeScenes() {
  const { t } = useTranslation();
  const headingId = useId();
  const { scenes } = useStudioScenes();
  return (
    <Collapse isOpen={scenes.length > 0}>
      <section className={styles.row} aria-labelledby={headingId}>
        <div className={styles.rowH}>
          <h2 id={headingId}>
            <Translation
              i18nKey="studio:home.scenes.title"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <ul
          className={css.sceneGrid}
          aria-label={t("studio:home.scenes.listLabel")}
        >
          {scenes.map((scene) => (
            <li key={scene.id}>
              <StudioSceneCard scene={scene} />
            </li>
          ))}
        </ul>
      </section>
    </Collapse>
  );
}
