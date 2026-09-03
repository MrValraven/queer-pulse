import type { Catalog } from "../../types";

/**
 * Simulations, the dev-only `/simulations/` sandbox gallery and player.
 * Pane title/intro copy, the start-simulation call to action, and the
 * device-frame player chrome (back link, not-found state, device toggle).
 */
export const simulations: Catalog = {
  "home.title": "Simulações de fluxo",
  "home.intro":
    "Pré-visualize as principais jornadas de membros do início ao fim. Cada simulação corre num ambiente isolado, sem dados reais, para percorreres tudo tal como outra pessoa faria.",
  "home.start": "Iniciar simulação",
  "home.backToApp": "Voltar à aplicação",
  "home.searchPlaceholder": "Filtrar simulações",
  "home.noResults": "Nenhuma simulação corresponde ao filtro.",
  "player.back": "Simulações",
  "player.notFound": "Não encontrámos essa simulação. Pode ter sido renomeada.",
  "player.backToGallery": "Voltar às simulações",
  "player.deviceGroupAriaLabel": "Dispositivo de pré-visualização",
  "player.mobile": "Telemóvel",
  "player.desktop": "Computador",
  "player.replay": "Repetir",
  "player.openFullScreen": "Abrir em novo separador",
  "player.loading": "A carregar simulação…",
  "player.loadError": "Não foi possível carregar esta simulação.",
  insideSandbox:
    "As simulações não estão disponíveis dentro de uma simulação em curso.",
};
