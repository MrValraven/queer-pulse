import { useMemo, type Dispatch, type SetStateAction } from "react";
import { FiHeart, FiPause, FiArrowDown } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { currentUserEmail } from "../members/data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import {
  buildReasons,
  buildEnds,
  buildStays,
  RENEWED_DATE,
  NEXT_CHARGE_DATE,
  PAUSED_RENEWAL_DATE,
  SUSTAINER_ANNUAL,
  MEMBER_ANNUAL,
  SOLIDARITY_ANNUAL,
  type Alt,
  type Step,
} from "./cancelMembership.data";
import styles from "./CancelMembershipPage.module.css";

export function CancelStepper({
  step,
  stepNum,
}: {
  step: Step;
  stepNum: number;
}) {
  const { t } = useTranslation();
  const labels = [
    t("settings:cancelMembership.stepper.options"),
    t("settings:cancelMembership.stepper.tellUsWhy"),
    t("settings:cancelMembership.stepper.confirm"),
  ];
  return (
    <div className={styles.stepper}>
      {[1, 2, 3].map((n, i) => {
        const isActive = step !== "done" && stepNum === n;
        const isDone = step === "done" ? true : stepNum > n;
        return (
          <>
            <div
              key={n}
              className={`${styles.cs} ${isActive ? styles.csActive : ""} ${isDone ? styles.csDone : ""}`}
            >
              <div className={styles.csN}>{n}</div>
              <div className={styles.csL}>{labels[i]}</div>
            </div>
            {i < 2 && (
              <div
                key={`bar-${n}`}
                className={`${styles.csBar} ${isDone ? styles.csBarDone : ""}`}
              />
            )}
          </>
        );
      })}
    </div>
  );
}

export function CancelStepOptions({
  onPickAlt,
  onContinue,
}: {
  onPickAlt: (alt: Alt) => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const memberAmount = fmt.currency(MEMBER_ANNUAL);
  const solidarityAmount = fmt.currency(SOLIDARITY_ANNUAL);

  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="1">
      <h2>
        <Translation
          i18nKey="settings:cancelMembership.options.currentTitle"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.curr}>
        <div className={styles.currBadge}>S</div>
        <div>
          <div className={styles.currTier}>
            <Translation
              i18nKey="settings:cancelMembership.options.currentTierLabel"
              components={{ em: <em /> }}
            />
          </div>
          <div className={styles.currMeta}>
            <Translation
              i18nKey="settings:cancelMembership.options.currentMeta"
              values={{
                renewedDate: fmt.date(RENEWED_DATE),
                nextChargeDate: fmt.date(NEXT_CHARGE_DATE),
              }}
              components={{ b: <b /> }}
            />
          </div>
        </div>
        <div className={styles.currPrice}>
          {fmt.currency(SUSTAINER_ANNUAL)}
          <span className={styles.currCy}>
            {t("settings:cancelMembership.options.perYear")}
          </span>
        </div>
      </div>
      <h2 style={{ marginTop: 14 }}>
        <Translation
          i18nKey="settings:cancelMembership.options.beforeYouGoTitle"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.paneSub}>
        {t("settings:cancelMembership.options.sub")}
      </p>
      <div className={styles.altList}>
        <button
          type="button"
          className={styles.alt}
          onClick={() => onPickAlt("pause")}
        >
          <div className={styles.altIc}>⏸</div>
          <div className={styles.altText}>
            <div className={styles.altT}>
              {t("settings:cancelMembership.options.pauseTitle")}
            </div>
            <div className={styles.altD}>
              {t("settings:cancelMembership.options.pauseDesc")}
            </div>
          </div>
          <div className={styles.altArrow}>→</div>
        </button>
        <button
          type="button"
          className={styles.alt}
          onClick={() => onPickAlt("downshift")}
        >
          <div
            className={styles.altIc}
            style={{
              background: "rgba(var(--accent-rgb),.12)",
              color: "var(--accent-ink)",
            }}
          >
            ↓
          </div>
          <div className={styles.altText}>
            <div className={styles.altT}>
              {t("settings:cancelMembership.options.downshiftTitle", {
                amount: memberAmount,
              })}
            </div>
            <div className={styles.altD}>
              {t("settings:cancelMembership.options.downshiftDesc")}
            </div>
          </div>
          <div className={styles.altArrow}>→</div>
        </button>
        <button
          type="button"
          className={styles.alt}
          onClick={() => onPickAlt("solidarity")}
        >
          <div
            className={styles.altIc}
            style={{
              background: "rgba(45,27,61,.08)",
              color: "var(--plum)",
            }}
          >
            <FiHeart />
          </div>
          <div className={styles.altText}>
            <div className={styles.altT}>
              {t("settings:cancelMembership.options.solidarityTitle")}
            </div>
            <div className={styles.altD}>
              <Translation
                i18nKey="settings:cancelMembership.options.solidarityDesc"
                values={{ amount: solidarityAmount }}
                components={{ b: <b /> }}
              />
            </div>
          </div>
          <div className={styles.altArrow}>→</div>
        </button>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onContinue}>
          {t("settings:cancelMembership.options.continueCancellingCta")}
        </Button>
        <Button variant="ghost" to={routes.membership}>
          {t("settings:cancelMembership.keepSustainerCta")}
        </Button>
      </div>
    </div>
  );
}

export function CancelStepReasons({
  checked,
  setChecked,
  onBack,
  onContinue,
}: {
  checked: Set<string>;
  setChecked: Dispatch<SetStateAction<Set<string>>>;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const reasons = useMemo(() => buildReasons(), []);

  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="2">
      <h2>
        <Translation
          i18nKey="settings:cancelMembership.reasons.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.paneSub}>
        {t("settings:cancelMembership.reasons.sub")}
      </p>
      <div className={styles.reasonList}>
        {reasons.map((reason) => (
          <label
            key={reason.id}
            className={`${styles.reason} ${checked.has(reason.id) ? styles.reasonChecked : ""}`}
          >
            <input
              type="checkbox"
              checked={checked.has(reason.id)}
              onChange={(e) =>
                setChecked((prev) => {
                  const next = new Set(prev);
                  if (e.target.checked) next.add(reason.id);
                  else next.delete(reason.id);
                  return next;
                })
              }
            />
            <div className={styles.reasonText}>{reason.label}</div>
          </label>
        ))}
      </div>
      <p
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: ".07em",
          textTransform: "uppercase",
          color: "var(--ink-40)",
          marginTop: 8,
        }}
      >
        {t("settings:cancelMembership.reasons.addNote")}
      </p>
      <textarea
        className={styles.reasonTextarea}
        placeholder={t("settings:cancelMembership.reasons.placeholder")}
      />
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onBack}>
          {t("settings:cancelMembership.backCta")}
        </Button>
        <Button variant="ghost" onClick={onContinue}>
          {t("settings:cancelMembership.continueCta")}
        </Button>
      </div>
    </div>
  );
}

export function CancelStepConfirm({
  confirmed,
  setConfirmed,
  onBack,
  onCancel,
}: {
  confirmed: boolean;
  setConfirmed: (value: boolean) => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const ends = useMemo(() => buildEnds(t), [t]);
  const stays = useMemo(() => buildStays(t), [t]);
  const nextChargeDate = fmt.date(NEXT_CHARGE_DATE);

  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="3">
      <h2>
        <Translation
          i18nKey="settings:cancelMembership.confirm.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.paneSub}>
        {t("settings:cancelMembership.confirm.sub")}
      </p>
      <div className={styles.secLabel}>
        {t("settings:cancelMembership.confirm.whatEnds")}
      </div>
      <div className={styles.loseGrid}>
        {ends.map((end) => (
          <div key={end.t} className={styles.lose}>
            <b>{end.t}</b>
            <span>{end.d}</span>
          </div>
        ))}
      </div>
      <div className={styles.secLabel}>
        {t("settings:cancelMembership.confirm.whatStays")}
      </div>
      <div className={styles.loseGrid}>
        {stays.map((stay) => (
          <div key={stay.t} className={`${styles.lose} ${styles.keep}`}>
            <b>{stay.t}</b>
            <span>{stay.d}</span>
          </div>
        ))}
      </div>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-60)",
          lineHeight: 1.65,
          marginBottom: 8,
        }}
      >
        <Translation
          i18nKey="settings:cancelMembership.confirm.accessContinuesNote"
          values={{ date: nextChargeDate }}
          components={{ b: <b style={{ color: "var(--plum)" }} /> }}
        />
      </p>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-60)",
          lineHeight: 1.65,
          marginBottom: 18,
        }}
      >
        <Translation
          i18nKey="settings:cancelMembership.confirm.writeToUs"
          components={{
            a: (
              <a
                href="mailto:cancel@queerpulse.app"
                style={{
                  color: "var(--plum)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              />
            ),
          }}
        />
      </p>
      <div className={styles.confirmRow}>
        <input
          type="checkbox"
          id="confirm-check"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <label htmlFor="confirm-check">
          <Translation
            i18nKey="settings:cancelMembership.confirm.checkboxLabel"
            values={{ date: nextChargeDate }}
            components={{ b: <b /> }}
          />
        </label>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onBack}>
          {t("settings:cancelMembership.backCta")}
        </Button>
        <div className={styles.actionRight}>
          <Button variant="primary" to={routes.membership}>
            {t("settings:cancelMembership.keepSustainerCta")}
          </Button>
          <Button variant="ghost" disabled={!confirmed} onClick={onCancel}>
            {t("settings:cancelMembership.confirm.cancelMyMembershipCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CancelDone() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="done">
      <div className={styles.farewell}>
        <div className={styles.farewellIc}>
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h2
          className={styles.h1}
          style={{ margin: "0 auto 10px", fontSize: 36 }}
        >
          <Translation
            i18nKey="settings:cancelMembership.done.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--ink-60)",
            lineHeight: 1.65,
            maxWidth: "42ch",
            margin: "0 auto 8px",
          }}
        >
          <Translation
            i18nKey="settings:cancelMembership.done.accessNote"
            values={{ date: fmt.date(NEXT_CHARGE_DATE) }}
            components={{
              b: <b style={{ color: "var(--plum)", fontWeight: 700 }} />,
            }}
          />
        </p>
        <p
          style={{
            fontSize: 15,
            color: "var(--ink-60)",
            lineHeight: 1.65,
            maxWidth: "42ch",
            margin: "0 auto 8px",
          }}
        >
          <Translation
            i18nKey="settings:cancelMembership.done.emailNote"
            values={{ email: currentUserEmail }}
            components={{ b: <b style={{ color: "var(--plum)" }} /> }}
          />
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-40)", marginTop: 12 }}>
          {t("settings:cancelMembership.done.mistakeNote")}
        </p>
        <div className={styles.farewellBtns}>
          <Button variant="primary" to={routes.homepage}>
            {t("settings:cancelMembership.backToHomeCta")}
          </Button>
          <Button variant="ghost" to={routes.membership}>
            {t("settings:cancelMembership.resubscribeCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CancelPaused({ onUndo }: { onUndo: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="paused">
      <div className={styles.farewell}>
        <div className={`${styles.farewellIc} ${styles.farewellIcJade}`}>
          <FiPause />
        </div>
        <h2
          className={styles.h1}
          style={{ margin: "0 auto 10px", fontSize: 36 }}
        >
          <Translation
            i18nKey="settings:cancelMembership.paused.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.fwLead}>
          <Translation
            i18nKey="settings:cancelMembership.paused.lead1"
            components={{ b: <b /> }}
          />
        </p>
        <p className={styles.fwLead}>
          <Translation
            i18nKey="settings:cancelMembership.paused.lead2"
            values={{
              date: fmt.date(PAUSED_RENEWAL_DATE),
              email: currentUserEmail,
            }}
            components={{ b: <b /> }}
          />
        </p>
        <p className={styles.fwNote}>
          {t("settings:cancelMembership.paused.note")}
        </p>
        <div className={styles.farewellBtns}>
          <Button variant="primary" to={routes.membership}>
            {t("settings:cancelMembership.backToMembershipCta")}
          </Button>
          <Button variant="ghost" onClick={onUndo}>
            {t("settings:cancelMembership.paused.undoCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CancelDownshifted({ onUndo }: { onUndo: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const amount = fmt.currency(MEMBER_ANNUAL);
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="downshifted">
      <div className={styles.farewell}>
        <div className={`${styles.farewellIc} ${styles.farewellIcAccent}`}>
          <FiArrowDown />
        </div>
        <h2
          className={styles.h1}
          style={{ margin: "0 auto 10px", fontSize: 36 }}
        >
          <Translation
            i18nKey="settings:cancelMembership.downshifted.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.fwLead}>
          <Translation
            i18nKey="settings:cancelMembership.downshifted.lead1"
            values={{ amount }}
            components={{ b: <b /> }}
          />
        </p>
        <p className={styles.fwLead}>
          <Translation
            i18nKey="settings:cancelMembership.downshifted.lead2"
            values={{ amount, date: fmt.date(NEXT_CHARGE_DATE) }}
            components={{ b: <b /> }}
          />
        </p>
        <p className={styles.fwNote}>
          <Translation
            i18nKey="settings:cancelMembership.downshifted.note"
            values={{ email: currentUserEmail }}
            components={{ b: <b /> }}
          />
        </p>
        <div className={styles.farewellBtns}>
          <Button variant="primary" to={routes.membership}>
            {t("settings:cancelMembership.backToMembershipCta")}
          </Button>
          <Button variant="ghost" onClick={onUndo}>
            {t("settings:cancelMembership.downshifted.undoCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CancelSolidarity({ onUndo }: { onUndo: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const amount = fmt.currency(SOLIDARITY_ANNUAL);
  return (
    <div className={`${styles.pane} ${styles.screenIn}`} key="solidarity">
      <div className={styles.farewell}>
        <div className={styles.farewellIc}>
          <FiHeart />
        </div>
        <h2
          className={styles.h1}
          style={{ margin: "0 auto 10px", fontSize: 36 }}
        >
          <Translation
            i18nKey="settings:cancelMembership.solidarity.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.fwLead}>
          <Translation
            i18nKey="settings:cancelMembership.solidarity.lead1"
            values={{ amount }}
            components={{ b: <b /> }}
          />
        </p>
        <p className={styles.fwLead}>
          <Translation
            i18nKey="settings:cancelMembership.solidarity.lead2"
            values={{ amount, date: fmt.date(NEXT_CHARGE_DATE) }}
            components={{ b: <b /> }}
          />
        </p>
        <p className={styles.fwNote}>
          {t("settings:cancelMembership.solidarity.note")}
        </p>
        <div className={styles.farewellBtns}>
          <Button variant="primary" to={routes.membership}>
            {t("settings:cancelMembership.backToMembershipCta")}
          </Button>
          <Button variant="ghost" onClick={onUndo}>
            {t("settings:cancelMembership.solidarity.undoCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
