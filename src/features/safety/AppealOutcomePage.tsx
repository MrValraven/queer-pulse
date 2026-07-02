import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Footer } from "../../shared/components/layout";
import s from "./flows.module.css";

type State = "pending" | "overturned" | "upheld";

const STATES: { id: State; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "overturned", label: "Overturned" },
  { id: "upheld", label: "Upheld" },
];

function Timeline({ stage }: { stage: "pending" | "done" }) {
  const last = stage === "done";
  return (
    <div className={s.timeline}>
      <div className={s.tlStep}>
        <div className={`${s.tlDot} ${s.tlDone}`}>
          <FiCheck />
        </div>
        <div className={s.tlLabel}>Report filed</div>
      </div>
      <div className={`${s.tlLine} ${s.tlLineDone}`} />
      <div className={s.tlStep}>
        <div className={`${s.tlDot} ${last ? s.tlSuccess : s.tlCurrent}`}>
          {last ? <FiCheck /> : "2"}
        </div>
        <div className={s.tlLabel}>Appeal submitted</div>
      </div>
      <div
        className={[s.tlLine, last && s.tlLineDone].filter(Boolean).join(" ")}
      />
      <div className={s.tlStep}>
        <div className={`${s.tlDot} ${last ? s.tlSuccess : s.tlPending}`}>
          {last ? <FiCheck /> : "3"}
        </div>
        <div className={s.tlLabel}>Decision</div>
      </div>
    </div>
  );
}

export function AppealOutcomePage() {
  const [state, setState] = useState<State>("pending");

  return (
    <>
      <div className={s.page}>
        <div className={s.stateBar}>
          {STATES.map((st) => (
            <button
              type="button"
              key={st.id}
              className={[s.stateBtn, state === st.id && s.stateBtnActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setState(st.id)}
            >
              {st.label}
            </button>
          ))}
        </div>

        {state === "pending" && (
          <div className={`${s.card} ${s.center} ${s.screenIn}`}>
            <div
              className={s.icon}
              style={{ background: "rgba(232,119,90,.1)" }}
            >
              <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
                <circle
                  cx={13}
                  cy={13}
                  r={9}
                  stroke="var(--accent)"
                  strokeWidth={2}
                />
                <path
                  d="M13 8v5.5l3 2"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={s.title}>
              We're <em>reviewing</em> your appeal
            </div>
            <div className={s.sub}>
              Our moderation team will look at your case carefully and respond
              within 5 business days.
            </div>
            <div className={s.refBox}>
              <div className={s.csRow}>
                <span className={s.csLabel}>Appeal reference</span>
                <span className={s.refVal}>QP-APP-2847</span>
              </div>
              <div className={s.csRow}>
                <span className={s.csLabel}>Submitted</span>
                <span className={s.refVal}>4 June 2026</span>
              </div>
              <div className={s.csRow}>
                <span className={s.csLabel}>Expected response</span>
                <span className={s.refVal}>by 11 June 2026</span>
              </div>
            </div>
            <Timeline stage="pending" />
            <div className={`${s.infoBox} ${s.infoJade}`}>
              <strong>While your appeal is under review:</strong> the original
              decision remains in place, but no further action will be taken.
              You'll be notified by email as soon as a decision is reached.
            </div>
            <div className={s.govLink}>
              <Link to={routes.governance}>How moderation works →</Link>
            </div>
          </div>
        )}

        {state === "overturned" && (
          <div className={`${s.card} ${s.center} ${s.screenIn}`}>
            <div
              className={s.icon}
              style={{ background: "rgba(74,140,111,.1)" }}
            >
              <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
                <path
                  d="M7 13.5L11.5 18L19 9"
                  stroke="var(--jade)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={s.title}>
              Your appeal was{" "}
              <em style={{ color: "var(--jade)" }}>successful</em>
            </div>
            <div className={s.sub}>
              After reviewing your case, we've reversed the original decision.
              We're sorry for the inconvenience.
            </div>
            <div className={s.refBox}>
              <div className={s.csRow}>
                <span className={s.csLabel}>Appeal reference</span>
                <span className={s.refVal}>QP-APP-2847</span>
              </div>
              <div className={s.csRow}>
                <span className={s.csLabel}>Decision</span>
                <span className={s.refVal}>Overturned</span>
              </div>
              <div className={s.csRow}>
                <span className={s.csLabel}>Decided on</span>
                <span className={s.refVal}>9 June 2026</span>
              </div>
            </div>
            <Timeline stage="done" />
            <div className={`${s.infoBox} ${s.infoJade}`}>
              <strong>What's been restored:</strong> the warning on your account
              has been removed, and your content is visible again. Your account
              standing is unchanged.
            </div>
            <div className={s.actions} style={{ marginTop: 18 }}>
              <Button to={routes.accountProfile}>Return to your profile</Button>
              <Button variant="ghost" to={routes.guidelines}>
                View community guidelines
              </Button>
            </div>
          </div>
        )}

        {state === "upheld" && (
          <div className={`${s.card} ${s.center} ${s.screenIn}`}>
            <div
              className={s.icon}
              style={{ background: "rgba(45,27,61,.07)" }}
            >
              <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
                <circle
                  cx={13}
                  cy={13}
                  r={9}
                  stroke="var(--plum)"
                  strokeWidth={2}
                />
                <path
                  d="M13 9v5M13 17v.5"
                  stroke="var(--plum)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className={s.title}>
              We've <em>reviewed</em> your appeal
            </div>
            <div className={s.sub}>
              After careful consideration, we've determined that the original
              decision was appropriate.
            </div>
            <div className={s.refBox}>
              <div className={s.csRow}>
                <span className={s.csLabel}>Appeal reference</span>
                <span className={s.refVal}>QP-APP-2847</span>
              </div>
              <div className={s.csRow}>
                <span className={s.csLabel}>Outcome</span>
                <span className={s.refVal}>Original decision stands</span>
              </div>
              <div className={s.csRow}>
                <span className={s.csLabel}>Decided on</span>
                <span className={s.refVal}>9 June 2026</span>
              </div>
            </div>
            <Timeline stage="done" />
            <div className={`${s.infoBox} ${s.infoPlum}`}>
              <strong>Going forward:</strong> the account warning remains on
              your record for 90 days and will not affect your ability to
              participate in most community activities. Repeated violations may
              result in further review.
            </div>
            <div className={s.reportNote}>
              If you believe this is in error, you can contact our Trust team
              directly.
              <br />
              <Link to={routes.contact}>Message the Trust team →</Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
