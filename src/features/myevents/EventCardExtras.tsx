import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { ACCESS_LABELS } from "./myEvents.data";
import { conflictFor } from "./myEvents.helpers";
import type { MyEvent } from "./myEvents.types";

/** Access + safety chips. */
export function AccessRow({ ev }: { ev: MyEvent }) {
  const { toast } = useMyEvents();
  if (!ev.access?.length) return null;
  return (
    <div className={sx("ev-access")}>
      {ev.access.map((k) => {
        if (k === "content") {
          return (
            <button
              key={k}
              type="button"
              className={sx("acc-chip note clickable")}
              onClick={() =>
                toast(ev.contentNote || "This event carries a content note")
              }
            >
              <span className={sx("ad")} />
              Content note
            </button>
          );
        }
        if (k === "safer") {
          return (
            <button
              key={k}
              type="button"
              className={sx("acc-chip policy clickable")}
              onClick={() =>
                toast(
                  "This gathering follows the QueerPulse safer-space policy",
                )
              }
            >
              <span className={sx("ad")} />
              Safer-space policy
            </button>
          );
        }
        const label = ACCESS_LABELS[k];
        if (!label) return null;
        return (
          <span key={k} className={sx("acc-chip")}>
            <span className={sx("ad")} />
            {label}
          </span>
        );
      })}
    </div>
  );
}

/** "Plans changed" alert strip. */
export function AlertStrip({ ev }: { ev: MyEvent }) {
  const { toast } = useMyEvents();
  if (!ev.changed) return null;
  return (
    <div className={sx("ev-alert")}>
      <svg
        className={sx("ai")}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <circle cx="8" cy="8" r="6.3" />
        <path d="M8 5v.4M8 7.4v3.6" strokeLinecap="round" />
      </svg>
      <span>
        <strong>Plans changed.</strong> {ev.changed}{" "}
        <button
          type="button"
          onClick={() => toast("Showing the full change history")}
        >
          See what changed
        </button>
      </span>
    </div>
  );
}

/** Same-time clash with another committed event. */
export function ConflictNote({ ev }: { ev: MyEvent }) {
  const { events } = useMyEvents();
  const other = conflictFor(ev, events);
  if (!other) return null;
  return (
    <div className={sx("ev-conflict")}>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path d="M8 1.8 14.8 13H1.2L8 1.8Z" strokeLinejoin="round" />
        <path d="M8 6.5v3M8 11.2v.3" strokeLinecap="round" />
      </svg>
      <span>
        <strong>Clashes with {other.title}</strong> at the same time. You can
        only be in one place — you might want to let one go.
      </span>
    </div>
  );
}

/** Cancelled / under review / blocked edge notes. */
export function EdgeNote({ ev }: { ev: MyEvent }) {
  const { toast } = useMyEvents();
  if (ev.cancelled) {
    return (
      <div className={sx("ev-edge cancel")}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <circle cx="8" cy="8" r="6.3" />
          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" strokeLinecap="round" />
        </svg>
        <span>
          <strong>The host cancelled this gathering.</strong> Your RSVP was
          released —{" "}
          <button
            type="button"
            onClick={() => toast("Finding similar gatherings…")}
          >
            find something similar
          </button>
          .
        </span>
      </div>
    );
  }
  if (ev.review) {
    return (
      <div className={sx("ev-edge review")}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            d="M8 1.5 14 4v4c0 3.5-2.6 5.6-6 6.5C4.6 13.6 2 11.5 2 8V4l6-2.5Z"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          <strong>Under review.</strong> A report came in, so this gathering is
          being checked by our team. It stays up while we look —{" "}
          <button
            type="button"
            onClick={() => toast("Opening the review status…")}
          >
            see status
          </button>
          .
        </span>
      </div>
    );
  }
  if (ev.blocked) {
    return (
      <div className={sx("ev-edge block")}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <circle cx="8" cy="8" r="6.3" />
          <path d="M3.6 3.6l8.8 8.8" strokeLinecap="round" />
        </svg>
        <span>
          Someone you’ve blocked is going to this. They won’t see you, and you
          won’t see them on the night.
        </span>
      </div>
    );
  }
  return null;
}

/** Recurring-series line. */
export function SeriesLine({ ev }: { ev: MyEvent }) {
  const { toast } = useMyEvents();
  if (!ev.series) return null;
  return (
    <button
      type="button"
      className={sx("ev-series")}
      onClick={() => toast(`Upcoming dates · ${ev.series?.dates || ""}`)}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 6a5 5 0 0 1 8-1.6L13 6M13 2.6V6H9.6" />
        <path d="M13 10a5 5 0 0 1-8 1.6L3 10M3 13.4V10h3.6" />
      </svg>
      {ev.series.label}
      {ev.series.more ? ` · ${ev.series.more}` : ""}
    </button>
  );
}

/** Day-of run-of-show panel (only when the event is today). */
export function DayOfPanel({ ev, show }: { ev: MyEvent; show: boolean }) {
  const dof = ev.dayof;
  if (!dof) return null;
  return (
    <div className={`${sx("dayof")} ${show ? sx("show") : ""}`}>
      {dof.run && (
        <div className={sx("dof-sec")}>
          <div className={sx("dof-h")}>Run of show</div>
          {dof.run.map((r) => (
            <div key={r[0]} className={sx("dof-row")}>
              <span className={sx("dof-t")}>{r[0]}</span>
              <span>{r[1]}</span>
            </div>
          ))}
        </div>
      )}
      {dof.bring && (
        <div className={sx("dof-sec")}>
          <div className={sx("dof-h")}>What to bring</div>
          <div className={sx("dof-tags")}>
            {dof.bring.map((b) => (
              <span key={b} className={sx("dof-tag")}>
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
      {(dof.meet || dof.door) && (
        <div className={sx("dof-sec")}>
          <div className={sx("dof-h")}>Getting in</div>
          <div className={sx("dof-info")}>
            {dof.meet && (
              <>
                <strong>Meeting point:</strong> {dof.meet}
                <br />
              </>
            )}
            {dof.door && (
              <>
                <strong>Door code:</strong> {dof.door}{" "}
                <span style={{ color: "var(--ink-40)" }}>
                  — shown because it starts soon
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
