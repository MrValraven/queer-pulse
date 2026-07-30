import type { Catalog } from "../../types";

/**
 * My Events — pt-PT. See `en/myevents.ts` for the section map and the scope
 * note (mock event/venue/community/attendee names stay in English).
 * "Host" renders as "quem organiza" (neutral rephrasing, never the gendered
 * "anfitrião/anfitriã") per the inclusive-forms priority order in
 * `docs/i18n/glossary-pt.md`. Register is tu throughout.
 */
export const myevents: Catalog = {
  // ── Page shell (MyEventsPage / MyEventsHeader) ────────────────────────────
  "page.eyebrow": "A tua conta · Eventos",
  "page.title": "Os teus <em>eventos</em>",
  "page.sub":
    "Tudo a que vais e tudo o que organizas — reunido num só lugar acolhedor.",
  "header.settingsAria": "Preferências de eventos",
  "header.notifAria": "Notificações",
  "header.createCta": "Criar um convívio",

  // ── Primary bucket pills (EventPills) ─────────────────────────────────────
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
  "toolbar.sortAria": "Ordenar eventos",
  "toolbar.sort.date": "Ordenar: por data",
  "toolbar.sort.community": "Ordenar: por comunidade",
  "toolbar.sort.status": "Ordenar: por estado",
  "toolbar.density.compact": "Compacto",
  "toolbar.density.comfortable": "Confortável",
  "toolbar.select.select": "Selecionar",
  "toolbar.select.done": "Concluído",
  "toolbar.tzNote": "Horas mostradas em Lisboa (WEST)",

  // ── Day filter chip (DayFilterChip) ────────────────────────────────────────
  "dayFilter.showing": "A mostrar <strong>{label}</strong>",
  "dayFilter.showAll": "Mostrar tudo",

  // ── Mobile list/calendar toggle (MobileViewToggle) ────────────────────────
  "mobileView.list": "Lista",
  "mobileView.calendar": "Calendário",

  // ── Offline banner ─────────────────────────────────────────────────────────
  "offline.banner":
    "Estás offline — a mostrar os teus eventos guardados. As alterações sincronizam quando estiveres de volta.",

  // ── Agenda grouping (myEvents.agenda.ts → EventAgenda) ────────────────────
  "agenda.today": "Hoje",
  "agenda.thisWeek": "Esta semana",
  "agenda.later": "Mais tarde",
  "agenda.hosting": "Organizas",
  "agenda.going": "Vais",
  "agenda.waitlisted": "Lista de espera",
  "agenda.recentlyAttended": "Recentemente",
  "agenda.invitesWaiting": "Convites à tua espera",
  "agenda.savedForLater": "Guardados para depois",
  "agenda.invitesSent": "Convites que enviaste",
  "agenda.otherCommunity": "Outra",
  "agenda.showMore_one": "Mostrar mais {count}",
  "agenda.showMore_other": "Mostrar mais {count}",

  // ── Empty states (empties.data.tsx, Pattern B) ────────────────────────────
  "empties.upcoming.title": "Ainda nada no calendário <em>por agora</em>",
  "empties.upcoming.sub":
    "Quando disseres que sim a um convívio ou organizares um teu, aparece logo aqui. Há sempre algo a acontecer — dá uma vista de olhos quando quiseres.",
  "empties.upcoming.browseCta": "Ver convívios",
  "empties.upcoming.hostCta": "Organiza um teu",
  "empties.going.title": "Sem confirmações <em>por agora</em>",
  "empties.going.sub":
    "Ainda não disseste sim a nada que aí vem. Vê o que há — uma noite de cinema, um piquenique, um clube de leitura tranquilo — e diz sim a um deles.",
  "empties.going.cta": "Ver o que há",
  "empties.hosting.title": "Não estás a organizar <em>nada</em>",
  "empties.hosting.sub":
    "Os melhores convívios começam com uma pessoa a decidir abrir espaço. O teu pode ser um jantar pequeno ou um piquenique inteiro — ajudamos-te a organizá-lo.",
  "empties.hosting.cta": "Criar um convívio",
  "empties.waitlisted.title": "Sem listas de espera <em>por agora</em>",
  "empties.waitlisted.sub":
    "Quando um convívio que queres está cheio, entra na lista de espera e guardamos o teu lugar — avisamos-te se abrir uma vaga.",
  "empties.waitlisted.cta": "Ver convívios",
  "empties.past.title": "Sem histórico <em>aqui</em> — mas ainda vais a tempo",
  "empties.past.sub":
    "Depois do teu primeiro convívio, fica aqui como um registo tranquilo de onde estiveste e de quem conheceste.",
  "empties.past.cta": "Encontra o teu primeiro",
  "empties.saved.title": "Nada guardado ou <em>pendente</em>",
  "empties.saved.sub":
    "Guarda convívios de que ainda não tens a certeza, e qualquer convite de outras pessoas espera aqui por ti — sem pressa, sem stress.",
  "empties.saved.cta": "Ver convívios",
  "empties.day.title": "Nada <em>neste dia</em>",
  "empties.day.sub":
    "Não tens nada marcado aqui. Escolhe outro dia com um ponto, ou limpa o filtro para ver tudo o que aí vem.",
  "empties.day.cta": "Mostrar tudo",
  "empties.search.title": "Nenhum evento <em>corresponde</em>",
  "empties.search.sub":
    "Nada aqui encaixa na tua pesquisa e filtros neste momento. Tenta outra palavra, ou alivia um filtro.",
  "empties.search.cta": "Limpar pesquisa e filtros",

  // ── Event card: select checkbox + meta line (EventCard, EventCardParts) ───
  "card.selectAria": "Selecionar {title}",
  "card.joinLinkCta": "Link para entrar",
  "card.directionsCta": "Indicações",
  "card.joinLinkToast": "A abrir o link para entrar…",
  "card.directionsToast": "A abrir indicações para {venue}",

  // ── Urgency / friends chips (EventCardParts) ──────────────────────────────
  "card.soldOut": "Esgotado",
  "card.spotsOpen_one": "{count} vaga aberta",
  "card.spotsOpen_other": "{count} vagas abertas",
  "card.friendsGoing_one": "{count} das tuas ligações vai",
  "card.friendsGoing_other": "{count} das tuas ligações vão",
  "card.friendsToast": "A mostrar ligações que vão…",

  // ── "Happening now / starts in" bar (myEvents.helpers.ts soonLabel) ───────
  "soon.happeningNow": "A acontecer agora",
  "soon.startsInMins_one": "Começa daqui a {mins}m",
  "soon.startsInMins_other": "Começa daqui a {mins}m",
  "soon.startsInHours": "Começa daqui a {hours}h",
  "soon.startsInHoursMins": "Começa daqui a {hours}h {mins}m",
  "soon.checkInCta": "Fazer check-in",
  "soon.checkedInToast": "Check-in feito — tem uma ótima experiência",
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
  "badges.invitedTakeYourTime": "Convidade — não há pressa",
  "badges.youInvited": "Convidaste {invitee}",
  "badges.waitlistSuffix_one": " · {count} em lista de espera",
  "badges.waitlistSuffix_other": " · {count} em lista de espera",

  // ── Attendee footer line (EventCardBadges EventFoot) ──────────────────────
  "foot.coHostingWith": "A coorganizar com {name}",
  "foot.aheadOfYou":
    "<strong>{count} pessoas antes de ti.</strong> Avisamos-te se abrir uma vaga.",
  "foot.invitedYou": "<strong>{from}</strong> convidou-te",
  "foot.waitingOnReply": "À espera da resposta de <strong>{invitee}</strong>",

  // ── Right-hand action column (EventCardActions EventSide) ────────────────
  "side.findSimilar": "Encontrar semelhantes",
  "side.viewTicket": "Ver bilhete",
  "side.eventDetailsCta": "Detalhes do evento →",
  "side.manageCta": "Gerir",
  "side.viewListingCta": "Ver anúncio →",
  "side.seePhotosCta": "Ver fotografias →",
  "side.leaveNoteCta": "Deixar uma nota →",
  "side.leaveNoteToast": "A abrir a tua nota…",
  "side.receiptCta": "Recibo →",
  "side.joinWaitlistCta": "Entrar na lista de espera",
  "side.joinWaitlistToast":
    "Adicionade à lista de espera — entraremos em contacto",
  "side.rsvpCta": "Confirmar presença",
  "side.removeCta": "Remover →",
  "side.removedFromSavedToast": "Removido dos guardados",
  "side.acceptCta": "Aceitar",
  "side.declineCta": "Recusar",
  "side.manageInviteCta": "Gerir →",

  // ── Card tools row (EventCardActions EventTools) ──────────────────────────
  "tools.reminderOn": "Lembrete ativo",
  "tools.remindMe": "Lembrar-me",
  "tools.addToCalendar": "Adicionar ao calendário",
  "tools.addedToCalendarToast": "Adicionado ao teu calendário",
  "tools.moreOptionsAria": "Mais opções",
  "tools.more": "Mais",
  "tools.switchToGoing": "Mudar para vou",
  "tools.yourDetails": "Os teus detalhes",
  "tools.cantMakeIt": "Não posso ir",
  "tools.inviteCoHost": "Convidar para coorganizar",
  "tools.dayOfDetails": "Detalhes do dia",
  "tools.leaveWaitlist": "Sair da lista de espera",
  "tools.tellHostWhy": "Explicar a quem organiza",
  "tools.tellHostToast": "A abrir uma nota para quem organiza…",
  "tools.thankHost": "Agradecer a quem organiza",
  "tools.thankedToast": "Agradecimento enviado a quem organiza",
  "tools.connectWithMet": "Ligar-te a quem conheceste",
  "tools.connectWithMetToast": "A mostrar pessoas que conheceste aqui…",
  "tools.sendNudge": "Enviar um lembrete",
  "tools.nudgeSentToast": "Lembrete enviado a {invitee}",
  "tools.withdraw": "Retirar",
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
    "Este convívio segue a política de espaço seguro da QueerPulse",
  "alert.plansChanged": "Os planos mudaram.",
  "alert.seeWhatChanged": "Ver o que mudou",
  "alert.seeWhatChangedToast": "A mostrar o histórico completo de alterações",
  "conflict.clashesWith": "Coincide com {title}",
  "conflict.body":
    "à mesma hora. Só podes estar num sítio — talvez valha a pena deixar um deles.",
  "edge.cancelledTitle": "Quem organiza cancelou este convívio.",
  "edge.cancelledBody": "A tua confirmação foi libertada —",
  "edge.findSomethingSimilar": "encontrar algo semelhante",
  "edge.findingSimilarToast": "A encontrar convívios semelhantes…",
  "edge.reviewTitle": "Em análise.",
  "edge.reviewBody":
    "Chegou uma denúncia, por isso a nossa equipa está a analisar este convívio. Continua visível enquanto verificamos —",
  "edge.seeStatus": "ver estado",
  "edge.seeStatusToast": "A abrir o estado da análise…",
  "edge.blockedBody":
    "Alguém que bloqueaste vai a este evento. Essa pessoa não te vê, e tu também não a vês na noite do evento.",
  "series.upcomingDatesToast": "Próximas datas · {dates}",
  "dayof.runOfShow": "Ordem do dia",
  "dayof.whatToBring": "O que trazer",
  "dayof.gettingIn": "Como entrar",
  "dayof.meetingPoint": "Ponto de convívio:",
  "dayof.doorCode": "Código da porta:",
  "dayof.doorCodeNote": "— mostrado porque está prestes a começar",

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
  "calendar.cellEventCount_one": "{count} evento",
  "calendar.cellEventCount_other": "{count} eventos",
  "calendar.cellNoEvents": "sem eventos",
  "calendar.cellAriaToday": ", hoje",

  // ── Subscribe / export (CalendarSubscribe) ────────────────────────────────
  "calSubscribe.feedTitle": "Subscrever o teu feed",
  "calSubscribe.feedSub":
    "Sincroniza automaticamente com o Google ou Apple Calendar",
  "calSubscribe.feedToast":
    "Link do feed copiado — adiciona-o no Google ou Apple Calendar",
  "calSubscribe.exportTitle": "Exportar este mês",
  "calSubscribe.exportSub": "Transfere um ficheiro .ics único",
  "calSubscribe.exportToast": "Eventos de {month} transferidos como .ics",

  // ── Recommendations strip (Discovery) ─────────────────────────────────────
  "discovery.title": "Talvez <em>gostes</em>",
  "discovery.imGoingCta": "Eu vou",
  "discovery.imGoingToast": "Vais — adicionado aos teus eventos",
  "discovery.saveCta": "Guardar",
  "discovery.saveToast": "Guardado para depois",
  "discovery.hideCta": "Ocultar",

  // ── "Your year so far" (InsightsCard) ─────────────────────────────────────
  "insights.eyebrow": "O teu ano até agora",
  "insights.emptyStat": "O teu ano <em>começa</em> aqui",
  "insights.emptySub":
    "Assim que fores ao teu primeiro convívio, ele junta-se aqui — uma contagem tranquila de onde estiveste este ano.",
  "insights.emptyCta": "Encontra o teu primeiro",
  "insights.stat_one": "<em>{count}</em> convívio",
  "insights.stat_other": "<em>{count}</em> convívios",
  "insights.sub": "Todos os convívios a que apareceste este ano.",
  "insights.streak_one": "mês seguido",
  "insights.streak_other": "meses seguidos",
  "insights.topCircle": "o teu círculo principal",
  "insights.hosted": "organizaste",

  // ── Overflow menu (MoreMenu) ───────────────────────────────────────────────
  "moreMenu.share": "Partilhar este evento",
  "moreMenu.shareToast": "Link do evento copiado — partilha-o onde quiseres",
  "moreMenu.shareCopyFailToast":
    "Não foi possível copiar o link — tenta de novo",
  "moreMenu.inviteFriend": "Convidar um amigo",
  "moreMenu.messageHost": "Enviar mensagem a quem organiza",
  "moreMenu.openGroupChat": "Abrir conversa de grupo",
  "moreMenu.changeToGoing": "Mudar para vou",
  "moreMenu.markAsMaybe": "Marcar como talvez",
  "moreMenu.transferTicket": "Transferir bilhete",
  "moreMenu.transferToast": "Escolhe para quem transferir o teu bilhete…",
  "moreMenu.requestRefund": "Pedir reembolso",
  "moreMenu.refundToast":
    "Reembolso pedido — 3 a 5 dias até voltar ao teu cartão",
  "moreMenu.addToWallet": "Adicionar à Apple Wallet",
  "moreMenu.walletToast": "Adicionado à Apple Wallet",
  "moreMenu.connectWithMet": "Ligar-te a quem conheceste",
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
  "bulk.droppedToast_one": "{count} evento largado",
  "bulk.droppedToast_other": "{count} eventos largados",
  "bulk.undoCta": "Desfazer",
  "bulk.broughtBackToast": "Repuseste",

  // ── Notifications panel (NotifPanel) ──────────────────────────────────────
  "notif.panelAria": "Notificações",
  "notif.title": "O que mudou",
  "notif.markAllRead": "Marcar tudo como lido",
  "notif.empty": "Estás em dia.",

  // ── Modal aria-labels (MyEventsBody → ModalShell) ─────────────────────────
  "modal.rsvpDetailsLabel": "Os detalhes da tua confirmação",
  "modal.preferencesLabel": "Preferências de eventos",
  "modal.cancelRsvpLabel": "Cancelar confirmação",
  "modal.reportLabel": "Denunciar este evento",
  "modal.blockLabel": "Bloquear quem organiza",

  // ── Accept-invite confirmation panel (AcceptInviteConfirm) ────────────────
  "acceptConfirm.ariaLabel": "Vais",
  "acceptConfirm.eyebrow": "Vais",
  "acceptConfirm.title": "Disseste que <em>sim.</em>",
  "acceptConfirm.addToCalendarCta": "Adicionar ao calendário",
  "acceptConfirm.doneCta": "Concluído",

  // ── RSVP details modal (RsvpDetailsModal) ─────────────────────────────────
  "rsvpModal.eyebrow": "A tua confirmação",
  "rsvpModal.title": "Há algo que devíamos <em>saber?</em>",
  "rsvpModal.whosComing": "Quem vai",
  "rsvpModal.bringingGuest": "Vou levar +1",
  "rsvpModal.guestHint":
    "Adiciona um nome para quem organiza poder dar as boas-vindas também",
  "rsvpModal.guestNamePlaceholder": "Nome de quem levas (opcional)",
  "rsvpModal.contributionLabel": "A tua contribuição",
  "rsvpModal.slidingHint":
    "Este é a pagar o que puderes — escolhe o que funciona para ti, sem perguntas.",
  "rsvpModal.contribution.free": "0 € — preciso que seja gratuito agora",
  "rsvpModal.contribution.supported": "5 € — tarifa apoiada",
  "rsvpModal.contribution.standard": "10 € — padrão",
  "rsvpModal.contribution.payItForward": "15 € — para ajudar outra pessoa",
  "rsvpModal.accessNeeds": "Necessidades de acesso",
  "rsvpModal.accessPlaceholder":
    "Percurso sem degraus, um canto tranquilo, LGP, tudo o que ajude a estares confortável…",
  "rsvpModal.dietaryNeeds": "Necessidades alimentares",
  "rsvpModal.dietaryPlaceholder":
    "Alergias, vegan, halal, kosher — para eventos onde a comida é partilhada…",
  "rsvpModal.whoSees": "Quem pode ver que vais?",
  "rsvpModal.visibility.everyone": "Todas as pessoas",
  "rsvpModal.visibility.connections": "Ligações",
  "rsvpModal.visibility.justMe": "Só eu",
  "rsvpModal.attendQuietly": "Participar discretamente",
  "rsvpModal.attendQuietlyDesc":
    "Participa sem o teu nome aparecer na lista de convidades.",
  "rsvpModal.privacyNote":
    "Só quem organiza vê as tuas notas de acesso e alimentação. Podes mudar tudo isto quando quiseres.",
  "rsvpModal.cancelCta": "Cancelar",
  "rsvpModal.saveCta": "Guardar",
  "rsvpModal.savedToast": "Guardado — só quem organiza vê isto",

  // ── Event preferences modal (EventSettingsModal) ──────────────────────────
  "settingsModal.eyebrow": "Preferências",
  "settingsModal.title": "Como os teus eventos <em>chegam até ti</em>",
  "settingsModal.comingSoonNote":
    "Uma pré-visualização do que aí vem — vais poder configurar isto assim que estiver disponível.",
  "settingsModal.pushLiveNote":
    "O tempo do lembrete e o push no telemóvel estão ativos — escolhe quando és lembrado e ativa o push para o receberes no telemóvel. O resto é uma pré-visualização do que aí vem.",
  "settingsModal.pushLiveDesc":
    "Neste dispositivo — uma notificação quando um evento a que vais está prestes a começar.",
  "settingsModal.pushUnsupported":
    "Este navegador não suporta notificações push.",
  "settingsModal.pushBlocked":
    "As notificações estão bloqueadas nas definições do navegador.",
  "settingsModal.remindBefore": "Lembrar-me antes de um evento",
  "settingsModal.lead.hour": "1 hora",
  "settingsModal.lead.day": "1 dia",
  "settingsModal.lead.week": "1 semana",
  "settingsModal.byDefaultWhoSees": "Por norma, quem vê onde vais",
  "settingsModal.howWeReachYou": "Como chegamos até ti",
  "settingsModal.email": "Email",
  "settingsModal.emailDesc": "Lembretes, alterações e convites por email.",
  "settingsModal.emailToggleLabel": "Lembretes por email",
  "settingsModal.push": "Notificações push",
  "settingsModal.pushDesc": "No teu telemóvel, para alterações urgentes.",
  "settingsModal.pushToggleLabel": "Notificações push",
  "settingsModal.syncTickets": "Sincronização e bilhetes",
  "settingsModal.connectCalendar": "Liga o teu calendário",
  "settingsModal.connectCalendarSub":
    "Sincronização bidirecional com Google ou Apple",
  "settingsModal.ticketsReceipts": "Bilhetes e recibos",
  "settingsModal.ticketsReceiptsSub":
    "Todos os teus bilhetes e registos de pagamento",
  "settingsModal.privacyNote":
    "A QueerPulse nunca vende os teus dados. A visibilidade é sempre uma escolha tua.",
  "settingsModal.closeCta": "Fechar",

  // ── Series-scope modal (SeriesScopeModal) ─────────────────────────────────
  "seriesModal.eyebrow": "A sair",
  "seriesModal.title": "Só esta data, ou a <em>série toda?</em>",
  "seriesModal.justThisDate": "Só esta data",
  "seriesModal.justThisDateSub": "Continuas na série para as próximas datas",
  "seriesModal.leaveWholeSeries": "Sair da série toda",
  "seriesModal.leaveWholeSeriesSub": "Sai de todas as próximas datas",
  "seriesModal.neverMindCta": "Deixa estar",

  // ── Report modal (ReportEventModal) ───────────────────────────────────────
  "reportModal.eyebrow": "Denúncia",
  "reportModal.title": "O que está <em>errado?</em>",
  "reportModal.whyReporting": "Porque estás a denunciar isto?",
  "reportModal.reason.hate": "Discurso de ódio ou assédio",
  "reportModal.reason.unsafe": "Comportamento inseguro ou ameaçador",
  "reportModal.reason.spam": "Spam, burla ou enganoso",
  "reportModal.reason.shouldntBeHere": "Este evento não devia estar aqui",
  "reportModal.reason.somethingElse": "Outra coisa",
  "reportModal.noteLabel": "Há algo que devíamos saber?",
  "reportModal.noteOptional": "(opcional)",
  "reportModal.notePlaceholder":
    "Conta o que aconteceu por tuas palavras — só a equipa de segurança vê isto.",
  "reportModal.privacyNote":
    "As denúncias são confidenciais. Quem organiza nunca fica a saber quem denunciou.",
  "reportModal.cancelCta": "Cancelar",
  "reportModal.sendCta": "Enviar denúncia",
  "reportModal.sentToast":
    "Denúncia enviada — a nossa equipa de segurança trata do resto",

  // ── Block-host confirm (BlockHostConfirm) ─────────────────────────────────
  "blockModal.eyebrow": "Bloquear",
  "blockModal.titleNamed": "Bloquear <em>{host}?</em>",
  "blockModal.titleFallback": "Bloquear <em>quem organiza?</em>",
  "blockModal.bodyNamed":
    "Deixas de ver eventos de todas as pessoas de {host}, e essas pessoas deixam de te poder convidar. Podes desfazer isto quando quiseres nas tuas definições.",
  "blockModal.bodyFallback":
    "Deixas de ver eventos de quem organiza, e essa pessoa deixa de te poder convidar. Podes desfazer isto quando quiseres nas tuas definições.",
  "blockModal.cancelCta": "Cancelar",
  "blockModal.confirmCta": "Bloquear",
  "blockModal.blockedToast":
    "Bloqueade — não vais mais ver os eventos desta pessoa",

  // ── Toasts from RSVP/notification lifecycle (useMyEventsState.ts) ────────
  "toast.reminderSet": "Lembrete definido — {lead} antes",
  "toast.reminderOff": "Lembrete desativado",
  "toast.markedMaybe":
    "Marcade como talvez — quem organiza vê que ainda não tens a certeza",
  "toast.fullyIn": "Estás dentro — até já",
  "toast.rsvpGoing": "Vais — até já",
  "toast.invitationDeclined": "Convite recusado — tudo bem.",
  "toast.placeReleased":
    "O teu lugar foi libertado — a próxima pessoa na lista de espera vai ter notícias nossas.",
  "toast.leftWaitlist": "Saíste da lista de espera.",
  "toast.skippedThisOne": "Saltaste esta — continuas na série.",
  "toast.leftWholeSeries": "Saíste da série toda.",
  "toast.preferencesSaved": "Preferências guardadas",
};
