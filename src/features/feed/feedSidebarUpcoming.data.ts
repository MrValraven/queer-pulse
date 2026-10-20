import { gatheringPath } from "../gatherings/data";
import type { SidebarGathering } from "./feed.data";

/** The demo "Upcoming" rows. Dates are built from `now` so the rows always
 *  read as upcoming: one tonight (the filled "today" tile shows in demo) and
 *  one about a week and a half out. Live mode reads the viewer's own events
 *  through `pickSidebarGatherings` instead. */
export function buildDemoSidebarGatherings(now: Date): SidebarGathering[] {
  const tonight = new Date(now);
  tonight.setHours(19, 0, 0, 0);
  const inNineDays = new Date(now);
  inNineDays.setDate(inNineDays.getDate() + 9);
  inNineDays.setHours(19, 30, 0, 0);
  return [
    {
      to: gatheringPath("queer-night-swim"),
      date: tonight,
      name: "Queer Night Swim",
      venue: "Piscina Municipal",
    },
    {
      to: gatheringPath("queer-book-club"),
      date: inNineDays,
      name: "Queer Book Club",
      venue: "LX Factory",
    },
  ];
}
