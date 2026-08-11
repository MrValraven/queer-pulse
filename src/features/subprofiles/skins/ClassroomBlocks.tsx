import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SkinDefList } from "./SkinDefList";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Classroom `afterBio` slot: the fees dl after the bio, with an optional
 *  chalk note (`skinData.fees`). `null` when the persona hasn't set one. */
export function FeesBlock({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const fees = persona.skinData?.fees;
  if (!fees) return null;

  const rows: Array<[string, string]> = [
    [t("subprofiles:skinExtras.classroom.cost"), fees.cost],
    [t("subprofiles:skinExtras.classroom.materials"), fees.materials],
    [t("subprofiles:skinExtras.classroom.where"), fees.where],
    [t("subprofiles:skinExtras.classroom.extras"), fees.extras],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>;
  if (rows.length === 0 && !fees.note) return null;

  return (
    <section className="fees">
      <SkinDefList rows={rows} />
      {fees.note ? <p className="chalknote">{fees.note}</p> : null}
    </section>
  );
}

/** Classroom `end` slot: the "what you leave with" promises list at the foot
 *  (`skinData.promises`). `null` when the persona hasn't listed any. */
export function Promises({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const promises = persona.skinData?.promises;
  if (!promises || promises.length === 0) return null;

  return (
    <section className="promises">
      <h2>{t("subprofiles:skinExtras.classroom.promisesTitle")}</h2>
      <ul>
        {promises.map((line) => (
          <li key={line}>
            <FiCheck aria-hidden />
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
