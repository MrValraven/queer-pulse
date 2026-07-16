import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CinemaShell } from "./CinemaShell";
import {
  AboutHero,
  CuratorsCouncil,
  Governance,
  Principles,
  SplitVisual,
  TheDeed,
} from "./CinemaAboutSections";

export function CinemaAboutPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <CinemaShell>
      <AboutHero />
      <TheDeed />
      <Principles />
      <SplitVisual />
      <CuratorsCouncil />
      <Governance />

      <Outro
        title={
          <Translation
            i18nKey="cinema:about.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:about.outro.sub", { price: fmt.currency(7) })}
      >
        <Button size="lg" to={routes.cinemaMembership}>
          {t("cinema:about.outro.cta")}
        </Button>
      </Outro>
    </CinemaShell>
  );
}
