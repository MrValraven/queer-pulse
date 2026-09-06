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
  "eventsHeader.hostCta": "Organizar um convívio",

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
  "toolbar.tzNote": "Horas mostradas em Lisboa (WEST)",

  // ── Day filter chip (DayFilterChip) ────────────────────────────────────────
  "dayFilter.showing": "A mostrar <strong>{label}</strong>",
  "dayFilter.showAll": "Mostrar tudo",

  // ── Mobile list/calendar toggle (MobileViewToggle) ────────────────────────
  "mobileView.list": "Lista",
  "mobileView.calendar": "Calendário",

  // ── Offline banner ─────────────────────────────────────────────────────────
  "offline.banner":
    "Estás offline. A mostrar os teus eventos guardados. As alterações sincronizam quando estiveres de volta.",

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
  // Estado distinto de erro/repetir quando a procura de eventos live falha
  // (nunca um falso "sem eventos" — ver EventAgenda).
  "agenda.error.title": "Não conseguimos carregar os teus <em>eventos</em>",
  "agenda.error.description":
    "Algo correu mal ao chegar ao teu calendário. Os teus eventos estão seguros. É só um percalço do nosso lado.",
  "agenda.error.retry": "Tentar de novo",

  // ── Empty states (empties.data.tsx, Pattern B) ────────────────────────────
  "empties.upcoming.title": "Ainda nada no calendário <em>por agora</em>",
  "empties.upcoming.sub":
    "Quando disseres que sim a um convívio ou organizares um teu, aparece logo aqui. Há sempre algo a acontecer. Dá uma vista de olhos quando quiseres.",
  "empties.upcoming.browseCta": "Ver convívios",
  "empties.upcoming.hostCta": "Organiza um teu",
  "empties.going.title": "Sem confirmações <em>por agora</em>",
  "empties.going.sub":
    "Ainda não disseste sim a nada que aí vem. Vê o que há (uma noite de cinema, um piquenique, um clube de leitura tranquilo) e diz sim a um deles.",
  "empties.going.cta": "Ver o que há",
  "empties.hosting.title": "Não estás a organizar <em>nada</em>",
  "empties.hosting.sub":
    "Os melhores convívios começam com uma pessoa a decidir abrir espaço. O teu pode ser um jantar pequeno ou um piquenique inteiro. Ajudamos-te a organizá-lo.",
  "empties.hosting.cta": "Criar um convívio",
  "empties.waitlisted.title": "Sem listas de espera <em>por agora</em>",
  "empties.waitlisted.sub":
    "Quando um convívio que queres está cheio, entra na lista de espera e guardamos o teu lugar. Avisamos-te se abrir uma vaga.",
  "empties.waitlisted.cta": "Ver convívios",
  "empties.past.title": "Sem histórico <em>aqui</em>, mas ainda vais a tempo",
  "empties.past.sub":
    "Depois do teu primeiro convívio, fica aqui como um registo tranquilo de onde estiveste e de quem conheceste.",
  "empties.past.cta": "Encontra o teu primeiro",
  "empties.saved.title": "Nada guardado ou <em>pendente</em>",
  "empties.saved.sub":
    "Guarda convívios de que ainda não tens a certeza, e qualquer convite de outras pessoas espera aqui por ti. Sem pressa, sem stress.",
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
  // PRD-182 — ver a nota no catálogo EN.
  "card.joinLinkDemoToast": "Na demonstração não há uma sala real para entrar.",
  "card.joinLinkMissingToast":
    "Quem organiza ainda não adicionou um link para entrar. Aparece aqui assim que o fizer.",
  "card.joinLinkErrorToast":
    "Não foi possível obter o link para entrar. Tenta outra vez daqui a pouco.",
  "card.directionsToast": "A abrir indicações para {venue}",

  // ── Live-data labels (api/myEvents.adapters.ts) ───────────────────────────
  "card.online": "Online",
  "invite.defaultTitle": "Convite para um evento",

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
  "soon.checkedInToast": "Check-in feito. Tem uma ótima experiência",
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
  "badges.invitedTakeYourTime": "Convidade. Não há pressa",
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
  "side.eventDetailsCta": "Detalhes do evento",
  "side.manageCta": "Gerir",
  "side.viewListingCta": "Ver anúncio",
  "side.seePhotosCta": "Ver fotografias",
  "side.leaveNoteCta": "Deixar uma nota",
  "side.leaveNoteToast": "A abrir a tua nota…",
  "side.receiptCta": "Recibo",
  "side.joinWaitlistCta": "Entrar na lista de espera",
  "side.joinWaitlistToast":
    "Adicionade à lista de espera. Entraremos em contacto",
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
    "Vais receber um lembrete na app antes disto começar",
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
    "à mesma hora. Só podes estar num sítio. Talvez valha a pena deixar um deles.",
  "edge.cancelledTitle": "Quem organiza cancelou este convívio.",
  "edge.cancelledBody": "A tua confirmação foi libertada.",
  "edge.findSomethingSimilar": "encontrar algo semelhante",
  "edge.findingSimilarToast": "A encontrar convívios semelhantes…",
  "edge.reviewTitle": "Em análise.",
  "edge.reviewBody":
    "Chegou uma denúncia, por isso a nossa equipa está a analisar este convívio. Continua visível enquanto verificamos.",
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
  "dayof.runOfShow": "Ordem do dia",
  "dayof.whatToBring": "O que trazer",
  "dayof.gettingIn": "Como entrar",
  "dayof.meetingPoint": "Ponto de convívio:",
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
    "Não foi possível copiar automaticamente. Tenta noutro navegador.",
  "calSubscribe.feedErrorToast":
    "Não foi possível criar o link do teu feed. Tenta outra vez.",
  "calSubscribe.exportTitle": "Exportar este mês",
  "calSubscribe.exportSub": "Transfere um ficheiro .ics único",
  "calSubscribe.exportToast": "Eventos de {month} transferidos como .ics",

  // ── .ics export (myEvents.ics.ts) ─────────────────────────────────────────
  "ics.description": "Vê os detalhes e as novidades no QueerPulse: {url}",

  // ── Recommendations strip (Discovery) ─────────────────────────────────────
  "discovery.title": "Talvez <em>gostes</em>",

  // ── "Your year so far" (InsightsCard) ─────────────────────────────────────
  "insights.eyebrow": "O teu ano até agora",
  "insights.emptyStat": "O teu ano <em>começa</em> aqui",
  "insights.emptySub":
    "Assim que fores ao teu primeiro convívio, ele junta-se aqui: uma contagem tranquila de onde estiveste este ano.",
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
  "moreMenu.shareToast": "Link do evento copiado. Partilha-o onde quiseres",
  "moreMenu.shareCopyFailToast":
    "Não foi possível copiar o link. Tenta de novo",
  "moreMenu.inviteFriend": "Convidar um amigo",
  "moreMenu.invitePickerTitle": "Convidar um amigo",
  "moreMenu.invitePickerSub": "Envia-lhe o evento para se juntar a ti",
  "moreMenu.inviteMessageText": "Vem comigo a {title}: {link}",
  "moreMenu.messageHost": "Enviar mensagem a quem organiza",
  "moreMenu.openGroupChat": "Abrir conversa de grupo",
  "moreMenu.changeToGoing": "Mudar para vou",
  "moreMenu.markAsMaybe": "Marcar como talvez",
  "moreMenu.transferTicket": "Transferir bilhete",
  "moreMenu.transferToast": "Escolhe para quem transferir o teu bilhete…",
  "moreMenu.requestRefund": "Pedir reembolso",
  "moreMenu.refundToast":
    "Reembolso pedido: 3 a 5 dias até voltar ao teu cartão",
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

  // ── Modal aria-labels (MyEventsBody → ModalShell) ─────────────────────────

  // ── Accept-invite confirmation panel (AcceptInviteConfirm) ────────────────
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
    "Este é a pagar o que puderes. Escolhe o que funciona para ti, sem perguntas.",
  "rsvpModal.contribution.free": "0 €: preciso que seja gratuito agora",
  "rsvpModal.contribution.supported": "5 €: tarifa apoiada",
  "rsvpModal.contribution.standard": "10 €: padrão",
  "rsvpModal.contribution.payItForward": "15 €: para ajudar outra pessoa",
  "rsvpModal.accessNeeds": "Necessidades de acesso",
  "rsvpModal.accessPlaceholder":
    "Percurso sem degraus, um canto tranquilo, LGP, tudo o que ajude a estares confortável…",
  "rsvpModal.dietaryNeeds": "Necessidades alimentares",
  "rsvpModal.dietaryPlaceholder":
    "Alergias, vegan, halal, kosher, para eventos onde a comida é partilhada…",
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
  "rsvpModal.savedToast": "Guardado. Só quem organiza vê isto",
  "rsvpModal.saveErrorToast": "Isso não foi guardado. Tenta outra vez.",

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
  "seriesModal.leaveWholeSeriesSub": "Sai de todas as próximas datas",
  "seriesModal.neverMindCta": "Deixa estar",

  // ── Report modal (ReportEventModal) ───────────────────────────────────────
  "reportModal.eyebrow": "Denúncia",
  "reportModal.title": "O que está <em>errado?</em>",
  "reportModal.whyReporting": "Porque estás a denunciar isto?",
  "reportModal.reason.harassment": "Alguém está a sofrer assédio ou ameaças",
  "reportModal.reason.unsafe": "Aconteceu algo inseguro neste evento",
  "reportModal.reason.hate": "Discurso de ódio ou um insulto",
  "reportModal.reason.discrimination": "Discriminação ou uso do género errado",
  "reportModal.reason.spam": "Spam, burla ou enganoso",
  "reportModal.reason.shouldntBeHere": "Este evento não devia estar aqui",
  "reportModal.reason.somethingElse": "Outra coisa",
  "reportModal.noteLabel": "Há algo que devíamos saber?",
  "reportModal.noteOptional": "(opcional)",
  "reportModal.notePlaceholder":
    "Conta o que aconteceu por tuas palavras. Só a equipa de segurança vê isto.",
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
    "Bloqueade. Não vais mais ver os eventos desta pessoa",
  "blockModal.alreadyBlockedToast":
    "Já tens esta pessoa bloqueada. Nada mudou.",

  // ── Toasts from RSVP/notification lifecycle (useMyEventsState.ts) ────────
  "toast.markedMaybe":
    "Marcade como talvez. Quem organiza vê que ainda não tens a certeza",
  "toast.fullyIn": "Estás dentro. Até já",
  "toast.rsvpGoing": "Vais. Até já",
  "toast.invitationDeclined": "Convite recusado. Tudo bem.",
  "toast.placeReleased":
    "O teu lugar foi libertado. A próxima pessoa na lista de espera vai ter notícias nossas.",
  "toast.leftWaitlist": "Saíste da lista de espera.",
  "toast.skippedThisOne": "Saltaste esta. Continuas na série.",
  "toast.leftWholeSeries": "Saíste da série toda.",
};
