/** Whether two dates fall on the same calendar day. Split out of CalendarGrid.tsx
 * so that file only exports components (react-refresh/only-export-components). */
export function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
