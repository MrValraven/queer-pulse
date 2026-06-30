import { Button } from "../../shared/components/ui";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";

/** Confirm step before blocking a host — destructive, so never one-tap. */
export function BlockHostConfirm() {
  const { block, confirmBlock, closeBlock } = useMyEvents();
  const who = block.host ? `everyone from ${block.host}` : "this host";

  return (
    <>
      <div className={sx("modal-head")}>
        <div className={sx("modal-eyebrow")}>Block</div>
        <h2 className={sx("modal-title")}>
          Block <em>{block.host || "this host"}?</em>
        </h2>
      </div>
      <div className={sx("modal-body")}>
        <p className={sx("modal-evname")}>
          You won’t see events from {who} again, and they won’t be able to
          invite you. You can undo this any time in your settings.
        </p>
      </div>
      <div className={sx("modal-foot")}>
        <Button variant="ghost" onClick={closeBlock}>
          Cancel
        </Button>
        <Button variant="danger" onClick={confirmBlock}>
          Block
        </Button>
      </div>
    </>
  );
}
