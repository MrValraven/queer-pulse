import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SkinDefList } from "./SkinDefList";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** History (Record) `end` slot: "the record itself" dl plus a note on where
 *  the record is thin (`skinData.record`). `null` when the persona hasn't
 *  set one. */
export function RecordBlock({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const record = persona.skinData?.record;
  if (!record) return null;

  const rows: Array<[string, string]> = [
    [t("subprofiles:skinExtras.history.held"), record.held],
    [t("subprofiles:skinExtras.history.access"), record.access],
    [t("subprofiles:skinExtras.history.consent"), record.consent],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>;
  if (rows.length === 0 && !record.gaps) return null;

  return (
    <section className="recordblock">
      <h2>{t("subprofiles:skinExtras.history.recordTitle")}</h2>
      <SkinDefList rows={rows} />
      {record.gaps && (
        <p className="gaps">
          <span>{t("subprofiles:skinExtras.history.gapsLabel")}</span>
          {record.gaps}
        </p>
      )}
    </section>
  );
}
