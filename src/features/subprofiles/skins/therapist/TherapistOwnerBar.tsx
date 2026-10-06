import { useId, useState } from "react";
import { FiEye } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../../../app/routeMap";
import { useOwnerSkinPatch } from "../../api/useOwnerSkinPatch";
import { estimateDraftReadiness } from "../../subprofileDraftReadiness";
import type {
  SkinData,
  TherapistFacts,
  TherapistStatus,
} from "../../api/subprofiles.api";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { PersonaAction } from "../../personaSkinRender";
import type { TherapistView } from "./therapistView";
import { renderEmphasis } from "./renderEmphasis";
import { CAPACITY_OPTIONS, EMPTY_THERAPIST_FACTS } from "./therapistHero.data";
import { TherapistOwnerCompleteness } from "./TherapistOwnerCompleteness";
import { TherapistOwnerStatusFreshness } from "./TherapistOwnerStatusFreshness";
import styles from "./TherapistOwnerBar.module.css";

/** Starting facts for a persona that has no `therapist` block yet. An older
 *  persona keeps its languages and session mode in `practical`, which the
 *  page reads as a fallback; once a `therapist` block exists the page reads
 *  that instead, so carry those values over or they would go blank. */
function seedFacts(skinData: SkinData): TherapistFacts {
  const practical = skinData.practical;
  if (!practical) return EMPTY_THERAPIST_FACTS;
  const mode = practical.mode?.trim() ?? "";
  return {
    ...EMPTY_THERAPIST_FACTS,
    languages: practical.languages?.trim() ?? "",
    where: mode,
    online: /online/i.test(mode) ? "yes" : "",
  };
}

/** The whole stored `skinData` with only `therapist.status` replaced. The
 *  PATCH replaces the column, so every other key must ride along. */
function withStatus(
  skinData: SkinData | null,
  status: TherapistStatus,
): SkinData {
  const current = skinData ?? {};
  // Seed from the older practical block only when the facts were never
  // written; a null block means the owner cleared it (as in therapistView).
  const facts =
    current.therapist === undefined
      ? seedFacts(current)
      : { ...EMPTY_THERAPIST_FACTS, ...current.therapist };
  return { ...current, therapist: { ...facts, status } };
}

/** Stands in for the visitor card while the page is a draft: the draft
 *  state, how close it is to publishable, and the way to publish. Publish
 *  routes to the editor, whose publish panel runs the checklist. */
function TherapistDraftCard({ data }: { data: PublicSubprofileView }) {
  const { t } = useTranslation();
  const { readyCount, totalCount } = estimateDraftReadiness(data);
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>
        <span className={styles.draftDot} aria-hidden />
        {t("subprofiles:therapist.owner.draftLabel")}
      </span>
      <span className={styles.meta}>
        {t("subprofiles:therapist.owner.draftBody")}{" "}
        {t("subprofiles:draftBanner.readiness", {
          ready: readyCount,
          total: totalCount,
        })}
      </span>
      <Button
        className={styles.cardAction}
        variant="primary"
        size="sm"
        to={subprofileEditPath(data.id)}
      >
        {t("subprofiles:draftBanner.publish")}
      </Button>
    </div>
  );
}

interface TherapistOwnerBarProps {
  data: PublicSubprofileView;
  view: TherapistView;
  onAction: (action: PersonaAction) => void;
  /** A capacity save succeeded; the page shows it straight away. */
  onCapacitySaved: (status: TherapistStatus) => void;
}

/**
 * The owner's plum panel above the hero: capacity switch with how long ago
 * the status was confirmed (and a way to confirm it unchanged), profile
 * completeness with a way into the editor, and "View as visitor". Owner
 * mode only. No views or demand numbers: the product does not track them.
 */
export function TherapistOwnerBar({
  data,
  view,
  onAction,
  onCapacitySaved,
}: TherapistOwnerBarProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { patchSkin, isSaving } = useOwnerSkinPatch(data.id);
  const headingId = useId();
  const name = view.firstName || data.displayName;
  // Set by this page's own saves, so the line updates before any refetch.
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const updatedAt = savedAt ?? data.availabilityUpdatedAt ?? null;

  // The status lands on the persona's freshly read `skinData`, so a block a
  // co-owner saved after this page loaded rides along. The persona-wide
  // availability says the same thing, and the directory's "similar
  // therapists" reads it. `confirmAvailability` stamps the status as
  // confirmed even when it is unchanged (PRD-435).
  const saveStatus = (option: (typeof CAPACITY_OPTIONS)[number]) =>
    patchSkin((freshSkinData) => withStatus(freshSkinData, option.status), {
      availability: option.availability,
      confirmAvailability: true,
    }).then(() => setSavedAt(new Date().toISOString()));

  const showSaveError = () =>
    showToast(t("subprofiles:therapist.owner.capacityError"), "error");

  const saveCapacity = (option: (typeof CAPACITY_OPTIONS)[number]) => {
    if (option.status === view.status || isSaving) return;
    saveStatus(option).then(() => {
      onCapacitySaved(option.status);
      showToast(t(option.savedKey), "success");
    }, showSaveError);
  };

  const confirmStatus = () => {
    const current = CAPACITY_OPTIONS.find(
      (option) => option.status === view.status,
    );
    if (!current || isSaving) return;
    saveStatus(current).then(undefined, showSaveError);
  };

  return (
    <section className={styles.bar} aria-labelledby={headingId}>
      <div className={styles.head}>
        <div>
          <p className={styles.label}>
            {t("subprofiles:therapist.owner.label", { name })}
          </p>
          {/* Not a heading element: this panel sits above the page's h1. */}
          <p id={headingId} className={styles.heading}>
            {renderEmphasis(t("subprofiles:therapist.owner.heading"))}
          </p>
        </div>
        <div className={styles.capacityColumn}>
          <div
            className={styles.capacity}
            role="group"
            aria-label={t("subprofiles:therapist.owner.capacityLabel")}
            aria-busy={isSaving || undefined}
          >
            {CAPACITY_OPTIONS.map((option) => (
              <button
                key={option.status}
                type="button"
                className={styles.capacityButton}
                aria-pressed={view.status === option.status}
                // aria-disabled, so a keyboard user keeps focus on the button
                // while it saves; `saveCapacity` ignores clicks meanwhile.
                aria-disabled={isSaving || undefined}
                onClick={() => saveCapacity(option)}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
          <TherapistOwnerStatusFreshness
            updatedAt={updatedAt}
            isSaving={isSaving}
            onConfirm={confirmStatus}
          />
        </div>
      </div>

      <div className={styles.grid}>
        <TherapistOwnerCompleteness
          subprofileId={data.id}
          view={view}
          onAction={onAction}
        />

        {/* Only a published page has a visitor to be viewed as; a draft
            answers 404 to everyone but its owners, so it shows how to
            publish instead. */}
        {data.status === "draft" && <TherapistDraftCard data={data} />}
        {data.status === "published" && (
          <div className={styles.card}>
            <span className={styles.cardLabel}>
              {t("subprofiles:therapist.owner.visitorLabel")}
            </span>
            <span className={styles.meta}>
              {t("subprofiles:therapist.owner.visitorBody")}
            </span>
            <Button
              className={styles.cardAction}
              type="button"
              variant="ghost-dark"
              size="sm"
              onClick={() => onAction("preview:enter")}
            >
              <FiEye aria-hidden /> {t("subprofiles:hero.viewAsVisitor")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
