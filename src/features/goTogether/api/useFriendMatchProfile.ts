import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  demoDeleteProfile,
  demoProfile,
  demoSaveProfile,
} from "../goTogether.mock";
import {
  deleteFriendMatchProfile,
  getFriendMatchProfile,
  saveFriendMatchProfile,
} from "./goTogether.api";
import type {
  FriendMatchAnswers,
  FriendMatchProfileDTO,
} from "./goTogether.types";
import { goTogetherKeys } from "./goTogetherKeys";

/** The member's own questionnaire answers, `GET /go-together/profile`.
 *  `answers` is null until they fill it in. */
export function useFriendMatchProfile() {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const isActiveSession = !checking && loggedIn && status === "active";
  return useQuery<FriendMatchProfileDTO>({
    queryKey: goTogetherKeys.profile(demoMode),
    enabled: demoMode || isActiveSession,
    retry: false,
    queryFn: async () => (demoMode ? demoProfile() : getFriendMatchProfile()),
  });
}

/** PUT /go-together/profile, which also records consent. A card waiting on
 *  the questionnaire has to move on, so every card query refreshes. */
export function useSaveFriendMatchProfile() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<FriendMatchProfileDTO, Error, FriendMatchAnswers>({
    meta: { silentError: true },
    mutationFn: async (answers) =>
      demoMode ? demoSaveProfile(answers) : saveFriendMatchProfile(answers),
    onSuccess: (profile) => {
      queryClient.setQueryData(goTogetherKeys.profile(demoMode), profile);
      void queryClient.invalidateQueries({ queryKey: goTogetherKeys.cardRoot });
    },
  });
}

/** DELETE /go-together/profile: withdraws consent, deletes the answers and
 *  leaves every waiting match, so the profile and every card refresh. */
export function useDeleteFriendMatchProfile() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ ok: true }, Error, void>({
    meta: { silentError: true },
    mutationFn: async () =>
      demoMode ? demoDeleteProfile() : deleteFriendMatchProfile(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: goTogetherKeys.profileRoot,
      });
      void queryClient.invalidateQueries({ queryKey: goTogetherKeys.cardRoot });
    },
  });
}
