import { useParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { DemoDoorDashboard } from "./door/DemoDoorDashboard";
import { LiveDoorDashboard } from "./door/LiveDoorDashboard";

/**
 * The day-of dashboard (LOC-03).
 *
 * This page had no `demoMode` branch and never read `:slug`, so a real host
 * opening it from their own manage page was shown a hardcoded title, nine
 * invented guests with pronouns, "14 expected", "3 waitlist", and a scanner
 * that read nothing: tapping a name flipped local state and toasted success.
 * That is a demo-persona leak at the worst possible moment, with a queue at
 * the door and the host trusting the screen.
 *
 * The two modes are now two components with two data sources. Live resolves
 * the real gathering off the route, checks that the viewer actually organises
 * it, and drives the real check-in endpoints; demo keeps the prototype exactly
 * as it was.
 */
export function GatheringDashboardPage() {
  const { slug: param } = useParams();
  const { demoMode } = useDemoMode();
  if (demoMode) return <DemoDoorDashboard />;
  return <LiveDoorDashboard param={param} />;
}
