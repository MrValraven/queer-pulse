import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { CURATORS, type CuratorProfile } from "./cinemaCurator.data";
import styles from "./CinemaCuratorPage.module.css";

const AV_CLASS = {
  coral: styles.avCoral,
  jade: styles.avJade,
  plum: styles.avPlum,
} as const;

export function CuratorAside({ curator }: { curator: CuratorProfile }) {
  const { t } = useTranslation();
  const name = curator.namePre.trim();
  const others = Object.values(CURATORS).filter((c) => c.slug !== curator.slug);

  return (
    <aside className={styles.aside}>
      <div className={styles.ca}>
        <div className={styles.caHead}>
          {t("cinema:curator.aside.otherCuratorsHeading")}
        </div>
        <div className={styles.otherCur}>
          {others.map((c) => (
            <Link
              key={c.slug}
              to={`${routes.cinemaCurator}/${c.slug}`}
              className={styles.ocRow}
            >
              <div className={`${styles.ocAv} ${AV_CLASS[c.tone]}`}>
                {c.initials}
              </div>
              <div>
                <div className={styles.ocName}>
                  {c.namePre}
                  {c.nameEm}
                </div>
                <div className={styles.ocFocus}>{c.focus.join(" · ")}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.ca}>
        <div className={styles.caHead}>
          {t("cinema:curator.aside.contactHeading")}
        </div>
        <div className={styles.caBody}>
          {t("cinema:curator.aside.contactBody", { name })}
        </div>
        <Button variant="ghost" to={routes.contact} style={{ width: "100%" }}>
          {t("cinema:curator.aside.contactCta", { name })}
        </Button>
      </div>

      <div className={styles.ca}>
        <div className={styles.caHead}>
          {t("cinema:curator.aside.proposeHeading")}
        </div>
        <div className={styles.caBody}>
          {t("cinema:curator.aside.proposeBody")}
        </div>
        <Button variant="ghost" to={routes.contact} style={{ width: "100%" }}>
          {t("cinema:curator.aside.proposeCta")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </aside>
  );
}
