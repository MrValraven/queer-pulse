import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import t from "./track.module.css";

export function StudioTrackLyrics() {
  const [lang, setLang] = useState("PT");
  return (
    <div className={t.lyrCard}>
      <div className={t.lyrH}>
        <h3>
          Lyrics &amp; <em>translation</em>
        </h3>
        <div className={t.lyrLang}>
          {["PT", "EN", "FR"].map((l) => (
            <button
              type="button"
              key={l}
              className={lang === l ? t.lyrLangOn : undefined}
              onClick={() => setLang(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className={t.lyric}>
        <div className={t.annot}>
          Verse one — addressed to St. Iria, plainly
        </div>
        <p className={t.played}>Querida santa, não me ouves —</p>
        <p className={t.played}>e ainda assim te escrevo.</p>
        <p className={t.played}>
          A casa está vazia, a <em>rádio</em> ligada,
        </p>
        <p className={t.now}>e a luz que entra é a tua.</p>
        <p>O dia inteiro à porta, à espera —</p>
        <p>como quem espera a chuva.</p>
        <div className={t.annot}>Verse two — to her mother, the same day</div>
        <p>Mãe deixou a chave por baixo da pedra,</p>
        <p>a manhã que partiu.</p>
        <p>
          Disseste-me: <em>não voltes.</em>
        </p>
        <p>Eu não voltei.</p>
        <div className={t.annot}>Chorus</div>
        <p>Santa que ouve quem ninguém ouve —</p>
        <p>esta casa é tua também.</p>
      </div>
      <div className={t.lyrFoot}>
        <span>Translated by Helena P. · approved by the artist · Apr 2026</span>
        <Link to={routes.studioSheetStore}>Lead sheet &amp; chords →</Link>
      </div>
    </div>
  );
}
