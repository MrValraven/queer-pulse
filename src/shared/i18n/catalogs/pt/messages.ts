import type { Catalog } from "../../types";

/** Mensagens — pt-PT inclusivo. Mesmas chaves que `en/messages.ts`. Nomes,
 *  pronomes, textos de mensagens e datas antigas mantêm-se em inglês (dados
 *  de pessoas/conversas); só o texto à volta é traduzido. */
export const messages: Catalog = {
  // Lista de conversas (MessagesThreadList)
  "thread.composeTooltip": "Nova mensagem",
  "thread.searchPlaceholder": "Pesquisar mensagens e pessoas…",
  "thread.searchAria": "Pesquisar mensagens e conversas",
  "thread.clearSearch": "Limpar pesquisa",
  // DES-194: anunciado enquanto o primeiro carregamento da caixa de entrada
  // está em curso, já que as linhas do esqueleto por baixo são todas
  // `aria-hidden`.
  "thread.loadingInbox": "A carregar as tuas conversas…",
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
  // PRD-225. Uma entrada do menu que alterna consoante o estado da conversa,
  // como todos os pares acima. "Marcar como lida" reutiliza a mutação normal
  // de leitura, por isso avança a marca real e limpa a marcação manual no
  // mesmo pedido.
  "thread.markUnread": "Marcar como não lida",
  "thread.markRead": "Marcar como lida",
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
  // PRD-357: "apagar conversa" num GRUPO só limpa a tua própria cópia (não há
  // "apagar para todos" num grupo), por isso o texto é próprio de grupo em vez
  // de reutilizar o de cima, que promete que a conversa "volta", uma promessa
  // que um grupo não pode fazer.
  "deleteChat.confirmTitleGroup": "Limpar esta conversa de grupo?",
  "deleteChat.confirmBodyGroup":
    "Isto limpa a conversa de grupo só para ti. Os outros membros mantêm a deles, e continuas a poder enviar mensagens se fores um membro ativo.",
  "deleteChat.confirmCtaGroup": "Limpar conversa",

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

  // Seletor de emoji (EmojiComposerButton + EmojiPicker) — só no ambiente de
  // computador, o botão de sorriso dentro da barra de escrita. Os nomes das
  // categorias servem também de nome acessível para cada separador da lista
  // (botões só com ícone).
  "emoji.trigger": "Emoji",
  "emoji.panelLabel": "Seletor de emoji",
  "emoji.searchPlaceholder": "Procurar emoji",
  "emoji.loading": "A carregar emoji…",
  "emoji.loadError": "Não foi possível carregar os emoji. Tenta de novo",
  "emoji.empty": "Nenhum emoji encontrado",
  "emoji.railLabel": "Categorias de emoji",
  "emoji.recentsLabel": "Usados recentemente",
  "emoji.categorySmileys": "Smileys e emoções",
  "emoji.categoryPeople": "Pessoas e corpo",
  "emoji.categoryAnimals": "Animais e natureza",
  "emoji.categoryFood": "Comida e bebida",
  "emoji.categoryActivities": "Atividades",
  "emoji.categoryTravel": "Viagens e lugares",
  "emoji.categoryObjects": "Objetos",
  "emoji.categorySymbols": "Símbolos",
  "emoji.categoryFlags": "Bandeiras",

  // Menu de anexos (ComposerAttachButton) — o clipe dentro da barra de
  // escrita e o menu Foto / Ficheiro / GIF que abre. As linhas reutilizam
  // attachments.open, attachments.openDocument e gif.open como rótulos
  // VISÍVEIS, para nunca dizerem uma coisa e anunciarem outra.
  "attachments.menuOpen": "Anexar",
  "attachments.menuLabel": "Anexar a esta mensagem",

  // Anexos de imagem (ImageComposerButton do Composer, MessageBubbleBody)
  "attachments.open": "Enviar uma foto",
  "attachments.imageAlt": "Mensagem com foto",
  "attachments.fallbackText": "Foto",
  "attachments.previewUnavailable": "Pré-visualização indisponível",

  // Ecrã de legenda em ecrã inteiro (AttachmentCaptionScreen), estilo
  // WhatsApp Web, aberto depois de escolheres uma foto ou GIF, antes de
  // seguir como mensagem.
  "attachments.captionScreenLabel": "Adiciona uma legenda antes de enviar",
  "attachments.captionPlaceholder": "Adiciona uma legenda",
  "attachments.captionSend": "Enviar",
  "attachments.captionDiscard": "Descartar",

  // Visualizador de fotos em ecrã inteiro (ChatImageViewer e a sua barra),
  // aberto ao tocar numa bolha de foto ou GIF. Responder/Reencaminhar/Guardar
  // reutilizam as chaves actions.* acima.
  "viewer.open": "Abrir a foto de {sender}",
  "viewer.dialogLabel": "Foto de {sender}, {time}",
  "viewer.close": "Fechar a foto",
  "viewer.counter": "{index} / {total}",
  "viewer.counterAnnouncement": "Foto {index} de {total}, de {sender}",
  "viewer.you": "Tu",
  "viewer.save": "Descarregar",
  "viewer.saved": "Foto descarregada",
  "viewer.saveFallback":
    "Não foi possível descarregar a foto, por isso abrimos numa nova aba.",
  "viewer.saveFailed": "Não foi possível descarregar a foto. Tenta de novo.",
  "viewer.prev": "Foto anterior",
  "viewer.next": "Foto seguinte",

  // Tira de miniaturas na parte inferior do visualizador de fotos em ecrã inteiro
  "viewer.filmstripLabel": "Fotos nesta conversa",
  "viewer.filmstripItem": "Foto {index} de {total}, de {sender}",
  "viewer.gifBadge": "GIF",

  // Anexos de documento (DocumentComposerButton, MessageDocumentAttachment,
  // MessageBubbleBody, documentUploadProcessing)
  "attachments.openDocument": "Enviar um ficheiro",
  "attachments.documentFallbackText": "Ficheiro",
  "attachments.documentPreviewUnavailable":
    "Pré-visualização do ficheiro indisponível",
  "attachments.documentMeta": "{format} · {size}",
  "attachments.download": "Descarregar {fileName}",
  "attachments.documentError.unsupportedType":
    "Esse tipo de ficheiro não é suportado. Usa um ficheiro PDF, TXT, CSV ou XLSX.",
  "attachments.documentError.tooLarge":
    "Esse ficheiro é demasiado grande. Mantém-no abaixo de {maxLabel}.",
  "attachments.documentError.retry":
    "Não conseguimos enviar esse ficheiro. Tenta de novo.",
  // Ver o comentário na versão EN: o passo de confirmação antes de abrir um
  // ficheiro recebido.
  "attachments.confirmOpenTitle": "Abrir este ficheiro?",
  "attachments.confirmOpenBody":
    "Abre só ficheiros de pessoas em quem confias. PDFs e folhas de cálculo podem conter conteúdo prejudicial.",
  "attachments.confirmOpenFileLabel": "{fileName} ({format}, {size})",

  // Links dentro de uma mensagem (linkify.tsx). Texto só para leitores de ecrã
  // que explica o ícone de link externo.
  "link.opensExternally": "abre um site externo",
  // Ver o comentário na versão EN: o passo de confirmação de um link com ar
  // pouco seguro. `{host}` é o domínio para onde o link leva mesmo.
  "link.confirmTitle": "Confere este link antes de o abrires",
  "link.confirmDestination": "Na verdade leva-te a {host}.",
  "link.suspiciousReason.shortener":
    "Este é um link encurtado, por isso esconde para onde leva de verdade.",
  "link.suspiciousReason.punycode":
    "Este endereço usa caracteres parecidos para disfarçar para onde leva.",
  "link.suspiciousReason.ipAddress":
    "Este link aponta diretamente para um endereço numérico, em vez de um site normal.",
  "link.suspiciousReason.credentialsInUrl":
    "Este link esconde o destino real atrás de outro endereço.",
  "link.suspiciousReason.lookalike":
    "Este endereço imita o domínio de uma marca conhecida.",

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
  // Mostrado para uma pesquisa demasiado curta para ter corrido de facto —
  // distinto de `emptyTitle`, que assume uma pesquisa real sem resultados.
  "search.tooShortTitle": "Continua a escrever",
  "search.tooShortDescription":
    "Escreve pelo menos duas letras e procuramos na tua caixa de entrada.",

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
  // DES-227: as versões "removida/o" e "terminado" do aviso de saída acima,
  // para os três estados se lerem como uma só família de texto.
  "conversation.removedGroupNotice":
    "Removeram-te deste grupo. O histórico fica aqui, mas já não podes enviar mensagens novas.",
  "conversation.dissolvedGroupNotice":
    "Este grupo terminou. O histórico fica aqui, mas já não podes enviar mensagens novas.",
  // PRD-220: um contacto inicial (casa, colegas de casa) abre uma conversa a
  // dois entre pessoas que ainda não estão ligadas, e as respostas de ambos os
  // lados são recusadas até isso mudar. Aparece no lugar da caixa de escrita,
  // com a ação que resolve. O estado depende do pedido de ligação até agora.
  "conversation.connectionRequiredNotice":
    "Para responderes aqui, precisas primeiro de uma ligação com {name}.",
  "conversation.connectionRequiredSendCta": "Enviar pedido de ligação",
  "conversation.connectionRequiredPendingNotice":
    "O teu pedido de ligação a {name} continua à espera de resposta.",
  "conversation.connectionRequiredIncomingNotice":
    "{name} quer ligar-se a ti. Aceita para continuarem esta conversa.",
  "conversation.connectionRequiredAcceptCta": "Aceitar e responder",
  "conversation.connectionRequiredDeclineCta": "Agora não",
  "conversation.send": "Enviar",
  "conversation.composeAria": "Escreve uma mensagem",
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
  // Ver o comentário na versão EN: envio recusado por uma restrição de
  // moderação; `status.retryAction` é só o verbo.
  "status.restricted":
    "Não entregue · Bloqueada por uma restrição de moderação",
  "status.retryAction": "Tentar de novo",

  // Barra de ações por mensagem (MessageActions/ReactionPicker)
  "actions.react": "Reagir",
  "actions.more": "Mais",
  "actions.report": "Denunciar",
  "actions.delete": "Eliminar",
  // PRD-227. Aparece a todos os participantes em todas as mensagens, ao
  // contrário do `actions.delete` acima, que só a autoria ou a equipa alcança:
  // esconder uma mensagem do teu lado é sempre teu.
  "actions.deleteForMe": "Eliminar só para mim",

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
  // PRD-227 "eliminar só para mim": uma SEGUNDA coisa, por pessoa, ao lado da
  // lápide acima, nunca em vez dela. O texto tem de ser claro sobre quem
  // continua a ver a mensagem, porque as duas opções ficam lado a lado e
  // escolher a errada não se desfaz.
  "delete.confirmForMeTitle": "Eliminar esta mensagem só para ti?",
  "delete.confirmForMeBody":
    "A mensagem sai apenas do teu lado da conversa. A outra pessoa continua a vê-la.",
  "delete.confirmForMeCta": "Eliminar só para mim",
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
  // Estado de salto para uma mensagem sobre o registo (MessageJumpStatus):
  // carrega histórico mais antigo até encontrar a mensagem citada, fixada ou pesquisada.
  "jump.finding": "A procurar essa mensagem…",
  "jump.notFound":
    "Não conseguimos encontrar essa mensagem. Pode ter sido eliminada ou já não estar disponível.",
  "jump.tooFar":
    "Essa mensagem está mais atrás do que conseguimos alcançar agora. Desliza para cima para continuares à procura.",
  "jump.loadFailed":
    "Não conseguimos carregar as mensagens anteriores para a encontrar. Verifica a tua ligação e tenta outra vez.",
  "pinned.indicator": "Fixada",
  "starred.indicator": "Guardada",
  // PRD-332: aviso na app para uma mensagem nova numa conversa que não está
  // aberta (useIncomingMessageBanner). Ver a nota EN.
  "incomingBanner.message": "{name}: {preview}",
  "incomingBanner.groupMessage": "{name} em {group}: {preview}",
  "incomingBanner.open": "Abrir",

  // Escolha de destinatário para reencaminhar (NewMessageModal, modo reencaminhar)
  "forward.title": "Reencaminhar para…",
  "forward.sectionPeople": "Pessoas",
  "forward.sectionGroups": "Grupos",

  // Vista de mensagens guardadas (StarredMessagesModal)
  "starred.title": "Mensagens guardadas",
  "starred.open": "Mensagens guardadas",
  "starred.sub": "Mensagens que guardaste. Só tu as vês.",
  "starred.loading": "A carregar as tuas mensagens guardadas…",
  "starred.empty":
    "Ainda não guardaste nada. Guarda uma mensagem para a manteres aqui.",
  "starred.searchPlaceholder": "Pesquisar mensagens guardadas",
  "starred.searchAria":
    "Pesquisar mensagens guardadas por texto, remetente ou conversa",
  "starred.filter.all": "Todas",
  "starred.filter.photos": "Fotos",
  "starred.filter.documents": "Documentos",
  "starred.filter.links": "Links",
  "starred.filter.groupLabel": "Filtrar mensagens guardadas por tipo",
  "starred.resultsCount_one": "{count} resultado",
  "starred.resultsCount_other": "{count} resultados",
  "starred.resultsCountAtLeast_one": "{count}+ resultado",
  "starred.resultsCountAtLeast_other": "{count}+ resultados",
  "starred.noMatchesTitle": "Nenhuma mensagem guardada corresponde",
  "starred.noMatchesDescription": "Tenta outra pesquisa ou filtro.",
  "starred.clearFilters": "Limpar filtros",
  "starred.loadMore": "Carregar mais",
  "starred.loadingMore": "A carregar mais…",
  "starred.loadError": "Não foi possível carregar as tuas mensagens guardadas.",
  "starred.moreLoaded_one": "Mais {count} mensagem carregada",
  "starred.moreLoaded_other": "Mais {count} mensagens carregadas",

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

  // Compositor de primeiro contacto partilhado (FirstContactComposer,
  // PRD-340): a ÚNICA superfície de composição que cada porta de "contactar
  // alguém novo" mostra: ConnectForm (Ligações > Diz olá), MessageRequestComposer
  // (Mensagens > Nova mensagem) e o Responder do MessagesInboundRequestCard
  // (responder a um pedido de um estranho, em que enviar É aceitar).
  // "notConnectedYet"/"composeIntro" são partilhadas pelas duas portas de
  // ENVIO; "replyAccepts", etc. são a moldura honesta da porta de resposta.
  "firstContact.notConnectedYet": "Ainda não estão ligados",
  "firstContact.composeIntro":
    "Apresenta-te. Se {name} aceitar, ficam ligados e esta torna-se a vossa primeira conversa.",
  "firstContact.composePlaceholder": "Diz olá a {name}…",
  "firstContact.composeAria": "A tua mensagem",
  "firstContact.sendCta": "Enviar pedido",
  "firstContact.sendingLabel": "A enviar…",
  "firstContact.charactersLeft": "Caracteres restantes: {remaining}",
  "firstContact.replyAccepts":
    "Enviar uma resposta aceita o pedido de ligação de {name}.",
  "firstContact.replyPlaceholder": "Escreve a tua resposta a {name}…",
  "firstContact.replyAria": "A tua resposta",
  "firstContact.replySendCta": "Enviar e aceitar",
  "firstContact.cancelReply": "Cancelar",

  // Separador "Pedidos" da caixa de entrada (pedidos de mensagem recebidos,
  // com aceitar/recusar)
  "requests.tabLabel": "Pedidos",
  "requests.emptyTitle": "Sem pedidos de mensagem",
  "requests.loadErrorBody":
    "Não conseguimos carregar os teus pedidos de mensagem. Os que estiverem à tua espera continuam lá. Tenta outra vez daqui a pouco.",
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
  // PRD-357: termina o grupo para todos (rodapé do GroupInfoModal, só dono/a).
  "group.dissolveAction": "Terminar grupo",
  // Gestão do grupo (#17 Fase 2) — ações da lista, editar, adicionar membros.
  "group.edit": "Editar grupo",
  "group.add": "Adicionar membros",
  "group.addTitle": "Adicionar membros",
  "group.addCta": "Adicionar ({count})",
  // DES-229: limite MAX_GROUP_MEMBERS, mostrado nos seletores de criação e de
  // adicionar membros, e mapeado a partir da recusa codificada GROUP_FULL do servidor.
  "group.selectedOfCap": "{selected} de {max} selecionados",
  "group.capReachedExtra": "Esse é o máximo que podes adicionar de uma vez.",
  "group.full": "Este grupo está cheio",
  "group.fullBody":
    "Este grupo atingiu o limite de {max} membros. Não podes adicionar mais ninguém por agora.",
  "group.fullToast": "Este grupo pode ter até {max} membros",
  // DES-228: aparece na própria linha de um dono na lista.
  "group.makeOwner": "Tornar dono",
  "group.promote": "Tornar admin",
  "group.demote": "Remover admin",
  "group.remove": "Remover",
  // PRD-354: menu de Bloquear/Denunciar por linha da lista (GroupMemberRowSafetyMenu).
  "group.memberSafetyMenuAriaLabel": "Mais opções para {name}",
  // Passo de confirmação antes de remover um membro (sem ação destrutiva sem
  // confirmar). Caloroso, sem culpar; o cancelar mantém-no no grupo.
  "group.removeConfirm.title": "Remover {name}?",
  "group.removeConfirm.body":
    "{name} vai perder o acesso a este grupo e às suas mensagens. Podes voltar a adicionar quando quiseres.",
  "group.removeConfirm.cancel": "Manter no grupo",
  "group.removeConfirm.confirm": "Remover membro",
  // DES-228: sair, com uma variante própria de dono (sucessor/termina) e uma
  // saída para "Transferir a titularidade em vez disso".
  "group.leaveConfirm.title": "Sair do grupo?",
  "group.leaveConfirm.body":
    'Deixas de receber mensagens de "{name}" a não ser que alguém te volte a adicionar.',
  "group.leaveConfirm.ownerBodySuccessor":
    'Se saíres de "{name}", {successor} passa a ser o novo dono.',
  "group.leaveConfirm.ownerBodyEnds":
    'Não fica mais ninguém em "{name}". Sair vai terminar o grupo para todos.',
  "group.leaveConfirm.cancel": "Cancelar",
  "group.leaveConfirm.confirm": "Sair",
  "group.leaveConfirm.transferInstead":
    "Transferir a titularidade em vez disso",
  // DES-228: entrega a titularidade a outro membro.
  "group.transferConfirm.title": "Tornar {name} no dono?",
  "group.transferConfirm.body":
    "{name} passa a ser o dono e tu passas a admin. Só o novo dono pode transferir a titularidade ou terminar o grupo depois disto.",
  "group.transferConfirm.cancel": "Cancelar",
  "group.transferConfirm.confirm": "Tornar dono",
  // PRD-357: termina o grupo para todos (GroupDissolveConfirm).
  "group.dissolveConfirm.title": 'Terminar "{name}" para todos?',
  "group.dissolveConfirm.body":
    "Todos os membros saem, o histórico da conversa continua legível para quem esteve nela, e ninguém pode voltar a publicar. Isto não pode ser desfeito.",
  "group.dissolveConfirm.cancel": "Cancelar",
  "group.dissolveConfirm.confirm": "Terminar grupo",
  "group.avatarLabel": "Foto do grupo",
  // PRD-358: a descrição do grupo (GroupInfoEditPanel / GroupInfoIdentityView).
  "group.descriptionLabel": "Descrição",
  "group.descriptionPlaceholder": "Adiciona uma descrição",
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

  // ENG-238: assim que a pessoa sair/for removida/o grupo terminar, a lista
  // fica escondida (o servidor envia `members: []`) e este aviso substitui-a
  // (GroupInfoLeftNotice), consoante `leftReason`.
  "group.leftNotice.left":
    "Saíste deste grupo. Ainda podes ler as mensagens antigas aqui.",
  "group.leftNotice.removed":
    "Foste removido deste grupo. Ainda podes ler as mensagens antigas aqui.",
  "group.leftNotice.dissolved":
    "Este grupo terminou. Ainda podes ler as mensagens antigas aqui.",

  // PRD-358: o link de convite revogável do grupo (GroupInviteLinkSection) e
  // os convites que ele, ou uma adição direta, deixaram pendentes (GroupPendingInvitesList).
  "group.inviteLink.title": "Link de convite",
  "group.inviteLink.copiedToast": "Link de convite copiado",
  "group.inviteLink.copy": "Copiar",
  "group.inviteLink.reset": "Repor link",
  "group.inviteLink.turnOff": "Desativar",
  "group.inviteLink.create": "Criar link de convite",
  "group.inviteLink.resetConfirmTitle": "Repor o link de convite?",
  "group.inviteLink.resetConfirmBody":
    "O link antigo deixa de funcionar de imediato. Quem ainda o tiver não vai conseguir entrar com ele.",
  // Título com contagem de convites pendentes (plural CLDR: _one / _other).
  "group.pendingInvites.title_one": "{count} convite pendente",
  "group.pendingInvites.title_other": "{count} convites pendentes",
  "group.pendingInvites.revoke": "Revogar",
  "group.pendingInvites.revokeAriaLabel": "Revogar convite a {name}",

  // Avisos codificados de erro de grupo (api/groupErrorMessages.ts): uma
  // frase bilingue por código de recusa do servidor, partilhada por todas as
  // chamadas de adicionar/convidar/entrar/fixar, para a mesma recusa se ler
  // sempre da mesma forma.
  "group.error.groupDissolved": "Este grupo terminou.",
  "group.error.addRefused": "Esta pessoa não pode ser adicionada agora.",
  "group.error.inviteNotFound": "Esse convite já não está disponível.",
  "group.error.inviteLinkInvalid": "Este link de convite já não é válido.",
  "group.error.removedFromGroup":
    "Foste removido/a deste grupo e não podes voltar a entrar assim.",
  "group.error.pinLimitReached":
    "Esta conversa já tem o número máximo de mensagens fixadas.",
  "group.error.generic":
    "Algo correu mal com essa ação de grupo. Tenta outra vez.",

  // Mensagens de sistema (pílulas de evento centradas — SystemMessagePill).
  // Os nomes de autor/alvo chegam já resolvidos do servidor (ou do mock demo).
  "system.groupCreatedYou": "Criaste o grupo",
  "system.groupCreated": "{actor} criou o grupo",
  "system.memberAddedYou": "Adicionaste {target}",
  "system.memberAdded": "{actor} adicionou {target}",
  // Variante "o alvo sou eu" (`targetIsMe` do DES-227) dos eventos já
  // existentes member_added/member_removed, que só tinham a variante
  // "o autor sou eu".
  "system.memberAddedTarget": "{actor} adicionou-te",
  "system.memberRemovedYou": "Removeste {target}",
  "system.memberRemoved": "{actor} removeu {target}",
  "system.memberRemovedTarget": "{actor} removeu-te",
  "system.memberLeftYou": "Saíste",
  "system.memberLeft": "{actor} saiu",
  "system.groupRenamedYou": "Mudaste o nome do grupo para “{value}”",
  "system.groupRenamed": "{actor} mudou o nome do grupo para “{value}”",
  // PRD-355/DES-227: pílulas de cargo, titularidade, foto, descrição, entrada
  // e término. "Admin" mantém-se sem tradução em PT (como `group.roleAdmin`)
  // para evitar a concordância de género.
  "system.memberPromotedYou": "Tornaste {target} admin",
  "system.memberPromotedTarget": "{actor} tornou-te admin",
  "system.memberPromoted": "{actor} tornou {target} admin",
  "system.memberDemotedYou": "Removeste {target} como admin",
  "system.memberDemotedTarget": "{actor} removeu-te como admin",
  "system.memberDemoted": "{actor} removeu {target} como admin",
  // O dono anterior (o autor do evento) nunca é nomeado neste texto, só o
  // novo dono (o alvo), por isso não há variante "o autor sou eu".
  "system.ownerChangedYou": "Agora és dono/a do grupo",
  "system.ownerChanged": "{target} é agora dono/a do grupo",
  "system.groupPhotoChangedYou": "Mudaste a foto do grupo",
  "system.groupPhotoChanged": "{actor} mudou a foto do grupo",
  "system.groupDescriptionChangedYou": "Mudaste a descrição do grupo",
  "system.groupDescriptionChanged": "{actor} mudou a descrição do grupo",
  "system.memberJoinedYou": "Entraste",
  "system.memberJoined": "{actor} entrou",
  "system.groupDissolvedYou": "Encerraste o grupo",
  "system.groupDissolved": "{actor} encerrou o grupo",

  // ── Segurança — bloquear/denunciar um membro + aviso de partilha (Wave A) ──
  "conversation.reportMemberAction": "Denunciar {name}",
  // PRD-354: item próprio "Denunciar grupo" no menu da conversa de grupo.
  "conversation.reportGroupAction": "Denunciar grupo",
  "report.memberTitle": "Denunciar {name}?",
  // PRD-356: denuncia o grupo inteiro, não uma pessoa dentro dele.
  "report.groupTitle": "Denunciar {name}?",
  "report.anonymousLabel": "Denunciar anonimamente",
  "report.alsoBlockLabel": "Também bloquear {name}",
  // Ver o comentário na versão EN: substitui {name} quando já não há nome.
  "report.genericPersonLabel": "esta pessoa",
  "report.success.combinedTitle":
    "A tua denúncia está <em>com um moderador</em> e bloqueaste {name}.",
  "report.success.combinedBody":
    "Alguém da equipa de moderação lê todas as denúncias, e {name} já não pode ver o teu perfil, enviar-te mensagens nem encontrar-te na pesquisa.",
  "report.success.blockFailedNote":
    "A denúncia foi enviada, mas o bloqueio a {name} não resultou. Podes tentar bloquear novamente a partir do perfil.",
  "conversation.contactSafetyNotice":
    "Mantém a conversa aqui até confiares em alguém. Nunca envies dinheiro, nem partilhes dados bancários. Anúncios verdadeiros não pedem isso.",

  // ── Chrome do painel (MessagesRailChrome) ──
  // Só no computador. Esta página esconde a navegação do site (AppShell
  // `chromeless`), por isso a caixa de entrada leva a sua própria saída.
  "rail.backToPlatform": "Voltar ao QueerPulse",
  // ── Papel de parede da conversa (ConversationMenu → WallpaperModal) ──
  // Os nomes dos padrões são a legenda sob cada amostra em miniatura, servindo
  // também de nome acessível do botão. Nomes simples de propósito: quem
  // compara as legendas precisa de saber o que está a escolher.
  "conversation.menuAriaLabel": "Mais opções para esta conversa",
  "wallpaper.menuAction": "Papel de parede",
  "wallpaper.title": "Papel de parede",
  "wallpaper.sub": "Escolhe o fundo para {name}.",
  "wallpaper.patternLegend": "Padrão",
  "wallpaper.pattern.plain": "Liso",
  "wallpaper.pattern.doodles": "Rabiscos",
  "wallpaper.pattern.botanical": "Botânico",
  "wallpaper.pattern.sky": "Céu noturno",
  "wallpaper.pattern.confetti": "Confetti",
  "wallpaper.pattern.waves": "Ondas",
  "wallpaper.pattern.terrazzo": "Terrazzo",
  "wallpaper.everyChatTitle": "Usar em todas as conversas",
  "wallpaper.everyChatSub":
    "Aplica-se às conversas que não têm papel de parede próprio.",
  "wallpaper.previewReceived": "Adoro este.",
  "wallpaper.previewSent": "Também eu. Fica assim.",
  "wallpaper.reset": "Repor",
  "wallpaper.cancel": "Cancelar",
  "wallpaper.save": "Guardar",

  // Messaging inbox and entry points (scan section 5, 2026-09-15)
  "share.cta": "Enviar numa mensagem",
  "share.ariaLabel": 'Enviar "{title}" numa mensagem',
  "share.modalTitle": "Enviar numa mensagem",
  "share.modalSub": "Escolhe até {cap} conversas para enviar isto.",
  "share.searchPlaceholder": "Pesquisar conversas",
  "share.searchAriaLabel": "Filtrar conversas",
  "share.capReached": "Podes enviar para até {cap} conversas de cada vez.",
  "share.noteLabel": "Adiciona uma nota (opcional)",
  "share.notePlaceholder": "Escreve uma nota sobre isto",
  "share.noteCounter": "{count}/{max}",
  "share.sendCta": "Enviar",
  "share.sendingCta": "A enviar…",
  "share.cancelCta": "Cancelar",
  "share.emptyTitle": "Ainda não tens conversas",
  "share.emptyDescription":
    "Começa por abrir uma conversa; depois já podes enviar coisas diretamente para lá.",
  "share.emptyCta": "Ir para Mensagens",
  "share.successToast_one": "Enviado para {count} conversa",
  "share.successToast_other": "Enviado para {count} conversas",
  "share.partialToast":
    "Enviado para {sentCount} de {totalCount}. Não chegou a {failedNames}.",
  "share.errorToast": "Isso não foi enviado. Tenta outra vez daqui a pouco.",
  "share.openThreadCta": "Abrir",
  "share.selectedCount_one": "{count} conversa selecionada",
  "share.selectedCount_other": "{count} conversas selecionadas",
  "share.kind.article": "artigo",
  "share.kind.listing": "anúncio",
  "share.kind.community": "comunidade",
  "share.kind.directory": "espaço",
  "share.kind.gathering": "encontro",
  "share.kind.generic": "isto",
  "search.loadErrorBody":
    "A pesquisa não voltou. A falha é nossa. Tenta outra vez daqui a um momento.",
  "newMessage.strangersSearching": "A procurar essa pessoa…",
  "newMessage.strangersError":
    "Não conseguimos pesquisar outros membros agora.",
  "thread.previewYou": "Tu:",
  "thread.draftLabel": "Rascunho:",
  "thread.mentionIndicator": "Mencionaram-te",
  "thread.mutedUntilIndicator": "Silenciado até {time}",
  "thread.unreadCountAria_one": "{count} mensagem por ler",
  "thread.unreadCountAria_other": "{count} mensagens por ler",
  "thread.unreadAria": "Por ler",
  "thread.loadErrorBody":
    "Não conseguimos carregar as tuas conversas. Continuam lá, tenta outra vez daqui a pouco.",
  "thread.loadErrorInline": "Não foi possível atualizar as tuas conversas.",
  "thread.muteFor8Hours": "Silenciar por 8 horas",
  "thread.muteFor1Week": "Silenciar por 1 semana",
  "thread.muteAlways": "Silenciar sempre",
  "thread.muteMentionsOnly": "Só menções",
  "thread.mutedUntil": "Silenciado até {time}",
  "thread.mutedAlways": "Silenciado",
  "thread.mutedMentionsOnly": "Só menções",
  "thread.archivedToast": "Arquivaste esta conversa.",
  "thread.archiveUndoCta": "Desfazer",
  "thread.offlineUnsaved":
    "Esta conversa ainda não está guardada neste dispositivo. Liga-te à internet para a carregar.",
  "deleteChat.deletedToast": "Eliminaste esta conversa.",
  "deleteChat.undoCta": "Desfazer",
  "conversation.awaitingReplyNotice":
    "Contactaste {name}. Assim que te responder, podem os dois continuar esta conversa.",
  "conversation.formerMemberNotice":
    "Esta pessoa fechou a conta na QueerPulse, por isso as respostas aqui já não lhe chegam. Continuas a poder ler a conversa.",
  "request.charactersLeft": "Carateres restantes: {remaining}",
  "request.error.dailyLimit":
    "Hoje já contactaste muitas pessoas novas. Podes enviar mais pedidos amanhã.",
  "request.error.pendingLimit":
    "Tens muitos pedidos ainda à espera de resposta. Quando alguns forem respondidos ou retirares alguns, podes enviar mais.",
  "request.error.paused":
    "Os novos pedidos de mensagem estão em pausa na tua conta enquanto a equipa de moderação analisa uma situação. As conversas com as tuas ligações continuam como sempre.",
  "request.error.recipientConnectionsOnly":
    "{name} só está a aceitar mensagens das suas ligações neste momento.",
  "requests.replyCta": "Responder",
  "requests.inboundHeading": "Novos pedidos",
  "requests.outboundHeading": "Os teus pedidos enviados",
  // PRD-344: se o destinatário leu um pedido enviado, mostrado no cartão de
  // saída. Não aparece de todo quando o sinal é retido pela preferência de
  // confirmações de leitura de qualquer uma das partes.
  "requests.readStatusRead": "Lido",
  "requests.readStatusUnread": "Ainda não lido",

  // PRD-353: convites de grupo pendentes no separador Pedidos
  // (GroupInviteRequestRow, MessagesRequestsPanel), um quase-gémeo dos
  // cartões de pedido de mensagem acima, mas para um GRUPO em vez de uma pessoa.
  "requests.groupInvite.sectionHeading": "Convites de grupo",
  "requests.groupInvite.invitedBy": "{inviter} convidou-te",
  "requests.groupInvite.accept": "Aceitar",
  "requests.groupInvite.decline": "Recusar",
  "requests.groupInvite.acceptedDemo":
    "Entrar em grupos é simulado no modo de demonstração.",
  "requests.groupInvite.declined": "Convite recusado.",
  "requests.groupInvite.untitledGroup": "Este grupo",

  // Scan section 6: composer, attachments and actions (DES-198..214, PRD-350).
  "attachments.openCamera": "Câmara",
  "attachments.cameraSheetLabel": "Tira uma foto",
  "attachments.cameraClose": "Fechar a câmara",
  "attachments.cameraFlip": "Trocar de câmara",
  "attachments.cameraShutter": "Tirar foto",
  "attachments.cameraDenied": "O acesso à câmara foi negado.",
  "attachments.cameraFailed": "Não foi possível iniciar a câmara.",
  "attachments.cameraUseSystem": "Usar a câmara do sistema",
  "attachments.removePhoto": "Remover foto",
  "attachments.removeGif": "Remover GIF",
  "attachments.removeDocument": "Remover {fileName}",
  "attachments.cancelPhotoUpload": "Cancelar envio da foto",
  "attachments.cancelDocumentUpload": "Cancelar envio de {fileName}",
  "attachments.uploadingProgress": "A enviar, {percent} por cento",
  "attachments.pendingStripLabel_one": "A enviar {count} anexo",
  "attachments.pendingStripLabel_other": "A enviar {count} anexos",
  "attachments.pendingPhotoLabel": "Foto",
  "attachments.thumbnailsLabel": "Anexos a enviar",
  "attachments.thumbnailPhoto": "Foto, {index} de {count}",
  "attachments.thumbnailGif": "GIF, {index} de {count}",
  "attachments.thumbnailDocument": "{fileName}, {index} de {count}",
  "attachments.notSentPhoto": "A tua foto não foi enviada.",
  "attachments.notSentGif": "O teu GIF não foi enviado.",
  "attachments.notSentDocument": "{fileName} não foi enviado.",
  "actions.replyCancel": "Cancelar resposta",
  "actions.editCounter": "{count}/{max} caracteres",
  "actions.editOverLimitAnnouncement":
    "A mensagem ultrapassa o limite de {max} caracteres.",
  "actions.editWithinLimitAnnouncement":
    "A mensagem está novamente dentro do limite de caracteres.",
  "actions.editEmptyHint": "Escreve algo para guardares a edição.",
  "reactions.name.love": "Amor",
  "reactions.name.laugh": "Risos",
  "reactions.name.like": "Gosto",
  "reactions.name.wow": "Uau",
  "reactions.name.sad": "Triste",
  "reactions.name.thanks": "Gratidão",
  "reactions.chipLabel_one": "{name}, {count} reação",
  "reactions.chipLabel_other": "{name}, {count} reações",
  "reactions.chipLabelMine_one": "{name}, {count} reação, incluindo a tua",
  "reactions.chipLabelMine_other": "{name}, {count} reações, incluindo a tua",
  "pinned.toastPinned": "Mensagem fixada",
  "pinned.toastUnpinned": "Mensagem desafixada",
  "starred.toastStarred": "Mensagem guardada",
  "starred.toastUnstarred": "Mensagem removida das guardadas",
  "forward.pickerSub":
    "Escolhe até {max} conversas para reencaminhar esta mensagem.",
  "forward.sendCtaEmpty": "Enviar",
  "forward.sendCta_one": "Enviar para {count} conversa",
  "forward.sendCta_other": "Enviar para {count} conversas",
  "forward.selectedAria_one": "{count} conversa selecionada",
  "forward.selectedAria_other": "{count} conversas selecionadas",
  "forward.removeRecipient": "Remover {name}",
  "forward.capReached":
    "Podes reencaminhar para até {max} conversas de cada vez.",
  "forward.sentToast_one": "Reencaminhada para {count} conversa",
  "forward.sentToast_other": "Reencaminhada para {count} conversas",
  "forward.failedToast":
    "Não foi possível reencaminhar para {names}. Continuam selecionadas, por isso podes tentar novamente.",
  "gif.gridLabel": "Resultados de GIFs",
  "conversation.contactSafetyNoticeDismiss": "Fechar aviso de segurança",
  "conversation.dropFilesHint": "Larga os ficheiros aqui para os enviar",
  "composer.lengthCounter": "{count}/{max} caracteres",
  "composer.overLimitAnnouncement":
    "A mensagem ultrapassa o limite de {max} caracteres.",
  "composer.withinLimitAnnouncement":
    "A mensagem está novamente dentro do limite de caracteres.",
  "status.tooLongToSend": "Não entregue · Demasiado longa para enviar",
  // Scan section 7: conversation pane and accessibility
  "conversation.announcementSenderFallback": "Alguém",
  "conversation.announcementMediaWithCaption": "{kind}, {caption}",
  "attachments.photoLoadFailed": "Foto indisponível",
  "attachments.photoRetry": "Tentar de novo",
  "bubble.roleDescription": "Mensagem",
  "album.label_one": "Álbum, {count} foto",
  "album.label_other": "Álbum, {count} fotos",
  "actions.info": "Info",
  "actions.reactions": "Reações",
  "info.title": "Informação da mensagem",
  "info.read": "Lida",
  "info.notYet": "Ainda não",
  "reactors.title": "Reações",
  "reactors.tablistLabel": "Filtrar reações",
  "reactors.tabAll": "Todas {total}",
  "reactors.tapToRemove": "Toca para remover",
  "reactors.removeLabel": "Toca para remover a tua reação {name}",
  "reactors.loading": "A carregar reações…",
  "reactors.error": "Não conseguimos carregar as reações.",
  "reactors.empty": "Ainda não há reações.",
  // Scan section 12: galeria de multimédia, links e documentos (ConversationMediaGallery)
  "mediaGallery.title": "Multimédia, links e documentos",
  "mediaGallery.tabsLabel": "Partilhado nesta conversa",
  "mediaGallery.tabMedia": "Multimédia",
  "mediaGallery.tabLinks": "Links",
  "mediaGallery.tabDocuments": "Documentos",
  "mediaGallery.loading": "A carregar o que foi partilhado…",
  "mediaGallery.error": "Não conseguimos carregar isto agora.",
  "mediaGallery.loadMore": "Carregar mais",
  "mediaGallery.loadingMore": "A carregar mais…",
  "mediaGallery.loadMoreError": "Não conseguimos carregar mais agora.",
  "mediaGallery.emptyMediaTitle": "Ainda não há fotos",
  "mediaGallery.emptyMediaBody":
    "As fotos e os GIFs partilhados nesta conversa vão aparecer aqui.",
  "mediaGallery.emptyLinksTitle": "Ainda não há links",
  "mediaGallery.emptyLinksBody":
    "Os links partilhados nesta conversa vão aparecer aqui.",
  "mediaGallery.emptyDocumentsTitle": "Ainda não há documentos",
  "mediaGallery.emptyDocumentsBody":
    "Os ficheiros partilhados nesta conversa, como um contrato ou um cartaz, vão aparecer aqui para os encontrares facilmente.",
  "mediaGallery.photoLabel": "Foto de {name}, {date}",
  "mediaGallery.photoLabelUndated": "Foto de {name}",
  "mediaGallery.photoLabelOwn": "A tua foto, {date}",
  "mediaGallery.photoLabelOwnUndated": "A tua foto",
  "mediaGallery.undatedHeading": "Anteriores",
  "mediaGallery.entryMeta": "{name} · {date}",
  "mediaGallery.documentMeta": "{size} · {date}",
  "mediaGallery.showInChat": "Ver na conversa",
  // Scan section 9: safety, moderation and privacy
  formerMember: "Antigo membro",
  "blockThenReport.title": "Denunciar mensagens antes de bloquear?",
  "blockThenReport.lead":
    "Estas são as mensagens mais recentes de {name} nesta conversa. Escolhe as que queres que a equipa de moderação veja antes de bloqueares.",
  "blockThenReport.skipCta": "Saltar",
  "blockThenReport.continueCta": "Denunciar e continuar",
  "blockThenReport.continuingCta": "A denunciar…",
  "blockThenReport.partialFailureToast":
    "{failed} de {total} denúncias não puderam ser enviadas. Ainda podes continuar.",
  // Ver o comentário na versão EN: o limite de denúncias parou o envio a meio.
  "blockThenReport.throttledToast":
    "{succeeded} de {total} denúncias foram enviadas. Podes voltar a enviar as restantes daqui a um ou dois minutos.",
  // Ver o comentário na versão EN: o aviso sobre uma mensagem recebida com ar
  // de burla e os dois botões partilhados pelos diálogos de confirmação.
  "safety.inboundCaution":
    "Mudar para outra aplicação ou pagar fora da QueerPulse é como começa a maioria das burlas. Leva o teu tempo, e podes denunciar esta mensagem a partir do menu dela.",
  "safety.confirmGoBack": "Voltar",
  "safety.confirmOpenAnyway": "Abrir mesmo assim",

  // PRD-358: a página de destino do link de convite (JoinGroupPage, /messages/join/:token).
  "join.loading": "A carregar o convite…",
  "join.title": "Entrar em {group}?",
  "join.joinCta": "Entrar no grupo",
  "join.openChatCta": "Abrir conversa",
  "join.alreadyMember": "Já estás neste grupo.",
  "join.joinedDemo": "Entrar em grupos é simulado no modo de demonstração.",
  "join.invalidLinkTitle": "Este link de convite não é válido",
  "join.invalidLinkBody":
    "Pode ter sido substituído, desativado, ou o grupo pode já não existir.",
  "join.errorTitle": "Algo correu mal",
  "join.errorBody": "Não foi possível carregar este convite. Tenta outra vez.",
  "join.backToMessages": "Voltar às mensagens",
};
