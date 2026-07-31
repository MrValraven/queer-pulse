import { FiStar } from "react-icons/fi";
import { STAR_SLOTS } from "./directorySpace.data";
import s from "./DirectorySpacePage.module.css";

/** A row of 5 star icons, filled up to `score`. Shared by the header rating
 * summary and each review row.
 *
 * Accessibility: pass `label` (e.g. "Rated 4 out of 5 stars") wherever the row
 * is the ONLY expression of the rating — it becomes an `img` with that name.
 * Omit it where a numeric score sits right beside the row (the header), so the
 * decorative glyphs are hidden and screen readers aren't told the rating twice. */
export function Stars({
  score,
  className,
  label,
}: {
  score: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={[s.starRow, className].filter(Boolean).join(" ")}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {STAR_SLOTS.map((n) => (
        <FiStar key={n} className={n <= score ? s.starOn : undefined} />
      ))}
    </span>
  );
}
