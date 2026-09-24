import {
  EMAIL_DESIGNS,
  type EmailDesign,
  type EmailDesignSpec,
} from "./emailDesign.types";
import { EMAIL_DESIGN_CURRENT } from "./emailDesignCurrent";
import { EMAIL_DESIGN_LETTER } from "./emailDesignLetter";
import { EMAIL_DESIGN_MASTHEAD } from "./emailDesignMasthead";

export const EMAIL_DESIGN_SPECS: Record<EmailDesign, EmailDesignSpec> = {
  current: EMAIL_DESIGN_CURRENT,
  masthead: EMAIL_DESIGN_MASTHEAD,
  letter: EMAIL_DESIGN_LETTER,
};

export const DEFAULT_EMAIL_DESIGN: EmailDesign = "current";

export function isEmailDesign(value: unknown): value is EmailDesign {
  return (
    typeof value === "string" &&
    (EMAIL_DESIGNS as readonly string[]).includes(value)
  );
}
