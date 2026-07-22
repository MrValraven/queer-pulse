import { useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { RemovedSpace } from "./safeSpaces";
import { CRITERIA, HOW, NOMINATE_TYPE_KEYS } from "./safeSpacesPage.data";
import styles from "./SafeSpacesPage.module.css";

export function BadgeExplainer() {
  const { t } = useTranslation();
  return (
    <div className={styles.badgeExplainer}>
      <div className="wrap">
        <div className={styles.beGrid}>
          <div className={styles.beBadge}>
            <div className={styles.badgeVisual}>
              <div className={styles.bvCheck}>
                <FiCheck />
              </div>
              <div className={styles.bvName}>
                {t("safety:spaces.badge.visualNameLine1")}
                <br />
                {t("safety:spaces.badge.visualNameLine2")}
              </div>
              <div className={styles.bvSub}>QueerPulse</div>
            </div>
            <div className={styles.badgeCaption}>
              {t("safety:spaces.badge.caption")}
            </div>
          </div>
          <div className={styles.beText}>
            <h2>
              <Translation
                i18nKey="safety:spaces.badge.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("safety:spaces.badge.body")}</p>
            <div className={styles.criteriaList}>
              {CRITERIA.map((c) => (
                <div className={styles.critItem} key={c.leadKey}>
                  <div className={styles.critDot}>
                    <c.icon />
                  </div>
                  <div className={styles.critText}>
                    <strong>{t(c.leadKey)}</strong>
                    {t(c.restKey)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowSection() {
  const { t } = useTranslation();
  return (
    <div className={styles.howSection}>
      <div className="wrap">
        <h2>
          <Translation
            i18nKey="safety:spaces.how.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.howGrid}>
          {HOW.map((h) => (
            <div className={styles.howCard} key={h.num}>
              <div className={styles.howNum}>{h.num}</div>
              <div className={styles.howTitle}>{t(h.titleKey)}</div>
              <div className={styles.howDesc}>{t(h.descKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RemovedSection({ removed }: { removed: RemovedSpace[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.removedSection}>
      <div className="wrap">
        <div className={styles.removedHead}>
          <h2>
            <Translation
              i18nKey="safety:spaces.removed.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>
            {t("safety:spaces.removed.lead", { count: removed.length })}
          </p>
        </div>
        <div className={styles.removedSteps}>
          <div className={styles.rStep}>
            <Translation
              i18nKey="safety:spaces.removed.step1"
              components={{ span: <span /> }}
            />
          </div>
          <div className={styles.rStep}>
            <Translation
              i18nKey="safety:spaces.removed.step2"
              components={{ span: <span /> }}
            />
          </div>
          <div className={styles.rStep}>
            <Translation
              i18nKey="safety:spaces.removed.step3"
              components={{ span: <span /> }}
            />
          </div>
          <div className={styles.rStep}>
            <Translation
              i18nKey="safety:spaces.removed.step4"
              components={{ span: <span /> }}
            />
          </div>
        </div>
        <div className={styles.removedList}>
          {removed.map((r) => (
            <Link
              key={r.slug}
              to={`${routes.safeSpaces}/${r.slug}`}
              className={styles.removedCard}
            >
              <div className={styles.rcTop}>
                <span className={styles.rcType}>
                  {r.typeLabel} · {r.hood}
                </span>
                <span className={styles.rcBadge}>
                  {t("safety:spaces.removed.card.badge")}
                </span>
              </div>
              <div className={styles.rcName}>{r.name}</div>
              <div className={styles.rcReason}>{r.reason}</div>
              <div className={styles.rcFoot}>
                <span>{r.removedDate}</span>
                <span className={styles.rcLink}>
                  {t("safety:spaces.removed.card.whyLink")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function NominateThanks({
  nomName,
  onReset,
}: {
  nomName: string;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.nomThanks}>
      <div className={styles.nomThanksIcon}>
        <svg viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className={styles.nomThanksTitle}>
        <Translation
          i18nKey="safety:spaces.nominate.thanks.title"
          components={{ em: <em /> }}
        />
      </h3>
      <p className={styles.nomThanksText}>
        {nomName.trim() ? (
          <Translation
            i18nKey="safety:spaces.nominate.thanks.textNamed"
            values={{ name: nomName.trim() }}
            components={{ strong: <strong /> }}
          />
        ) : (
          t("safety:spaces.nominate.thanks.textPlain")
        )}
      </p>
      <p className={styles.nomThanksSub}>
        <Translation
          i18nKey="safety:spaces.nominate.thanks.subInfo"
          components={{ strong: <strong /> }}
        />
      </p>
      <Button variant="ghost-dark" onClick={onReset}>
        {t("safety:spaces.nominate.anotherCta")}
      </Button>
    </div>
  );
}

function NominateForm({
  nomName,
  onNomName,
  onNominate,
}: {
  nomName: string;
  onNomName: (value: string) => void;
  onNominate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div>
        <h3>
          <Translation
            i18nKey="safety:spaces.nominate.title"
            components={{ em: <em /> }}
          />
        </h3>
        <p>{t("safety:spaces.nominate.lead")}</p>
        <div className={styles.nomFlagNote}>
          {t("safety:spaces.nominate.flagNote")}
        </div>
      </div>
      <form
        className={styles.nomFields}
        onSubmit={(e) => {
          e.preventDefault();
          onNominate();
        }}
      >
        <input
          className={styles.nomInput}
          type="text"
          placeholder={t("safety:spaces.nominate.namePlaceholder")}
          value={nomName}
          onChange={(e) => onNomName(e.target.value)}
          required
        />
        <input
          className={styles.nomInput}
          type="text"
          placeholder={t("safety:spaces.nominate.addressPlaceholder")}
        />
        <select className={styles.nomSelect} defaultValue="">
          <option value="">
            {t("safety:spaces.nominate.typeSelect.placeholder")}
          </option>
          {NOMINATE_TYPE_KEYS.map((key) => (
            <option key={key}>{t(key)}</option>
          ))}
        </select>
        <textarea
          className={styles.nomTextarea}
          placeholder={t("safety:spaces.nominate.reasonPlaceholder")}
        />
        <button type="submit" className={styles.nomBtn}>
          {t("safety:spaces.nominate.submitCta")}
        </button>
      </form>
    </>
  );
}

export function NominateSection({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLDivElement | null>;
}) {
  const [nominated, setNominated] = useState(false);
  const [nomName, setNomName] = useState("");

  return (
    <div className={styles.nomSection} ref={sectionRef}>
      <div className="wrap">
        <div className={styles.nomBox}>
          {nominated ? (
            <NominateThanks
              nomName={nomName}
              onReset={() => {
                setNominated(false);
                setNomName("");
              }}
            />
          ) : (
            <NominateForm
              nomName={nomName}
              onNomName={setNomName}
              onNominate={() => setNominated(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
