import type { Catalog } from "../../types";

/**
 * Sistema — pt-PT inclusivo. Mesmas chaves que `en/system.ts`.
 *
 * Notas de tradução:
 * - Registo `tu`, caloroso, nunca `você`.
 * - "Members" → *pessoas*, nunca *membros*. "Vouching member" → *pessoa
 *   que dá votos de confiança* (verbo: *dar um voto de confiança*).
 * - Onde uma frase teria de genderizar um particípio dirigido a quem lê
 *   ("convidado/a", "avisado/a"), preferimos reformular sem participio
 *   (verbo pessoal: "convidou-te", "vais receber um aviso") em vez de recorrer
 *   à forma neutra em -e — só se usa -e quando a reformulação não funciona
 *   (ver `docs/i18n/glossary-pt.md`).
 * - "Sustainer" (nível de subscrição) e "QueerPulse" ficam em inglês — nomes
 *   de produto/marca, nunca traduzidos.
 * - Nomes próprios, emails, IDs de caso/incidente e o texto que a pessoa que
 *   convida escreve (`view.note`) não passam por aqui — ficam como dados no
 *   componente.
 */
export const system: Catalog = {
  // ── src/pages/NotFoundPage.tsx ────────────────────────────────────────────
  "notFound.eyebrow": "Página não encontrada",
  "notFound.title.line1": "Chegaste a",
  "notFound.title.line2": "<em>outro lugar.</em>",
  "notFound.sub":
    "A página que procuras não existe, mudou de sítio, ou exige que tenhas sessão iniciada. Acontece. Aqui tens alguns sítios para onde ir.",
  "notFound.homeCta": "Ir para a página inicial",
  "notFound.backCta": "Voltar",
  "notFound.linksTitle": "Ou experimenta uma destas opções",
  "notFound.links.magazine.label": "Revista",
  "notFound.links.magazine.sub": "Edição de junho de 2026",
  "notFound.links.gatherings.label": "Convívios",
  "notFound.links.gatherings.sub": "Próximos eventos",
  "notFound.links.readingGroups.label": "Grupos de leitura",
  "notFound.links.readingGroups.sub": "8 grupos abertos",
  "notFound.links.forum.label": "Fórum",
  "notFound.links.forum.sub": "Discussão da comunidade",
  "notFound.links.help.label": "Ajuda e perguntas frequentes",
  "notFound.links.help.sub": "Encontra respostas",
  "notFound.links.contact.label": "Contacta-nos",
  "notFound.links.contact.sub": "hello@queerpulse.com",
  "notFound.searchPlaceholder": "Pesquisar na plataforma…",
  "notFound.searchCta": "Pesquisar",

  // ── src/pages/PlaceholderPage.tsx ─────────────────────────────────────────
  "placeholder.title": "{title} está <em>a caminho.</em>",

  // ── AccountBannedPage.tsx ─────────────────────────────────────────────────
  "accountBanned.kicker": "Conta removida · ação final",
  "accountBanned.heading": "A tua conta foi <em>encerrada.</em>",
  "accountBanned.lead1":
    "Depois de uma revisão de moderação completa e uma ronda de recurso, a tua conta foi removida permanentemente da QueerPulse. <em>Isto não foi feito de ânimo leve.</em>",
  "accountBanned.lead2":
    "A tua subscrição Sustainer ativa foi <b>reembolsada proporcionalmente</b> para o cartão registado.",
  "accountBanned.violation.title": "Motivo · referente ao teu processo",
  "accountBanned.violation.body":
    "<b>§02·06</b>: Uso da plataforma como arma contra outras pessoas da comunidade. O padrão de comportamento foi documentado em <b>8 incidentes distintos</b> ao longo de quatro meses e revisto por duas pessoas moderadoras independentes.",
  "accountBanned.whatNow.row1.title": "Podes recorrer desta decisão uma vez",
  "accountBanned.whatNow.row1.body":
    "Abre o recurso no prazo de 14 dias após a remoção. É revisto pelo painel permanente de recursos da Assembleia, pessoas diferentes das que trataram o teu processo. Resposta em 21 dias.",
  "accountBanned.whatNow.row2.title":
    "Os teus dados são removidos da plataforma no prazo de 30 dias",
  "accountBanned.whatNow.row2.body":
    "Consulta a nossa <a>política de privacidade</a>. As publicações que escreveste ficam no lugar sem o teu nome, a menos que peças especificamente a eliminação abaixo.",
  "accountBanned.whatNow.row3.title": "Não ficam registos públicos desta ação",
  "accountBanned.whatNow.row3.body":
    "O processo existe internamente durante 36 meses. As tuas ligações foram notificadas de que saíste, sem motivo dado. Ninguém saberá que a tua conta foi encerrada, a menos que sejas tu a contar.",
  "accountBanned.whatNow.row4.title": "O apoio em crise continua disponível",
  "accountBanned.whatNow.row4.body":
    "A <wellbeingLink>biblioteca de recursos</wellbeingLink> está aberta a todas as pessoas, sejam ou não da comunidade.",
  "accountBanned.actions.appealCta": "Apresentar o recurso",
  "accountBanned.actions.eraseCta": "Pedir a eliminação total dos dados",
  "accountBanned.foot":
    "Se achas que isto resultou de denúncias falsas coordenadas, inclui no recurso os nomes que suspeitas. Investigamos isto com cuidado. <a>Relê o Código de Conduta</a>",

  // ── AccountLockedPage.tsx ─────────────────────────────────────────────────
  "accountLocked.kicker": "Conta bloqueada · temporário",
  "accountLocked.heading": "A tua conta está <em>em pausa.</em>",
  "accountLocked.lead":
    "Detetámos atividade de início de sessão fora do habitual na tua conta e bloqueámo-la por precaução. Não estás em sarilhos. Preferimos reagir a mais do que arriscar.",
  "accountLocked.reason1":
    "<b>5 tentativas de início de sessão falhadas</b> nos últimos 12 minutos, a partir de dois dispositivos.",
  "accountLocked.reason2":
    "<b>Nova localização:</b> tentativa a partir de <b>Madrid, Espanha</b>. Costumas iniciar sessão a partir de Lisboa.",
  "accountLocked.reason3":
    "<b>O bloqueio vai levantar-se automaticamente</b> dentro de 23 minutos, ou usa uma das opções abaixo para desbloquear já.",
  "accountLocked.whatNow.contact.title": "Contactar a equipa",
  "accountLocked.whatNow.contact.desc":
    "Se nada disto resultar, escreve-nos e verificamos-te manualmente.",
  "accountLocked.foot.whyLink": "Porque é que isto acontece?",

  // ── AccountSuspendedPage.tsx ──────────────────────────────────────────────
  "accountSuspended.kicker": "Conta em pausa · ação de moderação",
  "accountSuspended.heading":
    "A tua conta está <em>suspensa</em> durante {days} dias.",
  "accountSuspended.lead":
    "Uma pessoa moderadora reviu uma denúncia e decidiu que a tua mensagem recente em <b>{channel}</b> violou o §02·02 do Código de Conduta (<em>identificação de género incorreta repetida</em>). Esta é uma <b>suspensão temporária no nível 3</b> da escala de moderação.",
  // Texto de introdução em modo real (membro mesmo suspenso) — os detalhes ficam
  // no bloco de motivo abaixo, vindos da nota de moderação, por isso é geral.
  "accountSuspended.leadLive":
    "A tua conta está em pausa enquanto uma decisão de moderação se mantém. Aqui está o que aconteceu, e como responder.",
  "accountSuspended.reason.title": "Porque é que a tua conta foi pausada",
  "accountSuspended.details.action": "Ação",
  "accountSuspended.details.actionValue": "Suspensão de {days} dias",
  "accountSuspended.details.started": "Início",
  "accountSuspended.details.liftsAutomatically": "Levanta-se automaticamente",
  "accountSuspended.details.reviewedBy": "Revisto por",
  "accountSuspended.details.reviewedByValue":
    "{name} + mais uma pessoa moderadora anónima",
  "accountSuspended.details.caseId": "N.º do processo",
  "accountSuspended.whatStays.title":
    "O que continua a funcionar · durante a suspensão",
  "accountSuspended.whatStays.item1": "Ler conteúdo público e a revista",
  "accountSuspended.whatStays.item2":
    "Participar em convívios a que já tinhas confirmado presença",
  "accountSuspended.whatStays.item3":
    "Chat de crise · sempre disponível, sem exceções",
  "accountSuspended.whatStays.item4":
    "Apresentar um recurso · resposta em 5 dias úteis",
  "accountSuspended.actions.appealCta": "Apresentar um recurso",
  "accountSuspended.actions.ladderCta": "Ver a escala de moderação",
  "accountSuspended.actions.messageModCta":
    "Enviar mensagem à equipa de moderação",
  "accountSuspended.foot":
    "{percent}% dos recursos são revertidos. Publicamos este número todos os anos. <a>Ver as estatísticas de moderação de 2025</a>",

  // ── InviteExpiredPage.tsx (estado do convite: expirado / usado / cancelado / inválido) ─
  "inviteState.expired.eyebrow": "Convite expirado",
  "inviteState.expired.heading": "Esta ligação <em>expirou.</em>",
  "inviteState.expired.lead":
    "Os convites ficam válidos durante algum tempo, e o teu foi enviado há demasiado tempo, por isso o lugar que reservámos para ti voltou para a bolsa geral. A forma mais rápida de entrar é um novo empurrão de quem te deu um voto de confiança.",
  "inviteState.used.eyebrow": "Convite já usado",
  "inviteState.used.heading": "Este convite <em>já foi aberto.</em>",
  "inviteState.used.lead":
    "Alguém já entrou com esta ligação. Muito provavelmente tu, noutro dispositivo. Se foste tu, é só entrar. Se não foste, avisa a equipa e nós vamos verificar.",
  "inviteState.revoked.eyebrow": "Convite retirado",
  "inviteState.revoked.heading": "Este convite foi <em>anulado.</em>",
  "inviteState.revoked.lead":
    "Quem enviou este convite, ou um moderador da comunidade, retirou-o antes de ser usado. Não faz mal. Podes pedir um novo sempre que quiseres.",
  "inviteState.notFound.eyebrow": "Convite não encontrado",
  "inviteState.notFound.heading":
    "Não conseguimos <em>reconhecer esta ligação.</em>",
  "inviteState.notFound.lead":
    "Esta ligação de convite não corresponde a nada do nosso lado. Pode ter sido mal copiada ou cortada ao ser partilhada. Pede um novo convite e nós tratamos de te pôr lá dentro.",
  "inviteState.inviterInactive.eyebrow": "Quem convidou já não está ativo",
  "inviteState.inviterInactive.heading":
    "A pessoa que te convidou <em>já não está por cá.</em>",
  "inviteState.inviterInactive.lead":
    "Quem enviou este convite já não está ativo no QueerPulse, por isso a ligação não te consegue trazer para dentro. Não foi nada que tenhas feito. Pede um novo convite a outra pessoa que conheças, ou pede um e nós tratamos do resto.",
  "inviteState.details.expiredOn": "Expirou",
  "inviteState.details.vouchedBy": "Voto de confiança de",
  "inviteState.actions.requestNew": "Pedir um novo convite",
  "inviteState.actions.signIn": "Entrar",
  "inviteState.actions.contact": "Falar com a equipa",
  "inviteState.foot.alreadyMember": "Já és da comunidade? <a>Entrar</a>",
  "inviteState.foot.needHelp": "Precisas de ajuda? <a>Falar com a equipa</a>",

  // ── InviteLandingPage.tsx / InviteLandingViews.tsx / inviteLanding.data.ts ─
  "inviteLanding.loader.verifying": "A verificar o teu código de convite…",
  "inviteLanding.loader.unsealing": "A abrir o convite de {name}…",
  "inviteLanding.loader.preparing": "A preparar as boas-vindas…",
  "inviteLanding.what.private.strong": "Privado por natureza.",
  "inviteLanding.what.private.rest":
    "Um espaço onde sabes sempre com quem estás a partilhar, e onde a tua privacidade é sempre tua para controlar.",
  "inviteLanding.what.noAds.strong": "A comunidade em primeiro lugar.",
  "inviteLanding.what.noAds.rest":
    "Sem anúncios a competir pela tua atenção nem algoritmos a decidir o que vês. A QueerPulse é moldada pelas pessoas que a usam.",
  "inviteLanding.what.community.strong": "Feito para a vida real.",
  "inviteLanding.what.community.rest":
    "Descobre pessoas, lugares, eventos e oportunidades que te ajudam a encontrar o teu caminho na vida queer em Lisboa.",
  "inviteLanding.sealed.eyebrow": "Recebeste um convite pessoal",
  "inviteLanding.sealed.title": "<em>{name}</em> convidou-te.",
  "inviteLanding.sealed.sub_one":
    "Só por convite · {count} pessoa. Esta ligação foi criada só para ti e só pode ser aberta uma vez.",
  "inviteLanding.sealed.sub_other":
    "Só por convite · {count} pessoas. Esta ligação foi criada só para ti e só pode ser aberta uma vez.",
  "inviteLanding.sealed.openCta": "Abrir convite",
  "inviteLanding.opening.title": "Um convite de <em>{name}.</em>",
  "inviteLanding.card.inviterNoteWithSince":
    "Pessoa da comunidade desde {since} · convidou-te",
  "inviteLanding.card.inviterNoteNoSince": "convidou-te",
  "inviteLanding.card.heading": "Tu pertences <em>aqui.</em>",
  "inviteLanding.card.headerNote":
    "Alguém da comunidade achou que te sentirias em casa aqui. O teu convite é pessoal, e é teu para aceitares.",
  "inviteLanding.card.noteFrom": "Uma nota de {name}",
  "inviteLanding.card.tokenLabel": "O teu código de convite",
  "inviteLanding.card.validFor_one": "Válido durante {count} dia",
  "inviteLanding.card.validFor_other": "Válido durante {count} dias",
  "inviteLanding.card.expires": "O convite expira {date}",
  "inviteLanding.card.googleCta": "Registar com a Google",
  "inviteLanding.card.under18BackLabel": "Voltar ao convite",
  "inviteLanding.card.consent":
    "Ao continuares, aceitas os nossos <termsLink>termos de utilização</termsLink> e a <privacyLink>política de privacidade</privacyLink>.",
  "inviteLanding.card.alreadyMember": "Já tens conta? <a>Entrar</a>",
  "inviteLanding.card.notExpecting":
    "Não esperavas isto? <a>Política de privacidade</a>",

  // ── MaintenancePage.tsx ───────────────────────────────────────────────────
  "maintenance.eyebrow": "Manutenção agendada",
  "maintenance.heading": "Já <em>voltamos.</em>",
  "maintenance.lead":
    "Estamos a lançar a <b>versão 2.5</b>: melhores ferramentas de moderação, um chat de crise renovado e envios de imagens mais rápidos. Deve voltar dentro de cerca de <em>20 minutos</em>.",
  "maintenance.info.startedLabel": "Início",
  "maintenance.info.startedValue": "14:00 <em>WET</em>",
  "maintenance.info.backByLabel": "De volta às",
  "maintenance.info.backByValue": "<em>~14:20</em> WET",
  "maintenance.affected.title": "O que está em baixo · o que não está",
  "maintenance.affected.web": "Plataforma web · tudo exceto…",
  "maintenance.affected.mobile": "Aplicação móvel · mesma implementação",
  "maintenance.affected.email":
    "Notificações por email · em fila, enviadas depois",
  "maintenance.actions.statusCta": "Estado em direto",
  "maintenance.meta.line1":
    "Acompanha em <a>status.queerpulse.app</a> · publicamos sempre uma retrospetiva pública.",
  "maintenance.meta.line2":
    "Feito por pessoas em Lisboa, que preferem lançar mais devagar do que arriscar partir o apoio em crise.",

  // ── OfflinePage.tsx ───────────────────────────────────────────────────────
  "offline.eyebrow": "Sem ligação",
  "offline.h1": "Estás <em>offline.</em>",
  "offline.lead":
    "Sem sinal, ou não conseguimos contactar os nossos servidores neste momento. <b>As páginas que já abriste</b> neste dispositivo podem ainda carregar. Experimenta uma abaixo.",
  "offline.tryTitle": "Experimenta uma página que já abriste",
  "offline.links.feed.label": "Feed da comunidade",
  "offline.links.feed.sub": "As novidades da tua comunidade",
  "offline.links.events.label": "Eventos",
  "offline.links.events.sub": "O que se passa e as tuas confirmações",
  "offline.links.messages.label": "Mensagens",
  "offline.links.messages.sub": "As tuas conversas recentes",
  "offline.status": "À escuta de sinal",
  "offline.retryCta": "Tentar outra vez",
  "offline.retryingCta": "Ainda offline",
  "offline.sessionBanner":
    "Estás offline. A página fica como está. O que enviares só segue quando a ligação voltar.",

  // ── PwaPromptPage.tsx ─────────────────────────────────────────────────────
  "pwaPrompt.kicker": "Adicionar ao ecrã principal · sem loja de aplicações",
  "pwaPrompt.heading": "Mantém a <em>QueerPulse</em> a um toque de distância.",
  "pwaPrompt.lead":
    "Instala a aplicação web no teu telemóvel em 30 segundos. <em>Igual a uma aplicação normal</em>, mas sem conta de loja de aplicações, sem rastreio, sem revisão. Só um atalho que abre o chat de crise, o teu bilhete e o mapa de espaços seguros num toque.",
  "pwaPrompt.features.push.label": "Notificações push",
  "pwaPrompt.features.push.detail":
    "· confirmações, respostas, menções · detalhadas e discretas",
  "pwaPrompt.features.offline.label": "Funciona offline",
  "pwaPrompt.features.offline.detail":
    "· mapa em cache, chat de crise, o teu bilhete QR",
  "pwaPrompt.features.size.label": "~ 6 MB no teu telemóvel",
  "pwaPrompt.features.size.detail":
    "· sem ocupar espaço a mais · sem análise em segundo plano",
  "pwaPrompt.tabs.ios": "iPhone",
  "pwaPrompt.tabs.android": "Android",
  "pwaPrompt.tabs.desktop": "Computador",
  "pwaPrompt.instructions.ios.title": "iPhone · Safari · 3 toques",
  "pwaPrompt.instructions.ios.step1":
    "Toca no ícone <b>Partilhar</b> na parte de baixo do Safari",
  "pwaPrompt.instructions.ios.step2":
    "Desliza e toca em <b>Adicionar ao ecrã principal</b> <em>· perto do fundo</em>",
  "pwaPrompt.instructions.ios.step3":
    "Toca em <b>Adicionar</b> no canto superior direito. Pronto.",
  "pwaPrompt.instructions.android.title":
    "Android · Chrome e Firefox · 2 toques",
  "pwaPrompt.instructions.android.step1":
    "Toca no <b>menu de três pontos</b> no canto superior direito",
  "pwaPrompt.instructions.android.step2":
    "Escolhe <b>Instalar aplicação</b> ou <b>Adicionar ao ecrã principal</b>",
  "pwaPrompt.instructions.android.step3":
    "Confirma · a QueerPulse vai aparecer com as tuas outras aplicações. <em>Funciona da mesma forma.</em>",
  "pwaPrompt.instructions.desktop.title": "Computador · Chrome e Edge",
  "pwaPrompt.instructions.desktop.step1":
    "Procura o <b>ícone de instalação</b> na barra de endereço (lado direito)",
  "pwaPrompt.instructions.desktop.step2":
    "Clica nele e depois em <b>Instalar</b> na janela",
  "pwaPrompt.instructions.desktop.step3":
    "Abre na sua própria janela · fixa na barra de tarefas / Dock",
  "pwaPrompt.installCta": "Instalar agora",
  "pwaPrompt.laterCta": "Talvez depois",
  "pwaPrompt.actionsFoot":
    "Adiar isto impede-nos de perguntar de novo neste dispositivo durante <b>30 dias</b>.",
  "pwaPrompt.toast.installHint":
    "Procura o aviso de instalação · normalmente no canto superior direito",
  "pwaPrompt.toast.snoozed": "Não voltamos a perguntar durante 30 dias",

  // ── InstallNudge.tsx / PushNotificationRow.tsx ───────────────────────────
  // ID-17. Ver o catálogo EN: no iPhone e no iPad o push só existe para a
  // aplicação instalada no ecrã principal.
  "pwaInstall.pushRow.helper":
    "No iPhone e no iPad, as notificações precisam da QueerPulse adicionada ao ecrã principal. O Safari só dá push à aplicação instalada.",
  "pwaInstall.pushRow.cta": "Como instalar",
  "pwaInstall.nudge.title": "Instalar a QueerPulse",
  "pwaInstall.nudge.body":
    "Instala a aplicação para receberes notificações e teres a QueerPulse a um toque de distância.",
  "pwaInstall.nudge.bodyIos":
    "Adiciona ao ecrã principal para receberes notificações. Demora cerca de 30 segundos.",
  "pwaInstall.nudge.cta": "Mostra-me como",
  "pwaInstall.nudge.dismiss": "Dispensar a sugestão de instalação",

  // ── ServerErrorPage.tsx ───────────────────────────────────────────────────
  "serverError.countdown.label": "Previsão de regresso em",
  "serverError.demoModeAria": "Modo de demonstração",
  "serverError.tabs.error": "Erro 500",
  "serverError.tabs.maintenance": "Manutenção",
  "serverError.heading.error.line1": "Algo correu",
  "serverError.heading.error.line2": "<em>mal do nosso lado.</em>",
  "serverError.heading.maintenance.line1": "Manutenção planeada.",
  "serverError.heading.maintenance.line2": "<em>Já voltamos.</em>",
  "serverError.sub.error":
    "A responsabilidade é nossa. Já fomos notificados automaticamente e estamos a analisar o problema.",
  "serverError.sub.maintenance":
    "Estamos a atualizar a plataforma. Não deve demorar muito. Agradecemos a tua paciência.",
  "serverError.status.maintenance":
    "<strong>Interrupção planeada.</strong> Acompanha em <a>status.queerpulse.com</a> para atualizações.",
  "serverError.status.error":
    "<strong>A nossa equipa já foi alertada.</strong> Consulta <a>status.queerpulse.com</a> para atualizações em direto.",
  "serverError.actions.retryCta": "Tentar outra vez",
  "serverError.actions.homeCta": "Ir para a página inicial",
  "serverError.actions.statusCta": "Ver o estado da plataforma",
  "serverError.footer.contact":
    "Se isto continuar a acontecer, <a>contacta-nos</a>.",

  // ── StatusPage.tsx / StatusComponents.tsx / status.data.ts ───────────────
  "status.hero.allOperational": "Todos os sistemas operacionais",
  "status.hero.title": "Estado da <em>plataforma</em>",
  "status.hero.sub": "Atualizado agora mesmo · Atualiza a cada 60 s",
  "status.hero.subLive":
    "Estado dos serviços em tempo real, mais tudo o que a equipa tenha registado.",

  // ── StatusLive.tsx / StatusLiveComponents.tsx / StatusLiveIncidents.tsx ──
  // ID-16. A superfície de estado EM DIRETO, alimentada pelo `GET /status`
  // público. Abre sem sessão nenhuma, por isso este texto é lido por quem está
  // com sessão terminada, suspenso ou bloqueado: nunca assume uma conta e diz
  // com clareza se o problema é nosso.
  "status.live.overall.operational.title": "Está tudo operacional",
  "status.live.overall.operational.body":
    "Todas as partes da plataforma que conseguimos verificar estão a responder normalmente.",
  "status.live.overall.degraded.title": "Algumas partes estão degradadas",
  "status.live.overall.degraded.body":
    "Neste momento há partes da plataforma mais lentas ou menos fiáveis do que o habitual. Os detalhes estão abaixo.",
  "status.live.overall.down.title": "Estamos com uma falha",
  "status.live.overall.down.body":
    "Há pelo menos uma parte da plataforma que não está a funcionar. Esta é nossa, e não tens de fazer nada.",
  "status.live.state.operational": "Operacional",
  "status.live.state.degraded": "Degradado",
  "status.live.state.down": "Indisponível",
  "status.live.componentsHeading": "Partes da plataforma",
  "status.live.component.accounts.name": "Sessão e contas",
  "status.live.component.accounts.desc":
    "Iniciar sessão, convites e definições da conta",
  "status.live.component.messaging.name": "Mensagens",
  "status.live.component.messaging.desc": "Mensagens diretas e de grupo",
  "status.live.component.communities.name": "Comunidades e fórum",
  "status.live.component.communities.desc":
    "Espaços de comunidade, tópicos e encontros",
  "status.live.component.directory.name": "Diretório local",
  "status.live.component.directory.desc": "Locais, espaços seguros e o mapa",
  "status.live.component.magazine.name": "Revista",
  "status.live.component.magazine.desc": "Artigos, edições e o arquivo",
  "status.live.component.media.name": "Fotografias e carregamentos",
  "status.live.component.media.desc":
    "Fotografias de perfil, galerias e tudo o que carregas",
  "status.live.incidentsHeading": "Incidentes",
  "status.live.incidentState.open": "A decorrer",
  "status.live.incidentState.monitoring": "Em observação",
  "status.live.incidentState.resolved": "Resolvido",
  "status.live.severity.minor": "Ligeiro",
  "status.live.severity.major": "Grave",
  "status.live.severity.critical": "Crítico",
  "status.live.incidents.started": "Começou a {date} às {time}",
  "status.live.incidents.resolved": "resolvido a {date} às {time}",
  "status.live.incidents.affects": "Afeta: {components}",
  "status.live.incidents.none.title": "Sem incidentes nos últimos 30 dias",
  "status.live.incidents.none.description":
    "Não há nada registado recentemente. Sempre que algo corre mal, é aqui que o dizemos.",
  "status.live.incidents.unavailable":
    "Não conseguimos carregar o histórico de incidentes, o que normalmente quer dizer que o problema é do nosso lado. O estado das partes acima mantém-se válido.",
  "status.live.lastChecked": "Última verificação {when}",
  "status.live.refreshCta": "Verificar de novo",
  "status.live.refreshingCta": "A verificar",
  "status.live.refreshAriaLabel": "Verificar de novo o estado da plataforma",
  "status.live.signedOutNote":
    "Esta página funciona sem conta. Se aqui está tudo operacional e mesmo assim não consegues iniciar sessão, o problema está na tua conta, e a equipa pode ver isso contigo.",
  "status.live.unreachable.title":
    "Não conseguimos contactar o serviço de estado",
  "status.live.unreachable.body":
    "Ou a plataforma está em baixo ou a tua ligação está. Tenta de novo daqui a pouco.",
  "status.services.sectionEye": "Serviços",
  "status.serviceStatus.operational": "Operacional",
  "status.serviceStatus.degraded": "Degradado",
  "status.serviceStatus.outage": "Indisponível",
  "status.services.authentication.name": "Autenticação",
  "status.services.authentication.desc": "Sistema de sessão e convites",
  "status.services.messages.name": "Mensagens",
  "status.services.messages.desc": "Mensagens diretas e de grupo",
  "status.services.forum.name": "Fórum",
  "status.services.forum.desc": "Painéis de discussão da comunidade",
  "status.services.eventsCalendar.name": "Eventos e calendário",
  "status.services.eventsCalendar.desc":
    "Descoberta de eventos e confirmações de presença",
  "status.services.magazine.name": "Revista",
  "status.services.magazine.desc": "Publicação mensal e arquivo",
  "status.services.search.name": "Pesquisa",
  "status.services.search.desc": "Pesquisa de pessoas e conteúdo",
  "status.services.notifications.name": "Notificações",
  "status.services.notifications.desc": "Notificações na aplicação e por email",
  "status.services.fileStorage.name": "Armazenamento de ficheiros",
  "status.services.fileStorage.desc": "Fotos de perfil e anexos",
  "status.uptime.sectionEye": "Disponibilidade dos últimos 90 dias",
  "status.uptime.pct": "{pct}% de disponibilidade",
  "status.uptime.tooltip.operational": "Operacional: {date}",
  "status.uptime.tooltip.partial": "Indisponibilidade parcial: {date}",
  "status.uptime.tooltip.outage": "Indisponibilidade: {date}",
  "status.uptime.axis.ninetyDaysAgo": "Há 90 dias",
  "status.uptime.axis.sixtyDaysAgo": "Há 60 dias",
  "status.uptime.axis.thirtyDaysAgo": "Há 30 dias",
  "status.uptime.axis.today": "Hoje",
  "status.incidents.sectionEye": "Histórico de incidentes",
  "status.incidents.resolvedTag": "Resolvido",
  "status.incidents.monitoringTag": "Em monitorização",
  "status.incidents.messageLatency.title": "Atraso na entrega de mensagens",
  "status.incidents.messageLatency.text":
    "Algumas pessoas sentiram atrasos de 5 a 15 minutos na entrega de mensagens devido a uma acumulação na fila após uma migração de base de dados. Nenhuma mensagem foi perdida.",
  "status.incidents.searchRebuild.title": "Reconstrução do índice de pesquisa",
  "status.incidents.searchRebuild.text":
    "A pesquisa de texto integral devolveu resultados desatualizados durante cerca de 3 horas enquanto o índice era reconstruído após uma alteração de esquema. A descoberta por navegação não foi afetada.",
  "status.incidents.emailDelay.title": "Atrasos nas notificações por email",
  "status.incidents.emailDelay.text":
    "Os emails de notificação atrasaram-se até 45 minutos durante uma janela de 2 horas. Todos os emails em fila foram entregues assim que o problema foi resolvido.",
  "status.incidents.dbUpgrade.title":
    "Manutenção agendada: atualização da base de dados",
  "status.incidents.dbUpgrade.text":
    "Janela de manutenção de 2 horas para uma atualização de versão maior do PostgreSQL. A plataforma esteve em modo só de leitura durante este período.",
  "status.subscribe.title": "Recebe avisos durante incidentes",
  "status.subscribe.body":
    "Um email quando algo falha, outro quando é resolvido. Mais nada.",
  "status.subscribe.placeholder": "teu@email.com",
  "status.subscribe.cta": "Subscrever",
  "status.subscribe.toast": "Vais receber um aviso durante incidentes.",
  "status.outro.line1": "Uma rede queer.",
  "status.outro.line2": "<em>Enraizada em Lisboa.</em>",
  "status.outro.sub": "Só por convite. Da comunidade. Feita para durar.",
  "status.outro.cta": "Pedir um convite",

  // ── VerificationNeededPage.tsx / VerificationNeededSections.tsx ──────────
  "verificationNeeded.heading": "Verificação rápida · <em>ainda és tu?</em>",
  "verificationNeeded.lead":
    "Para o próximo passo, precisamos de confirmar que ainda és tu neste dispositivo. <b>Esta é uma de duas ações</b> para as quais pedimos nova autenticação: cancelar a subscrição ou remover a conta.",
  "verificationNeeded.actionCard":
    "Estás prestes a <b>cancelar a tua subscrição Sustainer</b>",
  "verificationNeeded.foot": "Esta verificação expira em <b>{time}</b>.",
  // Ver a nota em en/system.ts: a nova autenticação passa por iniciar sessão
  // no Google outra vez, e não por uma ligação enviada por email, que a
  // QueerPulse nunca entrega.
  "verificationNeeded.confirm.intro":
    "Confirmar significa iniciar sessão no Google outra vez como <b>{email}</b>, para que uma sessão que outra pessoa tenha deixado aberta não leve isto por diante. Não é enviado nenhum email.",
  "verificationNeeded.confirm.cta": "Confirmar que sou eu",
  "verificationNeeded.confirm.verifyingCta": "A confirmar…",
  "verificationNeeded.success.title": "És mesmo tu, <em>confirmado.</em>",
  "verificationNeeded.success.sub":
    "Verificação confirmada. A encaminhar-te para cancelares a subscrição…",
  "verificationNeeded.success.continueCta": "Continuar agora",
  "verificationNeeded.expired.title": "Esta verificação <em>expirou.</em>",
  "verificationNeeded.expired.sub":
    "Por segurança, a verificação só fica disponível durante alguns minutos. Recomeça para continuar.",
  "verificationNeeded.expired.restartCta": "Recomeçar",

  // ── Ecrã de bloqueio da plataforma (estado de manutenção do kill-switch) ──
  // Ver a nota de desvio em en/system.ts: "maintenance.eyebrow" já existe
  // acima para o kicker da MaintenancePage.tsx ("Manutenção agendada"), por
  // isso esta chave nova ficou "maintenance.brandEyebrow" em vez do nome do
  // brief, para evitar uma chave duplicada no mesmo objeto (erro de tsc).
  "maintenance.brandEyebrow": "QueerPulse",
  "maintenance.title": "Já voltamos",
  // Só usado como recurso — quando a administração define a própria
  // mensagem, é essa que aparece.
  "maintenance.body":
    "A QueerPulse está temporariamente indisponível. Volta a passar por aqui em breve.",
  "maintenance.stillSignedIn":
    "A tua sessão continua iniciada. Está tudo à tua espera quando voltarmos.",
  "maintenance.retry": "Tentar outra vez",

  // ── NewsletterUnsubscribePage.tsx (CNT-19: cancelar subscrição da newsletter) ─
  "newsletterUnsubscribe.loading.eyebrow": "Newsletter",
  "newsletterUnsubscribe.loading.heading": "A confirmar o teu pedido…",
  "newsletterUnsubscribe.success.eyebrow": "Subscrição cancelada",
  "newsletterUnsubscribe.success.heading": "Saíste da <em>lista.</em>",
  "newsletterUnsubscribe.success.lead":
    "Este endereço saiu da lista. A QueerPulse não envia email, por isso nunca chegou nada aqui: isto é sobre o teu endereço não ficar numa lista onde não querias estar. Podes voltar a inscrevê-lo a partir da página inicial sempre que quiseres.",
  "newsletterUnsubscribe.alreadyUnsubscribed.eyebrow": "Já sem subscrição",
  "newsletterUnsubscribe.alreadyUnsubscribed.heading":
    "Já estava <em>tratado.</em>",
  "newsletterUnsubscribe.alreadyUnsubscribed.lead":
    "Este endereço já tinha saído da lista, e continua fora. Não está a sair nada para ele, aqui nem em lado nenhum: a QueerPulse não envia email.",
  "newsletterUnsubscribe.invalid.eyebrow": "Ligação não reconhecida",
  "newsletterUnsubscribe.invalid.heading":
    "Não conseguimos <em>reconhecer esta ligação.</em>",
  "newsletterUnsubscribe.invalid.lead":
    "Esta ligação para cancelar a subscrição não corresponde a nada do nosso lado. Pode estar desatualizada ou mal copiada. De qualquer forma não está a sair nada para o endereço, porque a QueerPulse não envia email, mas avisa a equipa se algo te parecer errado e nós tratamos disso.",
  "newsletterUnsubscribe.goHomeCta": "Voltar à página inicial",
  "newsletterUnsubscribe.contactCta": "Falar com a equipa",

  // ── GenesisPage.tsx (arranque único da plataforma; eliminada após o lançamento) ─
  // "Genesis" é o nome interno deste fluxo de arranque, mantido igual em
  // ambas as línguas, como os outros nomes de marca/produto neste catálogo.
  "genesis.eyebrow": "Arranque da plataforma",
  "genesis.heading": "Genesis",
  "genesis.loggedIn.lead":
    "Já entraste. Reivindica o acesso de administração para terminar o arranque da plataforma.",
  "genesis.loggedIn.claimCta": "Reivindicar administração",
  "genesis.loggedOut.lead":
    "Gera o convite fundador. Vais entrar através do fluxo de convite normal, com um convite da QueerPulse.",
  "genesis.loggedOut.generateCta": "Gerar convite",
  "genesis.notice.closed": "O Genesis está fechado.",
  "genesis.notice.rejected": "Esta conta não pode reivindicar o Genesis.",
  "genesis.notice.failedFallback": "Algo correu mal. Tenta outra vez.",
  "genesis.notice.claimed": "Agora fazes parte da administração.",
  "genesis.notice.demo":
    "O Genesis não está disponível no modo de demonstração.",

  // ── AdminStatusIncidentsPage.tsx / AdminStatusIncidentForm.tsx (ID-16) ───
  // A secretária de quem opera a página pública de estado. Fica neste catálogo
  // e não em `admin.ts` de propósito: o texto e a superfície que descreve são a
  // mesma funcionalidade, e a metade pública já vive aqui.
  "statusAdmin.navLabel": "Incidentes de estado",
  "statusAdmin.breadcrumb": "Administração",
  "statusAdmin.eyebrow": "Plataforma",
  "statusAdmin.title": "Incidentes de <em>estado</em>",
  "statusAdmin.headerSub":
    "O que os membros veem na página pública de estado. Tudo o que for publicado aqui é legível sem conta, incluindo por quem não consegue iniciar sessão.",
  "statusAdmin.newCta": "Novo incidente",
  "statusAdmin.empty": "Ainda não há nada registado.",
  "statusAdmin.loadError": "Não foi possível carregar a lista de incidentes.",
  "statusAdmin.forbidden": "Não tens acesso a este painel.",
  "statusAdmin.demoNotice":
    "O modo de demonstração não grava nada. Nada do que fizeres aqui chega à página pública de estado.",
  "statusAdmin.row.started": "Começou a {date}",
  "statusAdmin.row.resolved": "Resolvido a {date}",
  "statusAdmin.row.affects": "Afeta: {components}",
  "statusAdmin.row.affectsNone": "Sem partes marcadas como afetadas",
  "statusAdmin.row.author": "Registado por {name}",
  "statusAdmin.action.edit": "Editar",
  "statusAdmin.action.resolve": "Marcar como resolvido",
  "statusAdmin.action.cancel": "Cancelar",
  "statusAdmin.action.save": "Guardar alterações",
  "statusAdmin.action.publish": "Publicar incidente",
  "statusAdmin.form.createEyebrow": "Novo incidente",
  "statusAdmin.form.editEyebrow": "Editar incidente",
  "statusAdmin.form.createTitle": "Registar um incidente",
  "statusAdmin.form.editTitle": "Editar este incidente",
  "statusAdmin.form.drawerLabel": "Editor de incidentes",
  "statusAdmin.field.title": "Título",
  "statusAdmin.field.titleHint":
    "Uma linha, em linguagem simples. É a primeira coisa que um membro lê.",
  "statusAdmin.field.body": "O que se está a passar",
  "statusAdmin.field.bodyHint":
    "Texto simples. Qualquer marcação é removida ao guardar.",
  "statusAdmin.field.severity": "Gravidade",
  "statusAdmin.field.status": "Estado",
  "statusAdmin.field.startedAt": "Começou a",
  "statusAdmin.field.components": "Partes afetadas",
  "statusAdmin.field.componentsHint":
    "Tudo o que marcares aqui aparece como degradado na página pública, ou como indisponível se o incidente for crítico, até isto ficar resolvido.",
  "statusAdmin.severity.minor": "Ligeiro",
  "statusAdmin.severity.major": "Grave",
  "statusAdmin.severity.critical": "Crítico",
  "statusAdmin.status.open": "A decorrer",
  "statusAdmin.status.monitoring": "Em observação",
  "statusAdmin.status.resolved": "Resolvido",
  "statusAdmin.toast.created": "Incidente publicado.",
  "statusAdmin.toast.updated": "Incidente atualizado.",
  "statusAdmin.toast.resolved": "Incidente marcado como resolvido.",
  "statusAdmin.error.create": "Não foi possível publicar o incidente.",
  "statusAdmin.error.save": "Não foi possível guardar as alterações.",
  "statusAdmin.error.resolve":
    "Não foi possível marcar o incidente como resolvido.",
  "statusAdmin.error.required": "Dá um título e uma descrição ao incidente.",
};
