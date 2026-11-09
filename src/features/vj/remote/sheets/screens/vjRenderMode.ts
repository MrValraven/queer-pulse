import type {
  VjRenderMode,
  VjScreenStatus,
} from "../../../../../shared/contracts/vj";

/** How long after the ack the switch waits for the screens' health reports to agree. */
export const VJ_RENDER_MODE_SETTLE_MAX_MS = 8_000;

function connectedScreensOf(
  screens: readonly VjScreenStatus[],
): VjScreenStatus[] {
  return screens.filter((screen) => screen.isConnected);
}

function isReportingSimple(screen: VjScreenStatus): boolean {
  return screen.health?.renderer === "simple";
}

/** "simple" when at least one screen is connected and every connected screen reports the simple renderer. */
export function vjShowRenderModeOf(
  screens: readonly VjScreenStatus[],
): VjRenderMode {
  const connectedScreens = connectedScreensOf(screens);
  const isEveryScreenSimple =
    connectedScreens.length > 0 && connectedScreens.every(isReportingSimple);
  return isEveryScreenSimple ? "simple" : "effects";
}

/** simple: every connected screen reports simple; effects: no connected screen does. */
export function isVjRenderModeSettled(
  screens: readonly VjScreenStatus[],
  mode: VjRenderMode,
): boolean {
  const connectedScreens = connectedScreensOf(screens);
  return mode === "simple"
    ? connectedScreens.every(isReportingSimple)
    : !connectedScreens.some(isReportingSimple);
}
