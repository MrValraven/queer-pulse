import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioSalesPendingCount } from "./studioPurchases.api";
import type { StudioSalesPendingCountDTO } from "./studioPurchases.types";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const PENDING_COUNT_STALE_MS = 60_000;

/** A whole count of at least zero; anything unreadable reads zero. */
const wholeCountOf = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;

/** Payments waiting for a decision across every persona the member runs (the
 *  menu dot and each persona's badge). A failure reads as zero, so the dot
 *  stays folded and nothing toasts. */
export function useStudioSalesPendingCount(): {
  count: number;
  countFor: (subprofileId: string) => number;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.salesPendingCount(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : PENDING_COUNT_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async (): Promise<StudioSalesPendingCountDTO> => {
        const dto = demoMode
          ? (
              await import("./studioDemoPurchases")
            ).demoStudioSalesPendingCount()
          : await getStudioSalesPendingCount();
        return {
          count: wholeCountOf(dto.count),
          byPersona: (dto.byPersona ?? [])
            .filter((row) => typeof row?.subprofileId === "string")
            .map((row) => ({
              subprofileId: row.subprofileId,
              count: wholeCountOf(row.count),
            })),
        };
      }),
  });
  const byPersona = query.data?.byPersona ?? [];
  return {
    count: query.data?.count ?? 0,
    countFor: (subprofileId) =>
      byPersona.find((row) => row.subprofileId === subprofileId)?.count ?? 0,
  };
}
