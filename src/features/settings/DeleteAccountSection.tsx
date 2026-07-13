import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FiPause } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { logError } from "../../shared/observability/logger";
import { DELETE_CONTENT, type DeleteOption } from "./deleteAccount.data";
import { DestructiveActionFlow } from "./DestructiveActionFlow";
import { DESTRUCTIVE_FLOW } from "./destructiveFlows.data";
import {
  DeleteOptionCards,
  DeletePendingBanner,
} from "./DeleteAccountSections";
import type { DeletionRequest } from "./api/account.api";
import {
  useCancelDeletion,
  useDeactivate,
  useGetDeletionRequest,
  useReauth,
  useRequestDeletion,
} from "./api/useAccountMutations";
import styles from "./DeleteAccountPage.module.css";

export function DeleteAccountSection() {
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const reauth = useReauth();
  const requestDeletion = useRequestDeletion();
  const deactivate = useDeactivate();
  const cancelDeletion = useCancelDeletion();
  const getDeletion = useGetDeletionRequest();

  const [opt, setOpt] = useState<DeleteOption>("deactivate");
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const [flowOpen, setFlowOpen] = useState(false);
  const [pending, setPending] = useState<DeletionRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const content = DELETE_CONTENT[opt];
  const phraseMatch = content.phrase ? phrase === content.phrase : true;
  const canSubmit = password.length >= 1 && phraseMatch;

  // On mount, surface any already-pending deletion request instead of the form.
  useEffect(() => {
    let active = true;
    getDeletion()
      .then((req) => active && setPending(req))
      .catch((err) =>
        logError(err, { where: "DeleteAccountSection.getDeletion" }),
      );
    return () => {
      active = false;
    };
  }, [getDeletion]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFlowOpen(true);
  }

  // Re-auth with the collected password, then run the chosen destructive action.
  const runAction = useCallback(async () => {
    const { reauthToken } = await reauth(password);
    if (opt === "delete") {
      const req = await requestDeletion(reauthToken);
      setPending(req);
    } else {
      await deactivate(reauthToken);
    }
  }, [reauth, password, opt, requestDeletion, deactivate]);

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelDeletion();
      setPending(null);
      showToast("Deletion cancelled — welcome back.", "success");
    } catch (err) {
      logError(err, { where: "DeleteAccountSection.cancel" });
      showToast("We couldn't cancel that just now. Try again.", "error");
    } finally {
      setCancelling(false);
    }
  }

  if (pending && pending.status !== "erased") {
    return (
      <>
        <h1 className={styles.pageTitle}>
          Deletion <em>scheduled.</em>
        </h1>
        <p className={styles.pageSub}>
          You asked us to delete your account. Here's where that stands.
        </p>
        <DeletePendingBanner
          request={pending}
          onCancel={handleCancel}
          cancelling={cancelling}
        />
      </>
    );
  }

  return (
    <>
      <h1 className={styles.pageTitle}>
        Leaving <em>QueerPulse?</em>
      </h1>
      <p className={styles.pageSub}>
        We're sorry to see you go. Before you decide, choose the option that
        fits your situation.
      </p>

      <DeleteOptionCards opt={opt} setOpt={setOpt} />

      {opt === "deactivate" && (
        <div className={styles.pauseStrip}>
          <svg className={styles.pauseStripIcon} viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
            <polyline points="10,5 10,10 13,13" />
          </svg>
          <div>
            <p className={styles.pauseStripText}>
              Not sure? Consider <strong>pausing notifications</strong> for a
              month instead. You stay a member without the noise.
            </p>
            <Button
              variant="ghost"
              onClick={() =>
                showToast(
                  "All email notifications paused for 30 days.",
                  "success",
                )
              }
              style={{ marginTop: 12 }}
            >
              <FiPause aria-hidden="true" /> Turn off all emails and digests
            </Button>
          </div>
        </div>
      )}

      <div className={styles.whatHappens}>
        <div className={styles.whTitle}>What happens when you {opt}</div>
        <div className={styles.whList}>
          {content.wh.map((item, i) => (
            <div key={i} className={styles.whRow}>
              <div className={styles.whDot} style={{ background: item.col }} />
              <div className={styles.whText}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      <form className={styles.confirmForm} onSubmit={handleSubmit}>
        <div>
          <div className={styles.cfLabel}>Confirm with your password</div>
          <input
            className={styles.cfInput}
            type="password"
            placeholder="Your current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {content.phrase && (
          <div>
            <div className={styles.cfLabel}>
              Type{" "}
              <strong className={styles.confirmPhrase}>
                "{content.phrase}"
              </strong>{" "}
              to confirm
            </div>
            <input
              className={`${styles.cfInput} ${styles.cfInputDanger}`}
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
            />
            <div className={styles.cfHint}>
              This action is permanent and cannot be reversed.
            </div>
          </div>
        )}
        <div className={styles.formActions}>
          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            className={content.isDanger ? styles.btnDanger : undefined}
          >
            {content.btnLabel}
          </Button>
          <Button variant="ghost" to={routes.settings}>
            Cancel
          </Button>
        </div>
      </form>

      {flowOpen && (
        <DestructiveActionFlow
          content={DESTRUCTIVE_FLOW[opt]}
          action={runAction}
          onDone={signOut}
          onClose={() => setFlowOpen(false)}
        />
      )}
    </>
  );
}
