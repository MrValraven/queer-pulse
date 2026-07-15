import { useState } from "react";
import { Button, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useCreateChangemakerNomination } from "./api/useCreateChangemakerNomination";
import styles from "./ChangemakersPage.module.css";

/**
 * The Change Makers page's "Nominate them" form. The directory itself
 * (`CHANGEMAKERS`) is curated editorial content, but a nomination is real
 * member data — it calls `POST /changemakers/nominations` in live mode (see
 * `useCreateChangemakerNomination`); demo mode keeps the prototype's
 * simulated success toast.
 */
export function NominateChangemakerSection() {
  const { showToast } = useToast();
  const [nominee, setNominee] = useState("");
  const nominationMutation = useCreateChangemakerNomination();

  return (
    <section className={styles.nominate}>
      <div className="wrap">
        <Reveal as="div" className={styles.nomEye}>
          Community nominations
        </Reveal>
        <Reveal as="h2" delay={60}>
          Know someone who should <em>be here?</em>
        </Reveal>
        <Reveal as="p" delay={120}>
          We add change makers through community nominations. If you know
          someone doing meaningful work for queer people in Lisbon, a name and a
          sentence is enough to start.
        </Reveal>
        <form
          className={styles.nomForm}
          onSubmit={(e) => {
            e.preventDefault();
            const nomineeName = nominee.trim();
            if (!nomineeName) return;
            nominationMutation.mutate(
              { nomineeName },
              {
                onSuccess: () => {
                  showToast(
                    `Thank you — we'll look into ${nomineeName}.`,
                    "success",
                  );
                  setNominee("");
                },
                onError: () =>
                  showToast(
                    "Couldn't send your nomination — please try again.",
                    "error",
                  ),
              },
            );
          }}
        >
          <input
            className={styles.nomInput}
            type="text"
            placeholder="Their name…"
            value={nominee}
            onChange={(e) => setNominee(e.target.value)}
          />
          <Button type="submit" disabled={nominationMutation.isPending}>
            {nominationMutation.isPending ? "Sending…" : "Nominate them"}
          </Button>
        </form>
      </div>
    </section>
  );
}
