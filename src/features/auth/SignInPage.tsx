import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, FormField } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { AuthLayout } from "./AuthLayout";
import styles from "./auth.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function continueWithGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    setTimeout(() => {
      signIn("/feed");
      navigate("/feed");
    }, 1100);
  }

  const emailValid = EMAIL_RE.test(email.trim());
  const emailError = touched && email.trim().length > 0 && !emailValid;
  const canSubmit = emailValid && password.length > 0;

  return (
    <AuthLayout>
      <h1>
        Welcome <em>back.</em>
      </h1>
      <p className={styles.sub}>Sign in to your QueerPulse account.</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) {
            signIn("/feed");
            navigate("/feed");
          }
        }}
      >
        <FormField
          label="Email"
          error={emailError ? "Please enter a valid email address." : undefined}
        >
          <input
            id="si-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={emailError}
          />
        </FormField>

        <FormField label="Password" className={styles.pwField}>
          <input
            id="si-pw"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingRight: 48 }}
          />
          <button
            type="button"
            className={styles.pwToggle}
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx={12} cy={12} r={3} />
            </svg>
          </button>
        </FormField>

        <Button type="submit" className={styles.authBtn} disabled={!canSubmit}>
          Sign in →
        </Button>
      </form>

      <div className={styles.footer}>
        <Link to={routes.passwordReset}>Forgot password?</Link>
        <Link to={routes.requestInvite} className="invite">
          Not a member yet? Request an invite
        </Link>
      </div>

      <div className={styles.divider}>or</div>

      <button
        className={styles.google}
        onClick={continueWithGoogle}
        disabled={googleLoading}
      >
        <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden>
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
        {googleLoading ? "Connecting…" : "Continue with Google"}
      </button>
    </AuthLayout>
  );
}
