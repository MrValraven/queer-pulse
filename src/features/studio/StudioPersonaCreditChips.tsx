import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPersonaCreditView } from "./api/studio.adapters";
import { StudioPersonaRefLink } from "./StudioPersonaRefLink";
import css from "./StudioPublicCredits.module.css";

/** Accepted persona credits as chips (name and role). A listenable musician
 *  or DJ links to their Studio page, any other persona to /p/<handle>, and
 *  a persona with no handle reads as text. */
export function StudioPersonaCreditChips({
  credits,
}: {
  credits: StudioPersonaCreditView[];
}) {
  const { t } = useTranslation();
  if (credits.length === 0) return null;
  return (
    <ul className={css.chips} aria-label={t("studio:credits.public.listLabel")}>
      {credits.map((credit) => (
        <li key={`${credit.persona.id}:${credit.role}`}>
          <StudioPersonaRefLink
            persona={credit.persona}
            className={css.chip ?? ""}
          >
            <span className={css.chipName}>{credit.persona.name}</span>{" "}
            <span className={css.chipRole}>{t(credit.roleLabelKey)}</span>
          </StudioPersonaRefLink>
        </li>
      ))}
    </ul>
  );
}
