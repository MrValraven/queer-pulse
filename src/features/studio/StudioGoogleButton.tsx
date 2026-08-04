import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./StudioSignInPage.module.css";

/**
 * "Continue with Google" affordance for the Studio sign-in flow — divider +
 * button. Self-contained: owns its own loading state and the post-toast redirect
 * timer so it can't fire navigate() after the page unmounts. This is still a
 * prototype stub (no real OAuth round-trip yet), matching the rest of the pane.
 */
export function StudioGoogleButton() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(redirectTimerRef.current), []);

  function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    redirectTimerRef.current = setTimeout(() => {
      showToast(t("studio:signin.in.signedInGoogleToast"), "success");
      void navigate(routes.studio);
    }, 1100);
  }

  return (
    <>
      <div className={styles.divider}>{t("studio:signin.orDivider")}</div>
      <button
        type="button"
        className={styles.btnGoogle}
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <span className={styles.gSpinner} aria-hidden />
        ) : (
          <svg width={17} height={17} viewBox="0 0 18 18" aria-hidden>
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
        )}
        {googleLoading
          ? t("studio:signin.googleLoading")
          : t("studio:signin.googleContinue")}
      </button>
    </>
  );
}
