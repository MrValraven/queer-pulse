import { useEffect, useState } from "react";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccessTier } from "./membership.types";
import {
  JoinStepAbout,
  JoinStepDone,
  JoinStepInvolvement,
  JoinStepIntro,
} from "./JoinModalSteps";
import styles from "./JoinModal.module.css";

export interface JoinModalCommunity {
  name: string;
  typeLabel: string;
  count: string;
  description: string;
  tags?: string[];
}

export function JoinModal({
  community,
  tier = "public",
  onClose,
  onJoined,
  onRequested,
}: {
  community: JoinModalCommunity;
  tier?: AccessTier;
  onClose: () => void;
  onJoined?: () => void;
  onRequested?: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [involvement, setInvolvement] = useState("active");
  const [inviteCode, setInviteCode] = useState("");
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isRequest = tier === "request" || tier === "private";
  const isInvite = tier === "invite";

  const total = 3;
  const done = step > total;
  const fill = done ? 100 : (step / total) * 100;

  const submit = () => {
    setStep(4);
    if (isRequest) onRequested?.();
    else onJoined?.();
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("communities:join.ariaLabel", { name: community.name })}
        className={styles.modal}
      >
        <div className={styles.grabber} aria-hidden />
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("communities:join.close")}
        >
          ×
        </button>

        {!done && (
          <div className={styles.progress}>
            <div className={styles.bar}>
              <div
                className={styles.fill}
                style={{ transform: `scaleX(${fill / 100})` }}
              />
            </div>
            <div className={styles.progressLabel}>
              {t("communities:join.progress", { step, total })}
            </div>
          </div>
        )}

        {step === 1 && (
          <JoinStepIntro
            community={community}
            isRequest={isRequest}
            isInvite={isInvite}
            inviteCode={inviteCode}
            setInviteCode={setInviteCode}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && <JoinStepAbout onNext={() => setStep(3)} />}

        {step === 3 && (
          <JoinStepInvolvement
            isRequest={isRequest}
            involvement={involvement}
            setInvolvement={setInvolvement}
            onSubmit={submit}
          />
        )}

        {done && (
          <JoinStepDone
            community={community}
            isRequest={isRequest}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
