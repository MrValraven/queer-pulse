import { Button } from "../../shared/components/ui";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/** Asks whether to drop one date or leave a whole recurring series. */
export function SeriesScopeModal() {
  const { scope, scopeChoice, closeScope } = useMyEvents();
  return (
    <>
      <div className={sx("modal-head")}>
        <div className={sx("modal-eyebrow")}>Stepping out</div>
        <h2 className={sx("modal-title")}>
          Just this one, or the <em>whole series?</em>
        </h2>
        <p className={sx("modal-evname")}>{scope.title}</p>
      </div>
      <div className={sx("modal-body")}>
        <button
          type="button"
          className={sx("set-link-row")}
          onClick={() => scopeChoice("one")}
        >
          <span className={sx("slr-t")}>
            Just this date
            <span>You'll stay in the series for future dates</span>
          </span>
          <span className={sx("slr-arrow")}>→</span>
        </button>
        <button
          type="button"
          className={sx("set-link-row")}
          onClick={() => scopeChoice("all")}
        >
          <span className={sx("slr-t")}>
            Leave the whole series<span>Drop out of every upcoming date</span>
          </span>
          <span className={sx("slr-arrow")}>→</span>
        </button>
      </div>
      <div className={sx("modal-foot")}>
        <div className={sx("modal-privacy")} />
        <Button variant="ghost" onClick={closeScope}>
          Never mind
        </Button>
      </div>
    </>
  );
}
