import { useState } from "react";

/** Today, read once per mount, so sample dates hold still while the page is
 *  open and stay ahead of whoever opens it. */
export function useSampleToday(): Date {
  const [today] = useState(() => new Date());
  return today;
}
