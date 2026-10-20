import { createPortal } from "react-dom";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useRouteTransitionScope } from "../../../../shared/components/layout/routeTransitionScope";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import { TattooBookButton } from "./TattooBookButton";
import { TattooStatusPill } from "./TattooStatusPill";
import type { TattooView } from "./tattooView";
import styles from "./TattooAside.module.css";

interface TattooMobileBarProps {
  data: PublicSubprofileView;
  view: TattooView;
}

/**
 * The phone booking bar: one compact row of the status pill (without the
 * wait note) and "How to book", fixed to the bottom of the screen below
 * 860px (hidden above it by CSS). Mounted for a public visitor only. The
 * hero above already names the artist, and the bar's label names them for
 * assistive tech.
 *
 * Portaled to <body>: `.pp` is a size container and a routed page slides in
 * on a transform, and either would make the page the containing block for
 * fixed descendants, pinning this bar to the foot of the persona page. Not
 * portaled from a route that is fading out: that copy of the page is on its
 * way out, and a second bar on <body> would sit on top of the incoming one.
 */
export function TattooMobileBar({ view }: TattooMobileBarProps) {
  const { t } = useTranslation();
  const transitionScope = useRouteTransitionScope();
  if (transitionScope?.isPresent === false) return null;

  return createPortal(
    <aside
      className={styles.bar}
      aria-label={t("subprofiles:tattoo.mobile.label", {
        name: view.titleName,
      })}
    >
      <div className={styles.barStatus}>
        <TattooStatusPill status={view.status} nextOpening={view.nextOpening} />
      </div>
      <div className={styles.barCta}>
        <TattooBookButton isInert={false} />
      </div>
    </aside>,
    document.body,
  );
}
