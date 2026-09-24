import { useTranslation } from "../../shared/i18n/useTranslation";
import "./side-readiness-ring.css";

/**
 * The draft-readiness indicator on the dashboard card and in the editor
 * rail: a 36px conic-gradient percentage ring (global `.ring` class, styled
 * in `side-readiness-ring.css` and imported here so it renders on any route)
 * driven by the `--p` custom property, with a punched-out inner circle
 * showing the number itself — never a glyph. `readyCount`/`totalCount` come
 * from `estimateDraftReadiness` (`subprofileDraftReadiness.ts`), the single
 * client readiness estimate shared with `SubprofileDraftBanner`.
 */
export function SideReadinessRing({
  readyCount,
  totalCount,
}: {
  readyCount: number;
  totalCount: number;
}) {
  const { t } = useTranslation();
  const pct = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  return (
    <span
      className="ring"
      style={{ ["--p" as string]: pct }}
      aria-label={t("subprofiles:ring.ariaLabel", { pct })}
    >
      <i>{pct}</i>
    </span>
  );
}
