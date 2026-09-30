import { Translation } from "../../shared/i18n/Translation";
import { AuthLayout } from "./AuthLayout";
import { SignInActions } from "./SignInActions";
import { SignInCardContent } from "./SignInCardContent";
import { SignInNetworkArt } from "./SignInNetworkArt";
import { useSignInFlow } from "./useSignInFlow";

/** The sign-in card: the welcome, the Google button and the ways in on the
 *  left, and the network gathered into the Q of QueerPulse on the right. The
 *  floating corner mark stays hidden, and the card links back home instead. */
export function SignInPage() {
  const flow = useSignInFlow();

  // Note: a signed-in member never reaches this page; the walled-garden gate
  // (see authGate.ts / AppRoutes) treats /auth/sign-in as guest-only and
  // redirects them to their feed before it renders.

  return (
    <AuthLayout
      layout="twoColumn"
      isFloatingBrandHidden
      aside={
        <SignInNetworkArt
          caption={
            <Translation
              i18nKey="auth:signIn.artCaption"
              components={{ em: <em /> }}
            />
          }
        />
      }
    >
      <SignInCardContent actions={<SignInActions flow={flow} />} />
    </AuthLayout>
  );
}
