import type { Catalog } from "../../types";

/**
 * My Events — pt-PT. See `en/myevents.ts` for the section map and the scope
 * note (mock event/venue/community/attendee names stay in English).
 * "Host" renders as "quem organiza" (neutral rephrasing, never the gendered
 * "anfitrião/anfitriã") per the inclusive-forms priority order in
 * `docs/i18n/glossary-pt.md`. Register is tu throughout.
 */
export const myevents: Catalog = {
  // ── Cabeçalho global de eventos (EventsHeader) ────────────────────────────
  "eventsHeader.title": "Eventos",
  "eventsHeader.hostCta": "Organizar um evento",
  // Escolha que a ação Organizar abre (HostChoiceModal)
  "eventsHeader.hostChoice.title": "Como queres começar?",
  "eventsHeader.hostChoice.sub":
    "Lê primeiro o guia para organizar, ou cria já o teu evento.",
  "eventsHeader.hostChoice.learn.title": "Aprende a organizar um evento",
  "eventsHeader.hostChoice.learn.body":
    "Lê o guia sobre escolher um formato, encontrar um espaço e convidar pessoas.",
  "eventsHeader.hostChoice.host.title": "Cria um evento",
  "eventsHeader.hostChoice.host.body":
    "Vai direto ao formulário e define a data, o local e os detalhes.",
  "eventsHeader.hostChoice.cancelCta": "Cancelar",

  // ── Interruptor de topo My events | Discover (EventsTopTabs) ──────────────
  "topTabs.mine": "Os meus eventos",
  "topTabs.discover": "Descobrir",
  "topTabs.ariaLabel": "Vistas de eventos",

  // ── Primary bucket pills (EventPills) ─────────────────────────────────────
  "pills.groupLabel": "A mostrar",
  "pills.upcoming": "Todos os próximos",
  "pills.going": "Vais",
  "pills.hosting": "Organizas",
  "pills.waitlisted": "Lista de espera",
  "pills.past": "Passados",
  "pills.saved": "Guardados e convites",

  // ── Toolbar (EventToolbar) ─────────────────────────────────────────────────
  "toolbar.searchPlaceholder": "Pesquisa os teus eventos por nome ou local…",
  "toolbar.searchAria": "Pesquisar os teus eventos",
  "toolbar.filter.inperson": "Presencial",
  "toolbar.filter.online": "Online",
  "toolbar.filter.free": "Gratuito",
  "toolbar.filter.paid": "Com bilhete",
  "toolbar.filter.month": "Este mês",
  "toolbar.filter.groupLabel": "Filtros",
  "toolbar.sortAria": "Ordenar eventos",
  "toolbar.sort.label": "Ordenar",
  "toolbar.sort.date": "Por data",
  "toolbar.sort.community": "Por comunidade",
  "toolbar.sort.status": "Por estado",
  "toolbar.density.compact": "Compacto",
  "toolbar.density.comfortable": "Confortável",
  "toolbar.select.select": "Selecionar",
  "toolbar.select.done": "Concluído",
  "toolbar.tzNote": "Horário de Lisboa (WEST)",

  // ── Day filter chip (DayFilterChip) ────────────────────────────────────────
  "dayFilter.showing": "A mostrar <strong>{label}</strong>",
  "dayFilter.showAll": "Mostrar tudo",

  // ── Mobile list/calendar toggle (MobileViewToggle) ────────────────────────
  "mobileView.list": "Lista",
  "mobileView.calendar": "Calendário",

  // ── Offline banner ─────────────────────────────────────────────────────────
  "offline.banner":
    "Estás offline. A mostrar os teus eventos guardados. Sincronizamos as alterações quando voltares.",

  // ── Agenda grouping (myEvents.agenda.ts → EventAgenda) ────────────────────
  "agenda.today": "Hoje",
  "agenda.thisWeek": "Esta semana",
  "agenda.later": "Mais tarde",
  "agenda.hosting": "Organizas",
  "agenda.going": "Vais",
  "agenda.waitlisted": "Lista de espera",
  "agenda.recentlyAttended": "Foste recentemente",
  "agenda.invitesWaiting": "Convites à tua espera",
  "agenda.savedForLater": "Guardados para depois",
  "agenda.invitesSent": "Convites que enviaste",
  "agenda.otherCommunity": "Outros eventos",
  "agenda.ended": "Já aconteceram",
  "agenda.endedSub": "Estes eventos já passaram.",
  "agenda.showMore_one": "Mostrar mais {count}",
  "agenda.showMore_other": "Mostrar mais {count}",
  // Estado distinto de erro/repetir quando a procura de eventos live falha
  // (nunca um falso "sem eventos" — ver EventAgenda).
  "agenda.error.title": "Não conseguimos carregar os teus <em>eventos</em>",
  "agenda.error.description":
    "Houve um problema ao carregar o teu calendário. Os teus eventos estão seguros, é só uma falha do nosso lado.",
  "agenda.error.retry": "Tentar de novo",

  // ── Empty states (empties.data.tsx, Pattern B) ────────────────────────────
  "empties.upcoming.title": "Nada no calendário <em>ainda</em>",
  "empties.upcoming.sub":
    "Quando disseres que sim a um evento ou organizares o teu, aparece logo aqui. Há sempre algo a acontecer. Dá uma vista de olhos quando quiseres.",
  "empties.upcoming.browseCta": "Ver eventos",
  "empties.upcoming.hostCta": "Organizar o teu",
  "empties.going.title": "Sem confirmações <em>por agora</em>",
  "empties.going.sub":
    "Ainda não disseste sim a nada que aí vem. Vê o que há (uma noite de cinema, um piquenique, um clube de leitura tranquilo) e diz sim a um deles.",
  "empties.going.cta": "Ver o que há",
  "empties.hosting.title": "Não estás a organizar <em>nada</em>",
  "empties.hosting.sub":
    "Os melhores eventos começam com uma pessoa a decidir abrir espaço. O teu pode ser um jantar pequeno ou um grande piquenique. Ajudamos-te a organizá-lo.",
  "empties.hosting.cta": "Criar um evento",
  "empties.waitlisted.title": "Sem listas de espera <em>por agora</em>",
  "empties.waitlisted.sub":
    "Quando um evento que queres está cheio, entra na lista de espera e guardamos o teu lugar. Avisamos-te se abrir uma vaga.",
  "empties.waitlisted.cta": "Ver eventos",
  "empties.past.title": "Sem histórico <em>aqui</em>, mas ainda vais a tempo",
  "empties.past.sub":
    "Depois de ires ao teu primeiro evento, ele fica aqui como um registo tranquilo de onde estiveste e de quem conheceste.",
  "empties.past.cta": "Encontra o teu primeiro",
  "empties.saved.title": "Nada guardado ou <em>pendente</em>",
  "empties.saved.sub":
    "Guarda eventos de que ainda não tens a certeza, e qualquer convite de outras pessoas espera aqui por ti. Sem pressa, sem stress.",
  "empties.saved.cta": "Ver eventos",
  "empties.day.title": "Nada <em>neste dia</em>",
  "empties.day.sub":
    "Não tens nada marcado aqui. Escolhe outro dia com um ponto, ou limpa o filtro para ver tudo o que aí vem.",
  "empties.day.cta": "Mostrar tudo",
  "empties.search.title": "Nenhum evento <em>corresponde</em>",
  "empties.search.sub":
    "Nada corresponde à tua pesquisa e aos filtros. Tenta outra palavra ou tira um filtro.",
  "empties.search.cta": "Limpar pesquisa e filtros",

  // ── Event card: select checkbox + meta line (EventCard, EventCardParts) ───
  "card.selectAria": "Selecionar {title}",
  "card.joinLinkCta": "Link para entrar",
  "card.directionsCta": "Indicações",
  // PRD-182 — ver a nota no catálogo EN.
  "card.joinLinkDemoToast": "Na demonstração não há uma sala real para entrar.",
  "card.joinLinkMissingToast":
    "Quem organiza ainda não adicionou um link para entrar. Aparece aqui assim que o fizer.",
  "card.joinLinkErrorToast":
    "Não foi possível obter o link para entrar. Tenta outra vez daqui a pouco.",
  "card.directionsToast": "A abrir indicações para {venue}",
  // Ver a nota em EN: um convívio pode durar vários dias e a linha do cartão
  // mostra as horas sem data ao lado.
  "card.untilDate": "(até {date})",

  // ── Live-data labels (api/myEvents.adapters.ts) ───────────────────────────
  "card.online": "Online",
  "invite.defaultTitle": "Convite para um evento",

  // ── Urgency / friends chips (EventCardParts) ──────────────────────────────
  "card.soldOut": "Esgotado",
  "card.spotsOpen_one": "{count} vaga livre",
  "card.spotsOpen_other": "{count} vagas livres",
  "card.friendsGoing_one": "{count} das tuas conexões vai",
  "card.friendsGoing_other": "{count} das tuas conexões vão",
  "card.friendsToast": "A mostrar conexões que vão…",

  // ── "Happening now / starts in" bar (myEvents.helpers.ts soonLabel) ───────
  "soon.happeningNow": "A acontecer agora",
  "soon.startsInMins_one": "Começa daqui a {mins} min",
  "soon.startsInMins_other": "Começa daqui a {mins} min",
  "soon.startsInHours": "Começa daqui a {hours}h",
  "soon.startsInHoursMins": "Começa daqui a {hours}h {mins} min",
  "soon.checkInCta": "Fazer check-in",
  "soon.checkedInToast": "Check-in feito. Aproveita bem",
  "soon.ticketCta": "Bilhete",

  // ── Status badges (EventCardBadges) ───────────────────────────────────────
  "badges.maybe": "Talvez",
  "badges.going": "Vais",
  "badges.hosting": "Organizas",
  "badges.coHosting": "A coorganizar",
  "badges.waitlistedPosition": "Lista de espera · #{position}",
  "badges.goingCount_one": "{count} pessoa vai",
  "badges.goingCount_other": "{count} pessoas vão",
  "badges.goingFull": "{count} pessoas vão · esgotado",
  "badges.didntMakeIt": "Não foste",
  "badges.attended": "Foste",
  "badges.inPhotos_one": "Estás em {count} fotografia",
  "badges.inPhotos_other": "Estás em {count} fotografias",
  "badges.saved": "Guardado",
  "badges.invitedTakeYourTime": "Tens um convite. Sem pressa",
  "badges.youInvited": "Convidaste {invitee}",
  "badges.waitlistSuffix_one": " · {count} em lista de espera",
  "badges.waitlistSuffix_other": " · {count} em lista de espera",

  // ── Attendee footer line (EventCardBadges EventFoot) ──────────────────────
  "foot.coHostingWith": "A coorganizar com {name}",
  "foot.aheadOfYou":
    "<strong>{count} pessoas à tua frente.</strong> Avisamos-te se abrir uma vaga.",
  "foot.invitedYou": "<strong>{from}</strong> convidou-te",
  "foot.waitingOnReply": "À espera da resposta de <strong>{invitee}</strong>",

  // ── Right-hand action column (EventCardActions EventSide) ────────────────
  "side.findSimilar": "Encontrar semelhantes",
  "side.viewTicket": "Ver bilhete",
  "side.eventDetailsCta": "Detalhes do evento",
  "side.manageCta": "Gerir",
  "side.viewListingCta": "Ver página pública",
  "side.seePhotosCta": "Ver fotografias",
  "side.leaveNoteCta": "Deixar uma nota",
  "side.leaveNoteToast": "A abrir a tua nota…",
  "side.receiptCta": "Recibo",
  "side.joinWaitlistCta": "Entrar na lista de espera",
  "side.joinWaitlistToast":
    "Entraste na lista de espera. Damos-te notícias em breve",
  "side.rsvpCta": "Confirmar presença",
  "side.removeCta": "Remover",
  "side.removedFromSavedToast": "Removido dos guardados",
  "side.acceptCta": "Aceitar",
  "side.declineCta": "Recusar",
  "side.manageInviteCta": "Gerir",

  // ── Bookmark / save toggle (gathering detail — GatheringBookmarkButton) ────
  "bookmark.save": "Guardar",
  "bookmark.saved": "Guardado",
  "bookmark.saveAria": "Guardar este evento",
  "bookmark.savedAria": "Guardado. Remover dos teus eventos",
  "bookmark.savedToast": "Guardado nos teus eventos",
  "bookmark.removedToast": "Removido dos guardados",

  // ── Card tools row (EventCardActions EventTools) ──────────────────────────
  "tools.reminderOn": "Lembrete ativo",
  "tools.reminderInfoTooltip":
    "Vais receber um lembrete na app antes de o evento começar",
  "tools.addToCalendar": "Adicionar ao calendário",
  "tools.addedToCalendarToast": "Adicionado ao teu calendário",
  "tools.moreOptionsAria": "Mais opções",
  "tools.more": "Mais",
  "tools.switchToGoing": "Confirmar que vou",
  "tools.yourDetails": "Os teus dados",
  "tools.cantMakeIt": "Não posso ir",
  "tools.inviteCoHost": "Convidar para coorganizar",
  "tools.dayOfDetails": "Detalhes do dia",
  "tools.leaveWaitlist": "Sair da lista de espera",
  "tools.tellHostWhy": "Explicar a quem organiza",
  "tools.tellHostToast": "A abrir uma nota para quem organiza…",
  "tools.thankHost": "Agradecer a quem organiza",
  "tools.thankedToast": "Agradecimento enviado a quem organiza",
  "tools.connectWithMet": "Criar conexões com quem conheceste",
  "tools.connectWithMetToast": "A mostrar pessoas que conheceste aqui…",
  "tools.sendNudge": "Enviar um lembrete",
  "tools.nudgeSentToast": "Lembrete enviado a {invitee}",
  "tools.withdraw": "Retirar convite",
  "tools.withdrawnToast": "Convite retirado",
  "tools.askQuestion": "Fazer uma pergunta",
  "tools.askQuestionToast": "A abrir uma mensagem para quem organiza…",

  // ── Access + safety chip labels (myEvents.data.ts ACCESS_LABEL_KEYS) ──────
  "access.label.sober": "Espaço sóbrio",
  "access.label.stepfree": "Acesso sem degraus",
  "access.label.quiet": "Canto tranquilo",
  "access.label.interpret": "PT / EN",
  "access.label.bsl": "Interpretação em LGP",
  "access.label.masks": "Máscara recomendada",

  // ── Access + edge-case notes (EventCardExtras) ────────────────────────────
  "access.contentNote": "Nota de conteúdo",
  "access.contentNoteFallbackToast": "Este evento tem uma nota de conteúdo",
  "access.saferSpacePolicy": "Política de espaço seguro",
  "access.saferSpaceToast":
    "Este evento segue a política de espaço seguro da QueerPulse",
  "alert.plansChanged": "Os planos mudaram.",
  "alert.seeWhatChanged": "Ver o que mudou",
  "alert.seeWhatChangedToast": "A mostrar o histórico completo de alterações",
  "conflict.clashesWith": "Coincide com {title}",
  "conflict.body":
    "à mesma hora. Só podes estar num sítio. Talvez valha a pena deixar um deles.",
  "edge.cancelledTitle": "Quem organiza cancelou este evento.",
  "edge.cancelledBody": "A tua confirmação foi anulada.",
  "edge.findSomethingSimilar": "encontrar algo semelhante",
  "edge.findingSimilarToast": "A encontrar eventos semelhantes…",
  "edge.reviewTitle": "Em análise.",
  "edge.reviewBody":
    "Chegou uma denúncia, por isso a nossa equipa está a analisar este evento. Continua visível enquanto verificamos.",
  "edge.seeStatus": "ver estado",
  "edge.seeStatusToast": "A abrir o estado da análise…",
  "edge.blockedBody":
    "Alguém que bloqueaste vai a este evento. Essa pessoa não te vê, e tu também não a vês na noite do evento.",
  "series.upcomingDatesToast": "Próximas datas · {dates}",
  // MSG-16 — linha de série recorrente ao vivo (SeriesLine), com dados reais
  // do backend em vez de apenas o registo de demonstração.
  "series.cadenceWeekly": "Repete-se semanalmente",
  "series.cadenceBiweekly": "Repete-se a cada 2 semanas",
  "series.cadenceMonthly": "Repete-se mensalmente",
  "series.position": "{position} de {total}",
  "series.positionToast": "{label} · {position}",
  "dayof.runOfShow": "Programa",
  "dayof.whatToBring": "O que trazer",
  "dayof.gettingIn": "Como entrar",
  "dayof.meetingPoint": "Ponto de encontro:",
  "dayof.doorCode": "Código da porta:",
  "dayof.doorCodeNote": "(mostrado porque está prestes a começar)",

  // ── Calendar aside (CalendarCard, CalendarGrid) ───────────────────────────
  "calendar.today": "Hoje",
  "calendar.prevAria": "Anterior",
  "calendar.nextAria": "Seguinte",
  "calendar.view.month": "Mês",
  "calendar.view.week": "Semana",
  "calendar.view.year": "Ano",
  "calendar.legend.hosting": "Organizas",
  "calendar.legend.going": "Vais",
  "calendar.legend.pending": "Guardado · lista de espera · convite",
  "calendar.gridAria": "Calendário de eventos",
  "calendar.nothingPlanned": "Nada planeado",
  // Um dia seguinte de um convívio de vários dias, na grelha semanal.
  "calendar.stillOn": "Ainda a decorrer",
  "calendar.cellEventCount_one": "{count} evento",
  "calendar.cellEventCount_other": "{count} eventos",
  "calendar.cellNoEvents": "sem eventos",
  "calendar.cellAriaToday": ", hoje",

  // ── Subscribe / export (CalendarSubscribe) ────────────────────────────────
  "calSubscribe.feedTitle": "Subscrever o teu feed",
  "calSubscribe.feedSub":
    "Sincroniza automaticamente com o Google ou Apple Calendar",
  "calSubscribe.feedToast":
    "Link do feed copiado. Adiciona-o no Google ou Apple Calendar",
  "calSubscribe.feedCopyFailToast":
    "Não foi possível copiar automaticamente. Tenta outra vez num navegador compatível.",
  "calSubscribe.feedErrorToast":
    "Não foi possível criar o link do teu feed. Tenta outra vez.",
  "calSubscribe.exportTitle": "Exportar este mês",
  "calSubscribe.exportSub": "Descarrega um ficheiro .ics, sem sincronização",
  "calSubscribe.exportToast": "Eventos de {month} descarregados como .ics",

  // ── .ics export (myEvents.ics.ts) ─────────────────────────────────────────
  "ics.description": "Vê os detalhes e as novidades na QueerPulse: {url}",

  // ── Recommendations strip (Discovery) ─────────────────────────────────────
  "discovery.title": "Talvez <em>gostes</em>",

  // ── "Your year so far" (InsightsCard) ─────────────────────────────────────
  "insights.eyebrow": "O teu ano até agora",
  "insights.emptyStat": "O teu ano <em>começa</em> aqui",
  "insights.emptySub":
    "Assim que fores ao teu primeiro evento, começa a contar aqui: um registo tranquilo de onde estiveste este ano.",
  "insights.emptyCta": "Encontra o teu primeiro",
  "insights.stat_one": "<em>{count}</em> evento",
  "insights.stat_other": "<em>{count}</em> eventos",
  "insights.sub": "Todos os eventos onde estiveste este ano.",
  "insights.streak_one": "mês seguido",
  "insights.streak_other": "meses seguidos",
  "insights.topCircle": "o teu círculo principal",
  "insights.hosted": "organizaste",

  // ── Overflow menu (MoreMenu) ───────────────────────────────────────────────
  "moreMenu.share": "Partilhar este evento",
  "moreMenu.shareToast": "Link do evento copiado. Partilha-o onde quiseres",
  "moreMenu.shareCopyFailToast":
    "Não foi possível copiar o link. Tenta de novo",
  "moreMenu.inviteFriend": "Convidar uma pessoa amiga",
  "moreMenu.invitePickerTitle": "Convidar uma pessoa amiga",
  "moreMenu.invitePickerSub": "Envia-lhe o evento para se juntar a ti",
  "moreMenu.inviteMessageText": "Vem comigo a {title}: {link}",
  "moreMenu.messageHost": "Enviar mensagem a quem organiza",
  "moreMenu.openGroupChat": "Abrir conversa de grupo",
  "moreMenu.changeToGoing": "Confirmar que vou",
  "moreMenu.markAsMaybe": "Marcar como talvez",
  "moreMenu.transferTicket": "Transferir bilhete",
  "moreMenu.transferToast": "Escolhe para quem transferir o teu bilhete…",
  "moreMenu.requestRefund": "Pedir reembolso",
  "moreMenu.refundToast":
    "Reembolso pedido: o valor volta ao teu cartão em 3 a 5 dias",
  "moreMenu.connectWithMet": "Criar conexões com quem conheceste",
  "moreMenu.connectWithMetToast": "A mostrar pessoas que conheceste aqui…",
  "moreMenu.reportEvent": "Denunciar este evento",
  "moreMenu.blockHost": "Bloquear quem organiza",

  // ── Bulk-select bar (BulkBar) ──────────────────────────────────────────────
  "bulk.selected_one": "{count} selecionado",
  "bulk.selected_other": "{count} selecionados",
  "bulk.addToCalendar": "Adicionar ao calendário",
  "bulk.export": "Exportar",
  "bulk.cancelRsvps": "Cancelar confirmações",
  "bulk.doneAria": "Concluir seleção",
  "bulk.addedToCalendarToast_one":
    "{count} evento adicionado ao teu calendário",
  "bulk.addedToCalendarToast_other":
    "{count} eventos adicionados ao teu calendário",
  "bulk.exportedToast_one": "{count} evento exportado como .ics",
  "bulk.exportedToast_other": "{count} eventos exportados como .ics",
  "bulk.needsCommittedToast":
    "Seleciona primeiro eventos a que vais ou em que estás em lista de espera",
  "bulk.droppedToast_one": "Saíste de {count} evento",
  "bulk.droppedToast_other": "Saíste de {count} eventos",
  "bulk.undoCta": "Desfazer",
  "bulk.broughtBackToast": "Alteração desfeita",

  // ── Modal aria-labels (MyEventsBody → ModalShell) ─────────────────────────

  // ── Accept-invite confirmation panel (AcceptInviteConfirm) ────────────────
  "acceptConfirm.eyebrow": "Vais",
  "acceptConfirm.title": "Disseste que <em>sim.</em>",
  "acceptConfirm.addToCalendarCta": "Adicionar ao calendário",
  "acceptConfirm.doneCta": "Concluído",
  "acceptConfirm.waitlistedTitle": "Estás na <em>lista de espera.</em>",
  "acceptConfirm.waitlistedEyebrow": "Em lista de espera",

  // ── Accept-invite modal (AcceptInviteModal): visibility choice first ──────
  "acceptModal.eyebrow": "O teu convite",
  "acceptModal.title": "Só falta um passo para <em>entrares</em>",
  "acceptModal.sub": "Escolhe quem vê que vais. Quem organiza lê o resto.",
  "acceptModal.acceptCta": "Aceitar convite",
  "acceptModal.cancelCta": "Cancelar",
  "acceptModal.fullToast":
    "Este evento está cheio, por isso não te conseguimos adicionar.",
  "acceptModal.errorToast":
    "Não conseguimos aceitar o convite. Tenta outra vez.",
  "acceptModal.noLongerOpenToast": "Este convite já não está aberto.",
  "acceptModal.eventCancelledToast":
    "Este evento foi cancelado depois de o convite ser enviado, por isso já não pode ser aceite.",
  "acceptModal.notYoursToast":
    "Este convite foi enviado a outra pessoa, por isso a tua conta não o pode aceitar.",
  "acceptModal.chooseVisibilityToast":
    "Escolhe quem pode ver que vais e depois aceita o convite outra vez.",

  // ── RSVP details modal (RsvpDetailsModal) ─────────────────────────────────
  "rsvpModal.eyebrow": "A tua confirmação",
  "rsvpModal.title": "Há algo que devíamos <em>saber?</em>",
  "rsvpModal.whosComing": "Quem vai",
  "rsvpModal.bringingGuest": "Vou levar +1",
  "rsvpModal.guestHint":
    "Adiciona um nome para quem organiza poder dar as boas-vindas também",
  "rsvpModal.guestClosedHint":
    "As confirmações já fecharam, por isso já não dá para acrescentar +1.",
  "rsvpModal.guestNamePlaceholder": "Nome de quem levas (opcional)",
  "rsvpModal.contributionLabel": "A tua contribuição",
  "rsvpModal.slidingHint":
    "Aqui pagas o que puderes. Escolhe o valor que te serve, sem perguntas.",
  "rsvpModal.contribution.free": "0 €: preciso que seja gratuito agora",
  "rsvpModal.contribution.supported": "5 €: tarifa apoiada",
  "rsvpModal.contribution.standard": "10 €: padrão",
  "rsvpModal.contribution.payItForward": "15 €: para ajudar outra pessoa",
  "rsvpModal.accessNeeds": "Necessidades de acesso",
  "rsvpModal.accessPlaceholder":
    "Percurso sem degraus, um canto tranquilo, LGP, tudo o que te ajude a estar à vontade…",
  "rsvpModal.dietaryNeeds": "Necessidades alimentares",
  "rsvpModal.dietaryPlaceholder":
    "Alergias, vegan, halal, kosher, para eventos com comida partilhada…",
  "rsvpModal.pronouns": "Pronomes",
  "rsvpModal.pronounsPlaceholder": "ela/dela, elu/delu…",
  "rsvpModal.customQuestionHint": "Esta pergunta é de quem organiza.",
  "rsvpModal.customAnswerPlaceholder": "A tua resposta",
  "rsvpModal.privacyNote":
    "Quem organiza vê sempre o que escreves aqui e que vais. Podes mudar tudo isto quando quiseres.",
  "rsvpModal.cancelCta": "Cancelar",
  "rsvpModal.saveCta": "Guardar",
  "rsvpModal.savedToast": "Guardado",
  "rsvpModal.saveErrorToast": "Não conseguimos guardar. Tenta outra vez.",
  "rsvpModal.closedToast": "As confirmações para este evento já fecharam.",

  // ── Ticket modal (EventTicketModal) ───────────────────────────────────────
  "ticketModal.eyebrow": "O teu bilhete",
  "ticketModal.statusLabel": "Estado",
  "ticketModal.whereLabel": "Onde",
  "ticketModal.online": "Online",
  "ticketModal.priceLabel": "Preço",
  "ticketModal.withLabel": "Quem vai",
  "ticketModal.addToCalendarCta": "Adicionar ao calendário",
  "ticketModal.addedToCalendarToast": "Adicionado ao teu calendário",

  // ── Series-scope modal (SeriesScopeModal) ─────────────────────────────────
  "seriesModal.eyebrow": "A sair",
  "seriesModal.title": "Só esta data, ou a <em>série toda?</em>",
  "seriesModal.justThisDate": "Só esta data",
  "seriesModal.justThisDateSub": "Continuas na série para as próximas datas",
  "seriesModal.leaveWholeSeries": "Sair da série toda",
  "seriesModal.leaveWholeSeriesSub": "Sais de todas as próximas datas",
  "seriesModal.neverMindCta": "Deixa estar",

  // ── Report modal (ReportEventModal) ───────────────────────────────────────
  "reportModal.eyebrow": "Denúncia",
  "reportModal.title": "O que se <em>passa?</em>",
  "reportModal.whyReporting": "Porque estás a denunciar isto?",
  "reportModal.reason.harassment": "Alguém está a sofrer assédio ou ameaças",
  "reportModal.reason.unsafe": "Aconteceu algo inseguro neste evento",
  "reportModal.reason.hate": "Discurso de ódio ou um insulto",
  "reportModal.reason.discrimination": "Discriminação ou uso do género errado",
  "reportModal.reason.spam": "Spam, burla ou informação enganosa",
  "reportModal.reason.shouldntBeHere": "Este evento não devia estar aqui",
  "reportModal.reason.somethingElse": "Outra coisa",
  "reportModal.noteLabel": "Há algo que devíamos saber?",
  "reportModal.noteOptional": "(opcional)",
  "reportModal.notePlaceholder":
    "Conta o que aconteceu por palavras tuas. Só a equipa de segurança vê isto.",
  "reportModal.privacyNote":
    "As denúncias são confidenciais. Quem organiza nunca fica a saber quem denunciou.",
  "reportModal.cancelCta": "Cancelar",
  "reportModal.sendCta": "Enviar denúncia",
  "reportModal.sentToast":
    "Denúncia enviada. A nossa equipa de segurança trata do resto",

  // ── Block-host confirm (BlockHostConfirm) ─────────────────────────────────
  "blockModal.titleNamed": "Bloquear <em>{host}?</em>",
  "blockModal.titleFallback": "Bloquear <em>quem organiza?</em>",
  "blockModal.bodyNamed":
    "Deixas de ver eventos de todas as pessoas de {host}, e essas pessoas deixam de te poder convidar. Podes desfazer isto quando quiseres nas tuas definições.",
  "blockModal.bodyFallback":
    "Deixas de ver eventos de quem organiza, e essa pessoa deixa de te poder convidar. Podes desfazer isto quando quiseres nas tuas definições.",
  "blockModal.cancelCta": "Cancelar",
  "blockModal.confirmCta": "Bloquear",
  "blockModal.blockedToast":
    "Pessoa bloqueada. Não voltas a ver os eventos dela",
  "blockModal.alreadyBlockedToast":
    "Já tens esta pessoa bloqueada. Nada mudou.",

  // ── Toasts from RSVP/notification lifecycle (useMyEventsState.ts) ────────
  "toast.markedMaybe":
    "Marcaste talvez. Quem organiza vê que ainda não tens a certeza",
  "toast.fullyIn": "Estás dentro. Até lá",
  "toast.rsvpGoing": "Vais. Até lá",
  "toast.invitationDeclined": "Convite recusado. Tudo bem.",
  "toast.placeReleased":
    "O teu lugar foi libertado. A próxima pessoa na lista de espera vai ter notícias nossas.",
  "toast.leftWaitlist": "Saíste da lista de espera.",
  "toast.skippedThisOne": "Não vais a esta data. Continuas na série.",
  "toast.leftWholeSeries": "Saíste da série toda.",
};
