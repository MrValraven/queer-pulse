import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioTrackView } from "./api/studio.adapters";
import { useStudioShowcase } from "./useStudioShowcase";
import { SPLIT } from "./studioTrack.data";
import trackStyles from "./track.module.css";

// Content: the curator's quote, the per-track split/credits breakdown and
// the track/artist names are content, left English in both locales (§1).
const CURATOR_INITIALS = "SM";
const CURATOR_NAME = "Sara Marques";
const CURATOR_ROLE = "programming lead · the Wednesday set";
const CURATOR_QUOTE_PRE =
  '"Track six of an album I have not stopped playing since April. A ' +
  "devotional addressed plainly to a saint who isn't listening; a piano " +
  "arrangement that knows when to step out of the room. ";
const CURATOR_QUOTE_EM = "Stay through the second verse.";
const CURATOR_QUOTE_POST = '"';
const TRACK_ARTIST_SHARE_TO = " to Mariana. €";
const TRACK_PLATFORM_SHARE_NOTE = " keeps Studio open.";
const SHEET_MUSIC_SPEC = "6 pages · piano + voice · CC-BY-NC · Mariana Sol";

function StudioTrackCuratorNote() {
  const { t } = useTranslation();
  return (
    <div className={trackStyles.sCard}>
      <div className={trackStyles.sEb}>
        {t("studio:track.sidebar.curatorNoteLabel")}
      </div>
      <div className={trackStyles.noteHead}>
        <div className={trackStyles.noteAv}>{CURATOR_INITIALS}</div>
        <div>
          <div className={trackStyles.noteName}>{CURATOR_NAME}</div>
          <div className={trackStyles.noteRole}>{CURATOR_ROLE}</div>
        </div>
      </div>
      <p>
        {CURATOR_QUOTE_PRE}
        <em>{CURATOR_QUOTE_EM}</em>
        {CURATOR_QUOTE_POST}
      </p>
    </div>
  );
}

function StudioTrackSplit() {
  const { t } = useTranslation();
  return (
    <div className={trackStyles.sCard}>
      <div className={trackStyles.sEb}>
        {t("studio:track.sidebar.splitHeading")}
      </div>
      <div className={trackStyles.splitLead}>
        €<em>0.80</em>
        {TRACK_ARTIST_SHARE_TO}
        <em>0.20</em>
        {TRACK_PLATFORM_SHARE_NOTE}
      </div>
      <div className={trackStyles.splitBar}>
        <span style={{ width: "80%", background: "var(--accent)" }} />
        <span style={{ width: "8%", background: "var(--jade)" }} />
        <span style={{ width: "8%", background: "var(--plum)" }} />
        <span
          style={{ width: "4%", background: "rgba(var(--cream-rgb), 0.2)" }}
        />
      </div>
      <div>
        {SPLIT.map((r) => (
          <div key={r.k} className={trackStyles.splRow}>
            <span className={trackStyles.splDot} style={{ background: r.c }} />
            <span className={trackStyles.splK}>
              <b>{r.k}</b>
              {r.sub}
            </span>
            <span className={trackStyles.splV}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioTrackSheetMini({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <div className={trackStyles.sheetMini}>
      <span className={trackStyles.icon}>
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
      <div className={trackStyles.nm}>
        <b>
          {t("studio:track.sidebar.leadSheetLabel")} · <em>{title}</em>
        </b>
        <small>{SHEET_MUSIC_SPEC}</small>
      </div>
      <Link to={routes.studioSheetStore}>
        {t("studio:track.sidebar.downloadCta")} <FiArrowRight aria-hidden />
      </Link>
    </div>
  );
}

export function StudioTrackSidebar({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  return (
    <div className={trackStyles.rSide}>
      {isShowcase && <StudioTrackCuratorNote />}
      {isShowcase && <StudioTrackSplit />}
      <div className={trackStyles.sCard}>
        <div className={trackStyles.sEb}>
          {t("studio:track.sidebar.creditsHeading")}
        </div>
        {track.credits.length > 0 ? (
          track.credits.map((credit) => (
            <div
              key={`${credit.name}-${credit.role}`}
              className={trackStyles.credRow}
            >
              <span className={trackStyles.who}>{credit.name}</span>
              <span className={trackStyles.role}>{credit.role}</span>
            </div>
          ))
        ) : (
          <p className={trackStyles.noLyrics}>
            {t("studio:trackPage.noCredits")}
          </p>
        )}
      </div>
      {isShowcase && <StudioTrackSheetMini title={track.title} />}
    </div>
  );
}
