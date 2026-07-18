import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { consumePendingInvite, readInviteWelcome } from "./api/pendingInvite";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { AuthLayout } from "./AuthLayout";
import { FALLBACK_INVITER, type Visibility } from "./createAccount.data";
import { AccountFields, type Touched } from "./CreateAccountFields";
import { AboutAndVisibility } from "./CreateAccountAbout";
import styles from "./auth.module.css";

/** Field-level validation copy — warm and specific, never a bare "invalid". */
function buildErrors(
  t: TFunction,
  first: string,
  last: string,
): Partial<Record<"first" | "last", string>> {
  const e: Partial<Record<"first" | "last", string>> = {};
  if (!first.trim()) e.first = t("auth:createAccount.error.firstRequired");
  if (!last.trim()) e.last = t("auth:createAccount.error.lastRequired");
  return e;
}

export function CreateAccountPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Who invited them, stashed by the invite landing — falls back to the mock.
  const [welcome] = useState(readInviteWelcome);
  const inviter = welcome?.inviter ?? FALLBACK_INVITER;
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("open");
  const [touched, setTouched] = useState<Touched>({
    first: false,
    last: false,
  });

  const errors = useMemo(() => buildErrors(t, first, last), [t, first, last]);

  const isValid = Object.keys(errors).length === 0;
  const touch = (key: keyof Touched) =>
    setTouched((t) => ({ ...t, [key]: true }));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid) {
      setTouched({ first: true, last: true });
      return;
    }
    // This page is a prototype surface: the real live-mode journey is
    // /invite/:code → Google → /onboarding, and the invite is redeemed during
    // sign-up. It used to POST /invites/:code/accept here, which is now a
    // removed route (see invite.api.ts) — so that call was a live 404 redeeming
    // an invite sign-up had already consumed. Clear the stashed code so it
    // can't leak into a later flow, and move on.
    consumePendingInvite();
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
          <Translation
            i18nKey="auth:createAccount.vouchText"
            components={{ strong: <strong /> }}
            values={{ name: inviter.name }}
          />
        </div>
      </div>

      <div className={styles.eyebrow}>{t("auth:createAccount.eyebrow")}</div>
      <h1>
        <Translation
          i18nKey="auth:createAccount.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.requiredLegend}>
        <Translation
          i18nKey="auth:createAccount.requiredLegend"
          components={{ req: <span className={styles.req} /> }}
        />
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 20 }}>
        <AccountFields
          first={first}
          setFirst={setFirst}
          last={last}
          setLast={setLast}
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
          {t("auth:createAccount.submit")}
        </Button>
        <div className={styles.legalNote}>
          <Translation
            i18nKey="auth:createAccount.legalNote"
            components={{
              eligibility: <Link to={`${routes.terms}#eligibility`} />,
              terms: <Link to={routes.terms} />,
              privacy: <Link to={routes.privacy} />,
            }}
          />
        </div>
        <div className={styles.signinLink}>
          <Translation
            i18nKey="auth:createAccount.signinPrompt"
            components={{ signin: <Link to={routes.signIn} /> }}
          />
        </div>
      </form>
    </AuthLayout>
  );
}
