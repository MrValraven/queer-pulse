import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useReorderSubprofiles } from "./api/useReorderSubprofiles";
import { splitByProfileVisibility } from "./mySubprofiles.data";
import { NotShownPersonas } from "./NotShownPersonas";
import type { PersonaShareTarget } from "./OwnerSideCard";
import { PersonaViewToggle } from "./PersonaViewToggle";
import { ReorderableSideCard } from "./ReorderableSideCard";
import { usePersonaDashboardView } from "./usePersonaDashboardView";
import { usePersonaProfileOrder } from "./usePersonaProfileOrder";
import styles from "./MySubprofilesOrder.module.css";

interface MySubprofilesBoardProps {
  /** Every persona this member runs, in their saved order. */
  subprofiles: SubprofileView[];
  /** False once the member is at the persona cap, which removes the new-persona tile. */
  canCreate: boolean;
  onNew: () => void;
  onShare: (target: PersonaShareTarget) => void;
  onDelete: (subprofile: SubprofileView) => void;
}

/**
 * The dashboard's persona body, in two groups and two layouts.
 *
 * The top group is what a visitor sees on the member's profile, and it is
 * drag-reorderable: the order here is the order there. The bottom group is
 * every persona the profile does not list, read-only, with the reason and the
 * link that changes it (`NotShownPersonas`).
 *
 * Both groups render as the `.sides` card grid (Cards, the default) or as one
 * row per persona (List), picked by the switch in the top group's head and
 * remembered on the device (`usePersonaDashboardView`). Reordering works the
 * same in both: the drag hook's nearest-centre test also answers in a single
 * column of rows.
 *
 * Two details are load-bearing.
 *
 * The drag container wraps ONLY the reorderable personas, in either layout.
 * The trailing "new persona" tile (or dashed row, in List) sits outside it,
 * because the drag hook reads `container.children` positionally and a tile
 * inside the same element would count as a persona, shifting every index by
 * one.
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
  const [view, setView] = usePersonaDashboardView();
  const isList = view === "list";

  return (
    <>
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <div className={styles.groupTitleRow}>
            <h2 className={styles.groupTitle}>
              {t("subprofiles:mine.order.groupTitle")}
            </h2>
            <PersonaViewToggle view={view} onChange={setView} />
          </div>
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
          <div className={isList ? styles.rows : "sides"} ref={containerRef}>
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
                layout={view}
              />
            ))}
          </div>
        )}

        {canCreate &&
          (isList ? (
            <button type="button" className={styles.newRow} onClick={onNew}>
              <FiPlus size={18} aria-hidden />
              <b>{t("subprofiles:mine.newSideTile")}</b>
            </button>
          ) : (
            <div className={`sides ${styles.newTileRow}`}>
              <button type="button" className="new-side" onClick={onNew}>
                <FiPlus size={22} aria-hidden />
                <b>{t("subprofiles:mine.newSideTile")}</b>
              </button>
            </div>
          ))}
      </section>

      <NotShownPersonas personas={notShownOnProfile} layout={view} />
    </>
  );
}
