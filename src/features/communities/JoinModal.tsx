import { useState } from "react";
import { ModalSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccessTier } from "./membership.types";
import { INVOLVEMENT } from "./joinModal.data";
import { JoinStepAbout, JoinStepDone, JoinStepIntro } from "./JoinModalSteps";
import styles from "./JoinModal.module.css";

export interface JoinModalCommunity {
  name: string;
  typeLabel: string;
  count: string;
  description: string;
  tags?: string[];
}

/**
 * The backend only persists one free-text `note` on a join/request (see
 * `JoinCommunityDto`) — there's no separate column for "level of
 * involvement". So the chip-select the applicant picks in `JoinStepAbout`
 * gets folded into that same note as a short leading tag, e.g.
 * "[Help organise] New to Lisbon, would love to get involved." Truncated
 * defensively to the backend's `@MaxLength(1000)`.
 */
function composeJoinNote(
  aboutText: string,
  involvementLabel: string,
): string | undefined {
  const trimmedAbout = aboutText.trim();
  const tag = `[${involvementLabel}]`;
  const combined = trimmedAbout ? `${tag} ${trimmedAbout}` : tag;
  return combined.slice(0, 1000);
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
  onJoined?: (note?: string) => void;
  onRequested?: (note?: string) => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [involvement, setInvolvement] = useState("active");
  const [aboutText, setAboutText] = useState("");

  // `invite` gets the same pending-request treatment as `request`/`private`:
  // the backend has no invite-code concept, so an invite-tier join is just a
  // request an owner/mod reviews (see `communities.service.ts#join`). `isInvite`
  // stays separate purely so the intro step can name the invite context in its
  // eyebrow/hint copy.
  const isRequest =
    tier === "request" || tier === "private" || tier === "invite";
  const isInvite = tier === "invite";

  const total = 2;
  const done = step > total;
  const fill = done ? 100 : (step / total) * 100;

  const submit = () => {
    const involvementLabel = t(
      INVOLVEMENT.find((option) => option.value === involvement)?.labelKey ??
        "",
    );
    const note = composeJoinNote(aboutText, involvementLabel);
    setStep(total + 1);
    if (isRequest) onRequested?.(note);
    else onJoined?.(note);
  };

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("communities:join.ariaLabel", { name: community.name })}
    >
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
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <JoinStepAbout
          isRequest={isRequest}
          involvement={involvement}
          setInvolvement={setInvolvement}
          aboutText={aboutText}
          setAboutText={setAboutText}
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
    </ModalSheet>
  );
}
