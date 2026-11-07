import { useCallback, useEffect, useRef, useState } from "react";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import {
  vjShouldConfirmPackSwitch,
  type VjPackReadiness,
} from "../rules/vjPackReadiness";

export interface VjPackSwitchConfirmRequest {
  packId: string;
  readiness: VjPackReadiness;
}

export interface VjPackSwitch {
  /** A pack chip tap: nothing for the active pack, the confirm for a pack the screens have not loaded, else `setPack` at once. */
  request: (packId: string) => void;
  /** The pack whose chip stays pressed while its switch is on its way. */
  pendingPackId: string | null;
  confirm: VjPackSwitchConfirmRequest | null;
  /** Switch pack: sends the confirmed pack. */
  accept: () => void;
  /** Keep the current pack: closes the confirm and sends nothing. */
  dismiss: () => void;
}

interface VjPendingPack {
  packId: string;
  /** The active pack when the switch was sent; any change from it ends the wait. */
  fromPackId: string | null;
}

/**
 * The pack tabs' switch flow. `pendingPackId` holds until the stage's active
 * pack moves off the pack it was on when the switch went out (to the asked
 * pack, or to another a second remote picked) or the send fails.
 */
export function useVjPackSwitch(options: {
  activePackId: string | null;
  readinessOf: (packId: string) => VjPackReadiness;
  setPack: (packId: string) => Promise<VjCommandOutcome>;
}): VjPackSwitch {
  const { activePackId, readinessOf, setPack } = options;
  const [pending, setPending] = useState<VjPendingPack | null>(null);
  const [confirm, setConfirm] = useState<VjPackSwitchConfirmRequest | null>(
    null,
  );
  const setPackRef = useRef(setPack);
  const activePackIdRef = useRef(activePackId);
  useEffect(() => {
    setPackRef.current = setPack;
    activePackIdRef.current = activePackId;
  });

  // Once the active pack moves off where it was, the wait is over. The stale
  // entry is dropped during render (React's adjust-state-on-prop-change
  // pattern), so a later move back to that pack never revives it.
  const isPendingOver = pending !== null && activePackId !== pending.fromPackId;
  if (isPendingOver) setPending(null);
  const pendingPackId =
    pending !== null && !isPendingOver ? pending.packId : null;

  const send = useCallback((packId: string) => {
    const nextPending: VjPendingPack = {
      packId,
      fromPackId: activePackIdRef.current,
    };
    setPending(nextPending);
    void setPackRef.current(packId).then((outcome) => {
      if (outcome.ok && !outcome.isNoop) return;
      // A refusal or a no-op: the stage stays where it is, so the chip lets go.
      setPending((current) => (current === nextPending ? null : current));
    });
  }, []);

  const request = useCallback(
    (packId: string) => {
      if (packId === activePackIdRef.current) return;
      if (pendingPackId === packId) return;
      const readiness = readinessOf(packId);
      if (vjShouldConfirmPackSwitch(readiness, false)) {
        setConfirm({ packId, readiness });
        return;
      }
      setConfirm(null);
      send(packId);
    },
    [pendingPackId, readinessOf, send],
  );

  const accept = useCallback(() => {
    if (confirm === null) return;
    setConfirm(null);
    if (confirm.packId === activePackIdRef.current) return;
    send(confirm.packId);
  }, [confirm, send]);

  const dismiss = useCallback(() => setConfirm(null), []);

  return {
    request,
    pendingPackId,
    confirm,
    accept,
    dismiss,
  };
}
