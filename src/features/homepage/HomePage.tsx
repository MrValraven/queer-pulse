import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  Barter,
  Board,
  ChangeMakers,
  Communities,
  Discovery,
  Gatherings,
  Hero,
  Library,
  Manifesto,
  MicroGrants,
  Newsletter,
  Outro,
  PainPoints,
  Partners,
  SkillsTeaser,
  SpacesMap,
  Stories,
  Wellbeing,
} from "./sections";

/**
 * QueerPulse marketing homepage — composes the sections in the order from
 * the design prototype. Plum and cream sections alternate for rhythm.
 */
export function HomePage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <PageMeta
        title={t("homepage:meta.title")}
        description={t("homepage:meta.description")}
      />
      <Hero />
      <Manifesto />
      <Discovery />
      <Communities />
      <Gatherings />
      <PainPoints />
      <Stories />
      {/* <Media /> */}
      <ChangeMakers />
      <Wellbeing />
      <MicroGrants />
      <Board />
      <Barter />
      <SkillsTeaser />
      <Library />
      <Partners />
      <SpacesMap />
      {/*  <Platforms /> */}
      <Newsletter />
      {/* <Pillars /> */}
      <Outro />
    </PageShell>
  );
}
