import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminQueues,
  type AdminQueueSummaryDTO,
  type AdminQueuesDTO,
} from "./adminQueues.api";

/** Shared prefix for the triage console's query; the full key also carries
 *  `demoMode`. */
const ADMIN_QUEUES_KEY = "admin-queues";

/**
 * How often the console re-reads while it is the visible tab.
 *
 * One request is up to 30 aggregates for an admin and there is no server-side
 * cache, so 60s is the floor the backend contract sets. If the console ever
 * needs to feel fresher, the answer is a cache on the server rather than this
 * number going down.
 */
const POLL_INTERVAL_MS = 60_000;

/** One demo row, with its arrival derived from the age so the two agree. */
function demoQueue(
  queue: string,
  route: string,
  waitingCount: number | null,
  oldestWaitingHours: number | null,
  overdueCount: number | null,
  generatedAtMs: number,
): AdminQueueSummaryDTO {
  return {
    queue,
    route,
    waitingCount,
    oldestWaitingAt:
      oldestWaitingHours === null
        ? null
        : new Date(
            generatedAtMs - oldestWaitingHours * 60 * 60 * 1000,
          ).toISOString(),
    oldestWaitingHours,
    overdueCount,
  };
}

/**
 * The demo answer: eleven of the thirty-one queues, chosen so every render
 * path this console has is on screen at once: a breached statutory clock, a
 * queue on a deadline that is inside it, several with no deadline at all, one
 * that cannot be counted, and a handful that are simply clear.
 *
 * Demo mode never touches the network here: `/admin/queues` 403s for anyone
 * without a staff tier or a queue-bearing grant, and these figures are
 * fabricated and must never surface as platform truth.
 */
function buildDemoQueues(): AdminQueuesDTO {
  const generatedAtMs = Date.now();
  const queues: AdminQueueSummaryDTO[] = [
    demoQueue("dsar", "/admin/dsar", 3, 916, 2, generatedAtMs),
    demoQueue("reports", "/admin/moderation", 12, 15, 2, generatedAtMs),
    demoQueue("appeals", "/admin/moderation", 4, 51, 0, generatedAtMs),
    demoQueue("listing_claims", "/admin/listings", 4, 219, null, generatedAtMs),
    demoQueue(
      "magazine_submissions",
      "/admin/magazine-submissions",
      7,
      164,
      null,
      generatedAtMs,
    ),
    demoQueue(
      "safe_space_flags",
      "/admin/safe-spaces",
      2,
      30,
      null,
      generatedAtMs,
    ),
    demoQueue(
      "invite_requests",
      "/admin/join-requests",
      9,
      6,
      0,
      generatedAtMs,
    ),
    demoQueue(
      "commission_interests",
      "/admin/commission-interests",
      null,
      null,
      null,
      generatedAtMs,
    ),
    demoQueue("roadmap_ideas", "/admin/roadmap", 0, null, null, generatedAtMs),
    demoQueue(
      "legal_requests",
      "/admin/legal-requests",
      0,
      null,
      null,
      generatedAtMs,
    ),
    demoQueue(
      "reading_group_proposals",
      "/admin/reading-group-proposals",
      0,
      null,
      null,
      generatedAtMs,
    ),
  ];
  return {
    generatedAt: new Date(generatedAtMs).toISOString(),
    totals: {
      waitingCount: 41,
      overdueCount: 4,
      queuesWithWorkCount: 7,
      uncountableQueueCount: 1,
    },
    queues,
  };
}

/**
 * Everything waiting on this operator, in one read.
 *
 * The server owns the order (most overdue, then longest wait, then largest
 * backlog, then queue key) and the console keeps it, so two unchanged polls
 * never swap two rows under someone's cursor. It also owns the access filter:
 * a queue the caller cannot work is absent from `queues` entirely, so nothing
 * here may assume a fixed set of rows.
 *
 * `refetchIntervalInBackground` stays off: a console nobody is looking at has
 * no reason to keep asking a thirty-aggregate question.
 */
export function useAdminQueues() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminQueuesDTO>({
    queryKey: [ADMIN_QUEUES_KEY, demoMode],
    queryFn: async () => (demoMode ? buildDemoQueues() : getAdminQueues()),
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}
