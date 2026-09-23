import { useState, type FormEvent } from "react";
import { Button, FormField, SkeletonLine } from "../../../shared/components/ui";
import { AdminChip } from "../ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import styles from "./stickerBuilder.module.css";

const STATUS_TONE: Record<
  AdminStickerPackResponse["status"],
  "plum" | "jade" | "ghost"
> = {
  draft: "plum",
  published: "jade",
  archived: "ghost",
};

/**
 * The list of every sticker pack regardless of status, plus the form that
 * starts a new draft. Selecting a row does not navigate anywhere, so its
 * control is a plain `<button>` rather than the shared `<Button>`, the same
 * pattern `AdminMediaCard` uses for its card-open action.
 */
export function StickerPackRail({
  packs,
  isLoading,
  isError,
  isForbidden,
  isDemo,
  selectedPackId,
  onSelectPack,
  onCreatePack,
  isCreatingPack,
}: {
  packs: AdminStickerPackResponse[];
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  isDemo: boolean;
  selectedPackId: string | null;
  onSelectPack: (packId: string) => void;
  onCreatePack: (body: { slug: string; name: string }) => void;
  isCreatingPack: boolean;
}) {
  const { t } = useTranslation();
  const [newPackSlug, setNewPackSlug] = useState("");
  const [newPackName, setNewPackName] = useState("");

  function submitCreatePack(event: FormEvent) {
    event.preventDefault();
    if (!newPackSlug.trim() || !newPackName.trim()) return;
    onCreatePack({ slug: newPackSlug.trim(), name: newPackName.trim() });
    setNewPackSlug("");
    setNewPackName("");
  }

  return (
    <div className={styles.rail}>
      <h2 className={styles.railHeading}>
        {t("admin:stickerPacks.rail.heading")}
      </h2>

      {isDemo ? (
        <p className={styles.railNotice}>
          {t("admin:stickerPacks.rail.demoOnly")}
        </p>
      ) : isLoading ? (
        <div className={styles.railList}>
          {[0, 1, 2].map((skeletonIndex) => (
            <SkeletonLine key={skeletonIndex} height={56} />
          ))}
        </div>
      ) : isError ? (
        <p className={styles.railNotice}>
          {isForbidden
            ? t("admin:common.panelForbidden")
            : t("admin:stickerPacks.rail.loadError")}
        </p>
      ) : packs.length === 0 ? (
        <p className={styles.railNotice}>
          {t("admin:stickerPacks.rail.empty")}
        </p>
      ) : (
        <ul className={styles.railList}>
          {packs.map((pack) => (
            <li key={pack.id}>
              <button
                type="button"
                className={[
                  styles.railRow,
                  pack.id === selectedPackId && styles.railRowSelected,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={pack.id === selectedPackId}
                onClick={() => onSelectPack(pack.id)}
              >
                <span className={styles.railRowName}>{pack.name}</span>
                <AdminChip tone={STATUS_TONE[pack.status]}>
                  {t(`admin:stickerPacks.status.${pack.status}`)}
                </AdminChip>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.createForm} onSubmit={submitCreatePack}>
        <FormField label={t("admin:stickerPacks.rail.newSlug")}>
          <input
            type="text"
            value={newPackSlug}
            onChange={(event) => setNewPackSlug(event.target.value)}
            disabled={isDemo}
          />
        </FormField>
        <FormField label={t("admin:stickerPacks.rail.newName")}>
          <input
            type="text"
            value={newPackName}
            onChange={(event) => setNewPackName(event.target.value)}
            disabled={isDemo}
          />
        </FormField>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isDemo || isCreatingPack}
        >
          {t("admin:stickerPacks.rail.newCta")}
        </Button>
      </form>
    </div>
  );
}
