import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import {
  FiArrowLeft,
  FiBellOff,
  FiMonitor,
  FiSmartphone,
} from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logError } from "../../shared/observability/logger";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { simulateOr } from "./api/account.api";
import { usePushDevices } from "./api/usePushDevices";
import { revokePushSubscription } from "../push/push.api";
import { routes } from "../../app/routeMap";
import { type PushDevice } from "./pushDevices.data";
import styles from "./PushDevicesPage.module.css";

function DeviceCard({
  device,
  onRemove,
}: {
  device: PushDevice;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation();
  const icCls = [styles.ic, device.deviceType === "mobile" && styles.icMobile]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.card}>
      <div className={icCls}>
        {device.deviceType === "mobile" ? (
          <FiSmartphone aria-hidden />
        ) : (
          <FiMonitor aria-hidden />
        )}
      </div>
      <div className={styles.details}>
        <div className={styles.name}>{device.device}</div>
        <div className={styles.row}>
          <span>
            <Translation
              i18nKey="settings:pushDevices.card.registered"
              components={{ strong: <b /> }}
              values={{ when: device.registeredAgo }}
            />
          </span>
          {device.lastUsedAgo && (
            <>
              <span className={styles.sep}>·</span>
              <span>
                <Translation
                  i18nKey="settings:pushDevices.card.lastUsed"
                  components={{ strong: <b /> }}
                  values={{ when: device.lastUsedAgo }}
                />
              </span>
            </>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        className={styles.action}
        onClick={() => onRemove(device.id)}
      >
        {t("settings:pushDevices.card.remove")}
      </Button>
    </div>
  );
}

/** Mirrors a DeviceCard so there's no layout shift on load. */
function DeviceSkeleton() {
  return (
    <div className={styles.card}>
      <SkeletonLine width={48} height={48} style={{ borderRadius: 14 }} />
      <div className={styles.details}>
        <SkeletonLine width="45%" height={19} />
        <SkeletonLine width="60%" height={13} style={{ marginTop: 8 }} />
      </div>
      <SkeletonLine width={88} height={36} style={{ borderRadius: 999 }} />
    </div>
  );
}

export function PushDevicesPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { devices, loading: fetching, failed, refetch } = usePushDevices();
  const simulated = useSimulatedLoad();
  // Demo keeps its simulated shimmer; live shows the real fetch state.
  const loading = demoMode ? simulated : fetching;
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  async function handleRemove(id: string) {
    // Optimistic; revert on failure so we never imply a removal that didn't happen.
    setRemoved((previous) => new Set(previous).add(id));
    try {
      await simulateOr(demoMode, undefined, () => revokePushSubscription(id));
      showToast(t("settings:pushDevices.toast.removed"), "success");
      refetch();
    } catch (err) {
      logError(err, { where: "PushDevicesPage.remove" });
      setRemoved((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
      showToast(t("settings:pushDevices.toast.removedError"), "error");
    }
  }

  const activeDevices = devices.filter((device) => !removed.has(device.id));

  return (
    <AppShell>
      <div className={styles.page}>
        <Link
          to={`${routes.settings}?pane=notifications`}
          className={styles.back}
        >
          <FiArrowLeft aria-hidden />{" "}
          {t("settings:pushDevices.backToNotifications")}
        </Link>

        <div className={styles.eyebrow}>
          {t("settings:pushDevices.eyebrow")}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="settings:pushDevices.h1"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>{t("settings:pushDevices.lead")}</p>

        <div className={styles.sectionH}>
          {t("settings:pushDevices.sectionRegistered")}
        </div>
        <div className={styles.list}>
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <DeviceSkeleton key={i} />)
          ) : failed ? (
            <EmptyState
              compact
              icon={<FiBellOff />}
              title={t("settings:pushDevices.empty.error.title")}
              description={t("settings:pushDevices.empty.error.desc")}
            />
          ) : activeDevices.length === 0 ? (
            <EmptyState
              compact
              icon={<FiBellOff />}
              title={t("settings:pushDevices.empty.none.title")}
              description={t("settings:pushDevices.empty.none.desc")}
            />
          ) : (
            activeDevices.map((device, i) => (
              <FadeIn key={device.id} delay={Math.min(i, 8) * 60}>
                <DeviceCard
                  device={device}
                  onRemove={(id) => void handleRemove(id)}
                />
              </FadeIn>
            ))
          )}
        </div>

        <div className={styles.footNote}>
          <Translation
            i18nKey="settings:pushDevices.footNote"
            components={{ strong: <b /> }}
          />
        </div>
      </div>
    </AppShell>
  );
}
