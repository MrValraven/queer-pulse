import type { IconType } from "react-icons";
import { FiEyeOff, FiLock, FiSlash, FiFeather } from "react-icons/fi";

export const PRIVACY: { icon: IconType; titleKey: string; bodyKey: string }[] = [
  {
    icon: FiEyeOff,
    titleKey: "community:comingOut.privacy.invisible.title",
    bodyKey: "community:comingOut.privacy.invisible.body",
  },
  {
    icon: FiLock,
    titleKey: "community:comingOut.privacy.noList.title",
    bodyKey: "community:comingOut.privacy.noList.body",
  },
  {
    icon: FiSlash,
    titleKey: "community:comingOut.privacy.confidentiality.title",
    bodyKey: "community:comingOut.privacy.confidentiality.body",
  },
  {
    icon: FiFeather,
    titleKey: "community:comingOut.privacy.noPressure.title",
    bodyKey: "community:comingOut.privacy.noPressure.body",
  },
];

export const STAGES = [
  {
    n: "01",
    titleKey: "community:comingOut.stage.readFirst.title",
    bodyKey: "community:comingOut.stage.readFirst.body",
  },
  {
    n: "02",
    titleKey: "community:comingOut.stage.saySafely.title",
    bodyKey: "community:comingOut.stage.saySafely.body",
  },
  {
    n: "03",
    titleKey: "community:comingOut.stage.moveOn.title",
    bodyKey: "community:comingOut.stage.moveOn.body",
  },
];
