import { useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Collapse,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminDirectoryPartnerDTO } from "../marketing/api/directoryPartners.api";
import { useAdminDirectoryPartners } from "./api/useAdminDirectoryPartners";
import {
  DIRECTORY_PARTNER_ERROR_VALUES,
  directoryPartnerErrorKeyOf,
} from "./adminDirectoryPartners.model";
import { PARTNER_SKELETON_ROW_KEYS } from "./AdminDirectoryPartners.data";
import { AdminDirectoryPartnerAddDialog } from "./AdminDirectoryPartnerAddDialog";
import { AdminDirectoryPartnerNoteDialog } from "./AdminDirectoryPartnerNoteDialog";
import { AdminDirectoryPartnerRow } from "./AdminDirectoryPartnerRow";
import { AdminDirectoryPartnersHead } from "./AdminDirectoryPartnersHead";
import { useAdminDirectoryPartnersActions } from "./useAdminDirectoryPartnersActions";
import { focusNeighbourControl } from "./useStudioAdminReorderRow";
import css from "./AdminDirectoryPartners.module.css";

const SKELETON_THUMB_STYLE = { flex: "none", borderRadius: "var(--radius-12)" };

/**
 * The Partners tab of the directory admin page (Admin only): the businesses
 * shown in the "Businesses we partner with" row at the top of the public
 * directory, in order. A list that is already on screen stays there when a
 * background read fails.
 */
export function AdminDirectoryPartnersSection() {
  const { t } = useTranslation();
  const { data: partners, error, refetch } = useAdminDirectoryPartners();
  let body: ReactNode;
  if (partners) body = <PartnersBody partners={partners} />;
  else if (error)
    body = (
      <EmptyState
        icon={<FiAlertTriangle />}
        title={t("admin:directoryPartners.loadError.title")}
        description={t(
          directoryPartnerErrorKeyOf(error),
          DIRECTORY_PARTNER_ERROR_VALUES,
        )}
        action={{
          label: t("admin:directoryPartners.loadError.retryCta"),
          onClick: () => void refetch(),
        }}
      />
    );
  else body = <PartnerRowsSkeleton />;
  return <FadeIn delay={80}>{body}</FadeIn>;
}

/** The head, the empty line, the ordered rows and the two dialogs. */
function PartnersBody({ partners }: { partners: AdminDirectoryPartnerDTO[] }) {
  const { t } = useTranslation();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const {
    isBusy,
    statusMessage,
    move,
    remove,
    noteTarget,
    openNote,
    closeNote,
    addPartner,
    updateNote,
  } = useAdminDirectoryPartnersActions(partners);

  function removeAt(partner: AdminDirectoryPartnerDTO, index: number) {
    remove(partner, () =>
      focusNeighbourControl({
        list: listRef.current,
        index,
        findControl: (row) =>
          row.querySelector<HTMLElement>("[data-partner-remove]"),
        fallback: headingRef.current,
      }),
    );
  }

  return (
    <section className={css.section} aria-labelledby={headingId}>
      <AdminDirectoryPartnersHead
        headingId={headingId}
        headingRef={headingRef}
        count={partners.length}
        isBusy={isBusy}
        onAdd={() => setIsAdding(true)}
      />
      <Collapse isOpen={partners.length === 0}>
        <p className={css.empty}>
          <span className={css.emptyLead}>
            {t("admin:directoryPartners.empty.title")}
          </span>
          <span>{t("admin:directoryPartners.empty.body")}</span>
        </p>
      </Collapse>
      <ol
        ref={listRef}
        className={css.list}
        aria-labelledby={headingId}
        aria-hidden={partners.length === 0 || undefined}
      >
        <AnimatePresence initial={false}>
          {partners.map((partner, index) => (
            <AdminDirectoryPartnerRow
              key={partner.id}
              partner={partner}
              index={index}
              count={partners.length}
              isBusy={isBusy}
              onMove={(targetIndex) => move(partner, targetIndex)}
              onDropAt={(draggedId) => {
                const dragged = partners.find(
                  (candidate) => candidate.id === draggedId,
                );
                if (dragged) move(dragged, index);
              }}
              onEditNote={() => openNote(partner)}
              onRemove={() => removeAt(partner, index)}
            />
          ))}
        </AnimatePresence>
      </ol>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
      <AnimatePresence>
        {isAdding && (
          <AdminDirectoryPartnerAddDialog
            addPartner={addPartner}
            isBusy={isBusy}
            onClose={() => setIsAdding(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {noteTarget && (
          <AdminDirectoryPartnerNoteDialog
            partner={noteTarget}
            updateNote={updateNote}
            isBusy={isBusy}
            onClose={closeNote}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/** Three placeholder rows while the list loads. */
function PartnerRowsSkeleton() {
  return (
    <div className={css.skeleton} aria-hidden>
      {PARTNER_SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className={css.skeletonRow}>
          <SkeletonLine width={48} height={48} style={SKELETON_THUMB_STYLE} />
          <div className={css.skeletonText}>
            <SkeletonLine width="40%" height={14} />
            <SkeletonLine width="25%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
