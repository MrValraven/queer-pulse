import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { PERSONAS } from "./caregivers.data";
import {
  CommonQuestions,
  DontDoSay,
  StartHere,
  VoiceRooms,
} from "./CaregiversSections";
import styles from "./CaregiversPage.module.css";

export function CaregiversPage() {
  // A quiet "you're in the right place" cue — no filtering, just belonging.
  const [persona, setPersona] = useState(0);

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroInner}>
            <div className={styles.heroEye}>
              For parents · partners · siblings · friends · anyone showing up
            </div>
            <h1 className={styles.heroH}>
              Showing up <em>well</em>, when it matters.
            </h1>
            <p className={styles.heroSub}>
              A focused space for the people who love someone queer and want to
              do this well.{" "}
              <em>You don't need to know everything before you start.</em> You
              need a few short answers, a couple of conversations, and the room
              behind you.
            </p>
            <div
              className={styles.whoRow}
              role="group"
              aria-label="Who are you?"
            >
              {PERSONAS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={persona === i}
                  className={[styles.who, persona === i && styles.whoOn]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setPersona(i)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <StartHere />
      <CommonQuestions />
      <VoiceRooms />
      <DontDoSay />

      <Outro
        title={
          <>
            You don't have to <em>get it all right.</em>
          </>
        }
        sub="You have to keep showing up. The room is here for you too."
      >
        <Button variant="ghost-dark" size="lg" to={routes.peerSupport}>
          Find a support room
        </Button>
      </Outro>
    </PageShell>
  );
}
