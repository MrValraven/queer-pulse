import { FiHeart, FiPlus, FiCheck } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useSaved } from "../../app/providers/SavedProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { TRACK, coverImage } from "./studioTrack.data";
import ss from "./studio.module.css";

export function StudioTrackHero({ onTip }: { onTip: () => void }) {
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
            <span className={ss.live} /> Track 6 of 11 · playing now in the set
          </div>
          <h1>
            Carta para a <em>santa</em>
          </h1>
          <div className={ss.by}>
            by <strong>Mariana Sol</strong> · from <em>Cidade dos santos</em> ·
            2026
          </div>
          <div className={ss.stats}>
            <span>
              <em>312</em> listening
            </span>
            <span className={ss.dot} />
            <span>4:18</span>
            <span className={ss.dot} />
            <span>Flac · 24/48</span>
            <span className={ss.dot} />
            <span>
              <em>€2,140</em> to Mariana this month
            </span>
          </div>
          <div className={ss.heroActions}>
            <button type="button" className={ss.playBig} aria-label="Play">
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
                    ? "Track saved to your library"
                    : "Removed from your library",
                  now ? "success" : "info",
                );
              }}
            >
              {saved ? (
                <>
                  <FiCheck /> In library
                </>
              ) : (
                <>
                  <FiPlus /> Library
                </>
              )}
            </button>
            <button type="button" className={ss.tip} onClick={onTip}>
              <FiHeart /> Tip €2
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
              This listen pays Mariana <em>€0.05</em>.{" "}
              <span className={ss.small}>Tip on top? 100% to her.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
