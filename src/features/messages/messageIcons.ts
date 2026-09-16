// src/features/messages/messageIcons.ts
/**
 * ONE source for the message icons that used to be bespoke inline SVG paths,
 * so the sites that need the SAME glyph (the pin mark on a bubble and the
 * pinned-banner icon) cannot drift apart by importing two different icons.
 *
 * `react-icons/fi` (Feather, the house pack) has no double-tick, and its pin
 * is a map-location marker where a "pinned message" needs a thumbtack shape.
 * Those two come from `react-icons/tb` (Tabler) instead: Tabler renders
 * `fill="none" stroke="currentColor"` outline glyphs in the same stroke
 * weight family as Feather, the closest visual match to the removed
 * bespoke strokes. `tb` is already imported elsewhere in the repo.
 */
export {
  TbClock as PendingIcon,
  TbCheck as SentIcon,
  TbChecks as DoubleTickIcon,
  TbPin as PinIcon,
  TbStarFilled as StarIcon,
} from "react-icons/tb";
