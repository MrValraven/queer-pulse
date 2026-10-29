import { FiEye } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui/IconButton";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * The icon-only control that switches a listing page to the visitor's view.
 * It lives in the moderator band (plum, so the dark tone) and in the owner
 * band (cream, so the light tone), and both mount only for someone who has
 * controls to hide. The label sits in the tooltip and the accessible name.
 */
export function DirectoryVisitorViewToggle({
  tone,
  onEnterVisitorView,
}: {
  tone: "light" | "dark";
  onEnterVisitorView: () => void;
}) {
  const { t } = useTranslation();
  const label = t("marketing:directory.detail.visitorView.enter");
  return (
    <IconButton
      tone={tone}
      size={tone === "dark" ? "sm" : "md"}
      aria-label={label}
      tooltip
      onClick={onEnterVisitorView}
    >
      <FiEye aria-hidden />
    </IconButton>
  );
}
