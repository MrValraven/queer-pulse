/**
 * A `[label, value]` definition list — the shared `<dl><div><dt/><dd/></div></dl>`
 * body behind the practice skin's session logistics (`PracticePractical`) and
 * the stage skin's booking details (`StageBooker`). Drops rows with an empty
 * value and renders nothing when none remain. The differing surrounding chrome
 * (each block's wrapper `<div>` and optional `<h2>`) stays with the caller,
 * which keeps its own guard so an all-empty block renders no wrapper at all.
 */
export function SkinDefList({ rows }: { rows: Array<[string, string]> }) {
  const filled = rows.filter(([, value]) => Boolean(value));
  if (filled.length === 0) return null;

  return (
    <dl>
      {filled.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
