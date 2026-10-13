import { useDemoMode } from "../../app/providers/DemoModeProvider";

/**
 * True where Studio's money and live pieces render: tip buttons and the tip
 * modal, pay pills, per-play lines, ledgers, splits, the sustain pill, the
 * rail's giving footer, listening counts and the "in set" banner. They stay
 * in the demo and never reach a live member (Studio v1 has no money and no
 * live sets). One flag, so a later launch flips them in one place.
 */
export function useStudioShowcase(): boolean {
  const { demoMode } = useDemoMode();
  return demoMode;
}
