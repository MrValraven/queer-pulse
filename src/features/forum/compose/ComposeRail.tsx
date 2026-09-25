import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useMediaQuery } from "../../../shared/hooks";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { ComposeRailSheet } from "./ComposeRailSheet";
import { ComposeRailTab } from "./ComposeRailTab";
import { PANES, type ComposeRailPane } from "./composeRailPanes";
import styles from "./ComposeRail.module.css";

// ── The composer's right-hand rail ──────────────────────────────────────────
// Four blocks of advice beside the writing: who the post comes from, what it
// will look like, whether it has already been asked, and what is still
// missing. On a wide screen they are all visible at once, sticky beside the
// main column, because none of them is worth a click.
//
// Below 1023px there is no room for a second column, so the same four blocks
// move into a bottom sheet opened from a segmented row. The sheet is a real
// dialog: `useDismiss` owns its focus trap, its scroll lock and its place in
// the Escape stack, and it is PORTALLED to <body> so the fixed overlay anchors
// to the viewport rather than to the composer's own transformed ancestors.
//
// The page behind the open sheet is deliberately left without `inert`. It
// breaks `useDismiss`'s trap (the trap enumerates focusables inside the
// dialog, and an inert subtree elsewhere is not what keeps focus in), and the
// trap is the thing doing the work here. The sheet itself turns inert only
// once it starts sliding away, when the trap has nothing left to hold.

export type { ComposeRailPane } from "./composeRailPanes";

export interface ComposeRailProps {
  /** The byline block. Shown beside the preview, since it is what the
   *  preview's byline reflects. */
  postingAs: ReactNode;
  preview: ReactNode;
  similar: ReactNode;
  checklist: ReactNode;
  /** How many threads already cover this title. Shown on the Similar tab so
   *  the sheet is worth opening before it is opened. */
  similarCount?: number;
  /** Required checklist rows satisfied, and how many there are. */
  readyCount?: number;
  readyTotal?: number;
}

export function ComposeRail({
  postingAs,
  preview,
  similar,
  checklist,
  similarCount = 0,
  readyCount,
  readyTotal,
}: ComposeRailProps) {
  const { t } = useTranslation();
  const isCompact = useMediaQuery(mediaMax(1023));
  const [openPane, setOpenPane] = useState<ComposeRailPane | null>(null);

  const blocks = { postingAs, preview, similar, checklist };
  const counts = { similarCount, readyCount, readyTotal };

  if (!isCompact)
    return (
      <aside
        className={styles.rail}
        aria-label={t("forum:composePage.rail.label")}
      >
        {postingAs}
        {preview}
        {similar}
        {checklist}
        <HouseRulesNote />
      </aside>
    );

  return (
    <aside
      className={styles.compactRail}
      aria-label={t("forum:composePage.rail.label")}
    >
      <p className={styles.compactLead}>{t("forum:composePage.rail.lead")}</p>
      <div className={styles.tabs}>
        {PANES.map((pane) => (
          <ComposeRailTab
            key={pane}
            pane={pane}
            counts={counts}
            aria-haspopup="dialog"
            onClick={() => setOpenPane(pane)}
          />
        ))}
      </div>
      <HouseRulesNote />
      {/* Keeps the sheet mounted through its slide back down. */}
      <AnimatePresence>
        {openPane && (
          <ComposeRailSheet
            key="sheet"
            pane={openPane}
            onPaneChange={setOpenPane}
            onClose={() => setOpenPane(null)}
            blocks={blocks}
            counts={counts}
          />
        )}
      </AnimatePresence>
    </aside>
  );
}

function HouseRulesNote() {
  const { t } = useTranslation();
  return (
    <p className={styles.note}>
      {t("forum:composePage.rail.note")}{" "}
      <Link to={routes.guidelines} className={styles.noteLink}>
        {t("forum:composePage.rail.houseRules")}
      </Link>
    </p>
  );
}
