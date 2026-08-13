/**
 * Grid keyboard nav (APG calendar pattern): arrow keys move focus a day/week,
 * Home/End jump to the focused week's edges, PageUp/PageDown page a month
 * (Shift = a year), Enter/Space select the focused day. Split out of
 * `Calendar.tsx` to keep that component under the line budget.
 */

import type { KeyboardEvent } from "react";
import type { CalendarState } from "./useCalendarState";

export function handleCalendarKeyDown(
  event: KeyboardEvent<HTMLTableElement>,
  state: CalendarState,
) {
  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      state.moveFocus("day", 1);
      break;
    case "ArrowLeft":
      event.preventDefault();
      state.moveFocus("day", -1);
      break;
    case "ArrowDown":
      event.preventDefault();
      state.moveFocus("week", 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      state.moveFocus("week", -1);
      break;
    case "Home":
      event.preventDefault();
      state.focusWeekEdge("start");
      break;
    case "End":
      event.preventDefault();
      state.focusWeekEdge("end");
      break;
    case "PageDown":
      event.preventDefault();
      state.moveFocus(event.shiftKey ? "year" : "month", 1);
      break;
    case "PageUp":
      event.preventDefault();
      state.moveFocus(event.shiftKey ? "year" : "month", -1);
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      state.select(state.focusedDate);
      break;
    default:
      break;
  }
}
