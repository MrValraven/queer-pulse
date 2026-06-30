import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiPlus, FiCheck } from "react-icons/fi";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useSocial } from "../../app/providers/SocialProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { StudioShell } from "./StudioShell";
import { StudioTipModal } from "./StudioTipModal";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import {
  heroImage,
  ARTIST_ID,
  TABS,
  RELEASES,
  SINGLES,
} from "./studioArtist.data";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";

const tagClass = { free: styles.tagFree, mem: styles.tagMem };

export function StudioArtistPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Music");
  const { isFollowing, toggleFollow } = useSocial();
  const { showToast } = useToast();
  const [tipOpen, setTipOpen] = useState(false);
  const following = isFollowing(ARTIST_ID);
  const loading = useSimulatedLoad();

  function share() {
    const url =
      typeof window !== "undefined" ? window.location.href : "/studio/artist";
    navigator.clipboard?.writeText(url).then(
      () => showToast("Link copied to clipboard", "success"),
      () => showToast("Could not copy link", "info"),
    );
  }

  return (
    <StudioShell>
      <section className={styles.detailHero}>
        <div className={styles.detailArt} style={{ borderRadius: "50%" }}>
          <ImageSlot
            src={heroImage}
            tint="coral"
            width="100%"
            height="100%"
            radius={9999}
            shape="circle"
            placeholder="Mariana Sol"
            initials="MS"
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
        <div>
          <div className={styles.kind}>Artist · Sintra</div>
          <h1>
            Mariana <em>Sol</em>
          </h1>
          <div className={styles.by}>
            8 releases · 15 sheet-music sets · <strong>4,200 sustainers</strong>
          </div>
          <div className={styles.heroActions}>
            <Link
              to={routes.studioAlbum}
              className={styles.playBig}
              aria-label="Play"
            >
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </Link>
            <button
              onClick={() => {
                const now = toggleFollow(ARTIST_ID);
                showToast(
                  now ? "Following Mariana Sol" : "Unfollowed Mariana Sol",
                  now ? "success" : "info",
                );
              }}
            >
              {following ? (
                <>
                  <FiCheck /> Following
                </>
              ) : (
                <>
                  <FiPlus /> Follow
                </>
              )}
            </button>
            <button className={styles.tip} onClick={() => setTipOpen(true)}>
              <FiHeart /> Tip Mariana
            </button>
            <button onClick={share}>Share</button>
          </div>
          <div className={styles.payPill}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>
              Subscribe at <em>€3/mo</em>, direct to Mariana, no platform cut.{" "}
              <span className={styles.small}>Or tip on top of streaming.</span>
            </span>
          </div>
        </div>
      </section>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={[styles.tab, tab === t && styles.tabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <section className={styles.detailGrid}>
        <div>
          {tab === "About" ? (
            <div className={styles.prose}>
              <p>
                Mariana Sol writes letters set to a piano so patient it
                sometimes forgets to play. Born in Beja, based in Sintra. Her
                work moves between fado's grammar and something quieter — the
                song you hum doing the dishes.
              </p>
              <p>
                She has released everything she's made through QueerPulse Studio
                since 2022,{" "}
                <em>on the same 80% split as every other artist here.</em> She
                mentors two younger composers through the solidarity fund.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.rowH} style={{ marginBottom: 14 }}>
                <h2>Releases</h2>
              </div>
              {loading ? (
                <StudioCardGridSkeleton
                  className={styles.rowGrid}
                  count={3}
                  style={{ gridTemplateColumns: "repeat(3,1fr)" }}
                />
              ) : (
                <div
                  className={styles.rowGrid}
                  style={{ gridTemplateColumns: "repeat(3,1fr)" }}
                >
                  {RELEASES.map((r, i) => (
                    <FadeIn
                      key={r.pre}
                      delay={Math.min(i, 8) * 60}
                      as={Link}
                      to={r.to}
                      className={styles.card}
                    >
                      <div className={styles.cardCov}>
                        <ImageSlot
                          src={r.image}
                          tint={r.tint}
                          width="100%"
                          height="100%"
                          radius={10}
                          placeholder="cv"
                          style={{ position: "absolute", inset: 0 }}
                        />
                        <span className={`${styles.tag} ${styles.tagMem}`}>
                          Sustainer
                        </span>
                      </div>
                      <h4>
                        {r.pre}
                        {r.em && <em>{r.em}</em>}
                      </h4>
                      <div className={styles.meta}>{r.meta}</div>
                      <div className={styles.payLine}>
                        <span>{r.buy}</span>
                        <em>{r.split}</em>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              )}

              <div className={styles.rowH} style={{ margin: "32px 0 14px" }}>
                <h2>
                  Singles &amp; <em>standalones</em>
                </h2>
              </div>
              {loading ? (
                <StudioCardGridSkeleton
                  className={styles.rowGrid}
                  count={5}
                  style={{ gridTemplateColumns: "repeat(5,1fr)" }}
                />
              ) : (
                <div
                  className={styles.rowGrid}
                  style={{ gridTemplateColumns: "repeat(5,1fr)" }}
                >
                  {SINGLES.map((s, i) => (
                    <FadeIn
                      key={s.pre}
                      delay={Math.min(i, 8) * 60}
                      as={Link}
                      to={routes.studioAlbum}
                      className={styles.card}
                    >
                      <div className={styles.cardCov}>
                        <ImageSlot
                          src={s.image}
                          tint={s.tint}
                          width="100%"
                          height="100%"
                          radius={10}
                          placeholder="cv"
                          style={{ position: "absolute", inset: 0 }}
                        />
                        <span className={`${styles.tag} ${tagClass[s.tag]}`}>
                          {s.tag === "mem" ? "Sustainer" : "Free"}
                        </span>
                      </div>
                      <h4>
                        {s.pre}
                        {s.em && <em>{s.em}</em>}
                      </h4>
                      <div className={styles.meta}>{s.meta}</div>
                    </FadeIn>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.sideCol}>
          <div className={styles.buyCard}>
            <div className={styles.eb}>Sustain Mariana directly</div>
            <div className={styles.price}>
              €<em>3</em>
              <span style={{ fontSize: 14, color: "var(--text40)" }}>
                /month
              </span>
            </div>
            <div className={styles.sub}>
              Direct to Mariana. No platform cut. Subscribers get early-access
              tracks, the weekly note, and seats at every live broadcast.
            </div>
            <div className={styles.buyActions}>
              <Link
                to={routes.studioCheckout}
                className={`${styles.bt} ${styles.btP}`}
              >
                Subscribe · €3/mo
              </Link>
              <button className={styles.bt} onClick={() => setTipOpen(true)}>
                One-off tip
              </button>
            </div>
          </div>

          <div className={styles.ledgerCard}>
            <div className={styles.head}>Mariana · this month</div>
            <div className={styles.lrow}>
              <span className={styles.k}>Plays</span>
              <span className={styles.v}>
                36,<em>400</em>
              </span>
            </div>
            <div className={styles.lrow}>
              <span className={styles.k}>Earnings (streaming)</span>
              <span className={styles.v}>
                €<em>1,820</em>
              </span>
            </div>
            <div className={styles.lrow}>
              <span className={styles.k}>Tips received</span>
              <span className={styles.v}>
                €<em>448</em>
              </span>
            </div>
            <div className={styles.lrow}>
              <span className={styles.k}>Direct subscribers</span>
              <span className={styles.v}>
                €<em>612</em>
              </span>
            </div>
            <Link to={routes.governance} className={styles.cta}>
              Full ledger →
            </Link>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.eb}>Upcoming</div>
            <div className={styles.lrow} style={{ marginTop: 10 }}>
              <span className={styles.k}>
                Premiere ·{" "}
                <em style={{ color: "var(--text)", fontStyle: "italic" }}>
                  Cidade dos santos
                </em>
                <br />
                10 Jun · 21:00 Lisbon
              </span>
              <Link
                to={routes.rsvp}
                className={styles.cta}
                style={{ marginTop: 0 }}
              >
                RSVP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {tipOpen && (
        <StudioTipModal
          recipient="Mariana Sol"
          onClose={() => setTipOpen(false)}
        />
      )}
    </StudioShell>
  );
}
