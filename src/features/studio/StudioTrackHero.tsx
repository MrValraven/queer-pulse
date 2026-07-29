import { FiHeart, FiPlus, FiCheck } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { TRACK, coverImage } from "./studioTrack.data";
import ss from "./studio.module.css";

// Content — this track's position/duration/earnings are per-instance mock
// figures; the artist name is content. Only the surrounding chrome sentences
// are translated (§1).
const TRACK_POSITION = { current: 6, total: 11 };
const ARTIST_NAME = "Mariana Sol";
const MONTH_EARNINGS = 2140;
const QUICK_TIP_AMOUNT = 2;
const PER_LISTEN_AMOUNT = 0.05;

export function StudioTrackHero({ onTip }: { onTip: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();
  const saved = isSaved(TRACK.id);

  return (
    <section className={ss.hero} style={{ padding: "24px 0 32px" }}>
      <div className={ss.heroInner}>
        <div className={ss.heroArt}>
          <ImageSlot
            src={coverImage}
            tint="coral"
            width="100%"
            height="100%"
            radius={16}
            placeholder="cover · track 6"
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
        <div className={ss.heroInfo}>
          <div className={ss.eb}>
            <span className={ss.live} />{" "}
            {t("studio:track.hero.eyebrow", {
              current: TRACK_POSITION.current,
              total: TRACK_POSITION.total,
            })}
          </div>
          <h1>
            Carta para a <em>santa</em>
          </h1>
          <div className={ss.by}>
            by <strong>{ARTIST_NAME}</strong> · from <em>Cidade dos santos</em>{" "}
            · 2026
          </div>
          <div className={ss.stats}>
            <span>
              <Translation
                i18nKey="studio:room.hero.listening"
                components={{ em: <em /> }}
                values={{ count: 312 }}
              />
            </span>
            <span className={ss.dot} />
            <span>4:18</span>
            <span className={ss.dot} />
            <span>Flac · 24/48</span>
            <span className={ss.dot} />
            <span>
              <Translation
                i18nKey="studio:track.hero.payMonth"
                components={{ em: <em /> }}
                values={{
                  amount: fmt.currency(MONTH_EARNINGS),
                  artist: ARTIST_NAME,
                }}
              />
            </span>
          </div>
          <div className={ss.heroActions}>
            <button
              type="button"
              className={ss.playBig}
              aria-label={t("studio:player.play")}
            >
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const now = toggleSave(TRACK);
                showToast(
                  now
                    ? t("studio:room.hero.addedToast")
                    : t("studio:room.hero.removedToast"),
                  now ? "success" : "info",
                );
              }}
            >
              {saved ? (
                <>
                  <FiCheck /> {t("studio:room.hero.inLibrary")}
                </>
              ) : (
                <>
                  <FiPlus /> {t("studio:room.hero.addLibrary")}
                </>
              )}
            </button>
            <button type="button" className={ss.tip} onClick={onTip}>
              <FiHeart />{" "}
              {t("studio:player.tipCta", {
                amount: fmt.currency(QUICK_TIP_AMOUNT),
              })}
            </button>
          </div>
          <div className={ss.payPill}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>
              <Translation
                i18nKey="studio:room.hero.payNote"
                components={{ em: <em /> }}
                values={{
                  artist: ARTIST_NAME,
                  amount: fmt.currency(PER_LISTEN_AMOUNT),
                }}
              />{" "}
              <span className={ss.small}>{t("studio:room.hero.tipOnTop")}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
