import { Link } from "react-router-dom";
import { RollingNumber } from "../ui/RollingNumber";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { useFormat } from "../../i18n/format";
import { formattedCountValues } from "../../../features/magazine/desk/deskHeaderCopy";
import styles from "./MagazineSidebar.module.css";

/**
 * The count counts every piece waiting on the viewer, in any issue or none,
 * and the desk's Everything scope is the one scope that holds all of them
 * (it drops only Published, which waits on nobody). So the pill opens that
 * scope with the Your turn chip on: the desk then lists exactly the pieces
 * the pill counted.
 */
const YOUR_TURN_HREF = `${routes.magazineEditor}?track=everything&focus=your-turn`;

/**
 * The rail's "waiting on you" pill, as its own link beside the Desk item.
 * The Desk item itself opens the desk as the editor left it; this pill is the
 * way in to the pieces it counts. It sits over the Desk item's right end (the
 * row keeps one hover and active wash), and its hit area is the row's full
 * height across `--tap-min`, wider than the pill it draws.
 */
export function MagazineSidebarDeskCount({
  count,
  onNavigate,
}: {
  count: number;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <Link
      to={YOUR_TURN_HREF}
      className={styles.navCountLink}
      onClick={onNavigate}
    >
      <span className={styles.navCount} aria-hidden="true">
        <RollingNumber value={format.number(count)} numericValue={count} />
      </span>
      <span className="visuallyHidden">
        {t(
          "magazine:deskShell.nav.yourTurnAria",
          formattedCountValues(count, format.number),
        )}
      </span>
    </Link>
  );
}
