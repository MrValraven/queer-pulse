import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAcceptInvite } from "./api/useAcceptInvite";
import { consumePendingInvite, readInviteWelcome } from "./api/pendingInvite";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { AuthLayout } from "./AuthLayout";
import {
  FALLBACK_INVITER,
  PW_MIN,
  passwordScore,
  type Visibility,
} from "./createAccount.data";
import { AccountFields, type Touched } from "./CreateAccountFields";
import { AboutAndVisibility } from "./CreateAccountAbout";
import styles from "./auth.module.css";

export function CreateAccountPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const acceptInvite = useAcceptInvite();
  // Who invited them, stashed by the invite landing — falls back to the mock.
  const [welcome] = useState(readInviteWelcome);
  const inviter = welcome?.inviter ?? FALLBACK_INVITER;
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("open");
  const [touched, setTouched] = useState<Touched>({
    first: false,
    last: false,
    password: false,
    confirm: false,
  });

  const score = useMemo(() => passwordScore(password), [password]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Touched, string>> = {};
    if (!first.trim()) e.first = "First name is required.";
    if (!last.trim()) e.last = "Last name is required.";
    if (!password) e.password = "Choose a password.";
    else if (password.length < PW_MIN)
      e.password = `Use at least ${PW_MIN} characters.`;
    if (!confirm) e.confirm = "Re-enter your password.";
    else if (confirm !== password) e.confirm = "Passwords don't match.";
    return e;
  }, [first, last, password, confirm]);

  const isValid = Object.keys(errors).length === 0;
  const touch = (key: keyof Touched) =>
    setTouched((t) => ({ ...t, [key]: true }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid) {
      setTouched({ first: true, last: true, password: true, confirm: true });
      return;
    }
    // Account created — redeem the invite that brought them here (if any) before
    // onboarding, promoting them to an active member. Best-effort in this prototype.
    const code = consumePendingInvite();
    if (code) {
      try {
        await acceptInvite.mutateAsync(code);
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Could not redeem this invite",
          "error",
        );
      }
    }
    navigate(routes.onboarding);
  }

  return (
    <AuthLayout wide>
      <div className={styles.vouchRow}>
        <div className={styles.vouchAv} aria-hidden>
          {inviter.photo ? (
            <img
              src={resolveAvatarSrc(inviter.photo)}
              alt=""
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            inviter.initials
          )}
        </div>
        <div className={styles.vouchText}>
          <strong>{inviter.name}</strong> invited you to QueerPulse
        </div>
      </div>

      <div className={styles.eyebrow}>Create your account</div>
      <h1>
        Welcome to the <em>community</em>
      </h1>
      <p className={styles.requiredLegend}>
        Fields marked <span className={styles.req}>*</span> are required.
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 20 }}>
        <AccountFields
          first={first}
          setFirst={setFirst}
          last={last}
          setLast={setLast}
          password={password}
          setPassword={setPassword}
          confirm={confirm}
          setConfirm={setConfirm}
          score={score}
          touched={touched}
          touch={touch}
          errors={errors}
        />

        <AboutAndVisibility
          pronouns={pronouns}
          setPronouns={setPronouns}
          bio={bio}
          setBio={setBio}
          visibility={visibility}
          setVisibility={setVisibility}
        />

        <Button
          type="submit"
          className={styles.authBtn}
          disabled={!isValid}
          aria-disabled={!isValid}
        >
          Create account
        </Button>
        <div className={styles.legalNote}>
          By creating an account you agree to our{" "}
          <Link to={routes.terms}>Terms of Use</Link> and{" "}
          <Link to={routes.privacy}>Privacy Policy</Link>
        </div>
        <div className={styles.signinLink}>
          Already have an account? <Link to={routes.signIn}>Sign in →</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
