import type { Language } from "../../../shared/i18n/types";

/** The visual designs the email renderer can dress a block-built email in. */
export type EmailDesign = "current" | "masthead" | "letter";

export const EMAIL_DESIGNS: readonly EmailDesign[] = [
  "current",
  "masthead",
  "letter",
];

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

export interface EmailDesignSpec {
  theme: EmailDesignTheme;
  /** Wraps the rendered block HTML in the full document (doctype to </html>). */
  wrapShell: (bodyHtml: string, subject: string, language: Language) => string;
  /** The HTML for a divider block. */
  dividerHtml: string;
}
