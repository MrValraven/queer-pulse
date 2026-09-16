interface SaveDataConnection {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Never spend someone's data on a page they have not asked for. Prefetching is
 * a bet that a hover becomes a click; on Data Saver or a 2g-class connection the
 * bet is a bad one, and the losing case (bytes burned on a page never opened) is
 * exactly the case those settings exist to prevent.
 *
 * Shared by every speculative-fetch caller (`routePrefetch.tsx`'s hover/focus/
 * touch + idle tab-bar warm, `messagingRoutePrefetch.ts`'s idle `/messages`
 * chunk warm), so the one Data Saver / 2g rule is defined once. Lives in its
 * own plain module: exporting a plain function from the component file it
 * used to live in cost that file its Fast Refresh boundary in dev.
 */
export function isSpeculationUnwelcome(): boolean {
  const connection = (
    navigator as Navigator & { connection?: SaveDataConnection }
  ).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return (
    connection.effectiveType === "2g" || connection.effectiveType === "slow-2g"
  );
}
