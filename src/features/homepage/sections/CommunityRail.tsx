import { FiCheck, FiLock } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SpotlightCommunity } from "./Communities.data";
import { CAT_LABEL_KEY, DOT } from "./communityClasses";
import styles from "./Communities.module.css";

interface RailProps {
  list: SpotlightCommunity[];
  selectedAnchor: string | null;
  onSelect: (anchor: string) => void;
  onClear: () => void;
}

export function CommunityRail({
  list,
  selectedAnchor,
  onSelect,
  onClear,
}: RailProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.rail}>
      <div className={styles.railLab}>
        {list.length
          ? t("homepage:communities.rail.showingCount", { count: list.length })
          : t("homepage:communities.rail.noMatches")}
      </div>

      {list.length === 0 ? (
        <div className={styles.railEmpty}>
          <b>{t("homepage:communities.rail.emptyTitle")}</b>
          <br />
          {t("homepage:communities.rail.emptyBody")}
          <br />
          <button type="button" onClick={onClear}>
            {t("homepage:communities.clearFiltersCta")}
          </button>
        </div>
      ) : (
        list.map((d) => (
          <button
            key={d.anchor}
            type="button"
            className={[
              styles.railRow,
              d.anchor === selectedAnchor && styles.railRowActive,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={d.anchor === selectedAnchor ? "true" : undefined}
            onClick={() => onSelect(d.anchor)}
          >
            <span
              className={[styles.railDot, DOT[d.category]]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="visuallyHidden">
                {t(CAT_LABEL_KEY[d.category])} ·{" "}
              </span>
            </span>
            <span className={styles.railText}>
              <span className={styles.railName}>
                {d.railName}
                {!d.quiet && d.verified && (
                  <span className={styles.rv} aria-label={d.verified}>
                    <FiCheck aria-hidden />
                  </span>
                )}
              </span>
              <span className={styles.railSub}>{d.sub}</span>
            </span>
            <span className={styles.railMem}>
              {d.quiet ? (
                <>
                  <FiLock aria-hidden />
                  <span className="visuallyHidden">
                    {t("homepage:communities.rail.privateNoHeadcount")}
                  </span>
                </>
              ) : (
                d.members
              )}
            </span>
          </button>
        ))
      )}
    </div>
  );
}
