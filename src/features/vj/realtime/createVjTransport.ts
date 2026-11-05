import { VjDemoTransport } from "../demo/vjDemoTransport";
import type { VjTransport, VjTransportOptions } from "./vjTransport";
import { VjSocketClient } from "./vjSocket";

/** One factory for both modes: the demo channel transport or the live socket. */
export function createVjTransport(
  options: VjTransportOptions & { isDemoMode: boolean },
): VjTransport {
  const { isDemoMode, ...transportOptions } = options;
  return isDemoMode
    ? new VjDemoTransport(transportOptions)
    : new VjSocketClient(transportOptions);
}
