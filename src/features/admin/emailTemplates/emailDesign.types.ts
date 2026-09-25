import type { Language } from "../../../shared/i18n/types";
import type { EmailBlock } from "./emailTemplate.types";
import type { EmailFillValues } from "./emailTemplatePurposes";

/** Every style value the block renderer reads. Email clients cannot read CSS
 *  custom properties, so colours are literal hex. */
export interface EmailDesignTheme {
  colors: {
    page: string;
    card: string;
    ink: string;
    inkMuted: string;
    /** Heading text. */
    heading: string;
    /** The italic `*word*` inside headings. */
    emphasis: string;
    link: string;
    line: string;
    buttonFill: string;
    buttonText: string;
  };
  fonts: { serif: string; sans: string };
  headingSizePx: { 1: number; 2: number };
  /** Unitless, e.g. 1.25. */
  headingLineHeight: number;
  /** e.g. "0" or "-0.01em". "0" emits no letter-spacing declaration. */
  headingLetterSpacing: string;
  headingWeight: number;
  bodySizePx: number;
  /** Unitless, e.g. 1.6. */
  bodyLineHeight: number;
  /** Bottom margin of headings, paragraphs and images. */
  blockGapPx: number;
  buttonRadiusPx: number;
  buttonPaddingCss: string;
  buttonFontSizePx: number;
  buttonMarginCss: string;
  spacerPx: { sm: number; md: number; lg: number };
}

/** The designs a block-built email can wear. Temporary while the redesign is
 *  compared: `?emailDesign=` picks one (see `emailDesignVariant.ts`), and the
 *  losers are deleted once one is chosen. */
export const EMAIL_DESIGN_VARIANTS = ["current", "stage", "letter"] as const;
export type EmailDesignVariant = (typeof EMAIL_DESIGN_VARIANTS)[number];

/** Everything a design needs to draw a whole block-built email. */
export interface EmailDesignInput {
  blocks: EmailBlock[];
  /** Placeholders already filled. */
  subject: string;
  /** Placeholders already filled; empty when the template has none. */
  preheader: string;
  values: EmailFillValues;
  language: Language;
  /** Origin for hosted images such as `https://queerpulse.com`. The preview
   *  passes the running app's origin so images load before a deploy. */
  assetOrigin: string;
}

/** Draws the full document, doctype to `</html>`. Pure and synchronous. */
export type EmailDesignRenderer = (input: EmailDesignInput) => string;
