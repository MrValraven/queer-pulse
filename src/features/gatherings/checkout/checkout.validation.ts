/* Card / field validation + input formatting for the checkout. */

export function fmtCardNumber(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

export function fmtExpiry(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length >= 3) return d.slice(0, 2) + " / " + d.slice(2);
  return d;
}

export function fmtPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 9);
  return d.replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_m, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "),
  );
}

export function luhn(cardNumber: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let d = parseInt(cardNumber.charAt(i), 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function validCardNumber(v: string): boolean {
  const digits = v.replace(/\s/g, "");
  return digits.length === 16 && luhn(digits);
}

export function validExpiry(v: string): boolean {
  const d = v.replace(/\D/g, "");
  if (d.length !== 4) return false;
  const mm = parseInt(d.slice(0, 2), 10);
  const yy = parseInt(d.slice(2), 10);
  if (mm < 1 || mm > 12) return false;
  const expiry = new Date(2000 + yy, mm); // first day after the expiry month
  return expiry > new Date();
}

export function validCvc(v: string): boolean {
  return /^\d{3,4}$/.test(v.trim());
}

export function validName(v: string): boolean {
  return v.trim().length >= 2;
}

export function validPostal(v: string): boolean {
  return v.trim().length >= 3;
}

export function validMbway(v: string): boolean {
  return v.replace(/\D/g, "").length === 9;
}

export type CardBrand = "visa" | "mc" | "amex" | "";

export function detectBrand(v: string): CardBrand {
  const digits = v.replace(/\D/g, "");
  if (!digits) return "";
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mc";
  if (/^3[47]/.test(digits)) return "amex";
  return "";
}

const REF_ALPHABET = "0123456789ACEFHJKLMNPRTUWXY";

export function generateRef(): string {
  let s = "QP-";
  for (let i = 0; i < 6; i++) {
    s += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return s;
}

export function makeMultibancoRef(): string {
  const n = Math.floor(100000000 + Math.random() * 900000000).toString();
  return n.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}
