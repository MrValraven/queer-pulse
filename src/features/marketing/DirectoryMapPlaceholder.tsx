import s from "./DirectorySpacePage.module.css";

/** Decorative fallback shown in the venue map slot when a place has no
 * coordinates to plot (no `latitude`/`longitude` and no `BUSINESS_COORDS`
 * fallback). Purely presentational — extracted out of `DirectorySpaceAside`
 * to keep that component under the 200-line cap. */
export function DirectoryMapPlaceholder() {
  return (
    <>
      <svg
        viewBox="0 0 300 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="300" height="300" fill="#e9e5db" />
        <path d="M0 80 L300 100 L300 110 L0 90 Z" fill="#d9d3c5" />
        <path d="M0 180 L300 200 L300 210 L0 190 Z" fill="#d9d3c5" />
        <path d="M80 0 L100 300 L110 300 L90 0 Z" fill="#d9d3c5" />
        <path d="M200 0 L220 300 L230 300 L210 0 Z" fill="#d9d3c5" />
        <circle cx="160" cy="148" r="20" fill="#b8d4b1" opacity=".7" />
      </svg>
      <div className={s.pin}>
        <svg viewBox="0 0 24 24">
          <path d="M12 2C7 2 3 6 3 11c0 7 9 11 9 11s9-4 9-11c0-5-4-9-9-9z" />
        </svg>
      </div>
    </>
  );
}
