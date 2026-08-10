import { FiEdit2, FiEye, FiShare2, FiTrash2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

interface SideCardFooterProps {
  /** Opens the persona in the editor. */
  onEdit: () => void;
  /** Opens the persona's own page (public/self-preview). */
  onOpen: () => void;
  /** Copies/opens the share affordance — the caller (dashboard page) owns the
   *  actual copy-link/QR-card behaviour `MySubprofilesPage` already has; this
   *  card only fires the request. */
  onShare: () => void;
  /** Opens the delete-confirm flow — the caller owns the confirm modal,
   *  mirroring `MySubprofilesPage`'s `onDelete` handling today. */
  onDelete: () => void;
}

/**
 * The card's `.side-acts` action row (global class, ported in
 * `persona-dashboard.css`): equal-width Edit / View / Share, plus a compact
 * quiet Delete. The prototype's own `.btn`/`.btn-quiet` primitives aren't
 * ported (this repo has its own `Button`) — `.side-acts-quiet` is this
 * repo's stand-in for that flex:none/compact treatment, applied via
 * `Button`'s `className` pass-through. Pulled out of `SideCard` to keep it
 * under the 200-line cap.
 */
export function SideCardFooter({
  onEdit,
  onOpen,
  onShare,
  onDelete,
}: SideCardFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="side-acts">
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <FiEdit2 aria-hidden /> {t("subprofiles:mine.rowEdit")}
      </Button>
      <Button variant="ghost" size="sm" onClick={onOpen}>
        <FiEye aria-hidden /> {t("subprofiles:side.viewCta")}
      </Button>
      <Button variant="ghost" size="sm" onClick={onShare}>
        <FiShare2 aria-hidden /> {t("subprofiles:share.cta")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="side-acts-quiet"
        onClick={onDelete}
        aria-label={t("subprofiles:mine.rowDelete")}
        title={t("subprofiles:mine.rowDelete")}
      >
        <FiTrash2 aria-hidden />
      </Button>
    </div>
  );
}
