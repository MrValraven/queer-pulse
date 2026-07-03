import { Reveal } from "../../shared/components/ui";
import { ASKS, SIGNATORIES } from "./openLetter.data";
import s from "./OpenLetterPage.module.css";

/** The open letter itself — prose, asks, and the lead signatories. */
export function OpenLetterBody() {
  return (
    <article className={s.letter}>
      <p>To the Ministry of Health, and to the Direção-Geral da Saúde:</p>
      <p className={s.lead}>
        Lei n.º 38/2018 codified a fundamental principle in Portuguese law: that
        a person's gender identity is theirs to determine, and that the state
        and its health system are obliged to recognise that determination.{" "}
        <em>The law is good.</em> It is not yet being applied.
      </p>
      <p>
        Specifically, the prescription protocols for hormone-replacement therapy
        in Portugal are <strong>not portable across the SNS</strong>. A trans
        patient who establishes care with a GP in Lisbon, builds an evidence
        file over 12–24 months, and then moves — for work, for housing, for
        safety — must, in practice, start over with a new GP in their new city.
        The clinical evidence does not move with them. The prescription history
        does not move with them.{" "}
        <em>The trust they built with a clinician does not move with them.</em>
      </p>
      <p>
        This is not what the law says should happen. This is what the
        operational reality is.
      </p>

      <h3>
        What we're <em>asking for</em>
      </h3>
      <p>
        Three specific, implementable changes. None require new legislation.
      </p>
      <ol>
        {ASKS.map((a) => (
          <li key={a.lead}>
            <b>{a.lead}</b>
            {a.body}
          </li>
        ))}
      </ol>

      <h3>
        Why <em>now</em>
      </h3>
      <p>
        Because the policy window is open. Because the Ministry has committed,
        in the 2026 health budget, to "evaluate continuity-of-care pathways for
        chronic medications." Because the clinicians who would have to implement
        this — including <em>Dr. Inês Pereira</em> at Clínica do Largo,{" "}
        <em>Dr. Hugo Marques</em> at USF Sé, and <em>Dra. Mariza Câmara</em> at
        the Câmara — have publicly stated they are ready to participate.
      </p>
      <p>
        And because every month we wait,{" "}
        <strong>
          roughly 40 trans patients in Portugal lose continuity of HRT
        </strong>{" "}
        due solely to administrative friction. The clinical cost of these
        interruptions is documented. The personal cost is incalculable.
      </p>

      <h3>
        What we'll do <em>with this letter</em>
      </h3>
      <p>
        At 5,000 signatures, this letter will be hand-delivered to the Ministry
        by a delegation of three: <em>Catarina Vaz</em> (QueerPulse, Trans Hub),{" "}
        <em>Filipa Mendes</em> (ILGA Portugal), and one trans person whose
        continuity of care has been interrupted in the last 24 months. We will
        request a meeting. We will publish their response, whatever it is.
      </p>
      <p>
        If they decline to meet, this letter goes to the next quarterly
        Assembleia da República's health committee hearing — already scheduled
        to discuss Lei n.º 38/2018 implementation — and to the press.
      </p>

      <p className={s.kicker}>
        We are not asking for a new right.{" "}
        <strong>
          We are asking that an existing right be made operationally real.
        </strong>
      </p>

      <Reveal className={s.signBlock}>
        {SIGNATORIES.map((sig) => (
          <div key={sig.name} style={{ display: "flex", gap: 14 }}>
            <div
              className={`${s.signAv} ${sig.tint === "jade" ? s.signAvJade : ""}`}
            >
              {sig.av}
            </div>
            <div className={s.signText}>
              <b>{sig.name}</b>
              <span>{sig.role}</span>
            </div>
          </div>
        ))}
      </Reveal>
    </article>
  );
}
