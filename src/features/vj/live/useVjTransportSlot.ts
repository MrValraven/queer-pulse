import { useCallback, useMemo, useRef } from "react";
import type {
  VjAckFor,
  VjClientFrameName,
  VjClientPayload,
  VjScreenStatusPayload,
} from "../realtime/vjFrames";
import { VjSendError, type VjTransport } from "../realtime/vjTransport";

/** Holds the transport of the current mount; sends refuse as disconnected while none is held. */
export function useVjTransportSlot() {
  const transportRef = useRef<VjTransport | null>(null);

  const holdTransport = useCallback((transport: VjTransport | null) => {
    transportRef.current = transport;
  }, []);

  const releaseTransport = useCallback((transport: VjTransport) => {
    if (transportRef.current === transport) transportRef.current = null;
  }, []);

  const transportSend = useMemo<Pick<VjTransport, "send">>(
    () => ({
      send<Name extends VjClientFrameName>(
        name: Name,
        payload: VjClientPayload<Name>,
      ): Promise<VjAckFor<Name>> {
        const transport = transportRef.current;
        if (transport === null) {
          return Promise.reject(new VjSendError(name, "disconnected"));
        }
        return transport.send(name, payload);
      },
    }),
    [],
  );

  const sendScreenStatus = useCallback((payload: VjScreenStatusPayload) => {
    transportRef.current?.sendScreenStatus(payload);
  }, []);

  return { holdTransport, releaseTransport, transportSend, sendScreenStatus };
}
