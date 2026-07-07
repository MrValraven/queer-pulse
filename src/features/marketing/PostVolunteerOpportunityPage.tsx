import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FadeIn, SuccessPanel } from "../../shared/components/ui";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { usePostOpportunityForm } from "./usePostOpportunityForm";
import { useCreateOpportunity } from "./api/useOpportunityMutations";
import { PostOpportunityCoreFields } from "./PostOpportunityCoreFields";
import { PostOpportunityRichFields } from "./PostOpportunityRichFields";
import { POST_TIPS } from "./postVolunteerOpportunity.data";
import styles from "./PostVolunteerOpportunityPage.module.css";

export function PostVolunteerOpportunityPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const form = usePostOpportunityForm();
  const create = useCreateOpportunity();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.markTouched();
    if (!form.valid) return; // inline required-field errors now render

    create.mutate(form.toDto(), {
      onSuccess: (res) => {
        // Live mode returns a slug → jump to the new listing. Demo mode returns
        // no slug → show the plum success panel (never hits the network).
        if (res.slug) {
          navigate(`${routes.volunteer}/opportunity/${res.slug}`);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      onError: () =>
        showToast(
          "Couldn't post your opportunity — please try again.",
          "error",
        ),
    });
  };

  const posted = create.isSuccess && !create.data?.slug;

  return (
    <PageShell>
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eye}>Volunteer · Post a role</div>
            <h1 className={styles.title}>
              Post an <em>opportunity.</em>
            </h1>
            <p className={styles.sub}>
              Looking for people to give their time? Describe the role honestly
              — the hours, the commitment, who it's good for — and it goes live
              on the volunteer board straight away.
            </p>
          </div>

          {posted ? (
            <FadeIn className={styles.successWrap}>
              <SuccessPanel
                title="Your opportunity is"
                em="posted."
                closeLabel="View the volunteer board →"
                onClose={() => navigate(routes.volunteer)}
                steps={[
                  "It's live on the volunteer board now",
                  "Members can sign up from the listing",
                  "You'll see everyone who signs up on the role's page",
                ]}
              >
                Thank you for making room for someone to help. Interested
                volunteers can now find your role and express interest.
              </SuccessPanel>
            </FadeIn>
          ) : (
            <div className={styles.layout}>
              <form className={styles.form} onSubmit={submit} noValidate>
                <PostOpportunityCoreFields form={form} />
                <PostOpportunityRichFields form={form} />

                <div className={styles.actions}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={create.isPending}
                    aria-busy={create.isPending}
                  >
                    {create.isPending ? "Posting…" : "Post opportunity →"}
                  </Button>
                  <Button variant="ghost" to={routes.volunteer}>
                    Cancel
                  </Button>
                </div>
              </form>

              <aside className={styles.sidebar}>
                {POST_TIPS.map((tip) => (
                  <div className={styles.tipCard} key={tip.title}>
                    <div className={styles.tipTitle}>{tip.title}</div>
                    <div className={styles.tipBody}>{tip.body}</div>
                  </div>
                ))}
              </aside>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
