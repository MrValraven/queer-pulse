import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  PlatformStatusComponentDTO,
  PlatformStatusComponentId,
  PlatformStatusState,
} from "./api/platformStatus.api";
import {
  STATUS_COMPONENT_DESC_KEY,
  STATUS_COMPONENT_NAME_KEY,
  STATUS_COMPONENT_ORDER,
  STATUS_STATE_ICON,
  STATUS_STATE_LABEL_KEY,
} from "./statusLive.data";
import styles from "./StatusLive.module.css";

/** Class map keyed by state — stays here because it depends on the CSS module. */
const STATE_CLASS: Record<PlatformStatusState, string | undefined> = {
  operational: styles.stateOperational,
  degraded: styles.stateDegraded,
  down: styles.stateDown,
};

/**
 * One row per member-facing area, each with its state spelled out in words next
 * to the icon. Never a bare coloured dot: the state has to survive greyscale, a
 * screen reader, and a reader who does not share our colour conventions.
 */
export function StatusLiveComponents({
  components,
}: {
  components: PlatformStatusComponentDTO[];
}) {
  const { t } = useTranslation();
  const byId = new Map<PlatformStatusComponentId, PlatformStatusState>(
    components.map((component) => [component.id, component.state]),
  );
  // Ordered by the registry, not the response, and any component the backend
  // has since stopped reporting simply drops out rather than rendering blank.
  const rows = STATUS_COMPONENT_ORDER.filter((id) => byId.has(id));

  return (
    <section className={`wrap ${styles.section}`}>
      <h2 className={styles.sectionHeading}>
        {t("system:status.live.componentsHeading")}
      </h2>
      <ul className={styles.componentList}>
        {rows.map((id) => {
          const state = byId.get(id) ?? "operational";
          const StateIcon = STATUS_STATE_ICON[state];
          return (
            <li key={id} className={styles.componentRow}>
              <div className={styles.componentText}>
                <span className={styles.componentName}>
                  {t(STATUS_COMPONENT_NAME_KEY[id])}
                </span>
                <span className={styles.componentDesc}>
                  {t(STATUS_COMPONENT_DESC_KEY[id])}
                </span>
              </div>
              <span
                className={[styles.statePill, STATE_CLASS[state]]
                  .filter(Boolean)
                  .join(" ")}
              >
                <StateIcon aria-hidden />
                {t(STATUS_STATE_LABEL_KEY[state])}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
