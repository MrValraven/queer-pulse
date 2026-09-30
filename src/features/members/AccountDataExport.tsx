import { useEffect, useRef } from "react";
import { useMutation, useQuery, type Query } from "@tanstack/react-query";
import { FiDownload } from "react-icons/fi";
import { Badge, Button, type BadgeTone } from "../../shared/components/ui";
import { useLocalStorage } from "../../shared/hooks";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { logError } from "../../shared/observability/logger";
import { DATA_TYPES } from "../settings/dataExport.data";
import {
  getExportJob,
  requestExport,
  type ExportJob,
  type ExportStatus,
} from "../settings/api/account.api";
import { useReauth } from "../settings/api/useAccountMutations";
import styles from "./AccountData.module.css";

const POLL_MS = 3000;
const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_TONE: Record<ExportStatus, BadgeTone> = {
  queued: "ghost",
  processing: "amber",
  ready: "jade",
  failed: "danger",
  expired: "ghost",
};

const STATUS_LABEL_KEY: Record<ExportStatus, string> = {
  queued: "members:profile.accountData.export.status.queued",
  processing: "members:profile.accountData.export.status.processing",
  ready: "members:profile.accountData.export.status.ready",
  failed: "members:profile.accountData.export.status.failed",
  expired: "members:profile.accountData.export.status.expired",
};

/** True while the job is still building — the state `refetchInterval` polls on. */
function isPolling(status: ExportStatus | undefined): boolean {
  return status === "queued" || status === "processing";
}

/**
 * The demo-mode staged job update: `queued` -> `processing` -> a real
 * downloadable blob, on the same three-poll cadence the component always
 * used. Kept outside the component (and taking its refs as arguments) so
 * `AccountDataExport` stays under the 200-line component budget; `jobQuery`'s
 * `queryFn` below calls it unchanged in demo mode.
 */
async function buildDemoJobUpdate(
  demoStageRef: { current: number },
  demoBlobRef: { current: string | null },
  jobId: string,
  t: TFunction,
): Promise<ExportJob> {
  demoStageRef.current += 1;
  const now = new Date().toISOString();
  if (demoStageRef.current <= 1) {
    return { jobId, status: "queued", requestedAt: now };
  }
  if (demoStageRef.current === 2) {
    return { jobId, status: "processing", requestedAt: now };
  }
  if (demoBlobRef.current) URL.revokeObjectURL(demoBlobRef.current);
  try {
    const { buildDemoArchiveManifest } =
      await import("../settings/demoExportArchive.data");
    const archive = buildDemoArchiveManifest(
      DATA_TYPES.map((type) => type.id),
      "json",
      t("settings:dataExport.demoArchiveNote"),
    );
    const blob = new Blob([JSON.stringify(archive, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    demoBlobRef.current = url;
    return {
      jobId,
      status: "ready",
      requestedAt: now,
      downloadUrl: url,
      sizeBytes: 2048,
      expiresAt: new Date(Date.now() + 7 * DAY_MS).toISOString(),
    };
  } catch (err) {
    // A chunk that fails to load must not leave the sheet polling forever
    // off the last "processing" data. Rethrow so the component's `isJobGone`
    // resets it exactly as a live 404 or network failure does.
    logError(err, { where: "AccountDataExport.demoArchive" });
    throw err;
  }
}

/**
 * "Download your data" — Article 20 portability. Click posts the job, then
 * polls `GET /account/export/:jobId` via react-query's `refetchInterval`
 * (rather than a hand-rolled `setInterval` effect) until it lands on
 * `ready`/`failed`. Demo mode simulates the same staged progression locally
 * and produces a real downloadable blob, so the sheet tells the truth about
 * what "Download" does even offline.
 */
export function AccountDataExport() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { getReauthToken, beginReauth } = useReauth();
  // The job id outlives this component. `AccountDataSheet` unmounts the whole
  // section when it closes, so keeping the id in plain state meant a member who
  // closed the sheet came back to the "Download your data" button with no
  // memory of the archive already building — and pressing it fired a second
  // `POST /account/export`, behind another reauth round-trip, while the first
  // archive was never found. Scoped per user so a shared device never shows one
  // member another's job, and skipped in demo mode, whose "demo-export" id is a
  // fiction the staged poll re-creates from zero anyway.
  const [jobId, setJobId] = useLocalStorage<string | null>(
    `qp.accountExport.jobId.${demoMode ? "demo" : (user?.profile.slug ?? "anon")}`,
    null,
    (value): value is string | null =>
      value === null || typeof value === "string",
  );
  // Counts poll attempts in demo mode to stage queued → processing → ready;
  // resets whenever a fresh job starts.
  const demoStageRef = useRef(0);
  const demoBlobRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (demoBlobRef.current) URL.revokeObjectURL(demoBlobRef.current);
    },
    [],
  );

  const startMutation = useMutation<ExportJob, Error, void>({
    mutationFn: async () => {
      if (demoMode) {
        demoStageRef.current = 0;
        return {
          jobId: "demo-export",
          status: "queued",
          requestedAt: new Date().toISOString(),
        };
      }
      // Step-up token: an export is a full dump of everything held on a
      // person, so it sits behind the same real OAuth step-up as deletion —
      // see `useReauthToken.ts`. No fresh token cached yet: redirect instead
      // of proceeding, and never resolve (the page is about to unload; the
      // member presses Download again after landing back).
      const reauthToken = getReauthToken();
      if (!reauthToken) {
        beginReauth();
        return new Promise<ExportJob>(() => {});
      }
      const categories = DATA_TYPES.map((type) => type.id);
      return requestExport({ categories, format: "json", reauthToken });
    },
    onSuccess: (job) => setJobId(job.jobId),
    onError: (err) => {
      logError(err, { where: "AccountDataExport.start" });
      showToast(
        t("members:profile.accountData.export.toast.startError"),
        "error",
      );
    },
  });

  const jobQuery = useQuery<ExportJob>({
    queryKey: ["account-export-job", jobId, demoMode],
    enabled: jobId != null,
    queryFn: async () =>
      demoMode
        ? buildDemoJobUpdate(demoStageRef, demoBlobRef, jobId!, t)
        : getExportJob(jobId!),
    // A stored id can outlive its job (the archive is purged after a week), so
    // don't sit retrying a 404 — clear it below and offer a fresh request.
    retry: false,
    refetchInterval: (query: Query<ExportJob>) =>
      // A failed fetch (demo import/build failure or a live 404) must stop
      // the interval itself: it leaves `data` on its last "processing" value,
      // which would otherwise read as still-polling forever.
      query.state.error
        ? false
        : isPolling(query.state.data?.status)
          ? POLL_MS
          : false,
  });

  // Demo mode included: a demo archive build can fail the same way a live
  // lookup can (see the `catch` above), and both must reset to the initial
  // "Download" button so the sheet never sits on a stale "processing" badge.
  const isJobGone = jobQuery.isError;
  useEffect(() => {
    if (isJobGone) setJobId(null);
  }, [isJobGone, setJobId]);

  const job = jobQuery.data;
  const expiry =
    job?.expiresAt &&
    fmt.date(new Date(job.expiresAt), { day: "numeric", month: "long" });

  function handleStart() {
    setJobId(null);
    startMutation.mutate();
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>
        {t("members:profile.accountData.export.title")}
      </h3>
      <p className={styles.body}>
        {t("members:profile.accountData.export.intro")}
      </p>

      {!job ? (
        <Button
          variant="primary"
          onClick={handleStart}
          disabled={startMutation.isPending}
        >
          {startMutation.isPending
            ? t("members:profile.accountData.export.requesting")
            : t("members:profile.accountData.export.cta")}
        </Button>
      ) : (
        <div>
          <div className={styles.statusRow}>
            <Badge tone={STATUS_TONE[job.status]} dot>
              {t(STATUS_LABEL_KEY[job.status])}
            </Badge>
            {isPolling(job.status) && (
              <span className={styles.hint}>
                {t("members:profile.accountData.export.statusNote")}
              </span>
            )}
          </div>

          {job.status === "ready" && job.downloadUrl && (
            <div className={styles.block}>
              <Button
                variant="jade"
                href={job.downloadUrl}
                download="queerpulse-export.json"
              >
                <FiDownload
                  style={{ verticalAlign: "-2px", marginRight: 8 }}
                  aria-hidden
                />
                {t("members:profile.accountData.export.downloadCta")}
              </Button>
              {expiry && (
                <p className={styles.hint}>
                  {t("members:profile.accountData.export.expiresNote", {
                    date: expiry,
                  })}
                </p>
              )}
            </div>
          )}

          {(job.status === "failed" || job.status === "expired") && (
            <div className={styles.block}>
              <Button variant="ghost" onClick={handleStart}>
                {t("members:profile.accountData.export.retryCta")}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
