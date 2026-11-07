import type { JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import type { VjLogo, VjLogoCorner } from "../../../../shared/contracts/vj";
import { BrandMark } from "../../../../shared/components/ui/BrandMark";
import { cx } from "../../../../shared/lib/cx";
import styles from "./VjOverlay.module.css";

const CORNER_CLASSES: Readonly<Record<VjLogoCorner, string | undefined>> = {
  topLeft: styles.cornerTopLeft,
  topRight: styles.cornerTopRight,
  bottomLeft: styles.cornerBottomLeft,
  bottomRight: styles.cornerBottomRight,
};

/** The QueerPulse mark in the chosen corner, cream rings on the dark stage. */
export function VjLogoMark({
  logo,
  fadeSeconds,
}: {
  logo: VjLogo;
  fadeSeconds: number;
}): JSX.Element {
  return (
    <AnimatePresence initial={false}>
      {logo.isVisible ? (
        <m.div
          key={`logo:${logo.corner}`}
          className={cx(styles.logo, CORNER_CLASSES[logo.corner])}
          data-vj-logo-corner={logo.corner}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeSeconds, ease: "linear" }}
        >
          <BrandMark size="100%" />
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
