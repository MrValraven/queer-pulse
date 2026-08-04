import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import trackStyles from "./track.module.css";

export function StudioTrackLyrics() {
  const { t } = useTranslation();
  const [lang, setLang] = useState("PT");
  return (
    <div className={trackStyles.lyrCard}>
      <div className={trackStyles.lyrH}>
        <h3>
          <Translation
            i18nKey="studio:track.lyrics.heading"
            components={{ em: <em /> }}
          />
        </h3>
        <div className={trackStyles.lyrLang}>
          {["PT", "EN", "FR"].map((languageCode) => (
            <button
              type="button"
              key={languageCode}
              className={
                lang === languageCode ? trackStyles.lyrLangOn : undefined
              }
              onClick={() => setLang(languageCode)}
            >
              {languageCode}
            </button>
          ))}
        </div>
      </div>
      <div className={trackStyles.lyric}>
        <div className={trackStyles.annot}>
          Verse one — addressed to St. Iria, plainly
        </div>
        <p className={trackStyles.played}>Querida santa, não me ouves —</p>
        <p className={trackStyles.played}>e ainda assim te escrevo.</p>
        <p className={trackStyles.played}>
          A casa está vazia, a <em>rádio</em> ligada,
        </p>
        <p className={trackStyles.now}>e a luz que entra é a tua.</p>
        <p>O dia inteiro à porta, à espera —</p>
        <p>como quem espera a chuva.</p>
        <div className={trackStyles.annot}>
          Verse two — to her mother, the same day
        </div>
        <p>Mãe deixou a chave por baixo da pedra,</p>
        <p>a manhã que partiu.</p>
        <p>
          Disseste-me: <em>não voltes.</em>
        </p>
        <p>Eu não voltei.</p>
        <div className={trackStyles.annot}>Chorus</div>
        <p>Santa que ouve quem ninguém ouve —</p>
        <p>esta casa é tua também.</p>
      </div>
      <div className={trackStyles.lyrFoot}>
        <span>Translated by Helena P. · approved by the artist · Apr 2026</span>
        <Link to={routes.studioSheetStore}>
          {t("studio:track.lyrics.leadSheetChordsCta")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
