import { AppShell } from "../../shared/components/layout";
import { MyEventsProvider } from "./MyEventsProvider";
import { MyEventsBody } from "./MyEventsBody";

/**
 * "Your events" — the dashboard for managing gatherings you're going to,
 * waitlisted for, hosting, saved, or invited to. Demo mode renders the mock
 * registry; live mode sources from GET /events + GET /event-invites (see
 * `api/useMyEventsData.ts`). Interactions are local state + toasts either way
 * (see MyEventsProvider).
 */
export function MyEventsPage() {
  return (
    <AppShell>
      <MyEventsProvider>
        <MyEventsBody />
      </MyEventsProvider>
    </AppShell>
  );
}
