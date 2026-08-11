import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SkinDefList } from "./SkinDefList";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Chair `afterBio` slot: the price/booking band shown after the bio
 *  (`skinData.chair`). `null` when the persona hasn't set one. */
export function ChairCard({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const chair = persona.skinData?.chair;
  if (!chair) return null;

  const rows: Array<[string, string]> = [
    [t("subprofiles:skinExtras.chair.rate"), chair.rate],
    [t("subprofiles:skinExtras.chair.walkins"), chair.walkins],
    [t("subprofiles:skinExtras.chair.where"), chair.where],
    [t("subprofiles:skinExtras.chair.quiet"), chair.quiet],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>;
  if (rows.length === 0) return null;

  return (
    <section className="chaircard">
      <SkinDefList rows={rows} />
    </section>
  );
}

/** Chair `end` slot: the "before you sit down" list at the foot
 *  (`skinData.beforeYouSit`). `null` when the persona hasn't listed any. */
export function BeforeYouSit({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const lines = persona.skinData?.beforeYouSit;
  if (!lines || lines.length === 0) return null;

  return (
    <section className="beforesit">
      <h2>{t("subprofiles:skinExtras.chair.beforeYouSitTitle")}</h2>
      <ul>
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
