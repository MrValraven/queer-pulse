import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, FormField } from "../../shared/components/ui";
import { getMember } from "../members/data/members";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAcceptInvite } from "./api/useAcceptInvite";
import { consumePendingInvite, readInviteWelcome } from "./api/pendingInvite";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { AuthLayout } from "./AuthLayout";
import styles from "./auth.module.css";

const INVITER = getMember("ines")!;
const INVITER_NAME = `${INVITER.first} ${INVITER.last}`;
/** The mock inviter, shown when the page is reached without an invite in flight. */
const FALLBACK_INVITER = {
  name: INVITER_NAME,
  initials: INVITER.initials,
  photo: INVITER.photo,
};

type Visibility = "open" | "network" | "private";
const PRONOUNS = ["he/him", "she/her", "they/them", "she/they", "he/they"];

const STRENGTH_LABELS = [
  "At least 10 characters",
  "Weak",
  "Fair",
  "Good",
  "Strong",
];
const STRENGTH_COLORS = [
  "var(--ink-40)",
  "var(--accent-ink)",
  "var(--amber)",
  "var(--jade)",
  "var(--jade)",
];
const PW_MIN = 10;

function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 10) score++;
  if (value.length >= 14) score++;
  if (/[0-9]/.test(value) || /[^a-zA-Z0-9]/.test(value)) score++;
  if (value.length >= 18) score++;
  return Math.min(score, 4);
}

type Touched = {
  first: boolean;
  last: boolean;
  password: boolean;
  confirm: boolean;
};

interface AboutProps {
  pronouns: string;
  setPronouns: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  visibility: Visibility;
  setVisibility: (v: Visibility) => void;
}

const VIS_OPTS = [
  {
    value: "open",
    label: "Visible to all members",
    sub: "Your profile appears in the member directory",
  },
  {
    value: "network",
    label: "Visible to connections only",
    sub: "Only people you've connected with can see your full profile",
  },
  {
    value: "private",
    label: "Private",
    sub: "Your profile is hidden; you can still browse and join gatherings",
  },
] as const;

function AboutAndVisibility({
  pronouns,
  setPronouns,
  bio,
  setBio,
  visibility,
  setVisibility,
}: AboutProps) {
  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>About you</div>
        <FormField
          label="Display name"
          helper="What members see. Can differ from your legal name."
        >
          <input type="text" placeholder="Tiago C." />
        </FormField>
        <div className={styles.field}>
          <label>Pronouns</label>
          <input
            type="text"
            placeholder="e.g. she/her"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
          />
          <div className={styles.pronounChips}>
            {PRONOUNS.map((p) => (
              <button
                key={p}
                type="button"
                className={styles.pChip}
                onClick={() => setPronouns(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <FormField label="Location">
          <input type="text" placeholder="Lisbon, Portugal" />
        </FormField>
        <FormField label="Short bio" labelAside={`${bio.length}/280`}>
          <textarea
            maxLength={280}
            placeholder="A sentence or two about you…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </FormField>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Visibility</div>
        <div className={styles.visOpts}>
          {VIS_OPTS.map((opt) => (
            <label
              key={opt.value}
              className={[
                styles.visOpt,
                visibility === opt.value && styles.visOptSelected,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                name="vis"
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
              />
              <div className={styles.visOptText}>
                <span>{opt.label}</span>
                <small>{opt.sub}</small>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

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
    navigate("/onboarding");
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
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Your account</div>
          <div className={styles.twoCol}>
            <FormField
              label="First name"
              required
              error={touched.first ? errors.first : undefined}
            >
              <input
                type="text"
                placeholder="Tiago"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                onBlur={() => touch("first")}
                aria-invalid={touched.first && !!errors.first}
              />
            </FormField>
            <FormField
              label="Last name"
              required
              error={touched.last ? errors.last : undefined}
            >
              <input
                type="text"
                placeholder="Costa"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                onBlur={() => touch("last")}
                aria-invalid={touched.last && !!errors.last}
              />
            </FormField>
          </div>
          <FormField
            label="Email address"
            helper="Taken from your invite — not editable"
          >
            <input type="email" value="tiago@gmail.com" disabled />
          </FormField>
          <div className={styles.field}>
            <label>
              Password <span className={styles.req}>*</span>
            </label>
            <input
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch("password")}
              aria-invalid={touched.password && !!errors.password}
            />
            <div className={styles.strengthBar}>
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className={styles.strengthSeg}
                  style={{
                    background:
                      seg <= score ? STRENGTH_COLORS[score] : undefined,
                  }}
                />
              ))}
            </div>
            {touched.password && errors.password ? (
              <div className={styles.fieldError}>{errors.password}</div>
            ) : (
              <div
                className={styles.strengthLabel}
                style={{ color: STRENGTH_COLORS[score] }}
              >
                {STRENGTH_LABELS[score]}
              </div>
            )}
            <div className={styles.helper}>
              At least {PW_MIN} characters. Add numbers or symbols for a
              stronger password.
            </div>
          </div>
          <FormField
            label="Confirm password"
            required
            error={touched.confirm ? errors.confirm : undefined}
            ok={
              touched.confirm && !errors.confirm && confirm
                ? "Passwords match."
                : undefined
            }
          >
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => touch("confirm")}
              aria-invalid={touched.confirm && !!errors.confirm}
            />
          </FormField>
        </div>

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
