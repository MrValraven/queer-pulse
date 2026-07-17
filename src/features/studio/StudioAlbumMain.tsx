import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { StudioTrackRowSkeleton } from "./StudioSkeletons";
import { memberName } from "../members/data/members";
import { TRACKS, type AlbumTabId } from "./studioAlbum.data";
import styles from "./studio.module.css";

const ARTIST_NAME = "Mariana Sol";
const PER_PLAY_AMOUNT = 0.05;

export function StudioAlbumMain({ tab }: { tab: AlbumTabId }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const loading = useSimulatedLoad();

  return (
    <div>
      {tab === "tracklist" && (
        <div className={styles.setCard}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <StudioTrackRowSkeleton key={i} />
              ))
            : TRACKS.map((trackRow, i) => (
                <FadeIn
                  key={trackRow.n}
                  delay={Math.min(i, 8) * 60}
                  className={[styles.setRow, trackRow.now && styles.setRowNow]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className={styles.n}>{trackRow.n}</div>
                  <div className={styles.srCov}>
                    <ImageSlot
                      src={trackRow.image}
                      tint="coral"
                      width={36}
                      height={36}
                      radius={5}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <h5>
                      {trackRow.pre}
                      {trackRow.em && <em>{trackRow.em}</em>}
                      {trackRow.post}
                    </h5>
                    <div className={styles.who}>{trackRow.who}</div>
                  </div>
                  <div className={styles.pay}>
                    {trackRow.now ? (
                      <Translation
                        i18nKey="studio:player.payingLine"
                        components={{ b: <b /> }}
                        values={{
                          amount: fmt.currency(PER_PLAY_AMOUNT),
                          artist: ARTIST_NAME,
                        }}
                      />
                    ) : (
                      t("studio:album.main.perPlaySuffix", {
                        amount: fmt.currency(PER_PLAY_AMOUNT),
                      })
                    )}
                  </div>
                  <div className={styles.tm}>{trackRow.tm}</div>
                </FadeIn>
              ))}
        </div>
      )}

      {tab === "linerNotes" && (
        <div className={styles.prose}>
          <p>
            This is a record I have been writing in pieces since I was nineteen.
            In Sintra, mostly. Some of it in Beja, where my mother is from and
            where the saint of the title lived, briefly, before she went to
            Lisbon to be martyred.
          </p>
          <p>
            I wrote eleven songs and recorded ten in a kitchen in Anjos with one
            cellist, one engineer, and an upright piano that belonged to my
            landlady. Track nine has my grandmother in it — a field recording I
            made of her humming, before she knew I was recording.
          </p>
          <p>
            If you can pay, buy the record at €8 and{" "}
            <em>€6.40 of that comes to me directly.</em> If you can't, play it
            as many times as you like and €0.05 still finds me each time. This
            is the room I make a living in. Thank you for being in it.
          </p>
          <div className={styles.author}>
            <span className={styles.av}>MS</span>
            Mariana Sol · Sintra, April 2026
          </div>
        </div>
      )}

      {tab === "credits" && (
        <div className={styles.prose}>
          <p>
            <strong style={{ color: "var(--text)" }}>Mariana Sol</strong> —
            voice, piano, words on all 11 tracks · 85% of writer share
          </p>
          <p>
            João Anjos — cello (2, 7, 11) · Coro de Outubro — choir (4) · Inês
            T. — percussion (7)
          </p>
          <p>
            {memberName("sofia")} — engineer + mix · Pedro G. — mastering ·
            Helena P. — lyric translation,{" "}
            <em>paid from the solidarity fund.</em>
          </p>
          <p>
            Recorded at Casa do Comum, in-kind. Every fee is on the public
            ledger.
          </p>
        </div>
      )}
    </div>
  );
}
