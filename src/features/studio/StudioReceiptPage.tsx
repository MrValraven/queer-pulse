import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { StudioShell } from "./StudioShell";
import { routes } from "../../app/routeMap";
import {
  RECEIPT_COVER,
  SPLIT_ROWS,
  DETAIL_ROWS,
  NOTE,
} from "./studioReceipt.data";
import s from "./StudioReceiptPage.module.css";

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
            alt="Carta para a santa cover"
          />
        </div>
        <div className={s.info}>
          <div className={s.eb}>Tip · while listening</div>
          <h2>
            Carta para a <em>santa</em>
          </h2>
          <div className={s.by}>
            by <Link to={routes.studioArtist}>Mariana Sol</Link> · from{" "}
            <em>Cidade dos santos</em>
          </div>
        </div>
        <div className={s.amount}>
          €<em>2</em>
        </div>
      </div>

      <div className={s.split}>
        <div className={s.splitH}>
          <h3>
            Where the <em>money</em> went
          </h3>
          <span className={s.small}>
            100% pass-through on tips, no exceptions.
          </span>
        </div>
        <div className={s.bar}>
          <span style={{ width: "100%", background: "var(--jade)" }} />
        </div>
        <div className={s.rows}>
          {SPLIT_ROWS.map((r, i) => (
            <div key={i} className={s.rcr}>
              <span
                className={`${s.dot} ${r.dot === "jade" ? s.jade : s.muted}`}
              />
              <span className={`${s.k} ${r.muted ? s.muted : ""}`}>
                {r.name}
                <small>{r.sub}</small>
              </span>
              <span
                className={`${s.v} ${r.tip ? s.tip : ""} ${r.muted ? s.muted : ""}`}
              >
                {r.value}
              </span>
              <span className={s.pct}>{r.pct}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={s.detail}>
        {DETAIL_ROWS.map((d) => (
          <div key={d.eb} className={s.rcd}>
            <div className={s.eb}>{d.eb}</div>
            <div className={s.v}>{d.value}</div>
          </div>
        ))}
      </div>

      <div className={s.note}>
        <div className={s.label}>Your note to Mariana</div>
        <div className={s.quote}>{NOTE.quote}</div>
        <div className={s.reply}>
          <div className={s.av}>{NOTE.reply.avatar}</div>
          <div className={s.replyBody}>
            <div className={s.who}>{NOTE.reply.who}</div>
            <div className={s.replyText}>{NOTE.reply.body}</div>
            <div className={s.when}>{NOTE.reply.when}</div>
          </div>
        </div>
      </div>

      <div className={s.foot}>
        <span>
          Auditable on the <Link to={routes.governance}>public ledger</Link> ·
          row <code>#26-06-T4af7</code>
        </span>
        <button
          type="button"
          className={s.exportBtn}
          onClick={() => window.print()}
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}

export function StudioReceiptPage() {
  const { showToast } = useToast();
  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.thank}>
          <div className={s.icon}>
            <ThankIcon />
          </div>
          <h1>
            Mariana got <em>€2</em>.
          </h1>
          <p className={s.sub}>
            Every cent. No platform cut. <em>You did that.</em>
          </p>
        </div>

        <ReceiptCard />

        <div className={s.actions}>
          <Button
            variant="primary"
            onClick={() =>
              showToast("Paid card copied — share it anywhere.", "success")
            }
          >
            Share — paid card
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() => showToast("Tip Mariana again — same track.", "info")}
          >
            Tip again
          </Button>
          <Button variant="ghost-dark" to={routes.studioArtist}>
            Open Mariana&apos;s page
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() =>
              showToast("A copy is on its way to your inbox.", "success")
            }
          >
            Email me a copy
          </Button>
        </div>

        <p className={s.privNote}>
          By default tips are <em>public, with your name</em>. You can make this
          one anonymous, or set every future tip to anonymous, in settings.{" "}
          <em>We don&apos;t share tip data with anyone.</em>{" "}
          <a href="#privacy">Privacy commitments →</a>
        </p>
      </div>
    </StudioShell>
  );
}
