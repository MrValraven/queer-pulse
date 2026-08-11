import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SkinDefList } from "./SkinDefList";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Runway `end` slot: the credits dl at the foot (`skinData.credits`).
 *  `null` when the persona hasn't set one. */
export function CreditsBlock({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const credits = persona.skinData?.credits;
  if (!credits) return null;

  const rows: Array<[string, string]> = [
    [t("subprofiles:skinExtras.runway.press"), credits.press],
    [t("subprofiles:skinExtras.runway.stockists"), credits.stockists],
    [t("subprofiles:skinExtras.runway.made"), credits.made],
    [t("subprofiles:skinExtras.runway.contact"), credits.contact],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>;
  if (rows.length === 0) return null;

  return (
    <section className="credits-block">
      <h2>{t("subprofiles:skinExtras.runway.creditsTitle")}</h2>
      <SkinDefList rows={rows} />
    </section>
  );
}
