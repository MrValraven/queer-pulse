import { useMemo, useState } from "react";
import { FiCheck, FiMapPin, FiStar } from "react-icons/fi";
import { EmptyState, FilterChips } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CLINICS,
  CLINIC_FILTERS,
  TYPE_CLASS,
  type Clinic,
  type ClinicType,
} from "./sexualHealth.data";
import { TestingNominate } from "./SexualHealthTestingNominate";
import styles from "./SexualHealthPage.module.css";

/** One clinic row in the demo-mode directory, with its collapsible details. */
export function TestingClinicCard({
  clinic,
  isOpen,
  onToggle,
}: {
  clinic: Clinic;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.clinicCard}>
      <div>
        <div className={`${styles.ccType} ${styles[TYPE_CLASS[clinic.type]]}`}>
          {clinic.typeLabel}
        </div>
        <div className={styles.ccName}>{clinic.name}</div>
        <div className={styles.ccDesc}>{clinic.description}</div>
        <div className={styles.ccMeta}>
          {clinic.meta.map((meta) => (
            <span key={meta.text}>
              <meta.icon /> {meta.text}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.ccRight}>
        {clinic.verified && (
          <div className={styles.ccBadge}>
            {t("resources:sexualHealth.testing.clinicCard.verifiedBadge")}{" "}
            <FiCheck />
          </div>
        )}
        <button
          type="button"
          className={[styles.ccBtn, isOpen && styles.ccBtnOpen]
            .filter(Boolean)
            .join(" ")}
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          {isOpen
            ? t("resources:sexualHealth.testing.clinicCard.hideDetailsCta")
            : t("resources:sexualHealth.testing.clinicCard.viewDetailsCta")}
        </button>
        {clinic.review && (
          <div className={styles.ccReview}>
            <FiStar /> {clinic.review}
          </div>
        )}
      </div>
      {isOpen && (
        <div className={styles.ccDetails}>
          <div className={styles.ccDetailRow}>
            <div className={styles.ccDetailLabel}>
              {t("resources:sexualHealth.testing.clinicCard.testsLabel")}
            </div>
            <div className={styles.ccDetailVal}>{clinic.details.tests}</div>
          </div>
          <div className={styles.ccDetailRow}>
            <div className={styles.ccDetailLabel}>
              {t("resources:sexualHealth.testing.clinicCard.bringLabel")}
            </div>
            <div className={styles.ccDetailVal}>{clinic.details.bring}</div>
          </div>
          <div className={styles.ccDetailRow}>
            <div className={styles.ccDetailLabel}>
              {t("resources:sexualHealth.testing.clinicCard.accessLabel")}
            </div>
            <div className={styles.ccDetailVal}>{clinic.details.access}</div>
          </div>
          <div className={styles.ccDetailRow}>
            <div className={styles.ccDetailLabel}>
              {t("resources:sexualHealth.testing.clinicCard.noteLabel")}
            </div>
            <div className={styles.ccDetailVal}>{clinic.details.note}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Demo-mode body of the sexual-health testing tab: the mock clinic directory
 * with its type filter chips and the nominate-a-clinic box. Live mode renders
 * `TestingListings` instead.
 */
export function TestingClinics() {
  const { t } = useTranslation();
  const [clinicFilter, setClinicFilter] = useState<ClinicType | "all">("all");
  const [openClinic, setOpenClinic] = useState<string | null>(null);
  const clinics = CLINICS.filter(
    (clinic) => clinicFilter === "all" || clinic.type === clinicFilter,
  );
  const clinicFilterOptions = useMemo(
    () =>
      CLINIC_FILTERS.map((filter) => ({
        value: filter.id,
        label: t(filter.labelKey),
      })),
    [t],
  );

  return (
    <>
      <FilterChips
        className={styles.clinicFilters}
        label={t("resources:sexualHealth.testing.filterAria")}
        options={clinicFilterOptions}
        value={clinicFilter}
        onChange={(value) => setClinicFilter(value as ClinicType | "all")}
      />

      <div className={styles.clinicList}>
        {clinics.length === 0 && (
          <EmptyState
            compact
            icon={<FiMapPin />}
            title={t("resources:sexualHealth.testing.empty.title")}
            description={t("resources:sexualHealth.testing.empty.description")}
            action={{
              label: t("resources:sexualHealth.testing.empty.clearCta"),
              onClick: () => setClinicFilter("all"),
            }}
          />
        )}
        {clinics.map((clinic) => (
          <TestingClinicCard
            key={clinic.name}
            clinic={clinic}
            isOpen={openClinic === clinic.name}
            onToggle={() =>
              setOpenClinic(openClinic === clinic.name ? null : clinic.name)
            }
          />
        ))}
      </div>

      <TestingNominate />
    </>
  );
}
