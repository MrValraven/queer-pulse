import { Link } from "react-router-dom";
import { FiPlus, FiCheck } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSaved } from "../../app/providers/useSaved";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { StudioLine } from "./StudioSkeletons";
import s from "./live.module.css";
import { WF, PLAYED, SET, coverImage } from "./studioLive.data";

const stateClass: Record<string, string> = {
  played: s.setPlayed!,
  now: s.setNow!,
  upnext: s.setUpNext!,
  queued: s.setQueued!,
};

const LIVE_TRACK = {
  id: "post:studio-live-carta-para-a-santa",
  kind: "post" as const,
  title: "Carta para a santa",
  href: "/studio/live",
  meta: "Mariana Sol · live set",
};

/** Mirrors live .setRow: number, cover, title, pay, time. */
function LiveSetRowSkeleton() {
  return (
    <div className={s.setRow}>
      <StudioLine width={14} height={11} />
      <StudioLine width={34} height={34} style={{ borderRadius: 5 }} />
      <div>
        <StudioLine width="55%" height={13} />
        <StudioLine width="35%" height={11} style={{ marginTop: 6 }} />
      </div>
      <StudioLine width={56} height={11} />
      <StudioLine width={28} height={11} />
    </div>
  );
}

export function StudioLiveNow({ onTip }: { onTip: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(LIVE_TRACK.id);
  const loading = useSimulatedLoad();

  return (
    <div>
      <div className={s.nowCard}>
        <div className={s.nowInner}>
          <div className={s.nowArt}>
            <ImageSlot
              src={coverImage}
              tint="coral"
              width="100%"
              height="100%"
              radius={14}
              placeholder="cover · Carta para a santa"
              style={{ position: "absolute", inset: 0 }}
            />
            <span className={s.stamp}>
              <span className={s.live} /> on air
            </span>
          </div>
          <div className={s.nowInfo}>
            <div className={s.eb}>
              {t("studio:liveNow.trackPosition", { current: 6, total: 12 })}
            </div>
            <h2>
              Carta para a <em>santa</em>
            </h2>
            <div className={s.by}>
              by <strong>Mariana Sol</strong> · from <em>Cidade dos santos</em>
            </div>
            <div className={s.wf}>
              {WF.map((h, i) => (
                <span
                  key={i}
                  className={
                    i < PLAYED
                      ? s.played
                      : i === PLAYED
                        ? s.nowPulse
                        : undefined
                  }
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className={s.times}>
              <span className={s.e}>1:42</span>
              <span>4:18</span>
            </div>
            <div className={s.liveActions}>
              <button
                type="button"
                className={`${s.bt} ${s.btP}`}
                onClick={onTip}
              >
                {t("studio:liveNow.tipArtistCta", {
                  artist: "Mariana",
                  amount: fmt.currency(2),
                })}
              </button>
              <button
                type="button"
                className={s.bt}
                onClick={() => {
                  const now = toggleSave(LIVE_TRACK);
                  showToast(
                    t(
                      now
                        ? "studio:liveNow.savedToast"
                        : "studio:liveNow.removedToast",
                    ),
                    now ? "success" : "info",
                  );
                }}
              >
                {saved ? (
                  <>
                    <FiCheck /> {t("studio:liveNow.savedCta")}
                  </>
                ) : (
                  <>
                    <FiPlus /> {t("studio:liveNow.saveTrackCta")}
                  </>
                )}
              </button>
              <Link to={routes.studioTrack} className={s.bt}>
                {t("studio:liveNow.lyricsNotesCta")}
              </Link>
            </div>
          </div>
        </div>
        <div className={s.listeners}>
          <div>
            <div className={s.lsV}>
              <em>312</em>
            </div>
            <div className={s.lsL}>
              {t("studio:liveNow.listenersLabel", {
                sustainers: 89,
                casual: 223,
              })}
            </div>
          </div>
          <div>
            <div className={`${s.lsV} ${s.jade}`}>
              €<em>448</em>
            </div>
            <div className={s.lsL}>{t("studio:liveNow.tippedLabel")}</div>
          </div>
          <div>
            <div className={s.lsV}>
              €<em>0.05</em>
            </div>
            <div className={s.lsL}>
              {t("studio:liveNow.perPlayLabel", { artist: "Mariana" })}
            </div>
          </div>
        </div>
      </div>

      <div className={s.tlH}>
        <h3>
          <Translation
            i18nKey="studio:liveNow.setBuilding.heading"
            components={{ em: <em /> }}
          />
        </h3>
        <div className="meta">
          Sara typed the up-next track <em>2 sec ago</em>
        </div>
      </div>
      <div className={s.setCard}>
        {loading
          ? Array.from({ length: 8 }).map((_, skeletonIndex) => (
              <LiveSetRowSkeleton key={skeletonIndex} />
            ))
          : SET.map((setRow, setRowIndex) => (
              <FadeIn
                key={setRow.n}
                delay={Math.min(setRowIndex, 8) * 60}
                className={`${s.setRow} ${stateClass[setRow.state]}`}
              >
                <span className={s.srN}>{setRow.n}</span>
                <span className={s.srCov}>
                  <ImageSlot
                    src={setRow.image}
                    tint={setRow.tint as "coral" | "jade" | "plum"}
                    width={34}
                    height={34}
                    radius={5}
                    placeholder=""
                  />
                </span>
                <div className={s.srInfo}>
                  <h5>
                    {setRow.pre}
                    {setRow.em && <em>{setRow.em}</em>}
                    {setRow.post}
                  </h5>
                  <div className={s.srWho}>{setRow.who}</div>
                </div>
                <div className={s.srPay}>
                  {setRow.payNote && (
                    <b style={{ color: "var(--accent)" }}>{setRow.payNote}</b>
                  )}
                  {setRow.payEm ? (
                    <em
                      style={{
                        color: "var(--accent)",
                        fontStyle: "italic",
                      }}
                    >
                      {setRow.payEm}
                    </em>
                  ) : (
                    setRow.pay
                  )}
                </div>
                <span className={s.srTm}>{setRow.tm}</span>
              </FadeIn>
            ))}
      </div>
    </div>
  );
}
