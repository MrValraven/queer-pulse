import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { INVOLVEMENT } from "./joinModal.data";
import type { JoinModalCommunity } from "./JoinModal";
import styles from "./JoinModal.module.css";

export function JoinStepIntro({
  community,
  isRequest,
  isInvite,
  inviteCode,
  setInviteCode,
  onNext,
}: {
  community: JoinModalCommunity;
  isRequest: boolean;
  isInvite: boolean;
  inviteCode: string;
  setInviteCode: (v: string) => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.eye}>
        {isRequest
          ? t("communities:join.intro.eyebrow.request")
          : isInvite
            ? t("communities:join.intro.eyebrow.invite")
            : t("communities:join.intro.eyebrow.public")}
      </div>
      <div className={styles.title}>{community.name}</div>
      <div className={styles.meta}>
        {community.typeLabel} · {community.count}
      </div>
      <p className={styles.desc}>{community.description}</p>
      {community.tags && community.tags.length > 0 && (
        <div className={styles.tags}>
          {community.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
      {isInvite && (
        <div className={styles.fields}>
          <input
            className={styles.input}
            type="text"
            placeholder={t("communities:join.intro.invitePlaceholder")}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </div>
      )}
      <Button
        variant="primary"
        onClick={onNext}
        disabled={isInvite && !inviteCode.trim()}
      >
        {isInvite
          ? t("communities:join.intro.verifyCta")
          : t("communities:join.intro.continueCta")}
      </Button>
    </div>
  );
}

export function JoinStepAbout({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.eye}>{t("communities:join.about.eyebrow")}</div>
      <div className={styles.title}>{t("communities:join.about.title")}</div>
      <p className={styles.hint}>{t("communities:join.about.hint")}</p>
      <div className={styles.fields}>
        <input
          className={styles.input}
          type="text"
          placeholder={t("communities:join.about.namePlaceholder")}
        />
        <input
          className={styles.input}
          type="text"
          placeholder={t("communities:join.about.pronounsPlaceholder")}
        />
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder={t("communities:join.about.aboutPlaceholder")}
        />
      </div>
      <Button variant="primary" onClick={onNext}>
        {t("communities:join.intro.continueCta")}
      </Button>
    </div>
  );
}

export function JoinStepInvolvement({
  isRequest,
  involvement,
  setInvolvement,
  onSubmit,
}: {
  isRequest: boolean;
  involvement: string;
  setInvolvement: (v: string) => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.eye}>
        {t("communities:join.involvement.eyebrow")}
      </div>
      <div className={styles.title}>
        {t("communities:join.involvement.title")}
      </div>
      <div className={styles.fields}>
        <input
          className={styles.input}
          type="email"
          placeholder={t("communities:join.involvement.emailPlaceholder")}
        />
        <div>
          <div className={styles.invLabel}>
            {t("communities:join.involvement.levelLabel")}
          </div>
          <div className={styles.opts}>
            {INVOLVEMENT.map((o) => (
              <label
                key={o.value}
                className={[
                  styles.opt,
                  involvement === o.value && styles.optChecked,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="involvement"
                  aria-label={t(o.labelKey)}
                  value={o.value}
                  checked={involvement === o.value}
                  onChange={() => setInvolvement(o.value)}
                />
                <div>
                  <span>{t(o.labelKey)}</span>
                  <small>{t(o.descriptionKey)}</small>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      <Button variant="primary" onClick={onSubmit}>
        {isRequest
          ? t("communities:join.involvement.sendRequestCta")
          : t("communities:join.involvement.joinCta")}
      </Button>
    </div>
  );
}

export function JoinStepDone({
  community,
  isRequest,
  onClose,
}: {
  community: JoinModalCommunity;
  isRequest: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.successIcon}>
        <svg viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className={styles.title}>
        {isRequest
          ? t("communities:join.done.requestTitle")
          : t("communities:join.done.welcomeTitle", { name: community.name })}
      </div>
      <p className={styles.desc}>
        {isRequest ? (
          <Translation
            i18nKey="communities:join.done.requestBody"
            components={{ strong: <strong /> }}
            values={{ name: community.name }}
          />
        ) : (
          <Translation
            i18nKey="communities:join.done.joinedBody"
            components={{ strong: <strong /> }}
            values={{ name: community.name }}
          />
        )}
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          {t("communities:join.done.doneCta")}
        </Button>
      </div>
    </div>
  );
}
