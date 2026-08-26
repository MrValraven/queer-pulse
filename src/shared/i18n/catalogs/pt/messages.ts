import type { Catalog } from "../../types";

/** Mensagens — pt-PT inclusivo. Mesmas chaves que `en/messages.ts`. Nomes,
 *  pronomes, textos de mensagens e datas antigas mantêm-se em inglês (dados
 *  de pessoas/conversas); só o texto à volta é traduzido. */
export const messages: Catalog = {
  // Lista de conversas (MessagesThreadList)
  "thread.title": "Mensagens",
  "thread.composeTooltip": "Nova mensagem",
  "thread.searchPlaceholder": "Pesquisar mensagens e pessoas…",
  "thread.searchAria": "Pesquisar mensagens e conversas",
  "thread.clearSearch": "Limpar pesquisa",
  "thread.emptyTitle": "Ainda sem conversas",
  "thread.emptyDescription":
    "Quando começares uma conversa, ela fica aqui: um espaço tranquilo e privado só para ti e para quem contactares.",
  "thread.newMessage": "Nova mensagem",
  "thread.presenceOnline": "Online agora",
  "thread.menuAria": "Opções da conversa",
  "thread.pinChat": "Fixar conversa",
  "thread.unpinChat": "Desafixar conversa",
  "thread.pinnedIndicator": "Conversa fixada",
  "thread.pinCapReached": "Podes fixar até 3 conversas",
  "thread.favoriteChat": "Adicionar aos favoritos",
  "thread.unfavoriteChat": "Remover dos favoritos",
  "thread.favoriteIndicator": "Conversa favorita",
  "thread.muteChat": "Silenciar notificações",
  "thread.unmuteChat": "Reativar notificações",
  "thread.mutedIndicator": "Notificações silenciadas",
  "thread.archiveChat": "Arquivar conversa",
  "thread.unarchiveChat": "Desarquivar conversa",
  "thread.archivedIndicator": "Conversa arquivada",
  "thread.deleteChat": "Apagar conversa",
  // Separadores de filtro da caixa de entrada
  "thread.tabAll": "Todas",
  "thread.tabUnread": "Não lidas",
  "thread.tabFavorites": "Favoritas",
  "thread.tabGroups": "Grupos",
  "thread.tabArchived": "Arquivadas",
  "thread.tabEmptyUnread": "Sem conversas por ler",
  "thread.tabEmptyFavorites": "Ainda sem conversas favoritas",
  "thread.tabEmptyGroups": "Ainda sem conversas de grupo",
  "thread.tabEmptyArchived": "Sem conversas arquivadas",
  "thread.tabEmptyAllArchived":
    "Todas as conversas estão arquivadas. Vê o separador Arquivadas para as encontrar.",
  "deleteChat.confirmTitle": "Apagar esta conversa?",
  "deleteChat.confirmBody":
    "Desaparece da tua caixa de entrada e limpa a tua cópia. {name} mantém a dele(a), e se te enviar mensagem outra vez, a conversa volta só com as mensagens novas.",
  "deleteChat.confirmBodyGeneric":
    "Desaparece da tua caixa de entrada e limpa a tua cópia. A outra pessoa mantém a dela, e se te enviar mensagem outra vez, a conversa volta só com as mensagens novas.",
  "deleteChat.confirmCta": "Apagar conversa",
  "deleteChat.cancelCta": "Cancelar",

  // GIF picker (Composer + GifPicker)
  "gif.open": "Enviar um GIF",
  "gif.panelLabel": "Seletor de GIF",
  "gif.searchPlaceholder": "Procurar GIFs",
  "gif.loading": "A carregar GIFs…",
  "gif.empty": "Nenhum GIF encontrado",
  "gif.error": "Não foi possível carregar os GIFs. Tenta de novo",
  "gif.loadMore": "Ver mais",
  "gif.poweredBy": "Com tecnologia KLIPY",
  "gif.comingSoonTitle": "Os GIFs estão a chegar",
  "gif.comingSoonHint":
    "Estamos a preparar a pesquisa de GIFs. Volta em breve para dar movimento às tuas mensagens.",

  // Anexos de imagem (ImageComposerButton do Composer, MessageBubbleBody)
  "attachments.open": "Enviar uma foto",
  "attachments.imageAlt": "Mensagem com foto",
  "attachments.fallbackText": "Foto",
  "attachments.previewUnavailable": "Pré-visualização indisponível",

  // Connection status strip (ConnectionStatusBanner) at the top of the open
  // thread — surfaces when the member is offline or the socket is reconnecting.
  "connection.offline":
    "Estás offline. As mensagens serão enviadas quando voltares a ligar-te.",
  "connection.reconnecting": "A reconectar…",

  // Atalhos — o "?" no compositor que lista os símbolos de menção. Tocar numa
  // linha insere o símbolo na mensagem para abrir a sugestão automática.
  "shortcuts.open": "Atalhos",
  "shortcuts.panelLabel": "Atalhos de menção",
  "shortcuts.title": "Atalhos",
  "shortcuts.hint": "Escreve um símbolo e depois um nome para o ligar.",
  "shortcuts.member": "Mencionar um membro",
  "shortcuts.community": "Ligar uma comunidade",
  "shortcuts.topic": "Etiquetar um tópico",
  "shortcuts.business": "Ligar um negócio",
  "shortcuts.event": "Ligar um evento",
  "shortcuts.thread": "Ligar um tópico do fórum",

  // Pesquisa na caixa de entrada (MessagesSearchResults) — uma caixa, dois tipos
  // de correspondência: conversas por nome e mensagens pelo texto. `{query}` é o
  // termo escrito.
  "search.conversationsLabel": "Conversas",
  "search.messagesLabel": "Mensagens",
  "search.searching": "A procurar nas tuas mensagens…",
  "search.keepTyping": "Continua a escrever para pesquisar as tuas mensagens…",
  "search.noMessages": "Nenhuma mensagem corresponde a “{query}”.",
  "search.emptyTitle": "Ainda não há correspondências",
  "search.emptyDescription":
    "Nada na tua caixa de entrada corresponde a “{query}”. Tenta outra palavra, ou o nome de alguém.",

  // "Pesquisar nesta conversa" (ThreadSearchModal), aberto a partir do
  // cabeçalho da conversa — limitado à conversa aberta, não a toda a caixa de
  // entrada.
  "search.inChatOpen": "Pesquisar nesta conversa",
  "search.inChatTitle": "Pesquisar em {name}",
  "search.inChatPlaceholder": "Pesquisar nesta conversa…",
  "search.inChatAria": "Pesquisar mensagens nesta conversa",

  // Painel da conversa (ConversationPanel)
  "conversation.activeNow": "Ativo/a agora",
  "conversation.officialMeta":
    "Oficial · Não é possível responder nesta conversa",
  // Nome de apresentação para uma conversa oficial/de sistema sem perfil
  // associado (messages.adapters.ts's conversationToView).
  "conversation.officialName": "Equipa QueerPulse",
  "conversation.connectedSinceSuffix": " · Ligação desde {date}",
  "conversation.viewProfile": "Ver perfil",
  "conversation.you": "Tu",
  // Pílula "saltar para o fim" com contagem (plural CLDR: _one / _other).
  "conversation.newMessagesCount_one": "{count} mensagem nova",
  "conversation.newMessagesCount_other": "{count} mensagens novas",
  "conversation.unreadDivider": "Novas mensagens",
  // Rótulo só para leitores de ecrã do separador de não lidas.
  "conversation.unreadDividerAria": "As mensagens novas começam aqui",
  // Anúncio só para leitores de ecrã de uma mensagem recém-chegada (região
  // "polite"). `snippet` é o texto da mensagem, sem espaços à volta.
  "conversation.newMessageAnnouncement": "Nova mensagem de {name}: {snippet}",
  "conversation.loadingOlder": "A carregar mensagens anteriores…",
  "conversation.typing": "{name} está a escrever…",
  "conversation.officialNotice":
    "Esta é uma conversa automática. As respostas não são monitorizadas.",
  "conversation.blockedNotice":
    "Bloqueaste {name}. Desbloqueia esta pessoa a partir do perfil dela para enviares uma mensagem.",
  "conversation.composerPlaceholder": "Mensagem para {name}…",
  "conversation.composerGroupPlaceholder": "Mensagem para o grupo…",
  "conversation.leftGroupNotice":
    "Saíste deste grupo. O histórico fica aqui, mas já não podes enviar mensagens novas.",
  "conversation.send": "Enviar",
  "conversation.backToList": "Voltar às conversas",
  "conversation.emptyPanelTitle": "As tuas mensagens ficam aqui",
  "conversation.emptyPanelBody":
    "Escolhe uma conversa à esquerda, ou começa uma nova: um espaço tranquilo e privado só para ti e para quem contactares.",
  "day.today": "Hoje",
  "day.yesterday": "Ontem",
  // Rótulo só para leitores de ecrã do separador de dia; `day` é o cabeçalho
  // visível ("Hoje"/"Ontem" localizado ou uma data).
  "day.separatorLabel": "Mensagens de {day}",
  "time.justNow": "Agora mesmo",
  "status.sending": "A enviar…",
  "status.sent": "Enviada",
  "status.delivered": "Entregue",
  "status.retry": "Não entregue · Tentar de novo",
  "status.seen": "Visto",

  // Barra de ações por mensagem (MessageActions/ReactionPicker)
  "actions.react": "Reagir",
  "actions.more": "Mais",
  "actions.report": "Denunciar",
  "actions.delete": "Eliminar",

  // Overlay de pressão longa/clique direito (MessageActionOverlay) — reutiliza
  // actions.report/actions.delete acima para os seus próprios itens de menu.
  "actions.menuLabel": "Ações da mensagem",
  "actions.overlayLabel": "Opções da mensagem",
  "actions.reactionsLabel": "Reagir à mensagem",
  "actions.reply": "Responder",
  "actions.forward": "Reencaminhar",
  // Mostrado acima de uma bolha cujo conteúdo foi reencaminhado de outra conversa.
  "actions.forwardedLabel": "Reencaminhada",
  "actions.pin": "Fixar",
  "actions.unpin": "Desafixar",
  "actions.star": "Guardar",
  "actions.unstar": "Remover",
  "actions.edit": "Editar",
  "actions.copy": "Copiar",
  "actions.edited": "editada",
  "actions.editing": "A editar mensagem",
  "actions.editSave": "Guardar",
  "actions.editCancel": "Cancelar",
  replyDeleted: "Mensagem eliminada",
  tombstone: "Esta mensagem foi eliminada",
  "delete.confirmTitle": "Eliminar esta mensagem?",
  "delete.confirmBody": "Será removida para todos nesta conversa.",
  "delete.confirmCta": "Eliminar",
  "delete.cancelCta": "Cancelar",
  "report.title": "Denunciar esta mensagem",

  // Pré-visualização de link (LinkPreview) — o corpo do cartão é conteúdo da
  // página remota e mantém-se como obtido; só o rótulo para leitor de ecrã é
  // traduzido aqui.
  "linkPreview.aria": "Pré-visualização do link: {title}",
  "linkPreview.ariaGeneric": "Pré-visualização do link de {site}",

  // Faixa de mensagens fixadas (ConversationPinnedBanner) + indicadores na bolha
  "pinned.bannerLabel": "Mensagem fixada",
  // Várias fixadas: mostra a posição na pilha, ex. "Fixada · 1/3".
  "pinned.bannerCounted": "Fixada · {index}/{total}",
  "pinned.jumpAria": "Ir para a mensagem fixada: {snippet}",
  "pinned.indicator": "Fixada",
  "starred.indicator": "Guardada",

  // Escolha de destinatário para reencaminhar (NewMessageModal, modo reencaminhar)
  "forward.title": "Reencaminhar para…",
  "forward.sub":
    "Escolhe uma ligação ou grupo para reencaminhar esta mensagem.",
  "forward.sectionPeople": "Pessoas",
  "forward.sectionGroups": "Grupos",

  // Vista de mensagens guardadas (StarredMessagesModal)
  "starred.title": "Mensagens guardadas",
  "starred.open": "Mensagens guardadas",
  "starred.sub": "Mensagens que guardaste. Só tu as vês.",
  "starred.loading": "A carregar as tuas mensagens guardadas…",
  "starred.empty":
    "Ainda não guardaste nada. Guarda uma mensagem para a manteres aqui.",

  // Escolha de destinatário para nova mensagem (NewMessageModal)
  "newMessage.title": "Nova mensagem",
  "newMessage.sub":
    "Escolhe uma ligação, ou procura alguém novo para contactar.",
  "newMessage.searchPlaceholder": "Pesquisar ligações ou pessoas…",
  "newMessage.searchAria": "Pesquisar ligações e membros",
  "newMessage.loading": "A carregar as tuas ligações…",
  "newMessage.none": "Ainda não tens ligações.",
  "newMessage.empty": "Nenhuma ligação corresponde a “{query}”.",
  "newMessage.back": "Voltar",
  // Alternativa: membros encontrados que ainda NÃO são uma ligação aceite —
  // escolher um abre o compositor de pedido de mensagem em vez de uma conversa.
  "newMessage.sectionStrangers": "Contactar alguém novo",
  "newMessage.strangerSub": "Ainda sem ligação",

  // Compositor de pedido de mensagem (MessageRequestComposer), o passo que o
  // NewMessageModal mostra para um membro escolhido que ainda não é uma
  // ligação — POST /messages/request, que entrega diretamente se afinal já
  // estiverem ligados, ou cria um pedido de ligação caso contrário.
  "request.notConnectedYet": "Ainda não estão ligados",
  "request.composeIntro":
    "Apresenta-te. Se aceitar, ficam ligados e esta torna-se a vossa primeira conversa.",
  "request.composePlaceholder": "Diz olá a {name}…",
  "request.composeAria": "A tua mensagem",
  "request.sendCta": "Enviar pedido",
  "request.sendingLabel": "A enviar…",
  "request.sentToast": "Pedido de mensagem enviado a {name}.",
  "request.sentDirectToast": "Mensagem enviada a {name}.",
  "request.errorToast":
    "Não foi possível enviar a tua mensagem. Tenta de novo.",

  // Separador "Pedidos" da caixa de entrada (pedidos de mensagem recebidos,
  // com aceitar/recusar)
  "requests.tabLabel": "Pedidos",
  "requests.emptyTitle": "Sem pedidos de mensagem",
  "requests.emptyDescription":
    "Quando alguém sem ligação contigo te envia uma primeira mensagem, ela aparece aqui para aceitares ou recusares.",

  // Conversas em grupo (#17) — escolha de criação (NewGroupModal), cabeçalho +
  // info do grupo (ConversationHeader / GroupInfoModal), aviso de saída.
  // Título de apresentação para um grupo sem título (messages.adapters.ts).
  "group.untitled": "Grupo",
  "group.newTooltip": "Novo grupo",
  "group.newTitle": "Novo grupo",
  "group.newSub": "Dá um nome ao grupo e escolhe quem entra.",
  "group.namePlaceholder": "Nome do grupo",
  "group.nameAria": "Nome do grupo",
  "group.searchPlaceholder": "Pesquisar ligações para adicionar…",
  "group.createCta": "Criar grupo ({count})",
  "group.info": "Informações do grupo",
  "group.infoTitle": "Informações do grupo",
  // Subtítulo com contagem de membros (plural CLDR: _one / _other).
  "group.memberCount_one": "{count} membro",
  "group.memberCount_other": "{count} membros",
  "group.roleOwner": "Dono/a",
  "group.roleAdmin": "Admin",
  "group.leave": "Sair do grupo",
  "group.leaving": "A sair…",
  // Gestão do grupo (#17 Fase 2) — ações da lista, editar, adicionar membros.
  "group.edit": "Editar grupo",
  "group.add": "Adicionar membros",
  "group.addTitle": "Adicionar membros",
  "group.addCta": "Adicionar ({count})",
  "group.promote": "Tornar admin",
  "group.demote": "Remover admin",
  "group.remove": "Remover",
  // Passo de confirmação antes de remover um membro (sem ação destrutiva sem
  // confirmar). Caloroso, sem culpar; o cancelar mantém-no no grupo.
  "group.removeConfirm.title": "Remover {name}?",
  "group.removeConfirm.body":
    "{name} vai perder o acesso a este grupo e às suas mensagens. Podes voltar a adicionar quando quiseres.",
  "group.removeConfirm.cancel": "Manter no grupo",
  "group.removeConfirm.confirm": "Remover membro",
  "group.avatarLabel": "Foto do grupo",
  // Recibo de grupo "Visto por N" (plural CLDR: _one / _other) — a linha sob a
  // própria mensagem e o título da folha.
  "group.seenByCount_one": "Visto por {count}",
  "group.seenByCount_other": "Visto por {count}",
  "group.seenByTitle_one": "Visto por {count} pessoa",
  "group.seenByTitle_other": "Visto por {count} pessoas",
  // Rótulos de "está a escrever" em grupo (um só reutiliza conversation.typing).
  "group.typingTwo": "{first} e {second} estão a escrever…",
  "group.typingMany": "Várias pessoas estão a escrever…",
  "group.typingSomeone": "Alguém está a escrever…",

  // Mensagens de sistema (pílulas de evento centradas — SystemMessagePill).
  // Os nomes de autor/alvo chegam já resolvidos do servidor (ou do mock demo).
  "system.groupCreatedYou": "Criaste o grupo",
  "system.groupCreated": "{actor} criou o grupo",
  "system.memberAddedYou": "Adicionaste {target}",
  "system.memberAdded": "{actor} adicionou {target}",
  "system.memberRemovedYou": "Removeste {target}",
  "system.memberRemoved": "{actor} removeu {target}",
  "system.memberLeftYou": "Saíste",
  "system.memberLeft": "{actor} saiu",
  "system.groupRenamedYou": "Mudaste o nome do grupo para “{value}”",
  "system.groupRenamed": "{actor} mudou o nome do grupo para “{value}”",

  // ── Segurança — bloquear/denunciar um membro + aviso de partilha (Wave A) ──
  "conversation.reportMemberAction": "Denunciar {name}",
  "report.memberTitle": "Denunciar {name}?",
  "conversation.contactSafetyNotice":
    "Mantém a conversa aqui até confiares em alguém. Nunca envies dinheiro, nem partilhes dados bancários. Anúncios verdadeiros não pedem isso.",
};
