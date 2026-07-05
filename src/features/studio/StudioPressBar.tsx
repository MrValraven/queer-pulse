import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./StudioPressPage.module.css";

/** Sticky press-kit topbar: brand + crumb + copy-link / download-assets actions. */
export function StudioPressBar() {
  const { showToast } = useToast();

  function copyLink() {
    const url =
      typeof window !== "undefined" ? window.location.href : routes.studioPress;
    navigator.clipboard?.writeText(url).then(
      () => showToast("Copied", "success"),
      () => showToast("Could not copy link", "info"),
    );
  }

  return (
    <div className={styles.bar}>
      <Link to={routes.studio} className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        <span className={styles.wm}>
          Queer<span className={styles.q}>Pulse</span>
        </span>
      </Link>
      <span className={styles.crumb}>
        Press kit · <em>Mariana Sol</em>
      </span>
      <div className={styles.acts}>
        <Button variant="ghost-dark" onClick={copyLink}>
          Copy press link
        </Button>
        <Button
          variant="primary"
          onClick={() => showToast("Preparing your press assets", "success")}
        >
          Download assets
        </Button>
      </div>
    </div>
  );
}
