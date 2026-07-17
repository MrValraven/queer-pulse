import { useState } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Call } from "./studioOpenCalls.data";
import s from "./funding.module.css";

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
            <div className={s.ro}>{c.seat}</div>
          </div>
        </div>
        <div className={s.callMain}>
          <div className={s.callTags}>
            {c.tags.map((tg) => (
              <span
                key={tg.label}
                className={`${s.callTag} ${s[tg.cls as keyof typeof s] ?? ""}`}
              >
                {tg.label}
              </span>
            ))}
          </div>
          <h3>
            {c.titlePre}
            <em>{c.titleEm}</em>
            {c.titlePost}
          </h3>
          <p className={s.brief}>{c.brief}</p>
        </div>
        <div className={s.callAmt}>
          <div
            className="v"
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 300,
              fontSize: 28,
              color: "var(--cream)",
            }}
          >
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              {fmt.currency(c.amount)}
            </em>
          </div>
          <div
            className="l"
            style={{ fontSize: 11, color: "rgba(247,243,238,.4)" }}
          >
            {c.amtLabel}
          </div>
        </div>
      </div>
      <div className={s.callFoot}>
        <div className={s.callMeta}>
          {c.meta.map((mt, i) => (
            <span
              key={mt}
              style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
            >
              {i > 0 && <span className={s.dot} />}
              {mt}
            </span>
          ))}
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
            {t("studio:calls.card.applyCta")}
          </button>
        </div>
      </div>
      {open && c.tracks && (
        <div className={s.attach}>
          <div className={s.al}>{t("studio:calls.card.attachLabel")}</div>
          <div className={s.picker}>
            {c.tracks.map((tr, i) => (
              <div
                key={tr.pre}
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
                  <p>{tr.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <textarea className={s.attachTa} placeholder={c.placeholder} />
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
      )}
    </div>
  );
}
