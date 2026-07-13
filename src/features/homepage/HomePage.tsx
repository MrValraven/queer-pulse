import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
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
  Media,
  MicroGrants,
  Newsletter,
  Outro,
  PainPoints,
  Pillars,
  Partners,
  Platforms,
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
  return (
    <PageShell>
      <PageMeta
        title="QueerPulse — a queer professional network, rooted in Lisbon"
        description="A quiet, vouched-for network for LGBTQ+ professionals, creatives and community in Lisbon — no ads, no algorithm. A world, not a feature list."
      />
      <Hero />
      <Manifesto />
      <PainPoints />
      <Discovery />
      <Gatherings />
      {/*  <Stories /> 
      <Media />
      <ChangeMakers />*/}
      <Wellbeing />
      <Communities />
      <MicroGrants />
      <Board />
      <Barter />
      <SkillsTeaser />
      <Library />
      {/* <Partners /> */}
      <SpacesMap />
      {/*  <Platforms /> */}
      <Newsletter />
      {/* <Pillars /> */}
      <Outro />
    </PageShell>
  );
}
