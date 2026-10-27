import type { ReactNode } from "react";
import type { StudioLandingDevice } from "./studioLanding.data";
import styles from "./StudioLandingDeviceFrame.module.css";

/**
 * A CSS-drawn device around a Studio screenshot: a laptop (lid, bezel and a
 * hinge base) or a phone (rounded body with a camera pill). Every part but
 * the screen is decoration, so it is hidden from assistive tech, and the
 * soft halo behind the device is a gradient on the root's `::before`.
 *
 * The frame sets no width of its own. The caller sizes it with `className`,
 * and the bezels scale with that width.
 */
export function StudioLandingDeviceFrame({
  device,
  children,
  className,
}: {
  device: StudioLandingDevice;
  children: ReactNode;
  className?: string;
}) {
  const rootClassName = [
    styles.frame,
    device === "phone" ? styles.phone : styles.laptop,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (device === "phone") {
    return (
      <div className={rootClassName} data-device="phone">
        <div className={styles.phoneBody}>
          <span className={styles.cameraPill} aria-hidden="true" />
          <div className={styles.screen}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName} data-device="laptop">
      <div className={styles.lid}>
        <span className={styles.camera} aria-hidden="true" />
        <div className={styles.screen}>{children}</div>
      </div>
      <div className={styles.base} aria-hidden="true" />
    </div>
  );
}
