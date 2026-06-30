import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { RECOMMENDATIONS } from "./myEvents.data";

/** "You might like" recommendations strip, shown under the upcoming agenda. */
export function Discovery() {
  const { toast } = useMyEvents();
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const recs = RECOMMENDATIONS.filter((r) => !hidden[r.id]);
  if (!recs.length) return null;

  const hide = (id: string) => setHidden((h) => ({ ...h, [id]: true }));

  return (
    <div className={sx("disco")}>
      <div className={sx("disco-head")}>
        <div className={sx("disco-title")}>
          You might <em>like</em>
        </div>
      </div>
      <div className={sx("disco-grid")}>
        {recs.map((r) => (
          <div key={r.id} className={sx("disco-card")}>
            <div className={sx("disco-reason")}>
              <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <path d="M7 1l1.6 3.6L12.5 5 9.7 7.6l.7 4L7 9.7 3.6 11.6l.7-4L1.5 5l3.9-.4Z" />
              </svg>
              {r.reason}
            </div>
            <div className={sx("disco-name")}>{r.title}</div>
            <div className={sx("disco-meta")}>
              {r.date} · {r.venue}
            </div>
            <div className={sx("disco-actions")}>
              <Button
                variant="jade"
                onClick={() => {
                  toast("You’re going — added to your events", "success");
                  hide(r.id);
                }}
              >
                I’m going
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  toast("Saved for later", "success");
                  hide(r.id);
                }}
              >
                Save
              </Button>
              <Button variant="ghost" onClick={() => hide(r.id)}>
                Hide
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
