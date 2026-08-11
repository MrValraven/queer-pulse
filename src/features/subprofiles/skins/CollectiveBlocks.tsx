import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Collective (Poster) `top` slot: the "next" action band in the hero
 *  (`skinData.nextAction`). `null` when the persona hasn't set one. */
export function NextAction({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const nextAction = persona.skinData?.nextAction;
  if (!nextAction || !nextAction.what) return null;

  return (
    <div className="nextaction">
      <span className="nextaction-label">
        {t("subprofiles:skinExtras.collective.nextLabel")}
      </span>
      <b>{nextAction.what}</b>
      {nextAction.when && (
        <span className="nextaction-when">{nextAction.when}</span>
      )}
      {nextAction.where && (
        <span className="nextaction-where">{nextAction.where}</span>
      )}
    </div>
  );
}

/** Collective (Poster) `end` slot: the "how we work" ordered principles list
 *  at the foot (`skinData.principles`). `null` when the persona hasn't listed
 *  any. */
export function Principles({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const principles = persona.skinData?.principles;
  if (!principles || principles.length === 0) return null;

  return (
    <section className="principles">
      <h2>{t("subprofiles:skinExtras.collective.principlesTitle")}</h2>
      <ol>
        {principles.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </section>
  );
}
