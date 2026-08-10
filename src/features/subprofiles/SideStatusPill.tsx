import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileStatus } from "./api/subprofiles.api";

/**
 * The dashboard card's corner status indicator: a small `.pill` (global class
 * — ported in `persona-dashboard.css`) reading "Live" (jade) for a published
 * persona. `SideCard` only ever mounts this for `status === "published"` — a
 * draft card shows `SideReadinessRing` in that corner instead — but the draft
 * branch is implemented here too (muted "Draft", reusing `status.draft`'s
 * existing copy) so this stays a complete, reusable status pill rather than a
 * published-only one-off.
 */
export function SideStatusPill({ status }: { status: SubprofileStatus }) {
  const { t } = useTranslation();

  if (status === "published") {
    return (
      <span className="pill jade">{t("subprofiles:side.statusLive")}</span>
    );
  }

  return <span className="pill muted">{t("subprofiles:status.draft")}</span>;
}
