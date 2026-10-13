import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Collapse, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Call, type CallText } from "./studioOpenCalls.data";
import s from "./funding.module.css";

const SHORT_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

/** One line of demo call copy, in the reader's language. */
export function callTextOf(
  part: CallText,
  t: TFunction,
  formatters: Formatters,
): string {
  if (!part.key) return part.text ?? "";
  return t(part.key, {
    ...part.values,
    ...(part.dateIso
      ? {
          date: formatters.date(
            new Date(`${part.dateIso}T12:00:00Z`),
            SHORT_DATE,
          ),
        }
      : {}),
  });
}

interface Props {
  call: Call;
}

export function StudioOpenCallCard({ call: c }: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(0);

  return (
    <div className={s.call}>
      <div className={s.callTop}>
        <div className={s.callCur}>
          <span
            className={[s.av, c.tone === "jade" && s.jade]
              .filter(Boolean)
              .join(" ")}
          >
            {c.av}
          </span>
          <div>
            <div className={s.nm}>{c.name}</div>
            <div className={s.ro}>
              {t("studio:demo.calls.seat", { seat: c.seatNumber })}
            </div>
          </div>
        </div>
        <div className={s.callMain}>
          <div className={s.callTags}>
            {c.tags.map((tg) => (
              <span
                key={tg.labelKey}
                className={`${s.callTag} ${s[tg.cls as keyof typeof s] ?? ""}`}
              >
                {t(tg.labelKey, tg.labelValues)}
              </span>
            ))}
          </div>
          <h3>
            <Translation i18nKey={c.titleKey} components={{ em: <em /> }} />
          </h3>
          <p className={s.brief}>
            <Translation i18nKey={c.briefKey} components={{ em: <em /> }} />
          </p>
        </div>
        <div className={s.callAmt}>
          <div
            className={s.v}
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 300,
              fontSize: 28,
              color: "rgb(var(--cream-rgb))",
            }}
          >
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              {fmt.currency(c.amount)}
            </em>
          </div>
          <div
            className={s.l}
            style={{ fontSize: 11, color: "rgba(var(--cream-rgb), 0.4)" }}
          >
            {t(c.amountLabelKey)}
          </div>
        </div>
      </div>
      <div className={s.callFoot}>
        <div className={s.callMeta}>
          {c.meta.map((part, index) => {
            const text = callTextOf(part, t, fmt);
            return (
              <span
                key={text}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {index > 0 && <span className={s.dot} />}
                {text}
              </span>
            );
          })}
        </div>
        <div className={s.callActions}>
          <button
            type="button"
            className={s.bt}
            onClick={() => showToast(t("studio:calls.card.saveToast"), "info")}
          >
            {t("studio:calls.card.saveCta")}
          </button>
          <button
            type="button"
            className={`${s.bt} ${s.btP}`}
            onClick={() => setOpen((v) => !v)}
          >
            {t("studio:calls.card.applyCta")} <FiArrowRight aria-hidden />
          </button>
        </div>
      </div>
      <Collapse isOpen={open && c.tracks !== undefined}>
        <div className={s.attach}>
          <div className={s.al}>{t("studio:calls.card.attachLabel")}</div>
          <div className={s.picker}>
            {(c.tracks ?? []).map((tr, i) => (
              <div
                key={tr.pre + (tr.em ?? "")}
                className={[s.trk, picked === i && s.trkOn]
                  .filter(Boolean)
                  .join(" ")}
                role="button"
                tabIndex={0}
                onClick={() => setPicked(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPicked(i);
                  }
                }}
              >
                <span className={s.cv}>
                  <ImageSlot
                    src={tr.image}
                    tint={tr.tint}
                    width={36}
                    height={36}
                    radius={6}
                    placeholder=""
                  />
                </span>
                <div>
                  <h5>
                    {tr.pre}
                    {tr.em && <em>{tr.em}</em>}
                  </h5>
                  <p>
                    {tr.facts
                      .map((part) => callTextOf(part, t, fmt))
                      .join(" · ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <textarea
            className={s.attachTa}
            rows={3}
            aria-label={t("studio:calls.card.attachLabel")}
            placeholder={c.placeholderKey ? t(c.placeholderKey) : undefined}
          />
          <div className={s.attachFoot}>
            <button
              type="button"
              className={`${s.bt} ${s.btP}`}
              onClick={() => {
                setOpen(false);
                showToast(t("studio:calls.card.submittedToast"), "success");
              }}
            >
              {t("studio:calls.card.submitCta")}
            </button>
            <button
              type="button"
              className={s.bt}
              onClick={() => setOpen(false)}
            >
              {t("studio:calls.card.cancelCta")}
            </button>
            <span className={s.singleNote}>
              <Translation
                i18nKey="studio:calls.card.singleTrackNote"
                components={{ em: <em /> }}
              />
            </span>
          </div>
        </div>
      </Collapse>
    </div>
  );
}
