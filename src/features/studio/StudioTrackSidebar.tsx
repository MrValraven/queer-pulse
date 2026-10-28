import { Link } from "react-router-dom";
import { FiArrowRight, FiFileText } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioTrackView } from "./api/studio.adapters";
import { useStudioShowcase } from "./useStudioShowcase";
import { SPLIT } from "./studioTrack.data";
import { StudioEuroAmount } from "./StudioEuroAmount";
import { StudioPersonaCreditChips } from "./StudioPersonaCreditChips";
import trackStyles from "./track.module.css";

// Content: the curator's quote, the per-track split/credits breakdown and
// the track/artist names are content, left English in both locales (§1).
const CURATOR_INITIALS = "SM";
const CURATOR_NAME = "Sara Marques";
const CURATOR_QUOTE_PRE =
  '"Track six of an album I have not stopped playing since April. A ' +
  "devotional addressed plainly to a saint who isn't listening; a piano " +
  "arrangement that knows when to step out of the room. ";
const CURATOR_QUOTE_EM = "Stay through the second verse.";
const CURATOR_QUOTE_POST = '"';
const TRACK_ARTIST_SHARE = 0.8;
const TRACK_PLATFORM_SHARE = 0.2;
const TRACK_ARTIST_NAME = "Mariana";
const SHEET_ARTIST_NAME = "Mariana Sol";
/** A standard licence code, the same in every locale. */
const SHEET_LICENCE = "CC-BY-NC";

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
          <div className={trackStyles.noteRole}>
            {t("studio:track.sidebar.curatorRole")}
          </div>
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
        <Translation
          i18nKey="studio:track.sidebar.splitLead"
          values={{ artist: TRACK_ARTIST_NAME }}
          slots={{
            artistShare: (
              <StudioEuroAmount
                value={TRACK_ARTIST_SHARE}
                shouldEmphasizeNumber
              />
            ),
            platformShare: (
              <StudioEuroAmount
                value={TRACK_PLATFORM_SHARE}
                shouldEmphasizeNumber
              />
            ),
          }}
        />
      </div>
      <div className={trackStyles.splitBar}>
        <span style={{ width: "80%", background: "var(--studio-accent)" }} />
        <span style={{ width: "8%", background: "var(--jade)" }} />
        <span style={{ width: "8%", background: "var(--plum)" }} />
        <span
          style={{
            width: "4%",
            background: "rgba(var(--studio-ink-rgb), 0.2)",
          }}
        />
      </div>
      <div>
        {SPLIT.map((r) => (
          <div key={r.labelKey} className={trackStyles.splRow}>
            <span className={trackStyles.splDot} style={{ background: r.c }} />
            <span className={trackStyles.splK}>
              <b>{r.name ?? t(r.labelKey)}</b>
              {t(r.subKey)}
            </span>
            <span className={trackStyles.splV}>
              <StudioEuroAmount
                value={r.amount}
                shouldEmphasizeNumber={r.isEmphasized}
              />
            </span>
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
        <FiFileText aria-hidden />
      </span>
      <div className={trackStyles.nm}>
        <b>
          {t("studio:track.sidebar.leadSheetLabel")} · <em>{title}</em>
        </b>
        <small>
          {/* The licence code keeps its hyphens on one line. */}
          <Translation
            i18nKey="studio:track.sidebar.sheetSpec"
            values={{ artist: SHEET_ARTIST_NAME, licence: SHEET_LICENCE }}
            slots={{
              licence: (
                <span style={{ whiteSpace: "nowrap" }}>{SHEET_LICENCE}</span>
              ),
            }}
          />
        </small>
      </div>
      <Link to={routes.studioSheetStore}>
        {t("studio:track.sidebar.downloadCta")} <FiArrowRight aria-hidden />
      </Link>
    </div>
  );
}

export function StudioTrackSidebar({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  // The demo's curator note, split and lead sheet speak of a song, so they
  // show on music tracks alone.
  const isMusicShowcase =
    useStudioShowcase() && track.release.format === "music";
  return (
    <div className={trackStyles.rSide}>
      {isMusicShowcase && <StudioTrackCuratorNote />}
      {isMusicShowcase && <StudioTrackSplit />}
      <div className={trackStyles.sCard}>
        <div className={trackStyles.sEb}>
          {t("studio:track.sidebar.creditsHeading")}
        </div>
        <StudioPersonaCreditChips credits={track.personaCredits} />
        {track.credits.map((credit) => (
          <div
            key={`${credit.name}-${credit.role}`}
            className={trackStyles.credRow}
          >
            <span className={trackStyles.who}>{credit.name}</span>
            <span className={trackStyles.role}>{credit.role}</span>
          </div>
        ))}
        <Collapse
          isOpen={track.credits.length + track.personaCredits.length === 0}
        >
          <p className={trackStyles.noLyrics}>
            {t("studio:trackPage.noCredits")}
          </p>
        </Collapse>
      </div>
      {isMusicShowcase && <StudioTrackSheetMini title={track.title} />}
    </div>
  );
}
