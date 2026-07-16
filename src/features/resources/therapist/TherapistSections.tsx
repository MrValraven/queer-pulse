import { useState } from "react";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Therapist } from "../mentalHealth.data";
import {
  possessiveKey,
  shortName,
  type TherapistProfile,
  type VouchTint,
} from "./therapistProfiles.data";
import { AddVouchModal } from "./AddVouchModal";
import styles from "./TherapistProfilePage.module.css";

const AV_TINT: Record<VouchTint, string | undefined> = {
  jade: styles.avJade,
  coral: styles.avCoral,
  plum: styles.avPlum,
};

export function TherapistSections({
  therapist,
  profile,
}: {
  therapist: Therapist;
  profile: TherapistProfile;
}) {
  const { t } = useTranslation();
  const [vouching, setVouching] = useState(false);
  const short = shortName(therapist.name);

  return (
    <main>
      <section className={styles.sec}>
        <h2 className={styles.secTitle}>
          <Translation
            i18nKey="resources:therapistProfilePage.worksWith.title"
            components={{ em: <em /> }}
            values={{ name: short }}
          />
        </h2>
        <p className={styles.secSub}>
          {t("resources:therapistProfilePage.worksWith.sub")}
        </p>
        <div className={styles.specGrid}>
          {profile.specialisms.map((s) => (
            <div className={styles.spec} key={s.title}>
              <div className={styles.specIc}>{s.initial}</div>
              <div className={styles.specText}>
                <b>{s.title}</b>
                <span>{s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <h2 className={styles.secTitle}>
          {t(
            `resources:therapistProfilePage.approachTitle.${possessiveKey(therapist.pronouns)}`,
          )}
        </h2>
        <div className={styles.approach}>
          <h3 className={styles.approachTitle}>
            {profile.approach.titlePlain} <em>{profile.approach.titleEm}</em>
          </h3>
          {profile.approach.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <h2 className={styles.secTitle}>
          <Translation
            i18nKey="resources:therapistProfilePage.vouches.title"
            components={{ em: <em /> }}
            values={{ count: profile.vouches.length }}
          />
        </h2>
        <p className={styles.secSub}>
          {t("resources:therapistProfilePage.vouches.sub")}
        </p>
        <div className={styles.vouchRow}>
          {profile.vouches.map((v) => (
            <div className={styles.vouch} key={v.initials}>
              <div className={styles.vouchHead}>
                <div className={`${styles.vouchAv} ${AV_TINT[v.tint]}`}>
                  {v.initials}
                </div>
                <div>
                  <div className={styles.vouchName}>{v.name}</div>
                  <div className={styles.vouchByline}>{v.byline}</div>
                </div>
              </div>
              <div className={styles.vouchText}>{v.text}</div>
              <div className={styles.vouchWhen}>{v.when}</div>
            </div>
          ))}
          <div className={`${styles.vouch} ${styles.vouchAdd}`}>
            <div className={styles.vouchHead}>
              <div className={styles.vouchAv}>+</div>
              <div>
                <div className={styles.vouchName}>
                  {t("resources:therapistProfilePage.vouches.addPrompt", {
                    name: short,
                  })}
                </div>
                <div className={styles.vouchByline}>
                  {t("resources:therapistProfilePage.vouches.addHelp")}
                </div>
              </div>
            </div>
            <button
              type="button"
              className={styles.vouchLink}
              onClick={() => setVouching(true)}
            >
              {t("resources:therapistProfilePage.vouches.addCta")}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.sec}>
        <h2 className={styles.secTitle}>
          <Translation
            i18nKey="resources:therapistProfilePage.beforeBook.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.noteGrid}>
          {profile.notes.map((n) => (
            <div className={styles.note} key={n.title}>
              <h4>{n.title}</h4>
              <p>{n.text}</p>
            </div>
          ))}
        </div>
      </section>

      {vouching && (
        <AddVouchModal
          therapistShort={short}
          onClose={() => setVouching(false)}
        />
      )}
    </main>
  );
}
