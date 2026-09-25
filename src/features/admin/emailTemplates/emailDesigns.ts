import type {
  EmailDesignRenderer,
  EmailDesignVariant,
} from "./emailDesign.types";
import { renderCurrentEmail } from "./emailDesign";
import { renderLetterEmail } from "./design/letterDesign";
import { renderStageEmail } from "./design/stageDesign";

/** Every design `renderEmail` can draw, by `?emailDesign=` value. Temporary:
 *  once one design is picked, the others and this switch are deleted. */
export const EMAIL_DESIGNS: Record<EmailDesignVariant, EmailDesignRenderer> = {
  current: renderCurrentEmail,
  stage: renderStageEmail,
  letter: renderLetterEmail,
};
