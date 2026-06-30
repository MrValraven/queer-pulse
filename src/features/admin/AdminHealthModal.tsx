import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { AdminModal } from "./ui";
import {
  BREAKDOWN_META,
  breakdownColor,
  breakdownNarrative,
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
  const { showToast } = useToast();

  const footer = (
    <>
      <Button
        variant="ghost"
        size="md"
        onClick={() =>
          showToast(
            "Health is a weighted blend of four signals, recalculated nightly",
            "info",
          )
        }
      >
        How it's calculated
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
          Offer support →
        </Button>
      ) : (
        <Button variant="primary" size="md" onClick={onClose}>
          Close
        </Button>
      )}
    </>
  );

  return (
    <AdminModal
      title={
        <>
          Why <em>{community.health}</em>?
        </>
      }
      onClose={onClose}
      footer={footer}
    >
      <p className={styles.modalIntro}>
        Health is a blend of four signals, weighted by community size. It's a
        thermometer, not a grade — {breakdownNarrative(community.health)}
      </p>
      <div className={styles.bdList}>
        {BREAKDOWN_META.map((meta, i) => {
          const value = community.bd[i]!;
          return (
            <div key={meta.name} className={styles.bdRow}>
              <HealthRing value={value} />
              <div className={styles.bdText}>
                <div className={styles.bdName}>{meta.name}</div>
                <div className={styles.bdDesc}>{meta.desc}</div>
              </div>
              <div
                className={styles.bdScore}
                style={{ color: breakdownColor(value) }}
              >
                {value}
              </div>
            </div>
          );
        })}
      </div>
    </AdminModal>
  );
}
