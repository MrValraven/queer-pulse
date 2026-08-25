import type { Language } from "./types";

/**
 * Spell a count as a word up to thirty, then fall back to numerals.
 *
 * The admin communities headline is display Fraunces — "Eight spaces," reads as
 * a sentence, "8 spaces," reads as a stat. Past thirty the word is longer than
 * it is legible, so the numeral wins.
 */
const MAXIMUM_SPELLED_NUMBER = 30;

const ENGLISH_ONES = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const ENGLISH_TENS: Record<number, string> = { 20: "Twenty", 30: "Thirty" };

const PORTUGUESE_ONES = [
  "Zero",
  "Um",
  "Dois",
  "Três",
  "Quatro",
  "Cinco",
  "Seis",
  "Sete",
  "Oito",
  "Nove",
  "Dez",
  "Onze",
  "Doze",
  "Treze",
  "Catorze",
  "Quinze",
  "Dezasseis",
  "Dezassete",
  "Dezoito",
  "Dezanove",
];
const PORTUGUESE_TENS: Record<number, string> = { 20: "Vinte", 30: "Trinta" };

function spellEnglish(value: number): string {
  if (value < 20) return ENGLISH_ONES[value]!;
  if (value === 20 || value === 30) return ENGLISH_TENS[value]!;
  const remainder = value % 10;
  const tens = value - remainder;
  return `${ENGLISH_TENS[tens]!}-${ENGLISH_ONES[remainder]!.toLowerCase()}`;
}

function spellPortuguese(value: number): string {
  if (value < 20) return PORTUGUESE_ONES[value]!;
  if (value === 20 || value === 30) return PORTUGUESE_TENS[value]!;
  const remainder = value % 10;
  const tens = value - remainder;
  return `${PORTUGUESE_TENS[tens]!} e ${PORTUGUESE_ONES[remainder]!.toLowerCase()}`;
}

export function spellNumber(value: number, language: Language): string {
  if (!Number.isInteger(value) || value < 1 || value > MAXIMUM_SPELLED_NUMBER) {
    return String(value);
  }
  return language === "pt" ? spellPortuguese(value) : spellEnglish(value);
}
