import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SkinDefList } from "./SkinDefList";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Chart `top` slot: the live-sky band shown under the hero (`skinData.sky`).
 *  `null` when the persona hasn't set one. */
export function ChartSkyNow({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const sky = persona.skinData?.sky;
  if (!sky) return null;

  return (
    <div className="skynow">
      <span className="skynow-label">
        {t("subprofiles:skinExtras.chart.skyNowLabel")}
      </span>
      <b>{sky.moon}</b>
      {sky.phase && <span>{sky.phase}</span>}
      {sky.note && <span>{sky.note}</span>}
    </div>
  );
}

/** Chart `afterBio` slot: what the astrologer needs from a querent before a
 *  reading (`skinData.birthData`). `null` when the persona hasn't set one. */
export function ChartBirthData({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const birthData = persona.skinData?.birthData;
  if (!birthData) return null;

  const rows: Array<[string, string]> = [
    [t("subprofiles:skinExtras.chart.birthDate"), birthData.date],
    [t("subprofiles:skinExtras.chart.birthTime"), birthData.time],
    [t("subprofiles:skinExtras.chart.birthPlace"), birthData.place],
  ];
  const hasRows = rows.some(([, value]) => Boolean(value));
  if (!hasRows && !birthData.note) return null;

  return (
    <section className="birthdata">
      <h2>{t("subprofiles:skinExtras.chart.birthDataTitle")}</h2>
      <SkinDefList rows={rows} />
      {birthData.note && <p className="note">{birthData.note}</p>}
    </section>
  );
}

/** Chart `end` slot: the "what a reading is not" boundary list
 *  (`skinData.ethics`). `null` when the persona hasn't listed any. */
export function ChartEthics({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const ethics = persona.skinData?.ethics;
  if (!ethics || ethics.length === 0) return null;

  return (
    <section className="ethics">
      <h2>{t("subprofiles:skinExtras.chart.ethicsTitle")}</h2>
      <ul>
        {ethics.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
