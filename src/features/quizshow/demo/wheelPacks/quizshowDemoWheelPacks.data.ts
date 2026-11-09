/** The five wheel templates in publish order. */
import { POP_DIVAS_WHEEL_PACK } from "./popDivas.data";
import { QUEER_ANTHEMS_WHEEL_PACK } from "./queerAnthems.data";
import { QUEER_TV_NIGHT_WHEEL_PACK } from "./queerTvNight.data";
import { SCREEN_ICONS_WHEEL_PACK } from "./screenIcons.data";
import { SAPPHIC_NIGHT_WHEEL_PACK } from "./sapphicNight.data";
import type { QuizshowDemoWheelPack } from "./quizshowDemoWheelPack";

export const QUIZSHOW_DEMO_WHEEL_PACKS: readonly QuizshowDemoWheelPack[] = [
  POP_DIVAS_WHEEL_PACK,
  QUEER_ANTHEMS_WHEEL_PACK,
  QUEER_TV_NIGHT_WHEEL_PACK,
  SCREEN_ICONS_WHEEL_PACK,
  SAPPHIC_NIGHT_WHEEL_PACK,
];
