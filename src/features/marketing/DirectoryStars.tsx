import { FiStar } from "react-icons/fi";
import { STAR_SLOTS } from "./directorySpace.data";
import s from "./DirectorySpacePage.module.css";

/** A row of 5 star icons, filled up to `score`. Shared by the header rating
 * summary and each review row. */
export function Stars({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  return (
    <span className={[s.starRow, className].filter(Boolean).join(" ")}>
      {STAR_SLOTS.map((n) => (
        <FiStar key={n} className={n <= score ? s.starOn : undefined} />
      ))}
    </span>
  );
}
