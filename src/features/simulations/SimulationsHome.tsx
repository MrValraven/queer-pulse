import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isSandbox } from "../../shared/sandbox/sandbox";
import { SIM_GROUPS } from "./simulations.data";
import styles from "./SimulationsHome.module.css";

/**
 * `/simulations`, the dev-only gallery of member-journey simulations.
 * Every card links to a `/simulations/:id` device-frame player, which boots
 * a fully offline, sandboxed app instance (see shared/sandbox/sandbox.ts).
 */
export function SimulationsHome() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  if (isSandbox()) {
    // A sandbox instance is itself a full app instance running inside a
    // simulation's iframe. Without this guard, its account menu (dev-only,
    // but the sandbox is a dev-only feature so it renders) could still
    // navigate here and boot another simulation inside itself, recursing.
    // The hook above still runs unconditionally, so this check comes after
    // it rather than being the literal first line (see SimulationPlayer.tsx).
    return (
      <div className={styles.notice}>{t("simulations:insideSandbox")}</div>
    );
  }
  const needle = query.trim().toLowerCase();
  const groups = SIM_GROUPS.map((group) => ({
    ...group,
    flows: needle
      ? group.flows.filter(
          (flow) =>
            flow.title.toLowerCase().includes(needle) ||
            flow.description.toLowerCase().includes(needle),
        )
      : group.flows,
  })).filter((group) => group.flows.length > 0);
  const searchPlaceholder = t("simulations:home.searchPlaceholder");
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <Link to={routes.homepage} className={styles.backToApp}>
          <FiArrowLeft aria-hidden /> {t("simulations:home.backToApp")}
        </Link>
        <h1 className={styles.title}>{t("simulations:home.title")}</h1>
        <p className={styles.intro}>{t("simulations:home.intro")}</p>
        <input
          type="search"
          className={styles.search}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </header>
      {groups.length === 0 && (
        <p className={styles.noResults}>{t("simulations:home.noResults")}</p>
      )}
      {groups.map((group) => (
        <section key={group.label} className={styles.group}>
          <h2 className={styles.groupLabel}>{group.label}</h2>
          <div className={styles.grid}>
            {group.flows.map((flow) => (
              <Link
                key={flow.id}
                to={`${routes.simulations}/${flow.id}`}
                className={styles.card}
              >
                <span className={styles.cardTitle}>{flow.title}</span>
                <span className={styles.cardDesc}>{flow.description}</span>
                <span className={styles.cardCta}>
                  {t("simulations:home.start")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
