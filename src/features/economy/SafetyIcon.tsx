import {
  FiAlertTriangle,
  FiCreditCard,
  FiDollarSign,
  FiEye,
  FiFileText,
  FiFlag,
  FiLock,
  FiShield,
  FiTag,
  FiTrendingUp,
  FiVideo,
} from "react-icons/fi";
import type { SafetyIconName } from "./housingSafety.data";

/** Icon-name → react-icons element. Kept beside the data union it renders. */
const ICONS: Record<SafetyIconName, typeof FiEye> = {
  eye: FiEye,
  video: FiVideo,
  tag: FiTag,
  shield: FiShield,
  lock: FiLock,
  creditCard: FiCreditCard,
  fileText: FiFileText,
  coins: FiDollarSign,
  trendingUp: FiTrendingUp,
  alertTriangle: FiAlertTriangle,
  flag: FiFlag,
};

/**
 * Decorative safety glyph. The meaning always sits in the adjacent text, so
 * the icon is `aria-hidden` — never the sole signal.
 */
export function SafetyIcon({
  name,
  size = 18,
}: {
  name: SafetyIconName;
  size?: number;
}) {
  const Glyph = ICONS[name];
  return <Glyph size={size} aria-hidden />;
}
