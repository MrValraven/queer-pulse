import type { IconType } from "react-icons";
import {
  FiCheck,
  FiHeart,
  FiLogIn,
  FiMap,
  FiMapPin,
  FiNavigation,
  FiWind,
  FiX,
} from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { TherapistTravel } from "../../api/subprofiles.api";
import { PracticalCell } from "./TherapistPracticalCells";
import { PracticalEditLink } from "./TherapistPracticalEdit";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { RevealList, RevealPop } from "./TherapistReveal";
import { useStableRowKeys } from "./useStableRowKeys";
import styles from "./TherapistPractical.module.css";

/** Feather has no metro, bus or bike glyph: a navigation arrow stands for
 *  the metro, a folded map for bus routes, open air for the bike. */
const TRAVEL_ICONS: Record<keyof TherapistTravel, IconType> = {
  metro: FiNavigation,
  bus: FiMap,
  bike: FiWind,
  entrance: FiLogIn,
};

const TRAVEL_ORDER: (keyof TherapistTravel)[] = [
  "metro",
  "bus",
  "bike",
  "entrance",
];

/* The getting-there and accessibility lists lay out as multi-column grids,
   where a line has no height of its own to grow, so an added line pops in
   (fade and scale) and a removed one pops out before the cells after it
   close up. */

export function TravelCell({ travel }: { travel: TherapistTravel }) {
  const { t } = useTranslation();
  const filled = TRAVEL_ORDER.filter((mode) => travel[mode] !== "");
  return (
    <PracticalCell
      icon={FiMapPin}
      title={t("subprofiles:therapist.practical.travel.title")}
      isWide
    >
      <PracticalEditLink target={THERAPIST_EDIT_TARGETS.travel} />
      <ul className={styles.travel}>
        <RevealList>
          {filled.map((mode) => {
            const Icon = TRAVEL_ICONS[mode];
            return (
              <RevealPop key={mode} as="li">
                <Icon className={styles.travelIcon} aria-hidden="true" />
                <span>
                  <span className="visuallyHidden">
                    {t(`subprofiles:therapist.practical.travel.${mode}`)}{" "}
                  </span>
                  {travel[mode]}
                </span>
              </RevealPop>
            );
          })}
        </RevealList>
      </ul>
    </PracticalCell>
  );
}

export function AccessCell({
  offered,
  missing,
}: {
  offered: string[];
  missing: string[];
}) {
  const { t } = useTranslation();
  // A line keeps its key while the owner edits it. The two lists share one
  // `<ul>`, so a prefix keeps their keys apart.
  const offeredKeys = useStableRowKeys(offered);
  const missingKeys = useStableRowKeys(missing);
  return (
    <PracticalCell
      icon={FiHeart}
      title={t("subprofiles:therapist.practical.access.title")}
      isWide
    >
      <PracticalEditLink target={THERAPIST_EDIT_TARGETS.access} />
      <ul className={styles.access}>
        <RevealList>
          {offered.map((item, index) => (
            <RevealPop key={`offered:${offeredKeys[index]}`} as="li">
              <FiCheck className={styles.accessIcon} aria-hidden="true" />
              <span>
                <span className="visuallyHidden">
                  {t("subprofiles:therapist.practical.access.offered")}{" "}
                </span>
                {item}
              </span>
            </RevealPop>
          ))}
          {missing.map((item, index) => (
            <RevealPop
              key={`missing:${missingKeys[index]}`}
              as="li"
              className={styles.accessMissing}
            >
              <FiX className={styles.accessIcon} aria-hidden="true" />
              <span>
                <span className="visuallyHidden">
                  {t("subprofiles:therapist.practical.access.missing")}{" "}
                </span>
                {item}
              </span>
            </RevealPop>
          ))}
        </RevealList>
      </ul>
    </PracticalCell>
  );
}
