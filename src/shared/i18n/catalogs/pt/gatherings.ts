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
    "Jantares partilhados, convívios, visitas a ateliês, sessões de cinema e trocas de saberes: convívios reais por toda a Lisboa, organizados por pessoas da comunidade para a comunidade. É aqui que a plataforma deixa de ser um ecrã.",

  "landing.ways.title": "Descobre por onde <em>entrar.</em>",
  "landing.ways.lead":
    "Se é a tua primeira vez ou se já vais no décimo jantar que organizas, começa por aqui.",
  "landing.ways.browse.title": "Vê o que há",
  "landing.ways.browse.body":
    "Jantares partilhados, convívios, visitas a ateliês, sessões de cinema e trocas de saberes: filtra por bairro, tipo e data.",
  "landing.ways.browse.cta": "Ver todos os eventos",
  "landing.ways.calendar.title": "A vista de calendário",
  "landing.ways.calendar.body":
    "O mês inteiro num relance, com as tuas inscrições e os convívios perto de ti em destaque.",
  "landing.ways.calendar.cta": "Abrir o calendário",
  "landing.ways.host.title": "Organiza o teu",
  "landing.ways.host.body":
    "Um guia passo a passo para organizares um jantar, uma oficina ou uma sessão de cinema, com espaços parceiros e apoio da comunidade.",
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
    "Cada convívio começou com uma pessoa que decidiu organizar. A plataforma trata do resto: bilhetes, escala móvel e um lugar no quadro.",
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

  // ── In-event RSVP control (GatheringRsvpControl) ──────────────────────────
  // RSVP é uma ação dentro do detalhe do encontro: a ação principal, o estado
  // confirmado "vais estar lá" / lista de espera, e o cancelamento.
  "rsvpControl.waitlistCta": "Entrar na lista de espera",
  "rsvpControl.pendingCta": "Um momento…",
  "rsvpControl.goingTitle": "Vais <em>estar lá</em>",
  "rsvpControl.waitlistTitle": "Estás na <em>lista de espera</em>",
  "rsvpControl.goingCount_one": "{count} pessoa confirmada até agora",
  "rsvpControl.goingCount_other": "{count} pessoas confirmadas até agora",
  "rsvpControl.waitlistPosition": "És o número {position} na fila",
  "rsvpControl.waitlistNote": "Avisamos-te assim que abrir uma vaga.",
  "rsvpControl.cancelCta": "Cancelar presença",
  "rsvpControl.goingToast": "Vais estar lá",
  "rsvpControl.waitlistToast": "Estás na lista de espera",
  "rsvpControl.cancelledToast": "Presença cancelada",

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
  "common.backToGatherings": "Convívios",
  "common.hostedBy": "Organização de",
  "common.connectCta": "Ligar",

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
    "Este é um evento privado da QueerPulse. Todas as pessoas aqui foram convidadas porque alguém lhes deu um voto de confiança ou porque já são da comunidade. O Código de Cuidado aplica-se. Traz calor humano, está presente e não fotografes ninguém sem pedir.",
  "event.guidelines.body2":
    "A escala progressiva não é uma sugestão. Se conseguires pagar o escalão mais alto, paga-o. Isso subsidia diretamente o bilhete de outra pessoa.",
  "event.hero.viewProfileCta": "Ver perfil",
  "event.save.cta": "Guardar evento",
  "event.save.saved": "Guardado",
  "event.save.savedToast": "Evento guardado nos teus encontros.",
  "event.save.removedToast": "Evento removido dos guardados.",
  "event.save.saveAriaLabel": "Guardar {title}",
  "event.save.unsaveAriaLabel": "Remover {title} dos guardados",
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
    "Entra na lista de espera. Avisamos-te por email se surgir uma vaga.",
  "event.rsvp.headSub": "Paga o que puderes. Todos os escalões incluem tudo.",
  "event.rsvp.spotsRemaining_one": "<strong>Resta {count} vaga</strong>",
  "event.rsvp.spotsRemaining_other": "<strong>Restam {count} vagas</strong>",
  "event.rsvp.filledOfCapacity": "{filled} de {capacity} preenchidos",
  "event.rsvp.namePlaceholder": "O teu nome *",
  "event.rsvp.emailPlaceholder": "O teu email *",
  "event.rsvp.dietaryPlaceholder": "Restrições alimentares (opcional)",
  "event.rsvp.requiredHintFull":
    "Nome e email são obrigatórios. É para lá que enviamos a atualização da lista de espera.",
  "event.rsvp.requiredHint":
    "Nome e email são obrigatórios. É para lá que enviamos a tua confirmação.",
  "event.rsvp.joinWaitlistCta": "Entrar na lista de espera",
  "event.rsvp.reserveCta": "Reservar o meu lugar",
  "event.rsvp.disabledHint":
    "Indica o teu nome e um email válido para continuar",
  "event.rsvp.noteFull":
    "Enviamos-te um email assim que surgir uma vaga. Sair da lista de espera é só um clique.",
  "event.rsvp.confirmationEmailNote": "O teu lugar está guardado. Encontra-lo nos teus convívios.",
  "event.rsvp.cancelPolicy": "Podes cancelar até 48 horas antes do evento.",
  "event.rsvp.waitlistTitle": "Estás na <em>lista de espera.</em>",
  "event.rsvp.errorToast": "Não foi possível concluir. Tenta daqui a pouco.",
  "event.rsvp.waitlistBody":
    "Este convívio está esgotado, mas <strong>enviamos um email para {email}</strong> assim que surgir uma vaga, normalmente um ou dois dias depois de alguém cancelar.",
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

  // GoingAttendeesPreview (MSG-12)
  "gathering.attendeesPreview.heading": "Quem vai",
  "gathering.attendeesPreview.moreLabel": "+{count} mais",

  // JoinVouchCallout
  "vouchCallout.title": "Chegaste agora? <em>Pede um voto de confiança.</em>",
  "vouchCallout.body":
    "Os convívios da QueerPulse são só para pessoas da comunidade. Para entrares, alguém da rede dá-te um voto de confiança, ou pedes um convite e alguém trata do resto. Isto mantém todas as salas seguras.",
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
  "rsvp.live.goingWith_one": "Vais, juntamente com <strong>mais {count} pessoa</strong>.",
  "rsvp.live.goingWith_other": "Vais, juntamente com <strong>mais {count} pessoas</strong>.",
  "rsvp.live.waitlistNote_one": "Há mais {count} pessoa na lista de espera.",
  "rsvp.live.waitlistNote_other": "Há mais {count} pessoas na lista de espera.",
  "rsvp.host.roleLabel": "Organização do clube de leitura",
  "rsvp.calendar.label": "Adicionar ao calendário",
  "rsvp.calendar.googleCta": "Google Calendar",
  "rsvp.calendar.appleCta": "Apple / .ics",
  "rsvp.calendar.downloadedToast": "Ficheiro de calendário descarregado.",
  "rsvp.viewDetailsCta": "Ver detalhes do convívio",
  "rsvp.inviteCta": "Conta a alguém: copiar link de convite",
  "rsvp.inviteCopiedToast":
    "Link de convite copiado. Partilha-o com alguém que devia vir.",
  "rsvp.inviteCopyFailedToast":
    "Não conseguimos aceder à área de transferência. Copia o link a partir da barra de endereço.",
  "rsvp.coc.title": "O que <em>esperar</em>",
  "rsvp.coc.affirming.strong": "Este é um espaço de afirmação.",
  "rsvp.coc.affirming.rest":
    "Traz-te por inteiro, incluindo as partes que normalmente deixas à porta. Identidade queer, vivência trans, neurodivergência, deficiência: és bem-vinde como és.",
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
  "rsvp.footer.cancelErrorToast":
    "Não conseguimos cancelar agora. Tenta daqui a pouco.",
  "rsvp.footer.privacyCta": "Política de privacidade",

  // CoHostInvitePage
  "cohostInvite.back": "Notificações",
  // Opções de convite para coanfitrião. Os ids são validados no backend
  // (`cohost-invite-options.ts`); o texto é do frontend e vive aqui.
  "cohostInvite.role.greeter.label": "Acolhimento",
  "cohostInvite.role.greeter.description":
    "Receber as pessoas à porta e ajudar quem chega sozinho a encontrar o seu lugar.",
  "cohostInvite.role.room_lead.label": "Responsável de sala",
  "cohostInvite.role.room_lead.description":
    "Ficar atento ao espaço: montagem, fluxo e arrumação no fim.",
  "cohostInvite.role.comoderator.label": "Comoderação",
  "cohostInvite.role.comoderator.description":
    "Segurar os limites do espaço com quem organiza e intervir se algo precisar de ser tratado.",
  "cohostInvite.role.page_editor.label": "Edição da página",
  "cohostInvite.role.page_editor.description":
    "Manter a página do convívio certa: detalhes, fotos e as respostas que as pessoas procuram.",
  "cohostInvite.commitment.light.label": "Só no próprio dia",
  "cohostInvite.commitment.light.description":
    "Uma ajuda no dia, sem nada a fazer antes.",
  "cohostInvite.commitment.half_event.label": "Metade do convívio",
  "cohostInvite.commitment.half_event.description":
    "Presente durante boa parte, com o resto assegurado por outra pessoa.",
  "cohostInvite.commitment.full_event.label": "O convívio inteiro",
  "cohostInvite.commitment.full_event.description":
    "Da montagem à arrumação.",
  "cohostInvite.commitment.ongoing.label": "Contínuo",
  "cohostInvite.commitment.ongoing.description":
    "Este e os seguintes, como coanfitrião regular.",
  "cohostInvite.notFoundTitle": "Este convite já não está aqui",
  "cohostInvite.notFoundDescription":
    "Pode ter sido retirado, ou o convívio a que pertencia deixou de existir. Não foi nada que tenhas feito.",
  "cohostInvite.alreadyRespondedTitle": "Já respondeste a este convite",
  "cohostInvite.alreadyAcceptedDescription":
    "Estás a coanfitriar com {host}. As ferramentas de anfitrião estão abertas para ti.",
  "cohostInvite.alreadyDeclinedDescription":
    "Recusaste este. {host} pode sempre convidar-te para o próximo.",
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
  "cohostInvite.snoozedToast": "Adiado. Lembramos-te amanhã",
  "cohostInvite.declineCta": "Recusar com delicadeza",
  "cohostInvite.acceptCta": "Sim, co-organizar com {host}",
  "cohostInvite.acceptedToast":
    "Estás a co-organizar com {host}. Ferramentas de organização desbloqueadas",
  "cohostInvite.declinedToast":
    "Recusa enviada a {host}. Ela vai encontrar outra ajuda.",
  "cohostInvite.actionMeta":
    "Qualquer uma das opções envia uma mensagem direta a {host}. Ela vê a tua decisão mas não recebe notificação push. <b>Isto é para ser tranquilo</b>.",
  "cohostInvite.openMessagesCta": "Abrir mensagens",

  // GatheringCancelledPage
  "cancelled.back": "Voltar ao calendário",
  "cancelled.stampTitle": "Este evento foi cancelado.",
  "cancelled.stampBody":
    "Estavas na lista. Aqui está tudo o que acontece a seguir.",
  // Apenas em modo real: sem "cancelado há N horas" nem motivo inventados,
  // o backend não regista um motivo de cancelamento, por isso fica genérico.
  "cancelled.stampBodyLive":
    "Aqui estão os detalhes, e onde encontrar o que se segue.",
  "cancelled.explainerTitle": "Porque foi cancelado",
  "cancelled.hostSentLabel": "organização · enviou o cancelamento",
  "cancelled.sendWellWishesCta": "Enviar votos de melhoras",
  "cancelled.infoTitle": "O que acontece <em>contigo</em>",
  "cancelled.refundTitle":
    "O teu bilhete de {price} é reembolsado, automaticamente",
  "cancelled.headcountTitle": "Foste removide da contagem",
  "cancelled.headcountBody":
    "O estúdio sabia exatamente quem vinha. Não há mais nada a fazer.",
  "cancelled.rescheduleTitle": "A visita de {date} está aberta a confirmações",
  "cancelled.rescheduleBody":
    "Podes garantir já o dia {date}. Normalmente {host} abre isto mais tarde, mas adiantámos por causa disto. <a>Salta para lá ↓</a>",
  "cancelled.concernTitle": "Algo não parece bem?",
  "cancelled.concernBody":
    "Se tens preocupações sobre o cancelamento ou queres assinalar um padrão, fala com a equipa",
  "cancelled.noteEyebrow": "Uma nota breve · de {host}",
  "cancelled.noteSentVia":
    "enviada {time} através das ferramentas de organização",
  "cancelled.altHeading": "Próxima visita, ou outra coisa este fim de semana",
  "cancelled.altRsvpsOpen": "Confirmações abertas",
  "cancelled.calendarCta": "Calendário",
  "cancelled.rsvpCta": "Confirmar para {date}",

  // ── Calendar, events board, recap, photo album ────────────────────────────
  // Calendar
  "calendar.eyebrow": "Calendário da Comunidade",
  "calendar.heroTitle": "Tudo o que está a acontecer <em>num só lugar.</em>",
  "calendar.heroSub":
    "Todos os convívios QueerPulse e eventos organizados pela comunidade em Lisboa (jantares, workshops, círculos de apoio, sessões de cinema e muito mais) num calendário partilhado.",
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
    "Cada evento aqui é organizado pela QueerPulse ou por pessoas da comunidade. Explora a temporada e encontra a tua gente.",
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
    "Não há eventos marcados neste momento. Novos convívios e eventos parceiros aparecem aqui com frequência. Volta a verificar em breve.",
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
  "recap.moreFromHostEyebrow": "Mais de {name}",
  "recap.moreFromHostCta": "Ver convívio",
  "recap.seriesNextUpEyebrow": "Este convívio repete-se",
  "recap.seriesNextUpCta": "Ver a próxima data",
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
    "Agradecemos a partilha. A tua foto já está na galeria para todas as pessoas que estiveram presentes.",
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
    "Todas as fotos aqui foram tiradas por uma pessoa presente, com consentimento das pessoas fotografadas. <b>Os rostos são desfocados por predefinição</b>, a menos que a pessoa tenha optado por aparecer identificada. Isto não é uma cortesia de privacidade. É como garantimos que as pessoas voltam da próxima vez.",
  "photos.policyBody2":
    'Se te vires numa foto e quiseres que seja removida (ou desfocada), envia um email para <mailLink>hello@queerpulse.com</mailLink>. Tratamos disso em 24 horas, sem perguntas. <em>Também podes desativar globalmente "aparecer em fotos de eventos"</em> nas <privLink>Definições de privacidade</privLink>.',
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
  "create.pill.repeats": "Repetições",
  "create.pill.capacity": "Capacidade",
  "create.pill.pricing": "Preços",
  "create.pill.review": "Revisão",

  // createGathering.data.ts — sidebar tips (per step)
  "create.tip.type":
    "Escolhe o formato que te é mais natural. Os melhores convívios são os que quem organiza gosta mesmo de fazer acontecer.",
  "create.tip.datePlace":
    "O bairro aparece no anúncio. A morada completa só é partilhada com quem confirmou presença.",
  "create.tip.repeats":
    "Um convívio semanal ou mensal fixo cria uma verdadeira comunidade fiel. Cada data continua a ser o seu próprio convívio: quem participa confirma presença, e podes editar ou cancelar uma data sem mexer nas restantes.",
  "create.tip.capacity":
    "Sê honesto/a sobre acessibilidade. As pessoas participantes planeiam-se com base nisso. Marca só o que consegues confirmar genuinamente.",
  "create.tip.pricing":
    "A QueerPulse não fica com nenhuma percentagem da receita dos bilhetes. Cada euro vai para ti. A escala progressiva é obrigatória: torna a comunidade mais acessível.",
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
    "A escala progressiva (se houver bilhetes) é genuína. O nível gratuito será respeitado.",
  "create.confirm.accessibility":
    "As informações de acessibilidade que forneci são exatas, tanto quanto sei.",

  // CreateGatheringPage.tsx
  "create.eyebrow": "Publica o teu evento",
  "create.title": "Cria o teu <em>convívio.</em>",
  "create.lead":
    "Preenche os detalhes abaixo e o teu evento fica visível de imediato no quadro de convívios da QueerPulse.",
  "create.toast.publishError":
    "Não foi possível publicar o teu convívio. Tenta novamente.",
  "create.toast.published": "O teu convívio está no ar",
  "create.success.title": "O teu convívio <em>está no ar.</em>",
  "create.success.body":
    "Já está visível no quadro de convívios da QueerPulse. As pessoas podem vê-lo e confirmar presença. Cada nova pessoa inscrita aparece na lista de convidados do teu convívio.",
  "create.success.accessLabel":
    "Acessibilidade mostrada às pessoas participantes",
  "create.success.viewCta": "Ver no quadro",
  "create.success.eventCta": "Ver a página do teu evento",
  "create.nav.cancel": "Cancelar",
  "create.nav.back": "Voltar",
  "create.nav.publishHint": "Confirma as três caixas acima para publicar",
  "create.nav.dateHint": "Escolhe uma data e hora no futuro para continuar",
  "create.nav.repeatsHint":
    "Indica um número de datas válido, ou uma data de fim depois do início do teu convívio, para continuar",
  "create.nav.detailsHint":
    "Escolhe um formato e dá um nome ao teu convívio para continuar",
  "create.nav.leaveConfirm":
    "Tens um convívio por publicar aqui. Queres sair sem o guardar?",
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
  "create.step1.typeRequired": "Escolhe um formato para começar.",
  "create.step1.titleLabel": "Título do evento",
  "create.step1.titlePlaceholder":
    "Um título claro e específico que diz exatamente o que é",
  "create.step1.titleRequired":
    "Dá um nome ao teu convívio para as pessoas saberem ao que vêm.",
  "create.step1.descLabel": "Descrição breve",
  "create.step1.descPlaceholder":
    "O que é que as pessoas vão fazer? O que devem esperar? O que torna este convívio digno de participar?",

  // CreateGatheringSteps.tsx — step 2: date & place
  "create.step2.title": "Quando e <em>onde?</em>",
  "create.step2.sub":
    "A localização só é partilhada com quem confirmou presença e fica fora do anúncio público.",
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

  // RepeatsStep.tsx — step 2b: repetições (MSG-10)
  "create.step2b.title": "Isto <em>repete-se?</em>",
  "create.step2b.sub":
    "Um convívio fixo, semanal ou mensal, em vez de um evento único. Cada data é publicada como o seu próprio convívio, com confirmação de presença e edição independentes.",
  "create.step2b.toggle": "Este convívio repete-se",
  "create.step2b.cadenceLabel": "Com que frequência",
  "create.step2b.endTypeLabel": "Termina",
  "create.step2b.endType.count": "Depois de um número de datas",
  "create.step2b.endType.date": "Numa data",
  "create.step2b.endCountLabel": "Número de datas",
  "create.step2b.endCountHint": "Entre 2 e {max} datas.",
  "create.step2b.endUntilLabel": "Última data possível",
  "create.step2b.invalidHint":
    "Escolhe um número de datas ou uma data de fim depois do início do teu convívio.",
  "create.repeats.cadence.weekly": "Semanal",
  "create.repeats.cadence.biweekly": "A cada 2 semanas",
  "create.repeats.cadence.monthly": "Mensal",

  // CreateGatheringSteps.tsx — step 3: capacity
  "create.step3.title": "Quem e <em>quantas pessoas?</em>",
  "create.step3.sub":
    "Define um limite realista. É mais fácil abrir mais vagas do que recusar pessoas à porta.",
  "create.step3.capLabel": "Capacidade",
  "create.step3.capPlaceholder": "Máximo de participantes",
  "create.step3.langLabel": "Idioma",
  "create.step3.accessLabel": "Acessibilidade: o que podes confirmar?",
  "create.step3.accessHint":
    "Marca só o que consegues confirmar genuinamente. As pessoas participantes vão contar com esta informação.",
  "create.step3.notesLabel": "Notas de acessibilidade (opcional)",
  "create.step3.notesPlaceholder":
    "Mais alguma coisa que as pessoas devam saber: degraus, estacionamento, nível de som…",
  "create.step3.communityLabel": "Publicar numa comunidade (opcional)",
  "create.step3.communityNone": "Nenhuma (encontro público)",

  // AudienceScopeField.tsx — partilhado pelo assistente de criação (passo 3)
  // e pelo modal de edição do convívio.
  "audienceScope.label": "Quem pode ver este convívio?",
  "audienceScope.hint":
    "Escolhe até onde isto chega. Podes mudar a qualquer momento.",
  "audienceScope.members.label": "Público",
  "audienceScope.members.helper":
    "Qualquer pessoa na QueerPulse pode encontrar isto e confirmar presença.",
  "audienceScope.extendedNetwork.label": "Ligações das tuas ligações",
  "audienceScope.extendedNetwork.helper":
    "Pessoas que as tuas ligações conhecem podem encontrar isto: apenas amigos de amigos.",
  "audienceScope.network.label": "Só a rede",
  "audienceScope.network.helper": "Só pessoas com quem já tens uma ligação.",
  "audienceScope.community.label": "Membros da comunidade",
  "audienceScope.community.helper":
    "Só membros da comunidade onde estás a publicar.",
  "audienceScope.inviteOnly.label": "Só por convite",
  "audienceScope.inviteOnly.helper": "Só as pessoas que convidares.",

  // CreateGatheringSteps.tsx — step 4: pricing
  "create.step4.title": "Bilhetes e <em>preços.</em>",
  "create.step4.sub":
    "A QueerPulse não fica com nenhuma percentagem da receita dos bilhetes. Todo o dinheiro vai diretamente para ti. A escala progressiva é obrigatória em qualquer evento pago.",
  "create.step4.freeLabel": "Evento gratuito, sem necessidade de bilhetes",
  "create.step4.tiersHint":
    "Define três níveis. A escala progressiva não é opcional. Se o evento for pago, os três níveis têm de estar disponíveis. As pessoas escolhem o seu nível de forma privada.",
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
    "Opcional, ex.: Traz algo para partilhar, usa calçado confortável",

  // CreateGatheringSteps.tsx — step 5: review
  "create.step5.title": "Revê e <em>publica.</em>",
  "create.step5.sub":
    "Confirma os detalhes antes de o teu convívio ficar visível.",
  "create.step5.accessEmpty":
    "Ainda sem informação. Adiciona o que consegues confirmar",
  "create.step5.dateTimeValue": "{date} às {time}",
  "create.step5.locationValue": "{venue}, {hood}",
  "create.step5.capacityValue": "{cap} pessoas · {lang}",
  "create.step5.row.type": "Tipo",
  "create.step5.row.title": "Título",
  "create.step5.row.dateTime": "Data e hora",
  "create.step5.row.location": "Localização",
  "create.step5.row.capacity": "Capacidade",
  "create.step5.row.audience": "Quem pode ver",
  "create.step5.row.pricing": "Preços",
  "create.step5.row.accessibility": "Acessibilidade",
  "create.step5.row.repeats": "Repetições",
  "create.step5.repeatsOff": "Não, só desta vez",
  "create.step5.repeatsUntilCount": "{occurrences} datas",
  "create.step5.repeatsUntilDate": "até {date}",
  "create.step5.pricingFree": "Evento gratuito",
  "create.step5.pricingSliding": "Escala progressiva · Grátis / {std} / {sup}",
  "create.step5.confirmHeading": "Antes de publicares: confirma as três",
  "create.step5.confirmIntro":
    "Marca cada caixa para confirmar. O botão <strong>Publicar convívio</strong> fica desativado até as três estarem marcadas.",
  "create.step5.allSet": "Tudo pronto. Já podes publicar.",
  "create.step5.progress_one":
    "<num>{checkedCount}</num> de 3 confirmadas. Marca a última caixa para publicar.",
  "create.step5.progress_other":
    "<num>{checkedCount}</num> de 3 confirmadas. Marca as <remaining>{count}</remaining> caixas restantes para publicar.",

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
    "Íntimo, feito em tua casa ou numa cozinha emprestada. 8–14 pessoas. O modelo que o Tomás usa, e funciona porque é pessoal.",
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
    "A tua casa costuma ser a melhor opção para convívios pequenos. É gratuita, flexível e mostra que se trata de um evento da comunidade, em vez de um evento comercial. Para eventos maiores, a rede tem acesso a vários espaços parceiros pela cidade.",
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
    'Os convívios funcionam porque a sala é bem escolhida, seja qual for o seu tamanho. Pensa em quem convidas e porquê: foca-te em "quem ganharia algo por estar nesta sala junto" mais do que em "a quem devo um convite".',
  "host.step3.list.clear":
    "Explica claramente o que é o evento, quanto tempo dura, e o que as pessoas devem trazer ou esperar.",
  "host.step3.list.location":
    "Partilha a localização só com quem confirmou presença, mantendo-a fora do anúncio público.",
  "host.step3.list.cap":
    "Define um limite realista e respeita-o. Recusar pessoas está bem. Superlotar não está.",

  // HostSteps.tsx — step 4
  "host.step4.title": "No <em>dia</em>",
  "host.step4.body":
    "O que mais importa é o ambiente quando as pessoas chegam, mais do que a logística. Os primeiros dez minutos determinam se a pessoa sente que pertence ali ou que entrou na sala errada.",
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
    "Escreve uma nota breve no anúncio do convívio: o que aconteceu, como correu. Isto ajuda quem não pôde ir e dá a futuras pessoas organizadoras uma ideia do que funciona.",
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
    "{count} na lista de espera. Promover",
  "dashboard.guestList.waitlistToggle_other":
    "{count} na lista de espera. Promover",
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
    "Estamos a começar. Enviado a todas as pessoas convidadas",
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
  "dashboard.stats.followUpToast": "Acompanhamento enviado. Check-in fechado",

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
    "Gerir um encontro por aqui ainda não está disponível. Podes continuar a explorar e a confirmar presença no que está a acontecer. O painel de anfitrião chega em breve.",
  "manageComingSoon.browseCta": "Explorar encontros",
  "manageComingSoon.backHome": "Voltar ao início",

  // ── Páginas protótipo: coming-soon em modo live (só demo, sem encontro real) ──
  "prototypeComingSoon.browseCta": "Explorar encontros",
  "prototypeComingSoon.backHome": "Voltar ao início",
  "eventComingSoon.title": "Este encontro <em>chega em breve</em>",
  "eventComingSoon.description":
    "Isto é uma pré-visualização de como fica um encontro. Ainda não é um evento real, por isso não há aqui presença para confirmar. Explora o que está mesmo a acontecer e reserva o teu lugar por lá.",
  "rsvpComingSoon.title": "As confirmações de presença <em>chegam em breve</em>",
  "rsvpComingSoon.description":
    "Esta página de confirmação faz parte do protótipo e ainda não está ligada a uma presença real. Explora o que se passa e reserva um lugar a sério. A tua confirmação aparece aqui assim que a organização estiver disponível.",
  "cohostInviteComingSoon.title": "Coanfitriões <em>chegam em breve</em>",
  "cohostInviteComingSoon.description":
    "Convidar e aceitar um coanfitrião ainda não está disponível. Entretanto, explora o que está a acontecer. As ferramentas de coanfitrião chegam com o painel de anfitrião em breve.",
  "recapComingSoon.title": "Os resumos <em>chegam em breve</em>",
  "recapComingSoon.description":
    "Partilhar fotos e notas de um encontro ainda não está disponível, por isso nada do que adicionares aqui seria guardado. Explora o que se passa. Os resumos chegam com as ferramentas de anfitrião em breve.",

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
  "manage.attendees.loadMoreCta": "Carregar mais",
  "manage.attendees.loadingMore": "A carregar…",
  "manage.attendees.removeAria":
    "Remover {name} da lista de pessoas convidadas",
  "manage.attendees.removeCta": "Remover",
  "manage.attendees.removedToast": "Já não está na lista de pessoas convidadas",
  "manage.attendees.promoteAria":
    "Passar {name} para a lista de pessoas convidadas",
  "manage.attendees.promoteCta": "Promover",
  "manage.attendees.promotedToast":
    "{name} entrou na lista de pessoas convidadas",
  "manage.attendees.actionErrorToast":
    "Isso não foi possível. Tenta outra vez.",

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
  "manage.messages.liveUnavailableTitle": "Mensagens para participantes a caminho",
  "manage.messages.liveUnavailableBody":
    "Enviar novidades a toda a gente que vai ainda não está disponível. Entretanto, partilha as novidades na página do encontro ou fala com quem já tens ligação.",

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
    "Precisas de ajuda com o teu convívio? <a>Envia uma mensagem à equipa da QueerPulse</a>",

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

  // ── Manage: pedido de âmbito this-vs-future para séries (MSG-10) ───────────
  "manage.seriesScope.eyebrow": "Convívio recorrente",
  "manage.seriesScope.edit.title": "Aplicar esta <em>alteração</em> a…",
  "manage.seriesScope.edit.sub":
    "Este convívio repete-se. Escolhe se a tua alteração se aplica só a esta data ou a todas as datas seguintes.",
  "manage.seriesScope.edit.thisCta": "Só a esta data",
  "manage.seriesScope.edit.futureCta": "A esta e a todas as datas futuras",
  "manage.seriesScope.cancel.title": "Cancelar <em>que datas?</em>",
  "manage.seriesScope.cancel.sub":
    "Este convívio repete-se. Escolhe se queres cancelar só esta data ou toda a série fixa.",
  "manage.seriesScope.cancel.thisCta": "Só esta data",
  "manage.seriesScope.cancel.futureCta": "Esta e todas as datas futuras",

  // ── Manage: message-attendees modal ───────────────────────────────────────────
  "manage.messageModal.eyebrow": "Enviar mensagem",
  "manage.messageModal.title": "Escreve às pessoas convidadas",
  "manage.messageModal.sub":
    "Chega a todas as pessoas que confirmaram presença neste convívio. Mantém a mensagem curta: uma nota sobre o local, uma mudança de horário, ou apenas um olá caloroso.",
  "manage.messageModal.subjectLabel": "Assunto",
  "manage.messageModal.subjectPlaceholder":
    "por ex., uma pequena mudança na hora de início",
  "manage.messageModal.bodyLabel": "Mensagem",
  "manage.messageModal.sendCta_one": "Enviar a {count} pessoa",
  "manage.messageModal.sendCta_other": "Enviar a {count} pessoas",
  "manage.messageModal.successTitle": "Mensagem <em>enviada.</em>",
  "manage.messageModal.successSub_one":
    '"{subject}" chegou a <b>{count} pessoa confirmada</b>. Vão recebê-la nas notificações da QueerPulse.',
  "manage.messageModal.successSub_other":
    '"{subject}" chegou a <b>{count} pessoas confirmadas</b>. Vão recebê-la nas notificações da QueerPulse.',
  "manage.messageModal.successMeta_one": "Enviado agora mesmo · {count} pessoa",
  "manage.messageModal.successMeta_other":
    "Enviado agora mesmo · {count} pessoas",

  // ── Manage: invite-members modal ──────────────────────────────────────────────
  "manage.invite.eyebrow": "Convidar pessoas",
  "manage.invite.title": "Traz as <em>pessoas certas</em>",
  "manage.invite.sub":
    "Escolhe as pessoas que gostavas de ter neste convívio. Vão receber um convite caloroso que podem aceitar ou não, sem pressão.",
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
    "<b>{count} pessoa</b> acabou de receber um convite para este convívio, nas notificações da QueerPulse. Vais vê-la aparecer assim que confirmar presença.",
  "manage.invite.successSub_other":
    "<b>{count} pessoas</b> acabaram de receber um convite para este convívio, nas notificações da QueerPulse. Vais vê-las aparecer à medida que confirmam presença.",
  "manage.invite.successMeta_one": "Enviado agora mesmo · {count} convite",
  "manage.invite.successMeta_other": "Enviado agora mesmo · {count} convites",

  // ── Manage: inline-edit modal ──────────────────────────────────────────────────
  "manage.inlineEdit.eyebrow": "Editar",
  "manage.inlineEdit.title": "Editar {label}",
  "manage.inlineEdit.saveCta": "Guardar",

  // ── Venue picker (VenuePicker) — used by the manage venue modal and the
  //    create-gathering wizard's DatePlaceStep ──────────────────────────────
  "venuePicker.searchPlaceholder": "Pesquisar no diretório local",
  "venuePicker.noResults": "Sem correspondências. Tenta outra pesquisa.",
  "venuePicker.enterManually": "Não encontras? Escreve tu mesmo",
  "venuePicker.searchInstead": "Pesquisar no diretório",
  "venuePicker.freeTextPlaceholder": "Nome do local",
  "venuePicker.fromDirectory": "Do diretório local",
  "venuePicker.change": "Alterar",

  // ── Cohosts (CohostManager / AddCohostModal / MemberPicker) ─────────────────────
  "cohost.panelTitle": "Pessoas coanfitriãs",
  "cohost.addCta": "Adicionar pessoa coanfitriã",
  "cohost.panelDesc":
    "Uma pessoa coanfitriã pode editar este convívio, enviar mensagens às pessoas convidadas e gerir as inscrições. Continuas como a pessoa anfitriã principal. Cancelar o convívio e o fundo da pessoa anfitriã ficam contigo.",
  "cohost.emptyState":
    "Ainda não tens nenhuma pessoa coanfitriã. Adicionar uma significa teres companhia para a noite.",
  "cohost.roleCohost": "Pessoa coanfitriã",
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
    "Uma pessoa coanfitriã pode editar a página, enviar mensagens às pessoas convidadas e gerir as inscrições contigo. Escolhe alguém em quem confies. Vai receber um pedido para aceitar.",
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
  "qr.demoNote": "Modo de demonstração. Não é usada nenhuma câmara real.",
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
    "Compactámos <b>{count} fotografia</b> no ficheiro <b>album.zip</b> e a transferência já começou. Os rostos ficam desfocados a não ser que a pessoa tenha optado por aparecer com o nome. Isso está incluído na exportação.",
  "album.success.sub_other":
    "Compactámos <b>{count} fotografias</b> no ficheiro <b>album.zip</b> e a transferência já começou. Os rostos ficam desfocados a não ser que a pessoa tenha optado por aparecer com o nome. Isso está incluído na exportação.",
  "album.success.meta_one": "album.zip · {count} fotografia",
  "album.success.meta_other": "album.zip · {count} fotografias",
  "album.success.doneCta": "Concluído",

  // ── Meet the table (MeetTheTable / TableSeat / AttendeeCard) ──────────────
  "table.title": "Conhece a mesa",
  "table.atTableCount_one": "{count} pessoa à mesa",
  "table.atTableCount_other": "{count} pessoas à mesa",
  "table.openCount_one": "{count} lugar livre",
  "table.openCount_other": "{count} lugares livres",
  "table.aboutSeatAria": "Sobre {name}",
  "table.emptySeatLabel": "Livre",
  "table.emptySeatAria": "Lugar livre",
  "table.legend": "Os lugares enchem à medida que mais pessoas reservam.",

  // ── Events Hub (EventsHubPage + hub/*) ────────────────────────────────────
  "hub.tabs.highlights": "Destaques",
  "hub.tabs.browse": "Explorar",
  "hub.tabs.calendar": "Calendário",
  "hub.hero.rsvp": "Dá uma vista de olhos",
  "hub.featured.eyebrow": "A seguir",
  "hub.bucket.tonight": "Hoje à noite",
  "hub.bucket.weekend": "Este fim de semana",
  "hub.bucket.week": "Esta semana",
  "hub.bucket.later": "Em breve",
  "hub.highlights.heading": "Vale a pena aparecer",
  "hub.browse.heading": "Tudo o que há",
  "hub.browse.loadMore": "Mostrar mais",
  "hub.browse.empty": "Nada com esse filtro. Experimenta outro.",
  "hub.browse.searchLabel": "Procurar eventos",
  "hub.browse.searchPlaceholder": "Procura por nome ou zona",
  "hub.browse.searchEmpty": "Nenhum evento corresponde à tua procura.",
  "hub.calendar.heading": "O mês de relance",
  "hub.host.title": "Estás a <em>organizar</em> algo?",
  "hub.host.body":
    "Um jantar, uma leitura, um protesto, uma festa: seja o que for que organizes, ajudamos a que te encontrem.",
  "hub.host.cta": "Organiza um encontro",
  "hub.ways.heading": "Formas de te juntares",
  "hub.empty.title": "Ainda nada no calendário.",
  "hub.empty.body": "Aparecem coisas novas por aqui a toda a hora. Podias organizar a primeira.",
  "hub.card.cta": "Vê",
  "hub.loading": "A ver o que há…",

  // ── Editor de lineup (GatheringLineupEditor + GatheringLineupRow, na
  // GatheringPage) — quem organiza marca quem atua, organiza ou trabalha no
  // convívio, mais o lembrete pós-convívio de persona (GatheringPerformerNudge).
  // Descoberta de personas, Fase 5, Momento 5.
  "lineup.title": "Lineup",
  "lineup.description": "Marca quem vai atuar, organizar ou trabalhar neste convívio.",
  "lineup.empty": "Ainda ninguém foi marcado.",
  "lineup.addCta": "Marcar alguém",
  "lineup.roleLabel": "O papel da pessoa",
  "lineup.removeAria": "Remover {name} do lineup",
  "lineup.pickerTitle": "Marcar alguém",
  "lineup.pickerSearchPlaceholder": "Procura entre quem vai",
  "lineup.saveCta": "Guardar lineup",
  "lineup.saving": "A guardar…",
  "lineup.savedToast": "Lineup guardado",
  "lineup.errorToast": "Não conseguimos guardar isso agora. Tenta outra vez.",

  "performerNudge.body":
    "Atuaste como {name}, {craft}. Queres uma página para isso?",
  "performerNudge.startCta": "Começar",
  "performerNudge.dismissCta": "Agora não",
};
