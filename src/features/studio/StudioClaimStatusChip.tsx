import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioClaimStatus } from "./api/studioSafety.types";
import {
  claimStatusChipFor,
  type StudioClaimViewpoint,
} from "./studioClaimStatus.data";
import css from "./StudioSafety.module.css";

/** A claim's status, worded for whoever reads it (the claimant by default). */
export function StudioClaimStatusChip({
  status,
  viewpoint = "claimant",
}: {
  status: StudioClaimStatus;
  viewpoint?: StudioClaimViewpoint;
}) {
  const { t } = useTranslation();
  const chip = claimStatusChipFor(status, viewpoint);
  const Icon = chip.icon;
  return (
    <span
      className={[
        css.statusChip,
        chip.isOpen ? css.statusOpen : css.statusClosed,
      ].join(" ")}
    >
      <Icon aria-hidden />
      {t(chip.labelKey)}
    </span>
  );
}
