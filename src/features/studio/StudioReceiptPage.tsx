import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioShell } from "./StudioShell";
import { routes } from "../../app/routeMap";
import {
  RECEIPT_COVER,
  RECEIPT_TRACK_TITLE,
  RECEIPT_ARTIST,
  RECEIPT_ALBUM,
  RECEIPT_TIPPER,
  TIP_AMOUNT,
  ARTIST_SETTLE_DAYS,
  RECEIPT_NUMBER,
  RECEIPT_LEDGER_ROW,
  RECEIPT_TIP_DATE,
  RECEIPT_LEDGER_DATE,
  RECEIPT_SUSTAINER_SINCE,
  NOTE,
} from "./studioReceipt.data";
import s from "./StudioReceiptPage.module.css";

// Content: the payment method's masked card summary — comes from the
// payment record in live mode.
const RECEIPT_CARD_SUMMARY = "Saved card · ending 4242 · ";

/** Jade heart-hands "thank you" mark that pulses. */
function ThankIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-7.5-9.6A3.9 3.9 0 0 1 12 8.3a3.9 3.9 0 0 1 7.5 2.6c0 5-7.5 9.6-7.5 9.6Z"
        fill="currentColor"
      />
      <path
        d="M8 9.5 5 12.5M16 9.5l3 3"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The near-black receipt card: head, split, detail grid, note, footer. */
function ReceiptCard() {
  const { t } = useTranslation();
  const fmt = useFormat();

  const dateTimeLabel = `${fmt.date(RECEIPT_TIP_DATE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${fmt.time(RECEIPT_TIP_DATE)} Lisbon`;
  const ledgerDateLabel = `${fmt.date(RECEIPT_LEDGER_DATE, {
    weekday: "short",
    day: "numeric",
    month: "short",
  })} · ${fmt.time(RECEIPT_LEDGER_DATE)} Lisbon`;

  return (
    <div className={s.card}>
      <div className={s.head}>
        <div className={s.cv}>
          <ImageSlot
            src={RECEIPT_COVER}
            tint="jade"
            width={64}
            height={64}
            radius={10}
            placeholder=""
            alt={`${RECEIPT_TRACK_TITLE} cover`}
          />
        </div>
        <div className={s.info}>
          <div className={s.eb}>{t("studio:receipt.tipEyebrow")}</div>
          <h2>{RECEIPT_TRACK_TITLE}</h2>
          <div className={s.by}>
            {t("studio:receipt.byPrefix")}{" "}
            <Link to={routes.studioArtist}>{RECEIPT_ARTIST}</Link> ·{" "}
            <Translation
              i18nKey="studio:receipt.fromAlbum"
              components={{ em: <em /> }}
              values={{ album: RECEIPT_ALBUM }}
            />
          </div>
        </div>
        <div className={s.amount}>
          <em>{fmt.currency(TIP_AMOUNT)}</em>
        </div>
      </div>

      <div className={s.split}>
        <div className={s.splitH}>
          <h3>
            <Translation
              i18nKey="studio:receipt.splitHeading"
              components={{ em: <em /> }}
            />
          </h3>
          <span className={s.small}>{t("studio:receipt.splitNote")}</span>
        </div>
        <div className={s.bar}>
          <span style={{ width: "100%", background: "var(--jade)" }} />
        </div>
        <div className={s.rows}>
          <div className={s.rcr}>
            <span className={`${s.dot} ${s.jade}`} />
            <span className={s.k}>
              {RECEIPT_ARTIST}
              <small>
                {t("studio:receipt.split.artistSub", {
                  count: ARTIST_SETTLE_DAYS,
                })}
              </small>
            </span>
            <span className={`${s.v} ${s.tip}`}>
              {fmt.currency(TIP_AMOUNT)}
            </span>
            <span className={s.pct}>{t("studio:receipt.split.artistPct")}</span>
          </div>
          <div className={s.rcr}>
            <span className={`${s.dot} ${s.muted}`} />
            <span className={`${s.k} ${s.muted}`}>
              {t("studio:receipt.split.platformName")}
              <small>{t("studio:receipt.split.platformSub")}</small>
            </span>
            <span className={`${s.v} ${s.muted}`}>{fmt.currency(0)}</span>
            <span className={s.pct}>
              {t("studio:receipt.split.platformPct")}
            </span>
          </div>
        </div>
      </div>

      <div className={s.detail}>
        <div className={s.rcd}>
          <div className={s.eb}>{t("studio:receipt.detail.receiptNo")}</div>
          <div className={s.v}>
            <code>{RECEIPT_NUMBER}</code>
          </div>
        </div>
        <div className={s.rcd}>
          <div className={s.eb}>{t("studio:receipt.detail.dateTime")}</div>
          <div className={s.v}>{dateTimeLabel}</div>
        </div>
        <div className={s.rcd}>
          <div className={s.eb}>{t("studio:receipt.detail.from")}</div>
          <div className={s.v}>
            {RECEIPT_TIPPER} ·{" "}
            {t("studio:receipt.detail.sustainerSince", {
              date: fmt.date(RECEIPT_SUSTAINER_SINCE, {
                month: "short",
                year: "numeric",
              }),
            })}
          </div>
        </div>
        <div className={s.rcd}>
          <div className={s.eb}>{t("studio:receipt.detail.method")}</div>
          <div className={s.v}>
            {RECEIPT_CARD_SUMMARY}
            <Translation
              i18nKey="studio:receipt.detail.chosenByDefault"
              components={{ em: <em /> }}
            />
          </div>
        </div>
        <div className={s.rcd}>
          <div className={s.eb}>
            {t("studio:receipt.detail.postedToLedger")}
          </div>
          <div className={s.v}>{ledgerDateLabel}</div>
        </div>
        <div className={s.rcd}>
          <div className={s.eb}>{t("studio:receipt.detail.visibility")}</div>
          <div className={s.v}>
            <Translation
              i18nKey="studio:receipt.detail.visibilityValue"
              components={{ em: <em /> }}
            />
          </div>
        </div>
      </div>

      <div className={s.note}>
        <div className={s.label}>
          {t("studio:receipt.note.label", { artist: RECEIPT_ARTIST })}
        </div>
        <div className={s.quote}>{NOTE.quote}</div>
        <div className={s.reply}>
          <div className={s.av}>{NOTE.reply.avatar}</div>
          <div className={s.replyBody}>
            <div className={s.who}>
              {RECEIPT_ARTIST} ·{" "}
              <Translation
                i18nKey="studio:receipt.note.repliedSuffix"
                components={{ em: <em /> }}
              />
            </div>
            <div className={s.replyText}>{NOTE.reply.body}</div>
            <div className={s.when}>
              {t("studio:receipt.note.replyWhen", {
                relativeTime: fmt.relativeTime(
                  -NOTE.reply.minutesAgo,
                  "minute",
                ),
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={s.foot}>
        <span>
          {t("studio:receipt.footer.auditablePrefix")}{" "}
          <Link to={routes.governance}>
            {t("studio:receipt.footer.publicLedgerLink")}
          </Link>{" "}
          · {t("studio:receipt.footer.rowLabel", { code: RECEIPT_LEDGER_ROW })}
        </span>
        <button
          type="button"
          className={s.exportBtn}
          onClick={() => window.print()}
        >
          {t("studio:receipt.footer.exportCta")}
        </button>
      </div>
    </div>
  );
}

export function StudioReceiptPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.thank}>
          <div className={s.icon}>
            <ThankIcon />
          </div>
          <h1>
            <Translation
              i18nKey="studio:receipt.thanksTitle"
              components={{ em: <em /> }}
              values={{
                artist: RECEIPT_ARTIST,
                amount: fmt.currency(TIP_AMOUNT),
              }}
            />
          </h1>
          <p className={s.sub}>
            <Translation
              i18nKey="studio:receipt.thanksSub"
              components={{ em: <em /> }}
            />
          </p>
        </div>

        <ReceiptCard />

        <div className={s.actions}>
          <Button
            variant="primary"
            onClick={() =>
              showToast(t("studio:receipt.toast.shareCopied"), "success")
            }
          >
            {t("studio:receipt.actions.share")}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() =>
              showToast(
                t("studio:receipt.toast.tipAgain", { artist: RECEIPT_ARTIST }),
                "info",
              )
            }
          >
            {t("studio:receipt.actions.tipAgain")}
          </Button>
          <Button variant="ghost-dark" to={routes.studioArtist}>
            {t("studio:receipt.actions.openArtistPage", {
              artist: RECEIPT_ARTIST,
            })}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() =>
              showToast(t("studio:receipt.toast.emailCopy"), "success")
            }
          >
            {t("studio:receipt.actions.emailCopy")}
          </Button>
        </div>

        <p className={s.privNote}>
          <Translation
            i18nKey="studio:receipt.privacyNote"
            // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- <a> is an element template; <Translation> clones it with the translated link children at render time.
            components={{ em: <em />, a: <a href="#privacy" /> }}
          />
        </p>
      </div>
    </StudioShell>
  );
}
