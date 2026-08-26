import type { IconType } from "react-icons";
import { FiEye, FiShield, FiUsers } from "react-icons/fi";

/** Why-vouch explainer cards — platform-authored chrome (identical regardless
 *  of who's being vouched for), so `titleKey`/`bodyKey` hold catalog keys
 *  rather than raw strings; the page resolves them with `t()`. */
export const MEANS: { icon: IconType; titleKey: string; bodyKey: string }[] = [
  {
    icon: FiUsers,
    titleKey: "members:vouch.means.know.title",
    bodyKey: "members:vouch.means.know.body",
  },
  {
    icon: FiShield,
    titleKey: "members:vouch.means.safe.title",
    bodyKey: "members:vouch.means.safe.body",
  },
  {
    icon: FiEye,
    titleKey: "members:vouch.means.council.title",
    bodyKey: "members:vouch.means.council.body",
  },
];
