import { FiNavigation } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { walkMinutes } from "./nearMePlaces";
import s from "./DirectoryPage.module.css";

/**
 * How long a walk it is from where the member is standing, pinned to the
 * card's photo.
 *
 * Deliberately an estimate and worded as one. The distance is a straight line,
 * and Lisbon's streets and hills are neither, so the chip says "about" and the
 * accessible label spells out that this is a walking time from the member's
 * own position. It appears only once someone has opted in, and only on a place
 * with real coordinates: nothing here ever guesses a distance.
 */
export function LocalWalkTimeTag({ metres }: { metres: number }) {
  const { t } = useTranslation();
  const minutes = walkMinutes(metres);
  return (
    <>
      <FiNavigation aria-hidden />
      <span aria-hidden>
        {t("marketing:local.nearMe.walkChip", { minutes })}
      </span>
      <span className={s.srOnly}>
        {t("marketing:local.nearMe.walkAria", { minutes })}
      </span>
    </>
  );
}
