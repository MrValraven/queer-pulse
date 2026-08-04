import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SPLIT, CREDITS } from "./studioTrack.data";
import trackStyles from "./track.module.css";

// Content — the curator's quote, the per-track split/credits breakdown and
// the track/artist names are content, left English in both locales (§1).
const TRACK_TITLE = "Carta para a santa";

export function StudioTrackSidebar() {
  const { t } = useTranslation();
  return (
    <div className={trackStyles.rSide}>
      <div className={trackStyles.sCard}>
        <div className={trackStyles.sEb}>
          {t("studio:track.sidebar.curatorNoteLabel")}
        </div>
        <div className={trackStyles.noteHead}>
          <div className={trackStyles.noteAv}>SM</div>
          <div>
            <div className={trackStyles.noteName}>Sara Marques</div>
            <div className={trackStyles.noteRole}>
              programming lead · the Wednesday set
            </div>
          </div>
        </div>
        <p>
          "Track six of an album I have not stopped playing since April. A
          devotional addressed plainly to a saint who isn't listening; a piano
          arrangement that knows when to step out of the room.{" "}
          <em>Stay through the second verse.</em>"
        </p>
      </div>

      <div className={trackStyles.sCard}>
        <div className={trackStyles.sEb}>
          {t("studio:track.sidebar.splitHeading")}
        </div>
        <div className={trackStyles.splitLead}>
          €<em>0.80</em> to Mariana. €<em>0.20</em> keeps the room open.
        </div>
        <div className={trackStyles.splitBar}>
          <span style={{ width: "80%", background: "var(--accent)" }} />
          <span style={{ width: "8%", background: "var(--jade)" }} />
          <span style={{ width: "8%", background: "var(--plum)" }} />
          <span style={{ width: "4%", background: "rgba(247,243,238,.2)" }} />
        </div>
        <div>
          {SPLIT.map((r) => (
            <div key={r.k} className={trackStyles.splRow}>
              <span
                className={trackStyles.splDot}
                style={{ background: r.c }}
              />
              <span className={trackStyles.splK}>
                <b>{r.k}</b>
                {r.sub}
              </span>
              <span className={trackStyles.splV}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={trackStyles.sCard}>
        <div className={trackStyles.sEb}>
          {t("studio:track.sidebar.creditsHeading")}
        </div>
        {CREDITS.map((c) => (
          <div key={c.who} className={trackStyles.credRow}>
            <span className="who">{c.who}</span>
            <span className="role">{c.role}</span>
          </div>
        ))}
      </div>

      <div className={trackStyles.sheetMini}>
        <span className="icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M4 4h12l4 4v12H4z" />
            <path d="M16 4v4h4M8 13h8M8 17h5" />
          </svg>
        </span>
        <div className="nm">
          <b>
            {t("studio:track.sidebar.leadSheetLabel")} · <em>{TRACK_TITLE}</em>
          </b>
          <small>6 pages · piano + voice · CC-BY-NC · Mariana Sol</small>
        </div>
        <Link to={routes.studioSheetStore}>
          {t("studio:track.sidebar.downloadCta")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
