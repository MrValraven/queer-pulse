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
  "tabs.vouched": "Votos de confiança",

  // Cabeçalho da página (ConnectionsPage)
  "page.eyebrow": "A tua rede",
  "page.title": "Pessoas que <em>conheceste mesmo.</em>",
  "page.lead":
    "O teu perfil principal não faz seguidores. Ligas-te a pessoas quando já as conheceste: num convívio, através de alguém, ou porque te deram um voto de confiança. Qualidade em vez de quantidade.",
  "page.inviteCta": "Convidar alguém",
  "page.note":
    "<b>Sem contagem de seguidores aqui, de propósito.</b> Queres seguir as publicações de uma persona sem te ligares primeiro? É para isso que servem as personas. As ligações são bidirecionais: desbloqueiam mensagens e atualizações marcadas.",
  "page.loadMoreLoading": "A carregar…",
  "page.loadMore": "Carregar mais",

  // Toasts das ações da ConnectionsPage
  "toast.connected": "Ligaste-te a {name}",
  "toast.declined": "Pedido recusado, com delicadeza",
  "toast.withdrawn": "Pedido retirado",
  "toast.unblocked": "Desbloqueaste {name}",
  "toast.actionFailed": "Não foi possível concluir. Tenta novamente.",

  // Menu "mais" de cada cartão (ConnectionCards)
  "moreMenu.ariaMore": "Mais opções para {name}",
  "moreMenu.message": "Mensagem",
  "moreMenu.mute": "Silenciar {name}",
  "moreMenu.unmute": "Deixar de silenciar {name}",
  "moreMenu.block": "Bloquear {name}",
  "moreMenu.unblock": "Desbloquear {name}",
  "moreMenu.report": "Denunciar",
  "moreMenu.reportTitle": "Denunciar {name}?",
  "moreMenu.toastMuted": "Silenciaste {name}",
  "moreMenu.toastUnmuted": "Deixaste de silenciar {name}",
  "moreMenu.toastBlocked": "Bloqueaste {name}",
  "moreMenu.toastUnblocked": "Desbloqueaste {name}",
  "moreMenu.blockConfirm.title": "Bloquear {name}?",
  "moreMenu.blockConfirm.body":
    "Ao bloquear, a ligação é removida, {name} deixa de te poder enviar mensagens e as tuas atualizações deixam de aparecer. Podes reverter quando quiseres no separador Bloqueios.",
  "moreMenu.blockConfirm.action": "Bloquear",

  // Texto dos cartões (ConnectionCards)
  "card.profileAria": "Perfil de {name}",
  "card.blockedBadge": "Bloqueio",
  "card.message": "Mensagem",
  "card.viewProfile": "Ver perfil",
  "card.mutuals_one": "<b>{count}</b> pessoa em comum",
  "card.mutuals_other": "<b>{count}</b> pessoas em comum",
  "card.connectedSince": "Ligação desde <b>{since}</b>",
  "card.tagsMoreTitle": "Também: {list}",
  "card.noMutuals": "Sem pessoas em comum: revê com atenção",
  "card.sentAgo": "Enviado <b>{sentAgo}</b>",
  "card.introducedBy": "Apresentado por <a>{name}</a>",
  "card.reason": "Sobre <b>{reason}</b>",
  "card.decline": "Recusar",
  "card.accept": "Aceitar",
  "card.awaitingReply": "A aguardar resposta",
  "card.awaitingReplySince": "A aguardar resposta · enviado <b>{sentAgo}</b>",
  "card.withdraw": "Retirar",
  "card.unblock": "Desbloquear",
  "card.cantMessage":
    "Não pode enviar-te mensagens nem ver as tuas atualizações.",

  // Emblema + nota de aval (connections.data.ts, resolvido pelo componente)
  "vouch.forYou": "Deu-te um voto de confiança",
  "vouch.byYou": "Deste um voto de confiança",
  "vouch.mutual": "Voto de confiança mútuo",
  "vouch.bothWays": "Voto de confiança nos dois sentidos",

  // Introdução do separador Avais (ConnectionsPanels)
  "panelIntro.vouched":
    "Pessoas a quem deste um voto de confiança, ou que to deram. <em>Dar um voto de confiança é um gesto pequeno mas significativo</em>. Fica associado ao perfil dessa pessoa.",

  // Separador Todas as ligações (ConnectionsAllTab)
  "allTab.searchPlaceholder": "Pesquisar por nome, função ou comunidade",
  "allTab.searchAria": "Pesquisar ligações",
  "allTab.sortRecentlyConnected": "Mais recentes",
  "allTab.sortAToZ": "A a Z",
  "allTab.sortClosestMutuals": "Mais em comum",
  "allTab.emptyTitle": "Ainda sem ligações",
  "allTab.emptyDescription":
    "A tua rede começa com um simples olá. Conhece pessoas num convívio ou procura quem já conheces e liga-te depois de se terem encontrado.",
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

  // Idade relativa de um pedido (connections.adapters): as duas expressões que
  // o Intl.RelativeTimeFormat não deriva sozinho.
  "ago.justNow": "agora mesmo",
  "ago.unknown": "há pouco",

  // Modal de contacto (ConnectModal)
  "modal.ariaLabel": "Dizer olá",
  "modal.close": "Fechar",
  "modal.loading": "A carregar…",
  "modal.error":
    "Não conseguimos carregar este membro agora. Fecha e tenta novamente daqui a pouco.",

  // Formulário de contacto (ConnectForm)
  "form.title": "Diz <em>olá.</em>",
  "form.sub":
    "A tua mensagem vai diretamente. Sem notificações, sem confirmações de leitura, sem algoritmo a observar. Só uma mensagem verdadeira.",
  "form.reasonLabel": "Sobre o que é?",
  "form.reasonPlaceholder": "Escolhe um motivo, ou deixa em aberto",
  "form.reasonOpenToGroup": "Ao que {first} está disponível",
  "form.reasonGenericGroup": "Outra coisa",
  "form.reasonCollaborate": "Gostava de colaborar",
  "form.reasonAdvice": "Gostava de um conselho",
  "form.reasonSawPost": "Vi a tua publicação no mural",
  "form.reasonShouldMeet": "Acho que devíamos conhecer-nos",
  "form.reasonSomethingElse": "Outra coisa qualquer",
  "form.messageLabel": "A tua mensagem",
  "form.messagePlaceholder": "Escreve com naturalidade. Não há modelo.",
  "form.note":
    "Se ainda não estão ligados, isto chega como um pedido: essa pessoa decide se quer abrir a conversa. De qualquer forma, fica só entre vocês os dois.",
  "form.cancel": "Cancelar",
  "form.sendingLabel": "A enviar…",
  "form.send": "Enviar",
  "form.sendError":
    "Não foi possível enviar. Verifica a ligação e tenta novamente.",
  "form.rateLimitError":
    "Estás a contactar muitas pessoas agora. Espera um minuto e tenta novamente.",

  // Painel de sucesso após o envio (ConnectSentPanel)
  "sent.title": "Mensagem <em>enviada.</em>",
  "sent.body":
    "A tua mensagem para {name} está a caminho. Se quiser continuar, essa pessoa responde-te aqui mesmo, na tua caixa de entrada.",
  "sent.close": "Fechar",
  "sent.autoClose": "A fechar automaticamente daqui a {seconds}s",

  // Painéis de aviso terminais (ConnectNoticePanel) — mostrados quando um
  // contacto não pode seguir e voltar a tentar não ajuda. O tom mantém-se
  // caloroso e nunca revela um bloqueio que não nos foi indicado (ver
  // cannotConnect).
  "notice.close": "Fechar",
  "notice.alreadyPending.title": "Já <em>lhe escreveste.</em>",
  "notice.alreadyPending.body":
    "A tua mensagem já está à espera de {name}. Vão abrir a conversa quando quiserem. Não precisas de enviar outra vez.",
  "notice.alreadyConnected.title": "Já estão <em>ligados.</em>",
  "notice.alreadyConnected.body":
    "Tu e {name} já estão ligados. Abre as mensagens para continuar a conversa.",
  "notice.youBlocked.title": "<em>Bloqueaste</em> {name}.",
  "notice.youBlocked.body":
    "Precisas de desbloquear esta pessoa antes de dizer olá. Podes fazê-lo no perfil dela.",
  "notice.notAccepting.title":
    "{name} não está a aceitar novos <em>pedidos</em> agora.",
  "notice.notAccepting.body":
    "Colocaram os pedidos de contacto em pausa. Podes tentar noutra altura.",
  "notice.needsIntro.title":
    "{name} liga-se através de <em>apresentações.</em>",
  "notice.needsIntro.body":
    "Chegam a novas pessoas através de quem já conhecem. Pede a uma ligação em comum para te apresentar.",
  "notice.cannotConnect.title":
    "Não consegues contactar {name} <em>agora.</em>",
  "notice.cannotConnect.body": "Este contacto não está disponível de momento.",
  "contact.message": "Mensagem",
};
