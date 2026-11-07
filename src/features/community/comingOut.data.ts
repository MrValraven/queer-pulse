import type { IconType } from "react-icons";
import { FiEyeOff, FiLock, FiBellOff, FiFeather } from "react-icons/fi";

export const PRIVACY: { icon: IconType; titleKey: string; bodyKey: string }[] =
  [
    {
      icon: FiEyeOff,
      titleKey: "community:comingOut.privacy.hidden.title",
      bodyKey: "community:comingOut.privacy.hidden.body",
    },
    {
      icon: FiLock,
      titleKey: "community:comingOut.privacy.offProfile.title",
      bodyKey: "community:comingOut.privacy.offProfile.body",
    },
    {
      icon: FiBellOff,
      titleKey: "community:comingOut.privacy.silentDecline.title",
      bodyKey: "community:comingOut.privacy.silentDecline.body",
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
