import { useToast } from "../../shared/components/feedback/useToast";
import { TRACKS } from "./studioSetSubmission.data";
import s from "./funding.module.css";

interface StudioSetSidebarProps {
  matched: number;
  held: number;
}

export function StudioSetSidebar({ matched, held }: StudioSetSidebarProps) {
  const { showToast } = useToast();
  return (
    <div className={s.djSide}>
      <div className={s.djCard}>
        <h3>
          Set <em>details</em>
        </h3>
        <div className={s.field}>
          <label>Set title</label>
          <input type="text" defaultValue="House for the tired" />
        </div>
        <div className={s.field}>
          <label>Type</label>
          <select defaultValue="Live DJ set">
            <option>Live DJ set</option>
            <option>Studio mix</option>
            <option>Recorded broadcast</option>
          </select>
        </div>
      </div>

      <div className={s.djCard}>
        <h3>
          Payout <em>preview</em>
        </h3>
        <div className={s.djRow}>
          <span>Tracks in set</span>
          <span
            className="v"
            style={{ fontFamily: "var(--serif)", color: "var(--cream)" }}
          >
            {TRACKS.length}
          </span>
        </div>
        <div className={s.djRow}>
          <span>Matched &amp; paying</span>
          <span
            className={`${s.v} jade`}
            style={{
              fontFamily: "var(--serif)",
              color: "var(--jade-light)",
            }}
          >
            {matched} tracks
          </span>
        </div>
        <div className={s.djRow}>
          <span>On hold (unmatched)</span>
          <span
            className={`${s.v} warn`}
            style={{ fontFamily: "var(--serif)", color: "var(--accent)" }}
          >
            {held} tracks
          </span>
        </div>
        <div className={s.djRow}>
          <span>Set payout pool</span>
          <span
            className="v"
            style={{ fontFamily: "var(--serif)", color: "var(--cream)" }}
          >
            €
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              11.40
            </em>
          </span>
        </div>
        <div className={s.holdNote}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x={3} y={11} width={18} height={11} rx={2} />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            Unmatched tracks <em>hold their share</em> until the council's
            matcher clears them. The set goes live now; held money releases the
            moment a source is confirmed.
          </span>
        </div>
      </div>

      <button
        type="button"
        className={`${s.bt} ${s.btJade} ${s.btLg}`}
        onClick={() =>
          showToast(
            "Set submitted — live now, held shares pending clearance",
            "success",
          )
        }
      >
        Submit set →
      </button>
    </div>
  );
}
