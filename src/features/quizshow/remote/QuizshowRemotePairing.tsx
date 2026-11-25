import { useCallback, useId, useRef, useState, type FormEvent } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_PAIRING_CODE_PATTERN,
  type QuizshowErrorCode,
  type QuizshowHostState,
  type QuizshowPairedDevice,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_TRANSPORT_TIMEOUT_KEY,
  quizshowErrorKeyOf,
} from "../api/quizshowErrors";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemoteErrorLine } from "./QuizshowRemoteControls";
import { QuizshowRemoteDevices } from "./QuizshowRemoteDevices";
import remoteStyles from "./QuizshowRemote.module.css";
import rescoreStyles from "./QuizshowRemoteRescore.module.css";
import styles from "./QuizshowRemotePairing.module.css";

const CODE_INVALID_KEY = "quizshow:remote.pair.codeInvalid";

/** The 6-digit code. */
const PAIRING_CODE_LENGTH = 6;
/** A pasted code with spaces, dashes or dots between its digits still fits before the digits are kept. */
const PAIRING_INPUT_MAX_LENGTH = 16;

/**
 * People read codes aloud in pairs and paste them with spaces or dashes, so
 * only the digits stay, up to the code's six.
 */
function digitsOfTypedCode(typed: string): string {
  return typed.replace(/\D/g, "").slice(0, PAIRING_CODE_LENGTH);
}

/**
 * The copy for a refused `host:pairDevice` (C4.3). The refusals about the
 * helper (they cannot see the event or game, are banned from the event, or
 * play in this session) name that member, so the host never reads them as
 * their own; every other code keeps its shared line.
 */
function pairRefusalKeyOf(
  code: QuizshowErrorCode | "transport_timeout",
  sessionKind: QuizshowHostState["kind"],
): string {
  if (code === "transport_timeout") return QUIZSHOW_TRANSPORT_TIMEOUT_KEY;
  if (code === "quizshow_cannot_view_event") {
    return sessionKind === "game"
      ? "quizshow:remote.pair.refusal.cannotViewGame"
      : "quizshow:remote.pair.refusal.cannotViewEvent";
  }
  if (code === "quizshow_banned_from_event") {
    return "quizshow:remote.pair.refusal.bannedFromEvent";
  }
  if (code === "quizshow_helper_is_playing") {
    return "quizshow:remote.pair.refusal.helperIsPlaying";
  }
  return quizshowErrorKeyOf(code);
}

/** What the last pairing did: the device it paired, or the copy of its refusal. */
type PairOutcome =
  | { kind: "paired"; device: QuizshowPairedDevice }
  | { kind: "refused"; errorKey: string };

/** The line under the form once a code paired: a screen, or the helper by name. */
function PairedLine({ device }: { device: QuizshowPairedDevice }) {
  const { t } = useTranslation();
  if (device.kind === "screen")
    return <>{t("quizshow:remote.pair.pairedScreen")}</>;
  return (
    <>
      {t("quizshow:remote.pair.pairedHelper", {
        name: device.helperName ?? t("quizshow:remote.devices.helper"),
      })}
    </>
  );
}

/**
 * The "Pair a device" form (C6.5): a 6-digit code from a TV at /play/tv or a
 * helper's phone at /play/remote, checked against the pairing pattern before
 * `host:pairDevice` goes out. It sends through the controller directly, so
 * the helper refusals get their own copy.
 */
function PairForm({
  controller,
  session,
}: {
  controller: QuizshowSessionController;
  session: QuizshowHostState;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const invalidId = useId();
  const [typedCode, setTypedCode] = useState("");
  const [isInvalidShown, setIsInvalidShown] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [outcome, setOutcome] = useState<PairOutcome | null>(null);
  const isPairingRef = useRef(false);

  const pair = async (pairingCode: string) => {
    isPairingRef.current = true;
    setIsPairing(true);
    setOutcome(null);
    try {
      const result = await controller.send("host:pairDevice", { pairingCode });
      if (result.ok) {
        setOutcome({ kind: "paired", device: result.device });
        setTypedCode("");
      } else {
        setOutcome({
          kind: "refused",
          errorKey: pairRefusalKeyOf(result.code, session.kind),
        });
      }
    } catch {
      setOutcome({ kind: "refused", errorKey: "quizshow:errors.generic" });
    } finally {
      isPairingRef.current = false;
      setIsPairing(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPairingRef.current) return;
    if (!QUIZSHOW_PAIRING_CODE_PATTERN.test(typedCode)) {
      setIsInvalidShown(true);
      return;
    }
    void pair(typedCode);
  };

  const errorKey = isInvalidShown
    ? CODE_INVALID_KEY
    : outcome?.kind === "refused"
      ? outcome.errorKey
      : null;
  const pairedDevice = outcome?.kind === "paired" ? outcome.device : null;

  return (
    <form className={styles.pairForm} onSubmit={submit} noValidate>
      <div className={remoteStyles.field}>
        <label htmlFor={inputId} className={remoteStyles.label}>
          {t("quizshow:remote.pair.codeLabel")}
        </label>
        <input
          id={inputId}
          className={`${remoteStyles.input} ${styles.codeInput}`}
          value={typedCode}
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          // Room for a pasted "23 45 67": onChange keeps the digits alone.
          maxLength={PAIRING_INPUT_MAX_LENGTH}
          aria-invalid={isInvalidShown}
          aria-describedby={isInvalidShown ? invalidId : undefined}
          onChange={(event) => {
            setTypedCode(digitsOfTypedCode(event.target.value));
            setIsInvalidShown(false);
          }}
        />
      </div>
      <Button type="submit" variant="stage" size="md" aria-disabled={isPairing}>
        {t("quizshow:remote.pair.submit")}
      </Button>
      <div id={invalidId} className={remoteStyles.formError}>
        <QuizshowRemoteErrorLine errorKey={errorKey} />
      </div>
      <div role="status" className={remoteStyles.formError}>
        <Collapse isOpen={pairedDevice !== null}>
          <p className={styles.pairedLine}>
            {pairedDevice !== null && <PairedLine device={pairedDevice} />}
          </p>
        </Collapse>
      </div>
    </form>
  );
}

/**
 * Pair a device and the paired devices (C6.5, item 9): the form folds behind
 * its title, closed by default; the list shows once a device is paired. The
 * console mounts this only on the host's own remote in live mode: demo has
 * no pairing, and a helper cannot pair or unpair.
 */
export function QuizshowRemotePairing({
  controller,
  session,
}: {
  controller: QuizshowSessionController;
  session: QuizshowHostState;
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const titleId = useId();
  const toggleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const devices = session.pairedDevices;
  // After an unpair, focus lands on this toggle: it stays mounted when the list empties.
  const focusToggle = useCallback(() => {
    document.getElementById(toggleId)?.focus();
  }, [toggleId]);

  return (
    <div className={styles.stack}>
      <section className={remoteStyles.section} aria-labelledby={titleId}>
        <Button
          id={toggleId}
          variant="stage-ghost"
          size="md"
          className={rescoreStyles.disclosure}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          <span id={titleId}>{t("quizshow:remote.pair.title")}</span>
          <FiChevronDown
            aria-hidden="true"
            fill="none"
            className={rescoreStyles.disclosureIcon}
            data-is-open={isOpen}
          />
        </Button>
        <div id={panelId}>
          <Collapse isOpen={isOpen}>
            <div className={styles.pairBody}>
              <p className={remoteStyles.hint}>
                {t("quizshow:remote.pair.hint")}
              </p>
              <PairForm controller={controller} session={session} />
            </div>
          </Collapse>
        </div>
      </section>
      <Collapse isOpen={devices.length > 0}>
        <QuizshowRemoteDevices
          controller={controller}
          devices={devices}
          onUnpaired={focusToggle}
        />
      </Collapse>
    </div>
  );
}
