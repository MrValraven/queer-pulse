import type { ReactNode } from "react";
import {
  FiAward,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiGlobe,
  FiHeart,
  FiMapPin,
  FiSliders,
} from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { Therapist } from "./mentalHealth.data";
import styles from "./TherapistProfileModal.module.css";

export function TherapistProfileBody({
  therapist,
  onClose,
}: {
  therapist: Therapist;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const meta: { icon: ReactNode; label: string }[] = [
    { icon: <FiMapPin />, label: therapist.location },
    { icon: <FiClock />, label: therapist.availability },
    { icon: <FiDollarSign />, label: therapist.rate },
    {
      icon: <FiSliders />,
      label: therapist.slidingScale
        ? t("resources:mentalHealth.therapistProfile.meta.slidingScale")
        : t("resources:mentalHealth.therapistProfile.meta.fixedRate"),
    },
    {
      icon: <FiAward />,
      label: t("resources:mentalHealth.therapistProfile.meta.years", {
        count: therapist.years,
      }),
    },
    { icon: <FiGlobe />, label: therapist.langs.join(", ") },
  ];

  return (
    <>
      <div className={styles.head}>
        <Avatar
          initials={therapist.initials}
          size={92}
          src={therapist.photo}
          alt={therapist.name}
          verified
          className={styles.headAv}
        />
        <div className={styles.headBody}>
          <div className={styles.nameRow}>
            <h2 className={styles.name}>{therapist.name}</h2>
            <span className={styles.pronouns}>{therapist.pronouns}</span>
          </div>
          <div className={styles.creds}>{therapist.creds}</div>
          <div className={styles.reg}>
            <FiCheck aria-hidden /> {therapist.registration}
          </div>
          <span
            className={`${styles.status} ${
              therapist.acceptingNew ? styles.statusOpen : styles.statusFull
            }`}
          >
            <span className={styles.statusDot} />
            {therapist.acceptingNew
              ? t("resources:mentalHealth.therapistProfile.status.acceptingNew")
              : t("resources:mentalHealth.therapistProfile.status.waitlistOnly")}
          </span>
        </div>
      </div>

      <div className={styles.tags}>
        {therapist.specs.map((s) => (
          <span key={s} className={styles.tag}>
            {s}
          </span>
        ))}
      </div>

      <div className={styles.metaGrid}>
        {meta.map((m) => (
          <div className={styles.metaItem} key={m.label}>
            <span className={styles.metaIcon}>{m.icon}</span>
            <span className={styles.metaLabel}>{m.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3 className={styles.h3}>
          {t("resources:mentalHealth.therapistProfile.section.about")}
        </h3>
        {therapist.bio.map((p, i) => (
          <p className={styles.body} key={i}>
            {p}
          </p>
        ))}
      </div>

      <div className={styles.cols}>
        <div className={styles.section}>
          <h3 className={styles.h3}>
            {t("resources:mentalHealth.therapistProfile.section.howIWork")}
          </h3>
          <div className={styles.pills}>
            {therapist.approach.map((a) => (
              <span key={a} className={styles.pill}>
                {a}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.section}>
          <h3 className={styles.h3}>
            {t("resources:mentalHealth.therapistProfile.section.training")}
          </h3>
          <ul className={styles.list}>
            {therapist.training.map((trainingItem) => (
              <li key={trainingItem}>{trainingItem}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.firstSession}>
        <div className={styles.fsIcon}>
          <FiHeart aria-hidden />
        </div>
        <div>
          <div className={styles.fsLabel}>
            {t("resources:mentalHealth.therapistProfile.section.firstSession")}
          </div>
          <p className={styles.fsText}>{therapist.firstSession}</p>
        </div>
      </div>

      <div className={styles.profileLink}>
        <Button
          variant="ghost"
          to={`${routes.therapists}/${therapist.id}`}
          onClick={onClose}
        >
          {t("resources:mentalHealth.therapistProfile.seeFullProfileCta")}
        </Button>
      </div>
    </>
  );
}
