import { FiCheckCircle, FiClock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { StudioShell } from "./StudioShell";
import { GROUPS, SHORTCUTS } from "./studioAccessibility.data";
import s from "./StudioAccessibilityPage.module.css";

function StatusPill({ status }: { status: "live" | "soon" }) {
  if (status === "soon") {
    return (
      <span className={`${s.st} ${s.soon}`}>
        <FiClock />
        In progress
      </span>
    );
  }
  return (
    <span className={`${s.st} ${s.live}`}>
      <FiCheckCircle />
      Live
    </span>
  );
}

export function StudioAccessibilityPage() {
  const { showToast } = useToast();

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={s.eb}>Accessibility · the working list</div>
          <h1>
            Music is for everyone or it <em>isn't music</em>.
          </h1>
          <p className={s.lede}>
            This is both a statement of intent and a live checklist of what
            actually works today. Where something's <em>not</em> done yet, we
            say so — we'd rather be honest than aspirational.
          </p>
        </div>

        <div className={s.statement}>
          <p>
            QueerPulse Studio commits to meeting <em>WCAG 2.2 AA</em> across
            every surface, and to treating accessibility as a product
            requirement, not a compliance afterthought. Deaf and hard-of-hearing
            people should be able to use a music platform. So should blind and
            low-vision people, people who navigate by keyboard, and people who
            need words in their own language.
          </p>
          <p>
            We test with real screen readers and real users — paid, from our own
            community — every release.{" "}
            <em>
              If something here doesn't work for you, that's a bug, and we want
              the report.
            </em>
          </p>
        </div>

        {GROUPS.map((group) => (
          <section key={group.em} className={s.sec}>
            <h2>
              {group.pre}
              <em>{group.em}</em>
              {group.post}
            </h2>
            <div className={s.dek}>{group.dek}</div>
            <div className={s.list}>
              {group.items.map((item) => (
                <div key={item.em} className={s.item}>
                  <div className={s.ic}>{item.icon}</div>
                  <div className={s.ai}>
                    <h4>
                      {item.pre}
                      <em>{item.em}</em>
                      {item.post}
                    </h4>
                    <p>{item.body}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className={s.sec}>
          <h2>
            Player <em>keyboard</em> shortcuts
          </h2>
          <div className={s.dek}>
            Focus anywhere outside a text field. These work the same on every
            Studio surface, since the transport is always mounted.
          </div>
          <div className={s.kbdTable}>
            {SHORTCUTS.map((row) => (
              <div key={row.pre + (row.em ?? "")} className={s.kbdRow}>
                <span className={s.desc}>
                  {row.pre}
                  {row.em && <em>{row.em}</em>}
                  {row.post}
                </span>
                <div className={s.keys}>
                  {row.keys.map((k) => (
                    <span key={k} className={s.kbd}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={s.contact}>
          <h3>
            Found a <em>barrier</em>?
          </h3>
          <p>
            Tell us and we'll treat it as a bug, not a feature request. Reports
            from assistive-tech users jump the queue —{" "}
            <em>access@queerpulse.org</em>, or flag it from any page's footer.
            We respond within two working days, with a fix or an honest
            timeline.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              showToast("Thanks — we'll treat this as a bug", "success")
            }
          >
            Report an access barrier
          </Button>
          <div className={s.meta}>
            Last audited 2 Jun 2026 · WCAG 2.2 AA · NVDA, VoiceOver, TalkBack ·
            next audit Sep 2026
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
