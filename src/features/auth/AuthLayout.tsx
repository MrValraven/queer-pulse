import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BackToSettingsLink } from "../../shared/components/layout";
import {
  MAIN_CONTENT_ID,
  SkipToContentLink,
} from "../../shared/components/layout/SkipToContentLink";
import { routes } from "../../app/routeMap";
import styles from "./auth.module.css";
import cardStyles from "./signInCard.module.css";

/** Centred auth card with floating brand mark and background orbs.
 *  `layout="twoColumn"` is the sign-in card: children fill a left column and
 *  `aside` fills the right one. On phones it becomes a flat, edge-to-edge
 *  screen with `aside` as a full-bleed band on top.
 *  `isFloatingBrandHidden` drops the corner mark for a page that carries its
 *  own lockup inside the card. */
export function AuthLayout({
  children,
  wide = false,
  layout = "card",
  aside,
  isFloatingBrandHidden = false,
}: {
  children: ReactNode;
  wide?: boolean;
  layout?: "card" | "twoColumn";
  aside?: ReactNode;
  isFloatingBrandHidden?: boolean;
}) {
  const isTwoColumn = layout === "twoColumn";
  return (
    <div
      className={[styles.root, isTwoColumn && cardStyles.twoColumnRoot]
        .filter(Boolean)
        .join(" ")}
    >
      <SkipToContentLink />
      <div
        className={[
          styles.orb,
          styles.orbA,
          isTwoColumn && cardStyles.pageDecoration,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <div
        className={[
          styles.orb,
          styles.orbB,
          isTwoColumn && cardStyles.pageDecoration,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {!isFloatingBrandHidden && (
        <Link to={routes.homepage} className={styles.brand}>
          <span className={styles.pulseDot} aria-hidden />
          <span>
            {"Queer"}
            <em>{"Pulse"}</em>
          </span>
        </Link>
      )}
      <BackToSettingsLink />
      {/* The auth pages sit outside PageShell/AppShell, so this is the only
          <main> on the page. It carries the shared landmark id + `tabIndex={-1}`
          the skip link and RouteAnnouncer both target. Deliberately WITHOUT
          `data-page-main`: this frame renders no floating Navbar, and that
          attribute's global chrome offsets (base.css, nav-mode.css,
          standalone.css) would push the centred card off centre. */}
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.enter}>
        <div
          className={[
            styles.card,
            wide && styles.cardWide,
            isTwoColumn && cardStyles.twoColumnCard,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isTwoColumn ? (
            <>
              <div className={cardStyles.content}>{children}</div>
              <div className={cardStyles.media}>{aside}</div>
            </>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
