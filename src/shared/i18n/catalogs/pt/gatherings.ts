import type { Catalog } from "../../types";

/**
 * Convívios — pt-PT inclusivo. Mesmas chaves que `en/gatherings.ts`.
 *
 * Notas de tradução:
 * - "Members" → *pessoas* / *a comunidade*, nunca *Membros* (masculino por
 *   omissão, genderiza toda a comunidade).
 * - Registo `tu`, caloroso, nunca `você`.
 * - Nomes próprios (bairros de Lisboa, como Príncipe Real ou Intendente) e a
 *   marca QueerPulse ficam iguais.
 * - Títulos, descrições e biografias fictícias dos eventos NÃO são traduzidos —
 *   em modo live vêm da API como texto de quem os escreveu.
 */
export const gatherings: Catalog = {
  // ── Página de entrada (GatheringsPage) ────────────────────────────────────
  "landing.hero.eyebrow": "Convívios",
  "landing.hero.title": "A comunidade, <em>na mesma sala.</em>",
  "landing.hero.lead":
    "Jantares partilhados, convívios, visitas a ateliês, sessões de cinema e trocas de saberes — convívios reais por toda a Lisboa, organizados por pessoas da comunidade para a comunidade. É aqui que a plataforma deixa de ser um ecrã.",

  "landing.ways.title": "Descobre por onde <em>entrar.</em>",
  "landing.ways.lead":
    "Se é a tua primeira vez ou se já vais no décimo jantar que organizas, começa por aqui.",
  "landing.ways.browse.title": "Vê o que há",
  "landing.ways.browse.body":
    "Jantares partilhados, convívios, visitas a ateliês, sessões de cinema e trocas de saberes — filtra por bairro, tipo e data.",
  "landing.ways.browse.cta": "Ver todos os eventos",
  "landing.ways.calendar.title": "A vista de calendário",
  "landing.ways.calendar.body":
    "O mês inteiro num relance, com as tuas inscrições e os convívios perto de ti em destaque.",
  "landing.ways.calendar.cta": "Abrir o calendário",
  "landing.ways.host.title": "Organiza o teu",
  "landing.ways.host.body":
    "Um guia passo a passo para organizares um jantar, uma oficina ou uma sessão de cinema — com espaços parceiros e apoio da comunidade.",
  "landing.ways.host.cta": "Organizar um convívio",
  "landing.ways.recap.title": "Revive o último",
  "landing.ways.recap.body":
    "Fotografias, notas e quantas pessoas apareceram nos convívios que já aconteceram.",
  "landing.ways.recap.cta": "Ver retrospetivas",

  "landing.featured.title": "A acontecer <em>em breve.</em>",
  "landing.featured.lead":
    "Uma amostra das próximas semanas. O quadro completo está na página de eventos.",

  "landing.outro.title": "Junta as <em>pessoas.</em>",
  "landing.outro.sub":
    "Cada convívio começou com uma pessoa que decidiu organizar. A plataforma trata do resto — bilhetes, escala móvel e um lugar no quadro.",
  "landing.outro.browseCta": "Ver todos os eventos",
  "landing.outro.hostCta": "Organizar um convívio",

  // ── Bairros de Lisboa ─────────────────────────────────────────────────────
  // Nomes próprios: iguais em ambos os catálogos.
  "hood.principeReal": "Príncipe Real",
  "hood.alfama": "Alfama",
  "hood.marvila": "Marvila",
  "hood.mouraria": "Mouraria",
  "hood.graca": "Graça",
  "hood.caisDoSodre": "Cais do Sodré",
  "hood.arroios": "Arroios",
  "hood.bairroAlto": "Bairro Alto",

  // ── Linha de vagas no cartão do evento ────────────────────────────────────
  // "{count} pessoas vão" evita particípios genderizados ("confirmados").
  "spots.seatsLeft_one": "Resta {count} lugar",
  "spots.seatsLeft_other": "Restam {count} lugares",
  "spots.spotsLeft_one": "Resta {count} vaga",
  "spots.spotsLeft_other": "Restam {count} vagas",
  "spots.going_one": "{count} pessoa vai",
  "spots.going_other": "{count} pessoas vão",
  "spots.goingSoFar_one": "{count} pessoa vai até agora",
  "spots.goingSoFar_other": "{count} pessoas vão até agora",
  "spots.goingWithWaitlist_one":
    "{count} pessoa vai · {waitlist} em lista de espera",
  "spots.goingWithWaitlist_other":
    "{count} pessoas vão · {waitlist} em lista de espera",
  "spots.goingWithPrice_one": "{count} pessoa vai · {price}",
  "spots.goingWithPrice_other": "{count} pessoas vão · {price}",
  "spots.goingPayWhatYouCan_one": "{count} pessoa vai · pagas o que puderes",
  "spots.goingPayWhatYouCan_other": "{count} pessoas vão · pagas o que puderes",
  "spots.goingOnline_one": "{count} pessoa vai · online",
  "spots.goingOnline_other": "{count} pessoas vão · online",
  "spots.casual": "Informal",
  "spots.openToAll": "Aberto a toda a gente",
  "spots.familyFriendly": "Para toda a família",
  "spots.online": "Online",
  "spots.allPaces": "Todos os ritmos",
  "spots.ages1625": "Dos 16 aos 25",
  "spots.byAppointment": "Com marcação",
  "spots.noAudition": "Sem audição",
  "spots.dropIn": "Entra quando quiseres",
  "spots.waitlistOpen": "Lista de espera aberta",

  // ── Ações de inscrição ────────────────────────────────────────────────────
  "cta.reserveSeat": "Reservar lugar",
  "cta.reserveSpot": "Reservar vaga",
  "cta.requestSpot": "Pedir uma vaga",
  "cta.illBeThere": "Eu vou",
  "cta.rsvp": "Confirmar presença",
  "cta.joinOnline": "Entrar online",
  "cta.bookSlot": "Marcar horário",
  "cta.joinWaitlist": "Entrar na lista de espera",

  // ── Linha de detalhe de quem vai (attendeeMeta) ───────────────────────────
  // Os pronomes ao lado são as palavras da própria pessoa — não se traduzem.
  "attendee.rsvpdOn": "Confirmou em {date}",
  "attendee.waitlistedSince": "Em lista de espera desde {date}",
  "attendee.waitlistPosition": "#{position}",

  // ── Legenda do calendário ─────────────────────────────────────────────────
  "calendar.legend.queerpulse": "QueerPulse",
  "calendar.legend.community": "Comunidade",

  // ── Event, RSVP, gathering detail, cancelled, cohost invite ───────────────
  // Shared/cross-page chrome
  "common.backToGatherings": "← Convívios",
  "common.hostedBy": "Organização de",

  // EventPage — About / Details / Guidelines / hero / members-only / pills
  "event.about.title": "Sobre este convívio",
  "event.about.accessibilityLabel": "Acessibilidade",
  "event.details.title": "Detalhes do evento",
  "event.details.dateTime": "Data e hora",
  "event.details.location": "Localização",
  "event.details.foodDrink": "Comida e bebida",
  "event.details.language": "Idioma",
  "event.details.locationNote":
    "A morada exata e os detalhes de acesso são partilhados com quem confirmar presença.",
  "event.guidelines.title": "Diretrizes da comunidade para este convívio",
  "event.guidelines.body1":
    "Este é um evento privado da QueerPulse. Todas as pessoas aqui foram convidadas porque alguém as avalizou ou porque já são da comunidade. O Código de Cuidado aplica-se. Traz calor humano, está presente e não fotografes ninguém sem pedir.",
  "event.guidelines.body2":
    "A escala progressiva não é uma sugestão — se conseguires pagar o escalão mais alto, paga-o. Isso subsidia diretamente o bilhete de outra pessoa.",
  "event.hero.viewProfileCta": "Ver perfil",
  "event.membersOnly.title": "Só para pessoas da QueerPulse",
  "event.membersOnly.body":
    "Este evento é privado. Se alguém te reencaminhou este link, pede-lhe primeiro que te convide para a rede.",
  "event.pills.slidingScale": "Escala progressiva · {min}–{max} €",

  // EventPage — sliding-scale ticket tiers (fixed platform chrome)
  "event.tiers.free.name": "Gratuito",
  "event.tiers.free.desc": "Sem barreiras para participar",
  "event.tiers.standard.name": "Padrão",
  "event.tiers.standard.desc": "Cobre o custo do teu jantar",
  "event.tiers.supporter.name": "Apoiante",
  "event.tiers.supporter.desc": "Subsidia o lugar de outra pessoa",

  // EventRsvpCard + EventRsvpSuccess
  "event.rsvp.headTitleFull": "Este convívio está esgotado",
  "event.rsvp.headTitle": "Reserva o teu lugar",
  "event.rsvp.headSubFull":
    "Entra na lista de espera — avisamos-te por email se surgir uma vaga.",
  "event.rsvp.headSub": "Paga o que puderes. Todos os escalões incluem tudo.",
  "event.rsvp.spotsRemaining_one": "<strong>Resta {count} vaga</strong>",
  "event.rsvp.spotsRemaining_other": "<strong>Restam {count} vagas</strong>",
  "event.rsvp.filledOfCapacity": "{filled} de {capacity} preenchidos",
  "event.rsvp.namePlaceholder": "O teu nome *",
  "event.rsvp.emailPlaceholder": "O teu email *",
  "event.rsvp.dietaryPlaceholder": "Restrições alimentares (opcional)",
  "event.rsvp.requiredHintFull":
    "Nome e email são obrigatórios — é para lá que enviamos a atualização da lista de espera.",
  "event.rsvp.requiredHint":
    "Nome e email são obrigatórios — é para lá que enviamos a tua confirmação.",
  "event.rsvp.joinWaitlistCta": "Entrar na lista de espera",
  "event.rsvp.reserveCta": "Reservar o meu lugar",
  "event.rsvp.disabledHint":
    "Indica o teu nome e um email válido para continuar",
  "event.rsvp.noteFull":
    "Enviamos-te um email assim que surgir uma vaga. Sair da lista de espera é só um clique.",
  "event.rsvp.confirmationEmailNote": "Vais receber um email de confirmação.",
  "event.rsvp.cancelPolicy": "Podes cancelar até 48 horas antes do evento.",
  "event.rsvp.waitlistTitle":
    "Estás em <em>#{position}</em> na lista de espera.",
  "event.rsvp.waitlistBody":
    "Este convívio está esgotado, mas <strong>enviamos um email para {email}</strong> assim que surgir uma vaga — normalmente um ou dois dias depois de alguém cancelar.",
  "event.rsvp.waitlistMeta":
    "Podes sair da lista de espera a qualquer momento.",
  "event.rsvp.leaveWaitlistCta": "Sair da lista de espera",
  "event.rsvp.reservedTitle": "Vais <em>estar lá.</em>",
  "event.rsvp.reservedTier": "Reservado no escalão <strong>{tier}</strong>",
  "event.rsvp.confirmationOnWay":
    "Uma confirmação está a caminho de <strong>{email}</strong>.",
  "event.rsvp.addToCalendarCta": "Adicionar ao calendário",
  "event.rsvp.messageHostCta": "Mensagem à pessoa anfitriã",
  "event.rsvp.cancelReservationCta": "Cancelar a minha reserva",

  // GatheringPage
  "gathering.badge.event": "Evento QueerPulse",
  "gathering.badge.gathering": "Convívio da comunidade",
  "gathering.seeAllCta": "Ver todos os convívios",
  "gathering.spotsRemainingLabel": "vagas restantes",
  "gathering.spotsUrgencyNote": "Não percas tempo se isto te chamar",
  "gathering.locationNote":
    "A localização completa é partilhada com quem confirmar presença.",
  "gathering.moreTitle": "Mais <em>convívios</em>",
  "gathering.notFoundTitle": "Não encontrámos este convívio",
  "gathering.notFoundDescription":
    "Pode ter sido cancelado, ou o link pode estar desatualizado.",

  // JoinVouchCallout
  "vouchCallout.title": "Chegaste agora? <em>Pede um aval.</em>",
  "vouchCallout.body":
    "Os convívios da QueerPulse são só para pessoas da comunidade. Para entrares, alguém da rede avaliza-te, ou pedes um convite e alguém trata do resto. Isto mantém todas as salas seguras.",
  "vouchCallout.requestInviteCta": "Pedir um convite",
  "vouchCallout.safetyCta": "Como mantemos isto seguro",

  // GatheringSuccessPanel
  "successPanel.ariaLabel": "Confirmação",
  "successPanel.closeAriaLabel": "Fechar",
  "successPanel.defaultCloseLabel": "Concluído",

  // RsvpPage (reading-group RSVP confirmation)
  "rsvp.eyebrow": "Vais participar",
  "rsvp.title": "Estás <em>dentro.</em>",
  "rsvp.details.dateTime": "Data e hora",
  "rsvp.details.location": "Localização",
  "rsvp.details.host": "Organização",
  "rsvp.withLabel": "Vais com",
  "rsvp.othersCount_one": "e mais {count} pessoa",
  "rsvp.othersCount_other": "e mais {count} pessoas",
  "rsvp.host.roleLabel": "Organização do clube de leitura",
  "rsvp.calendar.label": "Adicionar ao calendário",
  "rsvp.calendar.googleCta": "Google Calendar",
  "rsvp.calendar.appleCta": "Apple / .ics",
  "rsvp.calendar.downloadedToast": "Ficheiro de calendário descarregado.",
  "rsvp.viewDetailsCta": "Ver detalhes do convívio",
  "rsvp.inviteCta": "Conta a alguém — copiar link de convite",
  "rsvp.inviteCopiedToast":
    "Link de convite copiado. Partilha-o com alguém que devia vir.",
  "rsvp.coc.title": "O que <em>esperar</em>",
  "rsvp.coc.affirming.strong": "Este é um espaço de afirmação.",
  "rsvp.coc.affirming.rest":
    "Traz-te por inteiro — incluindo as partes que normalmente deixas à porta. Identidade queer, vivência trans, neurodivergência, deficiência: és bem-vinde como és.",
  "rsvp.coc.consent.strong": "Praticamos o consentimento ativo.",
  "rsvp.coc.consent.rest":
    "Pergunta antes de tocar, confirma antes de partilhar fotografias e presta atenção às outras pessoas. Na dúvida, pergunta.",
  "rsvp.coc.privacy.strong": "O que acontece aqui fica aqui.",
  "rsvp.coc.privacy.rest":
    "Esta é uma comunidade privada. Por favor não partilhes informação pessoal, histórias ou fotografias dos convívios sem consentimento.",
  "rsvp.coc.organiser.strong": "Se algo não parecer bem, avisa a organização.",
  "rsvp.coc.organiser.rest":
    "{host} está lá para que o espaço funcione para todas as pessoas. Não precisas de gerir isto sozinho.",
  "rsvp.footer.membership": "Confirmaste presença como pessoa da QueerPulse.",
  "rsvp.footer.cancelCta": "Cancelar presença",
  "rsvp.footer.cancelledToast": "A tua presença foi cancelada.",
  "rsvp.footer.privacyCta": "Política de privacidade",

  // CoHostInvitePage
  "cohostInvite.back": "← Notificações",
  "cohostInvite.eyebrow": "Convite para co-organizar",
  "cohostInvite.title": "{host} quer que <em>co-organizes</em> com ela.",
  "cohostInvite.readThroughHint":
    "Lê tudo com calma; decide amanhã se preferires dormir sobre o assunto.",
  "cohostInvite.hostedCount_one": "Organizou {count} convívio",
  "cohostInvite.hostedCount_other": "Organizou {count} convívios",
  "cohostInvite.ratingFromAttendees": "da parte de quem participou",
  "cohostInvite.attendedCount": "Já foste a {count} dos convívios dela",
  "cohostInvite.mutualsCount_one": "{count} contacto em comum",
  "cohostInvite.mutualsCount_other": "{count} contactos em comum",
  "cohostInvite.invitedAgo": "Convite enviado {time}",
  "cohostInvite.replyBy": "Responde até {date}",
  "cohostInvite.rsvpsAndWaitlist":
    "{rsvps} confirmações · {waitlist} em lista de espera",
  "cohostInvite.rolesTitle": "O que significa <em>co-organizar</em>",
  "cohostInvite.permRequired": "Obrigatório",
  "cohostInvite.permGranted": "Concedido",
  "cohostInvite.permHostOnly": "Só {host}",
  "cohostInvite.commitTitle": "O <em>compromisso</em> sincero",
  "cohostInvite.commitSub":
    "O que isto realmente te vai custar. Preferimos que digas que não a que apareças cansade.",
  "cohostInvite.outclauseBold":
    "Se surgir algum imprevisto, podes desistir a qualquer momento antes do dia",
  "cohostInvite.sleepCta": "Pensar com calma",
  "cohostInvite.snoozedToast": "Adiado — lembramos-te amanhã",
  "cohostInvite.declineCta": "Recusar com delicadeza",
  "cohostInvite.acceptCta": "Sim — co-organizar com {host}",
  "cohostInvite.acceptedToast":
    "Estás a co-organizar com {host} — ferramentas de organização desbloqueadas",
  "cohostInvite.declinedToast":
    "Recusa enviada a {host}. Ela vai encontrar outra ajuda.",
  "cohostInvite.actionMeta":
    "Qualquer uma das opções envia uma mensagem direta a {host}. Ela vê a tua decisão mas não recebe notificação push — <b>isto é para ser tranquilo</b>.",
  "cohostInvite.openMessagesCta": "Abrir mensagens",

  // GatheringCancelledPage
  "cancelled.back": "← Voltar ao calendário",
  "cancelled.stampTitle": "Este evento foi cancelado.",
  "cancelled.stampBody":
    "Estavas na lista — aqui está tudo o que acontece a seguir.",
  "cancelled.explainerTitle": "Porque foi cancelado",
  "cancelled.hostSentLabel": "organização · enviou o cancelamento",
  "cancelled.sendWellWishesCta": "Enviar votos de melhoras",
  "cancelled.infoTitle": "O que acontece <em>contigo</em>",
  "cancelled.refundTitle":
    "O teu bilhete de {price} é reembolsado — automaticamente",
  "cancelled.headcountTitle": "Foste removide da contagem",
  "cancelled.headcountBody":
    "O estúdio sabia exatamente quem vinha. Não há mais nada a fazer.",
  "cancelled.rescheduleTitle": "A visita de {date} está aberta a confirmações",
  "cancelled.rescheduleBody":
    "Podes garantir já o dia {date} — normalmente {host} abre isto mais tarde, mas adiantámos por causa disto. <a>Salta para lá ↓</a>",
  "cancelled.concernTitle": "Algo não parece bem?",
  "cancelled.concernBody":
    "Se tens preocupações sobre o cancelamento ou queres assinalar um padrão, fala com a equipa →",
  "cancelled.noteEyebrow": "Uma nota breve · de {host}",
  "cancelled.noteSentVia":
    "enviada {time} através das ferramentas de organização",
  "cancelled.altHeading": "Próxima visita, ou — outra coisa este fim de semana",
  "cancelled.altRsvpsOpen": "Confirmações abertas",
  "cancelled.calendarCta": "Calendário",
  "cancelled.rsvpCta": "Confirmar para {date}",

  // ── Calendar, events board, recap, photo album ────────────────────────────
  // Calendar
  "calendar.eyebrow": "Calendário da Comunidade",
  "calendar.heroTitle": "Tudo o que está a acontecer <em>num só lugar.</em>",
  "calendar.heroSub":
    "Todos os convívios QueerPulse e eventos organizados pela comunidade em Lisboa — jantares, workshops, círculos de apoio, sessões de cinema e muito mais — num calendário partilhado.",
  "calendar.prevMonth": "Mês anterior",
  "calendar.nextMonth": "Mês seguinte",
  "calendar.upcomingTitle": "Todos os próximos eventos",
  "calendar.emptyTitle": "Sem convívios marcados",
  "calendar.emptyDescription":
    "O calendário está calmo por agora. Explora o que está a acontecer na comunidade, ou sê tu a começar algo.",
  "calendar.browseEventsCta": "Explorar eventos",
  "calendar.selectedDayLabel": "Dia selecionado",
  "calendar.selectDayPrompt": "Clica num dia com eventos para ver os detalhes",
  "calendar.noEventsDay": "Sem eventos neste dia.",
  "calendar.subscribeTitle": "Subscrever o calendário",
  "calendar.subscribeBody":
    "Recebe todos os eventos da comunidade queer na tua aplicação de calendário. Funciona com Google Calendar, Apple Calendar e Outlook.",
  "calendar.emailPlaceholder": "teu@email.com",
  "calendar.subscribeCta": "Subscrever",
  "calendar.subscribedCta": "Subscrito",
  "calendar.hostCta": "Organiza o teu convívio",

  // Events
  "events.eyebrow": "O que se passa",
  "events.subtitle":
    "Cada evento aqui é organizado pela QueerPulse ou por pessoas da comunidade — explora a temporada e encontra a tua gente.",
  "events.categoryAll": "Todos os eventos",
  "events.categoryQueerpulse": "QueerPulse",
  "events.categoryCommunity": "Comunidade",
  "events.heroTitle": "Tudo o que está a acontecer <em>esta temporada</em>",
  "events.viewCalendarCta": "Ver como calendário",
  "events.filterAriaLabel": "Filtrar eventos",
  "events.kindEvent": "Evento",
  "events.kindGathering": "Convívio",
  "events.ticketedTag": "Com bilhete",
  "events.buyTicketCta": "Comprar bilhete",
  "events.priceSingle": "{price}",
  "events.priceRange": "{min}–{max}",
  "events.emptyTitle": "Ainda não há nada marcado",
  "events.emptyDescription":
    "Não há eventos marcados neste momento. Novos convívios e eventos parceiros aparecem aqui com frequência — volta a verificar em breve.",
  "events.emptyFilterTitle": "Ainda não há nada nesta categoria",
  "events.emptyFilterDescription":
    "Nenhum evento corresponde a este filtro para a temporada. Experimenta outra categoria, ou explora tudo o que está a acontecer.",
  "events.showAllCta": "Mostrar todos os eventos",
  "events.loadingMore": "A carregar…",
  "events.loadMoreCta": "Carregar mais eventos",

  // Recap
  "recap.eyebrow": "Resumo do convívio",
  "recap.attendedCount_one": "{count} pessoa esteve presente",
  "recap.attendedCount_other": "{count} pessoas estiveram presentes",
  "recap.linkCopiedToast": "Link copiado!",
  "recap.photoAddedToast": "A tua foto foi adicionada ao resumo.",
  "recap.uploadErrorToast":
    "Não foi possível adicionar essa foto. Tenta novamente.",
  "recap.writeupEyebrow": "O resumo escrito",
  "recap.gatheringHeading": "O <em>convívio</em>",
  "recap.fromTheDayEyebrow": "Do dia",
  "recap.photoPlaceholder": "foto do convívio",
  "recap.photosByMembers": "Fotos de pessoas da comunidade",
  "recap.submitYoursCta": "Partilha a tua",
  "recap.whoWasThereEyebrow": "Quem esteve presente",
  "recap.attendedHeading_one": "{count} pessoa <em>esteve presente</em>",
  "recap.attendedHeading_other": "{count} pessoas <em>estiveram presentes</em>",
  "recap.moreAttended_one": "+ {count} pessoa esteve presente",
  "recap.moreAttended_other": "+ {count} pessoas estiveram presentes",
  "recap.eventDetailsLabel": "Detalhes do evento",
  "recap.dateLabel": "Data",
  "recap.venueLabel": "Local",
  "recap.attendedLabel": "Presenças",
  "recap.hostLabel": "Quem organiza",
  "recap.comingUpNextEyebrow": "A seguir",
  "recap.attendedThisGathering": "Estiveste neste convívio",
  "recap.yearInReviewCta": "Adicionar ao teu resumo do ano",
  "recap.soonBadge": "Brevemente",
  "recap.shareThisRecap": "Partilhar este resumo",
  "recap.copyLinkCta": "Copiar link",

  // Recap — photo upload modal
  "recap.upload.title": "Adicionar uma foto",
  "recap.upload.subtitle":
    "Partilha um momento do convívio. Escolhe uma foto e adiciona uma legenda.",
  "recap.upload.choosePhotoLabel": "Escolhe uma foto",
  "recap.upload.captionLabel": "Legenda",
  "recap.upload.captionPlaceholder": "Diz algo sobre este momento…",
  "recap.upload.photoPlaceholder": "a tua foto",
  "recap.upload.cancelCta": "Cancelar",
  "recap.upload.addPhotoCta": "Adicionar foto",
  "recap.upload.confirmTitle": "Adicionada ao <em>resumo</em>",
  // "Obrigado/a" genderiza quem fala — rephrasing neutro em vez disso.
  "recap.upload.confirmBody":
    "Agradecemos a partilha — a tua foto já está na galeria para todas as pessoas que estiveram presentes.",
  "recap.upload.doneCta": "Concluído",
  "recap.upload.defaultCaption": "Um momento do dia",

  // Photos (gathering photo album)
  "photos.chipAll": "Todas",
  "photos.backToRecap": "Voltar ao resumo",
  "photos.addCta": "Adicionar fotos",
  "photos.uploadingCta": "A enviar…",
  "photos.emptyLive": "Ainda não há fotos.",
  "photos.uploadError": "Não foi possível enviar essa foto. Tenta novamente.",
  "photos.albumLabel_one": "Álbum de fotos · {count} foto",
  "photos.albumLabel_other": "Álbum de fotos · {count} fotos",
  "photos.hostedBy": "Organizado por",
  "photos.photosByLabel": "Fotos de",
  "photos.plusAttendees_one": "+ {count} pessoa",
  "photos.plusAttendees_other": "+ {count} pessoas",
  "photos.photosLabel_one": "foto",
  "photos.photosLabel_other": "fotos",
  "photos.consentToPublish": "com consentimento para publicar",
  "photos.downloadAllCta": "Transferir tudo",
  "photos.slideshowCta": "Apresentação",
  "photos.policyTitle": "Como tratamos as <em>fotos dos convívios</em>",
  "photos.policyBody1":
    "Todas as fotos aqui foram tiradas por uma pessoa presente, com consentimento das pessoas fotografadas. <b>Os rostos são desfocados por predefinição</b>, a menos que a pessoa tenha optado por aparecer identificada. Isto não é uma cortesia de privacidade — é como garantimos que as pessoas voltam da próxima vez.",
  "photos.policyBody2":
    'Se te vires numa foto e quiseres que seja removida (ou desfocada), envia um email para <mailLink>photos@queerpulse.app</mailLink> — tratamos disso em 24 horas, sem perguntas. <em>Também podes desativar globalmente "aparecer em fotos de eventos"</em> nas <privLink>Definições de privacidade</privLink>.',
  "photos.photographersTitle": "Quem fotografou <em>este evento</em>",
  "photos.readRecapCta": "Ler o resumo",
  "photos.nextClinicCta": "Próxima clínica · {date}",
  "photos.flagCta": "Sinalizar uma foto",
  "photos.viewerAriaLabel": "Visualizador de fotos",
  "photos.pauseSlideshowAriaLabel": "Pausar apresentação",
  "photos.playSlideshowAriaLabel": "Reproduzir apresentação",
  "photos.closeAriaLabel": "Fechar",
  "photos.prevPhotoAriaLabel": "Foto anterior",
  "photos.nextPhotoAriaLabel": "Foto seguinte",

  // ── Create-gathering wizard + host guide ──────────────────────────────────
  // createGathering.data.ts — step pills
  "create.pill.type": "Tipo",
  "create.pill.datePlace": "Data e local",
  "create.pill.capacity": "Capacidade",
  "create.pill.pricing": "Preços",
  "create.pill.review": "Revisão",

  // createGathering.data.ts — sidebar tips (per step)
  "create.tip.type":
    "Escolhe o formato que te é mais natural. Os melhores convívios são os que quem organiza gosta mesmo de fazer acontecer.",
  "create.tip.datePlace":
    "O bairro aparece no anúncio. A morada completa só é partilhada com quem confirmou presença.",
  "create.tip.capacity":
    "Sê honesto/a sobre acessibilidade. As pessoas participantes planeiam-se com base nisso. Marca só o que consegues confirmar genuinamente.",
  "create.tip.pricing":
    "A QueerPulse não fica com nenhuma percentagem da receita dos bilhetes. Cada euro vai para ti. A escala progressiva é obrigatória — torna a comunidade mais acessível.",
  "create.tip.review":
    "Depois de publicares, ainda podes editar o anúncio. Não podes reduzir a capacidade abaixo do número de confirmações já existentes.",

  // createGathering.data.ts — gathering types
  "create.type.supperClub.name": "Jantar comunitário",
  "create.type.supperClub.sub": "Refeição partilhada, organizada",
  "create.type.workshopTalk.name": "Oficina / conversa",
  "create.type.workshopTalk.sub": "Ensina ou partilha algo",
  "create.type.screening.name": "Sessão de cinema",
  "create.type.screening.sub": "Cinema, música, performance",
  "create.type.studioVisit.name": "Visita ao atelier",
  "create.type.studioVisit.sub": "Abre o teu espaço",
  "create.type.walkOutdoor.name": "Caminhada ou ar livre",
  "create.type.walkOutdoor.sub": "Movimento, ar livre",
  "create.type.discussion.name": "Grupo de discussão",
  "create.type.discussion.sub": "Grupo de leitura, debate",
  "create.type.skillsExchange.name": "Troca de saberes",
  "create.type.skillsExchange.sub": "Aprendizagem mútua",
  "create.type.other.name": "Outro",
  "create.type.other.sub": "Outra coisa qualquer",

  // createGathering.data.ts — neighbourhoods not already in gatherings:hood.*
  "create.hood.intendente": "Intendente",
  "create.hood.santos": "Santos",
  "create.hood.online": "Online",
  "create.hood.otherInLisbon": "Outro local em Lisboa",

  // createGathering.data.ts — event languages
  "create.lang.bilingual": "PT / EN bilingue",
  "create.lang.ptOnly": "Só português",
  "create.lang.enOnly": "Só inglês",
  "create.lang.other": "Outro",

  // createGathering.data.ts — accessibility options
  "create.access.stepFree": "Acesso sem degraus em todo o espaço",
  "create.access.toilet": "Casa de banho acessível",
  "create.access.seating": "Lugares sentados disponíveis em todo o espaço",
  "create.access.lowSensory":
    "Opção de baixo estímulo sensorial / silêncio disponível",
  "create.access.dietary": "Restrições alimentares podem ser acomodadas",

  // createGathering.data.ts — publish confirmation checklist
  "create.confirm.codeOfCare":
    "Este convívio segue o Código de Cuidado da QueerPulse.",
  "create.confirm.slidingScale":
    "A escala progressiva (se houver bilhetes) é genuína — o nível gratuito será respeitado.",
  "create.confirm.accessibility":
    "As informações de acessibilidade que forneci são exatas, tanto quanto sei.",

  // CreateGatheringPage.tsx
  "create.eyebrow": "Publica o teu evento",
  "create.title": "Cria o teu <em>convívio.</em>",
  "create.lead":
    "Preenche os detalhes abaixo e o teu evento fica visível de imediato no quadro de convívios da QueerPulse.",
  "create.toast.publishError":
    "Não foi possível publicar o teu convívio — tenta novamente.",
  "create.toast.published": "O teu convívio está no ar",
  "create.success.title": "O teu convívio <em>está no ar.</em>",
  "create.success.body":
    "Já está visível no quadro de convívios da QueerPulse. As pessoas podem vê-lo e confirmar presença. Vais receber uma notificação por email a cada nova pessoa inscrita.",
  "create.success.accessLabel":
    "Acessibilidade mostrada às pessoas participantes",
  "create.success.viewCta": "Ver no quadro",
  "create.success.eventCta": "Ver a página do teu evento",
  "create.nav.cancel": "Cancelar",
  "create.nav.back": "Voltar",
  "create.nav.publishHint": "Confirma as três caixas acima para publicar",
  "create.nav.dateHint": "Escolhe uma data e hora no futuro para continuar",
  "create.nav.publish": "Publicar convívio",
  "create.nav.continue": "Continuar",
  "create.sidebar.tipLabel": "Dica para esta etapa",
  "create.sidebar.afterTitle": "O que acontece depois de publicares",
  "create.sidebar.afterBody":
    "O teu convívio aparece no quadro de imediato. As confirmações de presença chegam à tua caixa de entrada da QueerPulse. As moradas completas só são partilhadas com quem confirmou presença. Podes editar ou cancelar a qualquer momento até 48 horas antes.",

  // CreateGatheringSteps.tsx — step 1: type
  "create.step1.title": "Que tipo de <em>convívio?</em>",
  "create.step1.sub":
    "Escolhe o formato. Isto determina alguns dos campos seguintes.",
  "create.step1.titleLabel": "Título do evento",
  "create.step1.titlePlaceholder":
    "Um título claro e específico — nada de trocadilhos ou mistérios",
  "create.step1.descLabel": "Descrição breve",
  "create.step1.descPlaceholder":
    "O que é que as pessoas vão fazer? O que devem esperar? O que torna este convívio digno de participar?",

  // CreateGatheringSteps.tsx — step 2: date & place
  "create.step2.title": "Quando e <em>onde?</em>",
  "create.step2.sub":
    "A localização só é partilhada com quem confirmou presença — não aparece no anúncio público.",
  "create.step2.dateLabel": "Data",
  "create.step2.dateRequired":
    "Escolhe uma data e hora de início no futuro para as pessoas se poderem organizar.",
  "create.step2.timeLabel": "Hora",
  "create.step2.endTimeLabel": "Hora de fim (opcional)",
  "create.step2.hoodLabel": "Bairro",
  "create.step2.hoodPlaceholder": "Seleciona…",
  "create.step2.venueLabel": "Nome do espaço",
  "create.step2.venuePlaceholder":
    "ex.: Casa da Mariquinhas, O meu atelier, Jardim do Torel",
  "create.step2.addressLabel":
    "Morada completa (partilhada só com quem confirmou presença)",
  "create.step2.addressPlaceholder": "Morada",
  "create.step2.directionsLabel": "Como chegar (opcional)",
  "create.step2.directionsPlaceholder":
    "ex.: Toca a campainha da esquerda, 5 min a pé do metro do Intendente",

  // CreateGatheringSteps.tsx — step 3: capacity
  "create.step3.title": "Quem e <em>quantas pessoas?</em>",
  "create.step3.sub":
    "Define um limite realista. É mais fácil abrir mais vagas do que recusar pessoas à porta.",
  "create.step3.capLabel": "Capacidade",
  "create.step3.capPlaceholder": "Máximo de participantes",
  "create.step3.langLabel": "Idioma",
  "create.step3.accessLabel": "Acessibilidade — o que podes confirmar?",
  "create.step3.accessHint":
    "Marca só o que consegues confirmar genuinamente. As pessoas participantes vão contar com esta informação.",
  "create.step3.notesLabel": "Notas de acessibilidade (opcional)",
  "create.step3.notesPlaceholder":
    "Mais alguma coisa que as pessoas devam saber — degraus, estacionamento, nível de som…",

  // CreateGatheringSteps.tsx — step 4: pricing
  "create.step4.title": "Bilhetes e <em>preços.</em>",
  "create.step4.sub":
    "A QueerPulse não fica com nenhuma percentagem da receita dos bilhetes. Todo o dinheiro vai diretamente para ti. A escala progressiva é obrigatória em qualquer evento pago.",
  "create.step4.freeLabel": "Evento gratuito — sem necessidade de bilhetes",
  "create.step4.tiersHint":
    "Define três níveis. A escala progressiva não é opcional — se o evento for pago, os três níveis têm de estar disponíveis. As pessoas escolhem o seu nível de forma privada.",
  "create.step4.priceColHead": "Preço / pessoa",
  "create.step4.spotsColHead": "Vagas",
  "create.step4.tier.solidarity.name": "Gratuito / solidariedade",
  "create.step4.tier.solidarity.priceAria":
    "Preço do nível gratuito / solidariedade em euros",
  "create.step4.tier.solidarity.spotsAria":
    "Número de vagas do nível gratuito / solidariedade",
  "create.step4.spotsSuffix": "pess.",
  "create.step4.tier.solidarity.note":
    "Este nível é para pessoas que não podem pagar. Reserva pelo menos 2–3 vagas.",
  "create.step4.tier.standard.name": "Padrão",
  "create.step4.tier.standard.priceAria": "Preço padrão em euros",
  "create.step4.tier.standard.spotsAria": "Número de vagas do nível padrão",
  "create.step4.tier.supporter.name": "Apoiante",
  "create.step4.tier.supporter.priceAria": "Preço do nível apoiante em euros",
  "create.step4.tier.supporter.spotsAria": "Número de vagas do nível apoiante",
  "create.step4.tier.supporterHint":
    "A receita do nível apoiante subsidia o nível gratuito. Sugestão: padrão × 1,8.",
  "create.step4.includedLabel": "O que está incluído no bilhete?",
  "create.step4.includedPlaceholder":
    "ex.: Jantar e vinho partilhados, materiais incluídos, só o teu tempo",
  "create.step4.bringLabel": "Algo para trazer / preparar?",
  "create.step4.bringPlaceholder":
    "Opcional — ex.: Traz algo para partilhar, usa calçado confortável",

  // CreateGatheringSteps.tsx — step 5: review
  "create.step5.title": "Revê e <em>publica.</em>",
  "create.step5.sub":
    "Confirma os detalhes antes de o teu convívio ficar visível.",
  "create.step5.accessEmpty":
    "Ainda sem informação — adiciona o que consegues confirmar",
  "create.step5.dateTimeValue": "{date} às {time}",
  "create.step5.locationValue": "{venue}, {hood}",
  "create.step5.capacityValue": "{cap} pessoas · {lang}",
  "create.step5.row.type": "Tipo",
  "create.step5.row.title": "Título",
  "create.step5.row.dateTime": "Data e hora",
  "create.step5.row.location": "Localização",
  "create.step5.row.capacity": "Capacidade",
  "create.step5.row.pricing": "Preços",
  "create.step5.row.accessibility": "Acessibilidade",
  "create.step5.pricingFree": "Evento gratuito",
  "create.step5.pricingSliding": "Escala progressiva · Grátis / {std} / {sup}",
  "create.step5.confirmHeading": "Antes de publicares — confirma as três",
  "create.step5.confirmIntro":
    "Marca cada caixa para confirmar. O botão <strong>Publicar convívio</strong> fica desativado até as três estarem marcadas.",
  "create.step5.allSet": "Tudo pronto — já podes publicar.",
  "create.step5.progress_one":
    "<num>{checkedCount}</num> de 3 confirmadas — marca a última caixa para publicar.",
  "create.step5.progress_other":
    "<num>{checkedCount}</num> de 3 confirmadas — marca as <remaining>{count}</remaining> caixas restantes para publicar.",

  // hostPage.data.ts — hero type chips
  "host.hero.type.supperClub": "Jantar comunitário",
  "host.hero.type.studioVisit": "Visita ao atelier",
  "host.hero.type.skillsWorkshop": "Oficina de competências",
  "host.hero.type.filmScreening": "Sessão de cinema",
  "host.hero.type.morningWalk": "Caminhada matinal",
  "host.hero.type.bookClub": "Clube de leitura",
  "host.hero.type.openStudio": "Atelier aberto",

  // hostPage.data.ts — type cards (step 1)
  "host.typeCard.supperClub.title": "Jantar comunitário",
  "host.typeCard.supperClub.body":
    "Íntimo, feito em tua casa ou numa cozinha emprestada. 8–14 pessoas. O modelo que o Tomás usa — e funciona porque é pessoal.",
  "host.typeCard.studioVisit.title": "Visita ao atelier",
  "host.typeCard.studioVisit.body":
    "Abre o teu espaço de trabalho a quem realmente gostaria de o ver. Pouca logística, grande valor. Funciona particularmente bem para quem cria com as mãos.",
  "host.typeCard.skillsSession.title": "Sessão de partilha de saberes",
  "host.typeCard.skillsSession.body":
    "Ensina algo que sabes. Uma hora de conhecimento prático partilhado vale mais do que a maioria das oficinas pagas.",
  "host.typeCard.screeningTalk.title": "Sessão de cinema ou conversa",
  "host.typeCard.screeningTalk.body":
    "Um filme, um documentário, uma conversa com alguém interessante. Um projetor e uma sala de estar chegam.",

  // HostPage.tsx
  "host.hero.eyebrow": "Para pessoas da comunidade",
  "host.hero.title": "Organiza um convívio <em>para a tua comunidade.</em>",
  "host.hero.lead":
    "Não precisas de orçamento para um espaço, de uma comissão, nem de um plano. Precisas de uma data, de algumas cadeiras e de um motivo que valha a pena reunir pessoas. Este guia ajuda-te com o resto.",
  "host.outro.title": "Os melhores convívios são os <em>que acontecem.</em>",
  "host.outro.sub": "Começa pequeno, começa em breve. A comunidade está aqui.",
  "host.createGatheringCta": "Cria o teu convívio",

  // HostSteps.tsx — step 1
  "host.step1.title": "Decide que tipo de <em>convívio</em> queres",
  "host.step1.body":
    "O formato molda tudo o resto. Um jantar para oito pessoas é um projeto completamente diferente de uma oficina para trinta. Começa pelo que fazes bem e pelo que consegues gerir sem ajuda.",
  "host.step1.tip.head": "Começa mais pequeno do que imaginas",
  "host.step1.tip.body":
    "Qualquer pessoa com experiência a organizar convívios te dirá o mesmo: o teu primeiro evento deve ter metade do tamanho que imaginas. Seis pessoas já chega. Acerta o formato e depois cresce.",

  // HostSteps.tsx — step 2
  "host.step2.title": "Encontra o <em>espaço certo</em>",
  "host.step2.body":
    "A tua casa costuma ser a melhor opção para convívios pequenos — é gratuita, flexível e mostra que se trata de um evento da comunidade, não comercial. Para eventos maiores, a rede tem acesso a vários espaços parceiros pela cidade.",
  "host.step2.list.small":
    "<b>Até 12 pessoas:</b> casa ou atelier é ideal. Pergunta no quadro se precisas de uma cozinha ou de um projetor que não tens.",
  "host.step2.list.medium":
    "<b>12–30 pessoas:</b> espaços parceiros na Mouraria, Príncipe Real e Marvila. Publica no quadro a pedir sugestões.",
  "host.step2.list.large":
    "<b>Mais de 30:</b> fala primeiro connosco. Podemos ajudar-te a encontrar espaços e talvez coorganizar contigo.",
  "host.step2.tip.head": "Publica no quadro",
  "host.step2.tip.body":
    "Se procuras um espaço, publica um Pedido. Há sempre pessoas a oferecer os seus ateliers, cozinhas e terraços para eventos da comunidade.",

  // HostSteps.tsx — step 3
  "host.step3.title": "Convida pessoas <em>com intenção</em>",
  "host.step3.body":
    'Os convívios funcionam porque a sala é bem escolhida, não porque é grande. Pensa em quem convidas e porquê — não "a quem devo um convite" mas "quem ganharia algo por estar nesta sala junto".',
  "host.step3.list.clear":
    "Explica claramente o que é o evento, quanto tempo dura, e o que as pessoas devem trazer ou esperar.",
  "host.step3.list.location":
    "Partilha a localização só com quem confirmou presença — não no anúncio público.",
  "host.step3.list.cap":
    "Define um limite realista e respeita-o. Recusar pessoas está bem. Superlotar não está.",

  // HostSteps.tsx — step 4
  "host.step4.title": "No <em>dia</em>",
  "host.step4.body":
    "O mais importante não é a logística — é o ambiente quando as pessoas chegam. Os primeiros dez minutos determinam se a pessoa sente que pertence ali ou que entrou na sala errada.",
  "host.step4.list.greet":
    "Recebe as pessoas à porta. Apresenta-as umas às outras pelo nome e com um motivo.",
  "host.step4.list.activity":
    "Tem algo para as pessoas fazerem ou terem nas mãos nos primeiros cinco minutos.",
  "host.step4.list.dontManage":
    "Não tentes gerir demasiado a conversa. Abre a sala; não conduzas um painel.",
  "host.step4.tip.head": "Sobre segurança nos convívios",
  "host.step4.tip.body":
    "Se estás a organizar em tua casa, tens o direito de pedir a qualquer pessoa que saia, a qualquer momento, por qualquer motivo. Aplica-se o Código de Cuidado da QueerPulse.",

  // HostSteps.tsx — step 5
  "host.step5.title": "Depois de <em>terminar</em>",
  "host.step5.body1":
    "Escreve uma nota breve no anúncio do convívio — o que aconteceu, como correu. Isto ajuda quem não pôde ir e dá a futuras pessoas organizadoras uma ideia do que funciona.",
  "host.step5.body2":
    "Se queres torná-lo recorrente, publica-o no quadro de convívios da QueerPulse. Ajudamos-te a encontrar participantes e a construir o tipo de evento de confiança que se torna uma referência no calendário da comunidade.",
  "host.step5.cta": "Conta-nos como correu",

  // HostSidebar.tsx
  "host.sidebar.readyTitle": "Já podes publicar o teu convívio?",
  "host.sidebar.readyBody":
    "Assim que tiveres uma data, um formato e uma ideia de quem vais convidar, podes publicá-lo na página de convívios da QueerPulse.",
  "host.sidebar.spacesTitle": "Espaços parceiros",
  "host.sidebar.spacesBody":
    "Espaços que já receberam convívios da QueerPulse e estão disponíveis para receber mais.",
  "host.sidebar.capacity": "até {max}",

  // ── Host dashboard, manage, cohosts, QR, album ────────────────────────────
  // ── Day-of dashboard (GatheringDashboardPage / GatheringDashboardCards) ────
  "dashboard.backToManage": "Gerir convívio",
  "dashboard.inProgress": "A decorrer",
  "dashboard.checkedIn": "Já chegaram",
  "dashboard.expected": "Previsto",
  "dashboard.waitlist": "Lista de espera",
  "dashboard.dataRetentionNotice":
    "Os dados do convívio são eliminados 30 dias depois do evento",
  "dashboard.attendanceRecordsNotice":
    "Os registos de presença nunca são partilhados publicamente",
  "dashboard.checkedInToast": "{name} fez o check-in",

  // ── Dashboard: check-in column ─────────────────────────────────────────────
  "dashboard.checkin.heading": "Check-in",
  "dashboard.checkin.qrAreaLine1": "Área do leitor de QR",
  "dashboard.checkin.qrAreaLine2": "toca para abrir a câmara",
  "dashboard.checkin.scanCta": "Ler QR code de uma pessoa",
  "dashboard.checkin.orDivider": "ou procura pelo nome",
  "dashboard.checkin.searchPlaceholder":
    "Procurar na lista de pessoas convidadas…",
  "dashboard.checkin.matchCount_one": "{count} resultado",
  "dashboard.checkin.matchCount_other": "{count} resultados",
  "dashboard.checkin.noMatch": "Não consta da lista de pessoas convidadas",
  "dashboard.checkin.recentHeading": "Check-ins recentes",
  "dashboard.checkin.justNow": "Agora mesmo",

  // ── Dashboard: guest list card ─────────────────────────────────────────────
  "dashboard.guestList.heading": "Pessoas convidadas",
  "dashboard.guestList.filterAll_one": "Todas ({count})",
  "dashboard.guestList.filterAll_other": "Todas ({count})",
  "dashboard.guestList.filterCheckedIn_one": "Já chegaram ({count})",
  "dashboard.guestList.filterCheckedIn_other": "Já chegaram ({count})",
  "dashboard.guestList.filterPending_one": "Ainda não ({count})",
  "dashboard.guestList.filterPending_other": "Ainda não ({count})",
  "dashboard.guestList.searchPlaceholder": "Procurar pessoas convidadas…",
  "dashboard.guestList.emptyAllTitle":
    "Ainda não há ninguém na lista de pessoas convidadas",
  "dashboard.guestList.emptyAllDescription":
    "À medida que as pessoas reservam o lugar, vão aparecer aqui prontas para o check-in. Partilha o teu convívio para trazeres as primeiras pessoas convidadas.",
  "dashboard.guestList.emptyFilterTitle": "Sem pessoas convidadas nesta vista",
  "dashboard.guestList.emptyFilterDescription":
    "Ninguém corresponde ao filtro ou pesquisa atual. Tenta alargar para veres todas as pessoas esperadas.",
  "dashboard.guestList.clearFiltersCta": "Limpar filtros",
  "dashboard.guestList.checkInManuallyCta": "Fazer check-in manual",
  "dashboard.guestList.checkedInChip": "Check-in às {time}",
  "dashboard.guestList.expectedChip": "Por chegar",
  "dashboard.guestList.waitlistToggle_one":
    "{count} na lista de espera — promover",
  "dashboard.guestList.waitlistToggle_other":
    "{count} na lista de espera — promover",
  "dashboard.guestList.promoteCta": "Promover",
  "dashboard.guestList.promotedToast":
    "{name} entrou na lista de pessoas convidadas",
  "dashboard.waitlist.position": "#{position} na lista de espera",

  // ── Dashboard: stats column ─────────────────────────────────────────────────
  "dashboard.stats.arrivalRateHeading": "Taxa de chegada",
  "dashboard.stats.now": "Agora",
  "dashboard.stats.attendanceRateLabel": "Taxa de presença até agora",
  "dashboard.stats.peakArrivalLabel": "Pico de chegadas",
  "dashboard.stats.quickActionsHeading": "Ações rápidas",
  "dashboard.stats.messageAllCta": "Enviar mensagem a todas as pessoas",
  "dashboard.stats.messageSentToast_one":
    "Mensagem enviada a {count} pessoa convidada",
  "dashboard.stats.messageSentToast_other":
    "Mensagem enviada a {count} pessoas convidadas",
  "dashboard.stats.startingCta": 'Enviar "Estamos a começar"',
  "dashboard.stats.startingSentToast":
    "Estamos a começar — enviado a todas as pessoas convidadas",
  "dashboard.stats.wrappedTitle": "Convívio <em>terminado</em>",
  "dashboard.stats.wrappedText_one":
    "O check-in está fechado e foi enviado um acompanhamento a {count} pessoa convidada, com a retrospetiva e o link para as fotografias.",
  "dashboard.stats.wrappedText_other":
    "O check-in está fechado e foi enviado um acompanhamento a {count} pessoas convidadas, com a retrospetiva e o link para as fotografias.",
  "dashboard.stats.endOfEventLabel": "Fim do convívio",
  "dashboard.stats.endOfEventText":
    "Quando o convívio terminar, envia um acompanhamento e fecha a janela de check-in.",
  "dashboard.stats.wrappedCheckbox": "O convívio já terminou",
  "dashboard.stats.endEventCta": "Terminar convívio e enviar acompanhamento",
  "dashboard.stats.readyNote": "Já podes enviar o acompanhamento",
  "dashboard.stats.notReadyNote": "Marca o convívio como terminado para ativar",
  "dashboard.stats.followUpToast": "Acompanhamento enviado — check-in fechado",

  // ── Manage page header (ManageGatheringPage) ────────────────────────────────
  "manage.eyebrow": "A organizar",
  "manage.status.approvedDaysToGo_one":
    "Aprovação concluída · falta {count} dia",
  "manage.status.approvedDaysToGo_other":
    "Aprovação concluída · faltam {count} dias",
  "manage.actions.editDetails": "Editar detalhes",
  "manage.actions.messageAttendees": "Enviar mensagem às pessoas",
  "manage.actions.dayOfDashboard": "Painel do dia",
  "manage.cancelConfirm_one":
    "Cancelar {title}? {count} pessoa vai ser avisada.",
  "manage.cancelConfirm_other":
    "Cancelar {title}? {count} pessoas vão ser avisadas.",
  "manage.linkCopiedToast": "Link copiado!",

  // ── Manage: live-mode coming-soon (host tools not wired yet) ─────────────────
  "manageComingSoon.title": "As ferramentas de anfitrião <em>chegam em breve</em>",
  "manageComingSoon.description":
    "Gerir um encontro por aqui ainda não está disponível. Podes continuar a explorar e a confirmar presença no que está a acontecer — o painel de anfitrião chega em breve.",
  "manageComingSoon.browseCta": "Explorar encontros",
  "manageComingSoon.backHome": "Voltar ao início",

  // ── Manage: overview tab ─────────────────────────────────────────────────────
  "manage.overview.stat.going": "Vão",
  "manage.overview.stat.waitlist": "Lista de espera",
  "manage.overview.stat.spotsLeft": "Vagas livres",
  "manage.details.date": "Data",
  "manage.details.time": "Hora",
  "manage.details.venue": "Local",
  "manage.details.capacity": "Capacidade",
  "manage.overview.editCta": "Editar",
  "manage.overview.descriptionLabel": "Descrição",
  "manage.overview.descriptionNoun": "descrição",
  "manage.overview.lastEdited": "Última edição {time}",

  // ── Manage: attendees tab ────────────────────────────────────────────────────
  "manage.attendees.searchPlaceholder": "Procurar pessoas…",
  "manage.attendees.exportCta": "Exportar lista",
  "manage.attendees.exportedToast": "CSV exportado",
  "manage.attendees.inviteCta": "Convidar pessoas",
  "manage.attendees.spotsFilled": "{going} de {capacity} vagas preenchidas",
  "manage.attendees.goingHeading_one": "Vão ({count})",
  "manage.attendees.goingHeading_other": "Vão ({count})",
  "manage.attendees.waitlistHeading_one": "Lista de espera ({count})",
  "manage.attendees.waitlistHeading_other": "Lista de espera ({count})",
  "manage.attendees.moreAttendees_one": "+ mais {count} pessoa",
  "manage.attendees.moreAttendees_other": "+ mais {count} pessoas",
  "manage.attendees.removeAria":
    "Remover {name} da lista de pessoas convidadas",
  "manage.attendees.removeCta": "Remover",
  "manage.attendees.removedToast": "Já não está na lista de pessoas convidadas",
  "manage.attendees.promoteAria":
    "Passar {name} para a lista de pessoas convidadas",
  "manage.attendees.promoteCta": "Promover",
  "manage.attendees.promotedToast":
    "{name} entrou na lista de pessoas convidadas",

  // ── Manage: messages tab ─────────────────────────────────────────────────────
  "manage.messages.composerLabel_one":
    "Enviar mensagem a todas as pessoas ({count} vão)",
  "manage.messages.composerLabel_other":
    "Enviar mensagem a todas as pessoas ({count} vão)",
  "manage.writeUpdatePlaceholder":
    "Escreve uma novidade para as pessoas convidadas…",
  "manage.messages.sentHint_one": "Enviado a {count} pessoa confirmada.",
  "manage.messages.sentHint_other": "Enviado a {count} pessoas confirmadas.",
  "manage.messages.sendCta": "Enviar novidade",
  "manage.messages.previousHeading": "Mensagens anteriores",
  "manage.messages.emptyTitle": "Ainda não enviaste mensagens",
  "manage.messages.emptyDescription":
    "Quando enviares uma novidade, ela aparece aqui. Um olá rápido ou uma nota sobre o que esperar ajuda as pessoas convidadas a sentirem-se prontas.",
  "manage.messages.justNow": "agora mesmo",
  "manage.messages.openedOf": "{opened} / {total} abriram",
  "manage.messages.sentToast_one": "Novidade enviada a {count} pessoa",
  "manage.messages.sentToast_other": "Novidade enviada a {count} pessoas",

  // ── Manage: settings tab ─────────────────────────────────────────────────────
  "manage.settings.optionsHeading": "Opções do convívio",
  "manage.settings.allowWaitlist.title": "Permitir lista de espera",
  "manage.settings.allowWaitlist.desc":
    "As pessoas podem entrar numa lista de espera se o convívio estiver cheio",
  "manage.settings.showAttendeeCount.title":
    "Mostrar publicamente quantas pessoas vão",
  "manage.settings.showAttendeeCount.desc":
    "Quem visita vê quantas pessoas vão",
  "manage.settings.allowQuestions.title":
    "Permitir perguntas das pessoas participantes",
  "manage.settings.allowQuestions.desc":
    "As pessoas convidadas podem enviar-te perguntas antes do evento",
  "manage.settings.requireApproval.title": "Exigir aprovação das inscrições",
  "manage.settings.requireApproval.desc":
    "Aprovas manualmente cada inscrição antes de ser confirmada",
  "manage.settings.dangerZoneHeading": "Zona de risco",
  "manage.settings.cancelLabel": "Cancelar este convívio",
  "manage.settings.cancelText":
    "Todas as pessoas serão avisadas e as inscrições serão libertadas. Isto não pode ser desfeito. Será enviada automaticamente uma mensagem de cancelamento.",
  "manage.settings.cancelCta": "Cancelar convívio",

  // ── Manage: sidebar ───────────────────────────────────────────────────────────
  "manage.sidebar.coverPhotoLine1": "Foto de capa",
  "manage.sidebar.coverPhotoLine2": "do convívio",
  "manage.sidebar.copyCta": "Copiar",
  "manage.sidebar.viewListingCta": "Ver página pública",
  "manage.sidebar.supportText":
    "Precisas de ajuda com o teu convívio? <a>Envia uma mensagem à equipa da QueerPulse →</a>",

  // ── Manage: tab bar ────────────────────────────────────────────────────────────
  "manage.tabs.overview": "Visão geral",
  "manage.tabs.attendees": "Pessoas",
  "manage.tabs.messages": "Mensagens",
  "manage.tabs.settings": "Definições",

  // ── Manage: shared modal chrome ───────────────────────────────────────────────
  "manage.cancelCta": "Cancelar",
  "manage.closeAria": "Fechar",

  // ── Manage: edit-details modal ────────────────────────────────────────────────
  "manage.editModal.eyebrow": "Editar detalhes",
  "manage.editModal.title": "Atualiza o teu convívio",
  "manage.editModal.sub":
    "As alterações ficam logo visíveis na página pública. As pessoas são avisadas de mudanças de data ou local.",
  "manage.editModal.fieldTitle": "Título",
  "manage.editModal.fieldDateTime": "Data e hora",
  "manage.editModal.fieldLocation": "Local",
  "manage.editModal.fieldDescription": "Descrição",
  "manage.editModal.saveCta": "Guardar alterações",
  "manage.editModal.successTitle": "Detalhes <em>atualizados.</em>",
  "manage.editModal.successSub":
    "As tuas alterações a <b>{title}</b> já estão visíveis na página. Quem já confirmou presença vai ver a atualização da próxima vez que abrir o convívio.",
  "manage.editModal.successMeta_one":
    "Guardado agora mesmo · {count} pessoa avisada",
  "manage.editModal.successMeta_other":
    "Guardado agora mesmo · {count} pessoas avisadas",

  // ── Manage: message-attendees modal ───────────────────────────────────────────
  "manage.messageModal.eyebrow": "Enviar mensagem",
  "manage.messageModal.title": "Escreve às pessoas convidadas",
  "manage.messageModal.sub":
    "Chega a todas as pessoas que confirmaram presença neste convívio. Mantém a mensagem curta — uma nota sobre o local, uma mudança de horário, ou apenas um olá caloroso.",
  "manage.messageModal.subjectLabel": "Assunto",
  "manage.messageModal.subjectPlaceholder":
    "por ex., uma pequena mudança na hora de início",
  "manage.messageModal.bodyLabel": "Mensagem",
  "manage.messageModal.sendCta_one": "Enviar a {count} pessoa",
  "manage.messageModal.sendCta_other": "Enviar a {count} pessoas",
  "manage.messageModal.successTitle": "Mensagem <em>enviada.</em>",
  "manage.messageModal.successSub_one":
    '"{subject}" chegou a <b>{count} pessoa confirmada</b>. Vão recebê-la por email e nas notificações da QueerPulse.',
  "manage.messageModal.successSub_other":
    '"{subject}" chegou a <b>{count} pessoas confirmadas</b>. Vão recebê-la por email e nas notificações da QueerPulse.',
  "manage.messageModal.successMeta_one": "Enviado agora mesmo · {count} pessoa",
  "manage.messageModal.successMeta_other":
    "Enviado agora mesmo · {count} pessoas",

  // ── Manage: invite-members modal ──────────────────────────────────────────────
  "manage.invite.eyebrow": "Convidar pessoas",
  "manage.invite.title": "Traz as <em>pessoas certas</em>",
  "manage.invite.sub":
    "Escolhe as pessoas que gostavas de ter neste convívio. Vão receber um convite caloroso que podem aceitar ou não — sem pressão.",
  "manage.invite.searchLabel": "Procurar pessoas para convidar",
  "manage.invite.noneSelected": "Ainda não escolheste ninguém",
  "manage.invite.selectedCount_one": "Selecionaste <b>{count}</b>",
  "manage.invite.selectedCount_other": "Selecionaste <b>{count}</b>",
  "manage.invite.capWarning": " · esse é o máximo ({max})",
  "manage.invite.sendDefaultCta": "Enviar convites",
  "manage.invite.sendCta_one": "Convidar {count} pessoa",
  "manage.invite.sendCta_other": "Convidar {count} pessoas",
  "manage.invite.sentToast_one": "Convite enviado a {count} pessoa",
  "manage.invite.sentToast_other": "Convite enviado a {count} pessoas",
  "manage.invite.successTitle": "Convites <em>a caminho.</em>",
  "manage.invite.successSub_one":
    "<b>{count} pessoa</b> acabou de receber um convite para este convívio, por email e nas notificações da QueerPulse. Vais vê-la aparecer assim que confirmar presença.",
  "manage.invite.successSub_other":
    "<b>{count} pessoas</b> acabaram de receber um convite para este convívio, por email e nas notificações da QueerPulse. Vais vê-las aparecer à medida que confirmam presença.",
  "manage.invite.successMeta_one": "Enviado agora mesmo · {count} convite",
  "manage.invite.successMeta_other": "Enviado agora mesmo · {count} convites",

  // ── Manage: inline-edit modal ──────────────────────────────────────────────────
  "manage.inlineEdit.eyebrow": "Editar",
  "manage.inlineEdit.title": "Editar {label}",
  "manage.inlineEdit.saveCta": "Guardar",

  // ── Cohosts (CohostManager / AddCohostModal / MemberPicker) ─────────────────────
  "cohost.panelTitle": "Pessoas coanfitriãs",
  "cohost.addCta": "Adicionar pessoa coanfitriã",
  "cohost.panelDesc":
    "Uma pessoa coanfitriã pode editar este convívio, enviar mensagens às pessoas convidadas e gerir as inscrições. Continuas como a pessoa anfitriã principal — cancelar o convívio e o fundo da pessoa anfitriã ficam contigo.",
  "cohost.emptyState":
    "Ainda não tens nenhuma pessoa coanfitriã. Adicionar uma significa teres companhia para a noite.",
  "cohost.addedToast": "{name} é agora pessoa coanfitriã",
  "cohost.removedToast": "{name} deixou de ser pessoa coanfitriã",
  "cohost.confirmPrompt": "Remover?",
  "cohost.confirmYes": "Sim, remover",
  "cohost.confirmKeep": "Manter",
  "cohost.removeCta": "Remover",
  "cohost.removeAria": "Remover {name} como pessoa coanfitriã",
  "cohost.closeAria": "Fechar",
  "cohost.addModal.eyebrow": "Adicionar pessoa coanfitriã",
  "cohost.addModal.title": "Reparte a <em>carga</em>",
  "cohost.addModal.sub":
    "Uma pessoa coanfitriã pode editar a página, enviar mensagens às pessoas convidadas e gerir as inscrições contigo. Escolhe alguém em quem confies — vai receber um pedido para aceitar.",
  "cohost.addModal.searchLabel":
    "Procurar pessoas para adicionar como coanfitriã",
  "cohost.picker.searchLabelDefault": "Procurar pessoas",
  "cohost.picker.placeholder": "Procurar por nome ou função…",
  "cohost.picker.noResults": 'Nenhuma pessoa corresponde a "{query}".',

  // ── QR check-in scanner (QrScanModal) ──────────────────────────────────────────
  "qr.eyebrow": "Check-in",
  "qr.title": "Ler QR code de uma pessoa",
  "qr.readingHint": "A ler o código QR…",
  "qr.pointHint": "Aponta a câmara ao código QR de uma pessoa",
  "qr.scanningCta": "A ler…",
  "qr.allCheckedInCta": "Toda a gente já fez check-in",
  "qr.simulateCta": "Simular leitura",
  "qr.demoNote": "Modo de demonstração — não é usada nenhuma câmara real.",
  "qr.closeAria": "Fechar",
  "qr.success.ariaLabel": "Check-in feito",
  "qr.success.title": "Check-in <em>feito.</em>",
  "qr.success.scannedMeta": "{pronouns} · QR lido",
  "qr.success.scanNextCta": "Ler seguinte",
  "qr.success.doneCta": "Concluído",

  // ── Photo album download (DownloadAlbumModal) ──────────────────────────────────
  "album.loading.title": "A preparar o álbum…",
  "album.loading.sub_one":
    "A compactar {count} fotografia e a aplicar desfoque com base no consentimento.",
  "album.loading.sub_other":
    "A compactar {count} fotografias e a aplicar desfoque com base no consentimento.",
  "album.success.title": "Álbum <em>pronto.</em>",
  "album.success.sub_one":
    "Compactámos <b>{count} fotografia</b> no ficheiro <b>album.zip</b> e a transferência já começou. Os rostos ficam desfocados a não ser que a pessoa tenha optado por aparecer com o nome — isso está incluído na exportação.",
  "album.success.sub_other":
    "Compactámos <b>{count} fotografias</b> no ficheiro <b>album.zip</b> e a transferência já começou. Os rostos ficam desfocados a não ser que a pessoa tenha optado por aparecer com o nome — isso está incluído na exportação.",
  "album.success.meta_one": "album.zip · {count} fotografia",
  "album.success.meta_other": "album.zip · {count} fotografias",
  "album.success.doneCta": "Concluído",

  // ── Checkout — payment, summary, hold ─────────────────────────────────────
  // Progress
  "checkout.progress.ariaLabel": "Progresso da reserva",
  "checkout.progress.review": "Revisão",
  "checkout.progress.payment": "Pagamento",
  "checkout.progress.confirm": "Confirmação",

  // Summary (sidebar + price summary + mobile bar)
  "checkout.summary.tier.solidarity": "Solidariedade",
  "checkout.summary.tier.standard": "Padrão",
  "checkout.summary.tier.supporter": "Apoiante",
  "checkout.summary.lineItem_one": "{count} × {tier} lugar",
  "checkout.summary.lineItem_other": "{count} × {tier} lugares",
  "checkout.summary.memberDiscount": "Desconto de comunidade",
  "checkout.summary.percentOff": "{percent} de desconto",
  "checkout.summary.promoLabel": "Promoção · {code}",
  "checkout.summary.total": "Total",
  "checkout.summary.feesNote":
    "Inclui todas as taxas. Processado com segurança pela Stripe.",
  "checkout.summary.priceNote":
    "Inclui todas as taxas. Sem sobretaxa de reserva. Pagamento seguro via Stripe.",
  "checkout.summary.paidLabel": "Pago · {amount}",
  "checkout.summary.editOrderCta": "Editar reserva",
  "checkout.summary.hostingLine": "<name>{hostName}</name> está a receber",
  "checkout.summary.guestsConfirmed_one": "{count} pessoa confirmada até agora",
  "checkout.summary.guestsConfirmed_other":
    "{count} pessoas confirmadas até agora",
  "checkout.summary.safetyNote":
    "Só por convite · todas as pessoas são verificadas antes de poderem reservar.",
  "checkout.summary.visibilityPrivateToast":
    "Vais participar em privado — não apareces na lista de pessoas confirmadas.",
  "checkout.summary.visibilityPublicToast":
    "Vais aparecer na lista de pessoas confirmadas.",

  // Mobile bar
  "checkout.mobileBar.continueCta": "Continuar →",
  "checkout.mobileBar.payCta": "Pagar {amount} →",

  // Payment step + tabs + express/alt-pay copy
  "checkout.payment.title": "Detalhes do <em>pagamento</em>",
  "checkout.payment.lede":
    "Encriptado e processado pela Stripe. A QueerPulse nunca vê nem guarda o número do teu cartão.",
  "checkout.payment.methodTabsAriaLabel": "Método de pagamento",
  "checkout.payment.tabCardTitle": "Cartão",
  "checkout.payment.tabCardSub": "Visa, Mastercard, Amex",
  "checkout.payment.tabMbwayTitle": "MB WAY",
  "checkout.payment.tabMbwaySub": "Aprova na tua app",
  "checkout.payment.tabMultibancoTitle": "Multibanco",
  "checkout.payment.tabMultibancoSub": "Referência / Multibanco",
  "checkout.payment.payCtaCard": "Pagar {amount} →",
  "checkout.payment.payCtaMbway": "Enviar pedido de {amount} →",
  "checkout.payment.payCtaMultibanco": "Confirmar reserva · {amount} →",
  "checkout.payment.processingLabel": "A processar…",
  "checkout.payment.trustLock": "Encriptação de 256 bits",
  "checkout.payment.viaStripe": "via <strong>Stripe</strong>",
  "checkout.payment.termsNotice":
    "Ao pagar, aceitas os nossos <terms>termos de serviço</terms> e a <privacy>política de privacidade</privacy>. Podes cancelar com reembolso total até 48h antes.",
  "checkout.payment.demoHint":
    "Demo: usa o cartão <strong>4000 0000 0000 0002</strong> para ver um pagamento recusado.",
  "checkout.payment.backToReviewCta": "← Voltar à revisão",
  "checkout.payment.mbwayPhoneLabel": "Número de telemóvel MB WAY",
  "checkout.payment.mbwayError": "Introduz o teu número MB WAY de 9 dígitos.",
  "checkout.payment.mbwayNote":
    "Toca em pagar e enviamos um pedido para a tua app MB WAY. Tens 4 minutos para aprovar — o teu lugar fica reservado até lá.",
  "checkout.payment.multibancoEntityLabel": "Entidade",
  "checkout.payment.multibancoReferenceLabel": "Referência",
  "checkout.payment.multibancoAmountLabel": "Montante",
  "checkout.payment.multibancoHint":
    "Paga esta referência em qualquer Multibanco ou homebanking no prazo de <strong>3 dias</strong>. Reservamos o teu lugar e enviamos o bilhete por email assim que for confirmado.",
  "checkout.payment.confirmedToast": "Pagamento confirmado — até {date}!",

  // Card
  "checkout.card.savedHeading": "Cartão guardado",
  "checkout.card.savedExpiry": "Expira em {expiry}",
  "checkout.card.removeSavedCta": "Remover",
  "checkout.card.orNewCard": "ou usa um cartão novo",
  "checkout.card.numberLabel": "Número do cartão",
  "checkout.card.numberPlaceholder": "1234 5678 9012 3456",
  "checkout.card.numberError":
    "Introduz um número de cartão válido com 16 dígitos.",
  "checkout.card.expiryLabel": "Validade",
  "checkout.card.expiryPlaceholder": "MM / AA",
  "checkout.card.expiryError": "Verifica a data de validade.",
  "checkout.card.cvcLabel": "CVC",
  "checkout.card.cvcError": "3 ou 4 dígitos.",
  "checkout.card.nameLabel": "Nome no cartão",
  "checkout.card.namePlaceholder": "Nome completo",
  "checkout.card.nameError": "Introduz o nome que consta no cartão.",
  "checkout.card.saveCardLabel":
    "Guardar este cartão com segurança para a próxima vez",
  "checkout.card.removedToast": "Cartão guardado removido.",

  // Billing
  "checkout.billing.heading": "Faturação",
  "checkout.billing.countryLabel": "País",
  "checkout.billing.postalLabel": "Código postal",
  "checkout.billing.postalError": "Introduz o teu código postal.",
  "checkout.billing.vatCheckbox":
    "Preciso de uma <strong>fatura com IVA</strong> para uma empresa",
  "checkout.billing.companyLabel": "Nome da empresa",
  "checkout.billing.companyPlaceholder": "Empresa, Lda.",
  "checkout.billing.vatNumberLabel": "Número de contribuinte / NIF",
  "checkout.billing.vatNumberPlaceholder": "PT123456789",
  "checkout.billing.country.pt": "Portugal",
  "checkout.billing.country.es": "Espanha",
  "checkout.billing.country.fr": "França",
  "checkout.billing.country.de": "Alemanha",
  "checkout.billing.country.it": "Itália",
  "checkout.billing.country.nl": "Países Baixos",
  "checkout.billing.country.ie": "Irlanda",
  "checkout.billing.country.gb": "Reino Unido",
  "checkout.billing.country.us": "Estados Unidos",
  "checkout.billing.country.other": "Outro país",

  // Express checkout
  "checkout.express.heading": "Pagamento expresso",
  "checkout.express.orPayByCard": "ou paga com cartão",
  "checkout.express.confirmingToast": "A confirmar com {label}…",

  // Promo code
  "checkout.promo.invalidError": "Esse código não é válido ou expirou.",
  "checkout.promo.appliedLabel": "Código <code>{code}</code> aplicado",
  "checkout.promo.removeCta": "Remover",
  "checkout.promo.inputPlaceholder": "Introduz o código",
  "checkout.promo.inputAriaLabel": "Código promocional",
  "checkout.promo.applyCta": "Aplicar",
  "checkout.promo.appliedToast":
    "Código aplicado — mais {percent} de desconto.",

  // Offline banner
  "checkout.offline.backOnlineToast": "De volta à ligação — está tudo pronto.",
  "checkout.offline.bannerText":
    "Estás offline — o teu progresso está guardado. Vamos voltar a ligar automaticamente.",

  // Seat hold
  "checkout.hold.expiredText":
    "A tua reserva do lugar expirou — <retry>reserva outra vez</retry>",
  "checkout.hold.activeText": "Lugar reservado para ti · <time>{clock}</time>",
  "checkout.hold.spotsLeft_one": "Só resta <strong>{count}</strong> lugar",
  "checkout.hold.spotsLeft_other": "Só restam <strong>{count}</strong> lugares",

  // Validation / payment-form toasts
  "checkout.validation.cocRequired":
    "Aceita o Código de Cuidado para continuar.",
  "checkout.validation.declinedError":
    "O teu cartão foi recusado. Não saiu dinheiro da tua conta. Experimenta outro cartão ou uma opção expresso acima.",
  "checkout.validation.paymentDeclinedToast":
    "Pagamento recusado — tenta novamente.",
  "checkout.validation.fieldsError":
    "Verifica os campos destacados e tenta novamente.",
  "checkout.validation.guestEmailRequired":
    "Adiciona um email para podermos enviar o teu bilhete.",

  // ── Checkout — review, confirmation, table, code of care ──────────────────
  // ReviewStep
  "checkout.review.title": "Reserva o teu <em>lugar</em>",
  "checkout.review.lede":
    "Escolhe o que funciona para o teu orçamento — todos os lugares à mesa têm as mesmas boas-vindas.",
  "checkout.review.hostedBy_one":
    "Quem recebe: {host} · {count} lugar no total",
  "checkout.review.hostedBy_other":
    "Quem recebe: {host} · {count} lugares no total",
  "checkout.review.promoLabel": "Código promocional",
  "checkout.review.promoOptional": "opcional",
  "checkout.review.policySummary": "Política de cancelamento e reembolso",
  "checkout.review.policyBody":
    "Reembolso total se cancelares até <strong>48 horas</strong> antes do convívio. Dentro das 48 horas podemos transferir o teu lugar para um jantar futuro, já que os ingredientes já foram comprados. A vida acontece — se surgir algo urgente, <strong>basta enviares uma mensagem à pessoa anfitriã</strong> e resolvemos tudo.",
  "checkout.review.continueCta": "Continuar para o pagamento",

  // TierSelect
  "checkout.tiers.sectionTitle": "Escolhe o teu bilhete",
  "checkout.tiers.fieldsetAria": "Tipo de bilhete",
  "checkout.tiers.solidarity.name": "Solidariedade",
  "checkout.tiers.solidarity.desc":
    "Se o dinheiro está apertado agora. Sem perguntas, sem provas — o mesmo lugar, as mesmas boas-vindas.",
  "checkout.tiers.standard.name": "Padrão",
  "checkout.tiers.standard.desc":
    "Cobre a tua refeição, os ingredientes e o tempo da pessoa anfitriã.",
  "checkout.tiers.standard.tag": "A escolha mais comum",
  "checkout.tiers.supporter.name": "Apoiante",
  "checkout.tiers.supporter.desc":
    "Paga adiante — cobres discretamente um lugar solidário para outra pessoa.",

  // SeatQuantity
  "checkout.seats.sectionTitle": "Quantos lugares?",
  "checkout.seats.label": "Lugares",
  "checkout.seats.sub_one":
    "Vais trazer alguém? Adiciona os dados dessa pessoa abaixo.",
  "checkout.seats.sub_other":
    "Vais adicionar o nome e as necessidades alimentares de cada pessoa convidada abaixo.",
  "checkout.seats.stepperAria": "Número de lugares",
  "checkout.seats.removeAria": "Remover um lugar",
  "checkout.seats.addAria": "Adicionar um lugar",
  "checkout.seats.waitlistPrompt":
    "Queres mais de {maxSeats} lugares, ou uma data futura?",
  "checkout.seats.joinWaitlistCta": "Entra na lista de espera",
  "checkout.seats.waitlistHeading": "Entra na lista de espera",
  "checkout.seats.waitlistBody":
    "Enviamos um email assim que abrir um lugar aqui — ou quando {host} marcar o próximo jantar. Sem pagamento agora.",
  "checkout.seats.emailLabel": "Email",
  "checkout.seats.emailPlaceholder": "you@example.com",
  "checkout.seats.partySizeLabel": "Tamanho do grupo",
  "checkout.seats.partySizeOption_one": "{count} lugar",
  "checkout.seats.partySizeOption_other": "{count} lugares",
  "checkout.seats.waitlistSubmitCta": "Adicionar-me à lista",
  "checkout.seats.waitlistSuccessToast":
    "Estás na lista de espera — enviamos um email assim que abrir um lugar.",

  // TableSeat / MeetTheTable / AttendeeCard
  "checkout.table.title": "Conhece a mesa",
  "checkout.table.atTableCount_one": "{count} pessoa à mesa",
  "checkout.table.atTableCount_other": "{count} pessoas à mesa",
  "checkout.table.youCount_one": "tu",
  "checkout.table.youCount_other": "tu +{extra}",
  "checkout.table.openCount_one": "{count} lugar livre",
  "checkout.table.openCount_other": "{count} lugares livres",
  "checkout.table.visibilityGroupAria": "A tua visibilidade",
  "checkout.table.onListLabel": "Na lista",
  "checkout.table.attendPrivatelyLabel": "Participar em privado",
  "checkout.table.chooseSeatAria": "Escolhe este lugar",
  "checkout.table.aboutSeatAria": "Sobre {name}",
  "checkout.table.yourSeatAria": "O teu lugar",
  "checkout.table.sitHereLabel": "Senta-te aqui",
  "checkout.table.guestNumberFallback": "Pessoa convidada {number}",
  "checkout.table.youLabel": "Tu",
  "checkout.table.emptySeatLabel": "Vazio",
  "checkout.table.youPrivateLabel": "Tu (em privado)",
  "checkout.table.privateLabel": "Em privado",
  "checkout.table.giftLabel": "Oferta",
  "checkout.table.legendBetween":
    "Estás sentade entre {left} e {right} — toca noutro lugar vazio para mudar.",
  "checkout.table.legendDefault":
    "Toca num lugar vazio para escolher o teu lugar.",

  // GuestDetails
  "checkout.guest.sectionTitle": "Quem se junta a ti",
  "checkout.guest.guestNumberLabel": "Pessoa convidada {number}",
  "checkout.guest.giftToggleLabel": "Oferecer este lugar",
  "checkout.guest.emailLabel": "O email desta pessoa",
  "checkout.guest.emailPlaceholder": "they@example.com",
  "checkout.guest.noteLabel": "Uma nota",
  "checkout.guest.optionalTag": "opcional",
  "checkout.guest.notePlaceholder": "Vemo-nos no sábado!",
  "checkout.guest.giftNote":
    "Enviamos um bilhete resgatável por email — a pessoa adiciona o próprio nome e as necessidades alimentares.",
  "checkout.guest.nameLabel": "Nome",
  "checkout.guest.namePlaceholder": "O nome desta pessoa",
  "checkout.guest.pronounsLabel": "Pronomes",
  "checkout.guest.pronounsPlaceholder": "Seleciona…",
  "checkout.guest.dietaryLabel": "Necessidades alimentares",
  "checkout.guest.dietaryPlaceholder": "ex.: vegan, sem marisco",

  // AttendeeDetails
  "checkout.attendee.sectionTitle": "Os teus dados",
  "checkout.attendee.emailLabel": "Email para o teu bilhete e recibo",
  "checkout.attendee.emailPlaceholder": "you@example.com",
  "checkout.attendee.emailError":
    "Indica um email válido para enviarmos o teu bilhete.",
  "checkout.attendee.dietaryLabel":
    "Necessidades alimentares ou alergias <opt>— é uma refeição partilhada</opt>",
  "checkout.attendee.dietaryPlaceholder":
    "ex.: dieta vegetariana, sem frutos secos, doença celíaca…",
  "checkout.attendee.accessLabel": "Necessidades de acessibilidade",
  "checkout.attendee.optionalTag": "opcional",
  "checkout.attendee.accessPlaceholder":
    "Tudo o que a pessoa anfitriã deva saber para tornar o espaço acessível para ti (escadas, espaço tranquilo, etc.)",

  // WhoAmI
  "checkout.whoami.guestTitle": "A finalizar como <strong>convidade</strong>",
  "checkout.whoami.memberTitle": "Sessão iniciada como <strong>{name}</strong>",
  // "Members" → neutral rephrasing ("quem é da comunidade"), nunca *Membros*.
  "checkout.whoami.memberDiscountNote":
    "Quem é da comunidade tem {rate}% de desconto — entra para o aproveitares",
  "checkout.whoami.memberEmailLine": "{email} · Pessoa da comunidade",
  "checkout.whoami.signBackInCta": "Entra novamente",
  "checkout.whoami.asNameCta": "como {name}",
  "checkout.whoami.notYouCta": "Não és tu?",
  "checkout.whoami.checkoutAsGuestCta": "Finalizar como convidade",

  // HostCard
  "checkout.host.verifiedBadge": "Perfil verificado",
  "checkout.host.statsLineBeforeStar_one":
    "A receber desde {year} · {count} jantar · {rating}",
  "checkout.host.statsLineBeforeStar_other":
    "A receber desde {year} · {count} jantares · {rating}",
  "checkout.host.statsLineAfterStar": "de {guestCount} pessoas",
  "checkout.host.askQuestionCta": "Fazer uma pergunta",
  "checkout.host.messageLabel":
    "Envia uma mensagem a {host} antes de reservares",
  "checkout.host.messagePlaceholder":
    "ex.: O espaço tem acesso sem degraus? Posso ir sem companhia?",
  "checkout.host.sendCta": "Enviar mensagem",
  "checkout.host.messageSentToast":
    "Mensagem enviada a {host} — vais receber uma resposta por email.",

  // FirstTimerCard
  "checkout.firstTimer.dismissAria": "Fechar",
  "checkout.firstTimer.badge": "Primeiro jantar?",
  "checkout.firstTimer.heading": "Como vai ser a noite",
  "checkout.firstTimer.seeLess": "Ver menos",
  "checkout.firstTimer.seeMore": "Ver mais",
  "checkout.firstTimer.step1.title": "Chegas",
  "checkout.firstTimer.step1.body":
    "Portas às {time}. Vem como és — sem código de vestuário, sem pressão para conversa de circunstância.",
  "checkout.firstTimer.step2.title": "Partilhamos uma refeição",
  "checkout.firstTimer.step2.body":
    "Um jantar caseiro à volta de uma só mesa, oito pessoas, três horas sem pressa.",
  "checkout.firstTimer.step3.title": "Sais de barriga cheia",
  "checkout.firstTimer.step3.body":
    "De comida boa e, normalmente, com alguns contactos novos no telemóvel. Sai quando quiseres.",

  // CodeOfCare
  "checkout.coc.agreementLabel":
    "Li o <strong>Código de Cuidado</strong> e venho pronte para cuidar das pessoas nesta mesa.",
  "checkout.coc.whatsThat": "O que é isso?",
  "checkout.coc.hide": "Esconder",
  "checkout.coc.item1":
    "Consentimento primeiro — pede autorização antes de tirar fotos, e aceita um não com elegância.",
  "checkout.coc.item2": "O que se partilha à mesa fica à mesa.",
  "checkout.coc.item3": "Respeita sempre os nomes e os pronomes.",
  "checkout.coc.item4":
    "Se algo não parecer bem, avisa a pessoa anfitriã — estamos aqui para ti.",

  // ConfirmationStep
  "checkout.confirm.refCopiedToast": "Referência da reserva copiada.",
  "checkout.confirm.copyRefAria": "Copiar referência da reserva",
  "checkout.confirm.title": "Estás <em>confirmade.</em>",
  "checkout.confirm.subtitle_one":
    "A confirmação e o teu bilhete estão a caminho de {email}. Vemo-nos no dia {date}.",
  "checkout.confirm.subtitle_other":
    "A confirmação e os teus {count} bilhetes estão a caminho de {email}. Vemo-nos no dia {date}.",
  "checkout.confirm.inboxFallback": "a tua caixa de entrada",
  "checkout.confirm.bookingRefLabel": "Referência da reserva",
  "checkout.confirm.dateLabel": "Data",
  "checkout.confirm.locationLabel": "Localização",
  "checkout.confirm.locationValue":
    "{neighbourhood} — morada exata partilhada no dia",
  "checkout.confirm.hostGuestsLabel": "Quem recebe · Pessoas",
  "checkout.confirm.seatsCount_one": "{count} lugar",
  "checkout.confirm.seatsCount_other": "{count} lugares",
  "checkout.confirm.hostNotesHeading": "A pessoa anfitriã tem as tuas notas",
  "checkout.confirm.dietaryLabel": "Dieta:",
  "checkout.confirm.accessLabel": "Acesso:",

  // ConfirmationNext
  "checkout.confirm.mapSectionTitle": "Mais ou menos onde",
  "checkout.confirm.mapAriaLabel": "Localização aproximada em {place}",
  "checkout.confirm.mapNote": "O local exato é revelado na manhã do jantar",
  "checkout.confirm.mapLabel": "{neighbourhood} · 5 min de {landmark}",
  "checkout.confirm.addressCardTitle": "Como vais receber a morada",
  "checkout.confirm.addressCardBody":
    "Mantemos os lugares privados por segurança. A porta exata, o código do intercomunicador e as indicações chegam à tua caixa de entrada às <strong>{time} do dia {date}</strong>.",
  "checkout.confirm.bringCardTitle": "O que trazer",
  "checkout.confirm.bringCardBody":
    "Só tu. Se quiseres, uma garrafa para partilhar é sempre bem-vinda — a pessoa anfitriã trata do resto.",
  "checkout.confirm.remindSectionTitle": "Lembra-me",
  "checkout.confirm.reminderGroupAria": "Preferências de lembrete",
  "checkout.confirm.reminderEmail": "Email",
  "checkout.confirm.reminderSms": "SMS",
  "checkout.confirm.reminderNone": "Sem lembretes",
  "checkout.confirm.calendarSectionTitle": "Adicionar ao teu calendário",
  "checkout.confirm.googleCalendarCta": "Google Calendar",
  "checkout.confirm.appleIcsCta": "Apple / .ics",
  "checkout.confirm.addToWalletCta": "Adicionar à Wallet",
  "checkout.confirm.icsDescription":
    "Convívio QueerPulse. Recebido por {host}. Ref. {ref}",
  "checkout.confirm.calendarDownloadedToast":
    "Ficheiro de calendário descarregado.",
  "checkout.confirm.walletAddedToast": "Bilhete adicionado à tua wallet.",
  "checkout.confirm.viewGatheringCta": "Ver detalhes do convívio",
  "checkout.confirm.tellFriendCta": "Conta a uma pessoa amiga",
  "checkout.confirm.shareLinkToast": "Link copiado — partilha-o com alguém.",
  "checkout.confirm.transferSeatCta": "Transferir o meu lugar",
  "checkout.confirm.transferSentToast":
    "Link de transferência enviado para o teu email.",
  "checkout.confirm.addGuestCta": "Adicionar uma pessoa convidada",
  "checkout.confirm.addGuestSentToast":
    "Link para adicionar uma pessoa convidada enviado para o teu email.",

  // Timeline (Pattern B — buildTimeline)
  "checkout.timeline.sectionTitle": "O que acontece a seguir",
  "checkout.timeline.now": "Agora mesmo",
  "checkout.timeline.ticket.title": "Bilhete na tua caixa de entrada",
  "checkout.timeline.ticket.body":
    "A tua confirmação e o bilhete QR já estão a caminho.",
  "checkout.timeline.address.title": "A morada é revelada",
  "checkout.timeline.address.body":
    "A porta exata, o código do intercomunicador e as indicações para {neighbourhood} chegam na manhã desse dia.",
  "checkout.timeline.arrive.title": "Chegas e comemos",
  "checkout.timeline.arrive.body":
    "Vem como és. {host} trata do resto — três horas sem pressa, juntos.",

  // ── Events Hub (EventsHubPage + hub/*) ────────────────────────────────────
  "hub.tabs.highlights": "Destaques",
  "hub.tabs.browse": "Explorar",
  "hub.tabs.calendar": "Calendário",
  "hub.hero.eyebrow": "O que há",
  "hub.hero.title": "Encontra a tua gente esta semana",
  "hub.hero.subtitle":
    "Cada convívio, evento e motivo para saíres de casa — tudo num só lugar.",
  "hub.hero.tagline.0": "A tua gente já está aqui.",
  "hub.hero.tagline.1": "Há sempre alguém novo para conhecer.",
  "hub.hero.tagline.2": "Vem como és.",
  "hub.hero.tagline.3": "Salas pequenas, grandes boas-vindas.",
  "hub.hero.seeAll": "Vê tudo",
  "hub.hero.rsvp": "Dá uma vista de olhos",
  "hub.bucket.tonight": "Hoje à noite",
  "hub.bucket.weekend": "Este fim de semana",
  "hub.bucket.week": "Esta semana",
  "hub.bucket.later": "Em breve",
  "hub.highlights.heading": "Vale a pena aparecer",
  "hub.browse.heading": "Tudo o que há",
  "hub.browse.loadMore": "Mostrar mais",
  "hub.browse.empty": "Nada com esse filtro — experimenta outro.",
  "hub.calendar.heading": "O mês de relance",
  "hub.host.title": "Estás a <em>organizar</em> algo?",
  "hub.host.body":
    "Um jantar, uma leitura, um protesto, uma festa — seja o que for que organizes, ajudamos a que te encontrem.",
  "hub.host.cta": "Organiza um encontro",
  "hub.ways.heading": "Formas de te juntares",
  "hub.empty.title": "Ainda nada no calendário.",
  "hub.empty.body": "Aparecem coisas novas por aqui a toda a hora — podias organizar a primeira.",
  "hub.card.cta": "Vê",
  "hub.loading": "A ver o que há…",
};
