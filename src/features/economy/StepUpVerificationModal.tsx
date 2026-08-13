import { useState } from "react";
import { FiAlertCircle, FiClock, FiShield } from "react-icons/fi";
import {
  Badge,
  Button,
  RadioCardGroup,
  type BadgeTone,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import {
  useAppealVerificationRequest,
  useSubmitVerificationRequest,
  useVerificationStatus,
  useWithdrawVerificationRequest,
} from "./api/useVerification";
import type {
  VerificationLevel,
  VerificationRequestDTO,
  VerificationRequestStatus,
} from "./api/verification.api";
import styles from "./StepUpVerificationModal.module.css";

const STATUS_TONE: Partial<Record<VerificationRequestStatus, BadgeTone>> = {
  pending: "amber",
  in_review: "violet",
  appealing: "amber",
  rejected: "danger",
};

function levelLabelKey(level: VerificationLevel) {
  return level === "id_verified"
    ? "economy:verification.badge.id.label"
    : "economy:verification.badge.phone.label";
}

/** Pick-a-level + write-a-note form (the initial submission, or a fresh one
 *  after a final rejection). Offers every level from `requiredLevel` up to
 *  the top of the ladder, so a member gated at "phone" can opt straight into
 *  "id_verified" instead of requesting twice. */
function RequestForm({
  requiredLevel,
  level,
  onLevelChange,
  context,
  onContextChange,
  onSubmit,
  onCancel,
  submitting,
}: {
  requiredLevel: VerificationLevel;
  level: VerificationLevel;
  onLevelChange: (level: VerificationLevel) => void;
  context: string;
  onContextChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const { t } = useTranslation();
  const levelOptions: VerificationLevel[] =
    requiredLevel === "id_verified" ? ["id_verified"] : ["phone", "id_verified"];

  return (
    <div className={styles.body}>
      {levelOptions.length > 1 && (
        <>
          <span className={styles.label} id="stepup-level-label">
            {t("economy:verification.request.levelLabel")}
          </span>
          <RadioCardGroup<VerificationLevel>
            value={level}
            onChange={onLevelChange}
            ariaLabel={t("economy:verification.request.levelLabel")}
            ariaLabelledBy="stepup-level-label"
            className={styles.levelGroup}
            optionClassName={styles.levelOption}
            checkedClassName={styles.levelOptionOn}
            options={levelOptions.map((option) => ({
              id: option,
              render: (
                <span className={styles.levelText}>
                  <b>{t(levelLabelKey(option))}</b>
                  <span>
                    {t(
                      option === "id_verified"
                        ? "economy:verification.request.level.id.hint"
                        : "economy:verification.request.level.phone.hint",
                    )}
                  </span>
                </span>
              ),
            }))}
          />
        </>
      )}

      <label className={styles.label} htmlFor="stepup-context">
        {t("economy:verification.request.contextLabel")}
      </label>
      <textarea
        id="stepup-context"
        className={styles.textarea}
        value={context}
        onChange={(event) => onContextChange(event.target.value.slice(0, 600))}
        placeholder={t("economy:verification.request.contextPlaceholder")}
        rows={4}
        aria-describedby="stepup-context-hint"
      />
      <p className={styles.note} id="stepup-context-hint">
        {t("economy:verification.request.contextHint")}
      </p>

      <div className={styles.foot}>
        <button type="button" className={styles.back} onClick={onCancel}>
          {t("economy:verification.request.cancel")}
        </button>
        <Button variant="primary" disabled={submitting} onClick={onSubmit}>
          {submitting ? (
            <Sending label={t("economy:verification.request.submitting")} />
          ) : (
            t("economy:verification.request.submitCta")
          )}
        </Button>
      </div>
    </div>
  );
}

/** Submitted/in-review/appealing/rejected status view, driven entirely by the
 *  member's `latestRequest`. Withdraw is only offered while a request is
 *  still open (pending/in_review — the server enforces the same rule);
 *  appeal only from a rejected request that hasn't been appealed yet. */
function RequestStatus({
  request,
  onWithdraw,
  withdrawing,
  onAppeal,
  appealing,
  onStartOver,
  onClose,
}: {
  request: VerificationRequestDTO;
  onWithdraw: () => void;
  withdrawing: boolean;
  onAppeal: () => void;
  appealing: boolean;
  onStartOver: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const canWithdraw = request.status === "pending" || request.status === "in_review";
  const canAppeal = request.status === "rejected" && !request.isAppeal;
  const canStartOver = request.status === "rejected" && request.isAppeal;

  return (
    <div className={styles.body}>
      <div className={styles.statusRow}>
        <Badge tone={STATUS_TONE[request.status] ?? "ghost"}>
          {request.status === "rejected" && <FiAlertCircle aria-hidden />}
          {(request.status === "pending" ||
            request.status === "in_review" ||
            request.status === "appealing") && <FiClock aria-hidden />}
          {t(`economy:verification.request.statusPill.${request.status}`)}
        </Badge>
        <Badge tone="ghost">{t(levelLabelKey(request.requestedLevel))}</Badge>
        {request.isAppeal && (
          <Badge tone="plum">{t("economy:verification.request.appealChip")}</Badge>
        )}
      </div>

      {request.context && (
        <div className={styles.reasonBlock}>
          <span className={styles.reasonLabel}>
            {t("economy:verification.request.yourNote")}
          </span>
          <p className={styles.note}>{request.context}</p>
        </div>
      )}

      {request.status === "rejected" && request.decisionReason && (
        <div className={styles.reasonBlock}>
          <span className={styles.reasonLabel}>
            {t("economy:verification.request.moderatorNote")}
          </span>
          <p className={styles.note}>{request.decisionReason}</p>
        </div>
      )}

      <div className={styles.foot}>
        <button type="button" className={styles.back} onClick={onClose}>
          {t("economy:verification.request.later")}
        </button>
        {canWithdraw && (
          <Button variant="ghost" disabled={withdrawing} onClick={onWithdraw}>
            {withdrawing ? (
              <Sending label={t("economy:verification.request.withdrawing")} />
            ) : (
              t("economy:verification.request.withdrawCta")
            )}
          </Button>
        )}
        {canAppeal && (
          <Button variant="primary" disabled={appealing} onClick={onAppeal}>
            {appealing ? (
              <Sending label={t("economy:verification.request.appealSending")} />
            ) : (
              t("economy:verification.request.appealCta")
            )}
          </Button>
        )}
        {canStartOver && (
          <Button variant="primary" onClick={onStartOver}>
            {t("economy:verification.request.newRequestCta")}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable step-up prompt shown when a gated action returns
 * `VERIFICATION_REQUIRED`. A member picks the level they need, writes a short
 * context note in their own words (reference-based — no document upload),
 * and submits a request a moderator reviews by hand. Once `latestRequest`
 * (from `useVerificationStatus`) reads `approved`, the modal shows the
 * plum success panel and `onVerified` retries the gated action on request.
 * Dual-mode: every hook here already branches demo/live, so this component
 * never touches the mock registry directly.
 */
export function StepUpVerificationModal({
  requiredLevel,
  onVerified,
  onClose,
}: {
  requiredLevel: VerificationLevel;
  onVerified: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: status } = useVerificationStatus();
  const submitRequest = useSubmitVerificationRequest();
  const withdrawRequest = useWithdrawVerificationRequest();
  const appealRequest = useAppealVerificationRequest();

  const [level, setLevel] = useState<VerificationLevel>(requiredLevel);
  const [context, setContext] = useState("");
  const [forceForm, setForceForm] = useState(false);

  const latestRequest = status?.latestRequest ?? null;
  const showForm =
    forceForm || !latestRequest || latestRequest.status === "withdrawn";
  const approved = !forceForm && latestRequest?.status === "approved";

  const submit = () => {
    submitRequest.mutate(
      { requestedLevel: level, context: context.trim() || undefined },
      {
        onSuccess: () => setForceForm(false),
        onError: () =>
          showToast(t("economy:verification.request.submitError"), "error"),
      },
    );
  };

  const withdraw = () => {
    if (!latestRequest) return;
    withdrawRequest.mutate(latestRequest.id, {
      onSuccess: () =>
        showToast(t("economy:verification.request.withdrawnToast"), "success"),
      onError: () =>
        showToast(t("economy:verification.request.withdrawError"), "error"),
    });
  };

  const appeal = () => {
    if (!latestRequest) return;
    appealRequest.mutate(latestRequest.id, {
      onError: () =>
        showToast(t("economy:verification.request.appealError"), "error"),
    });
  };

  const startOver = () => {
    setLevel(requiredLevel);
    setContext("");
    setForceForm(true);
  };

  if (approved) {
    return (
      <ModalShell onClose={onClose} success ariaLabel={t("economy:verification.request.ariaLabel")}>
        <SuccessPanel
          title={t("economy:verification.request.approved.title")}
          em={t("economy:verification.request.approved.em")}
          onClose={onVerified}
          closeLabel={t("economy:verification.request.approved.continueCta")}
        >
          {t("economy:verification.request.approved.body")}
        </SuccessPanel>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} ariaLabel={t("economy:verification.request.ariaLabel")}>
      <div className={styles.head}>
        <span className={styles.icon}>
          <FiShield aria-hidden />
        </span>
        <h2 className={styles.title}>{t("economy:verification.request.title")}</h2>
        <p className={styles.sub}>
          {showForm
            ? t("economy:verification.request.subForm")
            : t(`economy:verification.request.sub.${latestRequest.status}`)}
        </p>
      </div>

      {showForm ? (
        <RequestForm
          requiredLevel={requiredLevel}
          level={level}
          onLevelChange={setLevel}
          context={context}
          onContextChange={setContext}
          onSubmit={submit}
          onCancel={onClose}
          submitting={submitRequest.isPending}
        />
      ) : (
        <RequestStatus
          request={latestRequest}
          onWithdraw={withdraw}
          withdrawing={withdrawRequest.isPending}
          onAppeal={appeal}
          appealing={appealRequest.isPending}
          onStartOver={startOver}
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}
