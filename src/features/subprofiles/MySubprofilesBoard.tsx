import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useReorderSubprofiles } from "./api/useReorderSubprofiles";
import { splitByProfileVisibility } from "./mySubprofiles.data";
import { NotShownPersonas } from "./NotShownPersonas";
import type { PersonaShareTarget } from "./OwnerSideCard";
import { ReorderableSideCard } from "./ReorderableSideCard";
import { usePersonaProfileOrder } from "./usePersonaProfileOrder";
import styles from "./MySubprofilesOrder.module.css";

interface MySubprofilesBoardProps {
  /** Every persona this member runs, in their saved order. */
  subprofiles: SubprofileView[];
  /** False once the member is at the persona cap — the new-persona tile goes. */
  canCreate: boolean;
  onNew: () => void;
  onShare: (target: PersonaShareTarget) => void;
  onDelete: (subprofile: SubprofileView) => void;
}

/**
 * The dashboard's card body, in two groups.
 *
 * The top group is what a visitor sees on the member's profile, and it is
 * drag-reorderable: the order here is the order there. The bottom group is
 * every persona the profile does not list, read-only, with the reason and the
 * link that changes it (`NotShownPersonas`).
 *
 * Two details are load-bearing.
 *
 * The drag container wraps ONLY the reorderable cards. The trailing
 * "new persona" tile sits in its own grid below, because the drag hook reads
 * `container.children` positionally and a tile inside the same element would
 * count as a card, shifting every index by one.
 *
 * And the reorder endpoint takes the member's COMPLETE persona id list, so
 * `commitOrder` appends the not-shown personas, untouched and in their
 * existing relative order, behind the group that actually moved. Sending the
 * on-profile group alone is a 400.
 */
export function MySubprofilesBoard({
  subprofiles,
  canCreate,
  onNew,
  onShare,
  onDelete,
}: MySubprofilesBoardProps) {
  const { t } = useTranslation();
  const { shownOnProfile, notShownOnProfile } =
    splitByProfileVisibility(subprofiles);
  const reorderSubprofiles = useReorderSubprofiles();

  const commitOrder = (personaIds: string[]) => {
    reorderSubprofiles.mutate({
      orderedIds: [
        ...personaIds,
        ...notShownOnProfile.map((persona) => persona.id),
      ],
    });
  };

  const { orderedPersonas, containerRef, draggingIndex, gripHandlers, moveBy } =
    usePersonaProfileOrder(shownOnProfile, commitOrder);

  const shownCount = orderedPersonas.length;

  return (
    <>
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>
            {t("subprofiles:mine.order.groupTitle")}
          </h2>
          {shownCount > 1 && (
            <p className={styles.groupHint}>
              {t("subprofiles:mine.order.groupHint")}
            </p>
          )}
        </div>

        {shownCount === 0 ? (
          <p className={styles.emptyGroup}>
            {t("subprofiles:mine.order.emptyGroup")}
          </p>
        ) : (
          <div className="sides" ref={containerRef}>
            {orderedPersonas.map((persona, index) => (
              <ReorderableSideCard
                key={persona.id}
                view={persona}
                position={index + 1}
                total={shownCount}
                gripHandlers={gripHandlers(index)}
                isDragging={draggingIndex === index}
                onMoveEarlier={() => moveBy(index, -1)}
                onMoveLater={() => moveBy(index, 1)}
                onShare={onShare}
                onDelete={() => onDelete(persona)}
              />
            ))}
          </div>
        )}

        {canCreate && (
          <div className={`sides ${styles.newTileRow}`}>
            <button type="button" className="new-side" onClick={onNew}>
              <FiPlus size={22} aria-hidden />
              <b>{t("subprofiles:mine.newSideTile")}</b>
            </button>
          </div>
        )}
      </section>

      <NotShownPersonas personas={notShownOnProfile} />
    </>
  );
}
