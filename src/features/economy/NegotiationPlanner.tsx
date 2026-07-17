import { useState } from "react";
import { FiCheck, FiCopy, FiTrendingUp } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import {
  type Application,
  type NegotiationAngle,
  negotiationAngles,
  NEGOTIATION_LEVERS,
  NEGOTIATION_PRINCIPLE_KEYS,
} from "./applicationStatus.data";
import styles from "./ApplicationModals.module.css";

/** A single selectable strategy card in the planner. */
function AngleCard({
  angle,
  selected,
  onSelect,
}: {
  angle: NegotiationAngle;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={[styles.angle, selected && styles.angleOn]
        .filter(Boolean)
        .join(" ")}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={styles.angleRadio} aria-hidden />
      <span className={styles.angleText}>
        <span className={styles.angleName}>{t(angle.nameKey)}</span>
        <span className={styles.angleBlurb}>{t(angle.blurbKey)}</span>
      </span>
    </button>
  );
}

/** The negotiation planner — context, leverage, strategies, and a draft you can send. */
export function NegotiationPlanner({
  app,
  onClose,
}: {
  app: Application;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const o = app.offer;
  const angles = negotiationAngles(app);
  const [angleId, setAngleId] = useState(angles[0]!.id);
  const [draft, setDraft] = useState(angles[0]!.draft);
  const [levers, setLevers] = useState<string[]>(["base-salary"]);
  const { submit, sending, done } = useSubmitFlow();

  const pickAngle = (a: NegotiationAngle) => {
    setAngleId(a.id);
    setDraft(a.draft);
  };
  const toggleLever = (leverId: string) =>
    setLevers((prev) =>
      prev.includes(leverId)
        ? prev.filter((x) => x !== leverId)
        : [...prev, leverId],
    );

  if (done) {
    return (
      <ModalShell onClose={onClose} success wide>
        <SuccessPanel
          title={t("economy:negotiate.success.title")}
          em={t("economy:negotiate.success.em")}
          onClose={onClose}
        >
          {t("economy:negotiate.success.body", { company: app.companyName })}
        </SuccessPanel>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} wide>
      <div className={styles.eyebrow}>{t("economy:negotiate.eyebrow")}</div>
      <h2 className={styles.title}>
        <Translation
          i18nKey="economy:negotiate.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("economy:negotiate.sub")}</p>

      {o && (
        <>
          <div className={styles.panel}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowK}>
                  {t("economy:negotiate.onTheTable")}
                </span>
                <span className={styles.rowV}>{o.salary}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowK}>
                  {t("economy:negotiate.holiday")}
                </span>
                <span className={styles.rowV}>{o.holiday}</span>
              </div>
            </div>
          </div>
          <div className={styles.market}>
            <FiTrendingUp className={styles.marketIcon} size={18} aria-hidden />
            <span>{o.market}</span>
          </div>
        </>
      )}

      <div className={styles.eyebrow}>
        {t("economy:negotiate.whatMattersMost")}
      </div>
      <div className={styles.levers}>
        {NEGOTIATION_LEVERS.map((lever) => (
          <button
            key={lever.id}
            type="button"
            className={[
              styles.lever,
              levers.includes(lever.id) && styles.leverOn,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => toggleLever(lever.id)}
            aria-pressed={levers.includes(lever.id)}
          >
            {t(lever.labelKey)}
          </button>
        ))}
      </div>

      <ul className={styles.list} style={{ marginBottom: 24 }}>
        {NEGOTIATION_PRINCIPLE_KEYS.map((principleKey) => (
          <li key={principleKey} className={styles.listItem}>
            <FiCheck className={styles.tick} size={16} aria-hidden />{" "}
            {t(principleKey)}
          </li>
        ))}
      </ul>

      <div className={styles.eyebrow}>{t("economy:negotiate.pickAngle")}</div>
      <div className={styles.angles}>
        {angles.map((a) => (
          <AngleCard
            key={a.id}
            angle={a}
            selected={a.id === angleId}
            onSelect={() => pickAngle(a)}
          />
        ))}
      </div>

      <div className={styles.field}>
        <label htmlFor="neg-draft">{t("economy:negotiate.draftLabel")}</label>
        <textarea
          id="neg-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ minHeight: 150 }}
        />
      </div>

      <div className={styles.foot}>
        <button
          type="button"
          className={styles.back}
          disabled={sending}
          onClick={() => {
            navigator.clipboard?.writeText(draft);
            showToast(t("economy:negotiate.copiedToast"), "success");
          }}
        >
          <FiCopy
            size={13}
            style={{ marginRight: 5, verticalAlign: "-2px" }}
            aria-hidden
          />{" "}
          {t("economy:negotiate.copyDraft")}
        </button>
        <Button
          size="lg"
          disabled={sending || !draft.trim()}
          onClick={() => submit()}
        >
          {sending ? (
            <Sending label={t("economy:negotiate.sendingLabel")} />
          ) : (
            t("economy:negotiate.sendCta")
          )}
        </Button>
      </div>
    </ModalShell>
  );
}
