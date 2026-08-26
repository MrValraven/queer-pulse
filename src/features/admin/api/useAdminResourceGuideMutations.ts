import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createGlossaryTerm,
  deleteGlossaryTerm,
  reviewGlossaryTerm,
  reviewResourceGuide,
  setResourceGuidePublished,
  updateGlossaryTerm,
  updateResourceGuide,
  type AdminGlossaryTermDTO,
  type AdminResourceGuideDTO,
  type GlossaryTermWriteBody,
  type ResourceGuideWriteBody,
  type ReviewGuideBody,
} from "./adminResourceGuides.api";
import {
  ADMIN_GLOSSARY_TERMS_KEY,
  ADMIN_RESOURCE_GUIDES_KEY,
} from "./useAdminResourceGuides";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface UpdateResourceGuideVars {
  id: string;
  body: ResourceGuideWriteBody;
}

export function useUpdateResourceGuide() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminResourceGuideDTO | undefined,
    Error,
    UpdateResourceGuideVars
  >({
    demoMode,
    demoLatencyMs: 0,
    demoResult: () => undefined,
    live: ({ id, body }) => updateResourceGuide(id, body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_RESOURCE_GUIDES_KEY],
      });
    },
  });
}

export interface ReviewResourceGuideVars {
  id: string;
  body: ReviewGuideBody;
}

/** Stamps "read end to end, still accurate" on a guide. */
export function useReviewResourceGuide() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminResourceGuideDTO | undefined,
    Error,
    ReviewResourceGuideVars
  >({
    demoMode,
    demoLatencyMs: 0,
    demoResult: () => undefined,
    live: ({ id, body }) => reviewResourceGuide(id, body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_RESOURCE_GUIDES_KEY],
      });
    },
  });
}

export interface SetGuidePublishedVars {
  id: string;
  isPublished: boolean;
}

export function useSetResourceGuidePublished() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminResourceGuideDTO | undefined,
    Error,
    SetGuidePublishedVars
  >({
    demoMode,
    demoLatencyMs: 0,
    demoResult: () => undefined,
    live: ({ id, isPublished }) => setResourceGuidePublished(id, isPublished),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_RESOURCE_GUIDES_KEY],
      });
    },
  });
}

// ── Glossary ────────────────────────────────────────────────────────────────

export interface CreateGlossaryTermVars {
  slug: string;
  term: string;
  definition: string;
  definitionPt?: string;
  category?: string;
}

export function useCreateGlossaryTerm() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminGlossaryTermDTO | undefined,
    Error,
    CreateGlossaryTermVars
  >({
    demoMode,
    demoLatencyMs: 0,
    demoResult: () => undefined,
    live: (body) => createGlossaryTerm(body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_GLOSSARY_TERMS_KEY],
      });
    },
  });
}

export interface UpdateGlossaryTermVars {
  id: string;
  body: GlossaryTermWriteBody;
}

export function useUpdateGlossaryTerm() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminGlossaryTermDTO | undefined,
    Error,
    UpdateGlossaryTermVars
  >({
    demoMode,
    demoLatencyMs: 0,
    demoResult: () => undefined,
    live: ({ id, body }) => updateGlossaryTerm(id, body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_GLOSSARY_TERMS_KEY],
      });
    },
  });
}

export interface ReviewGlossaryTermVars {
  id: string;
  body: ReviewGuideBody;
}

export function useReviewGlossaryTerm() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminGlossaryTermDTO | undefined,
    Error,
    ReviewGlossaryTermVars
  >({
    demoMode,
    demoLatencyMs: 0,
    demoResult: () => undefined,
    live: ({ id, body }) => reviewGlossaryTerm(id, body),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_GLOSSARY_TERMS_KEY],
      });
    },
  });
}

export function useDeleteGlossaryTerm() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, string>({
    demoMode,
    demoLatencyMs: 0,
    demoResult: () => undefined,
    live: (id) => deleteGlossaryTerm(id),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_GLOSSARY_TERMS_KEY],
      });
    },
  });
}
