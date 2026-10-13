import { StudioOpenCallsLive } from "./StudioOpenCallsLive";
import { StudioOpenCallsShowcase } from "./StudioOpenCallsShowcase";
import { StudioShell } from "./StudioShell";
import { useStudioShowcase } from "./useStudioShowcase";

/** /studio/calls. Live: open Funding & Grants calls tagged music. The demo
 *  keeps its council-run calls. */
export function StudioOpenCallsPage() {
  const isShowcase = useStudioShowcase();
  return (
    <StudioShell>
      {isShowcase ? <StudioOpenCallsShowcase /> : <StudioOpenCallsLive />}
    </StudioShell>
  );
}
