import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Toggle, Seg, RadioCards } from "./StudioSettingsControls";
import {
  STREAM_QUALITY_OPTS,
  TIP_PRIVACY_OPTS,
  DOWNLOAD_QUALITY_OPTS,
  CAPTION_SIZE_OPTS,
  TIP_AMOUNTS,
} from "./studioSettings.data";
import s from "./StudioSettingsPage.module.css";

export function AudioSection() {
  const { t } = useTranslation();
  const [streamQ, setStreamQ] = useState("flac");
  const [dlQ, setDlQ] = useState("FLAC");
  const [normalise, setNormalise] = useState(true);
  const [crossfade, setCrossfade] = useState(false);

  return (
    <section className={s.sec}>
      <div className={s.secLbl}>{t("studio:settings.audio.label")}</div>
      <h2>
        <Translation
          i18nKey="studio:settings.audio.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.secDek}>{t("studio:settings.audio.dek")}</p>
      <div className={`${s.opt} ${s.optBlock}`}>
        <div className={s.ot} style={{ marginBottom: 12 }}>
          <h4>{t("studio:settings.audio.streamQuality.heading")}</h4>
          <p>{t("studio:settings.audio.streamQuality.body")}</p>
        </div>
        <RadioCards
          opts={STREAM_QUALITY_OPTS}
          active={streamQ}
          onChange={setStreamQ}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.audio.downloadQuality.heading")}</h4>
          <p>{t("studio:settings.audio.downloadQuality.body")}</p>
        </div>
        <Seg opts={DOWNLOAD_QUALITY_OPTS} active={dlQ} onChange={setDlQ} />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.audio.normalise.heading")}</h4>
          <p>
            <Translation
              i18nKey="studio:settings.audio.normalise.body"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <Toggle
          on={normalise}
          onToggle={() => setNormalise((v) => !v)}
          label={t("studio:settings.audio.normalise.heading")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.audio.crossfade.heading")}</h4>
          <p>{t("studio:settings.audio.crossfade.body")}</p>
        </div>
        <Toggle
          on={crossfade}
          onToggle={() => setCrossfade((v) => !v)}
          label={t("studio:settings.audio.crossfade.heading")}
        />
      </div>
    </section>
  );
}

export function PrivacySection() {
  const { t } = useTranslation();
  const [history, setHistory] = useState(false);
  const [cloudSync, setCloudSync] = useState(true);
  const [tipPrivacy, setTipPrivacy] = useState("private");
  const [receipts, setReceipts] = useState(true);

  return (
    <section className={s.sec}>
      <div className={s.secLbl}>{t("studio:settings.privacy.label")}</div>
      <h2>
        <Translation
          i18nKey="studio:settings.privacy.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.secDek}>{t("studio:settings.privacy.dek")}</p>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.privacy.history.heading")}</h4>
          <p>{t("studio:settings.privacy.history.body")}</p>
        </div>
        <Toggle
          on={history}
          onToggle={() => setHistory((v) => !v)}
          label={t("studio:settings.privacy.history.heading")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.privacy.cloudSync.heading")}</h4>
          <p>{t("studio:settings.privacy.cloudSync.body")}</p>
        </div>
        <Toggle
          on={cloudSync}
          onToggle={() => setCloudSync((v) => !v)}
          label={t("studio:settings.privacy.cloudSync.heading")}
        />
      </div>
      <div className={`${s.opt} ${s.optBlock}`}>
        <div className={s.ot} style={{ marginBottom: 12 }}>
          <h4>{t("studio:settings.privacy.tipNotes.heading")}</h4>
          <p>
            <Translation
              i18nKey="studio:settings.privacy.tipNotes.body"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <RadioCards
          opts={TIP_PRIVACY_OPTS}
          active={tipPrivacy}
          onChange={setTipPrivacy}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.privacy.tipReceipts.heading")}</h4>
          <p>{t("studio:settings.privacy.tipReceipts.body")}</p>
        </div>
        <Toggle
          on={receipts}
          onToggle={() => setReceipts((v) => !v)}
          label={t("studio:settings.privacy.tipReceipts.heading")}
        />
      </div>
    </section>
  );
}

export function CaptionsSection() {
  const { t } = useTranslation();
  const [captions, setCaptions] = useState(true);
  const [captionSize, setCaptionSize] = useState("M");
  const [showBoth, setShowBoth] = useState(false);

  return (
    <section className={s.sec}>
      <div className={s.secLbl}>{t("studio:settings.captions.label")}</div>
      <h2>
        <Translation
          i18nKey="studio:settings.captions.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.secDek}>{t("studio:settings.captions.dek")}</p>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.captions.showCaptions.heading")}</h4>
          <p>
            <Translation
              i18nKey="studio:settings.captions.showCaptions.body"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <Toggle
          on={captions}
          onToggle={() => setCaptions((v) => !v)}
          label={t("studio:settings.captions.showCaptions.heading")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.captions.captionSize.heading")}</h4>
          <p>{t("studio:settings.captions.captionSize.body")}</p>
        </div>
        <Seg
          opts={CAPTION_SIZE_OPTS}
          active={captionSize}
          onChange={setCaptionSize}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.captions.lyricLanguage.heading")}</h4>
          <p>{t("studio:settings.captions.lyricLanguage.body")}</p>
        </div>
        <select
          className={s.selectMini}
          aria-label={t("studio:settings.captions.lyricLanguage.heading")}
        >
          <option>
            {t("studio:settings.captions.lyricLanguage.opt.original")}
          </option>
          <option>
            {t("studio:settings.captions.lyricLanguage.opt.english")}
          </option>
          <option>
            {t("studio:settings.captions.lyricLanguage.opt.portuguese")}
          </option>
          <option>
            {t("studio:settings.captions.lyricLanguage.opt.spanish")}
          </option>
          <option>
            {t("studio:settings.captions.lyricLanguage.opt.french")}
          </option>
        </select>
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.captions.showBoth.heading")}</h4>
          <p>{t("studio:settings.captions.showBoth.body")}</p>
        </div>
        <Toggle
          on={showBoth}
          onToggle={() => setShowBoth((v) => !v)}
          label={t("studio:settings.captions.showBoth.heading")}
        />
      </div>
    </section>
  );
}

export function TippingSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [tipAmt, setTipAmt] = useState(2);
  const [roundUp, setRoundUp] = useState(false);

  return (
    <section className={s.sec}>
      <div className={s.secLbl}>{t("studio:settings.tipping.label")}</div>
      <h2>
        <Translation
          i18nKey="studio:settings.tipping.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.secDek}>{t("studio:settings.tipping.dek")}</p>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.tipping.defaultAmount.heading")}</h4>
          <p>{t("studio:settings.tipping.defaultAmount.body")}</p>
        </div>
        <div className={s.chips}>
          {TIP_AMOUNTS.map((amount) => (
            <div
              key={amount}
              className={`${s.chip} ${tipAmt === amount ? s.chipOn : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setTipAmt(amount)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setTipAmt(amount);
                }
              }}
            >
              {fmt.currency(amount)}
            </div>
          ))}
        </div>
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>{t("studio:settings.tipping.roundUp.heading")}</h4>
          <p>
            {t("studio:settings.tipping.roundUp.body", {
              albumPrice: fmt.currency(3.4),
              roundedPrice: fmt.currency(4),
              tipAmount: fmt.currency(0.6),
            })}
          </p>
        </div>
        <Toggle
          on={roundUp}
          onToggle={() => setRoundUp((v) => !v)}
          label={t("studio:settings.tipping.roundUp.heading")}
        />
      </div>
    </section>
  );
}

export function EraseSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return (
    <section className={s.sec}>
      <div className={`${s.secLbl} ${s.secLblDanger}`}>
        {t("studio:settings.erase.label")}
      </div>
      <h2>
        <Translation
          i18nKey="studio:settings.erase.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.secDek}>{t("studio:settings.erase.dek")}</p>
      <div className={s.danger}>
        <div className={s.opt}>
          <div className={s.ot}>
            <h4>{t("studio:settings.erase.history.heading")}</h4>
            <p className={s.eraseNote}>
              <Translation
                i18nKey="studio:settings.erase.history.note"
                components={{ em: <em /> }}
              />
            </p>
          </div>
          <button
            type="button"
            className={s.btDanger}
            onClick={() =>
              showToast(t("studio:settings.erase.history.toast"), "success")
            }
          >
            {t("studio:settings.erase.history.cta")}
          </button>
        </div>
        <div className={s.opt}>
          <div className={s.ot}>
            <h4>{t("studio:settings.erase.export.heading")}</h4>
            <p className={s.eraseNote}>
              {t("studio:settings.erase.export.note")}
            </p>
          </div>
          <button
            type="button"
            className={s.bt}
            onClick={() =>
              showToast(t("studio:settings.erase.export.toast"), "info")
            }
          >
            {t("studio:settings.erase.export.cta")}
          </button>
        </div>
        <div className={s.opt}>
          <div className={s.ot}>
            <h4>{t("studio:settings.erase.closeAccount.heading")}</h4>
            <p className={s.eraseNote}>
              <Translation
                i18nKey="studio:settings.erase.closeAccount.note"
                components={{ em: <em /> }}
              />
            </p>
          </div>
          <button
            type="button"
            className={s.btDanger}
            onClick={() =>
              showToast(t("studio:settings.erase.closeAccount.toast"), "info")
            }
          >
            {t("studio:settings.erase.closeAccount.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
