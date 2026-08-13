import { useState } from "react";
import { Button, Select } from "../../shared/components/ui";
import { AdminDrawer, AdminAvatar, AdminChip, type AvatarTone } from "./ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberRefToPerson } from "../../shared/api/refs";
import {
  levelRank,
  type VerificationLevel,
} from "../economy/api/verification.api";
import type { TFunction } from "../../shared/i18n/types";
import { VERIFICATION_STATUS_TONE } from "./verificationStatusTone";
import {
  useVerificationHistory,
  useApplyVerificationLevel,
} from "./api/useAdminVerifications";
import {
  VERIFICATION_LEVELS,
  type AdminVerificationDTO,
  type VerificationEventDTO,
} from "./api/adminVerifications.api";
import { VerificationHistoryPanel } from "./VerificationHistoryPanel";
import styles from "./AdminVerificationsPage.module.css";

/** The current level's provenance state: derived from the loaded history, not
 *  a `grantedBy` field on the row (there isn't one). Finds the most recent
 *  event whose `toLevel` matches the row's current level — if that event
 *  carries an `actor`, an admin set the level (`"granted"`); otherwise the
 *  member reached it through their own step-up flow (`"earned"`). A `none`
 *  level with no history at all isn't "earned" by anyone — it's simply
 *  untouched, so it gets its own `"none"` state (deferred minor F2) rather
 *  than falling through to the earned copy. `events` is already newest-first
 *  (per `getVerificationHistory`/the demo fixture), so a plain `.find` picks
 *  the most recent match. */
type ProvenanceState =
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "earned" }
  | { kind: "granted"; actorName: string };

function resolveProvenance(
  events: VerificationEventDTO[],
  level: VerificationLevel,
  isLoading: boolean,
): ProvenanceState {
  if (isLoading) return { kind: "loading" };
  if (level === "none" && events.length === 0) return { kind: "none" };
  const grantingEvent = events.find((event) => event.toLevel === level);
  if (grantingEvent?.actor) {
    const actorName = `${grantingEvent.actor.firstName} ${grantingEvent.actor.lastName}`.trim();
    return { kind: "granted", actorName };
  }
  return { kind: "earned" };
}

/** Renders `resolveProvenance`'s state as the drawer's provenance line. The
 *  earned/granted states (spec §8: honest-badge provenance) carry a small
 *  "Provenance" label ahead of the value, in its own element, so the
 *  member-earned-vs-admin-granted distinction reads as a labeled fact rather
 *  than a bare caption — loading and the `none` state stay unlabeled since
 *  there's no provenance yet to label. */
function ProvenanceLine({
  t,
  provenance,
}: {
  t: TFunction;
  provenance: ProvenanceState;
}) {
  if (provenance.kind === "loading") {
    return <>{t("admin:verifications.drawer.provenanceLoading")}</>;
  }
  if (provenance.kind === "none") {
    return <>{t("admin:verifications.drawer.provenanceNone")}</>;
  }
  const value =
    provenance.kind === "granted"
      ? t("admin:verifications.drawer.provenanceGranted", {
          actor: provenance.actorName,
        })
      : t("admin:verifications.drawer.provenanceEarned");
  return (
    <>
      <span className={styles.provenanceLabel}>
        {t("admin:verifications.drawer.provenanceLabel")}
      </span>{" "}
      {value}
    </>
  );
}

/**
 * The verification queue row's detail drawer (Task 9): a member header with
 * the current level and its provenance, the append-only audit history
 * (`VerificationHistoryPanel`), a signals placeholder Phase 3 fills in, and
 * a footer that overrides the level. `row` is the already-loaded list row
 * — `AdminVerificationsPage` looks it up from `rows` by `selectedUserId`,
 * so there's no separate detail fetch here, only the history one.
 *
 * The override mutation (`useApplyVerificationLevel`) is live-only — demo
 * has no real record to change, and the hook has no demo branch at all — so
 * Apply stays disabled in demo mode with a title explaining why, alongside
 * its other two guards: no-op (level unchanged) and a missing reason when
 * the chosen level is LOWER than the row's current one (compared via the
 * shared `levelRank` ladder, not a locally redefined one).
 */
export function VerificationDetailDrawer({
  row,
  onClose,
}: {
  row: AdminVerificationDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { events, isLoading: historyLoading } = useVerificationHistory(
    row.userId,
  );
  const applyMutation = useApplyVerificationLevel();

  const [selectedLevel, setSelectedLevel] = useState<VerificationLevel>(
    row.level,
  );
  const [reason, setReason] = useState("");

  const person = memberRefToPerson(row.member);
  const name = person?.name ?? t("admin:verifications.unknownMember");

  const isNoop = selectedLevel === row.level;
  const isLowering = levelRank(selectedLevel) < levelRank(row.level);
  const reasonMissing = isLowering && reason.trim().length === 0;
  const applyDisabled =
    demoMode || isNoop || reasonMissing || applyMutation.isPending;

  const handleApply = () => {
    applyMutation.mutate(
      {
        userId: row.userId,
        level: selectedLevel,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast(t("admin:verifications.toast.updated"), "success");
          onClose();
        },
        onError: () => {
          showToast(t("admin:verifications.toast.error"), "error");
        },
      },
    );
  };

  return (
    <AdminDrawer
      label={t("admin:verifications.drawer.label", { name })}
      onClose={onClose}
      head={
        <div className={styles.dHead}>
          <AdminAvatar
            initials={person?.initials ?? "?"}
            // Person.tint is a wider AvatarTint union; tintForSlug (its only
            // source) only ever produces coral/plum/jade, a subset of
            // AdminAvatar's AvatarTone — same cast as AdminVerificationRows.
            tone={(person?.tint as AvatarTone | undefined) ?? "anon"}
            size="lg"
            src={person?.avatarUrl ?? undefined}
            alt={name}
          />
          <div>
            <h2 className={styles.dName}>{name}</h2>
            <div className={styles.dChips}>
              <AdminChip tone={VERIFICATION_STATUS_TONE[row.level]} dot>
                {t(`admin:verifications.level.${row.level}`)}
              </AdminChip>
            </div>
            <p className={styles.provenanceLine}>
              <ProvenanceLine
                t={t}
                provenance={resolveProvenance(events, row.level, historyLoading)}
              />
            </p>
          </div>
        </div>
      }
      foot={
        <div className={styles.dFoot}>
          <div className={styles.footField}>
            <span className={styles.footFieldLabel} id="set-level-label">
              {t("admin:verifications.setLevelLabel")}
            </span>
            <Select
              labelledBy="set-level-label"
              value={selectedLevel}
              options={VERIFICATION_LEVELS.map((levelOption) => ({
                value: levelOption,
                label: t(`admin:verifications.level.${levelOption}`),
              }))}
              onChange={(value) =>
                setSelectedLevel(
                  (value ?? selectedLevel) as VerificationLevel,
                )
              }
            />
          </div>

          <label className={styles.footField}>
            <span className={styles.footFieldLabel}>
              {t("admin:verifications.drawer.reasonLabel")}
            </span>
            <input
              type="text"
              className={styles.footInput}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("admin:verifications.drawer.reasonPlaceholder")}
            />
          </label>

          {reasonMissing && (
            <p className={styles.footHint}>
              {t("admin:verifications.drawer.reasonRequiredHint")}
            </p>
          )}

          <Button
            variant="ghost"
            size="md"
            disabled={applyDisabled}
            title={
              demoMode
                ? t("admin:verifications.drawer.liveOnlyTitle")
                : undefined
            }
            onClick={handleApply}
          >
            {applyMutation.isPending
              ? t("admin:verifications.drawer.applying")
              : t("admin:verifications.applyCta")}
          </Button>
        </div>
      }
    >
      <VerificationHistoryPanel events={events} isLoading={historyLoading} />
      <div className={styles.signalsSection}>
        <h4 className={styles.historySectionTitle}>
          {t("admin:verifications.drawer.signalsHeading")}
        </h4>
        <p className={styles.signalsNote}>
          {t("admin:verifications.drawer.signalsNote")}
        </p>
      </div>
    </AdminDrawer>
  );
}
