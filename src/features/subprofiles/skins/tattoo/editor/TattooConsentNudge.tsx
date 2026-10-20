import { FiAlertCircle } from "react-icons/fi";
import { Badge, Collapse } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import { needsConsentNudge } from "../tattooItemImages";
import { isTattooBodyPhotoSection } from "../tattooVocab.data";

/**
 * The owner's "Confirm consent" chip on an editor list row: a body photo saved
 * before consent ticks existed, or one with the tick off. It folds away once
 * the owner opens the photo and ticks the box. Every other section renders
 * nothing here.
 */
export function TattooConsentNudge({ item }: { item: SubprofileItemView }) {
  const { t } = useTranslation();
  if (!isTattooBodyPhotoSection(item.section)) return null;
  return (
    // The fold is the block in the row's column of title lines; the chip
    // sits inline in it at its own width.
    <Collapse isOpen={needsConsentNudge(item)}>
      <Badge tone="amber">
        <FiAlertCircle size={12} aria-hidden />
        {t("subprofiles:tattooItem.nudge.confirmConsent")}{" "}
        <span className="visuallyHidden">
          {t("subprofiles:tattooItem.nudge.confirmConsentHint")}
        </span>
      </Badge>
    </Collapse>
  );
}
