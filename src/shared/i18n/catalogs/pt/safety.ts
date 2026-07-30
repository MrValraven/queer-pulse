import type { Catalog } from "../../types";

/**
 * Segurança — denúncias, bloqueio, chat de crise, recursos de emergência,
 * guia de denúncia de crimes de ódio, e verificação de espaços seguros. O
 * texto mais crítico da plataforma: precisão e clareza acima de estilo.
 *
 * Notas de âmbito:
 * - `reportReasons.ts` REASON_LABEL_KEYS: o código do motivo enviado ao
 *   servidor é um id estável — nunca a etiqueta traduzida. Só a etiqueta é
 *   localizada.
 * - `safeSpaces.ts` (VERIFIED_SPACES / REMOVED_SPACES) mantém-se como
 *   conteúdo fictício — descrições de espaços, citações de avais de pessoas,
 *   relatos de incidentes — o equivalente, em modo live, a um registo de
 *   espaço/denúncia vindo da API. Só o texto envolvente da página
 *   (safeSpacesPage.data.ts, SafeSpacesPage, SafeSpacesSections,
 *   SafeSpaceCard, SafeSpaceDetailPage, VouchModal) é traduzido.
 * - Nomes fictícios de demonstração (Sofia Rodrigues, Rui) mantêm-se tal como
 *   estão, seguindo a convenção usada nas biografias de pessoas. Onde a cópia
 *   original já genderiza uma personagem fictícia específica (ex.: "her/she"
 *   no fluxo de bloqueio/silêncio), a tradução preserva esse género
 *   gramaticalmente — diferente do caso de "Members" coletivo, que continua
 *   neutro em todo o resto do ficheiro.
 */
export const safety: Catalog = {
  // ── Shared across ReportPage.tsx / HateCrimePage.tsx (HubBackLink label) ─
  "nav.safetyGuideLabel": "Guia de Segurança",

  // ── Quick exit (saída rápida fixa em páginas de segurança sensíveis) ─────
  "quickExit.label": "Saída rápida",
  "quickExit.aria": "Saída rápida — sair desta página agora para um site neutro",

  // ── ReportPage.tsx ─────────────────────────────────────────────────────
  "report.meta.title": "Denunciar uma preocupação à equipa de segurança",
  "report.meta.description":
    "Como denunciar assédio ou uma situação insegura na QueerPulse, o que acontece depois de submeteres uma denúncia, e um registo público de decisões de moderação anteriores.",
  "report.eyebrow": "Segurança e Denúncias",
  "report.hero.title": "A segurança é <em>estrutural.</em>",
  "report.hero.lead":
    "Não é decorativa. Não é uma página no rodapé. A nossa forma de tratar denúncias, o que acontece quando fazes uma, e os princípios que orientam cada decisão que tomamos.",

  "report.how.title": "Como <em>funciona a denúncia</em>",
  "report.how.lead":
    "Fazes uma denúncia. Respondemos no prazo de 24 horas. Isto é exatamente o que acontece entretanto — sem caixa negra, sem garantias vagas.",
  "report.flow.step1.title": "Fazes uma denúncia",
  "report.flow.step1.desc":
    "Através do botão em qualquer perfil, mensagem ou publicação do fórum — ou diretamente por esta página. Podes denunciar de forma anónima, se precisares.",
  "report.flow.step2.title": "Confirmação imediata",
  "report.flow.step2.desc":
    "Recebes uma confirmação no prazo de 1 hora. Uma pessoa real fica responsável pela tua denúncia — não uma fila automática.",
  "report.flow.step3.title": "Revisão no prazo de 24 horas",
  "report.flow.step3.desc":
    "Analisamos as provas, o contexto e o histórico. Em casos graves, o acesso da pessoa denunciada é suspenso temporariamente durante a análise.",
  "report.flow.step4.title": "Decisão e ação",
  "report.flow.step4.desc":
    "Resultados possíveis: aviso, suspensão temporária, remoção permanente. Comunicamos-te o resultado — com a justificação.",

  "report.form.title": "Fazer uma <em>denúncia.</em>",
  "report.form.lead":
    "Usa este formulário para preocupações de segurança, assédio, abuso, ou qualquer situação que te tenha feito sentir insegure. Todas as denúncias são tratadas com total seriedade. Não existe um limiar mínimo para o que justifica uma denúncia.",
  "report.form.categoryLabel": "O que estás a denunciar?",
  "report.form.categoryPlaceholder": "Seleciona uma categoria",
  "report.category.harassment": "Assédio ou ameaças",
  "report.category.unwantedContact": "Contacto ou mensagens indesejados",
  "report.category.impersonation": "Falsa identidade ou personificação",
  "report.category.discrimination": "Discriminação",
  "report.category.venueSafety": "Comportamento inseguro num convívio",
  "report.category.other": "Outra coisa",
  "report.form.involvedLabel": "Pessoa ou conteúdo envolvido (opcional)",
  "report.form.involvedPlaceholder": "Nome de utilizador ou URL",
  "report.form.detailLabel": "O que aconteceu?",
  "report.form.detailPlaceholder":
    "Conta-nos o que aconteceu, com o detalhe com que te sintas confortável a partilhar. Não há respostas erradas.",
  "report.form.emailLabel":
    "O teu email de contacto (opcional — para acompanhamento)",
  "report.form.emailPlaceholder": "teu@email.com",
  "report.form.submitting": "A submeter…",
  "report.form.submitCta": "Submeter denúncia",
  "report.form.fineprint":
    "Aceitamos denúncias anónimas. Se deixares um email, entraremos em contacto diretamente contigo.",

  "report.principles.eyebrow": "Os nossos princípios",
  "report.principles.believeReporter.strong":
    "Acreditamos primeiro em quem denuncia.",
  "report.principles.believeReporter.rest":
    "A nossa postura padrão é levar as denúncias a sério e investigar — não exigir que quem denuncia se prove.",
  "report.principles.noVagueWarnings.strong": "Sem avisos vagos.",
  "report.principles.noVagueWarnings.rest":
    "Se alguém causou dano, dizemos-lhe especificamente o que fez e que mudanças são exigidas.",
  "report.principles.transparency.strong": "Transparência acima do conforto.",
  "report.principles.transparency.rest":
    "Publicamos dados agregados de moderação todos os trimestres, para que a comunidade veja como trabalhamos.",
  "report.principles.noPermanentDecisions.strong":
    "Sem decisões privadas permanentes.",
  "report.principles.noPermanentDecisions.rest":
    "As pessoas podem recorrer das decisões. Os recursos são revistos por uma pessoa moderadora diferente.",
  "report.principles.communityOwns.strong":
    "Este espaço pertence à comunidade.",
  "report.principles.communityOwns.rest":
    "No fundo, respondemos perante as pessoas, não perante políticas abstratas.",

  "report.transparency.title": "Transparência <em>na moderação</em>",
  "report.transparency.lead":
    "Publicamos um relatório trimestral de moderação para que a comunidade veja como as decisões são tomadas. É assim que se parece a responsabilização.",
  "report.modLog.title":
    "Relatório de moderação <em>do 1.º trimestre de 2026</em>",
  "report.modLog.meta":
    "Publicado em abril de 2026 · Cobre janeiro – março de 2026 · Todos os dados são agregados e anonimizados.",
  "report.modLog.stat.received": "denúncias recebidas",
  "report.modLog.stat.resolved": "resolvidas em 24h",
  "report.modLog.stat.removed": "pessoas removidas",
  "report.modLog.stat.appeals": "recursos recebidos",
  "report.modLog.stat.reversed": "decisões revertidas em recurso",
  "report.modLog.viewReportCta": "Ver relatório completo →",

  "report.toast.chooseCategory": "Escolhe primeiro o que estás a denunciar.",
  "report.toast.received":
    "Denúncia recebida — entraremos em contacto no prazo de 24 horas.",
  "report.toast.submitError":
    "Não foi possível enviar a tua denúncia — não chegou até nós. Verifica a ligação e tenta novamente.",

  // ── reportReasons.ts — SAFETY-CRITICAL: stable server ids, only the label
  // is translated. Never let a translated label leak into the stored value.
  "reason.outing": "Outing / partilhar identidade privada sem consentimento",
  "reason.doxxing": "Partilhar dados pessoais ou de localização (doxxing)",
  "reason.harassment": "Assédio dirigido ou ameaças",
  "reason.hateSpeech": "Discurso de ódio ou insulto discriminatório",
  "reason.unwantedContact": "Contacto indesejado depois de pedido para parar",
  "reason.impersonation": "Falsa identidade ou personificação",
  "reason.discrimination": "Discriminação ou uso do género errado",
  "reason.spam": "Spam ou autopromoção",
  "reason.offTopic": "Fora do tópico ou perturbador",
  "reason.venueSafety": "Um incidente de assédio ou segurança no espaço",
  "reason.venueStaff": "A equipa não interveio quando foi necessário",
  "reason.venueAccessibility": "Um problema de acessibilidade",
  "reason.housingUnsafe":
    "Alojamento inseguro, discriminatório, ou com informação enganosa",
  "reason.housingScam": "Burla ou anúncio falso",
  "reason.other": "Outra coisa — explicada em detalhe",

  // ── FlagModal.tsx ──────────────────────────────────────────────────────
  "flag.modal.ariaLabel": "Sinalizar este emblema",
  "flag.modal.closeAriaLabel": "Fechar",
  "flag.success.title": "Sinalização <em>recebida.</em>",
  "flag.success.body":
    "Obrigade. Uma pessoa moderadora vai ler a tua denúncia. <b>Três sinalizações independentes desencadeiam uma revisão imediata e a suspensão temporária do emblema</b> — a tua denúncia conta para isso. Podemos contactar-te para mais detalhe, mas nunca o espaço.",
  "flag.success.doneCta": "Concluído",
  "flag.error":
    "Não foi possível enviar essa sinalização — não chegou até nós. Verifica a ligação e tenta novamente.",
  "flag.form.eyebrow": "Sinalizar um espaço seguro",
  "flag.form.title": "O que aconteceu em <em>{spaceName}?</em>",
  "flag.form.lead":
    "As sinalizações são como sabemos quando um espaço falha. Conta-nos o que viste — detalhes ajudam o painel de revisão. O teu nome nunca é partilhado com o espaço.",
  "flag.form.concernLabel": "Qual é a preocupação?",
  "flag.form.detailLabel": "Conta-nos o que aconteceu",
  "flag.form.detailPlaceholder":
    "Quando aconteceu, o que viste ou viveste, e quem esteve envolvide? Sê tão específique quanto te sintas confortável.",
  "flag.form.charsRemaining_one": "Falta {count} carácter para submeter",
  "flag.form.charsRemaining_other": "Faltam {count} carateres para submeter",
  "flag.form.charsCount_one": "{count} carácter",
  "flag.form.charsCount_other": "{count} carateres",
  "flag.form.confidentialNote":
    "As denúncias são confidenciais. As pessoas moderadoras veem o teu nome; o espaço nunca o vê. Em caso de emergência, liga primeiro para o <strong>112</strong>.",
  "flag.form.cancelCta": "Cancelar",
  "flag.form.submitting": "A submeter…",
  "flag.form.submitCta": "Submeter sinalização",
  "flag.reasonFallback": "preocupação",

  // ── BlockMutePage.tsx / BlockMuteScreens.tsx / blockMute.data.ts ──────
  "blockMute.meta.title": "Silenciar ou bloquear alguém na QueerPulse",
  "blockMute.meta.description":
    "Como silenciar ou bloquear outra pessoa na QueerPulse — o que cada opção esconde, se a pessoa é notificada, e como desfazer mais tarde.",
  "common.no": "Não",
  "blockMute.choose.title": "Controlos de <em>privacidade</em>",
  "blockMute.choose.sub":
    "Estas ações são privadas. {name} não será notificade.",
  "blockMute.choose.muteTitle": "Silenciar {name}",
  "blockMute.choose.muteDesc":
    "Não vais ver as publicações nem a atividade desta pessoa. Não vai saber que foi silenciada. Podes dessilenciar a qualquer momento.",
  "blockMute.choose.muteScopeLabel": "O que silenciar",
  "blockMute.choose.postsUpdates": "Publicações e atualizações",
  "blockMute.choose.commentsReplies": "Comentários e respostas",
  "blockMute.choose.gatheringInvites": "Convites para convívios",
  "blockMute.choose.durationLabel": "Duração",
  "blockMute.duration.untilUnmute": "Até eu dessilenciar",
  "blockMute.duration.sevenDays": "7 dias",
  "blockMute.duration.thirtyDays": "30 dias",
  "blockMute.choose.blockTitle": "Bloquear {name}",
  "blockMute.choose.blockDesc":
    "Esta pessoa não pode ver o teu perfil, enviar-te mensagem, nem ver-te na pesquisa. Não é possível estabelecer ligação entre as duas contas.",
  "blockMute.choose.blockNote":
    "<strong>Nota:</strong> Se partilharem comunidades, {name} vai continuar a aparecer nas listas de pessoas — mas não vai conseguir interagir diretamente contigo.",
  "blockMute.choose.continueCta": "Continuar",
  "blockMute.choose.cancelCta": "Cancelar",
  "blockMute.choose.liveDurationNote":
    "Um silenciamento dura até o desfazeres — os silenciamentos temporizados são uma pré-visualização só de demonstração.",

  "blockMute.muted.title": "<em>Silenciaste</em> {name}",
  "blockMute.muted.sub":
    "As publicações e respostas desta pessoa estão agora escondidas do teu feed. Não fica a saber.",
  "blockMute.muted.summaryLabel": "O que está silenciado",
  "blockMute.muted.postsComments": "Publicações e comentários",
  "blockMute.muted.durationLabel": "Duração",
  "blockMute.muted.notifiedLabel": "{name} foi notificade?",
  "blockMute.muted.manageLink": "Gerir pessoas silenciadas →",
  "blockMute.muted.undoCta": "Desfazer — dessilenciar {name}",

  "blockMute.blocked.title": "<em>Bloqueaste</em> {name}",
  "blockMute.blocked.sub":
    "{name} já não pode ver o teu perfil, enviar-te mensagem, ou encontrar-te na pesquisa.",
  "blockMute.blocked.visibleLabel": "Perfil visível para esta pessoa",
  "blockMute.blocked.messageLabel": "Pode enviar-te mensagem",
  "blockMute.blocked.notifiedLabel": "{name} foi notificade?",
  "blockMute.blocked.manageLink": "Gerir pessoas bloqueadas →",
  "blockMute.blocked.undoCta": "Desfazer — desbloquear {name}",
  "blockMute.blocked.reportNote":
    "Precisas de denunciar um comportamento prejudicial? <link>Fazer uma denúncia →</link>",

  // ── ProfileSafetyMenu.tsx / BlockMemberModal.tsx (bloquear/silenciar a partir de um perfil) ──
  "profileMenu.ariaLabel": "Ações de segurança para {name}",
  "profileMenu.mute": "Silenciar {name}",
  "profileMenu.unmute": "Dessilenciar {name}",
  "profileMenu.block": "Bloquear {name}",
  "profileMenu.unblock": "Desbloquear {name}",
  "profileMenu.mutedToast":
    "Silenciaste {name}. As publicações desta pessoa ficam escondidas de ti.",
  "profileMenu.unmutedToast": "Dessilenciaste {name}.",
  "profileMenu.unblockedToast": "Desbloqueaste {name}.",
  "profileMenu.blockedToast": "Bloqueaste {name}.",
  "profileMenu.blockedReportedToast":
    "Bloqueaste {name} e enviaste uma denúncia à equipa de moderação.",
  "blockModal.title": "Bloquear {name}?",
  "blockModal.body":
    "Bloquear corta qualquer ligação entre vocês. {name} deixa de poder ver o teu perfil, enviar-te mensagem ou encontrar-te na pesquisa — e nenhum de vocês consegue estabelecer ligação com o outro. Podes desbloquear mais tarde.",
  "blockModal.reportCheckbox": "Denunciar também {name} à equipa de moderação",
  "blockModal.reasonLabel": "Motivo (opcional)",
  "blockModal.reasonPlaceholder":
    "Acrescenta qualquer contexto para a equipa de moderação…",
  "blockModal.cancelCta": "Cancelar",
  "blockModal.confirmCta": "Bloquear {name}",

  // ── AppealOutcomePage.tsx ──────────────────────────────────────────────
  "appeal.state.pending": "Pendente",
  "appeal.state.overturned": "Revertida",
  "appeal.state.upheld": "Mantida",
  "appeal.timeline.filed": "Denúncia apresentada",
  "appeal.timeline.submitted": "Recurso submetido",
  "appeal.timeline.decision": "Decisão",

  "appeal.pending.title": "Estamos a <em>analisar</em> o teu recurso",
  "appeal.pending.sub":
    "A nossa equipa de moderação vai analisar o teu caso com cuidado e responder no prazo de 5 dias úteis.",
  "appeal.ref.label": "Referência do recurso",
  "appeal.pending.submittedLabel": "Submetido",
  "appeal.pending.expectedLabel": "Resposta esperada",
  "appeal.pending.info":
    "<strong>Enquanto o teu recurso está em análise:</strong> a decisão original mantém-se em vigor, mas nenhuma ação adicional será tomada. Vais ser notificade por email assim que uma decisão for tomada.",
  "appeal.pending.govLink": "Como funciona a moderação →",

  "appeal.overturned.title": "O teu recurso foi <em>bem-sucedido</em>",
  "appeal.overturned.sub":
    "Depois de analisar o teu caso, revertemos a decisão original. Lamentamos o incómodo.",
  "appeal.decisionLabel": "Decisão",
  "appeal.overturned.decisionValue": "Revertida",
  "appeal.decidedOnLabel": "Decidido em",
  "appeal.overturned.info":
    "<strong>O que foi restaurado:</strong> o aviso na tua conta foi removido, e o teu conteúdo está visível de novo. O estado da tua conta não foi afetado.",
  "appeal.overturned.profileCta": "Voltar ao teu perfil",
  "appeal.overturned.guidelinesCta": "Ver as diretrizes da comunidade",

  "appeal.upheld.title": "<em>Analisámos</em> o teu recurso",
  "appeal.upheld.sub":
    "Depois de uma análise cuidada, determinámos que a decisão original foi adequada.",
  "appeal.upheld.outcomeLabel": "Resultado",
  "appeal.upheld.outcomeValue": "A decisão original mantém-se",
  "appeal.upheld.info":
    "<strong>Daqui para a frente:</strong> o aviso na conta mantém-se no teu registo durante 90 dias e não vai afetar a tua capacidade de participar na maioria das atividades da comunidade. Violações repetidas podem resultar em nova análise.",
  "appeal.upheld.contactNote":
    "Se acreditares que isto é um erro, podes contactar diretamente a nossa equipa de Confiança.",
  "appeal.upheld.contactCta": "Enviar mensagem à equipa de Confiança →",

  // ── AppealSubmitPage.tsx ───────────────────────────────────────────────
  "appealSubmit.kicker": "Contestar uma decisão",
  "appealSubmit.heading": "Diz-nos o que <em>correu mal</em>",
  "appealSubmit.lead":
    "Um moderador diferente do que tomou a decisão vai ler isto. Sê específico — o que aconteceu, e porque é que a decisão não te parece justa.",
  "appealSubmit.form.reasonLabel": "O teu recurso",
  "appealSubmit.form.reasonHelper":
    "Quanto mais contexto deres, mais há para reconsiderar. Pelo menos uma frase ou duas.",
  "appealSubmit.form.reasonPlaceholder":
    "Explica-nos o que aconteceu do teu lado…",
  "appealSubmit.form.charCount": "{count} / {max}",
  "appealSubmit.form.submitCta": "Enviar recurso",
  "appealSubmit.form.submitting": "A enviar…",
  "appealSubmit.form.ladderCta": "Ler a escala da comunidade",
  "appealSubmit.notice":
    "<b>Enquanto o teu recurso é analisado,</b> a decisão original mantém-se. Vais ter resposta por email — normalmente dentro de alguns dias.",
  "appealSubmit.foot":
    "Todos os recursos, e como foram decididos, ficam registados no nosso <a>registo de transparência</a>.",
  "appealSubmit.errorFrame": "Não foi possível registar o teu recurso",
  "appealSubmit.success.title": "O teu recurso <em>entrou</em>",
  "appealSubmit.success.sub":
    "Um moderador que não esteve envolvido na decisão original vai analisá-lo. Enviamos-te um email assim que houver um resultado.",
  "appealSubmit.success.filedLabel": "Registado",
  "appealSubmit.success.trackCta": "Acompanhar este recurso",
  "appealSubmit.success.howCta": "Como funciona a moderação",

  // ── HateCrimePage.tsx ──────────────────────────────────────────────────
  "hateCrime.meta.title":
    "Denunciar um crime de ódio em Portugal: guia passo a passo",
  "hateCrime.meta.description":
    "O que conta como crime de ódio em Portugal, como documentá-lo em segurança, a quem denunciar, e onde encontrar apoio jurídico e comunitário depois.",
  "hateCrime.eyebrow": "Guia de denúncia · Portugal",
  "hateCrime.title.line1": "Como denunciar",
  "hateCrime.title.line2": "<em>um crime de ódio.</em>",
  "hateCrime.sub":
    "Passo a passo — desde o momento em que acontece até à denúncia formal, ao apoio da comunidade e ao acompanhamento jurídico. A maioria das pessoas não denuncia porque não sabe como. Este guia remove essa barreira.",
  "hateCrime.important":
    "<strong>A tua segurança vem primeiro.</strong> Se estás em perigo imediato, liga já para o <strong>112</strong>. Este guia é para depois de estares em segurança.",
  "hateCrime.outro.title": "Tens <em>direitos.</em>",
  "hateCrime.outro.sub":
    "A comunidade QueerPulse inclui advogades, profissionais do direito, e pessoas que já passaram por este processo. Não precisas de o percorrer sozinhe.",
  "hateCrime.outro.legalCta": "Recursos jurídicos",

  // ── HateCrimeTabs.tsx — tab bar + sidebar ──────────────────────────────
  "hateCrime.tab.immediate": "Agora mesmo",
  "hateCrime.tab.document": "Documentar",
  "hateCrime.tab.report": "Denunciar formalmente",
  "hateCrime.tab.support": "Obter apoio",
  "hateCrime.tab.law": "Lei portuguesa",

  "hateCrime.sidebar.emergencyTitle": "Emergência e imediato",
  "hateCrime.sidebar.emergencyServices": "Serviços de emergência",
  "hateCrime.sidebar.apav.org": "APAV Apoio à Vítima",
  "hateCrime.sidebar.apav.role": "Confidencial, 24h",
  "hateCrime.sidebar.sosRacismo": "SOS Racismo (também cobre identidade)",
  "hateCrime.sidebar.legalTitle": "Jurídico e defesa de direitos",
  "hateCrime.sidebar.ilga.org": "ILGA Portugal",
  "hateCrime.sidebar.ilga.role":
    "Acompanhamento jurídico gratuito, monitorização de crimes de ódio",
  "hateCrime.sidebar.ilga.anon": "Denúncia anónima",
  "hateCrime.sidebar.provedor.org": "Provedor de Justiça",
  "hateCrime.sidebar.provedor.role":
    "Provedoria de Justiça — se as autoridades não agirem",
  "hateCrime.sidebar.ilgaEurope.org": "ILGA Europe",
  "hateCrime.sidebar.ilgaEurope.role": "Apoio jurídico ao nível da UE",
  "hateCrime.sidebar.onTitle": "Na QueerPulse",
  "hateCrime.sidebar.legalResourcesCta": "Recursos Jurídicos →",
  "hateCrime.sidebar.mentalHealthCta": "Saúde Mental →",
  "hateCrime.sidebar.solidarityCta": "Preços Solidários →",
  "hateCrime.sidebar.reportCta": "Denunciar à QueerPulse →",

  // ── hateCrime.data.tsx — tag chips ─────────────────────────────────────
  "hateCrime.tag.immediate": "Imediato",
  "hateCrime.tag.ifHurt": "Se sofreste dano físico",
  "hateCrime.tag.recommended": "Recomendado",
  "hateCrime.tag.ifApplicable": "Se aplicável",
  "hateCrime.tag.important": "Importante",
  "hateCrime.tag.stronglyRecommended": "Fortemente recomendado",
  "hateCrime.tag.anonOptionAvailable": "Opção anónima disponível",
  "hateCrime.tag.afterDomesticProcess": "Depois do processo nacional",

  // ── hateCrime.data.tsx — "Right now" tab ───────────────────────────────
  "hateCrime.immediate.preamble":
    "Os momentos a seguir a um incidente são desorientadores. Estes passos ajudam-te a proteger-te e a preservar as tuas opções — sem te comprometeres com nada ainda.",
  "hateCrime.immediate.step1.title": "Coloca-te em segurança",
  "hateCrime.immediate.step1.desc":
    "Sai do local se conseguires. Procura um espaço público, uma loja, um café, ou um lugar que conheças. Não te sintas obrigade a confrontar a pessoa agressora ou a esperar por alguém.",
  "hateCrime.immediate.step2.title": "Contacta alguém em quem confies",
  "hateCrime.immediate.step2.desc":
    "Liga ou envia mensagem a um amigue, a um parceire, ou a alguém da comunidade. Não devias estar sozinhe agora. Se não houver ninguém disponível, a linha de apoio à vítima da APAV (116 006) tem atendimento 24 horas.",
  "hateCrime.immediate.step3.title": "Procura assistência médica se precisares",
  "hateCrime.immediate.step3.desc":
    "Se foste agredide fisicamente, vai à urgência do hospital mais próximo. Pede que documentem as tuas lesões — esta documentação é prova, mesmo que não denuncies à polícia.",
  "hateCrime.immediate.step4.title": "Escreve o que aconteceu — agora",
  "hateCrime.immediate.step4.desc":
    "Enquanto está fresco na memória: hora, local, o que foi dito ou feito, descrição da pessoa ou pessoas agressoras, e eventuais testemunhas. Faz isto antes de dormires. A memória degrada-se rapidamente depois de um trauma. Usa as notas do telemóvel, se for mais fácil.",
  "hateCrime.immediate.step5.title": "Preserva qualquer prova",
  "hateCrime.immediate.step5.desc":
    "Capturas de ecrã de mensagens. Fotografias de danos ou lesões. Não laves a roupa usada durante o incidente. Faz uma cópia de segurança do telemóvel se estiverem envolvidas mensagens.",

  // ── hateCrime.data.tsx — "Document it" tab ─────────────────────────────
  "hateCrime.document.preamble":
    "Uma boa documentação dá-te opções. Podes decidir mais tarde se queres denunciar formalmente — mas a prova só vai existir se a recolheres agora.",
  "hateCrime.document.collectHeading": "O que <em>recolher</em>",
  "hateCrime.document.step1.title": "Relato escrito",
  "hateCrime.document.step1.desc":
    "Data, hora, local exato. O que foi dito ou feito, com o máximo de detalhe que conseguires lembrar. A aparência da pessoa agressora e quaisquer características distintivas. Se houve testemunhas e quem eram.",
  "hateCrime.document.step2.title": "Fotografias",
  "hateCrime.document.step2.desc":
    "Lesões (fotografias datadas, de vários ângulos). Danos materiais. O próprio local. Quaisquer grafitis ou materiais deixados para trás. Ativa a geolocalização na câmara do telemóvel antes de as tirares.",
  "hateCrime.document.step3.title": "Prova digital",
  "hateCrime.document.step3.desc":
    "Capturas de ecrã de mensagens, publicações em redes sociais, ou emails — com o URL, o nome de utilizador e a data/hora visíveis. Captura também o perfil, não só a mensagem. Guarda localmente e num serviço de armazenamento na nuvem.",
  "hateCrime.document.step4.title": "Videovigilância (CCTV)",
  "hateCrime.document.step4.desc":
    "Se o incidente aconteceu numa zona comercial, pode haver imagens de videovigilância. Age depressa — a maioria dos sistemas sobrepõe as gravações ao fim de 72 horas. Podes pedir as imagens diretamente ou pedir à polícia que o faça quando denunciares.",
  "hateCrime.document.step5.title": "Informação de testemunhas",
  "hateCrime.document.step5.desc":
    "Se houve testemunhas, pede os contactos delas. Mesmo só um nome e um número de telefone ajuda. Não precisas de pressionar ninguém — só perguntar.",
  "hateCrime.document.keepHeading": "Onde <em>guardar</em>",
  "hateCrime.document.note":
    "Guarda tudo em pelo menos dois lugares — o teu telemóvel e um serviço na nuvem (enviar um email para o teu próprio endereço também funciona). Se contactares a ILGA Portugal ou a APAV, podem ajudar-te a organizar o teu dossiê de provas.",

  // ── hateCrime.data.tsx — "Report formally" tab ─────────────────────────
  "hateCrime.report.preamble":
    "Tens opções. A denúncia formal à polícia é um caminho — mas não é o único. Também podes denunciar de forma anónima através de organizações da sociedade civil, ou optar por não denunciar. A tua escolha é válida de qualquer forma.",
  "hateCrime.report.policeHeading": "Opção 1: <em>PSP / GNR (Polícia)</em>",
  "hateCrime.report.police.step1.title": "Vai à esquadra mais próxima",
  "hateCrime.report.police.step1.desc":
    "Para crimes de ódio em Lisboa, a jurisdição é da PSP (Polícia de Segurança Pública). Podes denunciar pessoalmente ou online em queixaselectronicas.mai.gov.pt para infrações menos graves.",
  "hateCrime.report.police.step2.title":
    "Pede a classificação de crime de ódio",
  "hateCrime.report.police.step2.desc":
    "Declara explicitamente que o crime foi motivado pela tua orientação sexual ou identidade de género. Pede que fique registado como crime de ódio ao abrigo do Artigo 132.º do Código Penal. A polícia pode não o fazer automaticamente.",
  "hateCrime.report.police.step3.title": "Leva acompanhamento",
  "hateCrime.report.police.step3.desc":
    "Tens o direito de levar contigo uma pessoa de apoio. A ILGA Portugal oferece acompanhamento jurídico gratuito para denúncias de crimes de ódio. Contacta-os antes de ires — mesmo 30 minutos de preparação ajudam.",
  "hateCrime.report.ilgaHeading": "Opção 2: <em>ILGA Portugal</em>",
  "hateCrime.report.ilga.step1.title": "Denuncia diretamente à ILGA",
  "hateCrime.report.ilga.step1.desc":
    "A ILGA mantém o seu próprio sistema de monitorização de crimes de ódio (independente da polícia). Denunciar aqui é confidencial e não desencadeia contacto automático com a polícia. A tua denúncia contribui para a defesa de direitos e para os dados recolhidos.",
  "hateCrime.report.ilga.step2.title": "Apoio jurídico e acompanhamento",
  "hateCrime.report.ilga.step2.desc":
    "Se quiseres denunciar à polícia, a ILGA pode disponibilizar uma pessoa voluntária ou da equipa para te acompanhar. Também oferecem orientação jurídica sobre o que esperar do processo e como fazer valer os teus direitos.",
  "hateCrime.report.euHeading": "Opção 3: <em>Mecanismos da UE</em>",
  "hateCrime.report.eu.step1.title": "Provedor de Justiça (Ombudsman)",
  "hateCrime.report.eu.step1.desc":
    "Se acreditares que as autoridades não agiram sobre a tua denúncia, podes apresentar queixa ao Provedor de Justiça, em provedor-jus.pt. Gratuito, independente, e disponível para residentes.",
  "hateCrime.report.eu.step2.title": "Tribunal Europeu dos Direitos Humanos",
  "hateCrime.report.eu.step2.desc":
    "Para casos graves em que todos os recursos internos foram esgotados, é possível recorrer ao TEDH, em Estrasburgo. É um processo longo — a ILGA Europe fornece orientação e, nalguns casos, apoio jurídico.",

  // ── hateCrime.data.tsx — "Get support" tab ─────────────────────────────
  "hateCrime.support.preamble":
    "Denunciar não é a única coisa de que precisas. Ser alvo de ódio é traumático — e esse trauma é real independentemente de o crime poder ser provado.",
  "hateCrime.support.immediateHeading": "Apoio <em>imediato</em>",
  "hateCrime.support.step1.title": "APAV — Apoio à Vítima",
  "hateCrime.support.step1.desc":
    "Apoio gratuito e confidencial para vítimas de crime. Apoio emocional, ajuda prática para navegar no sistema, e informação jurídica. 116 006 — disponível a nível nacional. Apoio online em apav.pt.",
  "hateCrime.support.step2.title": "ILGA Portugal — Apoio da comunidade",
  "hateCrime.support.step2.desc":
    "Para além da ajuda jurídica, a ILGA liga-te a apoio entre pares e aconselhamento. Compreendem as dimensões específicas do crime de ódio LGBTQ+. 213 887 615 · ilga-portugal.pt.",
  "hateCrime.support.step3.title": "Diretório de Saúde Mental da QueerPulse",
  "hateCrime.support.step3.desc":
    "Terapeutas com tarifas em escala progressiva e experiência em trauma e violência baseada em identidade. Não precisas de esperar para te sentires melhor — o apoio precoce faz uma diferença real.",
  "hateCrime.support.directoryCta": "Ver o diretório →",
  "hateCrime.support.longerTermHeading": "A <em>longo prazo</em>",
  "hateCrime.support.step4.title": "Grupos de apoio entre pares",
  "hateCrime.support.step4.desc":
    "A ILGA Portugal organiza grupos mensais de pares para pessoas que sofreram crimes de ódio. Partilhar com outras pessoas que passaram por experiências semelhantes é muitas vezes a coisa mais útil. Pergunta à ILGA pelo calendário atual.",
  "hateCrime.support.step5.title": "Não precisas de processar isto sozinhe",
  "hateCrime.support.step5.desc":
    "O fórum da QueerPulse tem um espaço privado e moderado para pessoas que sofreram discriminação ou violência. Podes partilhar tanto ou tão pouco quanto quiseres.",
  "hateCrime.support.forumCta": "Ir para o fórum →",

  // ── hateCrime.data.tsx — "Portuguese law" tab ──────────────────────────
  "hateCrime.law.preamble":
    "Compreender o que a lei realmente diz ajuda-te a fazer valer os teus direitos — e a saber quando estão a ser violados.",
  "hateCrime.law.def1.h4": "O que é um crime de ódio na lei portuguesa?",
  "hateCrime.law.def1.para1":
    "Ao abrigo do Artigo 132.º do Código Penal, um crime cometido com motivação de ódio — incluindo orientação sexual e identidade de género — constitui uma circunstância agravante. Isto significa que o mesmo ato (agressão, dano, assédio) tem uma pena mais elevada quando se prova que foi motivado por ódio à identidade da vítima.",
  "hateCrime.law.def1.para2":
    "Além disso, a Lei contra a discriminação (Lei n.º 93/2017) proíbe a discriminação com base na orientação sexual e identidade de género no acesso a bens, serviços, habitação e emprego.",
  "hateCrime.law.def2.h4": "O que conta como crime de ódio?",
  "hateCrime.law.def2.para1":
    "Agressão física, ameaças, assédio, intimidação, danos materiais, incitamento ao ódio, e abuso online podem todos ser crimes de ódio quando motivados pela orientação sexual ou identidade de género da vítima. A motivação tem de ser estabelecida — por isso a documentação e a forma como apresentas a tua denúncia importam.",
  "hateCrime.law.def3.h4": "Crimes de ódio online",
  "hateCrime.law.def3.para1":
    "Ameaças e assédio online são crimes em Portugal. Denuncia à plataforma E à polícia. Preserva capturas de ecrã imediatamente — as plataformas eliminam conteúdo denunciado e as pessoas agressoras podem eliminar as suas contas. Também podes denunciar à Autoridade Nacional de Comunicações (ANACOM) em caso de inação persistente da plataforma.",
  "hateCrime.law.def4.h4": "Se a polícia não levar a sério",
  "hateCrime.law.def4.para1":
    "Tens o direito de pedir outro agente. Podes escalar dentro da PSP para uma chefia. Podes contactar a Inspeção-Geral da Administração Interna (IGAI) para apresentar queixa sobre a conduta policial. O acompanhamento da ILGA Portugal ajuda a prevenir esta situação. A tua denúncia não pode ser recusada — tens direito a um comprovativo (número de NUIPC) quando apresentas uma queixa formal.",

  // ── safeSpacesPage.data.ts — CRITERIA / HOW / FILTERS ──────────────────
  "spaces.criteria.genderNeutral.lead": "Casas de banho neutras em género",
  "spaces.criteria.genderNeutral.rest": " disponíveis ou claramente acessíveis",
  "spaces.criteria.staffIntervene.lead": "A equipa intervém",
  "spaces.criteria.staffIntervene.rest":
    " se uma pessoa estiver a ser assediada ou discriminada",
  "spaces.criteria.noIncidents.lead": "Sem incidentes discriminatórios",
  "spaces.criteria.noIncidents.rest": " denunciados nos últimos 12 meses",
  "spaces.criteria.transWelcome.lead": "Pessoas trans e não-bináries",
  "spaces.criteria.transWelcome.rest":
    " sentem-se genuinamente bem-vindas, não apenas toleradas",
  "spaces.criteria.accessible.lead": "Acessível",
  "spaces.criteria.accessible.rest":
    " — ou as limitações de acesso claramente comunicadas",
  "spaces.criteria.reviews.lead": "Mínimo de 3 avaliações independentes",
  "spaces.criteria.reviews.rest": " de pessoas verificadas da QueerPulse",
  "spaces.criteria.annualReview.lead": "Reavaliação anual",
  "spaces.criteria.annualReview.rest": " — o estatuto não dura para sempre",

  "spaces.how.step1.title": "Qualquer pessoa pode nomear",
  "spaces.how.step1.desc":
    "Submete um espaço com uma breve nota sobre porque achas que deve ser verificado. Confirmamos a receção no prazo de 48 horas.",
  "spaces.how.step2.title": "Três visitas independentes",
  "spaces.how.step2.desc":
    "Três pessoas verificadas visitam o espaço de forma independente e submetem avaliações estruturadas de acordo com os critérios. Não sabem as avaliações umas das outras.",
  "spaces.how.step3.title": "O painel de revisão decide",
  "spaces.how.step3.desc":
    "Um pequeno painel de voluntáries lê as avaliações e decide se os critérios são cumpridos. O espaço só sabe o resultado depois da decisão.",
  "spaces.how.step4.title": "Emblema atribuído",
  "spaces.how.step4.desc":
    "Se aprovado, o espaço recebe um emblema físico e uma ficha digital. Pode exibir o emblema na montra — é conquistado, não comprado.",
  "spaces.how.step5.title": "Reavaliação anual",
  "spaces.how.step5.desc":
    "Todas as fichas são reavaliadas todos os anos. Nenhum estatuto é permanente. Mudança de proprietáries, alterações de equipa, ou incidentes denunciados desencadeiam uma revisão antecipada.",
  "spaces.how.step6.title": "Qualquer pessoa pode sinalizar",
  "spaces.how.step6.desc":
    "Se algo mudar — um incidente, uma mudança de ambiente — qualquer pessoa pode sinalizar a ficha. Três sinalizações desencadeiam uma revisão imediata e a suspensão temporária do emblema.",

  "spaces.filter.all": "Todos os espaços",
  "spaces.filter.bar": "Bares",
  "spaces.filter.club": "Clubes",
  "spaces.filter.cafe": "Cafés",
  "spaces.filter.health": "Saúde",
  "spaces.filter.services": "Serviços",
  "spaces.filter.arts": "Artes",

  // ── SafeSpacesPage.tsx ─────────────────────────────────────────────────
  "spaces.meta.title": "Espaços seguros LGBTQ+ verificados em Lisboa",
  "spaces.meta.description":
    "Um diretório de espaços em Lisboa avaliado pela comunidade e verificado como genuinamente seguro para pessoas LGBTQ+ — não autodeclarado — com avaliações, um emblema de verificação, e uma forma de sinalizar ou nomear um espaço.",
  "spaces.hero.category": "Verificado pela comunidade",
  "spaces.hero.title": "Espaços que são realmente <em>seguros.</em>",
  "spaces.hero.lead":
    "Não é autodeclarado. Não é um autocolante arco-íris na montra. Todos os espaços nesta lista foram visitados e avaliados por várias pessoas da comunidade — e podem perder o estatuto se as coisas mudarem.",
  "spaces.hero.stat.verified": "espaços verificados em Lisboa",
  "spaces.hero.stat.reviews": "avaliações submetidas por pessoas",
  "spaces.hero.stat.removed": "espaços sinalizados e removidos este ano",
  "spaces.dir.title": "Espaços <em>verificados.</em>",
  "spaces.dir.updated":
    "Última atualização em junho de 2025 · Mantido pela comunidade",
  "spaces.dir.nominateCta": "+ Nomear um espaço",
  "spaces.dir.filterAria": "Filtrar espaços por categoria",
  "spaces.dir.browseLead":
    "Todos os espaços verificados estão agora no diretório local, filtrados apenas para os que conquistaram o emblema.",
  "spaces.dir.browseCta": "Ver espaços verificados",
  "spaces.empty.title": "Ainda não há espaços verificados nesta categoria",
  "spaces.empty.description":
    "A lista cresce à medida que as pessoas visitam e avaliam espaços. Experimenta outra categoria — ou nomeia um lugar em que já confies, e nós tratamos de o fazer avaliar.",
  "spaces.empty.clearCta": "Limpar filtros",
  "spaces.empty.nominateCta": "Nomear um espaço",
  "spaces.outro.title": "A segurança é <em>coletiva.</em>",
  "spaces.outro.sub":
    "Cada avaliação, cada sinalização, cada nomeação torna esta lista mais útil para todas as pessoas. Só funciona porque a comunidade a mantém.",
  "spaces.outro.safetyCta": "Segurança e denúncias",
  "spaces.outro.soberCta": "Sóbrie e social",

  // ── SafeSpacesSections.tsx ─────────────────────────────────────────────
  "spaces.badge.visualNameLine1": "Comunidade",
  "spaces.badge.visualNameLine2": "Verificado",
  "spaces.badge.caption":
    "O emblema que os espaços podem exibir — conquistado, não comprado",
  "spaces.badge.title": 'O que <em>"verificado"</em> realmente significa.',
  "spaces.badge.body":
    "Qualquer espaço pode pôr uma bandeira arco-íris na montra durante o Orgulho. A verificação significa outra coisa — significa que pessoas da comunidade estiveram lá, avaliaram-no segundo um conjunto claro de critérios, e concordaram que cumpre o padrão. E pode ser revogada.",
  "spaces.how.title": "Como <em>funciona a verificação.</em>",
  "spaces.removed.title": "Quando um espaço <em>perde</em> o emblema.",
  "spaces.removed.lead":
    "A verificação pode ser revogada — e é. Uma ficha não é uma recompensa que o espaço guarda para sempre; é um padrão que tem de continuar a cumprir. Quando deixa de o cumprir, dizemo-lo, e dizemos porquê. Removemos {count} espaços este ano.",
  "spaces.removed.step1":
    "<span>3 sinalizações</span> suspendem o emblema de imediato, até revisão.",
  "spaces.removed.step2":
    "<span>Revisão do painel</span> lê cada denúncia à luz dos critérios.",
  "spaces.removed.step3":
    "<span>Removido</span> se os critérios falham ou os proprietáries não colaboram.",
  "spaces.removed.step4":
    "<span>Motivo público</span> — toda a remoção é registada abertamente, nunca em silêncio.",
  "spaces.removed.card.badge": "Removido",
  "spaces.removed.card.whyLink": "Porque foi removido →",
  "spaces.nominate.title": "Nomear um <em>espaço.</em>",
  "spaces.nominate.lead":
    "Encontraste um lugar que realmente parece seguro. Conta-nos sobre ele. Nós tratamos do resto.",
  "spaces.nominate.flagNote":
    "Reparaste que um espaço verificado deixou de estar à altura? Denuncia-o a partir da ficha no diretório local, ou contacta-nos diretamente — de qualquer forma, será avaliado.",
  "spaces.nominate.namePlaceholder": "Nome do espaço",
  "spaces.nominate.addressPlaceholder": "Morada ou bairro",
  "spaces.nominate.typeSelect.placeholder": "Tipo de espaço",
  "spaces.nominate.typeSelect.bar": "Bar",
  "spaces.nominate.typeSelect.club": "Clube",
  "spaces.nominate.typeSelect.cafe": "Café",
  "spaces.nominate.typeSelect.healthcare": "Saúde",
  "spaces.nominate.typeSelect.services": "Serviços",
  "spaces.nominate.typeSelect.arts": "Espaço de artes",
  "spaces.nominate.typeSelect.gym": "Ginásio / fitness",
  "spaces.nominate.typeSelect.other": "Outro",
  "spaces.nominate.reasonPlaceholder":
    "Porque achas que este espaço deve ser verificado? Experiências específicas ajudam.",
  "spaces.nominate.submitCta": "Submeter nomeação",
  "spaces.nominate.thanks.title":
    "Obrigade. Já estamos a <em>tratar disso.</em>",
  "spaces.nominate.thanks.textNamed":
    "A tua nomeação para <strong>{name}</strong> foi recebida. A comunidade é a razão por que esta lista tem algum significado — contribuir para ela é genuinamente um presente.",
  "spaces.nominate.thanks.textPlain":
    "A tua nomeação foi recebida. A comunidade é a razão por que esta lista tem algum significado — contribuir para ela é genuinamente um presente.",
  "spaces.nominate.thanks.subInfo":
    "Aqui está o que acontece a seguir: confirmamos a receção de todas as nomeações no prazo de <strong>48 horas</strong>. Depois, três pessoas verificadas visitam de forma independente e avaliam-no segundo os critérios, antes de um painel de voluntáries decidir. Vamos manter-te informade.",
  "spaces.nominate.anotherCta": "Nomear outro espaço",
  "spaces.nominate.comingSoon.badge": "Brevemente",
  "spaces.nominate.comingSoon.title": "As nomeações estão <em>a chegar em breve.</em>",
  "spaces.nominate.comingSoon.body":
    "Ainda estamos a construir o processo de revisão por trás das nomeações de espaços. Ative a plataforma de demonstração para pré-visualizar o fluxo completo, ou volte em breve.",

  // ── SafeSpaceCard.tsx ──────────────────────────────────────────────────
  "spaces.card.verifiedBadge": "Verificado",
  "spaces.card.flagCta": "Sinalizar",

  // ── SafeSpaceDetailPage.tsx ────────────────────────────────────────────
  "spaces.detail.backLink": "← Espaços seguros",
  "spaces.detail.trust.title": "Espaço seguro verificado · Nível {tier}",
  "spaces.detail.trust.titleNoTier": "Espaço seguro verificado",
  "spaces.detail.trust.body":
    "<strong>Este espaço cumpre os critérios de Espaços Seguros</strong> e foi visitado por pessoas moderadoras da QueerPulse nos últimos 12 meses. Última reverificação em <strong>{date}</strong> · {verifier}.",
  "spaces.detail.relyTitle": "Com o que podes contar, <em>aqui</em>",
  "spaces.detail.relySub":
    "Todos os espaços verificados comprometem-se com isto. Verificamos duas vezes por ano.",
  "spaces.detail.vouchedTitle_one": "Avalizado por <em>{count} pessoa</em>",
  "spaces.detail.vouchedTitle_other": "Avalizado por <em>{count} pessoas</em>",
  "spaces.detail.vouchedSub":
    "Avaliações de segurança independentes de pessoas verificadas.",
  "spaces.detail.addVouchCta": "Adicionar a tua →",
  "spaces.detail.incidentTitle": "Se algo acontecer <em>aqui</em>",
  "spaces.detail.dangerTitle": "Estás em perigo imediato",
  "spaces.detail.dangerBody":
    "Diz a qualquer pessoa da equipa que precisas de ajuda para sair — os espaços verificados acompanham-te até à saída, sem perguntas. Se conseguires, liga também para o <strong>112</strong>.",
  "spaces.detail.emergencyGuideCta": "Guia de emergência →",
  "spaces.detail.offTitle": "Algo pareceu estranho (não urgente)",
  "spaces.detail.offBody":
    "Até as coisas pequenas importam — é assim que sabemos quando um espaço começa a falhar. Faz uma denúncia discreta; as pessoas moderadoras leem todas, e o espaço é informado sem o teu nome associado.",
  "spaces.detail.quietReportCta": "Fazer uma denúncia discreta →",
  "spaces.detail.whereTitle": "Onde",
  "spaces.detail.backAllCta": "Voltar a todos os espaços",
  "spaces.detail.glanceTitle": "Num relance",
  "spaces.detail.shareTitle": "Se um amigue precisar de um lugar",
  "spaces.detail.shareBody":
    "Envia-lhe exatamente esta página. Tudo aqui — as promessas, os avais, as saídas — é aquilo com que pode contar.",
  "spaces.detail.copyLinkCta": "Copiar link para partilhar",
  "spaces.detail.linkCopiedToast": "Link copiado",

  "spaces.detail.removedEyebrow":
    "Removido dos espaços seguros · {type} · {hood}",
  "spaces.detail.removedMeta.removed": "Removido",
  "spaces.detail.removedMeta.listedSince": "Listado desde",
  "spaces.detail.removedMeta.flags": "Sinalizações de pessoas",
  "spaces.detail.whyRemovedTitle": "Porque foi <em>removido</em>",
  "spaces.detail.howHappenedTitle": "Como <em>aconteceu</em>",
  "spaces.detail.howHappenedSub":
    "Toda a remoção segue os mesmos passos, à vista de todos.",
  "spaces.detail.whatNowTitle": "O que isto significa agora",
  "spaces.detail.hadExperienceTitle": "Tiveste uma experiência aqui?",
  "spaces.detail.hadExperienceBody":
    "O registo mantém-se aberto. Se algo te aconteceu aqui, contar-nos continua a ajudar — informa qualquer futura reavaliação.",
  "spaces.detail.fileReportCta": "Fazer uma denúncia →",
  "spaces.detail.lookingForTitle": "À procura de um lugar seguro?",
  "spaces.detail.lookingForBody":
    "Este espaço foi retirado da lista, mas há mais de {count} espaços verificados por toda a Lisboa que não foram. Encontra um perto de ti.",
  "spaces.detail.seeVerifiedCta": "Ver espaços verificados →",

  // ── VouchModal.tsx ─────────────────────────────────────────────────────
  "vouchModal.ariaLabel": "Avalizar este espaço",
  "vouchModal.closeAriaLabel": "Fechar",
  "vouchModal.success.title": "O teu aval foi <em>registado.</em>",
  "vouchModal.success.body":
    "Obrigade por apoiares <strong>{spaceName}</strong>. Os avais das pessoas são como as outras sabem que um espaço é seguro antes de lá entrarem — o teu vai aparecer assim que uma pessoa moderadora o confirmar.",
  "vouchModal.success.doneCta": "Concluído",
  "vouchModal.form.eyebrow": "Adiciona o teu aval",
  "vouchModal.form.title": "Apoia <em>{spaceName}</em>",
  "vouchModal.form.lead":
    "Um aval é uma nota curta e honesta sobre porque este espaço te parece seguro. Detalhes ajudam outras pessoas a confiar nele.",
  "vouchModal.form.relationshipLabel": "Como conheces este espaço?",
  "vouchModal.relationship.regular": "Venho aqui regularmente",
  "vouchModal.relationship.onceOrTwice": "Já vim uma ou duas vezes",
  "vouchModal.relationship.workOrVolunteer": "Trabalho ou sou voluntárie aqui",
  "vouchModal.relationship.withFriend": "Vim com um amigue que precisava",
  "vouchModal.form.noteLabel": "A tua nota",
  "vouchModal.form.notePlaceholder":
    "O que faz este espaço parecer-te seguro? Equipa, ambiente, acessibilidade, um momento que marcou…",
  "vouchModal.form.charsRemaining_one": "Falta {count} carácter para submeter",
  "vouchModal.form.charsRemaining_other":
    "Faltam {count} carateres para submeter",
  "vouchModal.form.charsCount_one": "{count} carácter",
  "vouchModal.form.charsCount_other": "{count} carateres",
  "vouchModal.form.cancelCta": "Cancelar",
  "vouchModal.form.submitting": "A submeter…",
  "vouchModal.form.submitCta": "Adicionar o meu aval",
};
