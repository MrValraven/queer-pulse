import { useState } from "react";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  communityBanRatificationRefusalFor,
  type CommunityBanRatificationDTO,
} from "./api/communityBanRatifications.api";
import {
  useCommunityBanRatifications,
  useDecideCommunityBanRatification,
} from "./api/useCommunityBanRatifications";
import {
  ModToolsBanRatificationRow,
  type CommunityBanRatifyDecision,
} from "./ModToolsBanRatificationRow";
import { ModToolsBanRatificationDialog } from "./ModToolsBanRatificationDialog";
import detail from "./CommunityDetailPage.module.css";
import panels from "./ModToolsPanels.module.css";
import styles from "./ModToolsBanRatifications.module.css";

/** What is open in the confirm dialog, or null when nothing is. */
interface DecidingTarget {
  hold: CommunityBanRatificationDTO;
  decision: CommunityBanRatifyDecision;
}

/**
 * Permanent bars this community's staff have asked for, and the second
 * signature each one needs (PRD-25).
 *
 * A community permanent bar used to be one person's decision, while the
 * platform equivalent had required a second moderator since TS-12. It now
 * takes two people here as well. The member is removed and barred for the
 * fallback term the moment the first moderator acts, so nothing about their
 * standing is left undecided while this queue runs. Only the permanence waits.
 *
 * Loading, failure and a genuinely empty queue are three separate renders, and
 * that is the point rather than a nicety. "Nothing waiting" printed because a
 * request failed would let a permanent bar lapse with nobody having read it,
 * on a surface whose whole job is to make sure somebody does.
 */
export function ModToolsBanRatifications({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isPending, isError, refetch } =
    useCommunityBanRatifications(slug);
  const decide = useDecideCommunityBanRatification(slug);
  const [deciding, setDeciding] = useState<DecidingTarget | null>(null);

  const windowHours = data?.windowHours ?? 0;
  const fallbackDays = data?.fallbackDays ?? 0;

  const confirmDecision = (note: string) => {
    if (!deciding) return;
    const { hold, decision } = deciding;
    decide.mutate(
      {
        ratificationId: hold.id,
        input: { decision, ...(note ? { note } : {}) },
      },
      {
        onSuccess: () => {
          setDeciding(null);
          showToast(
            t(
              decision === "ratify"
                ? "communities:detail.modtools.ratifications.ratifiedToast"
                : "communities:detail.modtools.ratifications.declinedToast",
              { name: hold.memberName, days: fallbackDays },
            ),
            decision === "ratify" ? "success" : "info",
          );
        },
        onError: (error) => {
          const refusal = communityBanRatificationRefusalFor(error);
          setDeciding(null);
          showToast(
            t(
              refusal
                ? `communities:detail.modtools.ratifications.refusal.${refusal}`
                : "communities:detail.modtools.ratifications.errorToast",
            ),
            "error",
          );
          // A refusal means this client's copy of the queue is behind the
          // server's, so re-read it rather than leaving a row offering an
          // action that will keep failing.
          if (refusal) void refetch();
        },
      },
    );
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.ratifications.label")}
      </div>
      <p className={panels.intro}>
        {t("communities:detail.modtools.ratifications.intro")}
      </p>
      {data && (
        <p className={panels.intro}>
          {t("communities:detail.modtools.ratifications.windowNote", {
            hours: windowHours,
            days: fallbackDays,
          })}
        </p>
      )}

      {isPending ? (
        <SkeletonQueue />
      ) : isError || !data ? (
        <EmptyState
          compact
          icon={<FiAlertTriangle />}
          title={t("communities:detail.modtools.ratifications.error.title")}
          description={t(
            "communities:detail.modtools.ratifications.error.description",
          )}
          action={{
            label: t("communities:detail.modtools.ratifications.error.retry"),
            onClick: () => void refetch(),
          }}
        />
      ) : data.ratifications.length === 0 ? (
        <EmptyState
          compact
          icon={<FiCheckCircle />}
          title={t("communities:detail.modtools.ratifications.empty.title")}
          description={t(
            "communities:detail.modtools.ratifications.empty.description",
          )}
        />
      ) : (
        <ul className={styles.list}>
          {data.ratifications.map((hold) => (
            <ModToolsBanRatificationRow
              key={hold.id}
              hold={hold}
              fallbackDays={fallbackDays}
              isDeciding={decide.isPending}
              onDecide={(target, decision) =>
                setDeciding({ hold: target, decision })
              }
            />
          ))}
        </ul>
      )}

      {deciding && (
        <ModToolsBanRatificationDialog
          hold={deciding.hold}
          decision={deciding.decision}
          fallbackDays={fallbackDays}
          isPending={decide.isPending}
          onClose={() => setDeciding(null)}
          onConfirm={confirmDecision}
        />
      )}
    </div>
  );
}

/** The loading queue. Two placeholder cards rather than a spinner, so the pane
 *  does not jump height when the real holds land, and so a slow request never
 *  reads as an empty queue for even one frame. */
function SkeletonQueue() {
  return (
    <ul className={styles.list} aria-busy="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <li key={index} className={styles.hold} aria-hidden>
          <SkeletonLine width={200} height={22} />
          <SkeletonLine width="60%" style={{ marginTop: 10 }} />
          <SkeletonLine width="85%" style={{ marginTop: 10 }} />
        </li>
      ))}
    </ul>
  );
}
