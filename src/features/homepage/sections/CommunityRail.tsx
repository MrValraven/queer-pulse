import { FiCheck, FiLock } from "react-icons/fi";
import type { SpotlightCommunity } from "./Communities.data";
import { CAT_LABEL, DOT } from "./communityClasses";
import styles from "./Communities.module.css";

interface RailProps {
  list: SpotlightCommunity[];
  selectedAnchor: string | null;
  onSelect: (anchor: string) => void;
  onPreview: (anchor: string) => void;
  onClear: () => void;
}

export function CommunityRail({
  list,
  selectedAnchor,
  onSelect,
  onPreview,
  onClear,
}: RailProps) {
  return (
    <div className={styles.rail}>
      <div className={styles.railLab}>
        {list.length ? `Showing · ${list.length}` : "No matches"}
      </div>

      {list.length === 0 ? (
        <div className={styles.railEmpty}>
          <b>No communities match.</b>
          <br />
          Try a broader filter or clear your search.
          <br />
          <button type="button" onClick={onClear}>
            Clear filters
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
            onMouseEnter={() => onPreview(d.anchor)}
            onFocus={() => onPreview(d.anchor)}
          >
            <span
              className={[styles.railDot, DOT[d.category]]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="visuallyHidden">{CAT_LABEL[d.category]} · </span>
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
                    Private — no headcount shown
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
