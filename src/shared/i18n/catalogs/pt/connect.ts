import type { Catalog } from "../../types";

/**
 * Ligações — pt-PT inclusivo. Mesmas chaves que `en/connect.ts`. Nomes,
 * interesses e datas relativas ("since"/"sentAgo") são dados de pessoas
 * (em modo live vêm de GET /connections) e mantêm-se em inglês; só o texto
 * à volta é traduzido. Gendering evitado com substantivos/2ª pessoa em vez
 * de particípios/adjetivos concordados (ex.: "Ligação desde" em vez de
 * "Ligados desde"; "Bloqueio" em vez de "Bloqueado/a").
 */
export const connect: Catalog = {
  // Separadores (ConnectionsPage / ConnectionsTabs)
  "tabs.all": "Todas as ligações",
  "tabs.incoming": "Pedidos recebidos",
  "tabs.sent": "Enviados",
  "tabs.blocked": "Bloqueios",
  "tabs.vouched": "Avais",

  // Cabeçalho da página (ConnectionsPage)
  "page.eyebrow": "A tua rede",
  "page.title": "Pessoas que <em>conheceste mesmo.</em>",
  "page.lead":
    "A QueerPulse não faz seguidores. Ligas-te a pessoas quando já as conheceste — num encontro, através de alguém, ou porque te avalizaram. Qualidade em vez de quantidade.",
  "page.inviteCta": "Convidar alguém",
  "page.note":
    "<b>Sem contagem de seguidores, de propósito.</b> Se procuras “seguir as publicações de alguém” sem te ligares primeiro, usa antes o feed de Comunidades. As ligações são bidirecionais — desbloqueiam mensagens e atualizações marcadas.",
  "page.loadMoreLoading": "A carregar…",
  "page.loadMore": "Carregar mais",

  // Toasts das ações da ConnectionsPage
  "toast.connected": "Ligaste-te a {name}",
  "toast.declined": "Pedido recusado, com delicadeza",
  "toast.withdrawn": "Pedido retirado",
  "toast.unblocked": "Desbloqueaste {name}",

  // Menu "mais" de cada cartão (ConnectionCards)
  "moreMenu.ariaMore": "Mais opções para {name}",
  "moreMenu.message": "Mensagem",
  "moreMenu.mute": "Silenciar {name}",
  "moreMenu.unmute": "Deixar de silenciar {name}",
  "moreMenu.block": "Bloquear {name}",
  "moreMenu.unblock": "Desbloquear {name}",
  "moreMenu.report": "Denunciar",
  "moreMenu.toastMuted": "Silenciaste {name}",
  "moreMenu.toastUnmuted": "Deixaste de silenciar {name}",
  "moreMenu.toastBlocked": "Bloqueaste {name}",
  "moreMenu.toastUnblocked": "Desbloqueaste {name}",
  "moreMenu.toastReportSent": "Denúncia enviada sobre {name}",

  // Texto dos cartões (ConnectionCards)
  "card.profileAria": "Perfil de {name}",
  "card.blockedBadge": "Bloqueio",
  "card.message": "Mensagem",
  "card.viewProfile": "Ver perfil",
  "card.mutuals_one": "<b>{count}</b> pessoa em comum",
  "card.mutuals_other": "<b>{count}</b> pessoas em comum",
  "card.connectedSince": "Ligação desde <b>{since}</b>",
  "card.tagsMoreTitle": "Também: {list}",
  "card.noMutuals": "Sem pessoas em comum — revê com atenção",
  "card.sentAgo": "Enviado <b>{sentAgo}</b>",
  "card.decline": "Recusar",
  "card.accept": "Aceitar",
  "card.awaitingReply": "A aguardar resposta",
  "card.awaitingReplySince": "A aguardar resposta · enviado <b>{sentAgo}</b>",
  "card.withdraw": "Retirar",
  "card.unblock": "Desbloquear",
  "card.cantMessage": "Não pode enviar-te mensagens nem ver as tuas atualizações.",

  // Emblema + nota de aval (connections.data.ts, resolvido pelo componente)
  "vouch.forYou": "Avalizou-te",
  "vouch.byYou": "Avalizaste",
  "vouch.mutual": "Aval mútuo",
  "vouch.bothWays": "Aval nos dois sentidos",

  // Introdução do separador Avais (ConnectionsPanels)
  "panelIntro.vouched":
    "Pessoas que avalizaste, ou que te avalizaram. <em>Avalizar é um gesto pequeno mas significativo</em> — fica associado ao perfil dessa pessoa.",

  // Separador Todas as ligações (ConnectionsAllTab)
  "allTab.searchPlaceholder": "Pesquisar por nome, função ou comunidade",
  "allTab.searchAria": "Pesquisar ligações",
  "allTab.sortRecentlyConnected": "Mais recentes",
  "allTab.sortAToZ": "A a Z",
  "allTab.sortClosestMutuals": "Mais em comum",
  "allTab.emptyTitle": "Ainda sem ligações",
  "allTab.emptyDescription":
    "A tua rede começa com um simples olá. Conhece pessoas num encontro ou procura quem já conheces e liga-te depois de se terem encontrado.",
  "allTab.findMembers": "Encontrar pessoas",
  "allTab.emptySearchTitle": "Nada corresponde à tua pesquisa",
  "allTab.emptySearchDescription":
    "Ainda ninguém na tua rede corresponde a essa pesquisa. Limpa-a para veres toda a gente outra vez.",
  "allTab.clearSearch": "Limpar pesquisa",
  "allTab.loadMore": "Carregar mais ligações",

  // Estados vazios de pedidos recebidos / enviados / bloqueios (ConnectionsPanels)
  "panels.requestsEmptyTitle": "Sem pedidos por agora",
  "panels.incomingEmptyDescription":
    "Quando alguém que conheceste pedir para se ligar, aparece aqui para aceitares ou recusares com delicadeza.",
  "panels.sentEmptyDescription":
    "Os pedidos que envias ficam aqui até serem aceites. Explora pessoas e contacta alguém com quem já te cruzaste.",
  "panels.blockedEmptyTitle": "Ainda não bloqueaste ninguém",
  "panels.blockedEmptyDescription":
    "Se alguém tornar o espaço inseguro, bloquear essa pessoa impede as mensagens dela e esconde as tuas atualizações. Aparece aqui se alguma vez precisares de desfazer isso.",

  // Modal de contacto (ConnectModal)
  "modal.close": "Fechar",

  // Formulário de contacto (ConnectForm)
  "form.title": "Diz <em>olá.</em>",
  "form.sub":
    "A tua mensagem vai diretamente. Sem notificações, sem confirmações de leitura, sem algoritmo a observar. Só uma mensagem verdadeira.",
  "form.nameLabel": "O teu nome",
  "form.namePlaceholder": "Como preferes que te chamem",
  "form.emailLabel": "O teu email",
  "form.emailPlaceholder": "Para poderem responder-te",
  "form.reasonLabel": "Sobre o que é?",
  "form.reasonPlaceholder": "Escolhe um motivo, ou deixa em aberto",
  "form.reasonCollaborate": "Gostava de colaborar",
  "form.reasonAdvice": "Gostava de um conselho",
  "form.reasonSawPost": "Vi a tua publicação no mural",
  "form.reasonShouldMeet": "Acho que devíamos conhecer-nos",
  "form.reasonSomethingElse": "Outra coisa qualquer",
  "form.messageLabel": "A tua mensagem",
  "form.messagePlaceholder": "Escreve com naturalidade. Não há modelo.",
  "form.note":
    "As mensagens de pessoas que ainda não estão na rede ficam retidas por breves instantes e são revistas pela equipa antes da entrega. Isto mantém o espaço seguro.",
  "form.cancel": "Cancelar",
  "form.sendingLabel": "A enviar…",
  "form.send": "Enviar",

  // Painel de sucesso após o envio (ConnectSentPanel)
  "sent.title": "Mensagem <em>enviada.</em>",
  "sent.body":
    "A tua mensagem para {name} está a caminho. Se quiser continuar a conversa, essa pessoa responde diretamente para o teu email.",
  "sent.close": "Fechar",
  "sent.autoClose": "A fechar automaticamente daqui a {seconds}s",
};
