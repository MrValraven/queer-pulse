import { FiX } from "react-icons/fi";
import { Select } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AdminRoadmapItemDTO } from "../../api/roadmapAdmin.types";
import styles from "./ItemDrawer.module.css";

/**
 * Outgoing "depends on" edges, resolved to names via the current item list
 * (edit mode only — an item needs to exist server-side before it can carry
 * a dependency edge, so this section isn't shown while creating one).
 */
export function DepsSection({
  deps,
  allItems,
  currentItemId,
  onAdd,
  onRemove,
}: {
  deps: string[];
  allItems: AdminRoadmapItemDTO[];
  currentItemId: string;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation();
  const depItems = deps
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is AdminRoadmapItemDTO => Boolean(item));
  const candidates = allItems.filter(
    (item) => item.id !== currentItemId && !deps.includes(item.id),
  );

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("admin:roadmap.drawer.deps.title")}
      </h3>

      {depItems.length === 0 ? (
        <p className={styles.emptyNote}>{t("admin:roadmap.drawer.deps.none")}</p>
      ) : (
        <>
          <p className={styles.cannotShip}>
            {t("admin:roadmap.drawer.deps.cannotShip", {
              items: depItems.map((item) => item.name).join(", "),
            })}
          </p>
          <div className={styles.chipRow}>
            {depItems.map((item) => (
              <span key={item.id} className={styles.depChip}>
                {item.name}
                <button
                  type="button"
                  className={styles.depRemove}
                  onClick={() => onRemove(item.id)}
                  aria-label={`${t("admin:common.delete")}: ${item.name}`}
                >
                  <FiX size={13} aria-hidden />
                </button>
              </span>
            ))}
          </div>
        </>
      )}

      {candidates.length > 0 && (
        <Select
          value={null}
          label={t("admin:roadmap.drawer.deps.addPlaceholder")}
          placeholder={t("admin:roadmap.drawer.deps.addPlaceholder")}
          options={candidates.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          onChange={(value) => {
            if (value) onAdd(value);
          }}
        />
      )}
    </div>
  );
}
