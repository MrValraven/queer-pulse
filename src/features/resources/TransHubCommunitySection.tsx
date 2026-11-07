import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./resources.module.css";

/** The closing plum "join the community" strip on the Trans Hub page. */
export function TransHubCommunitySection() {
  const { t } = useTranslation();
  return (
    <section
      className={`${styles.section} ${styles.sectionCream}`}
      id="community"
      style={{ borderBottom: "none" }}
    >
      <div className="wrap">
        <Reveal className={`${styles.plumStrip} ${styles.plumStripSingle}`}>
          <div>
            <h3>
              <Translation
                i18nKey="resources:transHub.community.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("resources:transHub.community.body")}</p>
            <div className={styles.plumActions}>
              <Button variant="ghost-dark" to={routes.communities}>
                {t("resources:transHub.community.joinCta")}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
