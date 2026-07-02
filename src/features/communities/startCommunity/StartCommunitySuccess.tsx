import { FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button, SuccessPanel } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";
import type { CreatedCommunity } from "./startCommunity.data";

/** "Opening the doors" — the plum-panel celebration after a community is created. */
export function StartCommunitySuccess({
  community,
  onAnother,
}: {
  community: CreatedCommunity;
  onAnother: () => void;
}) {
  const navigate = useNavigate();
  const invited = community.invites.length;

  return (
    <SuccessPanel
      icon={<FiHeart size={26} color="var(--jade)" aria-hidden />}
      title="Your doors are"
      em="open."
      closeLabel="Step inside →"
      onClose={() => navigate(`/community/${community.slug}`)}
      steps={[
        <>
          <b>{community.name}</b> is live and yours to steward.
        </>,
        invited > 0 ? (
          <>
            {invited} warm {invited === 1 ? "invite is" : "invites are"} on the
            way.
          </>
        ) : (
          <>Invite people whenever you're ready — there's no rush.</>
        ),
        <>Post a first hello so no one walks into an empty room.</>,
      ]}
      footer={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost-dark" to={routes.communitiesHome}>
            Back to your hub
          </Button>
          <Button variant="ghost-dark" onClick={onAnother}>
            Start another
          </Button>
        </div>
      }
    >
      You opened something real today. {community.name} now has a home on
      QueerPulse — a door for your people to walk through. Go say the first
      hello.
    </SuccessPanel>
  );
}
