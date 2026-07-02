export const LEVELS = ["", "Weak", "Fair", "Good", "Strong"];

export function strengthScore(v: string): number {
  let score = 0;
  if (v.length >= 10) score++;
  if (v.length >= 14) score++;
  if (/[0-9]/.test(v) || /[^a-zA-Z0-9]/.test(v)) score++;
  if (v.length >= 18) score++;
  return Math.min(score, 4);
}
