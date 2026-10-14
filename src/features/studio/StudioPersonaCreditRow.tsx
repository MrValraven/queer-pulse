import { AnimatePresence, m } from "motion/react";
import { FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Avatar, Button, CollapseListItem } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { keepOnFrameLoop } from "../gatherings/checkin/checkinMotion";
import type { StudioPersonaCreditOwnerRowView } from "./api/studioDiscovery.adapters";
import css from "./StudioCreditEditor.module.css";

/** One persona credit in the editor: who, which role, its status chip
 *  (Pending, Accepted, Declined; never who acted) and Remove credit, the
 *  only action a row offers whatever its status. The chip sits under the
 *  role at every width. The row folds in and out through `CollapseListItem`,
 *  and a status change crossfades the chip. */
export function StudioPersonaCreditRow({
  row,
  onRemove,
  isBusy,
}: {
  row: StudioPersonaCreditOwnerRowView;
  onRemove: () => void;
  isBusy: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const duration = reducedMotion ? 0 : 0.2;
  const roleLabel = t(row.roleLabelKey);
  return (
    <CollapseListItem>
      <div className={css.row}>
        <Avatar
          initials={row.persona.initials}
          src={row.persona.avatarUrl ?? undefined}
          size={32}
          alt=""
        />
        <div className={css.rowText}>
          <span className={css.rowName}>{row.persona.name}</span>
          <span className={css.rowRole}>{roleLabel}</span>
          {!row.isPersonaPublic && (
            <span className={css.rowNote}>
              {t("studio:credits.editor.notPublic")}
            </span>
          )}
          <AnimatePresence mode="popLayout" initial={false}>
            <m.span
              key={row.status}
              className={css.statusChip}
              data-status={row.status}
              onUpdate={keepOnFrameLoop}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration }}
            >
              {t(row.statusLabelKey)}
            </m.span>
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("studio:credits.editor.removeAria", {
            name: row.persona.name,
            role: roleLabel,
          })}
          aria-disabled={isBusy || undefined}
          onClick={onRemove}
        >
          <FiX aria-hidden /> {t("studio:credits.removeCta")}
        </Button>
      </div>
    </CollapseListItem>
  );
}
