import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./CreativesPage.module.css";
import { Button } from '../../shared/components/ui'

const PROFILE = linkToPath("QueerPulse Profile.html");
const INVITE = linkToPath("QueerPulse Invite.html");

type Tint = "coral" | "jade" | "plum";
const TINT_BG: Record<Tint, string> = {
  coral: "rgba(232,119,90,.15)",
  jade: "rgba(74,140,111,.15)",
  plum: "rgba(45,27,61,.1)",
};
const TINT_FG: Record<Tint, string> = {
  coral: "var(--accent-ink)",
  jade: "var(--jade)",
  plum: "var(--plum)",
};

interface Featured {
  nameMain: string;
  nameEm: string;
  discipline: string;
  quote: string;
  badges: string[];
}
const FEATURED: Featured[] = [
  { nameMain: "André ", nameEm: "Quintela", discipline: "Analog Photography · Medium Format Film", quote: "I photograph people who have never liked having their photograph taken. Something always happens.", badges: ["commission", "open call"] },
  { nameMain: "Diogo ", nameEm: "Vasques", discipline: "Electronic Music · Live Sets · Film Scoring", quote: "The best show I ever played was to 12 people in a basement. No one was performing anything.", badges: ["commission", "live sets"] },
  { nameMain: "Lena ", nameEm: "Ferraz", discipline: "Textile Art · Embroidery · Installation", quote: "I embroider bodies because bodies are the first thing that gets erased.", badges: ["exhibition", "commission"] },
];

interface ArtWork {
  artist: string;
  initials: string;
  tint: Tint;
  hood: string;
  medium: string;
  title: string;
  statement: string;
  imgH: number;
  badges: string[];
}
const ART_WORKS: ArtWork[] = [
  { artist: "Inês Tavares", initials: "IT", tint: "coral", hood: "Príncipe Real", medium: "Editorial & Type Design", title: "Pulso Display — variable serif", statement: "A typeface rooted in 1970s Portuguese protest printing, reworked for contemporary queer editorial.", imgH: 200, badges: ["commission"] },
  { artist: "André Quintela", initials: "AQ", tint: "jade", hood: "Cais do Sodré", medium: "Analog Photography", title: "Faces of the Bairro", statement: "40 medium-format portraits of Mouraria residents shot over six months. No retouching, no direction.", imgH: 300, badges: ["commission", "open call"] },
  { artist: "Beatriz Pinto", initials: "BP", tint: "plum", hood: "Graça", medium: "Studio Ceramics", title: "Slow Objects — functional series", statement: "Bowls, cups, vessels designed for daily use. Each piece fired once and left to age.", imgH: 170, badges: ["exhibition"] },
  { artist: "Lena Ferraz", initials: "LF", tint: "coral", hood: "Intendente", medium: "Textile & Embroidery", title: "Corpo Presente", statement: "Large-scale embroidered figures exploring trans embodiment. Currently touring community spaces.", imgH: 260, badges: ["exhibition", "commission"] },
  { artist: "Mateus Oliveira", initials: "MO", tint: "jade", hood: "Mouraria", medium: "Illustration", title: "Lisbon Queer Zine Series", statement: "Self-published zines documenting queer life in Lisbon's historic bairros since 2023.", imgH: 210, badges: ["open call"] },
  { artist: "Sofia Andrade", initials: "SA", tint: "jade", hood: "Alfama", medium: "Documentary Film", title: "O Café das Seis", statement: "A 22-minute portrait of a Mouraria café and the chosen family that lives inside it.", imgH: 160, badges: ["exhibition"] },
  { artist: "Clara Melo", initials: "CM", tint: "plum", hood: "LX Factory", medium: "Mural & Public Art", title: "Arco — Príncipe Real mural", statement: "A 14-metre mural commissioned by the neighbourhood association. Pigment on exposed brick.", imgH: 230, badges: ["commission"] },
];

interface MusicArtist {
  id: string;
  name: string;
  tint: Tint;
  hood: string;
  genre: string;
  bio: string;
  badges: string[];
  tracks: { title: string; dur: string }[];
}
const MUSIC_ARTISTS: MusicArtist[] = [
  { id: "m1", name: "Diogo Vasques", tint: "jade", hood: "Bairro Alto", genre: "Electronic · Club · Ambient", bio: "Diogo produces textured electronic music rooted in queer club culture. He scores films, runs a live set residency at Lux, and shares a studio above a café in Bairro Alto with two other producers.", badges: ["commission", "live sets"], tracks: [{ title: "Pulso (Club Edit)", dur: "6:14" }, { title: "Noite Longa", dur: "8:02" }, { title: "Réstia", dur: "4:48" }, { title: "Cais (feat. Mariana L.)", dur: "5:33" }] },
  { id: "m2", name: "Mara Santos", tint: "coral", hood: "Arroios", genre: "Folk · New Portuguese · Voice", bio: "Mara writes and performs in Portuguese, drawing on fado structures and dismantling them. Her debut record came out in March on a small Lisbon label. She performs in spaces that feel like living rooms.", badges: ["bookings open"], tracks: [{ title: "Espelho", dur: "3:41" }, { title: "Março", dur: "4:22" }, { title: "Cidade Pequena", dur: "5:08" }] },
  { id: "m3", name: "Kiko Neves", tint: "plum", hood: "Marvila", genre: "Jazz · Experimental · Improv", bio: "Kiko plays piano and keys and leads a quartet focused on improvisation and composition in equal measure. They play roughly once a month at a natural wine bar in Marvila.", badges: ["live sets", "commission"], tracks: [{ title: "Quarta-Feira", dur: "7:18" }, { title: "Forma Livre", dur: "9:44" }, { title: "Estação", dur: "5:29" }] },
  { id: "m4", name: "Vera Luz", tint: "jade", hood: "Estrela", genre: "R&B · Soul · Production", bio: "Vera writes, produces, and sings — mostly late at night in a home studio that used to be a pantry. Her sound lives between late 90s R&B and something she hasn't named yet.", badges: ["collab"], tracks: [{ title: "Tarde de Abril", dur: "3:55" }, { title: "Ninguém Vê", dur: "4:14" }, { title: "Mel", dur: "3:38" }, { title: "Distância Zero", dur: "5:02" }] },
];

const ART_FILTERS = ["All", "Photography", "Ceramics", "Typography", "Film", "Illustration", "Textile", "Mural"];
const MUSIC_FILTERS = ["All", "Electronic", "Folk", "Jazz", "R&B", "Live sets", "Commission open"];

function badgeClass(b: string) {
  if (b.includes("commission") || b.includes("bookings")) return styles.cbCommission;
  if (b.includes("exhibition") || b.includes("live")) return styles.cbExhibition;
  return styles.cbCollab;
}

function parseDur(s: string) {
  const [m, sec] = s.split(":").map(Number);
  return m * 60 + sec;
}

function seededHeights(id: string, bars: number) {
  let seed = id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const heights: number[] = [];
  for (let i = 0; i < bars; i++) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    heights.push(0.25 + Math.abs((seed & 0xff) / 255) * 0.75);
  }
  return heights;
}

function MusicPlayer({
  artist,
  active,
  onPlay,
}: {
  artist: MusicArtist;
  active: boolean;
  onPlay: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const heights = useRef(seededHeights(artist.id, 40)).current;
  const duration = parseDur(artist.tracks[trackIdx].dur);

  useEffect(() => {
    if (!active && playing) setPlaying(false);
  }, [active, playing]);

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      setProgress((p) => {
        const next = p + 0.4 / duration;
        if (next >= 1) {
          setTrackIdx((t) => (t + 1) % artist.tracks.length);
          return 0;
        }
        return next;
      });
    }, 400);
    return () => window.clearInterval(interval);
  }, [playing, duration, artist.tracks.length]);

  const toggle = () => {
    if (playing) {
      setPlaying(false);
    } else {
      onPlay();
      setPlaying(true);
    }
  };

  const selectTrack = (i: number) => {
    setTrackIdx(i);
    setProgress(0);
  };

  const sec = Math.floor(progress * duration);
  const time = `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

  return (
    <div className={styles.player}>
      <div className={styles.playerTrack}>
        <span>{artist.tracks[trackIdx].title}</span>
        <span className={styles.trackNum}>
          {trackIdx + 1} / {artist.tracks.length}
        </span>
      </div>
      <div className={styles.playerControls}>
        <button type="button" className={styles.playBtn} onClick={toggle} aria-label="Play">
          {playing ? (
            <svg viewBox="0 0 24 24">
              <rect x="5" y="3" width="4" height="18" rx="1" />
              <rect x="15" y="3" width="4" height="18" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <div
          className={styles.waveform}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
          }}
        >
          {heights.map((h, i) => (
            <div
              key={i}
              className={[styles.wfBar, i / heights.length < progress && styles.wfBarPlayed]
                .filter(Boolean)
                .join(" ")}
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
        <span className={styles.playerTime}>{time}</span>
      </div>
      <div className={styles.trackList}>
        {artist.tracks.map((t, i) => (
          <button
            type="button"
            key={t.title}
            className={[styles.trackItem, i === trackIdx && styles.trackItemActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => selectTrack(i)}
          >
            <span className={styles.tiNum}>{i + 1}</span>
            <span className={styles.tiTitle}>{t.title}</span>
            <span className={styles.tiDur}>{t.dur}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CreativesPage() {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [mode, setMode] = useState<"art" | "music">("art");
  const [filters, setFilters] = useState<string[]>([]);
  const [activePlayer, setActivePlayer] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setInterval(
      () => setFeaturedIdx((i) => (i + 1) % FEATURED.length),
      5000,
    );
    return () => window.clearInterval(t);
  }, []);

  const f = FEATURED[featuredIdx];
  const availableFilters = mode === "art" ? ART_FILTERS : MUSIC_FILTERS;

  const toggleFilter = (name: string) => {
    if (name === "All") {
      setFilters([]);
      return;
    }
    setFilters((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  };

  const matches = (item: object) => {
    if (filters.length === 0) return true;
    const hay = JSON.stringify(item).toLowerCase();
    return filters.some((flt) => hay.includes(flt.toLowerCase()));
  };

  const artItems = ART_WORKS.filter(matches);
  const musicItems = MUSIC_ARTISTS.filter(matches);
  const count = mode === "art" ? artItems.length : musicItems.length;

  const switchMode = (m: "art" | "music") => {
    setMode(m);
    setFilters([]);
  };

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} wrap`}>
          <div className={styles.eyebrow}>Featured this week</div>
          <h1 className={styles.heroName}>
            {f.nameMain}
            <em>{f.nameEm}</em>
          </h1>
          <div className={styles.heroDiscipline}>{f.discipline}</div>
          <p className={styles.heroQuote}>“{f.quote}”</p>
          <div className={styles.heroBadges}>
            {f.badges.map((b) => (
              <span key={b} className={`${styles.badge} ${badgeClass(b)}`}>
                {b}
              </span>
            ))}
          </div>
          <div className={styles.heroNav}>
            {FEATURED.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Featured ${i + 1}`}
                className={[styles.heroDot, i === featuredIdx && styles.heroDotActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFeaturedIdx(i)}
              />
            ))}
          </div>
        </div>
      </header>

      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.modeToggle}>
            <button
              type="button"
              className={[styles.modeBtn, mode === "art" && styles.modeBtnActive].filter(Boolean).join(" ")}
              onClick={() => switchMode("art")}
            >
              Visual Art
            </button>
            <button
              type="button"
              className={[styles.modeBtn, mode === "music" && styles.modeBtnActive].filter(Boolean).join(" ")}
              onClick={() => switchMode("music")}
            >
              Music
            </button>
          </div>
          <div className={styles.filters}>
            {availableFilters.map((flt) => {
              const isActive = flt === "All" ? filters.length === 0 : filters.includes(flt);
              return (
                <button
                  key={flt}
                  type="button"
                  className={[styles.chip, isActive && styles.chipActive].filter(Boolean).join(" ")}
                  onClick={() => toggleFilter(flt)}
                >
                  {flt}
                </button>
              );
            })}
          </div>
          <div className={styles.count}>
            <b>{count}</b> {mode === "art" ? `work${count !== 1 ? "s" : ""}` : `artist${count !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      <main className={styles.body}>
        <div className="wrap">
          {mode === "art" ? (
            artItems.length === 0 ? (
              <div className={styles.empty}>
                <p>No works match those filters.</p>
              </div>
            ) : (
              <div className={styles.artGrid}>
                {artItems.map((w) => (
                  <article className={styles.artCard} key={w.title}>
                    <div className={styles.artImg} style={{ height: w.imgH }}>
                      {w.medium}
                    </div>
                    <div className={styles.artCardBody}>
                      <div className={styles.artCardTop}>
                        <span className={styles.artMedium}>{w.medium}</span>
                        <div className={styles.artBadges}>
                          {w.badges.map((b) => (
                            <span key={b} className={`${styles.badge} ${badgeClass(b)}`}>
                              {b === "commission" ? "Commission open" : b === "exhibition" ? "Exhibition" : b}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.artTitle}>{w.title}</div>
                      <div className={styles.artStatement}>{w.statement}</div>
                      <div className={styles.artFoot}>
                        <div className={styles.artAv} style={{ background: TINT_BG[w.tint], color: TINT_FG[w.tint] }}>
                          {w.initials}
                        </div>
                        <div>
                          <div className={styles.artArtist}>{w.artist}</div>
                          <div className={styles.artHood}>{w.hood}</div>
                        </div>
                        <Link to={PROFILE} className={styles.artProfile}>
                          View profile →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : musicItems.length === 0 ? (
            <div className={styles.empty}>
              <p>No artists match those filters.</p>
            </div>
          ) : (
            <div className={styles.musicGrid}>
              {musicItems.map((a) => (
                <article className={styles.musicCard} key={a.id}>
                  <div className={styles.mcLeft}>
                    <div className={styles.mcImg}>{a.name} — artist photo</div>
                    <div>
                      <div className={styles.mcName}>{a.name}</div>
                      <div className={styles.mcGenre}>{a.genre}</div>
                      <div className={styles.mcHood}>
                        <span className={styles.pin} />
                        {a.hood}
                      </div>
                    </div>
                    <div className={styles.mcBadges}>
                      {a.badges.map((b) => (
                        <span key={b} className={`${styles.badge} ${badgeClass(b)}`}>
                          {b}
                        </span>
                      ))}
                    </div>
                    <Button to={PROFILE} variant="ghost" style={{ fontSize: 13, padding: "9px 16px" }}>
                      View profile
                    </Button>
                  </div>
                  <div className={styles.mcRight}>
                    <p className={styles.mcBio}>{a.bio}</p>
                    <MusicPlayer
                      artist={a}
                      active={activePlayer === a.id}
                      onPlay={() => setActivePlayer(a.id)}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Your work <em>belongs here.</em>
          </h2>
          <p className={styles.outroSub}>
            QueerPulse is a space for queer creatives to be found, supported, and
            commissioned — by each other and the wider community.
          </p>
          <Button to={INVITE} variant="primary" size="lg">
            Add your creative profile
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
