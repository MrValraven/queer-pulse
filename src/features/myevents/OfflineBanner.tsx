import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/** Top banner shown when the browser reports it's offline. */
export function OfflineBanner() {
  const { offline } = useMyEvents();
  return (
    <div className={`${sx("offline-banner")} ${offline ? sx("show") : ""}`}>
      You’re offline — showing your saved events. We’ll sync any changes when
      you’re back.
    </div>
  );
}
