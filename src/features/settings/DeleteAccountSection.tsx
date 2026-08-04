import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { FiPause } from "react-icons/fi";
import { Button, ComingSoon } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logError } from "../../shared/observability/logger";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DELETE_CONTENT, type DeleteOption } from "./deleteAccount.data";
import { DestructiveActionFlow } from "./DestructiveActionFlow";
import { buildDestructiveFlow } from "./destructiveFlows.data";
import {
  DeleteConfirmForm,
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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const { demoMode } = useDemoMode();
  const reauth = useReauth();
  const requestDeletion = useRequestDeletion();
  const deactivate = useDeactivate();
  const cancelDeletion = useCancelDeletion();
  const getDeletion = useGetDeletionRequest();

  const [option, setOption] = useState<DeleteOption>("deactivate");
  const [phrase, setPhrase] = useState("");
  const [flowOpen, setFlowOpen] = useState(false);
  const [pending, setPending] = useState<DeletionRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const content = DELETE_CONTENT[option];
  const confirmPhrase = content.phraseKey ? t(content.phraseKey) : null;
  const phraseMatch = confirmPhrase ? phrase === confirmPhrase : true;
  const canSubmit = phraseMatch;
  const destructiveFlow = useMemo(() => buildDestructiveFlow(t), [t]);

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

  // Mint the step-up token, then run the chosen destructive action.
  //
  // No password is collected or sent. `POST /account/reauth` takes no
  // credential to check — auth is OAuth-only, so the backend has nothing to
  // verify a password against and its `ReauthDto` explicitly tolerates and
  // ignores the field (`account.service.ts: reauth(userId)`). The confirmation
  // that gates this form is the typed phrase below, which is a real, checked
  // gate; a password box that the server discards only looked like one.
  const runAction = useCallback(async () => {
    const { reauthToken } = await reauth();
    if (option === "delete") {
      const req = await requestDeletion(reauthToken);
      setPending(req);
    } else {
      await deactivate(reauthToken);
    }
  }, [reauth, option, requestDeletion, deactivate]);

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelDeletion();
      setPending(null);
      showToast(t("settings:deleteAccount.toast.cancelled"), "success");
    } catch (err) {
      logError(err, { where: "DeleteAccountSection.cancel" });
      showToast(t("settings:deleteAccount.toast.cancelError"), "error");
    } finally {
      setCancelling(false);
    }
  }

  if (pending && pending.status !== "erased") {
    return (
      <>
        <h1 className={styles.pageTitle}>
          <Translation
            i18nKey="settings:deleteAccount.pending.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.pageSub}>
          {t("settings:deleteAccount.pending.sub")}
        </p>
        <DeletePendingBanner
          request={pending}
          onCancel={() => void handleCancel()}
          cancelling={cancelling}
        />
      </>
    );
  }

  return (
    <>
      <h1 className={styles.pageTitle}>
        <Translation
          i18nKey="settings:deleteAccount.page.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.pageSub}>{t("settings:deleteAccount.page.sub")}</p>

      <DeleteOptionCards option={option} setOption={setOption} />

      {option === "deactivate" && (
        <div className={styles.pauseStrip}>
          <svg className={styles.pauseStripIcon} viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
            <polyline points="10,5 10,10 13,13" />
          </svg>
          <div>
            <p className={styles.pauseStripText}>
              <Translation
                i18nKey="settings:deleteAccount.pauseStrip.text"
                components={{ strong: <strong /> }}
              />
            </p>
            {/* Email delivery has no backend yet (the Notifications pane marks
                the same controls "coming soon"). Demo keeps the prototype
                confirmation; live must not claim a save nothing performs. */}
            {demoMode ? (
              <Button
                variant="ghost"
                onClick={() =>
                  showToast(
                    t("settings:deleteAccount.toast.pausedEmails"),
                    "success",
                  )
                }
                style={{ marginTop: 12 }}
              >
                <FiPause aria-hidden="true" />{" "}
                {t("settings:deleteAccount.pauseStrip.cta")}
              </Button>
            ) : (
              <Button
                variant="ghost"
                disabled
                style={{ marginTop: 12 }}
              >
                <FiPause aria-hidden="true" />{" "}
                {t("settings:deleteAccount.pauseStrip.cta")} <ComingSoon />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={styles.whatHappens}>
        <div className={styles.whTitle}>
          {t(`settings:deleteAccount.whatHappens.title.${option}`)}
        </div>
        <div className={styles.whList}>
          {content.whatHappens.map((item, i) => (
            <div key={i} className={styles.whRow}>
              <div className={styles.whDot} style={{ background: item.color }} />
              <div className={styles.whText}>
                <Translation
                  i18nKey={item.textKey}
                  components={{ strong: <strong /> }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeleteConfirmForm
        content={content}
        phrase={phrase}
        setPhrase={setPhrase}
        confirmPhrase={confirmPhrase}
        canSubmit={canSubmit}
        onSubmit={handleSubmit}
      />

      {flowOpen && (
        <DestructiveActionFlow
          content={destructiveFlow[option]}
          action={runAction}
          onDone={signOut}
          onClose={() => setFlowOpen(false)}
        />
      )}
    </>
  );
}
