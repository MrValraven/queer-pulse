import { useId } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseCreditSummaryView } from "./api/studio.adapters";
import { StudioPersonaRefLink } from "./StudioPersonaRefLink";
import css from "./StudioPublicCredits.module.css";

/** The album page's compact "Credits": one row per credited persona with
 *  every role it holds across the release's tracks. */
export function StudioReleaseCreditsSummary({
  credits,
}: {
  credits: StudioReleaseCreditSummaryView[];
}) {
  const { t } = useTranslation();
  const headingId = useId();
  if (credits.length === 0) return null;
  return (
    <section className={css.summary} aria-labelledby={headingId}>
      <h2 id={headingId} className={css.summaryTitle}>
        <Translation
          i18nKey="studio:credits.album.title"
          components={{ em: <em /> }}
        />
      </h2>
      <ul className={css.summaryRows}>
        {credits.map((credit) => (
          <li key={credit.persona.id} className={css.summaryRow}>
            <StudioPersonaRefLink
              persona={credit.persona}
              className={css.summaryName ?? ""}
            >
              {credit.persona.name}
            </StudioPersonaRefLink>
            <span className={css.summaryRoles}>
              {credit.roleLabelKeys.map((key) => t(key)).join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
