import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminModal } from "./ui";
import {
  BREAKDOWN_META,
  breakdownColor,
  breakdownNarrativeKey,
  type Community,
} from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

const R = 16;
const CIRC = 2 * Math.PI * R;

function HealthRing({ value }: { value: number }) {
  const color = breakdownColor(value);
  const dash = (Math.min(value, 100) / 100) * CIRC;
  return (
    <svg
      className={styles.ring}
      width={40}
      height={40}
      viewBox="0 0 40 40"
      aria-hidden
    >
      <circle
        cx={20}
        cy={20}
        r={R}
        fill="none"
        stroke="rgba(var(--plum-rgb), .1)"
        strokeWidth={4}
      />
      <circle
        className={styles.ringArc}
        cx={20}
        cy={20}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${CIRC}`}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

export function AdminHealthModal({
  community,
  onClose,
  onOfferSupport,
}: {
  community: Community;
  onClose: () => void;
  onOfferSupport: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const footer = (
    <>
      <Button
        variant="ghost"
        size="md"
        onClick={() =>
          showToast(t("admin:communities.health.howCalculatedToast"), "info")
        }
      >
        {t("admin:communities.health.howCalculatedCta")}
      </Button>
      {community.support ? (
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            onClose();
            onOfferSupport();
          }}
        >
          {t("admin:communities.health.offerSupportCta")} →
        </Button>
      ) : (
        <Button variant="primary" size="md" onClick={onClose}>
          {t("admin:communities.health.closeCta")}
        </Button>
      )}
    </>
  );

  return (
    <AdminModal
      title={
        <Translation
          i18nKey="admin:communities.health.modalTitle"
          values={{ score: community.health }}
          components={{ em: <em /> }}
        />
      }
      onClose={onClose}
      footer={footer}
    >
      <p className={styles.modalIntro}>
        {t("admin:communities.health.intro")}{" "}
        {t(`admin:${breakdownNarrativeKey(community.health)}`)}
      </p>
      <div className={styles.bdList}>
        {BREAKDOWN_META.map((signalMeta, signalIndex) => {
          const value = community.breakdown[signalIndex]!;
          const isMeasured = value !== null;
          return (
            <div key={signalMeta.id} className={styles.bdRow}>
              {isMeasured ? (
                <HealthRing value={value} />
              ) : (
                <span className={styles.ringUnmeasured} aria-hidden />
              )}
              <div className={styles.bdText}>
                <div className={styles.bdName}>
                  {t(`admin:${signalMeta.nameKey}`)}
                </div>
                <div className={styles.bdDesc}>
                  {t(`admin:${signalMeta.descriptionKey}`)}
                </div>
              </div>
              {isMeasured ? (
                <div
                  className={styles.bdScore}
                  style={{ color: breakdownColor(value) }}
                >
                  {value}
                </div>
              ) : (
                <div className={styles.bdUnmeasured}>
                  {t("admin:communities.health.notMeasured")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminModal>
  );
}
