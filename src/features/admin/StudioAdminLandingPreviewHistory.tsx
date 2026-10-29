import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStudioLandingPreviewDTO } from "./api/studioLandingAdmin.api";
import { StudioAdminLandingPreviewRow } from "./StudioAdminLandingPreviewRow";
import css from "./StudioAdminLanding.module.css";

/** The declined and withdrawn requests behind a "Show answered requests"
 *  toggle. Approved rows stay in the open list. */
export function StudioAdminLandingPreviewHistory({
  previews,
  isBusy,
  onRemove,
}: {
  previews: AdminStudioLandingPreviewDTO[];
  isBusy: boolean;
  onRemove: (preview: AdminStudioLandingPreviewDTO) => void;
}) {
  const { t } = useTranslation();
  const historyId = useId();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Collapse isOpen={previews.length > 0}>
        <Button
          className={css.historyToggle}
          variant="ghost"
          size="sm"
          aria-expanded={isOpen}
          aria-controls={historyId}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          {t(
            isOpen
              ? "admin:studioAdmin.landing.previews.hideHistory"
              : "admin:studioAdmin.landing.previews.showHistory",
          )}
        </Button>
      </Collapse>
      <div id={historyId}>
        <Collapse isOpen={isOpen && previews.length > 0}>
          <ul className={css.list}>
            <AnimatePresence initial={false}>
              {previews.map((preview) => (
                <StudioAdminLandingPreviewRow
                  key={preview.id}
                  preview={preview}
                  reorder={null}
                  isBusy={isBusy}
                  onRemove={() => onRemove(preview)}
                />
              ))}
            </AnimatePresence>
          </ul>
        </Collapse>
      </div>
    </>
  );
}
