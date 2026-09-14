import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../app/routeMap";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { notShownOnProfileReason } from "./mySubprofiles.data";
import { SideCard } from "./SideCard";
import styles from "./MySubprofilesOrder.module.css";

/**
 * The personas a member owns that their profile does not list: drafts, and
 * standalone personas living on their own page.
 *
 * Read-only on purpose. Order is only meaningful for the cards a visitor
 * actually sees in a row, so these carry no grip and no move buttons; putting
 * them in the reorder grid would offer positions that change nothing. What
 * each one gets instead is the reason it is here and the one link that
 * resolves it, deep-linked to the editor pane where that work happens
 * (`?pane=publish` for a draft, `?pane=address` for a standalone persona — the
 * same `?pane=` the editor reads in `useEditorPane`).
 *
 * The card itself is the ordinary dashboard `SideCard`, with the reason and
 * link in the slot the owner actions occupy on the grid above.
 */
export function NotShownPersonas({ personas }: { personas: SubprofileView[] }) {
  const { t } = useTranslation();
  if (personas.length === 0) return null;

  return (
    <section className={styles.group}>
      <div className={styles.groupHead}>
        <h2 className={styles.groupTitle}>
          {t("subprofiles:mine.notShown.title")}
        </h2>
        <p className={styles.groupHint}>{t("subprofiles:mine.notShown.sub")}</p>
      </div>

      <div className="sides">
        {personas.map((persona) => {
          const { reasonKey, actionKey, pane } =
            notShownOnProfileReason(persona);
          return (
            <SideCard
              key={persona.id}
              view={persona}
              footer={
                <div className={`side-acts ${styles.notShownFoot}`}>
                  <p className={styles.notShownReason}>{t(reasonKey)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    to={`${subprofileEditPath(persona.id)}?pane=${pane}`}
                  >
                    {t(actionKey)}
                  </Button>
                </div>
              }
            />
          );
        })}
      </div>
    </section>
  );
}
