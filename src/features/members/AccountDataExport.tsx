import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, type Query } from "@tanstack/react-query";
import { FiDownload } from "react-icons/fi";
import { Badge, Button, type BadgeTone } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { logError } from "../../shared/observability/logger";
import { currentUser, currentUserEmail } from "./data/members";
import { DATA_TYPES } from "../settings/dataExport.data";
import {
  getExportJob,
  reauth,
  requestExport,
  type ExportJob,
  type ExportStatus,
} from "../settings/api/account.api";
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
 * A small, genuinely machine-readable JSON archive of the mock user for the
 * DEMO-mode staged simulation below, so "Download" yields a real file even
 * with no backend — mirrors `useExportFlow.ts`'s `buildDemoArchive`, kept
 * separate because this sheet's poll loop (react-query `refetchInterval`)
 * drives the staged queued→processing→ready transitions differently.
 */
function buildDemoExportUrl(): string {
  const archive = {
    manifest: {
      exportedAt: new Date().toISOString(),
      schemaVersion: "1.0",
      format: "json",
      categories: DATA_TYPES.map((type) => type.id),
    },
    profile: {
      name: `${currentUser.first} ${currentUser.last}`,
      pronouns: currentUser.pronouns,
      email: currentUserEmail,
    },
  };
  const blob = new Blob([JSON.stringify(archive, null, 2)], {
    type: "application/json",
  });
  return URL.createObjectURL(blob);
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
  const [jobId, setJobId] = useState<string | null>(null);
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
      // person, so it sits behind the same short-lived token as deletion —
      // see the note on `reauth` in `account.api.ts`.
      const { reauthToken } = await reauth();
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
    queryFn: async () => {
      if (demoMode) {
        demoStageRef.current += 1;
        const now = new Date().toISOString();
        if (demoStageRef.current <= 1) {
          return { jobId: jobId!, status: "queued", requestedAt: now };
        }
        if (demoStageRef.current === 2) {
          return { jobId: jobId!, status: "processing", requestedAt: now };
        }
        if (demoBlobRef.current) URL.revokeObjectURL(demoBlobRef.current);
        const url = buildDemoExportUrl();
        demoBlobRef.current = url;
        return {
          jobId: jobId!,
          status: "ready",
          requestedAt: now,
          downloadUrl: url,
          sizeBytes: 2048,
          expiresAt: new Date(Date.now() + 7 * DAY_MS).toISOString(),
        };
      }
      return getExportJob(jobId!);
    },
    refetchInterval: (query: Query<ExportJob>) =>
      isPolling(query.state.data?.status) ? POLL_MS : false,
  });

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
