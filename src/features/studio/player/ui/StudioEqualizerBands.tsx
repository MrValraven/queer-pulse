import type { CSSProperties } from "react";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EQUALIZER_BANDS } from "../studioAudioGraph";
import {
  STUDIO_EQUALIZER_MAX_GAIN_DB,
  readEqualizerGains,
  writeEqualizerGains,
} from "../studioPlayerPreferences";
import styles from "./StudioEqualizer.module.css";

const KILOHERTZ = 1000;

/** The five band sliders, low to high, each from -12 to +12 dB around a
 *  centre line. A change is heard at once and kept on this device. */
export function StudioEqualizerBands({
  id,
  gainsDb,
}: {
  /** The Adjust bands button's aria-controls target. */
  id: string;
  gainsDb: readonly number[];
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const frequencyOf = (frequencyHz: number) =>
    frequencyHz < KILOHERTZ
      ? t("studio:player.equalizer.frequencyHz", {
          value: formatters.number(frequencyHz),
        })
      : t("studio:player.equalizer.frequencyKhz", {
          value: formatters.number(frequencyHz / KILOHERTZ),
        });
  const gainTextOf = (gainDb: number) =>
    t("studio:player.equalizer.gainValue", {
      value: formatters.number(gainDb, { signDisplay: "exceptZero" }),
    });
  const setBand = (index: number, gainDb: number) => {
    // Read at event time: a fast drag can land before the next render.
    const next = [...readEqualizerGains()];
    next[index] = gainDb;
    writeEqualizerGains(next);
  };
  return (
    <ul id={id} className={styles.bands}>
      {STUDIO_EQUALIZER_BANDS.map((band, index) => {
        const gainDb = gainsDb[index] ?? 0;
        const frequency = frequencyOf(band.frequencyHz);
        const gainText = gainTextOf(gainDb);
        // Where the thumb sits, as a share of the track, for the fill that
        // runs from the centre line to it.
        const position =
          ((gainDb + STUDIO_EQUALIZER_MAX_GAIN_DB) /
            (STUDIO_EQUALIZER_MAX_GAIN_DB * 2)) *
          100;
        return (
          <li key={band.frequencyHz} className={styles.band}>
            <span className={styles.bandFrequency} aria-hidden="true">
              {frequency}
            </span>
            <input
              type="range"
              className={styles.bandRange}
              min={-STUDIO_EQUALIZER_MAX_GAIN_DB}
              max={STUDIO_EQUALIZER_MAX_GAIN_DB}
              step={1}
              value={gainDb}
              style={
                {
                  "--band-from": `${Math.min(position, 50)}%`,
                  "--band-to": `${Math.max(position, 50)}%`,
                } as CSSProperties
              }
              aria-label={t("studio:player.equalizer.bandLabel", {
                frequency,
              })}
              aria-valuetext={gainText}
              onChange={(event) => setBand(index, Number(event.target.value))}
            />
            <span className={styles.bandValue} aria-hidden="true">
              {gainText}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
