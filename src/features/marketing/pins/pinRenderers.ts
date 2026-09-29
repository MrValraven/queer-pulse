import type { PinRenderer } from "./pinRenderer";
import type { PinStyle } from "./pinStyle";
import { portraitPinRenderer } from "./portraitPin";
import { teardropPinRenderer } from "./teardropPin";

// The renderer behind each pin style, picked once per map instance.
export const PIN_RENDERERS: Record<PinStyle, PinRenderer> = {
  teardrop: teardropPinRenderer,
  portrait: portraitPinRenderer,
};
