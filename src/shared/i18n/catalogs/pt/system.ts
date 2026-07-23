import type { Catalog } from "../../types";

/**
 * Sistema — pt-PT inclusivo. Mesmas chaves que `en/system.ts`.
 *
 * Notas de tradução:
 * - Registo `tu`, caloroso, nunca `você`.
 * - "Members" → *pessoas*, nunca *membros*. "Vouching member" → *pessoa
 *   avalizadora* (do verbo *avalizar*, já glossado).
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
  "notFound.backCta": "← Voltar",
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
  "notFound.links.contact.sub": "hello@queerpulse.pt",
  "notFound.searchPlaceholder": "Pesquisar na plataforma…",
  "notFound.searchCta": "Pesquisar",

  // ── src/pages/PlaceholderPage.tsx ─────────────────────────────────────────
  "placeholder.eyebrow": "Brevemente",
  "placeholder.title": "{title} está <em>a caminho.</em>",
  "placeholder.sub":
    "Esta parte da QueerPulse ainda está a ser construída. A página inicial já está no ar — explora as pessoas, os convívios e a comunidade por lá, entretanto.",
  "placeholder.backCta": "Voltar ao início",

  // ── AccountBannedPage.tsx ─────────────────────────────────────────────────
  "accountBanned.kicker": "Conta removida · ação final",
  "accountBanned.heading": "A tua conta foi <em>encerrada.</em>",
  "accountBanned.lead1":
    "Depois de uma revisão de moderação completa e uma ronda de recurso, a tua conta foi removida permanentemente da QueerPulse. <em>Isto não foi feito de ânimo leve.</em>",
  "accountBanned.lead2":
    "A tua subscrição Sustainer ativa foi <b>reembolsada proporcionalmente</b> para o cartão registado.",
  "accountBanned.violation.title": "Motivo · referente ao teu processo",
  "accountBanned.violation.body":
    "<b>§02·06</b> — Uso da plataforma como arma contra outras pessoas da comunidade. O padrão de comportamento foi documentado em <b>8 incidentes distintos</b> ao longo de quatro meses e revisto por duas pessoas moderadoras independentes.",
  "accountBanned.whatNow.row1.title": "Podes recorrer desta decisão uma vez",
  "accountBanned.whatNow.row1.body":
    "Abre o recurso no prazo de 14 dias após a remoção. É revisto pelo painel permanente de recursos da Assembleia — pessoas diferentes das que trataram o teu processo. Resposta em 21 dias.",
  "accountBanned.whatNow.row2.title":
    "Os teus dados são removidos da plataforma no prazo de 30 dias",
  "accountBanned.whatNow.row2.body":
    "Consulta a nossa <a>política de privacidade</a>. As publicações que escreveste são anonimizadas, não eliminadas, a menos que peças especificamente a eliminação abaixo.",
  "accountBanned.whatNow.row3.title": "Não ficam registos públicos desta ação",
  "accountBanned.whatNow.row3.body":
    "O processo existe internamente durante 36 meses. As tuas ligações foram notificadas de que saíste, sem motivo dado. Ninguém saberá que a tua conta foi encerrada, a menos que sejas tu a contar.",
  "accountBanned.whatNow.row4.title": "O apoio em crise continua disponível",
  "accountBanned.whatNow.row4.body":
    "O <crisisLink>apoio em crise</crisisLink> e a <wellbeingLink>biblioteca de recursos</wellbeingLink> estão abertos a todas as pessoas, sejam ou não da comunidade.",
  "accountBanned.actions.appealCta": "Apresentar o recurso",
  "accountBanned.actions.eraseCta": "Pedir a eliminação total dos dados",
  "accountBanned.foot":
    "Se achas que isto resultou de denúncias falsas coordenadas, inclui no recurso os nomes que suspeitas — investigamos isto com cuidado. <a>Relê o Código de Conduta →</a>",

  // ── AccountLockedPage.tsx ─────────────────────────────────────────────────
  "accountLocked.kicker": "Conta bloqueada · temporário",
  "accountLocked.heading": "A tua conta está <em>em pausa.</em>",
  "accountLocked.lead":
    "Detetámos atividade de início de sessão fora do habitual na tua conta e bloqueámo-la por precaução. Não estás em sarilhos — preferimos reagir a mais do que arriscar.",
  "accountLocked.reason1":
    "<b>5 tentativas de início de sessão falhadas</b> nos últimos 12 minutos, a partir de dois dispositivos.",
  "accountLocked.reason2":
    "<b>Nova localização:</b> tentativa a partir de <b>Madrid, Espanha</b> — costumas iniciar sessão a partir de Lisboa.",
  "accountLocked.reason3":
    "<b>O bloqueio vai levantar-se automaticamente</b> dentro de 23 minutos — ou usa uma das opções abaixo para desbloquear já.",
  "accountLocked.whatNow.contact.title": "Contactar a equipa",
  "accountLocked.whatNow.contact.desc":
    "Se nada disto resultar, escreve-nos e verificamos-te manualmente.",
  "accountLocked.foot.incident": "Incidente <idTag>{id}</idTag> · {time}",
  "accountLocked.foot.whyLink": "Porque é que isto acontece?",

  // ── AccountSuspendedPage.tsx ──────────────────────────────────────────────
  "accountSuspended.kicker": "Conta em pausa · ação de moderação",
  "accountSuspended.heading":
    "A tua conta está <em>suspensa</em> durante {days} dias.",
  "accountSuspended.lead":
    "Uma pessoa moderadora reviu uma denúncia e decidiu que a tua mensagem recente em <b>{channel}</b> violou o §02·02 do Código de Conduta (<em>identificação de género incorreta repetida</em>). Esta é uma <b>suspensão temporária no nível 3</b> da escala de moderação.",
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
    "{percent}% dos recursos são revertidos. Publicamos este número todos os anos. <a>Ver as estatísticas de moderação de 2025 →</a>",

  // ── GeoRestrictedPage.tsx ─────────────────────────────────────────────────
  "geoRestricted.eyebrow": "Região restrita",
  "geoRestricted.h1":
    "A QueerPulse ainda não está <em>totalmente disponível</em> aqui.",
  "geoRestricted.lead":
    "Parece que estás a ligar-te a partir de um país onde algumas funcionalidades da QueerPulse estão restritas — normalmente porque não temos pessoas moderadoras no teu fuso horário, ou porque ainda estamos a analisar o enquadramento legal local. <em>O apoio em crise e os recursos de segurança continuam abertos para ti.</em>",
  "geoRestricted.why.title": "Porque é que isto acontece",
  "geoRestricted.why.body":
    "Só abrimos acesso a uma nova região quando temos <em>pelo menos uma pessoa moderadora no país</em> e revemos o enquadramento legal local para a expressão queer. É intencionalmente lento. Não queremos divulgar a comunidade queer num lugar onde as pessoas ficariam em risco ao entrar.",
  "geoRestricted.can.title": "O que ainda podes fazer · agora mesmo",
  "geoRestricted.can.readArticles.label":
    "Ler todos os artigos públicos e a revista",
  "geoRestricted.can.readArticles.detail":
    "O arquivo editorial completo está aberto · <a>explorar →</a>",
  "geoRestricted.can.crisis.label": "Aceder a recursos de crise e segurança",
  "geoRestricted.can.crisis.detail":
    "Guias de emergência, linhas de apoio e documentos de redução de danos · <a>ver apoio de emergência →</a>",
  "geoRestricted.can.resources.label":
    "Explorar recursos internacionais verificados",
  "geoRestricted.can.resources.detail":
    "Linhas de apoio, apoio jurídico queer-friendly e contactos de emergência em 14 outros países · <a>biblioteca de recursos →</a>",
  "geoRestricted.can.askUs.label": "Pede-nos para abrir o acesso aqui",
  "geoRestricted.can.askUs.detail":
    "Diz-nos onde estás (não precisas do teu nome) e o que ajudaria · <a>escreve à equipa →</a>",
  "geoRestricted.detect":
    "Detetado: <b>Portugal · Lisboa</b> · esta é uma demonstração da vista de região restrita.",
  "geoRestricted.goHome": "Ir para o início →",

  // ── InterestsEditorModal.tsx + interestsEditor.data.ts ───────────────────
  "interestsEditor.closeAria": "Fechar",
  "interestsEditor.success.title": "Interesses <em>atualizados.</em>",
  "interestsEditor.success.sub_one":
    "Registámos o teu {count} interesse. Uma pessoa avalizadora com interesses em comum vai tratar do teu pedido — mantê-los atualizados pode acelerar o processo.",
  "interestsEditor.success.sub_other":
    "Registámos os teus {count} interesses. Uma pessoa avalizadora com interesses em comum vai tratar do teu pedido — mantê-los atualizados pode acelerar o processo.",
  "interestsEditor.success.doneCta": "Concluído",
  "interestsEditor.eyebrow": "Pedido de convite · interesses",
  "interestsEditor.title": "Atualiza os teus <em>interesses.</em>",
  "interestsEditor.desc":
    "Associamos o teu pedido a uma pessoa avalizadora com interesses em comum. Escolhe os que se aplicam — quanto mais sinceros, melhor a correspondência.",
  "interestsEditor.count_one": "{count} selecionado",
  "interestsEditor.count_other": "{count} selecionados",
  "interestsEditor.pickAtLeastTwo": "escolhe pelo menos 2",
  "interestsEditor.saveCta": "Guardar interesses",
  "interestsEditor.cancelCta": "Cancelar",
  "interestsEditor.options.filmCinema": "Cinema",
  "interestsEditor.options.readingGroups": "Grupos de leitura",
  "interestsEditor.options.mutualAid": "Entreajuda",
  "interestsEditor.options.activism": "Ativismo",
  "interestsEditor.options.nightlife": "Vida noturna",
  "interestsEditor.options.transHealthcare": "Saúde trans",
  "interestsEditor.options.migrationVisas": "Migração e vistos",
  "interestsEditor.options.housing": "Habitação",
  "interestsEditor.options.mentorship": "Mentoria",
  "interestsEditor.options.musicStudio": "Música e estúdio",
  "interestsEditor.options.soberSpaces": "Espaços sóbrios",
  "interestsEditor.options.parentingFamily": "Parentalidade e família",
  "interestsEditor.options.sports": "Desporto",
  "interestsEditor.options.artMaking": "Arte e criação",
  "interestsEditor.options.techWork": "Tecnologia e trabalho",
  "interestsEditor.options.wellbeing": "Bem-estar",

  // ── InviteExpiredPage.tsx ─────────────────────────────────────────────────
  "inviteExpired.eyebrow": "Convite expirado",
  "inviteExpired.heading": "Esta ligação <em>expirou.</em>",
  "inviteExpired.lead":
    "Os convites ficam válidos durante 14 dias. O teu foi enviado há algum tempo, por isso o lugar que reservámos para ti voltou para a bolsa geral.",
  "inviteExpired.details.invitedAs": "Convite para",
  "inviteExpired.details.sent": "Enviado",
  "inviteExpired.details.expired": "Expirado",
  "inviteExpired.details.vouchedBy": "Aval de",
  "inviteExpired.actions.resendCta": "Pedir a {name} para reenviar →",
  "inviteExpired.actions.freshInviteCta": "Pedir um novo convite",
  "inviteExpired.foot.alreadyMember": "Já és da comunidade? <a>Entrar</a>",
  "inviteExpired.foot.needHelp": "Precisas de ajuda? <a>Falar com a equipa</a>",

  // ── InviteLandingPage.tsx / InviteLandingViews.tsx / inviteLanding.data.ts ─
  "inviteLanding.loader.verifying": "A verificar o teu código de convite…",
  "inviteLanding.loader.unsealing": "A abrir o convite de {name}…",
  "inviteLanding.loader.preparing": "A preparar as boas-vindas…",
  "inviteLanding.what.private.strong": "Privado por natureza.",
  "inviteLanding.what.private.rest":
    "Só por convite. 247 pessoas. Sem pressa de crescer por crescer.",
  "inviteLanding.what.noAds.strong": "Sem anúncios. Sem algoritmo.",
  "inviteLanding.what.noAds.rest":
    "Uma plataforma que trabalha para ti, não para anunciantes.",
  "inviteLanding.what.community.strong": "Comunidade a sério.",
  "inviteLanding.what.community.rest":
    "Fórum, eventos, uma revista mensal e um fundo de saúde mental.",
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
    "Este convite foi criado só para ti, pessoalmente — é teu, só teu.",
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
    "Estamos a lançar a <b>versão 2.5</b> — melhores ferramentas de moderação, um chat de crise renovado e envios de imagens mais rápidos. Deve voltar dentro de cerca de <em>20 minutos</em>.",
  "maintenance.info.startedLabel": "Início",
  "maintenance.info.startedValue": "14:00 <em>WET</em>",
  "maintenance.info.backByLabel": "De volta às",
  "maintenance.info.backByValue": "<em>~14:20</em> WET",
  "maintenance.affected.title": "O que está em baixo · o que não está",
  "maintenance.affected.web": "Plataforma web · tudo exceto…",
  "maintenance.affected.mobile": "Aplicação móvel · mesma implementação",
  "maintenance.affected.email":
    "Notificações por email · em fila, enviadas depois",
  "maintenance.affected.crisisChat":
    "Apoio em crise · <b>totalmente ativo</b> — a página de linhas de apoio de emergência é estática, sempre acessível",
  "maintenance.affected.emergencyPages":
    "Páginas de emergência e segurança · <b>totalmente ativas</b> · em cache em todo o mundo",
  "maintenance.actions.statusCta": "Estado em direto →",
  "maintenance.actions.crisisCta": "Apoio em crise (continua ativo)",
  "maintenance.meta.line1":
    "Acompanha em <a>status.queerpulse.app</a> · publicamos sempre uma retrospetiva pública.",
  "maintenance.meta.line2":
    "Feito por pessoas em Lisboa, que preferem lançar mais devagar do que arriscar partir o apoio em crise.",

  // ── OfflinePage.tsx ───────────────────────────────────────────────────────
  "offline.eyebrow": "Sem ligação · versão em cache",
  "offline.h1": "Estás <em>offline.</em>",
  "offline.lead":
    "Sem sinal, ou não conseguimos contactar os nossos servidores. <b>Não te preocupes</b> — as tuas confirmações de convívios, o teu mapa de espaços seguros guardado e o teu bilhete QR continuam aqui neste dispositivo.",
  "offline.cachedTitle":
    "Disponível offline · guardado em cache neste dispositivo",
  "offline.cached.ticket.label":
    "O teu bilhete QR — Noite de consultas abertas",
  "offline.cached.ticket.sub": "{date} · Café Beirão · em cache há 3h",
  "offline.cached.map.label": "Mapa de espaços seguros · Lisboa",
  "offline.cached.map.sub": "42 locais · atualizado {when}",
  "offline.cached.crisisChat.label": "Apoio em crise",
  "offline.cached.crisisChat.sub":
    "Linhas de apoio e números de emergência, sem necessidade de sinal",
  "offline.cached.emergency.label": "Contactos de emergência",
  "offline.cached.emergency.sub": "112 · SOS Voz Amiga · Linha de apoio ILGA",
  "offline.status": "À escuta de sinal",
  "offline.retryCta": "Tentar outra vez",
  "offline.retryingCta": "Ainda offline",

  // ── PendingReviewPage.tsx ─────────────────────────────────────────────────
  "pendingReview.kicker": "Pedido de convite · em fila de espera",
  "pendingReview.heading": "Estás em <em>{position}.º</em> lugar na fila.",
  "pendingReview.lead":
    "Abrimos a comunidade em grupos. O teu pedido para <b>{email}</b> está na fila e uma pessoa avalizadora vai revê-lo dentro de <b>~ 3 semanas</b>.",
  "pendingReview.position.title": "A tua posição",
  "pendingReview.position.body":
    "Em {total} na fila · admitimos <b>cerca de {perMonth} por mês</b> · previsão para ti: <b>{eta}</b>",
  "pendingReview.position.etaValue": "final de junho / início de julho de 2026",
  "pendingReview.timeline.step1.title": "Pedido recebido · {date}",
  "pendingReview.timeline.step1.desc":
    "Inscreveste-te · registámos o teu interesse",
  "pendingReview.timeline.step2.title": "À espera de uma pessoa avalizadora",
  "pendingReview.timeline.step2.desc":
    "Uma pessoa da comunidade está a comparar os teus interesses · isto demora 2 a 3 semanas",
  "pendingReview.timeline.step3.title": "Chamada breve de confirmação · 15 min",
  "pendingReview.timeline.step3.desc":
    "Descontraída e simpática · só para sabermos quem és",
  "pendingReview.timeline.step4.title":
    "Convite enviado · ativa-se no prazo de 14 dias",
  "pendingReview.timeline.step4.desc":
    "Vais receber um email com uma ligação de utilização única",
  "pendingReview.actions.magazineCta": "Ler a revista →",
  "pendingReview.actions.vouchCta": "Pedir um aval a alguém da comunidade",
  "pendingReview.actions.updateInterestsCta": "Atualizar os meus interesses",
  "pendingReview.foot.knowMember":
    "Já conheces alguém que te possa avalizar? <a>Envia-lhe uma ligação de aval num clique</a> — isso adianta-te na fila.",
  "pendingReview.foot.withdraw": "Queres desistir? <a>Escreve à equipa</a>.",

  // ── PwaPromptPage.tsx ─────────────────────────────────────────────────────
  "pwaPrompt.kicker": "Adicionar ao ecrã principal · sem loja de aplicações",
  "pwaPrompt.heading": "Mantém a <em>QueerPulse</em> a um toque de distância.",
  "pwaPrompt.lead":
    "Instala a aplicação web no teu telemóvel em 30 segundos. <em>Igual a uma aplicação normal</em> — mas sem conta de loja de aplicações, sem rastreio, sem revisão. Só um atalho que abre o chat de crise, o teu bilhete e o mapa de espaços seguros num toque.",
  "pwaPrompt.features.quickExit.label": "Saída rápida",
  "pwaPrompt.features.quickExit.detail":
    "· está na barra de navegação · um toque fecha a aplicação",
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
    "A responsabilidade é nossa, não tua. Já fomos notificados automaticamente e estamos a analisar o problema.",
  "serverError.sub.maintenance":
    "Estamos a atualizar a plataforma. Não deve demorar muito. Agradecemos a tua paciência.",
  "serverError.status.maintenance":
    "<strong>Interrupção planeada.</strong> Acompanha em <a>status.queerpulse.pt</a> para atualizações.",
  "serverError.status.error":
    "<strong>A nossa equipa já foi alertada.</strong> Consulta <a>status.queerpulse.pt</a> para atualizações em direto.",
  "serverError.actions.retryCta": "Tentar outra vez",
  "serverError.actions.homeCta": "Ir para a página inicial",
  "serverError.actions.statusCta": "Ver o estado da plataforma",
  "serverError.footer.contact":
    "Se isto continuar a acontecer, <a>contacta-nos</a>.",

  // ── StatusPage.tsx / StatusComponents.tsx / status.data.ts ───────────────
  "status.hero.allOperational": "Todos os sistemas operacionais",
  "status.hero.title": "Estado da <em>plataforma</em>",
  "status.hero.sub": "Atualizado agora mesmo · Atualiza a cada 60 s",
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
  "status.uptime.tooltip.operational": "Operacional — {date}",
  "status.uptime.tooltip.partial": "Indisponibilidade parcial — {date}",
  "status.uptime.tooltip.outage": "Indisponibilidade — {date}",
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
    "Manutenção agendada — atualização da base de dados",
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
  "verificationNeeded.magicLink.intro":
    "Vamos enviar uma ligação de confirmação única para <b>{email}</b>. Abre-a neste dispositivo para confirmares que és tu.",
  "verificationNeeded.magicLink.sendingCta": "A enviar ligação…",
  "verificationNeeded.magicLink.sendCta":
    "Enviar-me uma ligação de confirmação",
  "verificationNeeded.magicLink.sentTitle": "Ligação a caminho",
  "verificationNeeded.magicLink.sentCopy":
    "Toca na ligação que enviámos para <b>{email}</b> e depois volta aqui.",
  "verificationNeeded.magicLink.verifyingCta": "A verificar…",
  "verificationNeeded.magicLink.confirmCta": "Já abri a ligação",
  "verificationNeeded.magicLink.resendCountdown": "Reenviar em {seconds}s",
  "verificationNeeded.magicLink.resendCta": "Reenviar ligação",
  "verificationNeeded.success.title": "És mesmo tu — <em>confirmado.</em>",
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
};
