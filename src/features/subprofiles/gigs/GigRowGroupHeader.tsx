import { FiChevronDown } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import styles from "./GigRowGroup.module.css";

interface GigRowGroupHeaderProps {
  group: "upcoming" | "past";
  /** Number of gigs in the group; rolls when it changes. */
  count: number;
  /** DOM id of the heading, so the group section can name itself by it. */
  headingId: string;
  /** Past group only: whether its rows are shown. */
  isOpen?: boolean;
  /** Past group only: renders the show/hide toggle when given. */
  onToggleOpen?: () => void;
  /** Past group only: id of the collapsible panel the toggle controls. */
  panelId?: string;
}

/**
 * Header of one gig group: label, count in a `RollingNumber`, and for the
 * Past group a toggle button ("Show 2 past gigs" / "Hide past gigs") with a
 * rotating chevron. Lives outside the rows container so the drag engine only
 * ever sees rows.
 */
export function GigRowGroupHeader({
  group,
  count,
  headingId,
  isOpen = false,
  onToggleOpen,
  panelId,
}: GigRowGroupHeaderProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const countNumber = (
    <RollingNumber value={fmt.number(count)} numericValue={count} />
  );

  return (
    <div className={styles.header}>
      <h4 className={styles.label} id={headingId}>
        {t(`subprofiles:gigEditor.group.${group}`)}
        <span className={styles.count}>{countNumber}</span>
      </h4>
      {onToggleOpen && (
        <Button
          variant="quiet"
          size="sm"
          className={styles.toggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggleOpen}
        >
          {isOpen ? (
            t("subprofiles:gigEditor.past.hide")
          ) : (
            <Translation
              i18nKey="subprofiles:gigEditor.past.show"
              values={{ count }}
              slots={{ count: countNumber }}
            />
          )}
          <FiChevronDown
            aria-hidden
            className={cx(styles.chevron, isOpen && styles.chevronOpen)}
          />
        </Button>
      )}
    </div>
  );
}
