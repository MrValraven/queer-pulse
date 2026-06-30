import { PageShell } from "../../shared/components/layout";
import {
  TdovProfiles,
  TdovResources,
  TdovAllies,
} from "./TransDayOfVisibilitySections";
import styles from "./TransDayOfVisibilityPage.module.css";

export function TransDayOfVisibilityPage() {
  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>
              31 March · International Day of Visibility for Trans People
            </div>
            <h1 className={styles.h1}>
              Visible <em>and</em> safe. <em>Both.</em>
            </h1>
            <p className={styles.dek}>
              Today we lift the work of seven trans members shaping Lisbon —
              clinicians, organisers, writers, and the people who answer the
              helpline at 03:00.{" "}
              <em>Visibility is not a strategy unless it comes with safety</em>.
              So we pair these stories with the practical infrastructure that
              makes them livable: vetted clinicians, the open clinic, the legal
              observers, the Trans Hub.
            </p>
            <div className={styles.meta}>
              <span>
                <b>
                  <em>22</em>%
                </b>
                Of QP members are trans / NB
              </span>
              <span>
                <b>47</b>Vetted trans-affirming providers
              </span>
              <span>
                <b>
                  <em>1.4</em>k
                </b>
                Trans Hub bulletin subscribers
              </span>
              <span>
                <b>8</b>Years since Lei n.º 38/2018
              </span>
            </div>
          </div>
        </section>

        <section className={styles.statement}>
          <div className={styles.statementInner}>
            <div className={styles.kicker}>
              A note from Nuno Alves · Trans Hub coordinator
            </div>
            <h2>
              Today is the easy day. <em>Tomorrow is the work.</em>
            </h2>
            <p>
              Trans Day of Visibility falls on 31 March, four months before
              TDOR. The two are calendared like that on purpose. We are seen in
              the spring; we are mourned in the autumn. What happens between is,
              mostly, work — clinic appointments, prescription renewals,
              legal-name updates, conversations at HR, and the long quiet
              evenings that don't make the front pages.
            </p>
            <p>
              So this page is <strong>not</strong> a graphic to share. It is a
              list of the people doing that work, a list of the rooms where you
              can find them, and three small things a cis member of QueerPulse
              can do today that <em>actually help</em> — without making the day
              about themselves.
            </p>
            <p>
              If you are a trans member reading this: thank you for being here.
              The clinic on Thursday has a slot for you if you need one.{" "}
              <em>Don't hesitate to use it.</em>
            </p>
            <div className={styles.statementSign}>
              <div className={styles.ssAv}>NA</div>
              <div>
                — <b>Nuno Alves</b> · Trans Hub coordinator · 31 March
              </div>
            </div>
          </div>
        </section>

        <TdovProfiles />
        <TdovResources />
        <TdovAllies />

        <section className={styles.notDoing}>
          <div className={styles.notDoingInner}>
            <h3>
              What this page <em>is not.</em>
            </h3>
            <p>
              It is not a marketing moment. It is not a list of brands flying a
              flag. It is not a hashtag we want trending.{" "}
              <b>It is not an obligation</b> for any trans member to perform
              visibility today, or any other day — we did not feature anyone who
              didn't opt in, and we will take any profile down on request, no
              questions.
            </p>
            <p>
              If today is a hard day for you,{" "}
              <em>that is not a failure of visibility.</em> Some days the most
              political thing a trans person can do is rest. The Hub is still
              open. Crisis chat is still staffed. The Thursday clinic is still
              happening.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
