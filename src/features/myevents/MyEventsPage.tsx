import { AppShell } from "../../shared/components/layout";
import { MyEventsProvider } from "./MyEventsProvider";
import { MyEventsBody } from "./MyEventsBody";

/**
 * "Your events" — the dashboard for managing gatherings you're going to,
 * waitlisted for, hosting, saved, or invited to. All data is mock/static;
 * interactions are local state + toasts (see MyEventsProvider).
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
