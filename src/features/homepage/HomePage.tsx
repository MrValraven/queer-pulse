import { PageShell } from '../../shared/components/layout'
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
  Platforms,
  SkillsTeaser,
  SpacesMap,
  Stories,
  TrustStrip,
  Wellbeing,
} from './sections'

/**
 * QueerPulse marketing homepage — composes the 20 sections in the order from
 * the design prototype. Plum and cream sections alternate for rhythm.
 */
export function HomePage() {
  return (
    <PageShell>
      <Hero />
      <Manifesto />
      <TrustStrip />
      <PainPoints />
      <Discovery />
      <Gatherings />
      <Stories />
      <ChangeMakers />
      <Wellbeing />
      <Communities />
      <MicroGrants />
      <Board />
      <Barter />
      <SkillsTeaser />
      <Library />
      <Partners />
      <SpacesMap />
      <Platforms />
      <Newsletter />
      <Outro />
    </PageShell>
  )
}
