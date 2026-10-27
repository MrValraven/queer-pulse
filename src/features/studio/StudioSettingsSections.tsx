import { useState } from "react";
import {
  Button,
  Select,
  SegmentedControl,
  Toggle,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { StudioSettingsRadioCards } from "./StudioSettingsRadioCards";
import { useStudioPlayer } from "./player/studioPlayerContext";
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
  const player = useStudioPlayer();

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
          <h3>{t("studio:settings.audio.streamQuality.heading")}</h3>
          <p>{t("studio:settings.audio.streamQuality.body")}</p>
        </div>
        <StudioSettingsRadioCards
          options={STREAM_QUALITY_OPTS}
          value={streamQ}
          onChange={setStreamQ}
          ariaLabel={t("studio:settings.audio.streamQuality.heading")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h3>{t("studio:settings.audio.downloadQuality.heading")}</h3>
          <p>{t("studio:settings.audio.downloadQuality.body")}</p>
        </div>
        <SegmentedControl
          options={DOWNLOAD_QUALITY_OPTS}
          value={dlQ}
          onChange={setDlQ}
          label={t("studio:settings.audio.downloadQuality.heading")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h3>{t("studio:settings.audio.normalise.heading")}</h3>
          <p>
            <Translation
              i18nKey="studio:settings.audio.normalise.body"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <Toggle
          checked={player.preferences.isLoudnessEven}
          onChange={() =>
            player.setLoudnessEven(!player.preferences.isLoudnessEven)
          }
          label={t("studio:settings.audio.normalise.heading")}
        />
      </div>
    </section>
  );
}

export function PrivacySection() {
  const { t } = useTranslation();
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
          <h3>{t("studio:settings.privacy.cloudSync.heading")}</h3>
          <p>{t("studio:settings.privacy.cloudSync.body")}</p>
        </div>
        <Toggle
          checked={cloudSync}
          onChange={() => setCloudSync((v) => !v)}
          label={t("studio:settings.privacy.cloudSync.heading")}
        />
      </div>
      <div className={`${s.opt} ${s.optBlock}`}>
        <div className={s.ot} style={{ marginBottom: 12 }}>
          <h3>{t("studio:settings.privacy.tipNotes.heading")}</h3>
          <p>
            <Translation
              i18nKey="studio:settings.privacy.tipNotes.body"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <StudioSettingsRadioCards
          options={TIP_PRIVACY_OPTS}
          value={tipPrivacy}
          onChange={setTipPrivacy}
          ariaLabel={t("studio:settings.privacy.tipNotes.heading")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h3>{t("studio:settings.privacy.tipReceipts.heading")}</h3>
          <p>{t("studio:settings.privacy.tipReceipts.body")}</p>
        </div>
        <Toggle
          checked={receipts}
          onChange={() => setReceipts((v) => !v)}
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
  const [lyricLanguage, setLyricLanguage] = useState("original");
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
          <h3>{t("studio:settings.captions.showCaptions.heading")}</h3>
          <p>
            <Translation
              i18nKey="studio:settings.captions.showCaptions.body"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <Toggle
          checked={captions}
          onChange={() => setCaptions((v) => !v)}
          label={t("studio:settings.captions.showCaptions.heading")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h3>{t("studio:settings.captions.captionSize.heading")}</h3>
          <p>{t("studio:settings.captions.captionSize.body")}</p>
        </div>
        <SegmentedControl
          options={CAPTION_SIZE_OPTS}
          value={captionSize}
          onChange={setCaptionSize}
          label={t("studio:settings.captions.captionSize.heading")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h3>{t("studio:settings.captions.lyricLanguage.heading")}</h3>
          <p>{t("studio:settings.captions.lyricLanguage.body")}</p>
        </div>
        <Select
          size="sm"
          label={t("studio:settings.captions.lyricLanguage.heading")}
          options={[
            {
              value: "original",
              label: t("studio:settings.captions.lyricLanguage.opt.original"),
            },
            {
              value: "english",
              label: t("studio:settings.captions.lyricLanguage.opt.english"),
            },
            {
              value: "portuguese",
              label: t("studio:settings.captions.lyricLanguage.opt.portuguese"),
            },
            {
              value: "spanish",
              label: t("studio:settings.captions.lyricLanguage.opt.spanish"),
            },
            {
              value: "french",
              label: t("studio:settings.captions.lyricLanguage.opt.french"),
            },
          ]}
          value={lyricLanguage}
          onChange={(value) => setLyricLanguage(value ?? "original")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h3>{t("studio:settings.captions.showBoth.heading")}</h3>
          <p>{t("studio:settings.captions.showBoth.body")}</p>
        </div>
        <Toggle
          checked={showBoth}
          onChange={() => setShowBoth((v) => !v)}
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
          <h3>{t("studio:settings.tipping.defaultAmount.heading")}</h3>
          <p>{t("studio:settings.tipping.defaultAmount.body")}</p>
        </div>
        <SegmentedControl
          options={TIP_AMOUNTS.map((amount) => ({
            value: String(amount),
            label: fmt.currency(amount),
          }))}
          value={String(tipAmt)}
          onChange={(value) => setTipAmt(Number(value))}
          label={t("studio:settings.tipping.defaultAmount.heading")}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h3>{t("studio:settings.tipping.roundUp.heading")}</h3>
          <p>
            {t("studio:settings.tipping.roundUp.body", {
              albumPrice: fmt.currency(3.4),
              roundedPrice: fmt.currency(4),
              tipAmount: fmt.currency(0.6),
            })}
          </p>
        </div>
        <Toggle
          checked={roundUp}
          onChange={() => setRoundUp((v) => !v)}
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
            <h3>{t("studio:settings.erase.export.heading")}</h3>
            <p className={s.eraseNote}>
              {t("studio:settings.erase.export.note")}
            </p>
          </div>
          <Button
            variant="quiet"
            size="sm"
            onClick={() =>
              showToast(t("studio:settings.erase.export.toast"), "info")
            }
          >
            {t("studio:settings.erase.export.cta")}
          </Button>
        </div>
        <div className={s.opt}>
          <div className={s.ot}>
            <h3>{t("studio:settings.erase.closeAccount.heading")}</h3>
            <p className={s.eraseNote}>
              <Translation
                i18nKey="studio:settings.erase.closeAccount.note"
                components={{ em: <em /> }}
              />
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              showToast(t("studio:settings.erase.closeAccount.toast"), "info")
            }
          >
            {t("studio:settings.erase.closeAccount.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
