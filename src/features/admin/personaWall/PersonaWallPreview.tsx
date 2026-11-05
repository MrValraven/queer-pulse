import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMonitor, FiSmartphone } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse, SegmentedControl } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { toWallTileView } from "../../subprofiles/api/directoryCard.adapters";
import type { PersonaWallPreviewCardDTO } from "../../subprofiles/api/personaWall.api";
import {
  SubprofileCreditsWallGrid,
  type WallGridDevice,
} from "../../subprofiles/SubprofileCreditsWallGrid";
import { WALL_MIN_TILES } from "../../subprofiles/subprofileCreditsWall.data";
import { wallLayoutFor } from "../../subprofiles/useSubprofileCreditsWall";
import styles from "./PersonaWallPanels.module.css";

const DEVICE_FADE_S = 0.18;

function isWallGridDevice(value: string): value is WallGridDevice {
  return value === "desktop" || value === "phone";
}

/**
 * The wall as members see it: the admin's picks, then the automatic fill,
 * drawn by the real wall grid. The Desktop / Phone switch draws the grid for
 * that device whatever this screen is. Under three personas the public wall
 * hides itself, so the preview says so in words. Below the lg breakpoint the
 * wall CSS has no desktop rows to draw, so the preview shows the phone wall
 * alone and the switch folds away.
 */
export function PersonaWallPreview({
  preview,
}: {
  preview: readonly PersonaWallPreviewCardDTO[];
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const [chosenDevice, setChosenDevice] = useState<WallGridDevice>("desktop");
  const isNarrowScreen = useMediaQuery(mediaMax("lg"));
  const device: WallGridDevice = isNarrowScreen ? "phone" : chosenDevice;
  const tiles = preview.map(toWallTileView);
  const isTooFew = tiles.length < WALL_MIN_TILES;

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.previewHead}>
        <div>
          <h2 id={headingId} className={styles.heading}>
            {t("admin:personaWall.preview.heading")}
          </h2>
          <p className={styles.intro}>{t("admin:personaWall.preview.intro")}</p>
        </div>
        <Collapse isOpen={!isNarrowScreen}>
          <SegmentedControl
            label={t("admin:personaWall.preview.deviceLabel")}
            value={device}
            onChange={(next) => {
              if (isWallGridDevice(next)) setChosenDevice(next);
            }}
            options={[
              {
                value: "desktop",
                label: t("admin:personaWall.preview.desktop"),
                icon: <FiMonitor aria-hidden />,
              },
              {
                value: "phone",
                label: t("admin:personaWall.preview.phone"),
                icon: <FiSmartphone aria-hidden />,
              },
            ]}
          />
        </Collapse>
      </div>
      <Collapse isOpen={isTooFew}>
        <p className={styles.tooFew}>{t("admin:personaWall.preview.tooFew")}</p>
      </Collapse>
      <Collapse isOpen={!isTooFew}>
        <div className={styles.frame} data-device={device}>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={device}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : DEVICE_FADE_S }}
            >
              <SubprofileCreditsWallGrid
                layout={wallLayoutFor(tiles.length, device === "phone")}
                tiles={tiles}
                device={device}
                label={t("subprofiles:directory.wall.label")}
                badgeFor={(_tile, index) => {
                  const wallSource = preview[index]?.wallSource;
                  return (
                    <span data-wall-source={wallSource}>
                      {t(
                        wallSource === "picked"
                          ? "admin:personaWall.preview.picked"
                          : "admin:personaWall.preview.filled",
                      )}
                    </span>
                  );
                }}
              />
            </m.div>
          </AnimatePresence>
        </div>
      </Collapse>
    </section>
  );
}
