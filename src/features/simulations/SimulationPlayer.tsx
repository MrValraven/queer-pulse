import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiSmartphone,
  FiMonitor,
  FiExternalLink,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isSandbox } from "../../shared/sandbox/sandbox";
import { Button } from "../../shared/components/ui";
import { DeviceFrame, type Device } from "./DeviceFrame";
import { findSimFlow, withSandboxFlag } from "./simulations.data";
import styles from "./SimulationPlayer.module.css";

/**
 * `/simulations/:id`, a device-frame player that boots the requested member
 * journey inside an iframe tagged `data-sandbox="1"`. The booted instance
 * reads `?sandbox=1` on its own URL (see shared/sandbox/sandbox.ts) and forces
 * locked demo mode, so it makes zero backend calls regardless of the parent
 * app's live/demo state.
 */
export function SimulationPlayer() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [device, setDevice] = useState<Device>("desktop");
  const navigate = useNavigate();

  // Esc returns to the gallery. This covers focus on the player chrome
  // around the frame; DeviceFrame's onEscape below covers focus that has
  // moved inside the iframe's own (same-origin) document.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") void navigate(routes.simulations);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  if (isSandbox()) {
    // The player itself is a full app instance when it is booted inside
    // another simulation's iframe (or full-screen via ?sandbox=1). Stop
    // here instead of letting it render a nested player, which would try
    // to boot yet another sandboxed instance inside itself. Hooks above
    // still run unconditionally, so this check comes after them rather
    // than being the literal first line.
    return (
      <div className={styles.notFound}>
        <p>{t("simulations:insideSandbox")}</p>
      </div>
    );
  }

  const flow = id ? findSimFlow(id) : undefined;

  if (!flow) {
    return (
      <div className={styles.notFound}>
        <p>{t("simulations:player.notFound")}</p>
        <Button variant="ghost" to={routes.simulations}>
          {t("simulations:player.backToGallery")}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.player}>
      <header className={styles.bar}>
        <Link to={routes.simulations} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("simulations:player.back")}
        </Link>
        <span className={styles.title}>{flow.title}</span>
        <div
          className={styles.deviceToggle}
          role="group"
          aria-label={t("simulations:player.deviceGroupAriaLabel")}
        >
          <button
            type="button"
            className={[
              styles.deviceBtn,
              device === "mobile" && styles.deviceBtnActive,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setDevice("mobile")}
            aria-pressed={device === "mobile"}
          >
            <FiSmartphone aria-hidden /> {t("simulations:player.mobile")}
          </button>
          <button
            type="button"
            className={[
              styles.deviceBtn,
              device === "desktop" && styles.deviceBtnActive,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setDevice("desktop")}
            aria-pressed={device === "desktop"}
          >
            <FiMonitor aria-hidden /> {t("simulations:player.desktop")}
          </button>
        </div>
        <a
          href={withSandboxFlag(flow.to)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.openFull}
        >
          <FiExternalLink aria-hidden />{" "}
          {t("simulations:player.openFullScreen")}
        </a>
      </header>
      <DeviceFrame
        src={withSandboxFlag(flow.to)}
        title={flow.title}
        device={device}
        onEscape={() => void navigate(routes.simulations)}
      />
    </div>
  );
}
