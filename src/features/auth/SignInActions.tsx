import { FiUserPlus } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PlatformClosedNotice } from "./PlatformClosedNotice";
import { SignInNotice } from "./SignInNotice";
import type { SignInFlow } from "./useSignInFlow";
import styles from "./auth.module.css";

/** The notices and the Google button, in that order, all driven by the one
 *  sign-in flow. */
export function SignInActions({ flow }: { flow: SignInFlow }) {
  const { t } = useTranslation();
  const { busy, notice, showSupportLink, registrationClosed, platformStatus } =
    flow;
  return (
    <>
      {notice && (
        <SignInNotice notice={notice} showSupportLink={showSupportLink} />
      )}

      {registrationClosed && (
        <PlatformClosedNotice
          icon={FiUserPlus}
          title={t("auth:signIn.closed.title")}
          body={
            platformStatus?.registrationClosedMessage ||
            t("auth:signIn.closed.body")
          }
        />
      )}

      {/* Google requires its sign-in button to keep its own mandated shape and
          brand mark, so this stays a bare <button> with the `.google` treatment
          rather than the shared pill <Button>. `.google:disabled` mirrors
          Button's dimmed + not-allowed disabled styling so the busy state reads
          the same as every other CTA; focus comes from the global ring. */}
      <button
        type="button"
        className={styles.google}
        onClick={() => void flow.attemptSignIn()}
        disabled={busy}
        aria-busy={busy}
      >
        {/* DES-170: the official multicolour Google "G" from react-icons,
            replacing a hand-inlined copy of the same four paths. Its brand
            colours are baked into the icon, which is what Google's branding
            guidelines require and what no design token could supply. Sized by
            `.google svg` in the module. */}
        <FcGoogle aria-hidden />
        {busy ? t("auth:signIn.connecting") : t("auth:signIn.googleCta")}
      </button>
    </>
  );
}
