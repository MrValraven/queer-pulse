import { FiArrowRight } from "react-icons/fi";
import { Button, Reveal, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useHostSpaces } from "./api/useHostSpaces";
import styles from "./HostPage.module.css";

export function HostSidebar() {
  const { t } = useTranslation();
  const { data: spaces, isLoading } = useHostSpaces();

  // Hide the partner-spaces card once we know there are none, rather than
  // render an empty (or fabricated) card. `spaces` is always present in demo
  // mode (seeded from the fixture); in live mode it is undefined until the
  // fetch resolves, so we show a skeleton meanwhile.
  const hasSpaces = spaces !== undefined && spaces.length > 0;

  return (
    <Reveal as="aside" className={styles.sidebar} delay={90}>
      <div className={styles.sidebarCard}>
        <h3>{t("gatherings:host.sidebar.readyTitle")}</h3>
        <p>{t("gatherings:host.sidebar.readyBody")}</p>
        <Button className={styles.fullBtn} to={routes.createGathering}>
          {t("gatherings:host.createGatheringCta")} <FiArrowRight aria-hidden />
        </Button>
      </div>
      {(isLoading || hasSpaces) && (
        <div className={styles.sidebarCard}>
          <h3>{t("gatherings:host.sidebar.spacesTitle")}</h3>
          <p>{t("gatherings:host.sidebar.spacesBody")}</p>
          <div className={styles.spaceList}>
            {isLoading
              ? [0, 1, 2].map((row) => (
                  <div key={row} className={styles.spaceRow}>
                    <SkeletonLine width="35%" height={11} />
                    <SkeletonLine width="70%" height={16} />
                    <SkeletonLine width="55%" height={12} />
                  </div>
                ))
              : spaces?.map((space) => (
                  <div
                    key={space.slug ?? space.name}
                    className={styles.spaceRow}
                  >
                    <div className={styles.spaceHood}>{space.hood}</div>
                    <div className={styles.spaceName}>{space.name}</div>
                    <div className={styles.spaceNote}>{space.note}</div>
                  </div>
                ))}
          </div>
        </div>
      )}
    </Reveal>
  );
}
