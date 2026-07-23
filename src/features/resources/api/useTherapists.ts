import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { THERAPISTS, type Therapist } from "../mentalHealth.data";

export interface TherapistsResult {
  /** The therapist directory. Empty in live mode — there's no directory backend yet. */
  therapists: Therapist[];
  /**
   * True when running against the live API. The therapist directory isn't wired
   * to the backend yet, so live mode has no listings and callers show a
   * "coming soon" notice instead of the mock `mentalHealth.data.ts` content.
   */
  comingSoon: boolean;
}

/**
 * Demo-gated source for the mental-health therapist directory
 * (`TherapistSection`). Demo mode serves the colocated `mentalHealth.data.ts`
 * mock; live mode returns nothing (no therapist endpoint exists yet) so no fake
 * therapists leak once the platform is un-populated. Swap the empty branch for a
 * real `GET /therapists` call when the backend exposes one.
 */
export function useTherapists(): TherapistsResult {
  const { demoMode } = useDemoMode();
  if (demoMode) {
    return { therapists: THERAPISTS, comingSoon: false };
  }
  return { therapists: [], comingSoon: true };
}
