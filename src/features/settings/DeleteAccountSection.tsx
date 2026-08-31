import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { logError } from "../../shared/observability/logger";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAccountDependencies } from "../members/api/useAccountDependencies";
import { AccountDependencyGate } from "./AccountDependencyGate";
import { DELETE_CONTENT, type DeleteOption } from "./deleteAccount.data";
import { DestructiveActionFlow } from "./DestructiveActionFlow";
import { buildDestructiveFlow } from "./destructiveFlows.data";
import {
  DeleteConfirmForm,
  DeleteOptionCards,
  DeletePendingBanner,
  PauseNotificationsStrip,
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

/**
 * THE surface for stepping away from an account, in both its forms: pausing
 * (`POST /account/deactivate`) and erasing (`POST /account/deletion-request`).
 *
 * PRD-09: those two actions used to be built three times over, on this page,
 * on the profile's "Your data" side sheet, and again as the Settings Data
 * pane's own danger-zone flow. The Settings copy is how PRD-01 happened: it
 * mounted the confirm dialog with no request behind it and showed a success
 * panel 1.4 seconds later while `users.status` never changed. Both of the
 * other surfaces now route here instead of re-implementing the confirm and the
 * step-up, so there is one place where an account can actually be switched off
 * and one place to keep honest.
 *
 * `initialOption` is which off-ramp the member asked for on the way in ("Pause
 * my account" versus "Delete permanently"), so arriving from either card lands
 * on the right option already selected. It seeds the choice; the member can
 * still switch.
 *
 * `onOpenNotificationSettings` is supplied only when this renders as the
 * "delete" pane inside SettingsPage, so the pause strip can switch panes in
 * place there. See `PauseNotificationsStrip`.
 */
export function DeleteAccountSection({
  initialOption = "deactivate",
  onOpenNotificationSettings,
}: {
  initialOption?: DeleteOption;
  onOpenNotificationSettings?: () => void;
} = {}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const { getReauthToken, beginReauth } = useReauth();
  const requestDeletion = useRequestDeletion();
  const deactivate = useDeactivate();
  const cancelDeletion = useCancelDeletion();
  const getDeletion = useGetDeletionRequest();

  const [option, setOption] = useState<DeleteOption>(initialOption);
  const [phrase, setPhrase] = useState("");
  const [flowOpen, setFlowOpen] = useState(false);
  const [pending, setPending] = useState<DeletionRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Erasure strands anything only this member can hand over. Fail closed:
  // while the two sources are still resolving, treat erasure as blocked rather
  // than briefly allowing it before the first fetch lands. Pausing is
  // reversible and strands nothing, so it is never blocked.
  const dependencies = useAccountDependencies();
  const isEraseBlocked =
    option === "delete" &&
    (dependencies.isLoading || dependencies.hasDependencies);

  const content = DELETE_CONTENT[option];
  const confirmPhrase = content.phraseKey ? t(content.phraseKey) : null;
  const phraseMatch = confirmPhrase ? phrase === confirmPhrase : true;
  const canSubmit = phraseMatch && !isEraseBlocked;
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

  // Require a fresh step-up token, then run the chosen destructive action.
  //
  // No password is collected or sent — auth is OAuth-only, so there is
  // nothing to verify one against. The real step-up is a Google OAuth round
  // trip (`beginReauth`, see `useReauthToken.ts`): if no fresh token is
  // cached yet, this redirects away instead of proceeding, and the member
  // presses confirm again after landing back. The typed phrase below is a
  // separate, real, checked gate on top of that.
  const runAction = useCallback(async () => {
    const reauthToken = getReauthToken();
    if (!reauthToken) {
      beginReauth();
      return;
    }
    if (option === "delete") {
      const req = await requestDeletion(reauthToken);
      setPending(req);
    } else {
      await deactivate(reauthToken);
    }
  }, [getReauthToken, beginReauth, option, requestDeletion, deactivate]);

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
        <PauseNotificationsStrip
          onOpenNotificationSettings={onOpenNotificationSettings}
        />
      )}

      <div className={styles.whatHappens}>
        <div className={styles.whTitle}>
          {t(`settings:deleteAccount.whatHappens.title.${option}`)}
        </div>
        <div className={styles.whList}>
          {content.whatHappens.map((item, i) => (
            <div key={i} className={styles.whRow}>
              <div
                className={styles.whDot}
                style={{ background: item.color }}
              />
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

      {option === "delete" && (
        <AccountDependencyGate
          communities={dependencies.communities}
          listings={dependencies.listings}
        />
      )}

      <DeleteConfirmForm
        content={content}
        phrase={phrase}
        setPhrase={setPhrase}
        confirmPhrase={confirmPhrase}
        canSubmit={canSubmit}
        onSubmit={handleSubmit}
      />

      {isEraseBlocked && !dependencies.isLoading && (
        <p className={styles.pageSub}>
          {t("members:profile.accountData.stepAway.erase.disabledHint")}
        </p>
      )}

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
