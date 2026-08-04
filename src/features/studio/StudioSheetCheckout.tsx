import { useState } from "react";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./sheet.module.css";
import {
  SPLIT,
  PAY_METHODS,
  SHEET_TITLE,
  SHEET_SPEC,
  SHEET_PRICE,
  SHEET_PROCESSING_FEE,
  SHEET_SPLIT_RATIO,
  SHEET_SPLIT_SHARES,
  SHEET_TRANSCRIBER,
  SHEET_COMPOSER,
} from "./studioSheetStore.data";

export function StudioSheetCheckout() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [pm, setPm] = useState(0);
  const [bought, setBought] = useState(false);

  const total = SHEET_PRICE + SHEET_PROCESSING_FEE;

  return (
    <div className={s.checkout}>
      <h2>
        <Translation
          i18nKey="studio:sheet.checkout.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={s.chSub}>{t("studio:sheet.checkout.subtitle")}</div>
      <div className={s.line}>
        <span className="k">
          Lead sheet — {SHEET_TITLE}
          <small>{SHEET_SPEC}</small>
        </span>
        <span className={s.v}>{fmt.currency(SHEET_PRICE)}</span>
      </div>
      <div className={s.line}>
        <span className="k">
          {t("studio:sheet.checkout.processingLabel")}
          <small>{t("studio:sheet.checkout.processingSub")}</small>
        </span>
        <span className={s.v}>{fmt.currency(SHEET_PROCESSING_FEE)}</span>
      </div>
      <div className={`${s.line} ${s.lineTotal}`}>
        <span className="k">{t("studio:sheet.checkout.totalLabel")}</span>
        <span className={s.v}>
          <em>{fmt.currency(total)}</em>
        </span>
      </div>

      <div className={s.splitViz}>
        <div className={s.sl}>
          {t("studio:sheet.checkout.splitHeading", {
            amount: fmt.currency(SHEET_PRICE),
            splitRatio: SHEET_SPLIT_RATIO,
          })}
        </div>
        <div className={s.splitBar}>
          <div className={s.a} style={{ width: "55%" }} />
          <div className={s.b} style={{ width: "35%" }} />
          <div className={s.c} style={{ width: "10%" }} />
        </div>
        {SPLIT.map((r, i) => (
          <div key={i} className={s.splitR}>
            <span className={s.sw} style={{ background: r.color }} />
            <span className={s.sn}>
              {r.name ? (
                <>
                  {r.name} · <em>{r.roleKey ? t(r.roleKey) : ""}</em>
                </>
              ) : (
                t("studio:sheet.checkout.role.coop")
              )}
            </span>
            <span className={s.sv}>
              <b>{fmt.currency(r.amount)}</b>
            </span>
          </div>
        ))}
        <div className={s.splitFoot}>
          <Translation
            i18nKey="studio:sheet.checkout.splitFoot"
            components={{ em: <em /> }}
          />
        </div>
      </div>

      <div className={s.payMethod}>
        {PAY_METHODS.map((m, i) => (
          <div
            key={i}
            className={[s.pm, pm === i && s.pmOn].filter(Boolean).join(" ")}
            role="button"
            tabIndex={0}
            onClick={() => setPm(i)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setPm(i);
              }
            }}
          >
            <span className={s.pmDot} />
            <span className={s.pn}>
              {t(m.labelKey)}
              {m.detail ? ` · ${m.detail}` : ""}
              <small>{t(m.subKey)}</small>
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={s.chBtn}
        disabled={bought}
        onClick={() => {
          setBought(true);
          showToast(
            t("studio:sheet.checkout.downloadedToast", {
              amount: fmt.currency(
                SHEET_SPLIT_SHARES.transcriber + SHEET_SPLIT_SHARES.composer,
              ),
              names: `${SHEET_TRANSCRIBER} & ${SHEET_COMPOSER.split(" ")[0]}`,
            }),
            "success",
          );
        }}
      >
        {bought ? (
          <>
            {t("studio:sheet.checkout.paidLabel")} <FiCheck /> ·{" "}
            {t("studio:sheet.checkout.downloadingLabel")}
          </>
        ) : (
          <>
            {t("studio:sheet.checkout.payCta", { amount: fmt.currency(total) })}{" "}
            <FiArrowRight aria-hidden />
          </>
        )}
      </button>
      <div className={s.chNote}>
        <Translation
          i18nKey="studio:sheet.checkout.note"
          components={{ em: <em /> }}
        />
      </div>
    </div>
  );
}
