import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { type Submission } from "./studioProgram.data";
import s from "./StudioProgramPage.module.css";

interface InboxProps {
  inbox: Submission[];
  onSlate: (sub: Submission) => void;
  onPass: (id: string) => void;
  onListen: () => void;
}

/** The right column: submissions waiting to be triaged into the slate. */
export function StudioProgramInbox({
  inbox,
  onSlate,
  onPass,
  onListen,
}: InboxProps) {
  return (
    <aside className={s.inbox}>
      <div className={s.inboxHead}>
        <h2>
          Submissions · <em>47 new</em>
        </h2>
        <Link to={routes.studioTriage} className={s.triageLink}>
          Triage →
        </Link>
      </div>
      <p className={s.inboxTip}>
        Drag any submission left into a slot.{" "}
        <em>The pass-with-reason flow is in triage.</em>
      </p>
      <div className={s.subCards}>
        {inbox.map((sub) => (
          <div key={sub.id} className={s.subCard}>
            <div className={s.subCardTop}>
              <span className={s.subCov}>
                <ImageSlot
                  src={sub.image}
                  tint={sub.tint}
                  width={48}
                  height={48}
                  radius={8}
                  placeholder=""
                />
              </span>
              <div className={s.subMeta}>
                <div className={s.subTitle}>
                  {sub.titlePre}
                  {sub.titleEm && <em>{sub.titleEm}</em>}
                </div>
                <div className={s.subWho}>{sub.who}</div>
              </div>
            </div>
            <p className={s.subQuote}>{sub.quote}</p>
            <div className={s.subActions}>
              <button type="button" className={s.subBtn} onClick={onListen}>
                Listen
              </button>
              <button
                type="button"
                className={`${s.subBtn} ${s.subBtnAdd}`}
                onClick={() => onSlate(sub)}
              >
                + Slate
              </button>
              <button
                type="button"
                className={s.subBtn}
                onClick={() => onPass(sub.id)}
              >
                Pass
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
