import { useMemo, useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PitchTrackerHeader } from "./PitchTrackerHeader";
import { PitchTabs } from "./PitchTabs";
import { PitchCard } from "./PitchCard";
import {
  PITCH_TABS,
  countByTab,
  selectPitches,
  type Pitch,
} from "./pitchTracker.data";
import { useMySubmissions } from "./api/useMySubmissions";
import styles from "./PitchTrackerPage.module.css";

function PitchCardSkeleton() {
  return (
    <div className={styles.skeletonCard} aria-hidden>
      <SkeletonLine width="55%" height={20} />
      <SkeletonLine width="70%" height={13} style={{ marginTop: 12 }} />
      <SkeletonLine
        width="100%"
        height={5}
        style={{ marginTop: 18, borderRadius: 3 }}
      />
    </div>
  );
}

export function PitchTrackerPage() {
  const loading = useSimulatedLoad();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [tab, setTab] = useState("all");
  const [withdrawn, setWithdrawn] = useState<Set<string>>(new Set());
  const { data: pitches } = useMySubmissions();

  // `useMySubmissions` already returns the demo PITCHES in demo mode and the
  // member's real submissions live, so an empty result here means "none yet".
  const base = useMemo(
    () => (pitches ?? []).filter((p) => !withdrawn.has(p.id)),
    [pitches, withdrawn],
  );
  const counts = useMemo(() => countByTab(base), [base]);
  const visible = useMemo(() => selectPitches(base, tab), [base, tab]);

  function withdraw(pitch: Pitch) {
    setWithdrawn((prev) => new Set(prev).add(pitch.id));
    showToast(t("magazine:pitchTracker.page.withdrawnToast"), "info", undefined, {
      label: t("magazine:pitchTracker.page.undoCta"),
      onClick: () =>
        setWithdrawn((prev) => {
          const nextSet = new Set(prev);
          nextSet.delete(pitch.id);
          return nextSet;
        }),
    });
  }

  function stub(label: string) {
    showToast(t("magazine:pitchTracker.page.stubToast", { label }), "info");
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <PitchTrackerHeader />
        <PitchTabs
          tabs={PITCH_TABS}
          active={tab}
          counts={counts}
          onChange={setTab}
        />

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <PitchCardSkeleton key={i} />)
        ) : visible.length === 0 ? (
          <div className={styles.empty}>
            <h3>{t("magazine:pitchTracker.page.emptyTitle")}</h3>
            <p>{t("magazine:pitchTracker.page.emptyBody")}</p>
          </div>
        ) : (
          visible.map((pitch, i) => (
            <FadeIn key={pitch.id} delay={Math.min(i, 8) * 55}>
              <PitchCard pitch={pitch} onWithdraw={withdraw} onStub={stub} />
            </FadeIn>
          ))
        )}
      </div>
    </AppShell>
  );
}
