import type { Catalog } from "../../types";

/**
 * Painel de administração/moderação (`/admin/*`, `/mod/:slug`). Apenas
 * interface — cabeçalhos de tabela, filtros, botões, etiquetas de
 * estado/enumeração, estados vazios, brindes de confirmação, aria-labels. O
 * *conteúdo* das filas que este painel modera (títulos de denúncias, pré-
 * visualizações, conversas, argumentos de recursos, narrativas do registo de
 * auditoria, nomes de pessoas/moderação, descrições de comunidades) simula
 * texto vindo da API em modo live e fica deliberadamente em inglês nos
 * ficheiros `*.data.ts` colocalizados — ver docs/i18n/extraction-brief.md §1.
 *
 * "Members"/"moderator" seguem o glossário: *pessoas* (nunca *Membros*) e
 * *pessoa(s) moderadora(s)* (padrão já usado em pt/members.ts e
 * pt/economy.ts) — o substantivo "pessoa" carrega a concordância feminina
 * gramatical sem genderizar quem de facto ocupa o papel.
 */
export const admin: Catalog = {
  // ── Atribuição de fila + relógio de espera (OPS-04) ───────────────────────
  // Partilhado por todas as filas da equipa: pedidos de convite, pedidos de
  // verificação, formulários e candidaturas de parceria. A fila de moderação
  // mantém a redação própria em `moderation.*`, anterior a estas chaves.
  "queueClock.overdue": "Fora do prazo",
  "queueClock.overdueBy": "Fora do prazo há {age}",
  "queueAssignment.unassigned": "Ainda ninguém ficou com isto",
  "queueAssignment.assignedToYou": "Ficaste com isto",
  "queueAssignment.assignedTo": "{name} ficou com isto",
  "queueAssignment.someone": "Outra pessoa da equipa",
  "queueAssignment.claimCta": "Ficar com isto",
  "queueAssignment.releaseCta": "Largar",
  "queueAssignment.claimAria": "Ficar com {row}",
  "queueAssignment.releaseAria": "Largar {row}",
  "queueAssignment.errorToast": "Não foi possível guardar. Tenta outra vez.",
  "queueAssignment.demoYou": "Tu",
  "queueAssignment.filterLabel": "Mostrar",
  "queueAssignment.filter.all": "Tudo",
  "queueAssignment.filter.mine": "Atribuído a mim",
  "queueAssignment.filter.unassigned": "Sem responsável",

  // ── Consola de verificação de identidade ──────────────────────────────────
  "verifications.eyebrow": "Confiança e segurança",
  "verifications.title": "Verificação de <em>identidade</em>",
  "verifications.sub":
    "Rever e ajustar o nível de verificação das pessoas após uma revisão manual.",
  "verifications.honesty":
    "Nunca guardamos documentos de identidade nem dados biométricos: um parceiro externo faz a verificação e só devolve um passou ou não passou. Estes registos guardam um nível e a sua origem, nada mais.",
  "verifications.via": "via {method} · {provider}",
  "verifications.meta.unknown": "sem registo",
  "verifications.setLevelLabel": "Definir nível de verificação",
  "verifications.applyCta": "Aplicar",
  "verifications.unknownMember": "Pessoa desconhecida",
  "verifications.level.none": "Nenhum",
  "verifications.level.email": "Email",
  "verifications.level.phone": "Telefone",
  "verifications.level.id_verified": "Identidade verificada",
  "verifications.toast.updated": "Nível de verificação atualizado.",
  "verifications.toast.error": "Não foi possível atualizar essa verificação",
  "verifications.empty": "Ainda não há registos de verificação.",
  "verifications.tabs.all": "Todos",
  "verifications.reviewCta": "Rever",
  "verifications.loadMore": "Carregar mais",
  "verifications.loadingMore": "A carregar mais…",
  "verifications.search.placeholder": "Procurar por nome",
  "verifications.search.ariaLabel": "Procurar pessoas por nome",
  "verifications.sort.label": "Ordenar",
  "verifications.sort.recent": "Atualizado recentemente",
  "verifications.sort.oldest": "Atualizado há mais tempo",
  "verifications.sort.level": "Nível mais alto",

  // ── Gaveta de detalhe da verificação (Tarefa 9) ────────────────────────
  "verifications.drawer.label": "Detalhe de verificação de {name}",
  "verifications.drawer.provenanceLoading": "A verificar histórico…",
  "verifications.drawer.provenanceLabel": "Proveniência",
  "verifications.drawer.provenanceNone": "Ainda não verificado",
  "verifications.drawer.provenanceEarned": "Obtido pela própria pessoa",
  "verifications.drawer.provenanceGranted": "Concedido por {actor}",
  "verifications.drawer.historyHeading": "Histórico de auditoria",
  "verifications.drawer.historyEmpty": "Ainda não há histórico.",
  "verifications.drawer.historySystemActor": "Sistema",
  "verifications.drawer.historyAction.submitted": "Submetido",
  "verifications.drawer.historyAction.approved": "Aprovado",
  "verifications.drawer.historyAction.rejected": "Rejeitado",
  "verifications.drawer.historyAction.overridden": "Substituído manualmente",
  "verifications.drawer.historyAction.downgraded": "Nível reduzido",
  "verifications.drawer.historyAction.appealed": "Recurso apresentado",
  "verifications.drawer.historyAction.withdrawn": "Retirado",
  "verifications.drawer.signalsHeading": "Sinais",
  "verifications.drawer.signalsNote":
    "Os sinais chegam numa atualização futura.",
  "verifications.drawer.reasonLabel": "Motivo",
  "verifications.drawer.reasonPlaceholder": "Porque está o nível a mudar?",
  "verifications.drawer.reasonRequiredHint":
    "É necessário um motivo para reduzir o nível.",
  "verifications.drawer.liveOnlyTitle":
    "Aplicar uma substituição precisa da API em direto. Experimente fora do modo demonstração.",
  "verifications.drawer.applying": "A aplicar…",

  // ── Segmento de fila de revisão + gaveta de pedido (Tarefa 9) ──────────
  "verifications.segment.ariaLabel": "Vista do fluxo de verificação",
  "verifications.segment.reviewQueue": "Fila de revisão",
  "verifications.segment.directOverride": "Substituição direta",

  "verifications.requests.tabs.pending": "Pendentes",
  "verifications.requests.tabs.in_review": "Em revisão",
  "verifications.requests.tabs.approved": "Aprovados",
  "verifications.requests.tabs.rejected": "Rejeitados",
  "verifications.requests.tabs.appealing": "Recursos",
  "verifications.requests.tabs.all": "Todos",

  "verifications.requests.status.pending": "Pendente",
  "verifications.requests.status.in_review": "Em revisão",
  "verifications.requests.status.approved": "Aprovado",
  "verifications.requests.status.rejected": "Rejeitado",
  "verifications.requests.status.appealing": "Em recurso",
  "verifications.requests.status.withdrawn": "Retirado",

  "verifications.requests.appealChip": "Recurso",
  "verifications.requests.duplicateChip": "Duplicado",
  "verifications.requests.duplicateChipTitle":
    "Este pedido partilha uma impressão digital de verificação com outra conta.",
  "verifications.requests.submittedAt": "Submetido {when}",
  "verifications.requests.empty": "Ainda não há pedidos nesta vista.",
  "verifications.requests.search.placeholder": "Procurar por nome",
  "verifications.requests.search.ariaLabel":
    "Procurar pedidos pelo nome da pessoa",
  "verifications.requests.sort.recent": "Submetidos mais recentemente",
  "verifications.requests.sort.oldest": "Submetidos há mais tempo",

  "verifications.requests.drawer.label": "Revisão do pedido de {name}",
  "verifications.requests.drawer.contextHeading": "O pedido da pessoa",
  "verifications.requests.drawer.contextEmpty":
    "Não partilhou contexto com este pedido.",
  "verifications.requests.drawer.evidenceLabel": "Referência",
  "verifications.requests.drawer.decisionHeading": "Decisão anterior",
  "verifications.requests.drawer.reviewedBy": "revisto por {actor}",
  "verifications.requests.drawer.appealBanner":
    "Esta pessoa apresentou recurso de um pedido rejeitado. Reveja com olhos novos antes de decidir de novo.",
  "verifications.requests.drawer.duplicateBanner":
    "Esta pessoa partilha uma impressão digital de verificação com {count} outra(s) conta(s).",
  "verifications.requests.drawer.signalsHeading": "Sinais",
  "verifications.requests.drawer.signalsEmpty": "Ainda sem sinais.",
  "verifications.requests.drawer.signals.accountAge": "Conta com {days} dias",
  "verifications.requests.drawer.signals.priorRejections":
    "{count} rejeição(ões) anterior(es)",
  "verifications.requests.drawer.signals.noPriorRejections":
    "Sem rejeições anteriores",
  "verifications.requests.drawer.signals.duplicate":
    "Impressão digital partilhada com {count} outra(s) conta(s)",
  "verifications.requests.drawer.signals.duplicateTitle":
    "A referência de sessão do fornecedor de identidade desta pessoa é partilhada com pelo menos outra conta.",
  "verifications.requests.drawer.reasonLabel": "Motivo",
  "verifications.requests.drawer.reasonPlaceholder":
    "Partilhe o porquê, sobretudo se estiver a rejeitar.",
  "verifications.requests.drawer.reasonRequiredHint":
    "É necessário um motivo para rejeitar. Aprovar ou marcar em revisão não precisa de um.",
  "verifications.requests.drawer.notDecidableHint":
    "Este pedido não está aberto a uma nova decisão neste momento.",
  "verifications.requests.drawer.markInReviewCta": "Marcar em revisão",
  "verifications.requests.drawer.approveCta": "Aprovar",
  "verifications.requests.drawer.rejectCta": "Rejeitar",
  "verifications.requests.drawer.deciding": "A guardar…",

  "verifications.requests.toast.approve":
    "Pedido aprovado. A pessoa foi notificada.",
  "verifications.requests.toast.reject":
    "Pedido rejeitado. A pessoa foi notificada.",
  "verifications.requests.toast.in_review": "Pedido marcado como em revisão.",

  // ── Seleção de linhas + ações em massa + fluxo de teclado (Tarefa 4) ────
  "verifications.requests.selectAll.ariaLabel":
    "Selecionar todos os pedidos visíveis",
  "verifications.requests.selectAll.label": "Selecionar todos os visíveis",
  "verifications.requests.selectRow.ariaLabel": "Selecionar {name}",

  "verifications.requests.bulk.ariaLabel": "Ações em massa",
  "verifications.requests.bulk.selectedCount_one": "{count} selecionado",
  "verifications.requests.bulk.selectedCount_other": "{count} selecionados",
  "verifications.requests.bulk.approveCta": "Aprovar",
  "verifications.requests.bulk.inReviewCta": "Marcar em revisão",
  "verifications.requests.bulk.rejectCta": "Rejeitar",
  "verifications.requests.bulk.clearCta": "Limpar",
  "verifications.requests.bulk.capNote": "Seleção limitada a {cap} pedidos",
  "verifications.requests.bulk.toast.success_one": "{count} pedido atualizado.",
  "verifications.requests.bulk.toast.success_other":
    "{count} pedidos atualizados.",
  "verifications.requests.bulk.toast.partial":
    "{succeeded} atualizados, {failed} não foram.",
  "verifications.requests.bulk.action.approve":
    "Não foi possível aprovar os pedidos selecionados",
  "verifications.requests.bulk.action.inReview":
    "Não foi possível marcar os pedidos selecionados como em revisão",
  "verifications.requests.bulk.action.reject":
    "Não foi possível rejeitar os pedidos selecionados",

  "verifications.requests.bulk.confirmReject.title_one":
    "Rejeitar {count} pedido?",
  "verifications.requests.bulk.confirmReject.title_other":
    "Rejeitar {count} pedidos?",
  "verifications.requests.bulk.confirmReject.body_one":
    "Isto rejeita o pedido selecionado e notifica a pessoa. Não pode ser desfeito a partir daqui.",
  "verifications.requests.bulk.confirmReject.body_other":
    "Isto rejeita os {count} pedidos selecionados e notifica cada pessoa. Não pode ser desfeito a partir daqui.",
  "verifications.requests.bulk.confirmReject.reasonLabel": "Motivo",
  "verifications.requests.bulk.confirmReject.reasonPlaceholder":
    "Partilhe o porquê, sobretudo porque todas as pessoas selecionadas vão ver isto.",
  "verifications.requests.bulk.confirmReject.confirmCta": "Rejeitar pedidos",

  "verifications.requests.keyboard.hint":
    "Teclado: J e K movem o foco entre pedidos, A aprova o pedido em foco, R rejeita-o, e / salta para a pesquisa.",

  // ── Verbos partilhados, reutilizados em vários modais/gavetas ─────────────
  "common.cancel": "Cancelar",
  "common.close": "Fechar",
  "common.undo": "Desfazer",
  "common.edit": "Editar",
  "common.delete": "Eliminar",
  "common.featured": "Em destaque",
  "common.saveChanges": "Guardar alterações",
  // Texto de 403 partilhado pelos painéis de edição (escalões, cooperativas).
  "common.panelForbidden": "Este painel é apenas para administração.",
  // aria-labels dos interruptores partilhados pelas listas de linhas.
  "common.featuredToggleLabel": "Em destaque: {name}",
  "common.publishedToggleLabel": "Publicado: {name}",
  // Raiz do breadcrumb do painel de administração (usado por páginas um nível
  // abaixo de /admin, p. ex. a fila de candidaturas a parceiro).
  "common.adminBreadcrumb": "Administração",

  // ── Painel principal ──────────────────────────────────────────────────────
  "dashboard.title": "Resumo · <em>bom dia, {name}</em>",
  // Contagem e subtítulo derivados da fila de triagem real
  // (`GET /admin/overview` → contagens de triagem); `{count}` ativa o plural.
  "dashboard.header.titleLine1_one": "{count} coisa",
  "dashboard.header.titleLine1_other": "{count} coisas",
  "dashboard.header.titleLine2_one": "precisa de <em>uma pessoa</em>.",
  "dashboard.header.titleLine2_other": "precisam de <em>uma pessoa</em>.",
  "dashboard.header.titleClearLine1": "Estás",
  "dashboard.header.titleClearLine2": "totalmente <em>em dia</em>.",
  "dashboard.header.subEmergencies_one":
    "Uma está sinalizada como emergência de segurança. Começa por aí. Tudo o resto está estável, e estás a manter toda a rede unida.",
  "dashboard.header.subEmergencies_other":
    "{count} estão sinalizadas como emergências de segurança. Começa por aí. Tudo o resto está estável, e estás a manter toda a rede unida.",
  "dashboard.header.subCalm":
    "Nada está sinalizado como urgente. Trabalha a fila ao teu ritmo. Estás a manter toda a rede estável.",
  "dashboard.header.subClear":
    "Cada item aberto tem uma decisão humana associada. Vai descansar. A rede está segura nas tuas mãos.",
  "dashboard.header.moderationCta": "Abrir moderação",

  "dashboard.metrics.activeMembers.label": "Membros em situação regular",
  "dashboard.metrics.openReports.label": "Denúncias em aberto",
  "dashboard.metrics.medianResponse.label": "Resposta mediana",
  "dashboard.metrics.communityHealth.label": "Saúde das comunidades",
  "dashboard.metrics.trendPercent": "{value}%",
  "dashboard.metrics.trendOldest": "mais antiga: {hours}",
  "dashboard.metrics.trendWellUnder": "bem abaixo",
  "dashboard.metrics.trendOverSla": "acima do alvo",
  "dashboard.metrics.trendNoData": "ainda sem dados suficientes",
  "dashboard.metrics.trendHealthy": "saudável",
  "dashboard.metrics.trendNeedsHand": "precisa de ajuda",
  "dashboard.metrics.footGrowth":
    "+{count} este mês · com base no estado da conta",
  "dashboard.metrics.footEmergencies_one": "{count} é uma emergência",
  "dashboard.metrics.footEmergencies_other": "{count} são emergências",
  "dashboard.metrics.footSlaTarget": "meta de SLA: {hours}",
  "dashboard.metrics.footNeedsHand_one": "{count} comunidade precisa de ajuda",
  "dashboard.metrics.footNeedsHand_other":
    "{count} comunidades precisam de ajuda",

  "dashboard.triage.title": "Precisa de <em>uma pessoa</em>",
  "dashboard.triage.safetyEmergencies.title": "Emergências de segurança",
  "dashboard.triage.safetyEmergencies.sub": "Outing e doxxing",
  "dashboard.triage.safetyEmergencies.subEm": "trata destas primeiro",
  "dashboard.triage.openReports.title": "Denúncias em aberto",
  "dashboard.triage.openReports.sub":
    "Assédio, spam, abuso de votos de confiança",
  "dashboard.triage.identityVerifications.title": "Verificações de identidade",
  "dashboard.triage.identityVerifications.sub":
    "Pessoas à espera de serem acolhidas",
  "dashboard.triage.appeals.title": "Recursos à espera de decisão",
  "dashboard.triage.appeals.sub": "Pessoas a pedir-te para veres de novo",

  "dashboard.charts.reportsByType.title": "Denúncias por tipo",
  "dashboard.charts.reportsByType.sub": "Últimas 8 semanas · volume semanal",
  "dashboard.charts.reportsByType.ariaLabel":
    "Denúncias semanais por tipo, em barras empilhadas",
  "dashboard.charts.series.outing": "Outing/doxxing",
  "dashboard.charts.series.harassment": "Assédio",
  "dashboard.charts.series.spam": "Spam",
  "dashboard.charts.series.other": "Outras",
  "dashboard.charts.memberGrowth.title": "Crescimento de pessoas",
  "dashboard.charts.memberGrowth.sub":
    "Entradas vs. saídas · com pico do Orgulho",
  "dashboard.charts.memberGrowth.ariaLabel":
    "Gráfico de linhas do crescimento de pessoas",
  "dashboard.charts.memberGrowth.spike": "Orgulho",
  "dashboard.charts.legend.joined": "Entradas",
  "dashboard.charts.legend.churned": "Saídas",
  "dashboard.charts.responseTime.title": "Tempo de resposta",
  "dashboard.charts.responseTime.sub": "Distribuição · este mês",
  "dashboard.charts.responseTime.ariaLabel":
    "Distribuição do tempo de resposta da moderação",
  "dashboard.charts.responseTime.slaLabel": "SLA de {hours}",
  "dashboard.charts.legend.withinSla": "Dentro do SLA",
  "dashboard.charts.legend.overSla": "Acima de {hours}",
  "dashboard.charts.week.last": "passada",
  "dashboard.charts.week.this": "esta",

  "dashboard.notMeasuredYet": "Ainda não medido",

  "dashboard.feed.title": "Atividade em direto",
  "dashboard.feed.live": "Direto",
  "dashboard.feed.transparency":
    "Cada ação aqui é <strong>registada e mostrada</strong> à pessoa afetada. Nunca há remoções silenciosas.",
  "dashboard.feed.auditLinkCta": "Ver o registo de auditoria",

  "dashboard.feed.type.reportFiled.body": "apresentou uma denúncia",
  "dashboard.feed.type.reportFiled.anonymousLead": "Uma denúncia",
  "dashboard.feed.type.reportFiled.anonymousBody":
    "foi apresentada de forma anónima",
  "dashboard.feed.type.reportResolved.body": "resolveu uma denúncia",
  "dashboard.feed.type.reportResolved.anonymousLead": "Uma pessoa moderadora",
  "dashboard.feed.type.memberJoined.body": "entrou na plataforma",
  "dashboard.feed.type.memberJoined.leadCount_one": "{count} pessoa nova",
  "dashboard.feed.type.memberJoined.leadCount_other": "{count} pessoas novas",
  "dashboard.feed.type.memberJoined.genericLead": "Pessoas novas",
  "dashboard.feed.type.vouchReceived.body": "recebeu um voto de confiança de",
  "dashboard.feed.type.vouchReceived.bodyNoActor":
    "recebeu um novo voto de confiança",
  "dashboard.feed.type.vouchReceived.genericLead": "Uma pessoa",
  "dashboard.feed.type.communityJoined.body": "entrou em",
  "dashboard.feed.type.communityJoined.genericLead": "Uma pessoa",
  "dashboard.feed.type.joinRequestSubmitted.body": "pediu para entrar",
  "dashboard.feed.type.joinRequestSubmitted.genericLead": "Alguém",
  "dashboard.feed.type.generic.body": "fez uma atualização",

  // ── Pessoas ────────────────────────────────────────────────────────────────
  "members.title": "Pessoas · <em>a comunidade</em>",
  "members.header.eyebrow": "Diretório de pessoas",
  "members.header.titleLine1": "{total} pessoas,",
  "members.header.titleLine2":
    "cada uma <em>com voto de confiança de alguém</em>.",
  "members.header.sub":
    "Não são linhas numa tabela. São pessoas em quem alguém confiou o suficiente para as trazer. Pronomes e nomes escolhidos são os únicos nomes mostrados aqui. {count} pessoas estão à espera de serem acolhidas.",
  "members.header.exportCta": "Exportar",
  "members.filterAriaLabel": "Filtrar pessoas",
  "members.searchPlaceholder": "Pesquisar por nome…",
  "members.searchAriaLabel": "Pesquisar pessoas por nome ou pronome",
  "members.tabs.all": "Todas as pessoas",
  "members.tabs.pending": "Verificação pendente",
  "members.tabs.flagged": "Sinalizadas",
  "members.tabs.sample": "Amostra de qualidade",
  "members.filters.all": "Todos os estados",
  "members.filters.verified": "Verificadas",
  "members.filters.new": "Novas esta semana",
  "members.empty": "Nenhuma pessoa corresponde a estes filtros.",
  "members.loadMore": "Mostrar mais pessoas",
  "members.openAriaLabel": "Abrir {name}",
  "members.vouchedLabel": "com voto de confiança",

  "members.verify.intro":
    "Estas pessoas pediram para entrar na QueerPulse. Lê o que escreveram e depois acolhe-as ou deixa o pedido de lado.",
  "members.verify.introEm":
    "Não tens pressa; um gesto de bondade não se apressa.",
  "members.verify.empty":
    "A fila está limpa. Toda a gente à espera já foi acolhida.",
  "members.verify.declineCta": "Agora não",
  "members.verify.approveCta": "Acolher",
  "members.verify.approvedToast": "Demos as boas-vindas a {name}",
  "members.verify.declinedToast":
    "O pedido de {name} não foi aprovado desta vez",
  "members.verify.errorToast":
    "Não foi possível guardar essa decisão. Tenta novamente",
  "members.verify.appliedToday": "Pedido feito hoje",
  "members.verify.appliedRecently": "Pedido feito há pouco",
  "members.verify.appliedDaysAgo_one": "Pedido feito há {count} dia",
  "members.verify.appliedDaysAgo_other": "Pedido feito há {count} dias",
  "members.verify.unnamedApplicant": "Nova candidatura",
  "members.verify.emailLabel": "Email",
  "members.verify.cityLabel": "Cidade",
  "members.verify.noCity": "Não indicada",
  // Por que página a pessoa passou até ao formulário de pedido.
  "members.verify.sourceLabel": "Veio de",
  "members.verify.source.homepage_hero": "Destaque da página inicial",
  "members.verify.source.homepage_outro": "Convite final da página inicial",
  "members.verify.source.members_explainer": "Explicação dos membros",
  "members.verify.source.sign_in": "Página de entrada",
  "members.verify.source.barter": "Mural de trocas",
  "members.verify.source.employer_reviews": "Avaliações de empregadores",
  "members.verify.source.skills": "Diretório de competências",
  "members.verify.source.solidarity_directory": "Diretório de solidariedade",
  "members.verify.source.solidarity": "Página de solidariedade",
  "members.verify.source.public_profile": "Perfil público de um membro",
  "members.verify.source.about": "Página Sobre",
  "members.verify.source.directory": "Diretório",
  "members.verify.source.partners": "Página de parceiros",
  "members.verify.source.arriving": "Guia de chegada",
  "members.verify.source.communities_about": "Explicação das comunidades",
  "members.verify.source.accessibility": "Página de acessibilidade",
  "members.verify.source.wellbeing": "Recursos de bem-estar",
  "members.verify.source.trans_hub": "Centro trans",
  "members.verify.source.legal": "Guia jurídico",
  "members.verify.source.micro_grants": "Micro-subsídios",
  "members.verify.source.queer_101": "Queer 101",
  "members.verify.source.magazine": "Revista",
  "members.verify.source.status": "Página de estado",
  "members.verify.source.gathering_vouch": "Apelo de recomendação de encontro",
  "members.verify.source.family": "Página Família",
  "members.verify.source.reading_groups": "Grupos de leitura",
  "members.verify.source.direct": "Abriu a página de pedido diretamente",
  "members.verify.source.other": "Outra página",
  "members.verify.ageAttested": "18+ confirmado a {date} · Termos v{version}",
  "members.verify.ageAttestedUnknown": "18+ confirmado · Termos v{version}",
  // Aprovado: a QueerPulse não envia emails, por isso a aprovação só chega a
  // quem se candidatou quando quem revê leva a ligação até lá. Dizê-lo com
  // clareza aqui; prometer um email deixaria as pessoas à espera.
  "members.verify.approvedLabel": "Recebide na comunidade",
  "members.verify.sendYourself":
    "Os convites seguem à mão. Copia a ligação abaixo e envia-a tu mesme a {email}.",
  "members.verify.linkFieldLabel": "Ligação de convite",
  "members.verify.copyLink": "Copiar ligação",
  "members.verify.copiedLink": "Copiada",
  "members.verify.copiedToast": "Ligação de convite copiada. Agora envia-lha",
  "members.verify.copyFailed":
    "Não foi possível copiar a ligação. Seleciona-a e copia",
  "members.verify.noInviteCode":
    "Não veio nenhum código de convite. Atualiza a fila ou pede a um admin para o reemitir.",
  "members.verify.flags.disposableEmail": "Email descartável",
  "members.verify.flags.duplicateMessage":
    "Mesma mensagem de outro pedido pendente",
  "members.verify.flags.sourceBurst": "Parte de um pico incomum desta origem",
  "members.verify.priorDeclineCount_one": "Já recusado uma vez",
  "members.verify.priorDeclineCount_other": "Já recusado {count} vezes",
  "members.verify.referenceLabel": "Referência",
  "members.verify.referenceResolved": "Corroborado por {name}",
  "members.verify.referenceUnresolved":
    "Indicou {email}; sem correspondência entre membros",
  "members.verify.waitingDays_one": "À espera há {count} dia",
  "members.verify.waitingDays_other": "À espera há {count} dias",
  "members.verify.declineReason.spam_pattern": "Parece spam",
  "members.verify.declineReason.underage": "Menor de 18 anos",
  "members.verify.declineReason.implausible": "Os detalhes não batem certo",
  "members.verify.declineReason.safety_concern": "Preocupação de segurança",
  "members.verify.declineReason.other": "Outro",
  "members.verify.declineModal.title": "Recusar o pedido de {name}?",
  "members.verify.declineModal.body":
    "Escolhe o motivo mais próximo. Não é enviado nada à pessoa candidata. Se ela própria for ver o estado do pedido, encontra uma nota curta e genérica em vez disto.",
  "members.verify.declineModal.reasonLabel": "Motivo",
  "members.verify.declineModal.reasonPlaceholder": "Escolhe um motivo",
  "members.verify.declineModal.confirmCta": "Recusar pedido",
  "members.verify.waitlistCta": "Lista de espera",
  "members.verify.waitlistedToast": "{name} passou para a lista de espera",
  "members.verify.waitlistedSectionTitle": "Lista de espera",
  "members.verify.identityReminder":
    "Um nome, foto ou pronomes não são, por si só, motivo para recusar.",
  "members.verify.selectAria": "Selecionar o pedido de {name}",
  "members.verify.bulk.ariaLabel": "Ações em lote",
  "members.verify.bulk.selectedCount_one": "{count} selecionado",
  "members.verify.bulk.selectedCount_other": "{count} selecionados",
  "members.verify.bulk.capNote": "Até {cap} de cada vez",
  "members.verify.bulk.approveCta": "Aprovar",
  "members.verify.bulk.waitlistCta": "Lista de espera",
  "members.verify.bulk.declineCta": "Recusar",
  "members.verify.bulk.clearCta": "Limpar",
  // Enquadramentos para `describeError`: leem-se como uma falha com o motivo do
  // servidor a seguir, não como uma instrução.
  "members.verify.bulk.action.approve":
    "Não foi possível aprovar esses pedidos",
  "members.verify.bulk.action.waitlist":
    "Não foi possível colocar esses pedidos em lista de espera",
  "members.verify.bulk.action.decline":
    "Não foi possível recusar esses pedidos",

  // Selecionar tudo diz o conjunto exato que leva: os pedidos que estão a
  // aguardar nesta página, nunca a fila inteira nem a secção de lista de espera.
  "members.verify.bulk.selectAll.label_one":
    "Selecionar o {count} pedido que aguarda aqui",
  "members.verify.bulk.selectAll.label_other":
    "Selecionar os {count} pedidos que aguardam aqui",
  "members.verify.bulk.capReached":
    "São {cap} de cada vez, o máximo que uma ação leva. Limpa alguns para escolher outros.",

  // Confirmação. Nada chega ao servidor antes de uma destas ser confirmada.
  "members.verify.bulk.confirmApprove.title": "Aprovar {count} pedidos?",
  "members.verify.bulk.confirmApprove.body":
    "Cada aprovação cria uma ligação de convite. Não é enviado nada a ninguém: copias cada ligação no separador Decididos e entrega-la tu.",
  "members.verify.bulk.confirmApprove.confirmCta": "Aprovar todos",
  "members.verify.bulk.confirmWaitlist.title":
    "Colocar {count} pedidos em lista de espera?",
  "members.verify.bulk.confirmWaitlist.body":
    "Continuam em aberto e passam para a lista de espera, para lhes voltares mais tarde.",
  "members.verify.bulk.confirmWaitlist.confirmCta": "Colocar todos em espera",
  "members.verify.bulk.confirmDecline.title": "Recusar {count} pedidos?",
  "members.verify.bulk.confirmDecline.body":
    "Escolhe o motivo mais próximo. Aplica-se aos {count} pedidos selecionados.",
  "members.verify.bulk.confirmDecline.reasonLine_one":
    "Isto regista “{reason}” no {count} pedido selecionado.",
  "members.verify.bulk.confirmDecline.reasonLine_other":
    "Isto regista “{reason}” em todos os {count} pedidos selecionados.",
  "members.verify.bulk.confirmDecline.confirmCta": "Recusar todos",

  // Anunciado só quando o lote inteiro passou. Um lote que ficou a meio é
  // relatado pelo painel de resultado abaixo, nunca como sucesso.
  "members.verify.bulk.approvedToast_one":
    "{count} pedido aprovado. A ligação de convite está em Decididos, para lha enviares.",
  "members.verify.bulk.approvedToast_other":
    "{count} pedidos aprovados. As ligações de convite estão em Decididos, para lhas enviares.",
  "members.verify.bulk.waitlistedToast_one":
    "{count} pedido passou para a lista de espera.",
  "members.verify.bulk.waitlistedToast_other":
    "{count} pedidos passaram para a lista de espera.",
  "members.verify.bulk.declinedToast_one": "{count} pedido recusado.",
  "members.verify.bulk.declinedToast_other": "{count} pedidos recusados.",

  // O resultado item a item. No servidor uma revisão em lote é aplicada um
  // pedido de cada vez, por isso é normal um lote ficar a meio: outra pessoa
  // pode ter resolvido um pedido enquanto este estava aberto.
  "members.verify.bulk.result.title": "O que passou",
  "members.verify.bulk.result.succeeded_one": "{count} pedido passou.",
  "members.verify.bulk.result.succeeded_other": "{count} pedidos passaram.",
  "members.verify.bulk.result.noneSucceeded": "Nenhum deles passou.",
  "members.verify.bulk.result.failedTitle_one": "{count} ficou como estava",
  "members.verify.bulk.result.failedTitle_other":
    "{count} ficaram como estavam",
  "members.verify.bulk.result.unknownApplicant": "Pedido {id}",
  "members.verify.bulk.result.retryNote":
    "Estes continuam selecionados. Tenta outra vez, ou abre-os um a um.",
  "members.verify.bulk.result.dismissCta": "Fechar",
  "members.verify.status.approved": "Aprovado",
  "members.verify.status.declined": "Recusado",

  // A fila tem duas metades: o que ainda espera por quem revê e o que já ficou
  // resolvido.
  "members.verify.tabs.waiting": "A aguardar",
  "members.verify.tabs.decided": "Decididos",

  // Separador Decididos. Lê do servidor, por isso a decisão e a ligação de
  // convite que ela criou continuam aqui depois de atualizar a página, de sair
  // ou de uma aprovação em lote. Nada segue por email, por isso essa ligação
  // cabe a quem revê levar à mão, e um convite de aprovação caduca ao fim de
  // sete dias.
  "members.verify.decided.intro":
    "Pedidos que já ficaram resolvidos. Uma aprovação guarda aqui a sua ligação de convite, para que a possas entregar.",
  "members.verify.decided.searchLabel": "Procurar pedidos decididos",
  "members.verify.decided.searchPlaceholder": "Procura por nome ou email",
  "members.verify.decided.searchScopeNote_one":
    "Isto procura no {count} pedido decidido carregado aqui.",
  "members.verify.decided.searchScopeNote_other":
    "Isto procura nos {count} pedidos decididos carregados aqui.",
  "members.verify.decided.empty":
    "Ainda não há nada decidido. As aprovações e as recusas juntam-se aqui.",
  "members.verify.decided.noMatches":
    "Nenhum pedido decidido carregado aqui corresponde a “{query}”.",
  "members.verify.decided.appliedOn": "Candidatou-se a {date}",
  "members.verify.decided.decidedOn": "Decidido a {date}",
  "members.verify.decided.decidedUnknown": "Data da decisão não registada",
  "members.verify.decided.declineReasonLine": "Motivo: {reason}",

  // O estado da ligação de convite criada por uma aprovação. Caduca sete dias
  // depois de ser criada, e só uma ligação caducada pode ser reemitida.
  "members.verify.invite.chip.valid": "Ligação ativa",
  "members.verify.invite.chip.used": "Ligação usada",
  "members.verify.invite.chip.expired": "Ligação caducada",
  "members.verify.invite.chip.revoked": "Ligação revogada",
  "members.verify.invite.validDaysLeft_one":
    "Esta ligação funciona por mais {count} dia. Envia-lha.",
  "members.verify.invite.validDaysLeft_other":
    "Esta ligação funciona por mais {count} dias. Envia-lha.",
  "members.verify.invite.validToday":
    "Esta ligação deixa de funcionar hoje. Envia-lha agora.",
  "members.verify.invite.validNoExpiry": "Esta ligação não tem data de fim.",
  "members.verify.invite.expired":
    "Esta ligação caducou antes de alguém a usar. Reemite-a e a mesma ligação volta a funcionar.",
  "members.verify.invite.used":
    "Usaram esta ligação, por isso já estão connosco.",
  "members.verify.invite.revoked":
    "Esta ligação foi revogada, por isso já não abre.",
  "members.verify.invite.noneMinted":
    "Não há nenhum código de convite registado nesta aprovação. Pede a um admin para verificar.",
  "members.verify.invite.reissueCta": "Reemitir ligação",
  "members.verify.invite.reissuing": "A reemitir",
  "members.verify.invite.reissuedToast":
    "Essa ligação volta a funcionar. Envia-a para {email}.",
  "members.verify.invite.reissueError.forbidden":
    "Reemitir um convite é para moderadores e admins. Pede a alguém dessa equipa.",
  "members.verify.invite.reissueError.notFound":
    "Não há nenhum convite neste pedido para reemitir. Atualiza o separador e vê outra vez.",
  "members.verify.invite.reissueError.notReissuable":
    "Esta ligação foi usada ou revogada, ou ainda funciona. Não há nada para reemitir.",
  "members.verify.invite.reissueError.generic":
    "Não foi possível reemitir essa ligação. Tenta outra vez.",

  // Separador de amostra de qualidade: uma verificação periódica e só de
  // leitura de decisões passadas, para outro admin comparar notas. Não é um
  // fluxo de aprovação — dizê-lo com clareza.
  "members.sample.intro":
    "Um punhado aleatório de decisões que esta fila já tomou, para quem a trabalha ler as decisões umas das outras e manter um critério comum.",
  "members.sample.explainer":
    "Lê algumas ao lado das orientações de revisão e falem sobre elas em conjunto. O assunto é o critério que esta fila mantém, e toda a gente aqui o mantém.",
  "members.sample.readOnlyNote":
    "Só de leitura. Nada aqui pode ser alterado a partir desta vista, e não fica registada nenhuma segunda aprovação.",
  "members.sample.resampleCta": "Mostrar outra amostra",
  "members.sample.sizeLabel": "Quantas mostrar",
  "members.sample.sizeOption_one": "{count} decisão",
  "members.sample.sizeOption_other": "{count} decisões",
  "members.sample.decidedOnLabel": "Decidido",
  "members.sample.appliedLabel": "Candidatou-se",
  "members.sample.reasonLabel": "Motivo",
  "members.sample.noReason": "Sem motivo registado",
  "members.sample.reviewerLabel": "Decidido por",
  "members.sample.reviewerYou": "Tu",
  // Só alternativa. A fila já resolve o nome de quem decidiu, por isso esta
  // referência curta e estável é o que a linha mostra quando o servidor enviou
  // um id sem nome: chega para agrupar as decisões de quem revê, nunca é uma
  // identidade.
  "members.sample.reviewerOther": "Quem revê {reference}",
  // Sem ninguém registado na linha. É também onde fica quem revia e entretanto
  // apagou a conta: o apagamento leva o id, por isso não sobra nome nenhum e
  // nada aqui pode inventar um.
  "members.sample.reviewerUnknown": "Não registado",
  // O filtro por quem revê. Lê decisões, nunca pessoas: sem contagens, sem
  // classificações, sem produtividade. A única pergunta que responde é "deixa-me
  // ler as decisões desta pessoa seguidas e ver se batem certo com as minhas".
  "members.sample.reviewerFilterLabel": "Mostrar decisões de",
  "members.sample.reviewerFilterAll": "Toda a gente",
  "members.sample.reviewerFilterHint":
    "Ler as decisões de uma pessoa seguidas torna mais fácil notar uma leitura diferente das orientações.",
  "members.sample.reviewerFilterEmpty":
    "Nada dessa pessoa nesta amostra. Tira outra amostra ou volta a toda a gente.",
  "members.sample.empty": "Ainda não há pedidos revistos para amostrar.",
  "members.sample.loadError":
    "Não foi possível tirar uma amostra agora. Tenta daqui a pouco.",

  "members.drawer.verifiedChip": "Pessoa verificada",
  "members.drawer.verifyCta": "Verificar",
  "members.drawer.verifiedToast": "Verificámos {name}.",
  "members.drawer.messageCta": "Mensagem",
  "members.drawer.restrictCta": "Restringir…",
  "members.drawer.banCta": "Banir para sempre…",
  "members.drawer.glanceTitle": "Resumo rápido",
  "members.drawer.graphTitle":
    "Rede de votos de confiança: confiança nos dois sentidos",
  "members.drawer.graphAriaLabel": "Abrir a rede de confiança completa",
  "members.drawer.exploreCta": "Explorar rede",
  "members.drawer.communitiesTitle": "Comunidades",
  "members.drawer.contributionsTitle": "Histórico de contribuições",
  "members.drawer.messageSentToast": "Mensagem enviada",
  "members.drawer.missingReasonToast":
    "É necessário um motivo. {name} vai vê-lo",
  "members.drawer.restrictedToast":
    "Restrição aplicada a {name} · {duration} · {scope} · aviso enviado",
  "members.drawer.restrictionUndoneToast": "Restrição anulada.",
  "members.drawer.comingSoonToast":
    "Esta ação de moderação ainda não está disponível.",

  // ── Membros: gestão de papéis (conceder/remover moderador e admin) ────────
  "members.suspension.sectionTitle": "Suspensão",
  "members.suspension.description":
    "Este membro está atualmente suspenso. Levantar a suspensão reativa a conta e restaura o acesso de imediato.",
  "members.suspension.liftCta": "Levantar suspensão",
  "members.suspension.liftedToast": "{name} foi reintegrade.",
  "members.suspension.confirm.title": "Reintegrar {name}?",
  "members.suspension.confirm.body":
    "Isto levanta a suspensão de {name} e restaura o acesso total de imediato. Fica registado na trilha de auditoria em teu nome. Podes voltar a suspender se necessário.",
  "members.suspension.confirm.confirmCta": "Levantar suspensão",
  "members.role.currentLabel": "Papel atual",
  "members.role.description":
    "Moderadores podem agir sobre denúncias e moderar conteúdo em toda a plataforma. Admins podem fazer tudo, incluindo gerir quem tem estes papéis.",
  "members.role.value.member": "Membro",
  "members.role.value.moderator": "Moderador",
  "members.role.value.admin": "Admin",
  "members.role.setAs.member": "Tornar membro",
  "members.role.setAs.moderator": "Tornar moderador",
  "members.role.setAs.admin": "Tornar admin",
  "members.role.selfNote":
    "Não podes mudar o teu próprio papel. Pede a outro admin para o fazer.",
  "members.role.systemNote":
    "Esta é a conta oficial da QueerPulse. O papel dela é fixo e não pode ser alterado aqui.",
  "members.role.updatedToast": "{name} é agora {role}.",
  "members.role.demoteConfirm.title": "Remover admin de {name}?",
  "members.role.demoteConfirm.body":
    "{name} vai perder acesso a todas as ferramentas de admin de imediato. Podes restaurar mais tarde. Isto fica registado no histórico de auditoria em teu nome.",
  "members.role.demoteConfirm.confirmCta": "Remover admin",
  "members.role.grantConfirm.title": "Tornar {name} admin?",
  "members.role.grantConfirm.body":
    "{name} vai ter acesso total de admin à plataforma de imediato: gestão de equipa e de papéis, ações de moderação sobre qualquer denúncia e todas as outras ferramentas de admin. Este é o nível de acesso mais alto que a QueerPulse tem. Fica registado no histórico de auditoria em teu nome.",
  "members.role.grantConfirm.confirmCta": "Conceder acesso de admin",

  // ── Equipa (/admin/staff) — lista só de leitura de todos os moderadores/admins
  "staff.title": "Equipa e <em>papéis</em>",
  "staff.header.eyebrow": "Quem gere a QueerPulse",
  "staff.header.sub":
    "Todos os moderadores e admins da plataforma, e ainda quem tem papéis de equipa atribuídos. Para alterar um papel ou uma atribuição, abre o perfil dessa pessoa em Membros.",
  "staff.grantsLabel": "Atribuições",
  "staff.tier.member": "Membro",
  "staff.empty": "Ninguém tem um papel de equipa neste momento.",
  "staff.loadError": "Não foi possível carregar a lista de equipa.",

  // ── Membros: papéis de equipa (concessões funcionais adicionais, ex. desk da revista)
  "staffRoles.title": "Papéis e acesso",
  "staffRoles.subtitle":
    "Concede papéis funcionais para além do nível de conta desta pessoa.",
  "staffRoles.accountLevelLabel": "Nível de conta",
  "staffRoles.grantsLabel": "Papéis de equipa",
  "staffRoles.magazineEditor.label": "Editor da revista",
  "staffRoles.magazineEditor.desc":
    "Gere o desk editorial: publica peças, gere decks, revê propostas.",
  "staffRoles.magazineWriter.label": "Redator da revista",
  "staffRoles.magazineWriter.desc":
    "Escreve rascunhos e submete peças para revisão editorial.",
  "staffRoles.housingModerator.label": "Moderador de Habitação",
  "staffRoles.housingModerator.desc":
    "Pode moderar anúncios e grupos de Habitação.",
  "staffRoles.directoryModerator.label": "Moderação do diretório",
  "staffRoles.directoryModerator.desc":
    "Analisa a fila do diretório local e as nomeações de espaços seguros, e gere os selos desses espaços. As sinalizações continuam com a moderação.",
  "staffRoles.resourceCurator.label": "Curadoria de recursos",
  "staffRoles.resourceCurator.desc":
    "Escreve e revê os guias de recursos, os contactos de serviços, as sugestões e o glossário. Publicar um guia continua reservado à administração.",
  "staffRoles.editorial.label": "Editorial",
  "staffRoles.editorial.desc":
    "Tria as histórias submetidas e as candidaturas a redator, e mantém o clube de cinema, o kit de imprensa e a página inicial atualizados.",
  "staffRoles.communities.label": "Comunidades",
  "staffRoles.communities.desc":
    "Trata dos pedidos de etiquetas, dos tópicos e das propostas de clubes de leitura, e define as opções de segurança de cada comunidade. Congelar ou transferir uma comunidade continua reservado à administração.",
  "staffRoles.partnerships.label": "Parcerias",
  "staffRoles.partnerships.desc":
    "Analisa candidaturas de parceiros e mantém o diretório de parceiros, os níveis de organização e os changemakers atualizados.",
  "staffRoles.adminSuperset":
    "A administração já tem todas as capacidades de equipa.",
  "staffRoles.systemLocked":
    "Contas do sistema não podem ter papéis de equipa.",

  "members.timeline.title": "Histórico de moderação: a favor e contra",
  "members.timeline.auditLinkCta": "Todas as entradas no registo de auditoria",

  // ── Verificação de conta que regressa (gaveta de membro) — PRD-27 ─────────
  "members.banEvasion.title": "Verificação de conta que regressa",
  "members.banEvasion.hint":
    "Pergunta se esta conta tem correspondência com uma conta que foi removida. Só corre quando pedes, e não altera nada por si.",
  "members.banEvasion.checkCta": "Verificar sinais de fuga a banimento",
  "members.banEvasion.recheckCta": "Verificar outra vez",
  "members.banEvasion.retryCta": "Tentar a verificação outra vez",
  "members.banEvasion.checking": "A verificar…",
  "members.banEvasion.clear":
    "Verificado. Nada nesta conta corresponde a uma conta que tenha sido removida.",
  "members.banEvasion.errorBody":
    "A verificação não chegou a correr, por isso nada foi verificado. Isto não é um resultado limpo. Tenta outra vez antes de tirares qualquer conclusão.",
  "members.banEvasion.note":
    "Isto é um sinal para verificar. Lê primeiro a conta removida e depois avalia este membro pelo que fez de facto aqui.",

  "members.sealed.sectionTitle": "Identidade e privacidade",
  "members.sealed.title": "Nenhum nome anterior é guardado",
  "members.sealed.body":
    "A QueerPulse não guarda registo do nome anterior de ninguém. É por isso que nada aparece aqui. Nunca surge numa denúncia, nesta vista, nem para a administração. A própria pessoa decide como é conhecida.",

  "members.message.eyebrow": "A entrar em contacto",
  "members.message.title": "Mensagem para <em>{name}</em>",
  "members.message.sendAsLabel": "Enviar como",
  "members.message.sendAsSelf": "{name} (tu)",
  "members.message.sendAsTeam": "Equipa de Confiança e Segurança",
  "members.message.bodyLabel": "Mensagem",
  "members.message.placeholder":
    "Escreve a {name}… um contacto de proximidade, um aviso, uma oferta de apoio.",
  "members.message.transparency":
    "As mensagens da administração são sempre identificadas como oficiais e nunca disfarçadas de mensagem entre pares. {name} pode sempre responder.",
  "members.message.sendCta": "Enviar mensagem",

  "members.restrict.eyebrow": "A limitar o acesso, com cuidado",
  "members.restrict.title": "Restringir <em>{name}</em>",
  "members.restrict.durationLabel": "Duração",
  "members.restrict.scopeLabel": "Âmbito",
  "members.restrict.reasonLabel": "Motivo",
  "members.restrict.applyCta": "Aplicar restrição",
  "members.restrict.notePlaceholder": "Uma nota para {name} (vai vê-la)…",
  "members.restrict.transparency":
    "{name} mantém acesso total ao apoio e aos recursos. Uma restrição limita as publicações. Nunca corta o acesso à ajuda.",
  "members.restrict.duration.24h": "24h",
  "members.restrict.duration.7d": "7 dias",
  "members.restrict.duration.30d": "30 dias",
  "members.restrict.duration.permanent": "Permanente",
  "members.restrict.permanentNote":
    "Permanente significa um banimento sem data de fim: {name} perde o acesso à conta até que a administração o levante. Recebe o motivo e pode recorrer.",
  "members.restrict.scope.community": "Esta comunidade",
  "members.restrict.scope.platform": "Em toda a plataforma",
  "members.restrict.reason.harassment": "Assédio repetido depois de um aviso",
  "members.restrict.reason.misgendering":
    "Ignorar o género ou usar o nome anterior",
  "members.restrict.reason.hostile": "Comportamento hostil ou abusivo",
  "members.restrict.reason.other": "Outro: explica abaixo",

  "members.status.verified": "Verificada",
  "members.status.openReports_one": "{count} denúncia em aberto",
  "members.status.openReports_other": "{count} denúncias em aberto",
  "members.flagged.status.underReview": "Em revisão",
  "members.flagged.status.frozen": "Congelada",
  "members.flagged.status.limited": "Limitada",
  "members.flagged.reportsCount_one": "{count} denúncia",
  "members.flagged.reportsCount_other": "{count} denúncias",
  "members.flagged.category.doxxing": "Denúncia de doxxing",
  "members.flagged.category.spam": "Spam",
  "members.glance.vouches": "Votos de confiança",
  "members.glance.memberFor": "Aqui há",
  "members.glance.reportsAgainst": "Denúncias recebidas",

  // ── Pessoas: strings compostas pelo adaptador DTO → view-model (D2) ───────
  // `adminMembers.adapters.ts` compõe estas strings no momento da adaptação
  // (datas sensíveis ao idioma via `Formatters`, plurais via `{count}`) em
  // vez de fixar inglês no view-model, tal como `adminCommunities.adapters.ts`.
  "members.meta.joined": "Membro desde {date}",
  "members.glance.memberFor.new": "Recente",
  "members.glance.memberFor.years_one": "{count} ano",
  "members.glance.memberFor.years_other": "{count} anos",
  "members.glance.memberFor.months_one": "{count} mês",
  "members.glance.memberFor.months_other": "{count} meses",
  "members.detail.graphNote_one":
    "{count} pessoa deu um voto de confiança a {name}. Uma rede mútua é sinal de confiança. Não a trates como uma métrica para otimizar.",
  "members.detail.graphNote_other":
    "{count} pessoas deram um voto de confiança a {name}. Uma rede mútua é sinal de confiança. Não a trates como uma métrica para otimizar.",
  "members.detail.graphNoteMutual_one":
    "{count} pessoa deu um voto de confiança a {name}, que deu um voto de confiança a {given} em troca. Uma rede mútua é sinal de confiança. Não a trates como uma métrica para otimizar.",
  "members.detail.graphNoteMutual_other":
    "{count} pessoas deram um voto de confiança a {name}, que deu um voto de confiança a {given} em troca. Uma rede mútua é sinal de confiança. Não a trates como uma métrica para otimizar.",
  "members.detail.removeBody":
    "Isto encerra a participação de {name} na comunidade, oculta o conteúdo dessa pessoa e essa pessoa é notificada com o teu motivo e o direito a recurso. Os votos de confiança que deu a outras pessoas continuam válidos. Fica registado no registo de auditoria em teu nome.",
  "members.communities.role.owner": "responsável",
  "members.communities.role.mod": "pessoa moderadora",
  "members.contributions.kind.vouch": "Deu um voto de confiança a alguém",
  "members.contributions.kind.other": "Contribuiu para a comunidade",
  "members.timeline.action.dismiss": "Denúncia arquivada",
  "members.timeline.action.warn": "Pessoa avisada",
  "members.timeline.action.hideContent": "Conteúdo ocultado",
  "members.timeline.action.removeContent": "Conteúdo removido",
  "members.timeline.action.restrict": "Acesso restringido",
  "members.timeline.action.suspend": "Conta suspensa",
  "members.timeline.action.ban": "Conta banida",
  "members.timeline.action.shield": "Protegida de contacto indesejado",
  "members.timeline.action.escalate": "Encaminhado à equipa de segurança",
  "members.timeline.action.appealUpheld": "Recurso aceite",
  "members.timeline.action.suspensionLifted": "Suspensão levantada",
  "members.timeline.action.verified": "Identidade verificada",
  "members.timeline.action.noReports": "Sem denúncias contra esta pessoa",
  "members.timeline.action.evidenceCited": "Prova citada",
  "members.timeline.action.roleChanged": "Papel alterado",
  "members.timeline.action.staffRoleGranted": "Papel de equipa concedido",
  "members.timeline.action.staffRoleRevoked": "Papel de equipa revogado",
  "members.timeline.action.other": "Ação de moderação tomada",
  "members.timeline.noReportsMeta": "Um histórico limpo, até agora",
  "members.timeline.verifiedMeta": "{date} · votos de confiança confirmados",
  "members.timeline.actedByMeta": "{date} · decisão de {name}",
  "members.timeline.viewCta": "ver",

  // ── Espaços seguros (/admin/safe-spaces) ────────────────────────────────────
  "adminSafeSpaces.title": "Espaços seguros · <em>a lista verificada</em>",
  "adminSafeSpaces.header.eyebrow": "Confiança e segurança",
  "adminSafeSpaces.header.title": "Verificar <em>espaços seguros</em>",
  "adminSafeSpaces.header.sub":
    "Marca um espaço como seguro e verificado, edita o perfil público, ou remove um que já não merece essa confiança.",
  "adminSafeSpaces.empty": "Ainda não há espaços para rever.",
  "adminSafeSpaces.loadError.title": "Os locais não carregaram",
  "adminSafeSpaces.loadError.body":
    "A falha é do nosso lado, por isso nada aparece porque nada chegou. Tenta de novo.",
  "adminSafeSpaces.status.none": "Por rever",
  "adminSafeSpaces.status.verified": "Verificado",
  "adminSafeSpaces.status.removed": "Removido",
  "adminSafeSpaces.markCta": "Marcar como espaço seguro",
  "adminSafeSpaces.unmarkCta": "Desmarcar",
  "adminSafeSpaces.viewCta": "Ver página",
  "adminSafeSpaces.editCta": "Editar espaço seguro",
  "adminSafeSpaces.toast.marked": "{name} foi marcado como espaço seguro",
  "adminSafeSpaces.toast.unmarked": "{name} foi desmarcado como espaço seguro",

  "adminSafeSpaces.modal.loadingProfile":
    "A carregar o perfil de espaço seguro atual deste espaço…",
  "adminSafeSpaces.modal.loadFailed":
    "Não foi possível carregar o perfil de espaço seguro atual deste espaço. Fecha e reabre para tentar de novo.",
  "adminSafeSpaces.modal.eyebrow": "Perfil de espaço seguro",
  "adminSafeSpaces.modal.title": "Editar {name}",
  "adminSafeSpaces.modal.statusLabel": "Estado",
  "adminSafeSpaces.modal.tierLabel": "Nível",
  "adminSafeSpaces.modal.verifierLabel": "Verificado por",
  "adminSafeSpaces.modal.reVerifiedAtLabel": "Reverificado em",
  "adminSafeSpaces.modal.subLabel": "Subtítulo",
  "adminSafeSpaces.modal.promisesLabel": "Promessas",
  "adminSafeSpaces.modal.promiseTitlePlaceholder": "Título da promessa",
  "adminSafeSpaces.modal.promiseDescPlaceholder": "Descrição da promessa",
  "adminSafeSpaces.modal.addPromiseCta": "Adicionar promessa",
  "adminSafeSpaces.modal.vouchesLabel": "Votos de confiança",
  "adminSafeSpaces.modal.vouchNamePlaceholder": "Nome",
  "adminSafeSpaces.modal.vouchBylinePlaceholder": "Assinatura",
  "adminSafeSpaces.modal.vouchTextPlaceholder": "Texto do voto de confiança",
  "adminSafeSpaces.modal.vouchWhenPlaceholder": "Quando (ex.: há 2 semanas)",
  "adminSafeSpaces.modal.addVouchCta": "Adicionar voto de confiança",
  "adminSafeSpaces.modal.removeRowAriaLabel": "Remover",
  "adminSafeSpaces.modal.reasonLabel": "Motivo da remoção",
  "adminSafeSpaces.modal.reasonHint":
    "Mostrado às pessoas que visitarem a página do espaço removido.",
  "adminSafeSpaces.modal.cancelCta": "Cancelar",
  "adminSafeSpaces.modal.saveCta": "Guardar",
  "adminSafeSpaces.modal.savingCta": "A guardar…",
  "adminSafeSpaces.modal.savedToast":
    "O perfil de espaço seguro de {name} foi guardado",

  // ── Fila de espaços do diretório ──────────────────────────────────────────
  // ── Supervisão de convites (/admin/invites) ──────────────────────────
  "adminInvites.title": "Supervisão de <em>convites</em>",
  "adminInvites.header.eyebrow": "Confiança e segurança",
  "adminInvites.header.title": "Todos os <em>convites</em>",
  "adminInvites.header.sub":
    "Todo o grafo de convites vouched: quem enviou o quê, quem aceitou, e o que ainda está aberto. Filtra por estado para auditar as ligações da rede.",
  "adminInvites.empty": "Nenhum convite corresponde a este filtro ainda.",
  "adminInvites.loadError.title": "Os convites não carregaram",
  "adminInvites.loadError.body":
    "A falha é do nosso lado, por isso a lista está vazia porque nada chegou. Tenta de novo.",
  "adminInvites.emptyForInviter": "Ainda não há convites deste membro.",
  "adminInvites.filterByInviter": "Enviado por",
  "adminInvites.allInviters": "Qualquer pessoa",
  "adminInvites.filter.all": "Todos",
  "adminInvites.filter.valid": "Pendentes",
  "adminInvites.filter.used": "Aceites",
  "adminInvites.filter.expired": "Expirados",
  "adminInvites.filter.revoked": "Revogados",
  "adminInvites.status.valid": "Pendente",
  "adminInvites.status.used": "Aceite",
  "adminInvites.status.expired": "Expirado",
  "adminInvites.status.revoked": "Revogado",
  "adminInvites.row.from": "De {name}",
  "adminInvites.row.toMember": "aceite por {name}",
  "adminInvites.row.toEmail": "enviado para {email}",
  "adminInvites.row.toAnyone": "link aberto, ainda sem destinatário",
  "adminInvites.row.sent": "Enviado {date}",
  "adminInvites.row.expires": "expira {date}",
  "adminInvites.row.open": "Ver convite {code}",
  "adminInvites.loadMore": "Carregar mais",
  "adminInvites.loadingMore": "A carregar…",
  "adminInvites.drawer.label": "Convite {code}",
  "adminInvites.drawer.copyCode": "Copiar código",
  "adminInvites.drawer.copied": "Código do convite copiado",
  "adminInvites.drawer.copyFailed": "Não foi possível copiar o código",
  "adminInvites.drawer.fromLabel": "Convidado por",
  "adminInvites.drawer.recipientLabel": "Destinatário",
  "adminInvites.drawer.acceptedByLabel": "Aceite por",
  "adminInvites.drawer.recipientAnyone":
    "Link aberto, qualquer pessoa pode aceitar",
  "adminInvites.drawer.createdLabel": "Criado",
  "adminInvites.drawer.expiresLabel": "Expira",
  "adminInvites.drawer.dateTime": "{date} às {time}",
  "adminInvites.drawer.inviteMessageLabel": "Mensagem do convite",
  "adminInvites.drawer.vouchMessageLabel": "Mensagem de recomendação",
  "adminInvites.quota.manageCta": "Gerir quotas de convites",
  "adminInvites.quota.modalEyebrow": "Limites de recursos",
  "adminInvites.quota.modalTitle": "Quotas de convites",
  "adminInvites.quota.modalHint":
    "Define quantos convites um membro pode enviar por mês. Limpa o campo para usar o valor predefinido da plataforma.",
  "adminInvites.quota.sentCount": "{count} enviados",
  "adminInvites.quota.fieldLabel": "Quota mensal",
  "adminInvites.quota.defaultPlaceholder": "Predefinido",
  "adminInvites.quota.inputAriaLabel": "Quota mensal de convites de {name}",
  "adminInvites.quota.saveCta": "Guardar",
  "adminInvites.quota.saveAriaLabel": "Guardar quota de convites de {name}",
  "adminInvites.quota.clearCta": "Repor predefinição",
  "adminInvites.quota.clearAriaLabel":
    "Repor a quota de convites de {name} para a predefinição",
  "adminInvites.quota.invalid":
    "Introduz um número inteiro de 0 ou mais, ou limpa o campo.",
  "adminInvites.quota.saved": "Quota de convites de {name} guardada.",
  "adminInvites.quota.cleared":
    "{name} voltou à quota de convites predefinida.",
  "adminInvites.revoke.cta": "Revogar este convite",
  "adminInvites.revoke.confirmTitle": "Revogar o convite {code}?",
  "adminInvites.revoke.confirmBody":
    "A ligação deixa de funcionar de imediato e {name} continua sem a vaga que gastou da quota deste mês. Quem tiver a ligação vai vê-la como revogada. Não dá para anular, mas {name} pode enviar um convite novo.",
  "adminInvites.revoke.confirmCta": "Revogar convite",
  "adminInvites.revoke.doneToast": "O convite {code} está revogado.",
  "adminInvites.revoke.movedOnToast":
    "Esse convite já foi aceite, revogado ou expirou. Reabre a lista para veres o estado atual.",
  "adminInvites.revoke.failedToast":
    "Não foi possível revogar esse convite. Tenta de novo.",

  "adminCommissionInterests.title": "Interesse em <em>encomendas</em>",
  "adminCommissionInterests.header.eyebrow": "Cultura",
  "adminCommissionInterests.header.title":
    "Interesse no <em>quadro de encomendas</em>",
  "adminCommissionInterests.header.sub":
    "Todos os membros que manifestaram interesse num projeto do Quadro de Encomendas: que briefing, com quem querem trabalhar e a sua nota. Filtra por categoria.",
  "adminCommissionInterests.empty":
    "Nenhum interesse corresponde a este filtro ainda.",
  "adminCommissionInterests.error":
    "Não foi possível carregar o interesse em encomendas. Tenta novamente.",
  "adminCommissionInterests.unknownMember": "Um antigo membro",
  "adminCommissionInterests.filter.all": "Todos",
  "adminCommissionInterests.row.from": "De {name}",
  "adminCommissionInterests.row.to": "a contactar {name}",
  "adminCommissionInterests.row.sent": "Enviado {date}",
  "adminCommissionInterests.loadMore": "Carregar mais",
  "adminCommissionInterests.loadingMore": "A carregar…",

  "adminChangemakerNominations.title":
    "Nomeações de <em>agentes de mudança</em>",
  "adminChangemakerNominations.header.eyebrow": "Comunidade",
  "adminChangemakerNominations.header.title":
    "Quem os membros <em>propõem</em>",
  "adminChangemakerNominations.header.sub":
    "Todos os nomes que os membros nomearam para o diretório de Agentes de Mudança, dos mais recentes primeiro. Uma lista para rever.",
  "adminChangemakerNominations.empty": "Ainda não há nomeações.",
  "adminChangemakerNominations.error":
    "Não foi possível carregar as nomeações. Tenta novamente.",
  "adminChangemakerNominations.unknownMember": "Um antigo membro",
  "adminChangemakerNominations.withheldMember": "Não visível aqui",
  "adminChangemakerNominations.row.by": "Nomeado por {name}",
  "adminChangemakerNominations.row.memberLabel": "Perfil na QueerPulse",
  "adminChangemakerNominations.row.contactLabel": "Onde encontrar",
  "adminChangemakerNominations.row.sent": "Enviado {date}",
  "adminChangemakerNominations.row.reviewedBy": "Revisto por {name}",
  "adminChangemakerNominations.status.pending": "Pendente",
  "adminChangemakerNominations.status.approved": "Aprovada",
  "adminChangemakerNominations.status.dismissed": "Recusada",
  "adminChangemakerNominations.row.approveCta": "Aprovar",
  "adminChangemakerNominations.row.dismissCta": "Recusar",
  "adminChangemakerNominations.row.reviewNotePlaceholder":
    "Nota opcional para quem nomeou",
  "adminChangemakerNominations.loadMore": "Carregar mais",
  "adminChangemakerNominations.loadingMore": "A carregar…",

  "adminReadingGroupProposals.title": "Propostas de <em>grupos de leitura</em>",
  "adminReadingGroupProposals.header.eyebrow": "Comunidade",
  "adminReadingGroupProposals.header.title":
    "Grupos que os membros <em>querem criar</em>",
  "adminReadingGroupProposals.header.sub":
    "Todos os “Cria o teu grupo” que um membro submeteu: o livro, o porquê, o formato e o tamanho. Filtra por formato.",
  "adminReadingGroupProposals.empty":
    "Nenhuma proposta corresponde a este filtro ainda.",
  "adminReadingGroupProposals.error":
    "Não foi possível carregar as propostas. Tenta novamente.",
  "adminReadingGroupProposals.unknownMember": "Um antigo membro",
  "adminReadingGroupProposals.filter.all": "Todos",
  "adminReadingGroupProposals.format.In-person": "Presencial",
  "adminReadingGroupProposals.format.Online": "Online",
  "adminReadingGroupProposals.format.Either": "Qualquer",
  "adminReadingGroupProposals.row.by": "Proposto por {name}",
  "adminReadingGroupProposals.row.maxPeople": "até {count} pessoas",
  "adminReadingGroupProposals.row.sent": "Enviado {date}",
  "adminReadingGroupProposals.status.pending": "Pendente",
  "adminReadingGroupProposals.status.approved": "Aprovada",
  "adminReadingGroupProposals.status.declined": "Recusada",
  "adminReadingGroupProposals.status.archived": "Arquivada",
  "adminReadingGroupProposals.action.approve": "Aprovar",
  "adminReadingGroupProposals.action.decline": "Recusar",
  "adminReadingGroupProposals.action.archive": "Arquivar",
  "adminReadingGroupProposals.toast.approved": "Proposta aprovada.",
  "adminReadingGroupProposals.toast.declined": "Proposta recusada.",
  "adminReadingGroupProposals.toast.archived": "Proposta arquivada.",
  "adminReadingGroupProposals.toast.error":
    "Não foi possível concluir. Tenta novamente.",
  "adminReadingGroupProposals.loadMore": "Carregar mais",
  "adminReadingGroupProposals.loadingMore": "A carregar…",

  "adminGuideFeedback.title": "Feedback dos <em>guias</em>",
  "adminGuideFeedback.header.eyebrow": "Recursos",
  "adminGuideFeedback.header.title": "O que está realmente a <em>ajudar</em>",
  "adminGuideFeedback.header.sub":
    "Todos os guias de recursos que os membros avaliaram como úteis ou não, dos piores para os melhores.",
  "adminGuideFeedback.empty": "Ainda não há avaliações de guias.",
  "adminGuideFeedback.error":
    "Não foi possível carregar o feedback dos guias. Tenta novamente.",
  "adminGuideFeedback.loadError.title":
    "As avaliações dos guias não carregaram",
  "adminGuideFeedback.loadError.body":
    "A falha é do nosso lado. Podem existir avaliações que esta página não conseguiu ler. Tenta de novo.",
  "adminGuideFeedback.row.counts": "{helpful} úteis · {notHelpful} não úteis",

  "adminConcerns.title": "Preocupações <em>levantadas</em>",
  "adminConcerns.header.eyebrow": "Confiança e segurança",
  "adminConcerns.header.title": "O que os membros <em>estão a sinalizar</em>",
  "adminConcerns.header.sub":
    "Todas as preocupações submetidas pelo formulário de governação: denúncias, contestações e problemas. Filtra por estado de triagem e marca cada uma como em análise, resolvida ou descartada.",
  "adminConcerns.empty": "Nenhuma preocupação corresponde a este filtro ainda.",
  "adminConcerns.error":
    "Não foi possível carregar as preocupações. Tenta novamente.",
  "adminConcerns.filter.all": "Todas",
  "adminConcerns.category.member": "Pessoa ou comportamento",
  "adminConcerns.category.gathering": "Convívio ou evento",
  "adminConcerns.category.content": "Conteúdo ou plataforma",
  "adminConcerns.category.appeal": "Contestação de moderação",
  "adminConcerns.category.other": "Outra coisa",
  "adminConcerns.status.new": "Nova",
  "adminConcerns.status.reviewing": "Em análise",
  "adminConcerns.status.resolved": "Resolvida",
  "adminConcerns.status.dismissed": "Descartada",
  "adminConcerns.row.contact": "Contacto: {contact}",
  "adminConcerns.row.sent": "Enviada {date}",
  "adminConcerns.contact.anon": "Sem contacto deixado",
  "adminConcerns.action.reviewing": "Marcar em análise",
  "adminConcerns.action.resolved": "Resolver",
  "adminConcerns.action.dismissed": "Descartar",
  "adminConcerns.toast.reviewing": "Marcada como em análise.",
  "adminConcerns.toast.resolved": "Preocupação resolvida.",
  "adminConcerns.toast.dismissed": "Preocupação descartada.",
  "adminConcerns.toast.error": "Não foi possível concluir. Tenta novamente.",
  "adminConcerns.loadMore": "Carregar mais",
  "adminConcerns.loadingMore": "A carregar…",

  // ── ACQ-03: consola de submissões em /admin/intakes ────────────────
  "adminIntakes.title": "Tudo o que <em>nos enviaram</em>",
  "adminIntakes.header.eyebrow": "Receção",
  "adminIntakes.header.title": "O que as pessoas <em>nos enviaram</em>",
  "adminIntakes.header.sub":
    "Todos os formulários da plataforma vão parar a uma de duas caixas: os formulários de submissão (bolsas, sugestões de correção, ofertas para eventos sem álcool, inscrições no painel, incubadora e cultura) e as mensagens enviadas pela página de contacto. É aqui que uma pessoa as lê.",
  "adminIntakes.header.noEmailNote":
    "A QueerPulse não envia email. Marcar como tratada regista que alguém leu. Qualquer resposta sai da tua própria caixa de correio, para o endereço que vem na mensagem.",

  "adminIntakes.tab.waiting": "À espera",
  "adminIntakes.tab.intakes": "Formulários",
  "adminIntakes.tab.inquiries": "Mensagens",

  "adminIntakes.waiting.allClear":
    "Nada está à espera. Todas as mensagens e todas as submissões já foram vistas.",
  "adminIntakes.waiting.inquiriesHeading_one": "{count} mensagem à espera",
  "adminIntakes.waiting.inquiriesHeading_other": "{count} mensagens à espera",
  "adminIntakes.waiting.inquiriesNote":
    "Enviadas pela página de contacto. Algumas são de pessoas que não conseguiram entrar na conta ou obter um convite, por isso não tinham outro sítio para onde ir.",
  "adminIntakes.waiting.inquiriesEmpty": "Nenhuma mensagem está à espera.",
  "adminIntakes.waiting.intakesHeading_one": "{count} submissão à espera",
  "adminIntakes.waiting.intakesHeading_other": "{count} submissões à espera",
  "adminIntakes.waiting.intakesNote":
    "Candidaturas a bolsas, sugestões de correção, inscrições e tudo o que os formulários da incubadora e da cultura recolhem.",
  "adminIntakes.waiting.intakesEmpty": "Nenhuma submissão está à espera.",
  "adminIntakes.waiting.today": "Chegou hoje",
  "adminIntakes.waiting.days_one": "À espera há {count} dia",
  "adminIntakes.waiting.days_other": "À espera há {count} dias",

  "adminIntakes.filter.allKinds": "Todos os tipos",
  "adminIntakes.filter.allStatuses": "Todos os estados",
  "adminIntakes.filter.kindLabel": "Filtrar por tipo",
  "adminIntakes.filter.statusLabel": "Filtrar por estado",
  "adminIntakes.inquiryWaitingNote_one": "{count} mensagem ainda à espera.",
  "adminIntakes.inquiryWaitingNote_other": "{count} mensagens ainda à espera.",

  "adminIntakes.empty": "Nenhuma submissão corresponde a estes filtros.",
  "adminIntakes.error":
    "Não foi possível carregar as submissões. Tenta novamente.",
  "adminIntakes.inquiryEmpty": "Nenhuma mensagem corresponde a estes filtros.",
  "adminIntakes.inquiryError":
    "Não foi possível carregar as mensagens. Tenta novamente.",
  "adminIntakes.loadMore": "Carregar mais",
  "adminIntakes.loadingMore": "A carregar…",

  "adminIntakes.kind.grant": "Candidatura a microbolsa",
  "adminIntakes.kind.suggest_edit": "Sugestão de correção",
  "adminIntakes.kind.sober_host": "Oferta para evento sem álcool",
  "adminIntakes.kind.panel_signup": "Inscrição no painel de bolsas",
  "adminIntakes.kind.incubator_cohort": "Candidatura à incubadora",
  "adminIntakes.kind.incubator_mentor": "Oferta para mentoria",
  "adminIntakes.kind.incubator_session": "Pedido de sessão de mentoria",
  "adminIntakes.kind.culture_suggest_pick": "Sugestão para o clube de leitura",
  "adminIntakes.kind.culture_post_project": "Projeto no mural de encomendas",
  "adminIntakes.kind.culture_submit_work": "Submissão para a montra",
  "adminIntakes.kind.culture_submit_playlist": "Submissão de playlist",
  "adminIntakes.kind.governance_concern": "Preocupação de governação",

  "adminIntakes.status.new": "À espera",
  "adminIntakes.status.reviewed": "Lida",
  "adminIntakes.status.reviewing": "Em análise",
  "adminIntakes.status.resolved": "Resolvida",
  "adminIntakes.status.dismissed": "Descartada",

  "adminIntakes.inquiryKind.contact": "Contacto",
  "adminIntakes.inquiryKind.partner": "Parceria",
  "adminIntakes.inquiryStatus.new": "À espera",
  "adminIntakes.inquiryStatus.handled": "Tratada",

  "adminIntakes.row.fromMember": "De",
  "adminIntakes.row.contactEmail": "Contacta em {email}",
  "adminIntakes.row.contactName": "Deixou o nome: {name}",
  "adminIntakes.row.noContact": "Não ficou nenhuma forma de contacto.",
  "adminIntakes.row.org": "Organização: {org}",
  "adminIntakes.row.arrived": "Chegou a {date}",
  "adminIntakes.row.reviewedBy": "Lida a {date} por {name}",
  "adminIntakes.row.reviewedNoOne":
    "Lida a {date}. Não ficou registado quem a leu.",
  "adminIntakes.row.handledBy": "Tratada a {date} por {name}",
  "adminIntakes.row.handledNoOne":
    "Tratada a {date}. Não ficou registado quem a tratou.",

  "adminIntakes.confidential.body":
    "Chegou uma preocupação de governação. O conteúdo fica na página de preocupações, onde pode ser tratado por inteiro.",
  "adminIntakes.confidential.openCta": "Abrir em Preocupações",

  "adminIntakes.action.reviewed": "Marcar como lida",
  "adminIntakes.action.markHandled": "Marcar como tratada",
  "adminIntakes.action.reopen": "Reabrir",

  "adminIntakes.toast.reviewed": "Marcada como lida.",
  "adminIntakes.toast.handled": "Marcada como tratada.",
  "adminIntakes.toast.reopened": "Voltou para à espera.",
  "adminIntakes.toast.error": "Não foi possível concluir. Tenta novamente.",

  "adminIntakes.payload.empty":
    "Esta submissão chegou sem nenhum campo preenchido.",
  "adminIntakes.field.about": "Sobre o trabalho",
  "adminIntakes.field.applicantName": "Quem se candidata",
  "adminIntakes.field.author": "Autoria",
  "adminIntakes.field.budgetItems": "Linhas do orçamento",
  "adminIntakes.field.budgetTotal": "Total do orçamento",
  "adminIntakes.field.change": "Alteração sugerida",
  "adminIntakes.field.context": "Página",
  "adminIntakes.field.description": "Descrição",
  "adminIntakes.field.detail": "Detalhes",
  "adminIntakes.field.email": "Email",
  "adminIntakes.field.expertise": "Área",
  "adminIntakes.field.format": "Formato",
  "adminIntakes.field.link": "Ligação",
  "adminIntakes.field.lookingFor": "Procura",
  "adminIntakes.field.medium": "Meio",
  "adminIntakes.field.mentorName": "Quem dá mentoria",
  "adminIntakes.field.mentorRole": "Área da mentoria",
  "adminIntakes.field.message": "Mensagem",
  "adminIntakes.field.mode": "Oferece",
  "adminIntakes.field.name": "Nome",
  "adminIntakes.field.note": "Nota",
  "adminIntakes.field.pitch": "Proposta",
  "adminIntakes.field.projectName": "Projeto",
  "adminIntakes.field.projectSummary": "O que é",
  "adminIntakes.field.term": "Entrada",
  "adminIntakes.field.title": "Título",
  "adminIntakes.field.vibes": "Ambiente",
  "adminIntakes.field.when": "Disponibilidade",
  "adminIntakes.field.why": "Porquê",

  "adminMagazineSubmissions.title": "Propostas de <em>histórias</em>",
  "adminMagazineSubmissions.header.eyebrow": "Revista",
  "adminMagazineSubmissions.header.title": "Propostas dos <em>leitores</em>",
  "adminMagazineSubmissions.header.sub":
    "Todas as propostas de histórias que os leitores enviaram à revista: o título provisório, o formato, a proposta e o estado. Filtra por estado.",
  "adminMagazineSubmissions.empty":
    "Nenhuma proposta corresponde a este filtro ainda.",
  "adminMagazineSubmissions.error":
    "Não foi possível carregar as propostas. Tenta novamente.",
  "adminMagazineSubmissions.unknownMember": "Um antigo membro",
  "adminMagazineSubmissions.filter.all": "Todas",
  "adminMagazineSubmissions.filter.submitted": "Submetidas",
  "adminMagazineSubmissions.filter.in_review": "Em análise",
  "adminMagazineSubmissions.filter.accepted": "Aceites",
  "adminMagazineSubmissions.filter.rejected": "Recusadas",
  "adminMagazineSubmissions.filter.published": "Publicadas",
  "adminMagazineSubmissions.filter.draft": "Rascunho",
  "adminMagazineSubmissions.status.submitted": "Submetida",
  "adminMagazineSubmissions.status.in_review": "Em análise",
  "adminMagazineSubmissions.status.accepted": "Aceite",
  "adminMagazineSubmissions.status.rejected": "Recusada",
  "adminMagazineSubmissions.status.published": "Publicada",
  "adminMagazineSubmissions.status.draft": "Rascunho",
  "adminMagazineSubmissions.status.commissioned": "Encomendada",
  "adminMagazineSubmissions.row.by": "De {name}",
  "adminMagazineSubmissions.row.sent": "Enviado {date}",
  "adminMagazineSubmissions.row.decided": "Decidido {date}",
  "adminMagazineSubmissions.row.readPiece": "Ler o texto completo",
  "adminMagazineSubmissions.row.coverAlt": "Capa enviada com {title}",
  "adminMagazineSubmissions.row.reply": "Resposta enviada: {note}",
  "adminMagazineSubmissions.row.replyLabel": "Resposta a quem escreveu",
  "adminMagazineSubmissions.row.replyPlaceholder":
    "Resposta opcional a quem escreveu",
  "adminMagazineSubmissions.row.declineCta": "Recusar",
  "adminMagazineSubmissions.row.acceptCta": "Aceitar",
  "adminMagazineSubmissions.row.commissionCta": "Encomendar",
  "adminMagazineSubmissions.loadMore": "Carregar mais",
  "adminMagazineSubmissions.loadingMore": "A carregar…",

  "adminWriterApplications.title": "Candidaturas a <em>escritor</em>",
  "adminWriterApplications.header.eyebrow": "Revista",
  "adminWriterApplications.header.title": "Candidaturas a <em>escritor</em>",
  "adminWriterApplications.header.sub":
    "Membros a candidatarem-se a escrever para a revista, com a sua proposta e amostra de escrita.",
  "adminWriterApplications.filter.all": "Todas",
  "adminWriterApplications.filter.pending": "Pendentes",
  "adminWriterApplications.filter.approved": "Aprovadas",
  "adminWriterApplications.filter.declined": "Recusadas",
  "adminWriterApplications.status.pending": "Pendente",
  "adminWriterApplications.status.approved": "Aprovada",
  "adminWriterApplications.status.declined": "Recusada",
  "adminWriterApplications.row.sampleLink": "Amostra ligada",
  "adminWriterApplications.row.approveCta": "Aprovar",
  "adminWriterApplications.row.declineCta": "Recusar",
  "adminWriterApplications.row.reviewNotePlaceholder":
    "Nota opcional para o candidato",
  "adminWriterApplications.unknownMember": "Um membro",
  "adminWriterApplications.error": "Não foi possível carregar as candidaturas.",
  "adminWriterApplications.empty": "Ainda não há candidaturas.",
  "adminWriterApplications.loadMore": "Carregar mais",
  "adminWriterApplications.loadingMore": "A carregar…",

  "adminListings.title": "Espaços do <em>diretório</em>",
  "adminListings.header.eyebrow": "Moderação",
  "adminListings.header.title": "Rever <em>submissões</em>",
  "adminListings.header.sub":
    "Todos os espaços que alguém adicionou ao diretório. Avança um espaço quando estiver pronto, ou devolve-o com uma pergunta rápida.",
  "adminListings.emptyQueue.title": "Já estás em <em>dia</em>",
  "adminListings.emptyQueue.body":
    "Todas as submissões já têm o seu lugar. Não há nada à tua espera agora. Novas listagens aparecem aqui assim que alguém as adicionar.",
  "adminListings.unknownSubmitter": "Membro desconhecido",
  "adminListings.row.submittedAgo": "Enviado {time}",
  "adminListings.filter.all": "Todos",
  "adminListings.filter.review": "Em revisão",
  "adminListings.filter.question": "Pergunta rápida",
  "adminListings.filter.live": "Publicado",
  "adminListings.filter.ariaLabel": "Filtrar por estado",
  "adminListings.filter.countedLabel": "{label} ({count})",
  "adminListings.search.placeholder": "Pesquisar por nome, autor ou ref…",
  "adminListings.search.ariaLabel": "Pesquisar listagens",
  "adminListings.sort.label": "Ordenar",
  "adminListings.sort.newest": "Mais recentes",
  "adminListings.sort.oldest": "Mais antigas",
  "adminListings.sort.name": "Nome",
  "adminListings.view.ariaLabel": "Mudar de vista",
  "adminListings.status.review": "Em revisão",
  "adminListings.status.question": "Pergunta rápida",
  "adminListings.status.live": "Publicado",
  "adminListings.advance.question": "Fazer uma pergunta",
  "adminListings.advance.live": "Publicar",
  "adminListings.sendBackCta": "Voltar a revisão",
  "adminListings.toast.moved": "{name} movido para {status}.",
  "adminListings.viewCta": "Ver e pré-visualizar",
  "adminListings.preview.sub":
    "Exatamente como esta página ficará quando estiver publicada no diretório.",
  "adminListings.ask.eyebrow": "Fazer uma pergunta",
  "adminListings.ask.title": "Perguntar sobre {name}",
  "adminListings.ask.sub": "Vamos enviar isto a {name} como mensagem.",
  "adminListings.ask.label": "A tua pergunta",
  "adminListings.ask.helper":
    "Sê caloroso/a e específico/a. A pessoa recebe como mensagem direta e pode responder ali mesmo.",
  "adminListings.ask.placeholder":
    "Olá! Antes de publicarmos, podias confirmar…",
  "adminListings.ask.send": "Enviar pergunta",
  "adminListings.ask.cancel": "Cancelar",
  "adminListings.ask.sent": "A tua pergunta está a caminho de {name}.",
  "adminListings.ask.action": "enviar a tua pergunta",
  "adminListings.ask.noSubmitter":
    "Esta página não tem nenhum membro associado. Não há a quem enviar a pergunta.",
  "adminListings.view.queue": "Submissões",
  "adminListings.view.editSuggestions": "Sugestões de edição",
  "adminListings.remove.cta": "Remover",
  "adminListings.actions.moreAriaLabel": "Mais ações para {name}",
  "adminListings.remove.confirm.title": "Remover {name}?",
  "adminListings.remove.confirm.body":
    "Isto elimina a listagem permanentemente e não pode ser desfeito. Quem submeteu não será notificado.",
  "adminListings.remove.confirm.liveWarning":
    "Esta listagem está live. Removê-la também a retira imediatamente do diretório público.",
  "adminListings.remove.confirm.confirmCta": "Remover listagem",
  "adminListings.remove.toast.removed": "{name} foi removido.",
  "adminListings.loadMoreCta": "Carregar mais",
  "adminListings.selectAll.ariaLabel": "Selecionar todas as listagens visíveis",
  "adminListings.selectAll.label": "Selecionar todos os visíveis",
  "adminListings.selectRow.ariaLabel": "Selecionar {name}",
  "adminListings.bulk.ariaLabel": "Ações em massa",
  "adminListings.bulk.selectedCount_one": "{count} selecionada",
  "adminListings.bulk.selectedCount_other": "{count} selecionadas",
  "adminListings.bulk.publishCta": "Publicar",
  "adminListings.bulk.sendBackCta": "Devolver a revisão",
  "adminListings.bulk.removeCta": "Remover",
  "adminListings.bulk.clearCta": "Limpar",
  "adminListings.bulk.capNote": "Seleção limitada a {cap} listagens",
  "adminListings.bulk.toast.success_one": "{count} listagem atualizada.",
  "adminListings.bulk.toast.success_other": "{count} listagens atualizadas.",
  "adminListings.bulk.toast.partial":
    "{updated} atualizadas, {failed} não foram.",
  "adminListings.bulk.action.publish":
    "Não foi possível publicar as listagens selecionadas",
  "adminListings.bulk.action.sendBack":
    "Não foi possível devolver as listagens selecionadas a revisão",
  "adminListings.bulk.action.remove":
    "Não foi possível remover as listagens selecionadas",
  "adminListings.bulk.confirmRemove.title_one": "Remover {count} listagem?",
  "adminListings.bulk.confirmRemove.title_other": "Remover {count} listagens?",
  "adminListings.bulk.confirmRemove.body_one":
    "Isto elimina permanentemente a listagem selecionada e não pode ser desfeito. Quem submeteu não será notificado.",
  "adminListings.bulk.confirmRemove.body_other":
    "Isto elimina permanentemente as {count} listagens selecionadas e não pode ser desfeito. Quem submeteu não será notificado.",
  "adminListings.bulk.confirmRemove.reasonLabel": "Motivo (opcional)",
  "adminListings.bulk.confirmRemove.reasonPlaceholder":
    "Adiciona uma nota para o registo…",
  "adminListings.bulk.confirmRemove.confirmCta": "Remover listagens",
  "adminListings.remove.confirm.reasonLabel": "Motivo (opcional)",
  "adminListings.remove.confirm.reasonPlaceholder":
    "Adiciona uma nota para o registo…",
  "adminListings.sendBack.confirm.title": "Devolver {name} a revisão?",
  "adminListings.sendBack.confirm.body":
    "{name} volta para a fila de revisão. Adiciona uma nota rápida se ajudar na próxima passagem.",
  "adminListings.sendBack.confirm.reasonLabel": "Motivo (opcional)",
  "adminListings.sendBack.confirm.reasonPlaceholder":
    "O que precisa de outro olhar…",
  "adminListings.sendBack.confirm.confirmCta": "Devolver a revisão",
  // ── Histórico da gaveta + fio de perguntas e respostas ────────────────────────
  "adminListings.history.eventsHeading": "Histórico de moderação",
  "adminListings.history.questionsHeading": "Perguntas",
  "adminListings.history.error":
    "Não foi possível carregar o histórico desta listagem.",
  "adminListings.history.emptyEvents": "Ainda sem ações de moderação.",
  "adminListings.history.emptyQuestions": "Ainda sem perguntas.",
  "adminListings.history.unknownActor": "Um moderador",
  "adminListings.history.event.statusChanged":
    "{actor} moveu isto de {from} para {to}.",
  "adminListings.history.event.bulkStatus":
    "{actor} moveu isto de {from} para {to} (ação em massa).",
  "adminListings.history.event.removed": "{actor} removeu esta listagem.",
  "adminListings.history.event.questionAsked": "{actor} fez uma pergunta.",
  "adminListings.history.event.answered": "{actor} respondeu a uma pergunta.",
  "adminListings.history.askedBy": "Perguntado por {actor}",
  "adminListings.history.awaitingReply": "A aguardar resposta",

  // ── Imagens enviadas (consola de media do admin) ─────────────────────────
  "media.title": "Imagens <em>enviadas</em>",
  "media.header.eyebrow": "Ferramenta de segurança",
  "media.header.title": "Imagens <em>enviadas</em>",
  "media.header.sub":
    "Todos os objetos guardados no bucket de uploads da plataforma, com dono e detalhes de armazenamento por ficheiro para revisão de segurança.",
  "media.filterAriaLabel": "Filtrar por tipo de upload",
  "media.kinds.all": "Tudo",
  "media.kinds.avatars": "Avatares",
  "media.kinds.work": "Imagens de trabalho",
  "media.kinds.story-covers": "Capas de história",
  "media.kinds.persona-covers": "Banners de persona",
  "media.kinds.gathering-photos": "Fotos de encontros",
  "media.kinds.group-avatars": "Avatares de grupo",
  "media.kinds.listing-photos": "Fotos de espaços",
  "media.usage.filterAriaLabel": "Filtrar por ficheiros ainda em uso",
  "media.usage.all": "Tudo",
  "media.usage.inUse": "Em uso",
  "media.usage.unused": "Sem uso",
  "media.usage.scanning_one":
    "Nada corresponde no primeiro ficheiro. A carregar mais do bucket…",
  "media.usage.scanning_other":
    "Nada corresponde nos primeiros {count} ficheiros. A carregar mais do bucket…",
  "media.usage.scannedNote_one":
    "Verificado um ficheiro até agora. Vê mais para continuar a procurar.",
  "media.usage.scannedNote_other":
    "Verificados {count} ficheiros até agora. Vê mais para continuar a procurar.",
  "media.usage.noMatchYet": "Sem correspondência por agora",
  "media.usage.empty.unused.title": "Nada sem uso aqui",
  "media.usage.empty.unused.body":
    "Todos os ficheiros desta vista continuam referenciados algures.",
  "media.usage.empty.in-use.title": "Nada em uso aqui",
  "media.usage.empty.in-use.body":
    "Nenhum ficheiro desta vista está referenciado em lado nenhum.",
  "media.unowned": "Sem dono",
  "media.openAriaLabel": "Inspecionar {key}",
  "media.uploaderFilterAriaLabel":
    "{name}. Mostrar apenas os ficheiros desta pessoa.",
  "media.unknown": "Desconhecido",
  "media.loadMore": "Ver mais",
  "media.openFile": "Abrir URL do ficheiro",
  "media.copyPresigned": "Copiar URL assinado",
  "media.copyKey": "Copiar chave",
  "media.copiedPresigned": "URL assinado copiado",
  "media.copiedKey": "Chave copiada",
  "media.inspectRealType": "Inspecionar tipo real",
  "media.spoofWarning": "não corresponde à extensão",
  "media.deleteFile": "Eliminar ficheiro",
  "media.delete.eyebrow": "Eliminar ficheiro",
  "media.delete.confirmTitle": "Eliminar este ficheiro definitivamente?",
  "media.delete.confirmBody":
    "Isto remove o ficheiro do armazenamento de forma permanente. Se um perfil, anúncio ou publicação ainda apontar para ele, essa imagem deixa de carregar. Não é possível anular.",
  "media.delete.confirmBodyInUse_one":
    "Este ficheiro ainda está referenciado num local, listado abaixo. Ao eliminá-lo agora, essa imagem deixa de carregar. Não é possível anular.",
  "media.delete.confirmBodyInUse_other":
    "Este ficheiro ainda está referenciado em {count} locais, listados abaixo. Ao eliminá-lo agora, essas imagens deixam de carregar. Não é possível anular.",
  "media.delete.confirm": "Eliminar ficheiro",
  "media.delete.pending": "A eliminar…",
  "media.delete.success": "Ficheiro eliminado",
  "media.field.key": "Chave de armazenamento",
  "media.field.uploader": "Quem enviou",
  "media.field.declaredType": "Tipo declarado (pela extensão)",
  "media.field.realType": "Tipo real guardado",
  "media.drawer.ariaLabel": "Detalhes do objeto",
  "media.empty.title": "Sem objetos",
  "media.empty.body": "Ainda não há nada guardado neste tipo.",
  "media.demo.title": "Disponível apenas no modo ao vivo",
  "media.demo.body":
    "As imagens enviadas vêm do bucket de armazenamento ao vivo, por isso não há nada para mostrar no modo de demonstração.",
  "media.filterByUploader.searchPlaceholder": "Filtrar por quem enviou…",
  "media.filterByUploader.searchAriaLabel":
    "Procurar membros para filtrar os envios",
  "media.filterByUploader.noResults": "Nenhum membro corresponde a “{search}”.",
  "media.filterByUploader.activePill": "A filtrar por <strong>{name}</strong>",
  "media.filterByUploader.clearAria": "Limpar filtro de quem enviou",
  "media.filterByUploader.showAll": "Tudo deste membro",
  "media.filterByUploader.emptyForUser":
    "{name} não enviou nada para o bucket.",
  "media.references.inUseBadge": "Em uso ({count})",
  "media.references.orphanBadge": "Sem referências",
  "media.references.heading": "Referenciado em",
  "media.references.empty": "Nenhuma referência encontrada. Seguro eliminar.",
  "media.references.unverified":
    "Por verificar. Algumas verificações de referência não correram, por isso isto pode ainda estar em uso. Recarrega antes de eliminar.",
  "media.references.degradedBanner":
    "Algumas verificações de referência não correram, por isso um “Sem referências” vazio fica por verificar nesta página. Recarrega antes de tratar qualquer ficheiro como órfão.",

  // ── Sugestões de edição ──────────────────────────────────────────────────────
  "editSuggestions.empty": "Sem correções neste filtro, por agora.",
  "editSuggestions.loadError.title": "As correções não carregaram",
  "editSuggestions.loadError.body":
    "A falha é do nosso lado, por isso nada aparece porque nada chegou. Pode haver pessoas à espera de uma correção. Tenta de novo.",
  "editSuggestions.field.hours": "Horário",
  "editSuggestions.field.address": "Morada",
  "editSuggestions.field.phone": "Número de telefone",
  "editSuggestions.field.website": "Site",
  "editSuggestions.field.description": "Descrição",
  "editSuggestions.field.other": "Outra coisa",
  "editSuggestions.filter.pending": "Pendentes",
  "editSuggestions.filter.accepted": "Aceites",
  "editSuggestions.filter.dismissed": "Descartadas",
  "editSuggestions.filter.all": "Todas",
  "editSuggestions.status.pending": "Pendente",
  "editSuggestions.status.accepted": "Aceite",
  "editSuggestions.status.dismissed": "Descartada",
  "editSuggestions.acceptCta": "Aceitar",
  "editSuggestions.dismissCta": "Descartar",
  "editSuggestions.submittedBy": "Sugerido por {name}",
  "editSuggestions.unknownSubmitter": "um membro desconhecido",
  "editSuggestions.toast.accepted": "Correção de {name} aceite.",
  "editSuggestions.toast.dismissed": "Correção de {name} descartada.",

  // ── Moderação ──────────────────────────────────────────────────────────────
  "moderation.title": "Moderação · <em>triagem</em>",
  "moderation.header.eyebrow": "Fila de moderação",
  // Título derivado do número real de denúncias em aberto (`q.counts.open`),
  // como o cabeçalho do painel — nunca um número fixo.
  "moderation.header.title_one": "Uma precisa de ti <em>primeiro</em>.",
  "moderation.header.title_other": "{count} precisam de ti <em>primeiro</em>.",
  "moderation.header.titleClear": "Ninguém à <em>espera</em>.",
  "moderation.header.sub":
    "As denúncias são ordenadas por quem está mais em risco, por isso o maior perigo vem primeiro, seja qual for a ordem de chegada. Outing e doxxing sobem sempre ao topo, com um prazo mais apertado de 1 hora. Cada ação regista um motivo que a pessoa vai ler.",
  "moderation.tabs.open": "Em aberto",
  "moderation.tabs.appeals": "Recursos",
  "moderation.tabs.resolved": "Resolvidas",
  "moderation.filters.all": "Todas as gravidades",
  "moderation.filters.emergencies": "Emergências",
  "moderation.filters.mine": "Atribuídas a mim",
  "moderation.filterAriaLabel": "Filtrar denúncias",
  "moderation.subjectFilter.label": "Filtrado para @{subjectId}",
  "moderation.subjectFilter.clearAriaLabel": "Limpar filtro",

  "moderation.selectReportAriaLabel": "Selecionar denúncia: {title}",
  "moderation.reportedByLabel": "Denunciado por",
  "moderation.aboutLabel": "Sobre",
  "moderation.bulk.ariaLabel": "Ações em lote",
  "moderation.bulk.selectedCount_one": "{count} selecionada",
  "moderation.bulk.selectedCount_other": "{count} selecionadas",
  "moderation.bulk.dismissCta": "Rejeitar",
  "moderation.bulk.spamCta": "Remover como spam",
  "moderation.bulk.escalateCta": "Escalar",
  "moderation.bulk.warnCta": "Advertir",
  "moderation.bulk.suspendCta": "Suspender…",
  "moderation.bulk.banCta": "Banir",
  "moderation.bulk.cancelCta": "Cancelar",
  "moderation.bulk.confirm.title.removeContent_one":
    "Remover o conteúdo de {count} denúncia",
  "moderation.bulk.confirm.title.removeContent_other":
    "Remover o conteúdo de {count} denúncias",
  "moderation.bulk.confirm.title.warn_one": "Advertir {count} membro",
  "moderation.bulk.confirm.title.warn_other": "Advertir {count} membros",
  "moderation.bulk.confirm.title.suspend_one": "Suspender {count} membro",
  "moderation.bulk.confirm.title.suspend_other": "Suspender {count} membros",
  "moderation.bulk.confirm.title.ban_one": "Banir {count} membro",
  "moderation.bulk.confirm.title.ban_other": "Banir {count} membros",
  "moderation.bulk.confirm.body_one":
    "Isto aplica-se à denúncia que selecionaste. Indica um motivo e escreve a nota que a pessoa vai ler.",
  "moderation.bulk.confirm.body_other":
    "Isto aplica-se às {count} denúncias que selecionaste. Indica um motivo e escreve a nota que todas essas pessoas vão ler.",
  "moderation.bulk.confirm.durationLabel": "Durante quanto tempo",
  "moderation.bulk.confirm.notePlaceholder":
    "O que aconteceu e o que se segue. Toda a gente deste lote lê isto.",
  "moderation.bulk.confirm.applyCta_one": "Aplicar a 1 denúncia",
  "moderation.bulk.confirm.applyCta_other": "Aplicar a {count} denúncias",
  "moderation.bulk.confirm.transparency_one":
    "A pessoa é notificada com este motivo e esta nota, e pode recorrer.",
  "moderation.bulk.confirm.transparency_other":
    "As {count} pessoas são notificadas com este motivo e esta nota, e podem recorrer.",

  "moderation.emergency.ariaLabel": "Emergências de segurança",
  "moderation.emergency.count_one": "{count} emergência de segurança",
  "moderation.emergency.count_other": "{count} emergências de segurança",
  "moderation.emergency.sub":
    "· outing e doxxing são tratados como dano urgente, com um prazo de 1 hora. Trata destas antes de tudo o resto.",

  "moderation.everythingElse": "Tudo o resto",
  "moderation.filterEmpty":
    "Nenhuma denúncia em aberto corresponde a este filtro. Tenta “Todas as gravidades”.",
  "moderation.loadMore": "Ver mais denúncias",
  "moderation.loadingMore": "A carregar mais denúncias…",

  "moderation.caughtUp.titleLine1": "Está tudo <em>em dia</em>.",
  "moderation.caughtUp.titleLine2": "Não precisas de fazer nada agora.",
  "moderation.caughtUp.sub":
    "Toda a denúncia em aberto tem uma decisão humana associada, e toda a pessoa afetada foi informada do que aconteceu e porquê. Descansa. A rede está segura nas tuas mãos.",
  "moderation.caughtUp.backCta": "Voltar ao resumo",
  "moderation.caughtUp.replayCta": "Rever a fila",
  "moderation.backToast": "A voltar ao resumo.",

  "moderation.appealsIntro":
    "Um recurso é uma pessoa a pedir-te para veres de novo. Lê a decisão original, ouve o que tem a dizer, e depois <em>mantém ou revoga</em>, com um motivo teu. Revogar a decisão de uma colega é normal e saudável.",
  "moderation.appeal.by": "Recurso de",
  "moderation.appeal.decidedBy": "Decidido por",
  "moderation.appeal.supportersFlag_one": "{count} pessoa a apoiar",
  "moderation.appeal.supportersFlag_other": "{count} pessoas a apoiar",
  "moderation.appeal.fallbackName": "pessoa",
  "moderation.resolvedSection": "Resolvidas recentemente",
  "moderation.resolvedEmpty":
    "Ainda nada resolvido. As denúncias fechadas aparecem aqui.",

  "moderation.reportDrawer.label": "Denúncia: {title}",
  "moderation.reportDrawer.title": "Um estado trans privado foi exposto",
  "moderation.reportDrawer.cancelCta": "Cancelar",
  "moderation.reportDrawer.escalateCta": "Escalar para a equipa de segurança",
  "moderation.reportDrawer.confirmCta": "Confirmar e notificar a pessoa",
  "moderation.reportDrawer.contentTitle": "Conteúdo denunciado",
  "moderation.reportDrawer.threadTitle": "Conversa em redor",
  "moderation.reportDrawer.flaggedTag": "Sinalizado",
  "moderation.reportDrawer.peopleTitle": "Pessoas envolvidas",
  "moderation.reportDrawer.disputeReasonTitle": "Motivo da contestação",
  "moderation.reportDrawer.listingEvidenceTitle": "Prova de propriedade",
  "moderation.reportDrawer.contactEmailTitle": "Contacto de quem contesta",
  "moderation.reportDrawer.contextLoading": "A carregar o contexto da denúncia",
  "moderation.reportDrawer.limitedContext":
    "Esta denúncia chegou sem a conversa completa anexada. Podes na mesma agir a partir do resumo abaixo.",
  "moderation.reportDrawer.reporterRole": "Quem denunciou",
  "moderation.reportDrawer.reportedRole": "Denunciado",
  "moderation.reportDrawer.auditTitle": "Histórico de ações",
  "moderation.reportDrawer.auditEmpty":
    "Ainda não há ações registadas. Cada decisão tua fica registada aqui.",
  "moderation.reportDrawer.decisionTitle":
    "Tomar uma decisão: proteção primeiro",
  "moderation.reportDrawer.reasonTitle":
    "Motivo: obrigatório, mostrado à pessoa",
  "moderation.reportDrawer.reasonAriaLabel": "Motivo",
  "moderation.reportDrawer.notePlaceholder":
    "Acrescenta uma nota humana. A pessoa vai lê-la. Escreve como gostarias que te falassem.",
  "moderation.reportDrawer.noteAriaLabel": "Nota para a pessoa",
  "moderation.reportDrawer.transparency":
    "Vamos dizer a {name} exatamente o que foi feito e porquê, com uma ligação para recorrer. Nada acontece em silêncio.",
  "moderation.reportDrawer.ambiguousAuthorsNote":
    "Isto abrange o que foi publicado e a resposta por baixo, e podem ter sido duas pessoas diferentes a escrever cada metade. A denúncia não regista qual das metades a pessoa queria denunciar, por isso restringir e banir podem não avançar aqui.",
  "moderation.reportDrawer.accountActionsTarget":
    "Restringir e banir atuam sobre quem publicou isto. Ocultar e remover atuam sobre o próprio conteúdo. Sem uma conta por trás, um anúncio sem dono ou uma conta apagada, restringir e banir não vão avançar.",
  "moderation.reportDrawer.restrictDurationLabel": "Duração da restrição",
  "moderation.reportDrawer.restrictDuration.24h": "24 horas",
  "moderation.reportDrawer.restrictDuration.7d": "7 dias",
  "moderation.reportDrawer.restrictDuration.30d": "30 dias",
  "moderation.reportDrawer.unassigned": "Não atribuído",
  "moderation.reportDrawer.assignedToYou": "Atribuído a ti",
  "moderation.reportDrawer.assignedTo": "Atribuído a {name}",
  "moderation.reportDrawer.anotherModerator": "outra pessoa moderadora",
  "moderation.reportDrawer.assignToMeCta": "Atribuir a mim",
  "moderation.reportDrawer.unassignCta": "Remover atribuição",
  "moderation.reportDrawer.pickActionToast":
    "Escolhe uma ação antes de confirmar.",
  "moderation.reportDrawer.escalatedToast":
    "Escalado para a equipa de segurança. A partir daqui fica com ela.",
  "moderation.reportDrawer.confirmedToast":
    "{name}: {verb}. A pessoa foi notificada.",

  "moderation.appealDrawer.label": "Recurso: {name}",
  "moderation.appealDrawer.chooseToast": "Escolhe manter ou revogar",
  "moderation.appealDrawer.reasonRequiredToast":
    "É necessário um motivo. A pessoa vai lê-lo",
  "moderation.appealDrawer.cancelCta": "Cancelar",
  "moderation.appealDrawer.recordCta": "Registar decisão",
  "moderation.appealDrawer.originalTitle": "A decisão original",
  "moderation.appealDrawer.decidedByLine": "Decidido por {name} · {when}",
  "moderation.appealDrawer.originalContentTitle":
    "O que foi originalmente denunciado",
  "moderation.appealDrawer.originalContentUnavailable":
    "O conteúdo da denúncia original não está disponível. Pode ter sido apagado, ou este recurso não tem uma denúncia associada.",
  "moderation.appealDrawer.argumentTitle": "O argumento apresentado",
  "moderation.appealDrawer.supportersTitle": "Quem está a apoiar",
  "moderation.appealDrawer.noSupport":
    "Mais ninguém se pronunciou. Isso não conta nem a favor nem contra. Muitos recursos ficam sozinhos.",
  "moderation.appealDrawer.decisionTitle": "A tua decisão",
  "moderation.appealDrawer.decisionAriaLabel": "Decisão",
  "moderation.appealDrawer.uphold": "Manter",
  "moderation.appealDrawer.upholdSub": "A decisão original mantém-se",
  "moderation.appealDrawer.overturn": "Revogar",
  "moderation.appealDrawer.overturnSub": "Anula a decisão e restaura a pessoa",
  "moderation.appealDrawer.reasonAriaLabel": "Motivo da tua decisão",
  "moderation.appealDrawer.reasonPlaceholder":
    "Explica a tua decisão por palavras tuas. A pessoa vai lê-la.",
  "moderation.appealDrawer.transparency":
    "Os recursos ficam registados como qualquer decisão. Se revogares, informamos {name} em privado e com delicadeza, e ninguém é culpabilizado.",

  "moderation.severity.emergency": "Emergência",
  "moderation.severity.high": "Alta",
  "moderation.severity.medium": "Média",
  "moderation.severity.low": "Baixa",

  "moderation.actions.dismiss.label": "Dispensar",
  "moderation.actions.dismiss.desc":
    "Nenhuma ação necessária, encerra a denúncia",
  "moderation.actions.dismiss.done": "dispensa",
  "moderation.actions.hide.label": "Ocultar conteúdo",
  "moderation.actions.hide.desc": "Remove da vista, mantém para registo",
  "moderation.actions.hide.done": "ocultação",
  "moderation.actions.warn.label": "Avisar",
  "moderation.actions.warn.desc": "Enviar um aviso formal",
  "moderation.actions.warn.done": "aviso",
  "moderation.actions.restrict.label": "Restringir",
  "moderation.actions.restrict.desc": "Limitar publicações por um período",
  "moderation.actions.restrict.done": "restrição",
  "moderation.actions.remove.label": "Remover",
  "moderation.actions.remove.desc": "Eliminar o conteúdo permanentemente",
  "moderation.actions.remove.done": "remoção",
  "moderation.actions.ban.label": "Banir",
  "moderation.actions.ban.desc": "Remover a pessoa da rede",
  "moderation.actions.ban.done": "banimento",
  "moderation.actions.actionedFallback": "ação",

  "moderation.reasons.outing":
    "Outing / partilha de identidade privada sem consentimento",
  "moderation.reasons.doxxing":
    "Partilha de dados pessoais ou de localização (doxxing)",
  "moderation.reasons.harassment": "Assédio dirigido a uma pessoa",
  "moderation.reasons.other": "Outro: explica abaixo",

  "moderation.priorReports.count_one": "{count} denúncia anterior",
  "moderation.priorReports.count_other": "{count} denúncias anteriores",
  "moderation.priorReports.newAccount":
    "Conta nova · {vouches} votos de confiança",
  "moderation.priorReports.viewAriaLabel":
    "{flag}, sobre {name}. Ver as denúncias anteriores.",
  "moderation.reporterCredibility.new": "Nova pessoa denunciante",
  "moderation.reporterCredibility.history":
    "{filed} denúncias apresentadas · {dismissed} arquivadas",
  "moderation.assignedToFlag": "Atribuído a {name}",
  "moderation.slaOverdue": "Atrasado",
  "moderation.risk.atRisk": "Em risco",
  "moderation.risk.high": "Alto",
  "moderation.risk.medium": "Médio",
  "moderation.risk.low": "Baixo",
  "moderation.status.awaiting": "A aguardar",
  "moderation.status.logged": "Registada",

  "moderation.chip.outingDoxxing": "Outing / doxxing",
  "moderation.chip.harassment": "Assédio",
  "moderation.chip.vouchAbuse": "Abuso de votos de confiança",
  "moderation.chip.spam": "Spam",
  "moderation.chip.offTopic": "Fora do tópico",
  "moderation.chip.listingDispute": "Contestação de listagem",
  "moderation.chip.appeal": "Recurso",
  "moderation.chip.identityShielded": "Identidade protegida",
  "moderation.chip.appealRestriction": "Recurso · restrição",
  "moderation.chip.appealRemoval": "Recurso · remoção",
  "moderation.chip.appealWarning": "Recurso · aviso",
  "moderation.chip.resolved": "Resolvida",

  "moderation.category.emergency": "Emergência",
  "moderation.category.harassment": "Assédio",
  "moderation.category.hateSpeech": "Discurso de ódio",
  "moderation.category.impersonation": "Personificação",
  "moderation.category.discrimination": "Discriminação",
  "moderation.category.spam": "Spam",
  "moderation.category.offTopic": "Fora do tópico",
  "moderation.category.venue": "Espaço",
  "moderation.category.other": "Outro",
  "moderation.category.report": "Denúncia",

  "moderation.queue.actionToast": "{verb} · pessoa notificada",
  "moderation.queue.verb.resolved": "Resolvida",
  "moderation.queue.verb.escalated": "Escalada",
  "moderation.queue.verb.actioned": "Processada",
  "moderation.queue.restoredToast": "Denúncia restaurada.",
  "moderation.queue.serviceErrorToast":
    "Não foi possível contactar o serviço de segurança. Restaurado.",

  "moderation.refusal.noAccount":
    "Isto não avançou: não há nenhuma conta por trás do que foi denunciado, por isso não há ninguém para restringir ou banir. Remove o conteúdo, arquiva a denúncia ou encaminha-a.",
  "moderation.refusal.ambiguousAuthors":
    "Isto não avançou: esta denúncia abrange o que foi publicado e a resposta por baixo, e foram duas pessoas diferentes a escrevê-las. O painel mostra quem publicou primeiro, por isso abre a página onde isto foi publicado, vê quem escreveu a metade que queres e age a partir do perfil dessa pessoa, ou age sobre o conteúdo.",
  "moderation.refusal.houseAccount":
    "Isto não avançou: o que foi denunciado remete para a conta da casa, que nunca é alvo de moderação. Age sobre o conteúdo ou arquiva a denúncia.",
  "moderation.refusal.staffAccount":
    "Isto não avançou: o que foi denunciado remete para uma conta de equipa, que esta fila não pode moderar. Fala com um administrador.",
  "moderation.queue.bulkPartialToast":
    "{succeededCount} com sucesso, {failedCount} falharam: {reasons}",
  "moderation.queue.bulkToast_one": "{verb} de {count} denúncia",
  "moderation.queue.bulkToast_other": "{verb} de {count} denúncias",
  "moderation.queue.bulkVerb.dismissed": "Rejeição",
  "moderation.queue.bulkVerb.removedAsSpam": "Remoção como spam",
  "moderation.queue.bulkVerb.escalated": "Escalamento",
  "moderation.queue.bulkVerb.warned": "Advertência",
  "moderation.queue.bulkVerb.suspended": "Suspensão",
  "moderation.queue.bulkVerb.banned": "Banimento",
  "moderation.queue.bulkRestoredToast": "Denúncias restauradas.",
  "moderation.queue.appealToast": "{verb} · aviso enviado a {name}",
  "moderation.queue.appealVerb.upheld": "Mantido",
  "moderation.queue.appealVerb.overturned": "Revogado",
  "moderation.queue.appealRestoredToast": "Recurso restaurado.",

  // ── Comunidades ────────────────────────────────────────────────────────────
  "communities.title": "Comunidades · <em>todos os espaços</em>",
  "communities.grid.eyebrow": "Comunidades",
  "communities.grid.titleLine1_one": "{spelled} espaço,",
  "communities.grid.titleLine1_other": "{spelled} espaços,",
  "communities.grid.titleLine1Unknown": "Espaços,",
  "communities.grid.titleLine2": "cada um <em>bem cuidado</em>.",
  "communities.grid.sub":
    "Cada comunidade tem uma pessoa moderadora que a conhece pelo nome. A saúde é o quão estável cada uma se sente: denúncias respondidas, pessoas acompanhadas, ninguém a passar despercebido.",
  "communities.grid.loadError": "Não foi possível carregar as comunidades.",
  "communities.grid.healthAriaLabel": "Saúde {score} de {name}, ver detalhe",
  "communities.grid.openAriaLabel": "Abrir {name}",
  "communities.grid.needsHand": "· precisa de uma ajuda",
  "communities.grid.stat.members": "Pessoas",
  "communities.grid.stat.activity": "Atividade",
  "communities.grid.stat.openReports": "Denúncias em aberto",
  "communities.grid.sparklineAriaLabel":
    "Atividade semanal, mais recente {value}",
  "communities.grid.emptyTitle": "<em>Ainda</em> não há espaços.",
  "communities.grid.emptyText":
    "Os espaços aqui nascem das pessoas. Quando o primeiro tomar forma, a sua saúde, as suas pessoas moderadoras e a sua fila vão aparecer aqui mesmo.",
  // Classificação de atividade calculada pelo cálculo de saúde no servidor
  // (interface, não texto obtido pela API) — ver adminCommunities.adapters.ts.
  "communities.activityLabel.quiet": "Tranquila",
  "communities.activityLabel.growing": "Em crescimento",
  "communities.activityLabel.steady": "Estável",
  "communities.activityLabel.active": "Ativa",
  "communities.activityLabel.high": "Muito ativa",
  "communities.activityLabel.busy": "Agitada",

  "communities.detail.backCta": "Todas as comunidades",
  "communities.detail.stewardedBy_one":
    "Cuidada por {count} pessoa moderadora · fundada em {founded}.",
  "communities.detail.stewardedBy_other":
    "Cuidada por {count} pessoas moderadoras · fundada em {founded}.",
  "communities.detail.foundedOnly": "Fundada em {founded}.",
  "communities.detail.healthChip": "Saúde {score} · {label}",
  "communities.detail.settingsCta": "Definições",
  "communities.detail.supportBanner.title":
    "Esta comunidade podia usar <em>uma ajuda</em>.",
  "communities.detail.supportBanner.textAlone":
    "Uma pontuação de saúde tão baixa é um pedido de apoio para quem modera. {name} está a cuidar de {members} pessoas praticamente sozinha.",
  "communities.detail.supportBanner.textThin":
    "Uma pontuação de saúde tão baixa é um pedido de apoio para quem modera. {name} está a cuidar de {members} pessoas com uma equipa reduzida.",
  "communities.detail.supportBanner.textNone":
    "Uma pontuação de saúde tão baixa é um pedido de apoio para quem modera. Esta comunidade não tem, neste momento, qualquer pessoa a moderar, e {members} pessoas dependem dela.",
  "communities.detail.supportBanner.offerCta": "Oferecer apoio",
  "communities.detail.stat.members": "Pessoas",
  "communities.detail.stat.activeThisWeek": "Ativas esta semana",
  "communities.detail.stat.openReports": "Denúncias em aberto",
  "communities.detail.stat.handled": "Tratadas",
  "communities.detail.tabs.queue": "Fila da comunidade",
  "communities.detail.tabs.members": "Pessoas",
  "communities.detail.tabs.settings": "Definições",
  "communities.detail.health.thriving": "próspera",
  "communities.detail.health.steady": "estável",
  "communities.detail.health.needsHand": "precisa de uma ajuda",

  "communities.queue.emptyTitle": "Nada em aberto, <em>nada por pagar</em>.",
  "communities.queue.emptyText":
    "Esta comunidade trata de tudo por si própria: uma taxa de {pct}% tratadas. As pessoas que a moderam raramente precisam de ti.",
  "communities.queue.moreHandled":
    "+ {count} a serem tratadas pelas próprias pessoas moderadoras da comunidade",
  "communities.queue.reviewCta": "Rever",
  "communities.members.moderatorChip": "Pessoa moderadora",
  "communities.members.seeAllCta": "Ver as {total} pessoas",
  // Subtítulo de uma pessoa moderadora, composto a partir do papel
  // owner/mod e da data de entrada da API (interface, não texto obtido pela
  // API) — ver adminCommunities.adapters.ts.
  "communities.moderators.roleLine.owner": "Fundou a comunidade",
  "communities.moderators.roleLine.mod": "Modera desde {date}",

  "communities.settings.whoCanJoin": "Quem pode entrar",
  "communities.settings.moderators": "Pessoas moderadoras",
  "communities.settings.removeModAriaLabel": "Remover {name}",
  "communities.settings.addModCta": "+ Adicionar",
  "communities.settings.addModToast":
    "Procurar pessoas para adicionar à moderação",
  "communities.settings.modRemovedToast": "Removemos {name} da moderação",
  // Gestão de moderação em modo live (adicionar/remover). O modo demo mantém o
  // comportamento simulado; o modo live liga ambos os controlos aos endpoints
  // reais de `/admin/communities/:slug/moderators`.
  "communities.settings.mod.addPickerTitle": "Adicionar moderação",
  "communities.settings.mod.pickerLoading": "A carregar pessoas…",
  "communities.settings.mod.pickerError":
    "Não foi possível carregar as pessoas. Tenta novamente.",
  "communities.settings.mod.pickerEmpty":
    "Todas as pessoas aqui já fazem parte da moderação.",
  "communities.settings.mod.addedToast": "{name} passou a fazer moderação",
  "communities.settings.mod.addFailedToast":
    "Não foi possível adicionar {name} à moderação",
  "communities.settings.mod.removeFailedToast":
    "Não foi possível remover {name} da moderação",
  "communities.settings.mod.cancelCta": "Cancelar",
  "communities.settings.secondVouch.title":
    "Exigir um segundo voto de confiança para entrar",
  "communities.settings.secondVouch.sub":
    "Torna o crescimento mais lento, aumenta a confiança. Recomendado para espaços de apoio.",
  "communities.settings.secondVouch.onToast":
    "Segundo voto de confiança agora obrigatório para entrar",
  "communities.settings.secondVouch.offToast":
    "Segundo voto de confiança deixou de ser obrigatório",
  "communities.settings.autoFreeze.title":
    "Congelar automaticamente contas novas numa denúncia de doxxing",
  "communities.settings.autoFreeze.sub":
    "Ganha tempo para uma pessoa rever antes de o dano se espalhar.",
  "communities.settings.autoFreeze.onToast":
    "Congelamento automático em denúncias de doxxing ativado",
  "communities.settings.autoFreeze.offToast":
    "Congelamento automático desativado",
  "communities.settings.featured.title": "Em destaque no Descobrir",
  "communities.settings.featured.sub":
    "Aparece como o card principal no topo da página Descobrir Comunidades. Só uma comunidade pode estar em destaque de cada vez. Ativar isto para uma comunidade substitui a que estava em destaque até agora.",
  "communities.settings.featured.onToast":
    "Esta comunidade está agora em destaque no Descobrir",
  "communities.settings.featured.offToast":
    "Esta comunidade deixou de estar em destaque",
  "communities.settings.saveErrorToast":
    "Não foi possível guardar. Tenta novamente.",
  "communities.settings.codeOfCare": "Código de cuidado",
  "communities.settings.viewCta": "Ver",
  "communities.settings.codeToast": "O código de cuidado abriria aqui",
  "communities.settings.visibility": "Visibilidade",
  "communities.settings.visibility.private": "Privada",
  "communities.settings.visibility.public": "Pública",
  "communities.settings.visibility.network": "Só na rede",
  "communities.settings.status": "Estado",
  "communities.settings.frozenChip": "Congelada · em revisão",

  // ── Sobreposições de administração (congelar/descongelar, arquivar/desarquivar, reatribuir dono) ──
  "communities.settings.overrides.title": "Sobreposições de moderação",
  "communities.settings.overrides.sub":
    "Contorna os controlos próprios de dono/moderador desta comunidade, para quando a sua liderança não pode ser contactada ou não é de confiança.",
  "communities.settings.overrides.freezeCta": "Congelar",
  "communities.settings.overrides.unfreezeCta": "Descongelar",
  "communities.settings.overrides.freezeToast": "{name} está agora congelada",
  "communities.settings.overrides.freezeFailedToast":
    "Não foi possível congelar essa comunidade. Tenta novamente.",
  "communities.settings.overrides.unfreezeToast":
    "{name} já não está congelada",
  "communities.settings.overrides.unfreezeFailedToast":
    "Não foi possível descongelar essa comunidade. Tenta novamente.",
  "communities.settings.overrides.reassignCta": "Reatribuir dono",
  "communities.settings.overrides.archiveCta": "Arquivar",
  "communities.settings.overrides.unarchiveCta": "Desarquivar",
  "communities.settings.overrides.unarchiveToast":
    "{name} já não está arquivada",
  "communities.settings.overrides.unarchiveFailedToast":
    "Não foi possível desarquivar essa comunidade. Tenta novamente.",
  "communities.settings.overrides.archiveToast": "{name} foi arquivada",
  "communities.settings.overrides.archiveFailedToast":
    "Não foi possível arquivar {name}. Tenta novamente.",
  "communities.settings.overrides.archiveConfirmTitle": "Arquivar {name}?",
  "communities.settings.overrides.archiveConfirmBody":
    "A comunidade é retirada de imediato para os membros. Um admin pode reverter isto no mesmo painel.",
  "communities.settings.overrides.archiveConfirmCta": "Arquivar comunidade",
  "communities.settings.overrides.reassignToast": "{name} é agora a dona",
  "communities.settings.overrides.reassignFailedToast":
    "Não foi possível reatribuir a propriedade. Tenta novamente.",
  "communities.settings.overrides.reassignTitle":
    "Reatribuir a propriedade de {name}",
  "communities.settings.overrides.reassignBody":
    "O membro escolhido torna-se dono de imediato. Se a comunidade já tiver uma pessoa dona, esta passa a moderadora.",
  "communities.settings.overrides.reassignEmptyTitle":
    "Ninguém a quem reatribuir",
  "communities.settings.overrides.reassignEmptyDesc":
    "Esta comunidade ainda não tem outros membros no quadro.",
  "communities.settings.overrides.reassignConfirmCta": "Reatribuir propriedade",
  "communities.settings.overrides.reassignPickLabel":
    "Escolhe a nova pessoa dona",

  // ── Registo de governação (o histórico da própria comunidade) ─────────────
  "communities.detail.tabs.governanceLog": "Registo de governação",
  "communities.governanceLog.intro":
    "Todas as ações de governação registadas nesta comunidade, das mais recentes para as mais antigas. As entradas são escritas pelo servidor e nunca podem ser editadas.",
  "communities.governanceLog.filterLabel": "Filtrar por ação",
  "communities.governanceLog.allActions": "Todas as ações",
  "communities.governanceLog.loadError":
    "O registo de governação não carregou.",
  "communities.governanceLog.retryCta": "Tentar de novo",
  "communities.governanceLog.emptyTitle": "Ainda <em>sem registos</em>.",
  "communities.governanceLog.emptyText":
    "Mudanças de papel, remoções, passagens de propriedade, congelamentos e alterações de definições aparecem aqui no momento em que acontecem.",
  "communities.governanceLog.emptyFilteredTitle": "Nada <em>deste tipo</em>.",
  "communities.governanceLog.emptyFilteredText":
    "Esta comunidade tem histórico de governação e nenhuma entrada corresponde à ação escolhida. Limpa o filtro para leres o registo completo.",
  "communities.governanceLog.clearFilterCta": "Limpar o filtro",
  "communities.governanceLog.pagerMeta": "{start} a {end} de {total}",
  "communities.governanceLog.pagerPage": "Página {page} de {pageCount}",
  "communities.governanceLog.prevPage": "Página anterior",
  "communities.governanceLog.nextPage": "Página seguinte",

  "communities.governanceLog.action.role_changed": "Papel alterado",
  "communities.governanceLog.action.member_removed": "Membro removido",
  "communities.governanceLog.action.ownership_transferred":
    "Propriedade transferida",
  "communities.governanceLog.action.owner_auto_promoted":
    "Promoção automática a pessoa dona",
  "communities.governanceLog.action.frozen": "Congelada",
  "communities.governanceLog.action.unfrozen": "Descongelada",
  "communities.governanceLog.action.archived": "Arquivada",
  "communities.governanceLog.action.unarchived": "Desarquivada",
  "communities.governanceLog.action.settings_changed": "Definições alteradas",
  "communities.governanceLog.action.support_offered": "Apoio oferecido",
  "communities.governanceLog.action.support_offer_answered": "Apoio respondido",

  "communities.governanceLog.summary.role_changed": "O papel de {name} mudou",
  "communities.governanceLog.summary.member_removed":
    "Remoção de {name} do quadro",
  "communities.governanceLog.summary.ownership_transferred":
    "A propriedade passou para {name}",
  "communities.governanceLog.summary.owner_auto_promoted":
    "A propriedade passou automaticamente para {name}",
  "communities.governanceLog.summary.frozen": "A comunidade foi congelada",
  "communities.governanceLog.summary.unfrozen": "O congelamento foi levantado",
  "communities.governanceLog.summary.archived": "A comunidade foi arquivada",
  "communities.governanceLog.summary.unarchived":
    "A comunidade foi restaurada do arquivo",
  "communities.governanceLog.summary.settings_changed":
    "As definições da comunidade mudaram",
  "communities.governanceLog.summary.support_offered":
    "A equipa da plataforma ofereceu apoio a esta comunidade",
  "communities.governanceLog.summary.support_offer_answered":
    "A moderação respondeu a uma oferta de apoio",

  "communities.governanceLog.unknownMember": "um membro anterior",
  "communities.governanceLog.byLine": "por {name}",
  "communities.governanceLog.unattributed": "Sem autoria identificada",
  "communities.governanceLog.unattributedHint":
    "Ou a plataforma agiu automaticamente, ou quem agiu apagou entretanto a sua conta.",
  "communities.governanceLog.override.label": "Intervenção da plataforma",
  "communities.governanceLog.override.hint":
    "A equipa da plataforma agiu por cima da pessoa dona e da moderação da própria comunidade.",

  "communities.governanceLog.meta.roleLabel": "Papel",
  "communities.governanceLog.meta.role.owner": "Pessoa dona",
  "communities.governanceLog.meta.role.mod": "Pessoa moderadora",
  "communities.governanceLog.meta.role.member": "Membro",
  "communities.governanceLog.meta.reasonLabel": "Motivo",
  "communities.governanceLog.meta.fromTo": "{from} para {to}",
  "communities.governanceLog.meta.on": "Ligado",
  "communities.governanceLog.meta.off": "Desligado",
  "communities.governanceLog.meta.empty": "Vazio",
  "communities.governanceLog.meta.notSet": "Sem valor",
  "communities.governanceLog.meta.field.requiresSecondVouch":
    "Segundo voto de confiança obrigatório",
  "communities.governanceLog.meta.field.autoFreezeOnReports":
    "Congelamento automático em denúncias",
  "communities.governanceLog.meta.field.isFeatured": "Destaque no Descobrir",
  "communities.governanceLog.meta.field.name": "Nome",
  "communities.governanceLog.meta.field.purpose": "Propósito",
  "communities.governanceLog.meta.field.type": "Tipo",
  "communities.governanceLog.meta.field.whoFor": "Para quem é",
  "communities.governanceLog.meta.field.tagline": "Frase de apresentação",
  "communities.governanceLog.meta.field.accessTier": "Quem pode entrar",
  "communities.governanceLog.meta.field.rosterVisible": "Quadro visível",
  "communities.governanceLog.meta.field.features": "Funcionalidades",
  "communities.governanceLog.meta.field.rules": "Regras",
  "communities.governanceLog.meta.field.tags": "Etiquetas",
  "communities.governanceLog.meta.field.coverImageUrl": "Imagem de capa",

  "communities.health.modalTitle": "Porquê <em>{score}</em>?",
  "communities.health.howCalculatedCta": "Como é calculada",
  "communities.health.offerSupportCta": "Oferecer apoio",
  "communities.health.closeCta": "Fechar",
  "communities.health.notMeasured": "Ainda por medir",
  "communities.health.intro":
    "A saúde é uma combinação de quatro sinais, ponderada pelo tamanho da comunidade. É um termómetro, uma leitura de como o espaço está.",
  "communities.health.breakdown.memberActivity.name": "Atividade das pessoas",
  "communities.health.breakdown.memberActivity.desc":
    "O quão viva a comunidade parece: publicações, respostas, presença",
  "communities.health.breakdown.reportResolution.name":
    "Tratamento de denúncias",
  "communities.health.breakdown.reportResolution.desc":
    "Percentagem de denúncias que deixaram de estar em aberto: resolvidas ou escaladas",
  "communities.health.breakdown.memberSentiment.name": "Sentimento das pessoas",
  "communities.health.breakdown.memberSentiment.desc":
    "Sondagens discretas e sinais de reação",
  "communities.health.breakdown.safetyLoad.name": "Carga de segurança",
  "communities.health.breakdown.safetyLoad.desc":
    "Inverso das denúncias de dano em relação à dimensão",
  "communities.health.narrative.strong":
    "Uma pontuação forte e equilibrada. Nada aqui precisa da tua atenção. Continua a fazer o que resulta.",
  "communities.health.narrative.healthy":
    "Saudável no geral, com uma ou duas áreas a merecer um olhar atento.",
  "communities.health.narrative.dragging":
    "O sentimento e a carga de segurança estão a puxar a pontuação para baixo. É exatamente aqui que um pouco de apoio da equipa faz toda a diferença.",

  "communities.health.method.title": "Como a saúde é calculada",
  "communities.health.method.formula":
    "A saúde combina quatro sinais numa única pontuação e depois ajusta ao tamanho da tua comunidade. É atualizada todas as noites.",
  "communities.health.method.signalsHeading": "O que entra na conta",
  "communities.health.method.weightNotCounted": "Ainda não conta",
  "communities.health.method.exampleTitle": "Como esta pontuação se soma",
  "communities.health.method.exampleSubtotal": "Sinais combinados",
  "communities.health.method.exampleSizeAdjust":
    "Ajuste ao tamanho da comunidade",
  "communities.health.method.examplePublished": "Saúde publicada",
  "communities.health.method.exampleNote":
    "Os pesos apresentados são ilustrativos. A combinação exata e o ajuste ao tamanho são calculados todas as noites nos nossos servidores, por isso lê isto como a forma das contas, uma ideia aproximada de como funciona.",
  "communities.health.method.sizeNote":
    "O tamanho da comunidade importa. Uma comunidade pequena é avaliada com brandura, por isso uma semana calma ou uma única denúncia em aberto não afunda a pontuação como afundaria numa comunidade muitas vezes maior.",
  "communities.health.method.bandsHeading": "Onde a pontuação se situa",
  "communities.health.method.band.strong": "Forte, 90 ou mais",
  "communities.health.method.band.healthy": "Saudável, 78 a 89",
  "communities.health.method.band.needsHand": "Precisa de ajuda, abaixo de 78",
  "communities.health.method.bandCurrent": "Estás aqui",
  "communities.health.method.backCta": "Voltar",
  "communities.health.method.doneCta": "Percebido",

  "communities.support.modalTitle": "Dar uma ajuda a <em>{name}</em>",
  "communities.support.intro":
    "Escolhe como ajudar. Podes escolher mais do que uma opção. Quem modera vai ver exatamente o que ofereceste.",
  "communities.support.noteLabel": "Uma nota para quem modera (opcional)",
  "communities.support.notePlaceholder":
    "Vimos a pontuação a descer. O que ajudaria mesmo agora?",
  "communities.support.cancelCta": "Cancelar",
  "communities.support.sendCta": "Enviar apoio",
  "communities.support.sentToast": "Apoio enviado à equipa de {name}",
  "communities.support.option.message.title": "Enviar mensagem à moderação",
  "communities.support.option.message.sub":
    "Um contacto próximo com {names}. Como podemos ajudar?",
  "communities.support.option.message.subNoMods":
    "Um contacto próximo com as pessoas moderadoras. Como podemos ajudar?",
  "communities.support.option.buddy.title":
    "Atribuir uma pessoa da equipa por 2 semanas",
  "communities.support.option.buddy.sub":
    "Uma pessoa da equipa de Confiança e Segurança comodera para aliviar a carga.",
  "communities.support.option.toolkit.title": "Partilhar o kit de desescalada",
  "communities.support.option.toolkit.sub":
    "Modelos e guias para lidar com conversas públicas aquecidas.",
  "communities.support.option.recruit.title":
    "Recrutar mais uma pessoa moderadora",
  "communities.support.option.recruit.sub":
    "Abrir uma chamada para uma pessoa de confiança se juntar à moderação.",

  // ── Governança ─────────────────────────────────────────────────────────────
  "governance.title": "Governança · <em>responsabilização</em>",
  "governance.header.eyebrow": "Governança e transparência",
  "governance.header.title": "Nada aqui está <em>escondido</em>.",
  "governance.header.sub":
    "De onde vem o dinheiro, para onde vai, cada mudança de regras e cada ação que uma pessoa moderadora já tomou, tudo aberto às pessoas que nos financiam.",
  "governance.header.publishCta": "Publicar relatório",
  "governance.header.publishToast":
    "Relatório de transparência em fila. As pessoas serão notificadas quando for publicado.",
  "governance.header.publishedToast": "Relatório de transparência publicado.",
  "governance.header.publishError":
    "Não foi possível publicar o relatório. Tente novamente.",
  "governance.tabs.finances": "Finanças",
  "governance.tabs.policy": "Política e versões",
  "governance.tabs.proposals": "Propostas",
  "governance.tabs.motions": "Moções",
  "governance.tabs.audit": "Registo de auditoria",

  // NOTA: o resto de `governance.overview.*` (os editores de
  // saúde/moderação/conselho/princípios/decisões do separador Política) é uma
  // lacuna pré-existente neste catálogo — já faltava antes desta mudança, em
  // EN e PT. Fora do âmbito de COM-1/COM-4; só é adicionada a chave de que
  // este `AdminGovernanceHealthEditor` precisa, para que traduza
  // corretamente quando essa lacuna for preenchida.
  "governance.overview.health.field.valueComputedHint":
    "Calculado em tempo real a partir das contas ativas. Não é editável aqui.",

  // ── Separador Propostas (COM-1) ─────────────────────────────────────────────
  "governance.proposals.header.eyebrow": "Propostas",
  "governance.proposals.header.title": "Pôr a <em>votos</em>",
  "governance.proposals.header.sub":
    "Encerrar um lugar no conselho e mudanças de política de financiamento são decididas por voto das pessoas da comunidade. Abre a proposta aqui; a votação acontece na página pública de Governação.",
  "governance.proposals.createCta": "Nova proposta",
  "governance.proposals.empty": "Ainda não foi aberta nenhuma proposta.",
  "governance.proposals.loadError.title": "As propostas não carregaram",
  "governance.proposals.loadError.body":
    "A falha é do nosso lado. Pode haver propostas abertas que esta lista não conseguiu ler. Tenta de novo.",
  "governance.proposals.list.status.passed": "Aprovada",
  "governance.proposals.list.status.failed": "Não aprovada",
  "governance.proposals.list.type.council_removal":
    "Encerramento de lugar no conselho",
  "governance.proposals.list.type.funding_change": "Mudança de financiamento",
  "governance.proposals.list.tally":
    "{forCount} a favor · {againstCount} contra · {forPercent}% a favor",
  "governance.proposals.list.closes": "Votação encerra {date}",
  "governance.proposals.list.closedOn": "Votação encerrada a {date}",
  "governance.proposals.form.eyebrow": "Nova proposta",
  "governance.proposals.form.title": "Abrir uma <em>proposta</em>",
  "governance.proposals.form.sub":
    "Isto fica visível de imediato na página pública de Governação, e as pessoas podem votar assim que a votação abrir.",
  "governance.proposals.form.field.type": "Tipo",
  "governance.proposals.form.field.type.council_removal":
    "Encerramento de lugar no conselho",
  "governance.proposals.form.field.type.funding_change":
    "Mudança de financiamento",
  "governance.proposals.form.field.title": "Título",
  "governance.proposals.form.field.description": "Descrição",
  "governance.proposals.form.field.targetMemberId":
    "Id da pessoa (lugar em avaliação)",
  "governance.proposals.form.field.targetMemberIdHint":
    "O id da conta da pessoa do conselho a que esta proposta diz respeito. Obrigatório para uma proposta de lugar no conselho.",
  "governance.proposals.form.field.opensAt": "Votação abre",
  "governance.proposals.form.field.closesAt": "Votação encerra",
  "governance.proposals.form.save": "Abrir proposta",
  "governance.proposals.form.cancel": "Cancelar",
  "governance.proposals.form.saved": "Proposta aberta.",
  "governance.proposals.form.error":
    "Não foi possível abrir a proposta. Tenta novamente.",
  "governance.proposals.form.validation":
    "Preenche todos os campos antes de abrir a proposta.",

  // ── Separador Moções (GOV-01) ─────────────────────────────────────────────
  // A fila de análise. São moções levantadas por membros que já atingiram
  // o limiar de assinaturas e esperam por quem as analisa. Aprovar uma
  // agenda a votação; rejeitar uma publica o motivo escrito na página
  // pública de Governação, por isso a cópia diz isso antes de a decisão
  // ser tomada, e não depois.
  "governance.motions.header.eyebrow": "Moções da comunidade",
  "governance.motions.header.title": "Moções <em>a aguardar análise</em>",
  "governance.motions.header.sub":
    "Moções levantadas por membros que atingiram o limiar de assinaturas. Aprova uma para agendar a votação, ou rejeita-a com um motivo que toda a comunidade vai ler.",
  "governance.motions.loading": "A carregar moções…",
  "governance.motions.empty": "Não há moções a aguardar análise.",
  "governance.motions.error": "Não foi possível carregar a fila de moções.",
  "governance.motions.retry": "Tentar novamente",
  "governance.motions.approveCta": "Aprovar",
  "governance.motions.rejectCta": "Rejeitar",
  "governance.motions.list.cosignatures": "Assinaturas: {count}",
  "governance.motions.list.raisedBy": "Levantada por {name}",
  "governance.motions.list.filedOn": "Apresentada a {date}",
  "governance.motions.approve.eyebrow": "Análise de moção",
  "governance.motions.approve.title": "Abrir esta moção a votação",
  "governance.motions.approve.sub":
    "Define quando a votação abre e quando encerra. As pessoas podem votar em qualquer momento dentro dessa janela.",
  "governance.motions.approve.opensAt": "Votação abre",
  "governance.motions.approve.closesAt": "Votação encerra",
  "governance.motions.approve.cancel": "Cancelar",
  "governance.motions.approve.save": "Abrir a votação",
  "governance.motions.approve.saving": "A abrir…",
  "governance.motions.approve.saved":
    "Moção aprovada. A votação está agendada.",
  "governance.motions.approve.error":
    "Não foi possível aprovar a moção. Tenta novamente.",
  "governance.motions.approve.validation":
    "Define uma data de abertura e uma data de encerramento.",
  "governance.motions.approve.orderError":
    "A votação tem de encerrar depois de abrir.",
  "governance.motions.reject.title": "Rejeitar esta moção?",
  "governance.motions.reject.body":
    "A moção não vai a votos. O teu motivo é publicado na página pública de Governação, onde toda a gente o pode ler.",
  "governance.motions.reject.confirmCta": "Rejeitar moção",
  "governance.motions.reject.reasonLabel": "Motivo",
  "governance.motions.reject.reasonPlaceholder":
    "Explica porque é que esta moção não vai a votos.",
  "governance.motions.reject.saved":
    "Moção rejeitada. O motivo está publicado.",
  "governance.motions.reject.error":
    "Não foi possível rejeitar a moção. Tenta novamente.",

  "governance.finances.stat.sustainerMrr": "MRR de apoiantes",
  "governance.finances.stat.totalIncome": "Receita mensal total",
  "governance.finances.stat.surplus": "Excedente mensal",
  "governance.finances.stat.solidarity": "Em acesso solidário",
  "governance.finances.foot.sustainersCount":
    "{count} pessoas contribuem por mês",
  "governance.finances.foot.sources":
    "Apoiantes, subsídios e receitas pontuais",
  "governance.finances.foot.reserve": "Guardado na reserva da comunidade",
  "governance.finances.foot.solidarityRate":
    "Pessoas com tarifa gratuita ou reduzida",
  "governance.finances.empty":
    "Ainda sem relatório financeiro publicado. Os valores aparecem aqui assim que um for publicado.",

  "governance.finances.provenance.seeded": "Por verificar",
  "governance.finances.provenance.manual": "Editado",
  "governance.finances.provenance.computed": "Calculado",
  "governance.finances.provenance.seeded.hint":
    "Valor de exemplo. Ainda não confirmado com os números reais.",
  "governance.finances.provenance.manual.hintPlain":
    "Introduzido por um administrador.",
  "governance.finances.provenance.computed.hint":
    "Calculado a partir da receita menos a despesa. Não é editado diretamente.",
  "governance.finances.provenance.notVerifiedCta": "Por verificar · Editar",
  "governance.finances.edit.cta": "Editar valores",
  "governance.finances.edit.lastEdited": "Última correção por {name} em {date}",
  "governance.finances.edit.neverEdited":
    "Ainda nenhum valor foi corrigido. Todos são valores de exemplo.",
  "governance.finances.edit.eyebrow": "Finanças",
  "governance.finances.edit.title": "Corrigir os <em>valores</em>",
  "governance.finances.edit.sub":
    "Estes valores são reportados pela QueerPulse a cada trimestre e revistos pela equipa financeira, sem cálculo automático. Corrige qualquer número errado; cada alteração é registada e marcada como introduzida por um administrador.",
  "governance.finances.edit.section.headline": "Valores principais",
  "governance.finances.edit.section.income": "Linhas de receita",
  "governance.finances.edit.section.spend": "Linhas de despesa",
  "governance.finances.edit.section.note": "Motivo (opcional)",
  "governance.finances.edit.field.mrr": "MRR de apoiantes (€)",
  "governance.finances.edit.field.sustainerCount": "Número de apoiantes",
  "governance.finances.edit.field.solidarityRate": "Acesso solidário (%)",
  "governance.finances.edit.field.incomeTotal": "Receita mensal total (€)",
  "governance.finances.edit.field.expenseTotal": "Despesa mensal total (€)",
  "governance.finances.edit.field.surplus": "Excedente mensal (€)",
  "governance.finances.edit.field.surplusHint":
    "Calculado automaticamente: receita menos despesa.",
  "governance.finances.edit.field.lineAmount": "Valor",
  "governance.finances.edit.field.lineNote": "Nota",
  "governance.finances.edit.field.lineEnabled": "Mostrar {label} no painel",
  "governance.finances.edit.field.lineDisabledHint":
    "Oculto do painel até voltar a ser ativado.",
  "governance.finances.edit.notePlaceholder":
    "Porque está a alterar estes valores? Guardado no registo de auditoria.",
  "governance.finances.edit.save": "Guardar correções",
  "governance.finances.edit.cancel": "Cancelar",
  "governance.finances.edit.saved": "Valores atualizados.",
  "governance.finances.edit.error":
    "Não foi possível guardar. Tente novamente.",
  "governance.finances.edit.noChanges": "Nada foi alterado.",

  "governance.ledger.moderatorHonoraria": "Honorários de moderação",
  "governance.ledger.platformTools": "Plataforma e ferramentas",
  "governance.ledger.mutualAid": "Entreajuda e microapoios",
  "governance.ledger.mentalHealth": "Fundo de saúde mental",
  "governance.ledger.magazine": "Produção da revista",
  "governance.ledger.memberSustainers": "Pessoas apoiantes",
  "governance.ledger.partnerGrants": "Subsídios de parceiros",
  "governance.ledger.gatheringTickets": "Bilhetes de convívios",

  "governance.income.title": "De onde <em>vem</em>",
  "governance.income.sub": "{amount} / mês, vindos de três fontes honestas.",
  "governance.income.note":
    "Sem publicidade. Sem venda de dados. Sem capital de risco. <strong>Dois terços vêm diretamente das pessoas.</strong>",
  "governance.spend.title": "Para onde <em>vai</em>",
  "governance.spend.sub":
    "{amount} / mês: cada euro justificado, linha a linha.",

  "governance.chart.title": "Receita vs. despesa <em>por trimestre</em>",
  "governance.chart.sub":
    "A diferença é o excedente. Vai diretamente para a reserva.",
  "governance.chart.ariaLabel":
    "Gráfico de barras agrupadas de receita versus despesa por trimestre, em milhares de euros",
  "governance.chart.legend.income": "Receita",
  "governance.chart.legend.spending": "Despesa",
  "governance.chart.legend.surplus": "Excedente para a reserva",
  "governance.chart.range.4q": "4T",
  "governance.chart.range.6q": "6T",
  "governance.chart.range.all": "Tudo",

  // Já não "em direto" (COM-4): este valor é reportado pela administração a
  // cada período e revisto pela equipa financeira, não calculado
  // automaticamente — o texto e o ponto do painel (deixou de pulsar, ver
  // AdminGovernancePage.module.css) foram alterados em conjunto.
  "governance.mrrPanel.live": "MRR de apoiantes · reportado",
  "governance.mrrPanel.lead":
    "Cada euro vem apenas das pessoas. <em>Nunca vamos vender dados de ninguém</em>. Está escrito na nossa constituição, por isso obriga-nos a cumpri-lo.",
  "governance.mrrPanel.readCta": "Ler a constituição",

  "governance.audit.title": "Cada ação, <em>registada</em>",
  "governance.audit.metaZero": "Nenhuma entrada corresponde a estes filtros.",
  "governance.audit.metaMatch": "{count} entradas",
  "governance.audit.exportToast": "Exportadas {total} entradas em CSV",
  "governance.audit.exportError":
    "Não foi possível exportar o registo de auditoria. Tente novamente.",
  "governance.audit.exportCta": "Exportar CSV",
  "governance.audit.columns.moderator": "Pessoa moderadora",
  "governance.audit.columns.action": "Ação",
  "governance.audit.columns.subject": "Assunto",
  "governance.audit.columns.reason": "Motivo",
  "governance.audit.columns.when": "Quando",
  "governance.audit.searchPlaceholder": "Procurar motivo ou assunto…",
  "governance.audit.searchAriaLabel": "Procurar no registo de auditoria",
  "governance.audit.filterModerator": "Filtrar por pessoa moderadora",
  "governance.audit.filterAction": "Filtrar por ação",
  "governance.audit.filterRange": "Filtrar por período",
  "governance.audit.allModerators": "Todas as pessoas moderadoras",
  "governance.audit.allActions": "Todas as ações",
  "governance.audit.allTime": "Todo o período",
  "governance.audit.actionType.dismiss": "Rejeição",
  "governance.audit.actionType.warn": "Aviso",
  "governance.audit.actionType.hide_content": "Conteúdo ocultado",
  "governance.audit.actionType.remove_content": "Conteúdo removido",
  "governance.audit.actionType.restrict": "Restrição",
  "governance.audit.actionType.suspend": "Suspensão",
  "governance.audit.actionType.ban": "Banimento",
  "governance.audit.actionType.shield": "Proteção",
  "governance.audit.actionType.escalate": "Encaminhado",
  "governance.audit.actionType.appeal_upheld": "Recurso deferido",
  "governance.audit.actionType.appeal_overturned": "Recurso revertido",
  "governance.audit.actionType.suspension_lifted": "Suspensão levantada",
  "governance.audit.actionType.role_changed": "Papel alterado",
  "governance.audit.actionType.staff_role_granted": "Papel de equipa concedido",
  "governance.audit.actionType.staff_role_revoked": "Papel de equipa revogado",
  "governance.audit.actionType.evidence_cited": "Prova citada",
  "governance.audit.range.today": "Hoje",
  "governance.audit.range.week": "Esta semana",
  "governance.audit.range.quarter": "Este trimestre",
  "governance.audit.emptyTitle": "Nenhuma entrada corresponde",
  "governance.audit.emptyText":
    "Nenhuma ação de moderação corresponde a estes filtros. Tenta alargá-los.",
  "governance.audit.pagerMeta": "A mostrar {start}–{end} de {total} entradas",
  "governance.audit.prevPage": "Página anterior",
  "governance.audit.nextPage": "Página seguinte",
  "governance.audit.entryModal.eyebrow": "Entrada de auditoria",
  "governance.audit.entryModal.actedWhen": "agiu {when}",
  "governance.audit.entryModal.subject": "Assunto",
  "governance.audit.entryModal.reasonGiven": "Motivo dado à pessoa",
  "governance.audit.entryModal.note":
    "A pessoa afetada viu este motivo e teve direito a recorrer. Esta entrada nunca pode ser editada ou eliminada.",

  // ── Candidaturas a parceiro ────────────────────────────────────────────────
  "partners.title": "Candidaturas a parceiro · <em>revisão</em>",
  "partners.header.eyebrow": "Parcerias",
  "partners.header.title": "Quem quer ser <em>parceiro</em>.",
  "partners.header.sub":
    "Organizações que se candidataram a parceria com a QueerPulse. Lê o que fazem e depois aprova-as para a página pública de parceiros ou deixa a candidatura de lado, com uma nota que vão ler.",
  "partners.forbidden": "Esta fila é apenas para administração.",
  "partners.loadError": "A fila não carregou desta vez. Tenta novamente.",
  "partners.errorToast":
    "Não foi possível guardar essa decisão. Tenta novamente",
  "partners.approvedToast": "{name} é agora parceira da QueerPulse",
  "partners.rejectedToast": "A candidatura de {name} foi arquivada",
  "partners.emptyText": "Nada à espera. Todas as candidaturas já têm decisão.",
  "partners.intro":
    "Estas organizações pediram para ser parceiras. Aprovar uma lista-a na página pública de parceiros.",
  "partners.card.noteLabel": "Uma nota para {name} (opcional)",
  "partners.card.notePlaceholder":
    "O que ajudaria a candidatarem-se de novo, ou porque não é boa altura.",
  "partners.card.backCta": "Voltar",
  "partners.card.setAsideCta": "Deixar de lado",
  "partners.card.approveCta": "Aprovar como parceira",

  // ── Painel de moderação (/mod/:slug) ───────────────────────────────────────
  "modPanel.pageTitle": "Ferramentas de moderação",
  "modPanel.adminPageTitle": "Painel de moderação",
  "modPanel.tabs.requests": "Pedidos",
  "modPanel.tabs.reports": "Denúncias",
  "modPanel.tabs.members": "Pessoas",
  "modPanel.tabs.settings": "Definições",
  "modPanel.notFound.title": "Comunidade não encontrada",
  "modPanel.notFound.description":
    "Não encontrámos essa comunidade. Pode ter sido arquivada.",

  "modPanel.requests.searchPlaceholder": "Procurar por nome…",
  "modPanel.requests.approveAllCta": "Aprovar todos ({count})",
  "modPanel.requests.sectionLabel": "Pedidos",
  // ENG-41: chegar a um pedido para além da primeira página da fila.
  "modPanel.requests.loadMore": "Carregar mais pedidos",
  "modPanel.requests.loadingMore": "A carregar…",
  "modPanel.requests.emptyTitle": "Sem pedidos à espera",
  "modPanel.requests.emptyDesc":
    "Está tudo em dia. Os novos pedidos vão aparecer aqui.",
  "modPanel.requests.requestedAgo": "Pedido feito há {time}",
  "modPanel.requests.approveCta": "Aprovar",
  "modPanel.requests.declineCta": "Recusar",
  "modPanel.requests.approvedToast": "Aprovámos {name}. Dá-lhe as boas-vindas.",
  "modPanel.requests.declinedToast":
    "O pedido de {name} não foi aprovado desta vez.",
  "modPanel.requests.approvedAllToast":
    "Todos os {count} pedidos foram aprovados. A comunidade cresce.",

  "modPanel.reports.sectionLabel": "Publicações denunciadas",
  "modPanel.reports.emptyTitle": "Tudo limpo",
  "modPanel.reports.emptyDesc":
    "Nada foi sinalizado. A comunidade cuida de si própria.",
  "modPanel.reports.metaLine":
    "De {author} · sinalizado por {reporter} · há {time}",
  "modPanel.reports.metaLiveLine": "Sinalizado · há {time}",
  "modPanel.reports.removeCta": "Remover publicação",
  "modPanel.reports.dismissCta": "Rejeitar",
  "modPanel.reports.escalationNote":
    "Aqui podes remover uma publicação ou rejeitar uma denúncia. Avisos, suspensões e escalonamentos são decididos pela equipa de moderação da QueerPulse, e todas as denúncias abertas já estão na fila dela.",
  "modPanel.reports.replyNote":
    "Esta denúncia é sobre uma resposta. Podes rejeitá-la aqui, e a remoção da resposta faz-se na conversa.",
  "modPanel.reports.openInQueueCta": "Abrir na fila de moderação",
  "modPanel.reports.removedToast": "Publicação removida e denúncia encerrada.",
  "modPanel.reports.removeErrorToast":
    "Não foi possível remover essa publicação",
  "modPanel.reports.dismissedToast":
    "Denúncia rejeitada. A publicação continua no lugar.",

  "modPanel.members.searchPlaceholder": "Procurar pessoas…",
  "modPanel.members.roleFilter.all": "Todas",
  "modPanel.members.roleFilter.mod": "Moderação",
  "modPanel.members.roleFilter.member": "Pessoas",
  "modPanel.members.sectionLabel": "Pessoas",
  "modPanel.members.makeModCta": "Tornar moderadora",
  "modPanel.members.removeModCta": "Retirar da moderação",
  "modPanel.members.removeCta": "Remover",
  "modPanel.members.ownerTag": "Fundadora",
  "modPanel.members.promotedToast": "Agora {name} é pessoa moderadora.",
  "modPanel.members.demotedToast": "{name} deixou de fazer parte da moderação.",
  "modPanel.members.removedToast": "Removemos {name} da comunidade.",

  "modPanel.settings.nameLabel": "Nome da comunidade",
  "modPanel.settings.descLabel": "Descrição",
  "modPanel.settings.descPlaceholder":
    "Descreve brevemente do que se trata esta comunidade…",
  "modPanel.settings.modeLabel": "Modo de adesão",
  "modPanel.settings.mode.open": "Aberta",
  "modPanel.settings.mode.request": "Pedido para entrar",
  "modPanel.settings.mode.invite": "Só por convite",
  "modPanel.settings.rulesLabel": "Regras da comunidade",
  "modPanel.settings.rulesPlaceholder": "Escreve as regras, uma por linha…",
  "modPanel.settings.saveCta": "Guardar definições",
  "modPanel.settings.savedToast": "Definições da comunidade guardadas.",
  "modPanel.settings.errorToast":
    "Não foi possível concluir. Tenta novamente dentro de momentos.",
  "modPanel.settings.cancel": "Cancelar",
  "modPanel.settings.dangerZone": "Zona de risco",
  "modPanel.settings.irreversible": "Ações irreversíveis",
  "modPanel.settings.archive.title": "Arquivar comunidade",
  "modPanel.settings.archive.desc":
    "Encerra a comunidade. As pessoas mantêm o histórico, mas ela sai da descoberta e ninguém pode publicar.",
  "modPanel.settings.archive.cta": "Arquivar",
  "modPanel.settings.archive.toast": "Comunidade arquivada.",
  "modPanel.settings.archive.confirm.title": "Arquivar esta comunidade?",
  "modPanel.settings.archive.confirm.body":
    "Isto encerra a comunidade para todas as pessoas. Mantêm o histórico, mas ela desaparece da descoberta e ninguém pode publicar. Só tu, como fundadora, podes fazer isto.",
  "modPanel.settings.archive.confirm.cta": "Sim, arquivar",
  "modPanel.settings.transfer.title": "Transferir propriedade",
  "modPanel.settings.transfer.desc":
    "Entrega a comunidade a outra pessoa. Passas a moderadora.",
  "modPanel.settings.transfer.cta": "Transferir",
  "modPanel.settings.transfer.toast":
    "Propriedade transferida. Passaste a moderadora aqui.",
  "modPanel.settings.transfer.modal.title": "Transferir propriedade",
  "modPanel.settings.transfer.modal.body":
    "Escolhe a pessoa que se vai tornar responsável. Ficas como moderadora.",
  "modPanel.settings.transfer.modal.pickLabel":
    "Escolhe a nova pessoa responsável",
  "modPanel.settings.transfer.modal.emptyTitle": "Ainda não há a quem entregar",
  "modPanel.settings.transfer.modal.emptyDesc":
    "Precisas de pelo menos mais uma pessoa antes de poder transferir a propriedade.",
  "modPanel.settings.transfer.modal.cta": "Transferir propriedade",

  // ── Rede de votos de confiança (visualização da rede de confiança) ─────────
  "vouchGraph.modes.network": "Rede",
  "vouchGraph.loadError.title": "A rede de confiança não carregou",
  "vouchGraph.loadError.body":
    "A falha é do nosso lado, por isso o grafo está vazio porque nada chegou. Tenta de novo.",
  "vouchGraph.modes.scenes": "Cenas",
  "vouchGraph.modes.safety": "Segurança",
  "vouchGraph.pathbar.stepPath_one": "caminho de confiança de {count} passo:",
  "vouchGraph.pathbar.stepPath_other":
    "caminho de confiança de {count} passos:",
  "vouchGraph.pathbar.noPath": "Sem caminho de confiança entre {a} e {b}",
  "vouchGraph.pathbar.fromHint":
    "Caminho a partir de {name}. Shift-clique numa segunda pessoa",
  "vouchGraph.pathbar.clear": "limpar",

  "vouchGraph.legend.safety.ring": "Anel suspeito",
  "vouchGraph.legend.safety.isolated": "Isolada em confiança",
  "vouchGraph.legend.safety.reported": "Tem denúncias",
  "vouchGraph.legend.safety.withdrawn": "Voto de confiança retirado",
  "vouchGraph.legend.plain.trusted": "De confiança",
  "vouchGraph.legend.plain.verified": "Verificada",
  "vouchGraph.legend.plain.mutual": "Voto de confiança mútuo",
  "vouchGraph.legend.plain.invited": "Convidou",
  "vouchGraph.legend.plain.vouched": "Deu um voto de confiança depois",
  "vouchGraph.legend.plain.withdrawn": "Voto de confiança retirado",
  "vouchGraph.legend.plain.anonymous": "Anónima",
  "vouchGraph.legend.plain.private": "Rede privada",

  "vouchGraph.relationship.collaborated": "Colaborámos",
  "vouchGraph.relationship.friends": "Amizade",
  "vouchGraph.relationship.group": "Mesmo grupo",
  "vouchGraph.relationship.met_through": "Conhecemo-nos na QueerPulse",
  "vouchGraph.relationship.neighbours": "Vizinhança",

  "vouchGraph.edgeKind.invite": "Convidou",
  "vouchGraph.edgeKind.vouch": "Deu um voto de confiança depois",

  "vouchGraph.modal.ariaLabel": "Rede de confiança",
  "vouchGraph.modal.eyebrow": "Rede de confiança",
  "vouchGraph.modal.searchPlaceholder": "Encontrar uma pessoa…",
  "vouchGraph.modal.searchAriaLabel": "Encontrar uma pessoa",
  "vouchGraph.modal.replayCta": "Rever",
  "vouchGraph.modal.replayStart": "Antes de qualquer ligação",
  "vouchGraph.modal.timeCutAriaLabel": "Linha do tempo das ligações",
  "vouchGraph.modal.verifyToast": "Verificámos {name}.",
  "vouchGraph.modal.verifyFailedToast":
    "Não foi possível guardar. Verifica a ligação e tenta de novo.",
  "vouchGraph.modal.privateToast": "Esta pessoa mantém a rede privada",
  "vouchGraph.modal.loadingTitle": "A carregar rede de confiança…",
  "vouchGraph.modal.emptyTitle": "Ainda sem rede de confiança",
  "vouchGraph.modal.emptyBody":
    "Esta pessoa ainda não tem votos de confiança registados.",
  "vouchGraph.modal.truncatedNotice":
    "A mostrar os 500 membros mais recentes. Procura acima para encontrar alguém mais antigo.",
  "vouchGraph.memberFinder.placeholder": "Procurar todos os membros…",
  "vouchGraph.memberFinder.ariaLabel": "Procurar todos os membros",
  "vouchGraph.memberFinder.empty": "Nenhum membro encontrado.",

  "vouchGraph.inspector.emptyTitle": "Escolhe alguém",
  "vouchGraph.inspector.emptyBody":
    "Clica num nó para ver quem confia nessa pessoa e em que se baseia essa confiança. Faz duplo clique para percorrer a rede a partir daí.",
  "vouchGraph.inspector.sealed":
    "Identidade anterior selada, só o nome escolhido",
  "vouchGraph.inspector.ringBanner.title":
    "Parte de um anel de votos de confiança suspeito",
  "vouchGraph.inspector.ringBanner.body":
    "Cinco contas criadas numa hora, a darem votos de confiança apenas entre si: um ciclo fechado sem confiança externa.",
  "vouchGraph.inspector.isolationBanner.title": "Isolamento de confiança",
  "vouchGraph.inspector.isolationBanner.body":
    "Todos os votos de confiança que esta pessoa tem vêm de contas novas ou sinalizadas. Verifica com cuidado redobrado.",
  "vouchGraph.inspector.reportsBanner.title_one": "{count} denúncia registada",
  "vouchGraph.inspector.reportsBanner.title_other":
    "{count} denúncias registadas",
  "vouchGraph.inspector.reportsBanner.body":
    "Consulta o histórico de moderação desta pessoa antes de agires.",
  "vouchGraph.inspector.privateBanner.title": "Rede mantida privada",
  "vouchGraph.inspector.privateBanner.body":
    "Esta pessoa escolheu esconder a sua rede de votos de confiança. Respeita isso. Não tentes contornar.",
  "vouchGraph.inspector.vouchesIn": "votos de confiança recebidos",
  "vouchGraph.inspector.vouchesOut": "votos de confiança dados",
  "vouchGraph.inspector.joined": "entrou",
  "vouchGraph.inspector.vouchedForBy": "Com voto de confiança de",
  "vouchGraph.inspector.hasVouchedFor": "Deu um voto de confiança a",
  "vouchGraph.inspector.withdrawn": "Retirados",
  "vouchGraph.inspector.none": "Ainda nenhum.",
  "vouchGraph.inspector.mutualTag": "mútuo",
  "vouchGraph.inspector.affectedTitle": "Se removesses {name}",
  "vouchGraph.inspector.affectedCount_one":
    "{count} pessoa perderia um voto de confiança desta pessoa.",
  "vouchGraph.inspector.affectedCount_other":
    "{count} pessoas perderiam um voto de confiança desta pessoa.",
  "vouchGraph.inspector.affectedPendingNote":
    " Incluindo pessoas pendentes que dependem dele.",
  "vouchGraph.inspector.ownVouchesStay_one":
    "O voto de confiança que ela deu continua válido. Pesa o custo humano antes de agires.",
  "vouchGraph.inspector.ownVouchesStay_other":
    "Os {count} votos de confiança que ela deu continuam válidos. Pesa o custo humano antes de agires.",
  "vouchGraph.inspector.useAsVerificationCta": "Usar como base de verificação",
  "vouchGraph.inspector.verifiedCta": "Verificado",
  "vouchGraph.inspector.citeCta": "Citar",
  "vouchGraph.inspector.expandCta": "Expandir rede",
  "vouchGraph.inspector.collapseCta": "Colapsar rede",

  "vouchGraph.citeDialog.title": "Citar prova: {name}",
  "vouchGraph.citeDialog.description":
    "Anexa uma nota ao registo de auditoria desta pessoa. Pessoas moderadoras e administradoras que consultem o seu histórico vão vê-la.",
  "vouchGraph.citeDialog.noteLabel": "Nota de prova",
  "vouchGraph.citeDialog.confirmCta": "Citar",
  "vouchGraph.citeDialog.defaultNoteWithEdge":
    "Voto de confiança entre {focusName} e {personName}, {relation}, confirmado em {when}.",
  "vouchGraph.citeDialog.defaultNoteNoEdge":
    "Rede de confiança de {personName} revista no inspetor do grafo, confirmado em {when}.",
  "vouchGraph.citeDialog.relationMutual": "mútuo",
  "vouchGraph.citeDialog.relationVouched": "voto de confiança unilateral",
  "vouchGraph.citeDialog.successToast":
    "{name} foi citada(o) no registo de auditoria.",
  "vouchGraph.citeDialog.failedToast":
    "Não foi possível guardar. Verifica a ligação e tenta de novo.",

  "vouchGraph.tooltip.vouchesIn_one": "{count} voto de confiança recebido",
  "vouchGraph.tooltip.vouchesIn_other": "{count} votos de confiança recebidos",
  "vouchGraph.tooltip.vouchesOut_one": "{count} dado",
  "vouchGraph.tooltip.vouchesOut_other": "{count} dados",
  "vouchGraph.tooltip.joinedPrefix": "entrou em {when}",
  "vouchGraph.tooltip.hint":
    "clica para inspecionar · duplo clique para recentrar",
  "vouchGraph.tooltip.withdrawn": "retirado em {date}",

  "vouchGraph.canvas.hint.plain":
    "Arrasta para mover · roda para ampliar · duplo clique para percorrer · shift-clique em duas pessoas para um caminho",
  "vouchGraph.canvas.hint.clusters":
    "Vista de cenas: os nós são coloridos pela comunidade de cada pessoa.",
  "vouchGraph.canvas.hint.safety":
    "Vista de segurança: anéis, isolamento e denúncias ficam à vista. Os grupos vermelhos são ciclos fechados de votos de confiança.",
  "vouchGraph.canvas.zoomIn": "Ampliar",
  "vouchGraph.canvas.zoomOut": "Reduzir",
  "vouchGraph.canvas.fitToView": "Ajustar à vista",
  "vouchGraph.canvas.resetLayout": "Repor disposição",

  "vouchGraph.preview.ariaLabel_one":
    "Rede de confiança de {name}: {count} ligação de voto de confiança direta",
  "vouchGraph.preview.ariaLabel_other":
    "Rede de confiança de {name}: {count} ligações de voto de confiança diretas",
  "vouchGraph.preview.legend.inbound": "Confiam nesta pessoa",
  "vouchGraph.preview.legend.outbound": "Esta pessoa dá votos de confiança",
  "vouchGraph.preview.legend.mutual": "Mútuo",

  // ── Definições da plataforma (/admin/settings) ────────────────────────────
  "settings.breadcrumb": "Definições",
  "settings.eyebrow": "Plataforma",
  "settings.title": "Definições da plataforma",
  "settings.sub":
    "Controlos de emergência para o registo e o acesso. As alterações fazem efeito em cerca de 10 segundos.",
  "settings.tab.access": "Acesso",
  "settings.tab.history": "Histórico",

  "settings.registration.title": "Registo de novas contas",
  "settings.registration.sub":
    "Quando desligado, ninguém consegue criar uma conta nova. Quem já tem conta continua a entrar normalmente.",
  "settings.joinRequests.title": "Pedidos de convite",
  "settings.joinRequests.sub":
    "Quando desligado, o formulário público de “pedir um convite” deixa de aceitar novos pedidos.",
  "settings.closedMessage.label":
    "Mensagem mostrada quando os registos estão fechados",
  "settings.closedMessage.placeholder":
    "Explica em poucas palavras porque é que os registos estão em pausa.",

  "settings.lockdown.title": "Bloqueio da plataforma",
  "settings.lockdown.sub":
    "Bloqueia a plataforma para toda a gente, exceto tu e outras pessoas da administração. As pessoas da comunidade continuam com sessão iniciada e veem um ecrã de manutenção.",
  "settings.lockdown.allowMods": "Também deixar passar a moderação",
  "settings.lockdown.allowModsSub":
    "Útil durante um incidente. Quem modera costuma ser quem está a resolvê-lo.",
  "settings.lockdown.message.label": "Mensagem de manutenção",
  "settings.lockdown.message.placeholder":
    "O que as pessoas vão ver enquanto a plataforma estiver bloqueada.",
  "settings.lockdown.youKeepAccess":
    "És administração, por isso vais manter acesso total.",

  "settings.presets.label": "Começar a partir de um modelo",
  "settings.presets.hint":
    "Os modelos preenchem a caixa. Edita à vontade antes de guardar.",

  // Modelos de mensagem para o bloqueio. Escolher um PREENCHE a caixa de texto;
  // o valor guardado é sempre texto livre, por isso o backend nunca precisa de
  // saber que os modelos existem.
  "settings.presets.lockdown.scheduled.label": "Manutenção agendada",
  "settings.presets.lockdown.scheduled.body":
    "A QueerPulse está em baixo para uma manutenção planeada. Voltamos em breve. Obrigade pela paciência.",
  "settings.presets.lockdown.emergency.label": "Manutenção de emergência",
  "settings.presets.lockdown.emergency.body":
    "Tirámos a QueerPulse do ar por breves instantes para resolver um problema inesperado. Estamos a tratar disso.",
  "settings.presets.lockdown.security.label": "Incidente de segurança",
  "settings.presets.lockdown.security.body":
    "A QueerPulse está temporariamente bloqueada enquanto investigamos uma questão de segurança. A tua conta está segura; partilhamos mais informação assim que pudermos.",
  "settings.presets.lockdown.spam.label": "Onda de spam / abuso",
  "settings.presets.lockdown.spam.body":
    "Pausámos a plataforma enquanto limpamos uma onda de contas de spam. Voltamos muito em breve.",
  "settings.presets.lockdown.deploy.label": "A publicar uma atualização",
  "settings.presets.lockdown.deploy.body":
    "Estamos a lançar uma atualização. A QueerPulse volta dentro de alguns minutos.",
  "settings.presets.lockdown.safety.label": "Pausa por segurança da comunidade",
  "settings.presets.lockdown.safety.body":
    "A QueerPulse está em pausa enquanto a equipa trata de uma questão de segurança da comunidade. Vamos atualizar todas as pessoas diretamente.",

  "settings.presets.closed.spam.label": "Resposta a spam",
  "settings.presets.closed.spam.body":
    "Os novos registos estão em pausa enquanto lidamos com uma onda de contas de spam. Volta a passar por aqui em breve.",
  "settings.presets.closed.capacity.label": "Na capacidade máxima",
  "settings.presets.closed.capacity.body":
    "Pausámos temporariamente os novos registos enquanto damos atenção à comunidade que já cá está. Obrigade pela paciência.",
  "settings.presets.closed.review.label": "Revisão do processo",
  "settings.presets.closed.review.body":
    "Os novos registos estão em pausa enquanto revemos a forma como acolhemos pessoas novas. Reabrimos em breve.",

  // Modal de confirmação — ativar o bloqueio derruba a plataforma inteira.
  "settings.confirm.enable.eyebrow": "Confirmar",
  "settings.confirm.enable.title": "Bloquear a plataforma?",
  "settings.confirm.enable.body":
    "Todas as pessoas ficam bloqueadas de imediato e veem a tua mensagem de manutenção. Continuam com sessão iniciada, por isso levantar o bloqueio restaura o acesso a todas sem ninguém ter de voltar a autenticar-se.",
  "settings.confirm.enable.messagePreview": "Vão ver:",
  "settings.confirm.enable.cta": "Bloquear a plataforma",
  "settings.confirm.disable.eyebrow": "Confirmar",
  "settings.confirm.disable.title": "Levantar o bloqueio?",
  "settings.confirm.disable.body":
    "A plataforma reabre para toda a gente em cerca de 10 segundos.",
  "settings.confirm.disable.cta": "Levantar o bloqueio",

  "settings.banner.title": "A plataforma está bloqueada.",
  "settings.banner.sub": "Só a administração consegue aceder agora.",
  "settings.banner.cta": "Terminar o bloqueio",

  "settings.note.label": "Nota (opcional)",
  "settings.note.placeholder": "Porque estás a fazer esta alteração?",
  "settings.note.hint": "Aplica-se à próxima alteração que fizeres abaixo.",
  "settings.saveError": "Não foi possível guardar. Nada foi alterado.",

  "settings.history.title": "Alterações recentes",
  "settings.history.empty": "Ainda não há alterações.",
  "settings.history.error": "Não foi possível carregar as alterações recentes.",
  "settings.history.by": "por {actor}",
  "settings.history.unknownActor":
    "uma pessoa administradora entretanto eliminada",
  "settings.history.on": "ligado",
  "settings.history.off": "desligado",
  "settings.history.cleared": "vazio",
  "settings.history.changed": "{setting}: de {from} para {to}",
  "settings.history.truncatedNotice":
    "A mostrar {shown} de {total} alterações, das mais recentes para as mais antigas. As entradas mais antigas não estão nesta página.",

  "settings.key.registrationEnabled": "Registo",
  "settings.key.joinRequestsEnabled": "Pedidos de convite",
  "settings.key.lockdownEnabled": "Bloqueio",
  "settings.key.lockdownAllowsModerators": "Moderação durante o bloqueio",
  "settings.key.lockdownMessage": "Mensagem de manutenção",
  "settings.key.registrationClosedMessage": "Mensagem de registos fechados",
  "settings.key.announcementEnabled": "Faixa de aviso",
  "settings.key.announcementMessage": "Mensagem da faixa de aviso",
  "settings.key.announcementExpiresAt": "Validade da faixa de aviso",

  // ── Faixa de aviso em todo o site (ADM-25) ────────────────────────────────
  "settings.announcement.title": "Faixa de aviso",
  "settings.announcement.sub":
    "Mostrada a todas as pessoas visitantes no topo do site, com ou sem sessão iniciada.",
  "settings.announcement.message.label": "Mensagem da faixa",
  "settings.announcement.message.placeholder":
    "ex.: Manutenção agendada esta noite, das 22h à meia-noite (UTC).",
  "settings.announcement.message.hint":
    "Editar isto volta a mostrar a faixa a quem já a tinha dispensado.",
  "settings.announcement.expiresAt.label":
    "Ocultar automaticamente após (opcional)",
  "settings.announcement.expiresAt.hint":
    "Depois desta hora, a faixa deixa de aparecer mesmo que o interruptor acima continue ligado.",

  // ── Contas de sistema (bots) ──────────────────────────────────────────────
  "bots.eyebrow": "Plataforma",
  "bots.title": "Contas de sistema",
  "bots.subtitle": "As vozes que não são uma pessoa. Mantém-nas atualizadas.",
  "bots.empty": "Ainda não há contas de sistema.",
  "bots.edit": "Editar",
  "bots.editTitle": "Editar {name}",
  "bots.field.firstName": "Nome a mostrar",
  "bots.field.lastName": "Apelido (opcional)",
  "bots.field.username": "Identificador",
  "bots.field.pronouns": "Pronomes",
  "bots.field.tagline": "Frase de apresentação",
  "bots.field.location": "Localização",
  "bots.field.bio": "Biografia",
  "bots.field.avatar": "Avatar",
  "bots.field.socials": "Ligações",
  "bots.socials.platform": "Plataforma",
  "bots.socials.handle": "URL ou identificador",
  "bots.socials.add": "Adicionar ligação",
  "bots.socials.remove": "Remover ligação",
  "bots.avatar.change": "Mudar foto",
  "bots.avatar.uploading": "A carregar…",
  "bots.save": "Guardar alterações",
  "bots.cancel": "Cancelar",
  "bots.saved": "Guardado. {name} está atualizada.",
  "bots.saveFailed":
    "Não foi possível guardar. Verifica a ligação e tenta de novo.",
  "bots.usernameTaken": "Esse identificador já está a ser usado.",

  // ── Escalões de parceria (/admin/org-tiers) — página, formulário, linhas ───
  // NOMES de escalões/parceiros ficam em inglês — conteúdo DTO da API. O
  // eyebrow "Parcerias" reutiliza partners.header.eyebrow.
  "orgTier.title": "Escalões de <em>parceria</em>",
  "orgTier.header.sub":
    "Todos os escalões da página Para Organizações, publicados ou ainda em rascunho: cria um, mantém os preços e o texto atualizados, e controla o que está publicado.",
  "orgTier.newCta": "Novo escalão",
  "orgTier.form.editEyebrow": "Editar escalão",
  "orgTier.form.editTitle": "Editar escalão",
  "orgTier.form.createTitle": "Criar um escalão de parceria",
  "orgTier.form.createCta": "Criar escalão",
  "orgTier.loadError":
    "A lista de escalões não carregou de momento. Tenta novamente.",
  "orgTier.empty": "Ainda não há escalões. Cria o primeiro abaixo.",
  "orgTier.delete.title": "Remover {name}?",
  "orgTier.delete.confirmCta": "Remover escalão",
  "orgTier.delete.body":
    "Isto remove-o da lista pública de escalões de parceria e do painel de administração. Não pode ser desfeito.",
  "orgTier.toast.updated": "{name} foi atualizado",
  "orgTier.toast.created": "{name} foi criado",
  "orgTier.toast.removed": "{name} foi removido",
  "orgTier.field.name": "Nome",
  "orgTier.field.price": "Preço",
  "orgTier.field.pricePeriod": "Período do preço",
  // "Dek" é a linha descritiva por baixo do nome do escalão — sem termo pt
  // comum, fica "Subtítulo".
  "orgTier.field.dek": "Subtítulo",
  "orgTier.field.bullets": "Tópicos",
  "orgTier.field.bulletsHint": "Um tópico por linha.",
  "orgTier.field.footnote": "Nota de rodapé",
  "orgTier.field.cta": "Botão de ação",
  "orgTier.field.ctaLabel": "Texto do botão de ação",
  "orgTier.field.ctaTarget": "Destino do botão de ação",
  "orgTier.field.sortOrder": "Ordem",
  // Etiquetas de opção do comportamento do botão; o valor guardado é um id
  // canónico (toast/link/propose), nunca esta etiqueta.
  "orgTier.ctaOption.toast": "Brinde: apenas informativo",
  "orgTier.ctaOption.link": "Ligação: navega para um destino",
  "orgTier.ctaOption.propose": "Propor: abre o fluxo de contacto",
  "orgTier.toggle.featured.sub": "Destacado como o escalão recomendado.",
  "orgTier.toggle.published.sub": "Visível na página Para Organizações.",

  // ── AdminOrgTierFormFields.tsx — editor de escalões para organizações ──────
  "orgTier.field.priceDisplay.placeholder": "ex.: 2,4 mil € ou Personalizado",
  "orgTier.field.pricePeriod.placeholder": "ex.: por ano",
  "orgTier.field.ctaTarget.placeholder":
    "Usado apenas quando o botão de ação é uma ligação",
  "orgTier.toggle.featured.title": "Em destaque",
  "orgTier.toggle.published.title": "Publicado",

  // ── Parceiros aprovados (editor de destaque + testemunho) ──────────────────
  // Nomes de parceiros, citações/autoria dos testemunhos ficam em inglês (DTO).
  "approvedPartners.title": "Parceiros em destaque e testemunhos",
  "approvedPartners.loadError":
    "A lista de parceiros não carregou de momento. Tenta novamente.",
  "approvedPartners.empty": "Ainda não há parceiros aprovados.",
  "approvedPartners.noTestimonial": "Ainda sem testemunho",
  "approvedPartners.unattributed": "Sem atribuição",
  "approvedPartners.editCta": "Editar testemunho",

  // ── AdminPartnerTestimonialModal.tsx ──────────────────────────────────────
  "partnerTestimonial.eyebrow": "Testemunho",
  "partnerTestimonial.quote": "Citação",
  "partnerTestimonial.author": "Autoria",
  "partnerTestimonial.role": "Cargo",
  "partnerTestimonial.authorRequiredHint":
    "Adiciona uma autoria antes de guardar uma citação.",
  "partnerTestimonial.quoteNeedsAuthor":
    "Uma citação precisa de autoria. Adiciona uma antes de guardar",
  "partnerTestimonial.updatedToast": "O testemunho de {name} foi atualizado",

  // ── Cooperativas de habitação (/admin/housing) — página, formulário, linhas ─
  // NOMES / cidades das cooperativas ficam em inglês — conteúdo DTO da API.
  "housingCoop.title": "Cooperativas de <em>habitação</em>",
  "housingCoop.header.eyebrow": "Economia local",
  "housingCoop.header.sub":
    "Todas as cooperativas na plataforma, publicadas ou ainda em formação: cria uma, mantém os detalhes atualizados, e trata da fila de pedidos de adesão abaixo.",
  "housingCoop.newCta": "Nova cooperativa",
  "housingCoop.form.editEyebrow": "Editar cooperativa",
  "housingCoop.form.editTitle": "Editar cooperativa",
  "housingCoop.form.createTitle": "Criar uma cooperativa de habitação",
  "housingCoop.form.createCta": "Criar cooperativa",
  "housingCoop.loadError":
    "A lista de cooperativas não carregou de momento. Tenta novamente.",
  "housingCoop.empty": "Ainda não há cooperativas. Cria a primeira abaixo.",
  "housingCoop.delete.title": "Remover {name}?",
  "housingCoop.delete.confirmCta": "Remover cooperativa",
  "housingCoop.delete.body":
    "Isto remove-a do diretório público e da lista de administração. Os pedidos de adesão já submetidos ficam registados.",
  "housingCoop.toast.updated": "{name} foi atualizada",
  "housingCoop.toast.created": "{name} foi criada",
  "housingCoop.toast.removed": "{name} foi removida",
  "housingCoop.field.slug": "Slug",
  "housingCoop.field.name": "Nome",
  "housingCoop.field.nameEm": "Nome: palavra a destacar",
  "housingCoop.field.nameEmHint":
    "A única palavra em itálico coral no cartão público. Deixa em branco para nenhuma.",
  "housingCoop.field.city": "Cidade",
  "housingCoop.field.area": "Zona",
  "housingCoop.field.households": "Agregados",
  "housingCoop.field.phase": "Fase",
  "housingCoop.field.description": "Descrição",
  "housingCoop.field.progress": "Progresso (%)",
  "housingCoop.field.formingSince": "Em formação desde",
  "housingCoop.field.formingSincePlaceholder": "ex.: 2025-03-01",
  "housingCoop.field.operationalSince": "Operacional desde",
  "housingCoop.field.operationalSincePlaceholder": "ex.: 2026-01-01",
  "housingCoop.field.shareAmount": "Valor da quota (EUR)",
  "housingCoop.field.monthly": "Mensalidade (EUR)",
  "housingCoop.field.cta": "Botão de ação",
  // Etiquetas de opção da fase (forma longa). O valor guardado é um id canónico.
  "housingCoop.phaseOption.forming": "Em formação: a reunir pessoas",
  "housingCoop.phaseOption.legal": "Constituição legal",
  "housingCoop.phaseOption.finance": "Finanças e estrutura",
  "housingCoop.phaseOption.property": "À procura do imóvel",
  "housingCoop.phaseOption.daily": "Vida diária: operacional",
  // Etiquetas da fase (forma curta, na linha de administração). Mesmos ids.
  "housingCoop.phaseBadge.forming": "Em formação",
  "housingCoop.phaseBadge.legal": "Legal",
  "housingCoop.phaseBadge.finance": "Finanças",
  "housingCoop.phaseBadge.property": "Imóvel",
  "housingCoop.phaseBadge.daily": "Vida diária",
  // Etiquetas de opção do botão de ação. O valor guardado é um id canónico.
  "housingCoop.ctaOption.join": "Juntar-te à cooperativa",
  "housingCoop.ctaOption.updates": "Receber novidades",
  "housingCoop.ctaOption.mentor": "Falar com uma pessoa mentora",
  "housingCoop.toggle.operational.sub":
    "A cooperativa já se mudou e funciona no dia a dia.",
  "housingCoop.toggle.sharesAreTarget.sub":
    "Mostra o valor da quota como uma meta a alcançar, em vez de um preço fixo.",
  "housingCoop.toggle.published.sub":
    "Visível no diretório público de habitação.",
  "housingCoop.row.households_one": "{count} agregado",
  "housingCoop.row.households_other": "{count} agregados",

  // ── AdminHousingCoopFormFields.tsx — editor de cooperativa de habitação ────
  "housingCoop.toggle.operational.title": "Operacional",
  "housingCoop.toggle.sharesAreTarget.title": "O valor da quota é uma meta",
  "housingCoop.toggle.published.title": "Publicado",

  // ── AdminHousingJoinRequests.tsx — triagem de pedidos de adesão ────────────
  // Nomes de candidatos, nomes de cooperativas, notas ficam em inglês (DTO).
  "housingRequests.title": "Pedidos de adesão",
  "housingRequests.loadError":
    "A fila de pedidos de adesão não carregou de momento. Tenta novamente.",
  "housingRequests.empty":
    "Nada à tua espera. Todos os pedidos foram tratados.",
  "housingRequests.unknownCoop": "Cooperativa desconhecida",
  "housingRequests.householdSize": "{size} no agregado",
  "housingRequests.declineCta": "Recusar",
  "housingRequests.acceptCta": "Aceitar",
  // ENG-41: a fila é paginada, por isso o número de pessoas à espera e o
  // número de linhas no ecrã são coisas diferentes.
  "housingRequests.pendingCount_one": "{count} pessoa à espera",
  "housingRequests.pendingCount_other": "{count} pessoas à espera",
  "housingRequests.loadMore": "Carregar mais pedidos",
  "housingRequests.loadingMore": "A carregar…",

  // ── Grupos de habitação (/admin/housing-groups) — triagem + normas ─────────
  "housingGroups.title": "Grupos de <em>habitação</em>",
  "housingGroups.header.eyebrow": "Habitação verificada",
  "housingGroups.header.sub":
    "Analisa quem pede para entrar nos grupos restritos e mantém os anúncios honestos, escondendo os que quebram as regras.",
  "housingGroups.requests.title": "Pedidos de adesão",
  "housingGroups.requests.loadError":
    "A fila de pedidos de adesão não carregou de momento. Tenta novamente.",
  "housingGroups.requests.empty":
    "Nada à tua espera. Todos os pedidos foram analisados.",
  "housingGroups.requests.unknownGroup": "Grupo desconhecido",
  "housingGroups.requests.mutuals_one": "{count} ligação em comum",
  "housingGroups.requests.mutuals_other": "{count} ligações em comum",
  "housingGroups.requests.declineCta": "Recusar",
  "housingGroups.requests.approveCta": "Aprovar",
  "housingGroups.requests.error": "Não foi possível guardar essa decisão",
  // ENG-41: a fila é paginada, por isso o número de pessoas à espera e o
  // número de linhas no ecrã são coisas diferentes.
  "housingGroups.requests.pendingCount_one": "{count} pessoa à espera",
  "housingGroups.requests.pendingCount_other": "{count} pessoas à espera",
  "housingGroups.requests.loadMore": "Carregar mais pedidos",
  "housingGroups.requests.loadingMore": "A carregar…",
  "housingGroups.listings.title": "Anúncios",
  "housingGroups.listings.loadError":
    "Os anúncios não carregaram de momento. Tenta novamente.",
  "housingGroups.listings.empty":
    "Sem anúncios para analisar. Ainda nada foi publicado num grupo.",
  "housingGroups.listings.perMonth": "€{price} / mês",
  "housingGroups.listings.noGroup": "Sem grupo",
  "housingGroups.listings.hiddenChip": "Escondido",
  "housingGroups.listings.hideCta": "Esconder",
  "housingGroups.listings.unhideCta": "Mostrar",
  "housingGroups.listings.error": "Não foi possível atualizar esse anúncio",

  // ── Roteiro (/admin/roadmap) — quadro, fila de ideias, estatísticas ────────
  "roadmap.title": "Roteiro · <em>o que vem a seguir</em>",
  "roadmap.loading": "A carregar o roteiro…",
  "roadmap.tabs.board": "Quadro",
  "roadmap.tabs.heroStats": "Estatísticas",

  // AdminRoadmapBoard.tsx, AdminRoadmapItemRow.tsx, AdminRoadmapItemModal.tsx,
  // AdminRoadmapItemModalFields.tsx — o quadro lançado/em construção/planeado.
  "roadmap.board.column.shipped": "Lançado",
  "roadmap.board.column.building": "Em construção",
  "roadmap.board.column.planned": "Planeado",
  "roadmap.board.field.category": "Categoria",

  // AdminRoadmapIdeasQueue.tsx, AdminRoadmapIdeaRows.tsx — triagem de ideias
  // submetidas por membros + a lista publicada que a página pública lê.
  "roadmap.ideas.promoteCta": "Promover",
  // Diálogo de confirmação partilhado (IdeaQueueConfirmModal) — `kind` é
  // "dismiss" ou "delete", interpolado na chave (`roadmap.ideas.${kind}.*`).

  // AdminRoadmapHeroStats.tsx — lista editável de estatísticas do hero público.
  // Etiquetas de preenchimento automático — "lançado"/"planeado" concordam em
  // número (_one/_other); "em curso" é invariável, por isso fica só a chave base.

  // ═══════════════════════════════════════════════════════════════════════
  // Reformulação do roteiro (quadro de 9 vistas, painel lateral, vistas
  // guardadas, modais). Aditivo: as chaves planas roadmap.board.*/
  // roadmap.ideas.*/roadmap.heroStats.* acima mantêm-se para a interface
  // atual de 3 separadores até ser migrada; tudo abaixo está isolado sob
  // novos sub-caminhos para não colidir com nem ler silenciosamente do
  // conjunto antigo.
  // ═══════════════════════════════════════════════════════════════════════

  // ── Categorias — partilhadas entre quadro/barra de ferramentas/painel/capacidade
  "roadmap.categories.resources": "Recursos",
  "roadmap.categories.gatherings": "Encontros",
  "roadmap.categories.members": "Pessoas",
  "roadmap.categories.safety": "Segurança",
  "roadmap.categories.content": "Conteúdo",
  "roadmap.categories.messaging": "Mensagens",
  "roadmap.categories.community": "Comunidade",
  "roadmap.categories.economy": "Economia",
  "roadmap.categories.platform": "Plataforma",

  // ── Estrutura da página — eyebrow/título/subtítulo + ações do cabeçalho ──
  "roadmap.page.eyebrow": "Roteiro",
  "roadmap.page.title": "Molda o <em>roteiro</em>",
  "roadmap.page.sub":
    "Arrasta itens entre colunas, tria o que os membros pediram e controla exatamente o que a página pública mostra. Uma data alterada pede-te sempre um motivo. É esse o objetivo.",
  "roadmap.page.newItemCta": "Novo item",
  "roadmap.page.draftDigestCta": "Rascunhar resumo",
  "roadmap.page.previewPublicCta": "Pré-visualizar página pública",
  "roadmap.page.auditLogCta": "Registo de auditoria",

  // ── Separadores — 9 vistas. tabs.board/tabs.heroStats acima já têm o
  // texto certo e são reutilizadas; o resto é novo.
  "roadmap.tabs.timeline": "Cronologia",
  "roadmap.tabs.guides": "Guias",
  "roadmap.tabs.capacity": "Capacidade",
  "roadmap.tabs.memberIdeas": "Ideias de membros",
  "roadmap.tabs.notBuilding": "Não vamos construir",
  "roadmap.tabs.publicPreview": "Pré-visualização pública",
  "roadmap.tabs.archive": "Arquivo",

  // ── Fiada de vistas guardadas ────────────────────────────────────────────
  "roadmap.savedViews.label": "Vistas guardadas",
  "roadmap.savedViews.late": "O que está atrasado",
  "roadmap.savedViews.unassigned": "Sem responsável, P0/P1",
  "roadmap.savedViews.blocked": "Bloqueados",
  "roadmap.savedViews.stale": "Parados",
  "roadmap.savedViews.guidesOnly": "Só guias",
  "roadmap.savedViews.needsSafety": "Precisa de revisão de segurança",
  "roadmap.savedViews.needsFunding": "Precisa de financiamento",

  // ── Barra de ferramentas — pesquisa, filtros, ordenação, densidade ──────
  "roadmap.toolbar.searchPlaceholder": "Filtrar itens…",
  "roadmap.toolbar.searchAriaLabel": "Filtrar itens do roteiro",
  "roadmap.toolbar.categoryAll": "Todas as categorias",
  "roadmap.toolbar.ownerAll": "Qualquer responsável",
  "roadmap.toolbar.ownerUnassigned": "Sem responsável",
  "roadmap.toolbar.sortManual": "Ordem manual",
  "roadmap.toolbar.sortVotes": "Mais votados",
  "roadmap.toolbar.sortPriority": "Prioridade",
  "roadmap.toolbar.sortStale": "Há mais tempo sem atualização",
  "roadmap.toolbar.denseToggle": "Compacto",
  "roadmap.toolbar.dragHint":
    "Arrasta para mover ou reordenar · ? para atalhos",

  // ── Quadro — colunas (backlog é nova; lançado/em construção/planeado
  // reutilizam as chaves roadmap.board.column.* acima, mesmo texto),
  // subtítulos, estados vazios/WIP, dicas das etiquetas, avisos, menu.
  "roadmap.board.column.backlog": "Backlog",
  "roadmap.board.column.subtitle.backlog": "Estacionado, mas com intenção",
  "roadmap.board.column.subtitle.planned": "Assumido, na fila",
  "roadmap.board.column.subtitle.building": "A mexer nisso",
  "roadmap.board.column.subtitle.shipped": "Ativo para os membros",
  "roadmap.board.addToColumnAriaLabel": "Adicionar a {column}",
  "roadmap.board.emptyColumn": "Nada por aqui",
  "roadmap.board.wipOverMessage":
    "Acima do limite de {limit} em curso. Algo aqui não está mesmo a ser construído.",
  "roadmap.board.gripAriaLabel": "Arrasta para mover ou reordenar",
  "roadmap.board.openCardAriaLabel": "Abrir {name}",
  "roadmap.board.selectCardAriaLabel": "Selecionar {name}",
  "roadmap.board.flag.requested": "Os membros pediram isto",
  "roadmap.board.flag.committed": "Assumido: é uma promessa",
  "roadmap.board.flag.hidden": "Oculto do roteiro público",
  "roadmap.board.flag.safetyGated":
    "Precisa de revisão de segurança antes de ficar público",
  "roadmap.board.flag.spike": "Pico de votos invulgar: possível manipulação",
  "roadmap.board.flag.slips": "Meta adiada {count}×",
  "roadmap.board.alert.blocked": "Bloqueado · {reason}",
  "roadmap.board.alert.waitingOn": "À espera de {name}",
  "roadmap.board.alert.waitingOnMore": "À espera de {name} +{count}",
  "roadmap.board.alert.staleUntouched": "Sem tocar há {days} dias",
  "roadmap.board.reorder.movedAnnouncement":
    "{name} passou para a posição {position} de {total}",
  "roadmap.board.menu.moveUp": "Mover para cima",
  "roadmap.board.menu.moveDown": "Mover para baixo",
  "roadmap.board.menu.moveUpAriaLabel": "Mover para cima: {name}",
  "roadmap.board.menu.moveDownAriaLabel": "Mover para baixo: {name}",
  "roadmap.board.menu.moveTo": "Mover para {column}",
  "roadmap.board.menu.editDetails": "Editar detalhes",
  "roadmap.board.menu.showPublic": "Mostrar publicamente",
  "roadmap.board.menu.hidePublic": "Ocultar do público",
  "roadmap.board.menu.duplicate": "Duplicar",
  "roadmap.board.menu.notifyVoters_one": "Notificar {count} pessoa que votou…",
  "roadmap.board.menu.notifyVoters_other":
    "Notificar {count} pessoas que votaram…",
  "roadmap.board.menu.archive": "Arquivar",

  // ── Barra de seleção em massa ────────────────────────────────────────────
  "roadmap.bulkBar.selectedLabel_one": "{count} selecionado",
  "roadmap.bulkBar.selectedLabel_other": "{count} selecionados",
  "roadmap.bulkBar.moveToPlaceholder": "Mover para…",
  "roadmap.bulkBar.showPublicly": "Mostrar publicamente",
  "roadmap.bulkBar.hide": "Ocultar",
  "roadmap.bulkBar.archive": "Arquivar",
  "roadmap.bulkBar.clear": "Limpar",
  "roadmap.bulkBar.delete": "Eliminar",
  "roadmap.bulkBar.confirmDelete.title_one": "Eliminar {count} item?",
  "roadmap.bulkBar.confirmDelete.title_other": "Eliminar {count} itens?",
  "roadmap.bulkBar.confirmDelete.body_one":
    "Isto remove permanentemente o item selecionado do roteiro e não pode ser desfeito.",
  "roadmap.bulkBar.confirmDelete.body_other":
    "Isto remove permanentemente os {count} itens selecionados do roteiro e não pode ser desfeito.",
  "roadmap.bulkBar.confirmDelete.confirmCta": "Eliminar itens",

  // ── Painel lateral do item — cabeçalho + rótulos partilhados pela grelha ─
  "roadmap.drawer.eyebrow": "Item do roteiro",
  "roadmap.drawer.touchedLabel": "Atualizado há {days}d",
  "roadmap.drawer.field.title": "Título",
  "roadmap.drawer.field.status": "Estado",
  "roadmap.drawer.field.target": "Meta",
  "roadmap.drawer.field.owner": "Responsável",
  "roadmap.drawer.field.priority": "Prioridade",
  "roadmap.drawer.saveCta": "Guardar e publicar",
  "roadmap.drawer.saveEditCta": "Guardar",
  "roadmap.drawer.archiveCta": "Arquivar",
  "roadmap.drawer.auditNote":
    "Cada edição fica registada. Os membros conseguem ver quando uma data mudou e porquê. Um roteiro que desliza em silêncio é só uma lista de desejos.",
  "roadmap.drawer.openAuditCta": "Abrir o registo de auditoria",
  "roadmap.drawer.deleteConfirm.title": 'Eliminar "{name}"?',
  "roadmap.drawer.deleteConfirm.body":
    "Isto remove-o permanentemente do roteiro e não pode ser desfeito.",

  // Painel · secção Compromisso
  "roadmap.drawer.commitment.title": "Compromisso",
  "roadmap.drawer.commitment.note":
    "porque é que os membros deviam acreditar na data",
  "roadmap.drawer.commitment.confidence.likely.label": "Provável",
  "roadmap.drawer.commitment.confidence.likely.desc": "Vemos o caminho todo",
  "roadmap.drawer.commitment.confidence.maybe.label": "Talvez",
  "roadmap.drawer.commitment.confidence.maybe.desc":
    "Depende de capacidade ou de dinheiro",
  "roadmap.drawer.commitment.confidence.hoping.label": "Esperamos",
  "roadmap.drawer.commitment.confidence.hoping.desc":
    "Queremos isto, ainda sem caminho definido",
  "roadmap.drawer.commitment.promiseToggle.title": "É uma promessa firme",
  "roadmap.drawer.commitment.promiseToggle.sub":
    'Os itens assumidos são identificados como promessas publicamente. Todo o resto lê-se como "queremos fazer isto".',
  "roadmap.drawer.commitment.slipHistoryTitle":
    "Histórico de datas: adiada {count}×",
  "roadmap.drawer.commitment.slipHistoryEmpty":
    "Nunca mudou. Alterar a meta pede-te sempre um motivo público.",

  // Painel · secção Lista de verificação do guia (guias de saúde/legais)
  "roadmap.drawer.guide.title": "Lista de verificação do guia",
  "roadmap.drawer.guide.note": "conteúdo de saúde e legal precisa de revisão",
  "roadmap.drawer.guide.step.research": "Investigação",
  "roadmap.drawer.guide.step.draft": "Rascunho",
  "roadmap.drawer.guide.step.lived": "Revisão por experiência vivida",
  "roadmap.drawer.guide.step.expert": "Revisão especializada / legal",
  "roadmap.drawer.guide.step.translate": "Traduzir (PT)",
  "roadmap.drawer.guide.step.publish": "Publicar",
  "roadmap.drawer.guide.reviewerLabel": "Revisor",
  "roadmap.drawer.guide.reviewerPlaceholder": "Quem verificou isto",
  "roadmap.drawer.guide.credentialLabel": "Credencial",
  "roadmap.drawer.guide.credentialPlaceholder":
    "Porque é que tem competência para isto",
  "roadmap.drawer.guide.reVerifyByLabel": "Reverificar até",
  "roadmap.drawer.guide.languagesLabel": "Idiomas",
  "roadmap.drawer.guide.reVerifyWarning":
    "A reverificação vence em {days} dias. Informação de saúde e legal desatualiza-se. Orientação desatualizada é pior do que nenhuma.",
  "roadmap.drawer.guide.reVerifyOverdue_one":
    "A reverificação está atrasada há {count} dia.",
  "roadmap.drawer.guide.reVerifyOverdue_other":
    "A reverificação está atrasada há {count} dias.",
  "roadmap.drawer.guide.notAGuideCta": "Isto não é um guia",
  // Itens sem guia mostram um simples cursor de progresso em vez da lista.
  "roadmap.drawer.progress.title": "Progresso",
  "roadmap.drawer.progress.percentDoneLabel": "Percentagem concluída",
  "roadmap.drawer.progress.trackAsGuideCta":
    "Acompanhar isto como guia de recursos",

  // Painel · secção Bloqueado
  "roadmap.drawer.blocked.title": "Bloqueado",
  "roadmap.drawer.blocked.note":
    "mostrado publicamente. Estar bloqueado não é vergonha nenhuma",
  "roadmap.drawer.blocked.byLabel": "Bloqueado por",
  "roadmap.drawer.blocked.byPlaceholder": "Pessoa ou equipa",
  "roadmap.drawer.blocked.unblockCta": "Desbloquear",
  "roadmap.drawer.blocked.whyPlaceholder":
    "O que é que está mesmo a impedir isto?",
  "roadmap.drawer.blocked.none": "Não está bloqueado.",
  "roadmap.drawer.blocked.markCta": "Marcar como bloqueado",

  // Painel · secção Dependências
  "roadmap.drawer.deps.title": "Dependências",
  "roadmap.drawer.deps.none": "Nada a impedir isto.",
  "roadmap.drawer.deps.addPlaceholder": "Adicionar uma dependência…",
  "roadmap.drawer.deps.cannotShip": "Não pode ser lançado antes de {items}.",

  // Painel · secção Capacidade e dinheiro
  "roadmap.drawer.capacity.title": "Capacidade e dinheiro",
  "roadmap.drawer.capacity.note":
    "os itens de voluntariado atrasam-se primeiro, o que é simples aritmética",
  "roadmap.drawer.capacity.whoLabel": "Quem está a fazer isto",
  "roadmap.drawer.capacity.paidOption": "Trabalho pago",
  "roadmap.drawer.capacity.volunteerOption": "Voluntariado",
  "roadmap.drawer.capacity.hoursLabel": "Horas / semana",
  "roadmap.drawer.capacity.costLabel": "Custo",
  "roadmap.drawer.capacity.cost.none": "Sem custo",
  "roadmap.drawer.capacity.cost.small": "Pequeno (<500 €)",
  "roadmap.drawer.capacity.cost.funded": "Financiado",
  "roadmap.drawer.capacity.cost.needs": "Precisa de financiamento",
  "roadmap.drawer.capacity.ownerLoadLabel": "Carga do responsável",
  "roadmap.drawer.capacity.noOwner": "Ninguém é responsável por isto",
  "roadmap.drawer.capacity.ownerLoadValue": "{hours}h de {cap}h",

  // Painel · secção Visibilidade e segurança
  "roadmap.drawer.visibility.title": "Visibilidade e segurança",
  "roadmap.drawer.visibility.publicToggle.title": "Visível no roteiro público",
  "roadmap.drawer.visibility.publicToggle.sub":
    "Os membros veem, votam e comentam.",
  "roadmap.drawer.visibility.requestedToggle.title": "Pedido por membros",
  "roadmap.drawer.visibility.requestedToggle.sub":
    "Veio de uma ideia ou de um pedido repetido.",
  "roadmap.drawer.visibility.safetyLabel": "Revisão de segurança",
  "roadmap.drawer.visibility.safety.none": "Sem revisão necessária",
  "roadmap.drawer.visibility.safety.required":
    "Revisão de segurança necessária",
  "roadmap.drawer.visibility.safety.cleared": "Segurança confirmada",
  "roadmap.drawer.visibility.gatedWarning":
    "Bloqueado. Isto não pode ser publicado até a equipa de Confiança e Segurança dar luz verde.",

  // Painel · secção Votos de membros
  "roadmap.drawer.votes.title": "Votos de membros",
  "roadmap.drawer.votes.otherCommunitiesLabel": "Todas as outras pessoas",
  "roadmap.drawer.votes.totalLabel": "Total de votos",
  "roadmap.drawer.votes.notifiedLabel": "Notificado",
  "roadmap.drawer.votes.notifiedYes": "Sim",
  "roadmap.drawer.votes.notifiedNo": "Ainda não",
  "roadmap.drawer.votes.spikeLabel": "Pico",
  "roadmap.drawer.votes.spikeFlagged": "Assinalado",
  "roadmap.drawer.votes.spikeNormal": "Normal",
  "roadmap.drawer.votes.notifyCta_one":
    "Notificar a {count} pessoa que pediu isto…",
  "roadmap.drawer.votes.notifyCta_other":
    "Notificar as {count} pessoas que pediram isto…",

  // Painel · secção Comentários
  "roadmap.drawer.comments.title": "Comentários",
  "roadmap.drawer.comments.empty": "Ainda sem comentários.",
  "roadmap.drawer.comments.hiddenStatus": "Oculto",

  // Painel · Notas internas / Frase pública
  "roadmap.drawer.internalNotes.title": "Notas internas",
  "roadmap.drawer.internalNotes.note": "nunca é público",
  "roadmap.drawer.internalNotes.placeholder":
    "Âmbito, dependências, o que faria abandonarmos isto.",
  "roadmap.drawer.publicOneLiner.title": "Frase pública",
  "roadmap.drawer.publicOneLiner.note": "mostrada em /roadmap",
  "roadmap.drawer.publicOneLiner.placeholder":
    "Simples, caloroso, sem jargão de roteiro.",

  // ── Modais ──────────────────────────────────────────────────────────────
  // Motivo do adiamento
  "roadmap.modals.slipReason.eyebrow": "Mudança de data",
  "roadmap.modals.slipReason.title": "Porque é que isto está a <em>mudar</em>?",
  "roadmap.modals.slipReason.targetLabel": "Meta",
  "roadmap.modals.slipReason.body":
    "Este motivo é publicado no roteiro público, junto ao item. Os membros perdoam datas adiadas; não perdoam datas adiadas em silêncio.",
  "roadmap.modals.slipReason.placeholder":
    "ex.: disponibilidade do revisor clínico. Preferimos atrasar do que errar.",
  "roadmap.modals.slipReason.confirmCta": "Mudar a data",
  "roadmap.modals.slipReason.cancelCta": "Manter como está",
  "roadmap.modals.slipReason.missingReasonToast":
    "Uma data adiada precisa de um motivo. É disso mesmo que se trata",

  // Bloqueio de segurança
  "roadmap.modals.safetyGate.eyebrow": "Bloqueio de segurança",
  "roadmap.modals.safetyGate.title":
    "Isto precisa primeiro de uma <em>revisão de segurança</em>",
  "roadmap.modals.safetyGate.body":
    "Assinalado como sensível. Conteúdo sobre habitação, asilo e empregadores pode expor membros. Publicá-lo cedo demais é um risco real, por isso trata-o como tal.",
  "roadmap.modals.safetyGate.note":
    "Dar luz verde fica registado em teu nome. Só a equipa de Confiança e Segurança devia fazer isto.",
  "roadmap.modals.safetyGate.confirmCta": "Aprovar revisão e publicar",
  "roadmap.modals.safetyGate.cancelCta": "Deixar bloqueado",

  // Juntar ideia
  "roadmap.modals.mergeIdea.eyebrow": "Juntar ideia",
  "roadmap.modals.mergeIdea.title":
    "Juntar isto a um <em>item já existente</em>",
  "roadmap.modals.mergeIdea.body":
    "Juntar move os votos e diz ao membro para onde foi a ideia dele.",
  "roadmap.modals.mergeIdea.ideaLabel": "Ideia de um membro",
  "roadmap.modals.mergeIdea.mergeIntoLabel": "Juntar a",
  "roadmap.modals.mergeIdea.suggestedTag": "sugerido",
  "roadmap.modals.mergeIdea.confirmCta": "Juntar e notificar",
  "roadmap.modals.mergeIdea.missingPickToast":
    "Escolhe um item do quadro para juntar",
  "roadmap.modals.mergeIdea.emptyTargets":
    "Ainda não há nada no quadro para juntar a isto.",

  // Recusar
  "roadmap.modals.decline.eyebrow": "Recusar",
  "roadmap.modals.decline.title": "Diz que não, com um <em>motivo</em>",
  "roadmap.modals.decline.ideaLabel": "Ideia de um membro",
  "roadmap.modals.decline.reasonLabel": "Motivo",
  "roadmap.modals.decline.publishedWordingLabel": "Texto publicado",
  "roadmap.modals.decline.publishedWordingHint":
    'aparece em "Não vamos construir isto, e porquê"',
  "roadmap.modals.decline.confirmCta": "Recusar publicamente",
  "roadmap.modals.decline.missingReasonToast":
    "Escreve o motivo. Recusar sem um motivo é silêncio",
  "roadmap.modals.decline.reason.scope.label": "Fora do que somos",
  "roadmap.modals.decline.reason.scope.wording":
    "Isto não é para o que a QueerPulse existe. Puxar-nos-ia na direção de sermos uma plataforma qualquer.",
  "roadmap.modals.decline.reason.unsafe.label":
    "Não conseguimos construir isto com segurança",
  "roadmap.modals.decline.reason.unsafe.wording":
    "Não conseguíamos lançar isto sem pôr membros em risco. Se isso mudar, voltamos a olhar para o assunto.",
  "roadmap.modals.decline.reason.capacity.label":
    "Sem capacidade, sinceramente",
  "roadmap.modals.decline.reason.capacity.wording":
    "Somos cinco pessoas. É uma ideia real que não conseguimos assumir agora.",
  "roadmap.modals.decline.reason.exists.label": "Já existe noutro lugar",
  "roadmap.modals.decline.reason.exists.wording":
    "Já há alguém na comunidade a fazer isto bem, e preferimos apontar para essa pessoa.",
  "roadmap.modals.decline.reason.harm.label": "O risco de dano supera o valor",
  "roadmap.modals.decline.reason.harm.wording":
    "A versão disto que funciona para alguns membros exporia outros.",

  // Notificar quem votou
  "roadmap.modals.notifyVoters.eyebrow": "Avisar quem pediu",
  "roadmap.modals.notifyVoters.title_one": "Notificar <em>{count}</em> membro",
  "roadmap.modals.notifyVoters.title_other":
    "Notificar <em>{count}</em> membros",
  "roadmap.modals.notifyVoters.itemLabel": "Item",
  "roadmap.modals.notifyVoters.messageLabel": "Mensagem",
  "roadmap.modals.notifyVoters.onceOnlyTitle":
    "Um único email, sem seguimentos",
  "roadmap.modals.notifyVoters.onceOnlySub":
    "Nunca voltamos a contactar quem já votou. Isto envia-se uma vez e para.",
  "roadmap.modals.notifyVoters.confirmCta": "Enviar uma vez",
  "roadmap.modals.notifyVoters.cancelCta": "Agora não",
  "roadmap.modals.notifyVoters.shippedMessage":
    '"{name}" já está ativo. Foste tu que pediste isto. Obrigade por teres falado.',
  "roadmap.modals.notifyVoters.movedMessage":
    '"{name}" acabou de passar para {column}.',

  // Resumo mensal
  "roadmap.modals.digest.eyebrow": "Resumo mensal",
  "roadmap.modals.digest.title": '"Pediram, nós <em>construímos</em>"',
  "roadmap.modals.digest.body":
    "Rascunhado a partir do quadro: o que foi lançado, que datas mudaram e porquê, e o que recusámos. Edita à vontade.",
  "roadmap.modals.digest.confirmCta": "Copiar para o email",
  "roadmap.modals.digest.heading": "O que aconteceu em {month}",
  "roadmap.modals.digest.shippedHeading": "Lançado",
  "roadmap.modals.digest.movedHeading": "Datas que mudaram, e porquê",
  "roadmap.modals.digest.movedEmpty": "Nada mudou este mês.",
  "roadmap.modals.digest.declinedHeading": "Ao que dissemos não",
  "roadmap.modals.digest.footer":
    "{count} coisas estão em curso. O quadro completo está em /roadmap.",

  // Registo de auditoria
  "roadmap.modals.auditLog.eyebrow": "Trilha de auditoria",
  "roadmap.modals.auditLog.title": "Cada mudança, <em>registada</em>",
  "roadmap.modals.auditLog.exportCta": "Exportar CSV para a governança",
  "roadmap.modals.auditLog.resetBoardCta": "Repor o quadro",
  "roadmap.modals.auditLog.resetBoardHint":
    "Repõe o quadro de demonstração deste navegador para o roteiro semeado. Todas as edições feitas em modo de demonstração são desfeitas. Isto não pode ser desfeito.",

  // Atalhos
  "roadmap.modals.shortcuts.eyebrow": "Teclado",
  "roadmap.modals.shortcuts.title": "Move-te sem o <em>rato</em>",
  "roadmap.modals.shortcuts.filter": "Filtrar",
  "roadmap.modals.shortcuts.newItem": "Novo item",
  "roadmap.modals.shortcuts.moveThroughCards": "Percorrer os cartões",
  "roadmap.modals.shortcuts.editFocused": "Editar o cartão em foco",
  "roadmap.modals.shortcuts.saveClose": "Guardar e fechar",
  "roadmap.modals.shortcuts.close": "Fechar",
  "roadmap.modals.shortcuts.thisList": "Esta lista",
  "roadmap.modals.shortcuts.dragMove": "Mover ou reordenar",
  "roadmap.modals.shortcuts.gotItCta": "Percebido",

  // ── Vista de Cronologia ─────────────────────────────────────────────────
  "roadmap.timelineView.unscheduledLabel": "Por agendar",
  "roadmap.timelineView.laneCount": "{items} itens · {shipped} lançados",

  // ── Vista de Capacidade ─────────────────────────────────────────────────
  "roadmap.capacityView.title": "Quem está a <em>carregar</em> o quê",
  "roadmap.capacityView.subtitle": "Carga em construção vs. horas indicadas",
  "roadmap.capacityView.loadSummary":
    "{building} em construção, {planned} planeados",
  "roadmap.capacityView.paidTag": "Pago",
  "roadmap.capacityView.volunteerTag": "Voluntariado",
  "roadmap.capacityView.unassignedActiveLabel": "Sem responsável, ativos",
  "roadmap.capacityView.unassignedActiveWarn": "{count} são P0/P1",
  "roadmap.capacityView.unassignedActiveOk": "Nenhum urgente",
  "roadmap.capacityView.paidVsVolunteerLabel": "Trabalho pago vs. voluntariado",
  "roadmap.capacityView.paidVsVolunteerFoot":
    "Os itens de voluntariado atrasam-se primeiro. É simplesmente assim que a aritmética funciona.",
  "roadmap.capacityView.needsFundingLabel": "Precisa de financiamento",
  "roadmap.capacityView.needsFundingEmpty": "Nada está à espera de dinheiro.",
  "roadmap.capacityView.sustainerNote":
    "Liga isto ao escalão de apoiante. Quem paga mais devia conseguir ver exatamente que item o seu dinheiro desbloqueia.",
  "roadmap.capacityView.emptyRosterTitle": "Ainda sem membros na equipa",
  "roadmap.capacityView.emptyRosterBody":
    "Adiciona alguém à equipa para veres aqui a sua carga em construção.",

  // ── Vista de Guias ──────────────────────────────────────────────────────
  "roadmap.guidesView.subtitle":
    "Guias de recursos com informação de saúde, legal ou de segurança: acompanha aqui tanto o estado da revisão como o de publicação.",
  "roadmap.guidesView.reVerifyWarning_one":
    "{count} guia precisa de reverificação. Informação de saúde e legal desatualiza-se. {names}.",
  "roadmap.guidesView.reVerifyWarning_other":
    "{count} guias precisam de reverificação. Informação de saúde e legal desatualiza-se. {names}.",
  "roadmap.guidesView.progressLabel": "Progresso",
  "roadmap.guidesView.reviewerLabel": "Revisor",
  "roadmap.guidesView.notAssigned": "Sem atribuição",
  "roadmap.guidesView.credentialNeeded": "falta credencial",
  "roadmap.guidesView.reVerifyByLabel": "Reverificar até",
  "roadmap.guidesView.overdueLabel": "{days} dias em atraso",
  "roadmap.guidesView.dueInLabel": "dentro de {days} dias",
  "roadmap.guidesView.emptyTitle": "Ainda sem guias",
  "roadmap.guidesView.emptyBody":
    "Marca um item do roteiro como guia de recursos para lhe dar uma lista de verificação.",

  // ── Vista de Ideias de membros ──────────────────────────────────────────
  "roadmap.ideasView.ageSuffix": "há {age}",
  "roadmap.ideasView.submittedByMember": "De um membro",
  "roadmap.ideasView.submittedByTeam": "Da equipa",
  "roadmap.ideasView.duplicateHint": "Parece um duplicado de {name}",
  "roadmap.ideasView.mergeInsteadCta": "Juntar em vez disso",
  "roadmap.ideasView.votesLabel": "votos",
  "roadmap.ideasView.mergeCta": "Juntar",
  "roadmap.ideasView.declineCta": "Recusar",
  "roadmap.ideasView.emptyTitle": "Caixa de entrada vazia",
  "roadmap.ideasView.emptyBody":
    'Todas as ideias de membros foram triadas. As ideias recusadas ficam em "Não vamos construir" com um motivo.',

  // ── Vista Não vamos construir ───────────────────────────────────────────
  "roadmap.notBuildingView.publicBanner":
    "Esta página é pública. Dizer o que não vamos construir, e porquê, é a coisa que mais gera confiança no roteiro. A maioria das plataformas esconde isto.",
  "roadmap.notBuildingView.hadAskedLabel": "tinham pedido",
  "roadmap.notBuildingView.reopenCta": "Reabrir",
  "roadmap.notBuildingView.emptyTitle": "Ainda nada recusado",
  "roadmap.notBuildingView.emptyBody":
    "Quando recusas uma ideia de um membro, ela fica aqui com o motivo.",

  // ── Vista de Arquivo ────────────────────────────────────────────────────
  "roadmap.archiveView.wasColumnLabel": "estava em {column}",
  "roadmap.archiveView.votesLabel": "votos",
  "roadmap.archiveView.restoreCta": "Restaurar",
  "roadmap.archiveView.deleteForGoodCta": "Eliminar definitivamente",
  "roadmap.archiveView.deleteConfirmTitle":
    'Eliminar "{name}" definitivamente?',
  "roadmap.archiveView.deleteConfirmBody":
    "Eliminar é para sempre. Arquivar guarda o histórico. Isto não pode ser desfeito.",
  "roadmap.archiveView.emptyTitle": "O arquivo está vazio",
  "roadmap.archiveView.emptyBody":
    "Arquivar guarda o histórico sem sobrecarregar o quadro. Eliminar é para sempre. Prefere arquivar.",

  // ── Vista de estatísticas públicas (editor da reformulação — grupo
  // separado do editor dos 3 separadores, ver nota acima de roadmap.heroStats.*)
  "roadmap.heroStatsView.title": "Estatísticas <em>públicas</em> do topo",
  "roadmap.heroStatsView.previewLinkCta": "Pré-visualizar página pública",
  "roadmap.heroStatsView.subtitle":
    "Estes quatro números ficam no topo do roteiro visto pelos membros. Mantém-nos honestos. Se um número precisar de uma ressalva, escreve-a na nota e ela aparece como dica.",
  "roadmap.heroStatsView.captionPlaceholder": "Ressalva / como se conta",
  "roadmap.heroStatsView.noGrowthTheatre":
    "Sem teatro de crescimento. Publicamos contagens e deixamos de fora números de seguidores ou gráficos de vaidade. Um número que não se explica numa frase não tem lugar aqui.",

  // ── Vista de pré-visualização pública ───────────────────────────────────
  "roadmap.publicPreview.banner_one":
    "É isto que os membros veem em /roadmap. {hidden} item oculto · {promises} assumidos como promessas · passa o rato por cima de qualquer item para o editar.",
  "roadmap.publicPreview.banner_other":
    "É isto que os membros veem em /roadmap. {hidden} itens ocultos · {promises} assumidos como promessas · passa o rato por cima de qualquer item para o editar.",
  "roadmap.publicPreview.editCta": "Editar",
  "roadmap.publicPreview.buildingHeading": "Em construção",
  "roadmap.publicPreview.buildingSub": "O que estamos mesmo a fazer agora.",
  "roadmap.publicPreview.nextUpHeading": "A seguir",
  "roadmap.publicPreview.nextUpSub":
    "Assumido. As datas são metas, e avisamos-te quando mudam.",
  "roadmap.publicPreview.somedayHeading": "Um dia, com sinceridade",
  "roadmap.publicPreview.somedaySub":
    "Queremos isto. Dar uma data seria mentir.",
  "roadmap.publicPreview.shippedHeading": "Lançado",
  "roadmap.publicPreview.shippedSub":
    "O registo de mudanças. Cada um destes foi pedido por alguém na sala.",
  "roadmap.publicPreview.notBuildingHeading":
    "Não vamos construir isto, e porquê",
  "roadmap.publicPreview.notBuildingSub":
    "A lista que a maioria das plataformas esconde. Se dissermos que não, tens um motivo.",
  "roadmap.publicPreview.requestedTag": "Pediste isto",
  "roadmap.publicPreview.committedTag": "Assumido",
  "roadmap.publicPreview.noPublicNoteFallback":
    "Ainda sem nota pública. Os membros não vão ver nada aqui até adicionares uma.",
  "roadmap.publicPreview.movedOnce": "Adiada uma vez: de {from} para {to}.",
  "roadmap.publicPreview.movedMultiple":
    "Adiada {count} vezes: de {from} para {to}.",
  "roadmap.publicPreview.noDateHonest": "Sem data, sinceramente",
  "roadmap.publicPreview.liveLabel": "Ativo",
  "roadmap.publicPreview.editItemTooltip": "Editar este item",
  "roadmap.publicPreview.subscribeHeading": "Sabe quando isto mudar",
  "roadmap.publicPreview.subscribeBody":
    "Um email por mês com o que foi lançado, o que mudou e ao que dissemos não. Nunca marketing de produto.",
  "roadmap.publicPreview.subscribeEmailPlaceholder": "tu@email.com",
  "roadmap.publicPreview.subscribeCta": "Subscrever",
  "roadmap.publicPreview.rssCta": "RSS",

  // ── Notificações — resposta para cada ação que altera dados ─────────────
  "roadmap.toasts.moved": '"{name}" passou para {column}',
  "roadmap.toasts.bulkMoved_one": "{count} item movido para {column}",
  "roadmap.toasts.bulkMoved_other": "{count} itens movidos para {column}",
  "roadmap.toasts.published": "Agora visível no roteiro público",
  "roadmap.toasts.hidden": "Oculto do roteiro público",
  "roadmap.toasts.duplicated": "Duplicado.",
  "roadmap.toasts.bulkPublished_one":
    "{count} item mostrado no roteiro público",
  "roadmap.toasts.bulkPublished_other":
    "{count} itens mostrados no roteiro público",
  "roadmap.toasts.bulkHidden_one": "{count} item ocultado do roteiro público",
  "roadmap.toasts.bulkHidden_other":
    "{count} itens ocultados do roteiro público",
  "roadmap.toasts.archived": '"{name}" arquivado',
  "roadmap.toasts.bulkArchived_one": "{count} item arquivado",
  "roadmap.toasts.bulkArchived_other": "{count} itens arquivados",
  "roadmap.toasts.restored": '"{name}" restaurado',
  "roadmap.toasts.deleted": '"{name}" eliminado',
  "roadmap.toasts.bulkDeleted_one": "{count} item eliminado",
  "roadmap.toasts.bulkDeleted_other": "{count} itens eliminados",
  "roadmap.toasts.saved": "Guardado. Roteiro público atualizado",
  "roadmap.toasts.dateMoved": "Data alterada. Os membros vão ver o motivo",
  "roadmap.toasts.safetyCleared": "Segurança confirmada e publicado",
  "roadmap.toasts.merged_one":
    "Juntado. {votes} voto movido, e {name} soube para onde foi",
  "roadmap.toasts.merged_other":
    "Juntado. {votes} votos movidos, e {name} soube para onde foi",
  "roadmap.toasts.promoted_one":
    '"{name}" promovido. {votes} pessoa notificada',
  "roadmap.toasts.promoted_other":
    '"{name}" promovido. {votes} pessoas notificadas',
  "roadmap.toasts.promoteError": "Não foi possível promover esta ideia",
  "roadmap.toasts.declined":
    "Recusado publicamente com um motivo. Avisámos {name}",
  "roadmap.toasts.reopened": '"{name}" está de volta à fila de ideias',
  "roadmap.toasts.reopenError": "Não foi possível reabrir esta ideia",
  "roadmap.toasts.notified_one":
    "{count} pessoa notificada. Um email, sem seguimentos",
  "roadmap.toasts.notified_other":
    "{count} pessoas notificadas. Um email, sem seguimentos",
  "roadmap.toasts.digestCopied": "Resumo copiado. Cola-o no email mensal",
  "roadmap.toasts.auditExported":
    "Registo de auditoria exportado para a governança",
  "roadmap.toasts.boardReset": "Quadro reposto com o roteiro semeado",

  // ── Página inicial (/admin/landing) ─────────────────────────────────────
  "landing.header.eyebrow": "Site público",
  "landing.header.sub":
    "Cura as secções que os visitantes não autenticados veem na página inicial.",

  "landing.tabs.member": "Pessoas",
  "landing.tabs.community": "Comunidades",
  "landing.tabs.changemaker": "Agentes de mudança",

  "landing.helper.member":
    "Só aparecem aqui pessoas públicas que aceitaram ser destacadas. Ninguém aparece sem ter dito que sim primeiro.",
  "landing.helper.community":
    "Qualquer comunidade publicada pode ser destacada. Escolhe as que gostarias que quem visita pela primeira vez visse.",
  "landing.helper.changemaker":
    "Os perfis de agentes de mudança publicados estão prontos a ser destacados aqui.",

  "landing.picker.searchPlaceholder": "Pesquisar por nome…",
  "landing.picker.searchAriaLabel": "Pesquisar pessoas elegíveis para destaque",
  "landing.picker.addCta": "Adicionar",
  "landing.picker.submitCta": "Adicionar à página inicial",
  "landing.picker.addedToast": "Adicionado à página inicial",
  "landing.picker.addError": "Não foi possível adicionar. Tenta outra vez",
  "landing.picker.noResults": 'Sem resultados para "{search}".',
  "landing.picker.empty.member":
    "Ninguém elegível neste momento. As pessoas têm de aceitar antes de poderem aparecer aqui.",
  "landing.picker.empty.community":
    "Ainda não há comunidades publicadas elegíveis.",
  "landing.picker.empty.changemaker":
    "Ainda não há perfis de agentes de mudança publicados elegíveis.",

  "landing.editor.quoteLabel": "Citação",
  "landing.editor.quoteHelper":
    "Uma frase curta, nas palavras dela: o que a QueerPulse significa para a pessoa.",
  "landing.editor.quotePlaceholder":
    '"Este foi o primeiro lugar onde me senti completamente eu."',
  "landing.editor.blurbLabel": "Descrição breve",
  "landing.editor.blurbHelperOptional":
    "Opcional: uma frase sobre o que torna esta comunidade especial.",
  "landing.editor.blurbPlaceholder": "Uma ou duas frases, nas tuas palavras.",
  "landing.editor.causeLabel": "Causa",
  "landing.editor.causePlaceholder": "ex.: Justiça habitacional",
  "landing.editor.tagsLabel": "Etiquetas",
  "landing.editor.tagsHelper":
    "Separadas por vírgulas: aparecem como pequenas etiquetas por baixo do nome.",
  "landing.editor.tagsPlaceholder": "habitação, entreajuda, ativismo",
  "landing.editor.editCta": "Editar texto",
  "landing.editor.collapseCta": "Fechar",
  "landing.editor.save": "Guardar",
  "landing.editor.savedToast": "Texto guardado",
  "landing.editor.saveError": "Não foi possível guardar. Tenta outra vez",

  "landing.list.activeToggleAria": "Mostrar {name} na página inicial pública",
  "landing.list.activeToggleLabel": "Ativo",
  "landing.list.inactivePill": "Ocultado por ti",
  "landing.list.moveUpAria": "Mover {name} para cima",
  "landing.list.moveDownAria": "Mover {name} para baixo",
  "landing.list.reorderError": "Não foi possível reordenar. Tenta outra vez",
  "landing.list.activeToggleError":
    "Não foi possível atualizar. Tenta outra vez",
  "landing.list.previewEmpty":
    "Ainda sem texto. Adiciona algum para ficar bem na página inicial.",
  "landing.list.unknownTarget": "Este perfil já não existe",
  "landing.list.empty.member.title": "Ainda sem pessoas em destaque",
  "landing.list.loadError.title": "A lista em destaque não carregou",
  "landing.list.loadError.body":
    "A falha é do nosso lado. Pode haver destaques publicados que esta lista não conseguiu ler. Tenta de novo.",
  "landing.list.empty.member.body":
    "Procura uma pessoa pública à esquerda e adiciona-a. A citação dela vai aparecer aqui, pronta a editar.",
  "landing.list.empty.community.title": "Ainda sem comunidades em destaque",
  "landing.list.empty.community.body":
    "Procura uma comunidade publicada à esquerda e adiciona-a à página inicial.",
  "landing.list.empty.changemaker.title":
    "Ainda sem agentes de mudança em destaque",
  "landing.list.empty.changemaker.body":
    "Procura um perfil de agente de mudança publicado à esquerda e adiciona-o à página inicial.",

  "landing.remove.cta": "Remover",
  "landing.remove.title": "Remover da página inicial?",
  "landing.remove.body":
    "Isto tira a pessoa da página inicial pública. Podes voltar a destacá-la quando quiseres.",
  "landing.remove.confirm": "Remover",
  "landing.remove.toast": "Removido da página inicial",
  "landing.remove.error": "Não foi possível remover. Tenta outra vez",

  // `hiddenReason` classificado pelo backend num slot já destacado — ver
  // `HIDDEN_REASON_KEY` em `landingFeatures.adapters.ts`.
  "landing.hidden.consent_revoked": "Oculto: consentimento retirado",
  "landing.hidden.went_private": "Oculto: perfil tornou-se privado",
  "landing.hidden.unpublished": "Oculto: despublicado",
  "landing.hidden.not_public": "Oculto: já não é público",
  "landing.hidden.deleted": "Oculto: perfil eliminado",

  // ── Pré-visualização da página inicial (AdminLandingPreview) ────────────
  "landing.preview.eyebrow": "Pré-visualização da página inicial",
  "landing.preview.note":
    "Como esta secção aparece na página inicial para quem não tem sessão. Atualiza à medida que editas.",
  "landing.preview.loading": "A montar a pré-visualização…",
  "landing.preview.empty":
    "Ainda não há nada em destaque. Adiciona alguém à esquerda para veres a pré-visualização.",
  "landing.preview.pendingTitle": "Adicionado, detalhes ainda a carregar",
  "landing.preview.pendingNote":
    "Aparecem como cartões completos assim que os seus dados reais carregarem.",

  // ── Kit de imprensa (/admin/press-kit) ────────────────────────────────────
  "pressKit.header.eyebrow": "Site público",
  "pressKit.header.sub":
    "Faz a curadoria da cobertura de imprensa e dos contactos mostrados no kit de imprensa público.",

  "pressKit.tabs.coverage": "Cobertura",
  "pressKit.tabs.team": "Equipa",

  "pressKit.fields.source": "Publicação",
  "pressKit.fields.sourcePlaceholder": "ex.: Público",
  "pressKit.fields.publishedOn": "Publicado",
  "pressKit.fields.publishedOnPlaceholder": "ex.: 4 mar 2026",
  "pressKit.fields.title": "Título",
  "pressKit.fields.titlePlaceholder": "O título da peça, tal como publicado.",
  "pressKit.fields.meta": "Detalhe",
  "pressKit.fields.metaHelper":
    "Autoria, extensão ou formato: mostrado sob o título.",
  "pressKit.fields.metaPlaceholder": "ex.: Reportagem longa · por Ana Sá Lopes",
  "pressKit.fields.url": "Ligação",
  "pressKit.fields.urlHelper":
    "Opcional: deixa em branco se não houver versão online.",
  "pressKit.fields.urlPlaceholder": "https://…",
  "pressKit.fields.name": "Nome",
  "pressKit.fields.namePlaceholder": "ex.: Marta Reis",
  "pressKit.fields.role": "Função",
  "pressKit.fields.rolePlaceholder": "ex.: Fundadora e diretora",
  "pressKit.fields.description": "Sobre o que fala",
  "pressKit.fields.descriptionPlaceholder":
    "ex.: Fala sobre estratégia, financiamento e a história da plataforma.",
  "pressKit.fields.email": "Email",
  "pressKit.fields.emailPlaceholder": "nome@queerpulse.app",
  "pressKit.fields.languages": "Línguas",
  "pressKit.fields.languagesPlaceholder": "ex.: EN / PT",
  "pressKit.fields.avatarUrl": "Foto",
  "pressKit.fields.avatarUrlHelper": "Opcional: uma ligação para a fotografia.",
  "pressKit.fields.avatarUrlPlaceholder": "https://…",

  "pressKit.add.coverage.cta": "Adicionar cobertura",
  "pressKit.add.coverage.submit": "Adicionar ao kit",
  "pressKit.add.coverage.toast": "Cobertura adicionada",
  "pressKit.add.coverage.error": "Não foi possível adicionar. Tenta de novo",
  "pressKit.add.team.cta": "Adicionar contacto",
  "pressKit.add.team.submit": "Adicionar ao kit",
  "pressKit.add.team.toast": "Contacto adicionado",
  "pressKit.add.team.error": "Não foi possível adicionar. Tenta de novo",

  "pressKit.list.inactivePill": "Oculto por ti",
  "pressKit.list.loadError.title": "O kit de imprensa não carregou",
  "pressKit.list.loadError.body":
    "A falha é do nosso lado, por isso nada aparece porque nada chegou. Tenta de novo.",
  "pressKit.list.previewEmpty": "Ainda sem detalhe.",
  "pressKit.list.moveUpAria": "Mover {name} para cima",
  "pressKit.list.moveDownAria": "Mover {name} para baixo",
  "pressKit.list.activeToggleAria": "Mostrar {name} no kit de imprensa público",
  "pressKit.list.activeToggleLabel": "Visível",
  "pressKit.list.activeToggleError":
    "Não foi possível atualizar. Tenta de novo",
  "pressKit.list.reorderError": "Não foi possível reordenar. Tenta de novo",
  "pressKit.list.empty.coverage.title": "Ainda sem cobertura em destaque",
  "pressKit.list.empty.coverage.body":
    "Adiciona uma peça de imprensa acima para a mostrar no kit público.",
  "pressKit.list.empty.team.title": "Ainda sem contactos listados",
  "pressKit.list.empty.team.body":
    "Adiciona um contacto de imprensa acima para as jornalistas saberem a quem chegar.",

  "pressKit.editor.edit": "Editar",
  "pressKit.editor.close": "Fechar",
  "pressKit.editor.save": "Guardar",
  "pressKit.editor.savedToast": "Guardado",
  "pressKit.editor.saveError": "Não foi possível guardar. Tenta de novo",

  "pressKit.remove.cta": "Remover",
  "pressKit.remove.confirm": "Remover",
  "pressKit.remove.toast": "Removido do kit de imprensa",
  "pressKit.remove.error": "Não foi possível remover. Tenta de novo",
  "pressKit.remove.coverage.title": "Remover esta cobertura?",
  "pressKit.remove.coverage.body":
    "Deixará de aparecer no kit de imprensa público. Podes voltar a adicioná-la mais tarde.",
  "pressKit.remove.team.title": "Remover este contacto?",
  "pressKit.remove.team.body":
    "Deixará de aparecer no kit de imprensa público. Podes voltar a adicioná-lo mais tarde.",

  "pressKit.facts.title": "Factos (auto)",
  "pressKit.facts.sub":
    "Derivados dos dados da plataforma. Mostrados no kit público, e só de leitura aqui.",
  "pressKit.facts.empty": "Ainda sem factos disponíveis.",

  // ── Integridade dos anúncios de habitação (Wave B1) — fila por risco ──

  // ── Relatórios consolidados da plataforma (ADM-17/ADM-19) — /admin/reports ──
  "reports.title": "<em>Relatórios</em> da plataforma",
  "reports.header.eyebrow": "Relatórios",
  "reports.header.title": "<em>Relatórios</em> da plataforma",
  "reports.header.sub":
    "Crescimento, denúncias por tipo, finanças da governação e saúde das comunidades, num só lugar.",
  "reports.trends.title": "Crescimento e denúncias por tipo",
  "reports.trends.sub":
    "Ajusta o período para veres uma janela mais longa ou mais curta.",
  "reports.trends.rangeWeeks": "{count}sem",
  "reports.trends.exportGrowth": "Exportar CSV de crescimento",
  "reports.trends.exportReportsByType": "Exportar CSV de denúncias",
  "reports.trends.exportToast": "Exportação iniciada",
  "reports.trends.exportError": "Não foi possível exportar. Tenta de novo",
  "reports.finance.title": "Finanças da governação",
  "reports.finance.sub": "Receita, despesa e excedente trimestrais.",
  "reports.finance.latestQuarter": "Último trimestre: {quarter}",
  "reports.finance.income": "Receita: {amount}",
  "reports.finance.expense": "Despesa: {amount}",
  "reports.finance.surplus": "Excedente: {amount}",
  "reports.communityHealth.title": "Saúde das comunidades",
  "reports.communityHealth.sub":
    "Uma fotografia da pontuação de saúde de cada comunidade.",
  "reports.communityHealth.asOfNow":
    "A partir das {time}. Uma fotografia num momento.",
  "reports.communityHealth.notMeasured": "Ainda não medido",
  "reports.communityHealth.averageScore": "Pontuação média: {score}",
  "reports.communityHealth.needingSupport": "{count} a precisar de apoio",
  "reports.communityHealth.needsSupportChip": "Precisa de apoio",
  "reports.communityHealth.columns.name": "Comunidade",
  "reports.communityHealth.columns.score": "Pontuação",
  "reports.communityHealth.columns.activity": "Atividade",
  "reports.communityHealth.columns.members": "Membros",
  "reports.communityHealth.columns.openReports": "Denúncias abertas",

  "dashboard.viewFullReport": "Ver relatório completo",

  // ── CNT-14: CRUD de diretório de recursos (admin) ───────────────────────
  "adminResourceListings.title": "Diretório de <em>recursos</em>",
  "adminResourceListings.header.eyebrow": "Diretório",
  "adminResourceListings.header.sub":
    "As organizações reais e verificadas de Apoio Jurídico e Testagem de Saúde Sexual que os membros podem contactar. Publicar aqui é sempre um passo deliberado: aprovar uma sugestão nunca cria um recurso automaticamente.",
  "adminResourceListings.newCta": "Novo recurso",
  "adminResourceListings.empty":
    "Ainda não há recursos. Crie o primeiro, ou consulte a fila de sugestões para ideias.",
  "adminResourceListings.loadError": "Não foi possível carregar os recursos.",
  "adminResourceListings.category.legal_aid": "Apoio Jurídico",
  "adminResourceListings.category.sexual_health_testing":
    "Testagem de Saúde Sexual",
  "adminResourceListings.status.active": "Ativo",
  "adminResourceListings.status.archived": "Arquivado",
  "adminResourceListings.row.noRegion": "Sem região definida",
  "adminResourceListings.field.category": "Categoria",
  "adminResourceListings.field.title": "Título",
  "adminResourceListings.field.description": "Descrição",
  "adminResourceListings.field.region": "Região / morada",
  "adminResourceListings.field.phone": "Telefone",
  "adminResourceListings.field.email": "E-mail",
  "adminResourceListings.field.website": "Site",
  "adminResourceListings.field.status": "Estado",
  "adminResourceListings.form.editEyebrow": "Editar recurso",
  "adminResourceListings.form.editTitle": "Editar recurso",
  "adminResourceListings.form.createTitle": "Novo recurso",
  "adminResourceListings.form.createCta": "Criar recurso",
  "adminResourceListings.toast.created": '"{title}" foi publicado.',
  "adminResourceListings.toast.updated": '"{title}" foi atualizado.',
  "adminResourceListings.toast.removed": '"{title}" foi removido.',
  "adminResourceListings.delete.title": 'Remover "{title}"?',
  "adminResourceListings.delete.body":
    "Este recurso deixará de ser mostrado aos membros. Esta ação não pode ser desfeita aqui.",
  "adminResourceListings.delete.confirmCta": "Remover recurso",

  // ── CNT-14: fila de revisão de sugestões (admin) ────────────────────────
  "adminResourceSuggestions.title": "Sugestões de <em>recursos</em>",
  "adminResourceSuggestions.header.eyebrow": "Fila de revisão",
  "adminResourceSuggestions.header.title": "Sugestões de <em>recursos</em>",
  "adminResourceSuggestions.header.sub":
    "Todos os recursos de Apoio Jurídico / Testagem de Saúde Sexual sugeridos por membros. Aprovar aqui apenas regista a decisão: publique o recurso real e verificado manualmente em Diretório de recursos.",
  "adminResourceSuggestions.filter.all": "Todas as categorias",
  "adminResourceSuggestions.category.legal_aid": "Apoio Jurídico",
  "adminResourceSuggestions.category.sexual_health_testing":
    "Testagem de Saúde Sexual",
  "adminResourceSuggestions.status.pending": "Pendente",
  "adminResourceSuggestions.status.approved": "Aprovada",
  "adminResourceSuggestions.status.declined": "Recusada",
  "adminResourceSuggestions.status.archived": "Arquivada",
  "adminResourceSuggestions.action.approve": "Aprovar",
  "adminResourceSuggestions.action.decline": "Recusar",
  "adminResourceSuggestions.action.archive": "Arquivar",
  "adminResourceSuggestions.row.by": "Sugerido por {name}",
  "adminResourceSuggestions.row.sent": "Enviado a {date}",
  "adminResourceSuggestions.unknownMember": "Um membro",
  "adminResourceSuggestions.empty": "Ainda não há sugestões.",
  "adminResourceSuggestions.error": "Não foi possível carregar as sugestões.",
  "adminResourceSuggestions.loadMore": "Carregar mais",
  "adminResourceSuggestions.loadingMore": "A carregar…",
  "adminResourceSuggestions.toast.approved": "Sugestão aprovada.",
  "adminResourceSuggestions.toast.declined": "Sugestão recusada.",
  "adminResourceSuggestions.toast.archived": "Sugestão arquivada.",
  "adminResourceSuggestions.toast.error":
    "Não foi possível atualizar a sugestão.",

  // ── Pedidos de etiquetas de comunidades (AdminCommunityTagRequestsPage) ───
  "adminCommunityTagRequests.title": "Pedidos de <em>etiquetas</em>",
  "adminCommunityTagRequests.header.eyebrow": "Fila de revisão",
  "adminCommunityTagRequests.header.title": "Pedidos de <em>etiquetas</em>",
  "adminCommunityTagRequests.header.sub":
    "Sugestões de etiquetas de proprietários e moderadores de comunidades, para etiquetas que ainda não existem.",
  "adminCommunityTagRequests.filter.pending": "Pendentes",
  "adminCommunityTagRequests.filter.resolved": "Resolvidos",
  "adminCommunityTagRequests.filter.all": "Todos",
  "adminCommunityTagRequests.status.pending": "Pendente",
  "adminCommunityTagRequests.status.resolved": "Resolvido",
  "adminCommunityTagRequests.row.by": "Pedido por {name}",
  "adminCommunityTagRequests.row.sent": "Enviado a {date}",
  "adminCommunityTagRequests.unknownRequester": "Um membro",
  "adminCommunityTagRequests.withheldRequester": "Não visível aqui",
  "adminCommunityTagRequests.action.resolve": "Resolver",
  "adminCommunityTagRequests.empty": "Ainda não há pedidos de etiquetas.",
  "adminCommunityTagRequests.error":
    "Não foi possível carregar os pedidos de etiquetas.",
  "adminCommunityTagRequests.loadMore": "Carregar mais",
  "adminCommunityTagRequests.loadingMore": "A carregar…",
  "adminCommunityTagRequests.toast.resolved": "Pedido de etiqueta resolvido.",
  "adminCommunityTagRequests.toast.error":
    "Não foi possível resolver o pedido.",

  // ── 2026-08-21 code-review 4.6 fixes ──
  "members.flagged.openMemberAriaLabel": "Abrir os detalhes de {handle}",
  "members.flagged.loadingDrawerLabel": "A carregar os detalhes do membro",
  "members.flagged.loadErrorToast":
    "Não foi possível carregar os detalhes deste membro. Tenta outra vez",
  "adminListings.queerOwned.verifyCta": "Confirmar negócio queer",
  "adminListings.queerOwned.unverifyCta": "Retirar negócio queer",
  "adminListings.queerOwned.toast.verified":
    "{name} passou a ter o selo de negócio queer verificado.",
  "adminListings.queerOwned.toast.unverified":
    "Retirámos o selo de negócio queer verificado a {name}.",
  "listingClaims.empty": "Sem reivindicações neste filtro, por agora.",
  "listingClaims.loadError.title": "A fila de reivindicações não carregou",
  "listingClaims.loadError.body":
    "A falha é do nosso lado, por isso a fila está vazia porque nada chegou. Pode haver reivindicações pendentes. Tenta de novo.",
  "listingClaims.claimedBy": "Reivindicado por {name}",
  "listingClaims.unknownClaimant": "um membro desconhecido",
  "listingClaims.approveCta": "Aprovar",
  "listingClaims.declineCta": "Recusar",
  "communities.grid.truncatedNotice":
    "A leitura das denúncias atingiu o limite. Podem faltar denúncias recentes nestes números de saúde.",
  "communities.queue.truncatedNotice":
    "A leitura das denúncias atingiu o limite. Podem faltar denúncias desta comunidade na lista abaixo.",
  "communities.settings.mod.removeFromCommunityAriaLabel":
    "Remover {name} da comunidade",
  "communities.settings.mod.removeFromCommunityConfirmTitle":
    "Remover {name} desta comunidade?",
  "communities.settings.mod.removeFromCommunityConfirmBody":
    "{name} perde o papel de moderação e o lugar na comunidade, e recebe um aviso de que já não faz parte dela. As publicações ficam. Pode voltar a pedir para entrar, segundo as regras de entrada da comunidade.",
  "communities.settings.mod.removeFromCommunityCta": "Remover da comunidade",
  "communities.settings.mod.removedFromCommunityToast":
    "Removemos {name} da comunidade",
  "communities.settings.mod.removeFromCommunityFailedToast":
    "Não foi possível remover {name} da comunidade",
  "communities.settings.mod.removeFromCommunityOwnerError":
    "Não é possível remover da comunidade quem a fundou.",
  "governance.overview.badge.neverEdited": "Ainda sem edições",
  "governance.overview.badge.editedBy": "Editado por {name} em {date}",
  "governance.overview.edit.dragToReorder": "Arrasta para reordenar",
  "governance.overview.edit.removeRow": "Remover esta linha",
  "governance.overview.edit.removeRowNamed": "Remover {label}",
  "governance.overview.edit.moveRowUp": "Mover {label} para cima",
  "governance.overview.edit.moveRowDown": "Mover {label} para baixo",
  "governance.overview.edit.rowMoved":
    "{label} passou para a posição {position} de {total}",
  "governance.overview.edit.addRow": "Adicionar uma linha",
  "governance.overview.edit.section.note": "Motivo (opcional)",
  "governance.overview.edit.save": "Guardar secção",
  "governance.overview.edit.saved": "Secção atualizada.",
  "governance.overview.edit.noChanges": "Nada foi alterado.",
  "governance.overview.edit.error":
    "Não foi possível guardar. Tenta novamente.",
  "governance.overview.health.title": "Saúde da <em>comunidade</em>",
  "governance.overview.health.sub":
    "Os números da página pública de Governação, na ordem em que as pessoas os veem. As pessoas ativas são contadas em direto e não se escrevem aqui.",
  "governance.overview.health.field.value": "Valor",
  "governance.overview.health.field.trend": "Linha de tendência",
  "governance.overview.health.field.trendCount": "Número da tendência",
  "governance.overview.health.field.up": "Mostrar como subida",
  "governance.overview.moderation.title": "Como funciona a <em>moderação</em>",
  "governance.overview.moderation.sub":
    "Os passos que as pessoas leem na página pública de Governação, pela ordem em que acontecem.",
  "governance.overview.council.title": "Conselho <em>consultivo</em>",
  "governance.overview.council.sub":
    "Quem tem assento no conselho, e por que ordem aparece na página pública de Governação.",
  "governance.overview.council.field.name": "Nome",
  "governance.overview.council.field.initials": "Iniciais",
  "governance.overview.council.field.role": "Papel",
  "governance.overview.council.field.tint": "Cor do avatar",
  "governance.overview.council.addSeat": "Adicionar um assento",
  "governance.overview.principles.title": "Princípios da <em>plataforma</em>",
  "governance.overview.principles.sub":
    "As promessas listadas na página pública de Governação, pela ordem em que as pessoas as leem.",
  "governance.overview.principles.field.icon": "Ícone",
  "governance.overview.decisions.title": "Decisões <em>recentes</em>",
  "governance.overview.decisions.sub":
    "Que decisões aparecem no registo público, das mais recentes para as mais antigas.",
  "members.verify.mutualLabel": "Conhecimento em comum",
  "errors.updatePartner":
    "Não foi possível atualizar essa organização parceira",
  "errors.saveChanges": "Não foi possível guardar essas alterações",
  "errors.createCoop": "Não foi possível criar essa cooperativa",
  "errors.createTier": "Não foi possível criar esse escalão",
  "errors.saveDecision": "Não foi possível guardar essa decisão",
  "errors.removeListing": "Não foi possível remover esse recurso",
  "errors.updateCoop": "Não foi possível atualizar essa cooperativa",
  "errors.removeCoop": "Não foi possível remover essa cooperativa",
  "errors.saveTestimonial": "Não foi possível guardar esse testemunho",
  "errors.updateTier": "Não foi possível atualizar esse escalão",
  "errors.removeTier": "Não foi possível remover esse escalão",
  "errors.createListing": "Não foi possível criar esse recurso",
  "errors.saveChange": "Não foi possível guardar essa alteração",
  "errors.updateTargetDate": "Não foi possível atualizar a data da meta",
  "errors.updateVisibility": "Não foi possível atualizar a visibilidade",
  "errors.createItem": "Não foi possível criar esse item",
  "errors.archiveItem": "Não foi possível arquivar esse item",
  "errors.deleteItem": "Não foi possível eliminar esse item",
  "errors.restoreItem": "Não foi possível restaurar esse item",
  "errors.saveStat": "Não foi possível guardar essa estatística",
  "governance.finances.edit.field.amountInvalid":
    "Escreve isto como número. 1840, 1840,50 e 1 840,50 funcionam todos.",
  "governance.finances.edit.field.amountRequired":
    "Esta linha precisa de um valor. Desliga a linha se já não se aplica.",
  "governance.finances.edit.blockedByAmounts":
    "Só podes guardar quando todos os valores assinalados forem números.",
  "moderation.action.created": "Denúncia recebida",
  "moderation.action.appealOverturned": "Recurso revogado",
  "moderation.oldestNote_one":
    "A mostrar {count} denúncia em aberto · a mais antiga chegou {oldest}",
  "moderation.oldestNote_other":
    "A mostrar {count} denúncias em aberto · a mais antiga chegou {oldest}",
  "members.drawer.label": "{name}, detalhe do membro",
  "members.flagged.openReportsCta": "Ver denúncias",
  "members.flagged.openReportsAriaLabel": "Abrir as denúncias sobre {handle}",
  "modPanel.members.unavailableToast":
    "Não foi possível agir sobre a linha de {name}. Recarrega a lista de membros e tenta outra vez.",
  "modPanel.members.roleErrorToast":
    "O papel de {name} não mudou. Nada foi guardado, por isso tenta novamente daqui a pouco.",
  "modPanel.members.removeErrorToast":
    "{name} continua na comunidade. A remoção não foi concluída.",
  "modPanel.members.removeConfirm.title": "Remover {name}?",
  "modPanel.members.removeConfirm.body":
    "{name} perde acesso às publicações e aos eventos desta comunidade de imediato. Pode voltar a pedir para entrar mais tarde, e analisas esse pedido como qualquer outro.",
  "modPanel.members.removeConfirm.cta": "Sim, remover",
  "modPanel.requests.errorToast":
    "O pedido de {name} continua à espera. Essa decisão não foi concluída.",
  "modPanel.requests.approveAllConfirm.title_one": "Aprovar este pedido?",
  "modPanel.requests.approveAllConfirm.title_other":
    "Aprovar todos os {count} pedidos?",
  "modPanel.requests.approveAllConfirm.body_one":
    "Entra na comunidade de imediato. Podes remover alguém mais tarde no separador Membros.",
  "modPanel.requests.approveAllConfirm.body_other":
    "Os {count} entram na comunidade de imediato. Podes remover alguém mais tarde no separador Membros.",
  "modPanel.requests.approveAllConfirm.cta": "Sim, aprovar",
  "modPanel.requests.approvedSomeToast":
    "{approved} aprovados. {failed} não foram concluídos e continuam à espera de ti.",
  "modPanel.requests.approveAllFailedToast_one":
    "O pedido não foi concluído. Continua à espera de ti.",
  "modPanel.requests.approveAllFailedToast_other":
    "Nenhum dos {count} pedidos foi concluído. Continuam todos à espera de ti.",
  "common.notSet": "Por definir",
  "vouchGraph.pathSeparator": "para",
  "roadmap.modals.auditLog.empty": "Ainda não há alterações registadas.",
  "media.delete.confirmAnyway": "Eliminar mesmo assim",
  "media.delete.refusedTitle": "Este ficheiro ainda está em uso",
  "media.delete.refusedInUse_one":
    "O servidor voltou a verificar e este ficheiro ainda é usado num local, listado abaixo. Eliminá-lo agora quebra essa imagem de vez, e a decisão fica registada.",
  "media.delete.refusedInUse_other":
    "O servidor voltou a verificar e este ficheiro ainda é usado em {count} locais, listados abaixo. Eliminá-lo agora quebra essas imagens de vez, e a decisão fica registada.",
  "media.delete.refusedUnverified":
    "O servidor não conseguiu verificar onde este ficheiro é usado, por isso recusou eliminá-lo. Tenta outra vez daqui a pouco, ou elimina mesmo assim se for uma remoção urgente. A decisão fica registada.",
  "errors.deleteMediaObject": "Não foi possível eliminar esse ficheiro",
  "roadmap.modals.digest.movedLine": "mudou de {from} para {to}",

  // ── 2026-08-21 code-review 4.6: dynamic-key siblings ──
  "listingClaims.filter.pending": "Pendentes",
  "listingClaims.filter.approved": "Aprovadas",
  "listingClaims.filter.declined": "Recusadas",
  "listingClaims.filter.all": "Todas",
  "listingClaims.status.pending": "Pendente",
  "listingClaims.status.approved": "Aprovada",
  "listingClaims.status.declined": "Recusada",
  "listingClaims.toast.approved":
    "{name} passou a pertencer a quem o reivindicou.",
  "listingClaims.toast.declined": "A reivindicação de {name} foi recusada.",
  // ENG-41: a fila de pendentes é paginada, por isso a sua dimensão real e as
  // linhas já carregadas são números diferentes.
  "listingClaims.pendingCount_one": "{count} reivindicação à espera",
  "listingClaims.pendingCount_other": "{count} reivindicações à espera",
  "listingClaims.loadMore": "Carregar mais reivindicações",
  "listingClaims.loadingMore": "A carregar…",
  "governance.overview.health.stat.activeMembers": "Pessoas ativas",
  "governance.overview.health.stat.retention": "Taxa de retenção de pessoas",
  "governance.overview.health.stat.reportsFiled":
    "Denúncias apresentadas este trimestre",
  "governance.overview.health.stat.membersRemoved": "Pessoas afastadas",
  "governance.overview.health.stat.gatheringsHosted": "Convívios realizados",
  "governance.overview.health.stat.appealUpheld":
    "Contestação de moderação aceite",
  "governance.overview.health.trend.upThisQuarter": "Subiu este trimestre",
  "governance.overview.health.trend.steady": "Estável",
  "governance.overview.health.trend.allResolved": "Todas resolvidas",
  "governance.overview.health.trend.cocViolations":
    "Violações do Código de Cuidado",
  "governance.overview.health.trend.upVsQ1": "Subiu face ao T1",
  "governance.overview.health.trend.ofFiled": "das apresentadas",
  "governance.overview.moderation.step.reportFiled": "Denúncia apresentada",
  "governance.overview.moderation.step.review": "Revisão em 48 horas",
  "governance.overview.moderation.step.decision": "Decisão e comunicação",
  "governance.overview.moderation.step.appeal": "Direito a contestar",
  "governance.overview.council.role.psychologistChair":
    "Psicologia · Presidência",
  "governance.overview.council.role.lawyerLegalAdvisor":
    "Direito · Aconselhamento jurídico",
  "governance.overview.council.role.housingActivist": "Ativismo pela habitação",
  "governance.overview.council.role.healthcareAdvocate": "Defesa da saúde",
  "governance.overview.council.tint.jade": "Jade",
  "governance.overview.council.tint.violet": "Violeta",
  "governance.overview.council.tint.plum": "Ameixa",
  "governance.overview.principles.key.noSellingData":
    "Nunca vendemos dados de pessoas",
  "governance.overview.principles.key.visibilityChoice":
    "A visibilidade é sempre uma escolha tua",
  "governance.overview.principles.key.noAlgorithms":
    "Nenhum algoritmo decide quem vês",
  "governance.overview.principles.key.communityVoice":
    "A comunidade tem voz nas decisões",
  "governance.overview.principles.key.transparency":
    "A transparência não é negociável",
  "governance.overview.principles.key.accessNotConditional":
    "O acesso não depende da capacidade de pagar",
  "governance.overview.principles.icon.lock": "Cadeado",
  "governance.overview.principles.icon.eye": "Olho",
  "governance.overview.principles.icon.slash": "Círculo cortado",
  "governance.overview.principles.icon.message": "Balão de mensagem",
  "governance.overview.principles.icon.book": "Livro",
  "governance.overview.principles.icon.accessible": "Acessibilidade",
  "governance.overview.decisions.key.slidingScale":
    "Maio de 2026: Introduzida escala progressiva para os convívios",
  "governance.overview.decisions.key.forumLaunched":
    "Abril de 2026: Fórum lançado",
  "governance.overview.decisions.key.visibilityDefaults":
    "Março de 2026: Predefinições de visibilidade tornadas mais conservadoras",
  "governance.overview.decisions.key.languageToggle":
    "Fevereiro de 2026: Alternador de idioma adicionado",

  // ── 2026-08-21 code-review 4.6 fixes ──
  "moderation.resolved.closedAt": "Fechada {age}",
  "moderation.resolved.resolvedBy": "Resolvida por {name}: {note}",
  "moderation.notified.member": "Membro notificado",
  "moderation.notified.reporter": "Quem denunciou foi notificado",
  "moderation.notified.affected": "Membro afetado apoiado",
  "moderation.reporter.anonymous": "anónimo",
  "communities.queue.status.open": "Aberta",
  "communities.queue.status.resolved": "Resolvida",
  "communities.queue.status.escalated": "Encaminhada",

  // ── ID-04 · Fila de revisão de pedidos sobre dados pessoais (/admin/dsar) ──
  // Um pedido RGPD arranca um prazo legal de 30 dias no momento em que é
  // submetido, por isso toda a redação aqui gira à volta desse prazo. Nada
  // neste bloco pode prometer email: o único canal que a plataforma tem é uma
  // notificação QueerPulse.
  "adminDsar.navLabel": "Pedidos de dados",
  "adminDsar.title": "Pedidos de <em>dados</em>",
  "adminDsar.header.eyebrow": "Fila de revisão",
  "adminDsar.header.title": "Pedidos sobre <em>dados pessoais</em>",
  "adminDsar.header.sub":
    "Todos os pedidos de dados submetidos por membros, com o prazo legal mais próximo à cabeça. Cada um tem 30 dias.",
  "adminDsar.header.subOverdue":
    "Prazo legal mais próximo à cabeça. Fora do prazo de 30 dias neste momento: {count}.",
  "adminDsar.filter.received": "Recebidos",
  "adminDsar.filter.in_review": "Em análise",
  "adminDsar.filter.resolved": "Resolvidos",
  "adminDsar.filter.rejected": "Recusados",
  "adminDsar.filter.all": "Todos",
  "adminDsar.status.received": "Recebido",
  "adminDsar.status.in_review": "Em análise",
  "adminDsar.status.resolved": "Resolvido",
  "adminDsar.status.rejected": "Recusado",
  "adminDsar.article.access": "Acesso (Art. 15.º)",
  "adminDsar.article.rectification": "Retificação (Art. 16.º)",
  "adminDsar.article.erasure": "Apagamento (Art. 17.º)",
  "adminDsar.article.objection": "Oposição (Art. 21.º)",
  "adminDsar.clock.overdue": "{days} dias fora do prazo",
  "adminDsar.clock.dueToday": "Termina hoje",
  "adminDsar.clock.urgent": "Faltam {days} dias",
  "adminDsar.clock.remaining": "Faltam {days} dias",
  "adminDsar.clock.closed": "Prazo parado",
  "adminDsar.row.openAriaLabel": "Abrir o pedido de dados {reference}",
  "adminDsar.row.filedBy": "Submetido por {name}",
  "adminDsar.row.dueBy": "Resposta devida até {date}",
  "adminDsar.unknownMember": "Um membro",
  "adminDsar.drawer.label": "Pedido de dados {reference}",
  "adminDsar.drawer.member": "Submetido por",
  "adminDsar.drawer.asked": "O que pediram",
  "adminDsar.drawer.scopes": "Dados indicados",
  "adminDsar.drawer.filed": "Submetido",
  "adminDsar.drawer.due": "Prazo legal",
  "adminDsar.drawer.answered": "Respondido",
  "adminDsar.drawer.context": "Submetido a partir de",
  "adminDsar.drawer.outcome": "Desfecho",
  "adminDsar.outcome.label": "Nota de desfecho",
  "adminDsar.outcome.placeholder": "O que foi feito sobre este pedido?",
  "adminDsar.outcome.notifyHint":
    "Fechar um pedido envia uma notificação QueerPulse ao membro. Não é enviado nenhum email.",
  "adminDsar.outcome.requiredHint":
    "Escreve uma nota de desfecho antes de fechar o pedido.",
  "adminDsar.outcome.closedHint":
    "Este pedido está fechado. O membro foi notificado no QueerPulse.",
  "adminDsar.action.startReview": "Iniciar análise",
  "adminDsar.action.resolve": "Resolver",
  "adminDsar.action.reject": "Recusar",
  "adminDsar.toast.in_review": "Passou para em análise.",
  "adminDsar.toast.resolved": "Pedido resolvido. O membro foi notificado.",
  "adminDsar.toast.rejected": "Pedido recusado. O membro foi notificado.",
  "adminDsar.toast.movedOn":
    "Este pedido já mudou de estado. Recarrega a fila para veres onde ficou.",
  "adminDsar.toast.error": "Não conseguimos atualizar esse pedido.",
  "adminDsar.empty": "Não há pedidos de dados neste filtro.",
  "adminDsar.error": "Não conseguimos carregar os pedidos de dados.",
  "adminDsar.loadMore": "Carregar mais",
  "adminDsar.loadingMore": "A carregar…",

  // ── Consola do diretório de tópicos (/admin/topics, SOC-01) ───────────────
  "topics.eyebrow": "Descoberta",
  "topics.title": "Diretório de <em>tópicos</em>",
  "topics.sub":
    "O grafo de interesses por trás de /topics, de cada página de tópico e dos resultados de tópicos na pesquisa. Arquivar retira um tópico e mantém as publicações e quem o segue.",
  "topics.newCta": "Novo tópico",
  "topics.empty":
    "Ainda não há tópicos. Cria o primeiro e fica já no diretório.",
  "topics.loadError": "Não foi possível carregar o diretório de tópicos.",
  "topics.postsCount_one": "{count} publicação",
  "topics.postsCount_other": "{count} publicações",
  "topics.followersCount_one": "{count} seguidor",
  "topics.followersCount_other": "{count} seguidores",
  "topics.crisisBadge": "Cartão de apoio em crise",
  "topics.archivedBadge": "Arquivado",
  "topics.archiveCta": "Arquivar",
  "topics.restoreCta": "Restaurar",
  "topics.archiveError":
    "Não foi possível alterar o estado de arquivo desse tópico.",
  "topics.deleteError": "Não foi possível eliminar esse tópico.",
  "topics.toast.created": "#{tag} está no diretório.",
  "topics.toast.updated": "#{tag} atualizado.",
  "topics.toast.archived":
    "#{tag} arquivado. As publicações e quem o segue ficam guardados.",
  "topics.toast.restored": "#{tag} voltou ao diretório.",
  "topics.toast.deleted": "#{tag} eliminado.",
  "topics.form.createTitle": "Novo tópico",
  "topics.form.createCta": "Criar tópico",
  "topics.form.saveError": "Não foi possível guardar esse tópico.",
  "topics.form.tagField": "Etiqueta",
  "topics.form.tagHint":
    "Letras minúsculas, números e hífenes. Passa a ser o endereço da página e o hashtag que os membros escrevem.",
  "topics.form.tagLockedHint":
    "A etiqueta não pode mudar: é o endereço da página, o hashtag já dentro das publicações e a chave onde cada seguidor está guardado. Arquiva este tópico e cria a nova etiqueta.",
  "topics.form.labelField": "Nome",
  "topics.form.labelHint":
    'O nome simples mostrado no diretório e na pesquisa, por exemplo "Saúde mental".',
  "topics.form.descriptionField": "Descrição",
  "topics.form.descriptionHint":
    "Uma ou duas frases sobre o que pertence aqui. Aparece no cartão do diretório e no topo da página do tópico.",
  "topics.form.crisisField": "Mostrar o cartão de apoio em crise",
  "topics.form.crisisHint":
    "Acrescenta o painel de apoio em crise à barra lateral deste tópico, para tópicos onde alguém pode chegar num momento difícil.",
  "topics.delete.title": "Eliminar #{tag}?",
  "topics.delete.body":
    "Isto destrói o tópico, {posts} publicações e {followers} seguidores. Arquivar retira-o do diretório na mesma e guarda tudo.",
  "topics.delete.confirmCta": "Eliminar tópico",

  // ── Consola de guias de recursos (CON-08 / CON-09) ──────────────────────
  "adminResourceGuides.title": "Guias de <em>recursos</em>",
  "adminResourceGuides.header.eyebrow": "Editorial",
  "adminResourceGuides.header.sub":
    "Todos os guias da plataforma, os mais desatualizados primeiro. Edite o texto aqui em vez de fazer um deploy, e marque a revisão quando tiver lido um de ponta a ponta.",
  "adminResourceGuides.sortLabel": "Ordenar guias",
  "adminResourceGuides.sort.reviewDue": "Revisão pendente",
  "adminResourceGuides.sort.title": "Título",
  "adminResourceGuides.sort.updated": "Atualizados recentemente",
  "adminResourceGuides.staleBanner":
    "{count} guias nunca foram revistos por ninguém.",
  "adminResourceGuides.empty":
    "Ainda não há guias. Assim que a migração de conteúdo correr, todos aparecem aqui.",
  "adminResourceGuides.viewPublicIndexCta": "Abrir o índice público de guias",
  "adminResourceGuides.loadError": "Não foi possível carregar os guias.",

  "adminResourceGuides.row.unpublished": "Não publicado",
  "adminResourceGuides.row.notManaged": "Página ainda no código",
  "adminResourceGuides.row.reviewed": "Revisto a {date}",
  "adminResourceGuides.row.reviewedBy": "Revisto a {date} por {reviewer}",
  "adminResourceGuides.row.neverReviewed": "Nunca revisto",
  "adminResourceGuides.row.overdue": "Em atraso desde {date}",
  "adminResourceGuides.row.reviewCta": "Marcar como revisto",
  "adminResourceGuides.row.editCta": "Editar",

  "adminResourceGuides.editor.title": "Editar guia",
  "adminResourceGuides.editor.saveCta": "Guardar alterações",
  "adminResourceGuides.editor.takeoverNotice":
    "Adicionar uma secção passa a controlar esta página: quem a ler vê o que escrever aqui em vez da página incorporada.",
  "adminResourceGuides.tab.details": "Detalhes",
  "adminResourceGuides.tab.prose": "Texto (EN)",
  "adminResourceGuides.tab.prosePt": "Texto (PT)",
  "adminResourceGuides.field.title": "Título",
  "adminResourceGuides.field.titlePt": "Título (português)",
  "adminResourceGuides.field.description": "Descrição",
  "adminResourceGuides.field.descriptionPt": "Descrição (português)",
  "adminResourceGuides.field.category": "Categoria",
  "adminResourceGuides.field.routePath": "Caminho da página",
  "adminResourceGuides.field.meta": "Etiqueta do cartão",

  "adminResourceGuides.sections.empty":
    "Ainda sem secções. A página deste guia continua no código da aplicação.",
  "adminResourceGuides.sections.headingLabel": "Título da secção",
  "adminResourceGuides.sections.anchorLabel": "Identificador de âncora",
  "adminResourceGuides.sections.kindLabel": "Tipo de bloco",
  "adminResourceGuides.sections.textLabel": "Texto do bloco",
  "adminResourceGuides.sections.addSectionCta": "Adicionar secção",
  "adminResourceGuides.sections.addBlockCta": "Adicionar bloco",
  "adminResourceGuides.sections.moveUp": "Mover secção para cima",
  "adminResourceGuides.sections.moveDown": "Mover secção para baixo",
  "adminResourceGuides.sections.removeSection": "Remover secção",
  "adminResourceGuides.sections.removeBlock": "Remover bloco",
  "adminResourceGuides.blockKind.paragraph": "Parágrafo",
  "adminResourceGuides.blockKind.subheading": "Subtítulo",
  "adminResourceGuides.blockKind.listItem": "Item de lista",
  "adminResourceGuides.blockKind.note": "Destaque",

  "adminResourceGuides.review.title": "Marcar este guia como revisto",
  "adminResourceGuides.review.body":
    "Confirme que leu este guia de ponta a ponta e que tudo continua correto: números de telefone, critérios de elegibilidade, horários de clínicas, referências legais.",
  "adminResourceGuides.review.reviewedByLabel": "Revisto por",
  "adminResourceGuides.review.reviewedByHint": "Uma pessoa ou uma equipa",
  "adminResourceGuides.review.reviewedOnLabel": "Revisto a",
  "adminResourceGuides.review.dueLabel": "Próxima revisão",
  "adminResourceGuides.review.confirmCta": "Marcar como revisto",

  // ── AdminHousingListingsPage — consola de revisão de habitação (LOC-01) ──
  "housingListings.title": "Revisão de <em>habitação.</em>",
  "housingListings.eyebrow": "Quadro de habitação",
  "housingListings.header.title": "Casas à espera de uma <em>decisão.</em>",
  "housingListings.header.sub":
    "Cada anúncio publicado por alguém espera aqui até uma pessoa o ler. Primeiro os de maior risco, com os sinais que os puseram lá.",
  "housingListings.keyHint":
    "J e K movem entre anúncios. A publica, C devolve para alterações, R recusa, D retira um que esteja no ar.",
  "housingListings.count_one": "{count} anúncio",
  "housingListings.count_other": "{count} anúncios",
  "housingListings.loadMore": "Mostrar mais",
  "housingListings.loadingMore": "A carregar…",
  "housingListings.tab.review": "À espera",
  "housingListings.tab.question": "Devolvidos",
  "housingListings.tab.live": "No ar",
  "housingListings.tab.rejected": "Recusados",
  "housingListings.tab.taken_down": "Retirados",
  "housingListings.tab.all": "Tudo",
  "housingListings.sort.label": "Ordenar",
  "housingListings.sort.risk": "Maior risco",
  "housingListings.sort.oldest": "À espera há mais tempo",
  "housingListings.sort.newest": "Mais recentes",
  "housingListings.empty.title": "Nada à espera aqui",
  "housingListings.empty.body":
    "Neste momento não há nenhum anúncio neste estado. Usa outro separador para rever o que já foi decidido.",
  "housingListings.error.title": "Não foi possível carregar a fila",
  "housingListings.error.body":
    "Algo correu mal do nosso lado. Verifica a ligação e tenta outra vez.",
  "housingListings.error.retry": "Tentar novamente",
  "housingListings.status.review": "À espera",
  "housingListings.status.question": "Devolvido",
  "housingListings.status.live": "No ar",
  "housingListings.status.rejected": "Recusado",
  "housingListings.status.takenDown": "Retirado",
  "housingListings.row.submitted": "Publicado {date}",
  "housingListings.row.rent": "{amount} por mês",
  "housingListings.row.bedrooms_one": "{count} quarto",
  "housingListings.row.bedrooms_other": "{count} quartos",
  "housingListings.row.billsIncluded": "Despesas incluídas",
  "housingListings.row.billsExcluded": "Despesas à parte",
  "housingListings.row.photoAlt": "Foto {position} de {title}",
  "housingListings.row.noPhotos": "Este anúncio não tem fotos",
  "housingListings.risk.band.high": "Risco alto",
  "housingListings.risk.band.medium": "Alguns sinais",
  "housingListings.risk.band.low": "Risco baixo",
  "housingListings.risk.scoreTitle":
    "Pontuação de risco em 100, calculada a partir dos sinais listados abaixo",
  "housingListings.risk.heading_one": "{count} sinal, a somar {score}",
  "housingListings.risk.heading_other": "{count} sinais, a somar {score}",
  "housingListings.risk.weight": "+{weight}",
  "housingListings.risk.noneRaised": "Não foi levantado nenhum sinal de risco",
  "housingListings.risk.rentFarBelowMarket":
    "A renda está muito abaixo do plausível para este tipo de casa, o isco clássico do pagamento adiantado",
  "housingListings.risk.rentBelowMarket":
    "A renda fica abaixo do limite inferior plausível para este tipo de casa",
  "housingListings.risk.contactInfoInText":
    "O anúncio traz um número de telefone, email, IBAN ou contacto de mensagens, levando a conversa para fora da plataforma",
  "housingListings.risk.offPlatformPayment":
    "O anúncio pede dinheiro antes de uma visita, ou por um meio que ninguém consegue rastrear",
  "housingListings.risk.discriminatoryLanguage":
    "A escrita condiciona a casa a identidades ou crenças em vez de descrever o espaço",
  "housingListings.risk.listerUnverified":
    "Quem anuncia só confirmou um endereço de email",
  "housingListings.risk.listerPhoneOnly":
    "Quem anuncia confirmou um telefone e nenhum documento de identidade",
  "housingListings.risk.incompleteListing":
    "A descrição é curta demais para dizer a alguém como é a casa",
  "housingListings.risk.noPhotos": "O anúncio não tem fotos",
  "housingListings.risk.missingAccessibilityInfo":
    "O anúncio não diz nada sobre como se entra e se circula",
  "housingListings.lister.erased":
    "Esta pessoa apagou a conta. Já não há ninguém a quem comunicar uma decisão.",
  "housingListings.lister.verification.none": "Nada confirmado",
  "housingListings.lister.verification.email": "Email confirmado",
  "housingListings.lister.verification.phone": "Telefone confirmado",
  "housingListings.lister.verification.id": "Identidade verificada",
  "housingListings.lister.memberSince": "Aqui desde {date}",
  "housingListings.lister.agent": "Agência",
  "housingListings.lister.history.total_one": "{count} anúncio no total",
  "housingListings.lister.history.total_other": "{count} anúncios no total",
  "housingListings.lister.history.live_one": "{count} no ar",
  "housingListings.lister.history.live_other": "{count} no ar",
  "housingListings.lister.history.changes_one": "{count} devolvido",
  "housingListings.lister.history.changes_other": "{count} devolvidos",
  "housingListings.lister.history.rejected_one": "{count} recusado",
  "housingListings.lister.history.rejected_other": "{count} recusados",
  "housingListings.lister.history.takenDown_one": "{count} retirado",
  "housingListings.lister.history.takenDown_other": "{count} retirados",
  "housingListings.details.open": "O anúncio tal como foi escrito",
  "housingListings.details.noDescription": "Não foi escrita nenhuma descrição.",
  "housingListings.details.access": "Como se entra e se circula",
  "housingListings.details.noAccess": "Nada indicado",
  "housingListings.details.available": "Disponível a partir de",
  "housingListings.details.availableNow": "Já",
  "housingListings.details.minStay": "Estadia mínima",
  "housingListings.details.minStayMonths_one": "{count} mês",
  "housingListings.details.minStayMonths_other": "{count} meses",
  "housingListings.details.minStayNone": "Sem mínimo",
  "housingListings.details.address": "Morada",
  "housingListings.details.noAddress": "Sem morada registada",
  "housingListings.details.tourLink": "Abrir a visita virtual",
  "housingListings.details.priorDecision": "Última decisão a {date}",
  "housingListings.details.priorDecisionNoReason": "Aprovado sem nota anexada.",
  "housingListings.details.decidedBy": "Decidido por {name}",
  "housingListings.decide.approve": "Publicar",
  "housingListings.decide.requestChanges": "Pedir alterações",
  "housingListings.decide.reject": "Recusar",
  "housingListings.decide.takeDown": "Retirar do quadro",
  "housingListings.decide.cancel": "Cancelar",
  "housingListings.decide.reasonEyebrow": "Revisão de habitação",
  "housingListings.decide.reasonTitle.request_changes":
    "O que precisa de mudar?",
  "housingListings.decide.reasonTitle.reject": "Porque estás a recusar isto?",
  "housingListings.decide.reasonTitle.take_down":
    "Porque estás a retirar isto?",
  "housingListings.decide.reasonLabel": "A tua razão",
  "housingListings.decide.reasonHint":
    "Quem anunciou lê isto palavra por palavra, nas notificações e na própria página de anúncios. Escreve para essa pessoa.",
  "housingListings.decide.reasonPlaceholder.request_changes":
    "ex.: Podes acrescentar uma foto da cozinha e dizer se a renda inclui a água? Assim que isso estiver, fica pronto.",
  "housingListings.decide.reasonPlaceholder.reject":
    "ex.: Este anúncio pede um depósito antes de uma visita, o que não permitimos aqui. És bem-vinde a publicar de novo sem isso.",
  "housingListings.decide.reasonPlaceholder.take_down":
    "ex.: Duas pessoas disseram-nos que esta casa já estava arrendada. Retirámos por agora, diz-nos se estiver errado.",
  "housingListings.toast.approve": "{title} está no quadro.",
  "housingListings.toast.request_changes":
    "{title} foi devolvido a quem o publicou.",
  "housingListings.toast.reject": "{title} foi recusado.",
  "housingListings.toast.take_down": "{title} foi retirado do quadro.",
  "housingListings.toast.error":
    "Não foi possível registar essa decisão. Verifica a ligação e tenta outra vez.",

  "adminResourceGuides.toast.saved": "{title} guardado.",
  "adminResourceGuides.toast.reviewed": "{title} marcado como revisto.",
  "adminResourceGuides.error.save": "Não foi possível guardar o guia.",
  "adminResourceGuides.error.review": "Não foi possível registar a revisão.",

  // ── Trust, safety and moderation (section 1 build) ──────────────────────
  // Community attribution on the report queue (TS-14).
  "moderation.community.all": "Todas as comunidades",
  "moderation.community.filterLabel": "Filtrar por comunidade",
  "moderation.community.rowFlag": "De {community}",

  // Clustered rows: one pile-on reads as one thing (TS-06).
  "moderation.cluster.clearAllCta_one": "Limpar {count}",
  "moderation.cluster.clearAllCta_other": "Limpar todas ({count})",
  "moderation.cluster.heading_one": "{count} denúncia aberta sobre {subject}",
  "moderation.cluster.heading_other":
    "{count} denúncias abertas sobre {subject}",
  "moderation.cluster.notOnPage_one":
    "Falta carregar mais {count} denúncia deste conjunto.",
  "moderation.cluster.notOnPage_other":
    "Faltam carregar mais {count} denúncias deste conjunto.",
  "moderation.cluster.overdue_one": "{count} fora do prazo",
  "moderation.cluster.overdue_other": "{count} fora do prazo",
  "moderation.cluster.reporters_one": "de 1 pessoa",
  "moderation.cluster.reporters_other": "de {count} pessoas diferentes",
  "moderation.cluster.selectAllCta_one": "Selecionar {count}",
  "moderation.cluster.selectAllCta_other": "Selecionar todas ({count})",
  "moderation.cluster.surge": "Onda",
  "moderation.cluster.surgeHint":
    "Várias pessoas denunciaram isto ao mesmo tempo. Lê como um só acontecimento antes de agir sobre uma denúncia isolada: uma perseguição em grupo e uma emergência real são iguais linha a linha.",

  // The overdue and surge filters that ride the queue (TS-06).
  "moderation.filters.overdue": "Fora do prazo",
  "moderation.filters.surge": "Ondas",

  // The reason-keyed library a decision note is prefilled from (TS-16).
  "moderation.templates.activeToggleLabel": "Ativa: {label}",
  "moderation.templates.anyAction": "Qualquer ação",
  "moderation.templates.anyReason": "Qualquer motivo",
  "moderation.templates.delete.body":
    "A resposta desaparece do seletor. As notas já enviadas aos membros não são afetadas: o que o moderador aprovou fica guardado na própria decisão. Desative-a se puder vir a precisar dela.",
  "moderation.templates.delete.confirmCta": "Eliminar resposta",
  "moderation.templates.delete.title": 'Eliminar "{label}"?',
  "moderation.templates.empty":
    "Ainda não há respostas guardadas. Adicione uma e aparece já no painel do relatório.",
  "moderation.templates.eyebrow": "Moderação",
  "moderation.templates.form.actionField": "Ação a que se adequa",
  "moderation.templates.form.bodyField": "O que o membro lê",
  "moderation.templates.form.bodyHint":
    "Pode usar {tokens}. São preenchidos antes de o moderador enviar a nota, e o moderador pode na mesma editar o resultado.",
  "moderation.templates.form.createCta": "Adicionar resposta",
  "moderation.templates.form.createTitle": "Nova resposta guardada",
  "moderation.templates.form.editTitle": "Editar resposta guardada",
  "moderation.templates.form.labelField": "Nome",
  "moderation.templates.form.labelHint":
    "Só os moderadores veem isto. Os membros nunca.",
  "moderation.templates.form.reasonField": "Motivo a que se destina",
  "moderation.templates.form.saveError":
    "Não foi possível guardar essa resposta",
  "moderation.templates.loadError":
    "Não foi possível carregar as respostas guardadas.",
  "moderation.templates.moveDownAriaLabel": "Mover {label} para baixo",
  "moderation.templates.moveUpAriaLabel": "Mover {label} para cima",
  "moderation.templates.navLabel": "Respostas guardadas",
  "moderation.templates.newCta": "Nova resposta",
  "moderation.templates.picker.anyCommunity": "a plataforma",
  "moderation.templates.picker.empty":
    "Ainda não há uma resposta guardada para este motivo e ação.",
  "moderation.templates.picker.hint":
    "Preenche a nota abaixo. Leia-a e edite-a antes de confirmar.",
  "moderation.templates.picker.loadError":
    "Não foi possível carregar as respostas guardadas.",
  "moderation.templates.picker.replaceBody":
    'Já escreveu uma nota. Usar "{label}" substitui-a.',
  "moderation.templates.picker.replaceCancelCta": "Manter a minha",
  "moderation.templates.picker.replaceConfirmCta": "Substituir",
  "moderation.templates.picker.replaceTitle": "Substituir o que escreveu?",
  "moderation.templates.picker.title": "Respostas guardadas",
  "moderation.templates.picker.undoAriaLabel": "Anular a nota preenchida",
  "moderation.templates.picker.undoCta": "Anular",
  "moderation.templates.picker.useAriaLabel":
    "Usar a resposta guardada {label}",
  "moderation.templates.removeError": "Não foi possível remover essa resposta",
  "moderation.templates.reorderError": "Não foi possível alterar a ordem",
  "moderation.templates.sub":
    "As mensagens que os moderadores podem preencher numa decisão. Cada nota continua a ser editada e aprovada antes de ser enviada.",
  "moderation.templates.title": "Respostas <em>guardadas</em>",
  "moderation.templates.toast.created": '"{label}" adicionada',
  "moderation.templates.toast.removed": '"{label}" removida',
  "moderation.templates.toast.updated": '"{label}" guardada',

  // Lifting a scoped restriction from the member drawer (TS-09).
  "members.restriction.confirm.body":
    "{name} recupera de imediato a possibilidade de publicar, comentar e enviar mensagens. É avisado de que a restrição terminou e lê exatamente o que escreveres abaixo.",
  "members.restriction.confirm.confirmCta": "Levantar restrição",
  "members.restriction.confirm.noteLabel": "O que {name} vai ler",
  "members.restriction.confirm.notePlaceholder":
    "Diz o que mudou, nas palavras que o membro vai ver.",
  "members.restriction.confirm.title": "Levantar a restrição de {name}?",
  "members.restriction.description":
    "Este membro está restrito: continua a poder ler, mas não pode publicar, comentar nem enviar mensagens. Levantar a restrição tem efeito imediato e explica-lhe porquê.",
  "members.restriction.descriptionUntil":
    "Este membro está restrito até {date}: continua a poder ler, mas não pode publicar, comentar nem enviar mensagens. Levantar a restrição tem efeito imediato e explica-lhe porquê.",
  "members.restriction.liftCta": "Levantar restrição",
  "members.restriction.liftedToast": "{name} já pode publicar.",
  "members.restriction.missingNoteToast":
    "Escreve o que o membro vai ler antes de levantar.",
  "members.restriction.sectionTitle": "Restrição",

  // The returning-account signal on invite review (TS-05).
  "invites.banEvasion.accountErased": "Essa conta foi entretanto apagada.",
  "invites.banEvasion.context.community": "Removida de {community} a {date}.",
  "invites.banEvasion.context.communityUnnamed":
    "Removida de uma comunidade a {date}.",
  "invites.banEvasion.context.platform": "Removida da QueerPulse a {date}.",
  "invites.banEvasion.note":
    "Isto é um sinal para verificar. Lê primeiro a conta removida e depois avalia esta candidatura pelos seus próprios méritos.",
  "invites.banEvasion.reasons.intakeContact":
    "Candidatou-se com o endereço com que uma conta removida se candidatou",
  "invites.banEvasion.reasons.inviterOfRemoved":
    "Convidada pelo membro que convidou uma conta removida",
  "invites.banEvasion.reasons.inviterRemoved":
    "Convidada por um membro que foi ele próprio removido",
  "invites.banEvasion.reasons.referenceOfRemoved":
    "Indica como referência alguém que abonou por uma conta removida",
  "invites.banEvasion.reasons.referenceRemoved":
    "Indica como referência alguém que foi ele próprio removido",
  "invites.banEvasion.reasons.signInIdentifier":
    "Inicia sessão com o identificador que uma conta removida usava",
  "invites.banEvasion.reasons.statedDetails":
    "Indica o mesmo nome que uma conta removida indicou",
  "invites.banEvasion.tier.high": "Confiança alta",
  "invites.banEvasion.tier.low": "Confiança baixa",
  "invites.banEvasion.tier.medium": "Confiança média",
  "invites.banEvasion.title": "Possível conta que regressa",
  "invites.banEvasion.viewAccount": "Ver a conta removida",

  // ── Fila de revisão de quartos de grupo (/admin/housing-group-listings) ────
  "groupListingQueue.title": "Quartos à <em>espera</em>",
  "groupListingQueue.eyebrow": "Habitação verificada",
  "groupListingQueue.header.title": "Quartos à espera de <em>ti</em>",
  "groupListingQueue.header.sub":
    "Todos os quartos publicados num grupo de habitação chegam aqui antes de alguém os ver. Publica, faz uma pergunta a quem publicou, ou diz claramente que não vai avançar.",
  "groupListingQueue.keyHint":
    "J e K movem-se entre quartos. P publica, Q envia uma pergunta, D recusa, R devolve um quarto recusado à fila.",

  "groupListingQueue.tab.review": "À espera",
  "groupListingQueue.tab.question": "Perguntado",
  "groupListingQueue.tab.live": "Publicado",
  "groupListingQueue.tab.declined": "Recusado",
  "groupListingQueue.tab.all": "Tudo",
  "groupListingQueue.groupFilter.label": "Grupo",
  "groupListingQueue.groupFilter.placeholder": "Filtrar pelo slug do grupo",

  "groupListingQueue.count_one": "{count} quarto",
  "groupListingQueue.count_other": "{count} quartos",
  "groupListingQueue.loadMore": "Ver mais",
  "groupListingQueue.loadingMore": "A carregar…",

  "groupListingQueue.empty.title": "Nada à espera",
  "groupListingQueue.empty.body":
    "Todos os quartos nesta vista já têm resposta. Vê outro separador para saber o que foi decidido.",
  "groupListingQueue.error.title": "A fila não carregou",
  "groupListingQueue.error.body":
    "Algo correu mal pelo caminho. Tenta outra vez daqui a pouco.",
  "groupListingQueue.error.retry": "Tentar outra vez",
  "groupListingQueue.forbidden.title":
    "Esta fila é para moderação de habitação",
  "groupListingQueue.forbidden.body":
    "Precisas do papel de moderação ou administração, ou da permissão de moderação de habitação, para rever quartos.",

  "groupListingQueue.status.review": "À espera",
  "groupListingQueue.status.question": "Pergunta enviada",
  "groupListingQueue.status.live": "Publicado",
  "groupListingQueue.status.declined": "Recusado",

  "groupListingQueue.row.hidden": "Escondido",
  "groupListingQueue.row.noGroup": "Sem grupo",
  "groupListingQueue.row.noPoster":
    "A conta que publicou este quarto já não existe, por isso ninguém será avisado da tua decisão.",
  "groupListingQueue.row.perMonth": "{amount} por mês",
  "groupListingQueue.row.submitted": "Publicado {age}",
  "groupListingQueue.row.waitingDays_one": "À espera há {count} dia",
  "groupListingQueue.row.waitingDays_other": "À espera há {count} dias",

  "groupListingQueue.prior.heading": "Já decidido",
  "groupListingQueue.prior.meta": "{date} por {moderator}",
  "groupListingQueue.prior.unknownStaff": "alguém da moderação",

  "groupListingQueue.risk.band.high": "Alto",
  "groupListingQueue.risk.band.medium": "Médio",
  "groupListingQueue.risk.band.low": "Baixo",
  "groupListingQueue.risk.scoreTitle":
    "Pontuação de sinais de alerta. Ordena esta fila e não decide nada.",
  "groupListingQueue.risk.listLabel": "Sinais por trás da pontuação",
  "groupListingQueue.risk.noneRaised": "Nada assinalado.",
  "groupListingQueue.risk.reason.rent_far_below_market":
    "Renda muito abaixo do mercado",
  "groupListingQueue.risk.reason.rent_below_market": "Renda abaixo do mercado",
  "groupListingQueue.risk.reason.contact_info_in_text":
    "Contactos no meio do texto",
  "groupListingQueue.risk.reason.off_platform_payment_language":
    "Pede pagamento fora da plataforma",
  "groupListingQueue.risk.reason.discriminatory_language":
    "Possível linguagem discriminatória",
  "groupListingQueue.risk.reason.lister_unverified":
    "Quem publicou não está verificado",
  "groupListingQueue.risk.reason.lister_phone_only":
    "Verificado apenas por telemóvel",
  "groupListingQueue.risk.reason.incomplete_listing": "Pouco detalhe",
  "groupListingQueue.risk.reason.no_photos": "Sem fotografias",
  "groupListingQueue.risk.reason.missing_accessibility_info":
    "Sem informação de acessibilidade",

  "groupListingQueue.decide.publish": "Publicar",
  "groupListingQueue.decide.question": "Perguntar",
  "groupListingQueue.decide.decline": "Recusar",
  "groupListingQueue.decide.reopen": "Devolver à fila",
  "groupListingQueue.decide.groupLabel": "Decisões para {title}",
  "groupListingQueue.decide.liveNote":
    "Este quarto está publicado. Para o retirar por quebrar as normas do grupo, usa Esconder na página dos grupos de habitação.",
  "groupListingQueue.decide.reasonEyebrow": "Quem publicou vai ler isto",
  "groupListingQueue.decide.reasonTitle.live":
    "Queres enviar alguma coisa com isto?",
  "groupListingQueue.decide.reasonTitle.question":
    "O que precisas de perguntar?",
  "groupListingQueue.decide.reasonTitle.declined":
    "Porque é que este quarto não avança?",
  "groupListingQueue.decide.reasonTitle.review":
    "Porque é que isto volta para a fila?",
  "groupListingQueue.decide.reasonLabel": "A tua mensagem",
  "groupListingQueue.decide.reasonPlaceholder.live":
    "Algo que queiras que quem publicou saiba.",
  "groupListingQueue.decide.reasonPlaceholder.question":
    "Podes dizer se as despesas estão incluídas?",
  "groupListingQueue.decide.reasonPlaceholder.declined":
    "Diz o que impediu isto de avançar, e o que mudaria a decisão.",
  "groupListingQueue.decide.reasonPlaceholder.review":
    "Diz porque é que isto volta para a fila.",
  "groupListingQueue.decide.reasonHint":
    "Isto chega a quem publicou palavra por palavra, na app e no telemóvel. Escreve para essa pessoa.",

  "groupListingQueue.toast.live": "{title} está no ar no grupo.",
  "groupListingQueue.toast.question":
    "A tua pergunta segue para quem publicou.",
  "groupListingQueue.toast.declined":
    "Quem publicou já foi avisado, com a tua razão.",
  "groupListingQueue.toast.review": "De volta à fila.",
  "groupListingQueue.toast.error":
    "Essa decisão não ficou guardada. Tenta outra vez.",

  // ── Consola do diretório de senhorios (/admin/landlords) ───────────────────
  "landlords.title": "Diretório de <em>senhorios</em>",
  "landlords.eyebrow": "Habitação",
  "landlords.header.title": "Senhorios que vale a pena <em>conhecer</em>",
  "landlords.header.sub":
    "As pessoas sugerem senhorios de quem já arrendaram, e pedem para serem apresentadas. As duas coisas estão à espera de uma resposta tua.",

  "landlords.pane.directory": "Diretório",
  "landlords.pane.introductions": "Apresentações",
  "landlords.filter.review": "À espera",
  "landlords.filter.live": "Publicado",
  "landlords.filter.all": "Tudo",
  "landlords.introFilter.pending": "À espera",
  "landlords.introFilter.accepted": "Aceite",
  "landlords.introFilter.declined": "Recusado",
  "landlords.introFilter.all": "Tudo",
  "landlords.search.label": "Procurar",
  "landlords.search.placeholder": "Procurar por nome",

  "landlords.count_one": "{count} registo",
  "landlords.count_other": "{count} registos",
  "landlords.loadMore": "Ver mais",
  "landlords.loadingMore": "A carregar…",

  "landlords.empty.title": "Nada à espera",
  "landlords.empty.body":
    "Nenhum registo nesta vista. Vê outro separador para saber o que foi decidido.",
  "landlords.error.title": "O diretório não carregou",
  "landlords.error.body":
    "Algo correu mal pelo caminho. Tenta outra vez daqui a pouco.",
  "landlords.error.retry": "Tentar outra vez",
  "landlords.forbidden.title": "Esta consola é para a moderação",
  "landlords.forbidden.body":
    "Precisas do papel de moderação ou administração para trabalhar estas filas.",

  "landlords.status.review": "À espera",
  "landlords.status.live": "Publicado",

  "landlords.row.noHood": "Bairro não indicado",
  "landlords.row.recommendations_one": "{count} recomendação",
  "landlords.row.recommendations_other": "{count} recomendações",
  "landlords.row.suggestedBy": "Sugerido por {name}",
  "landlords.row.staffAdded": "Adicionado pela equipa",
  "landlords.row.added": "Adicionado {age}",
  "landlords.row.waitingDays_one": "À espera há {count} dia",
  "landlords.row.waitingDays_other": "À espera há {count} dias",

  "landlords.action.publish": "Publicar",
  "landlords.action.holdBack": "Segurar",
  "landlords.action.remove": "Remover",

  "landlords.prior.heading": "Já decidido",
  "landlords.prior.meta": "{date} por {moderator}",
  "landlords.prior.unknownStaff": "alguém da moderação",

  "landlords.toast.published": "{name} está no diretório.",
  "landlords.toast.heldBack":
    "{name} voltou para revisão, e quem sugeriu já foi avisado.",
  "landlords.toast.removed": "{name} foi removido, com a tua razão.",
  "landlords.toast.error": "Essa decisão não ficou guardada. Tenta outra vez.",

  "landlords.reason.label": "A tua mensagem",
  "landlords.reason.labelOptional": "A tua mensagem (opcional)",
  "landlords.reason.hint":
    "Isto chega à pessoa palavra por palavra, na app e no telemóvel. Escreve para ela.",
  "landlords.reason.eyebrow.holdBack": "A pessoa vai ler isto",
  "landlords.reason.eyebrow.remove": "A pessoa vai ler isto",
  "landlords.reason.eyebrow.introAccept": "A pessoa vai ler isto",
  "landlords.reason.eyebrow.introDecline": "A pessoa vai ler isto",
  "landlords.reason.title.holdBack": "Porque é que isto volta para revisão?",
  "landlords.reason.title.remove": "Porque é que este registo sai?",
  "landlords.reason.title.introAccept": "O que acontece a seguir?",
  "landlords.reason.title.introDecline":
    "Porque é que esta apresentação não pode acontecer?",
  "landlords.reason.confirm.holdBack": "Segurar",
  "landlords.reason.confirm.remove": "Remover",
  "landlords.reason.confirm.introAccept": "Aceitar",
  "landlords.reason.confirm.introDecline": "Recusar",
  "landlords.reason.placeholder.holdBack":
    "Diz o que falta confirmar antes de isto entrar no diretório.",
  "landlords.reason.placeholder.remove": "Diz porque é que isto sai.",
  "landlords.reason.placeholder.introAccept":
    "Já passámos a tua nota. Deves ter notícias esta semana.",
  "landlords.reason.placeholder.introDecline":
    "Diz o que impediu, e o que essa pessoa pode tentar em alternativa.",

  "landlords.intro.status.pending": "À espera",
  "landlords.intro.status.accepted": "Aceite",
  "landlords.intro.status.declined": "Recusado",
  "landlords.intro.askedBy": "{name} pediu",
  "landlords.intro.askedByName": "Pedido por {name}",
  "landlords.intro.asked": "Pedido {age}",
  "landlords.intro.waitingDays_one": "À espera há {count} dia",
  "landlords.intro.waitingDays_other": "À espera há {count} dias",
  "landlords.intro.acceptCta": "Aceitar",
  "landlords.intro.declineCta": "Recusar",
  "landlords.intro.answered": "Respondido",
  "landlords.intro.count_one": "{count} pedido",
  "landlords.intro.count_other": "{count} pedidos",
  "landlords.intro.empty.title": "Ninguém à espera",
  "landlords.intro.empty.body":
    "Todas as apresentações nesta vista já têm resposta.",
  "landlords.intro.error.title": "Os pedidos não carregaram",
  "landlords.intro.error.body":
    "Algo correu mal pelo caminho. Tenta outra vez daqui a pouco.",
  "landlords.intro.reasonSubject":
    "{member} pediu para ser apresentado a {name}",
  "landlords.intro.toast.accepted":
    "A pessoa já sabe que vais fazer a apresentação a {name}.",
  "landlords.intro.toast.declined": "A pessoa já foi avisada, com a tua razão.",
  "landlords.intro.toast.error":
    "Essa resposta não ficou guardada. Tenta outra vez.",

  // ── ADIÇÕES ao grupo existente housingGroups.listings.* ────────────────────
  "housingGroups.listings.reviewQueueNote":
    "Esconder retira um anúncio já publicado. Se um quarto chega a ser publicado é decidido na fila de revisão.",
  "housingGroups.listings.reviewQueueCta": "Abrir a fila de revisão",

  // ── ADIÇÕES ao grupo existente adminReadingGroupProposals.* ────────────────
  "adminReadingGroupProposals.statusTab.pending": "À espera",
  "adminReadingGroupProposals.statusTab.approved": "Aprovado",
  "adminReadingGroupProposals.statusTab.declined": "Recusado",
  "adminReadingGroupProposals.statusTab.archived": "Arquivado",
  "adminReadingGroupProposals.statusTab.all": "Tudo",
  "adminReadingGroupProposals.filter.formatLabel": "Formato",
  "adminReadingGroupProposals.row.decided": "decidido {date}",
  "adminReadingGroupProposals.row.decisionNote": "O que lhe foi dito: {note}",
  "adminReadingGroupProposals.row.openCommunity":
    "Abrir a comunidade que isto criou",
  "adminReadingGroupProposals.decline.eyebrow": "Quem propôs vai ler isto",
  "adminReadingGroupProposals.decline.title":
    "Porque é que este grupo não avança?",
  "adminReadingGroupProposals.decline.label": "A tua mensagem",
  "adminReadingGroupProposals.decline.placeholder":
    "Diz o que impediu, e se um livro ou formato diferente funcionaria.",
  "adminReadingGroupProposals.decline.hint":
    "Isto chega à pessoa palavra por palavra, na app e no telemóvel. Escreve para ela.",

  // ── Appeals and ban ratification (section 1 build) ──────────────────────
  // Appeal deadlines and the awaiting/decided split (TS-11).
  "moderation.appeals.awaitingTab": "À espera ({count})",
  "moderation.appeals.decidedTab": "Decididos ({count})",
  "moderation.appeals.drawerDue": "A decisão é devida até {date}.",
  "moderation.appeals.drawerOverdue":
    "Este recurso era devido a {date}. A pessoa está à espera há mais tempo do que o Código de Conduta promete.",
  "moderation.appeals.dueFlag": "Até {date}",
  "moderation.appeals.noDecided": "Ainda não foi decidido nenhum recurso.",
  "moderation.appeals.noOverdue":
    "Todos os recursos estão dentro do prazo. É o trabalho todo feito a tempo.",
  "moderation.appeals.overdueFilter": "Fora do prazo ({count})",
  "moderation.appeals.overdueFlag": "Fora do prazo",
  "moderation.appeals.tabsAriaLabel": "Filtrar recursos",
  "moderation.appeals.windowNote":
    "O Código de Conduta promete que cada recurso é decidido no prazo de 7 dias, por alguém que não o moderador que tomou a decisão original.",

  // The second signature a permanent ban waits on (TS-12).
  "moderation.ratification.askedBy": "{name} pediu isto a {date}",
  "moderation.ratification.badge": "Expulsão permanente",
  "moderation.ratification.confirmCta": "Confirmar a expulsão",
  "moderation.ratification.confirmModal.askedByLabel": "O que {name} escreveu",
  "moderation.ratification.confirmModal.body":
    "Isto termina a conta de {name}. Todas as sessões são encerradas e a pessoa não pode voltar. O caminho de volta é um recurso, decidido por outro moderador.",
  "moderation.ratification.confirmModal.cta": "Confirmar a expulsão",
  "moderation.ratification.confirmModal.lapseNote":
    "Se ninguém confirmar, isto caduca a {date} e a conta volta.",
  "moderation.ratification.confirmModal.noteLabel": "A tua nota (opcional)",
  "moderation.ratification.confirmModal.notePlaceholder":
    "O que quiseres deixar registado sobre porque concordaste.",
  "moderation.ratification.confirmModal.title": "Expulsar a conta de {name}?",
  "moderation.ratification.confirmedToast": "{name} foi expulso.",
  "moderation.ratification.declineCta": "Recusar",
  "moderation.ratification.declineModal.body":
    "{name} volta de imediato. O moderador que pediu pode voltar a apresentar o caso com mais fundamento.",
  "moderation.ratification.declineModal.cta": "Recusar",
  "moderation.ratification.declineModal.notePlaceholder":
    "Diz porquê, para o moderador que pediu saber o que te faria mudar de ideias.",
  "moderation.ratification.declineModal.title": "Recusar a expulsão de {name}?",
  "moderation.ratification.declinedToast":
    "{name} está de volta. A expulsão foi recusada.",
  "moderation.ratification.empty":
    "Não há nada à espera de um segundo moderador.",
  "moderation.ratification.errorToast": "Isto não foi. Tenta de novo.",
  "moderation.ratification.interim":
    "Entretanto a conta está suspensa. Se ninguém confirmar, a suspensão termina sozinha e a conta volta.",
  "moderation.ratification.intro":
    "Uma expulsão permanente exige <em>dois</em> moderadores. Um pede, outro confirma. Nada aqui expulsou ninguém ainda, e o que ninguém confirmar caduca sozinho.",
  "moderation.ratification.lapsed": "Caducou",
  "moderation.ratification.lapsesAt": "Caduca a {date}",
  "moderation.ratification.noReason":
    "Não foi escrita nenhuma razão. Pergunta antes de confirmares.",
  "moderation.ratification.ownRequest":
    "Foste tu que pediste esta, por isso precisa dos olhos de outra pessoa.",
  "moderation.ratification.title": "Expulsar {name} da QueerPulse",

  // Remaining section 1 moderation keys.
  "moderation.tabs.ratification": "À espera de segunda opinião",
  "moderation.tabs.health": "Estado das filas",

  // ── TS-04. Carga de trabalho de moderação e estado dos prazos. ────────────
  // A regra de tom para tudo aqui: descreve o ESTADO DO TRABALHO e nunca o
  // desempenho de uma pessoa. Nada aqui conta o que alguém despachou, nem
  // ordena ninguém, nem sugere que uma fila acumulada é culpa de alguém. Esta
  // vista existe para apanhar uma equipa sobrecarregada antes do esgotamento, e
  // texto que soasse a pressão causaria aquilo que ela vem evitar.
  "moderationHealth.intro":
    "O que está à espera em cada fila, e como cada uma se lê face aos prazos que publicamos. Isto é sobre o tamanho do trabalho, para se poder repartir antes de pesar.",
  "moderationHealth.summaryAriaLabel": "Estado geral das filas",
  "moderationHealth.overallExplainer":
    "É a pior fila que o define, para nada se diluir numa média.",
  "moderationHealth.activeModerators_one":
    "{count} pessoa pode trabalhar estas filas",
  "moderationHealth.activeModerators_other":
    "{count} pessoas podem trabalhar estas filas",
  "moderationHealth.measuredAt": "Medido às {time}",
  "moderationHealth.loadError":
    "Não foi possível ler as filas agora. Tenta daqui a pouco.",

  // Três níveis e mais nenhum. `ok` é não haver nada a dizer, `warning` é
  // planear trabalhá-la, `critical` é um prazo publicado que já passou.
  "moderationHealth.severity.ok": "Em dia",
  "moderationHealth.severity.warning": "A encher",
  "moderationHealth.severity.critical": "Precisa de alguém agora",

  // Estes nomes são do cliente: a resposta traz só a chave estável da fila.
  "moderationHealth.queue.invite_requests": "Pedidos de convite",
  "moderationHealth.queue.reports": "Denúncias",
  "moderationHealth.queue.appeals": "Recursos",
  "moderationHealth.queue.verification": "Pedidos de verificação",
  "moderationHealth.queue.ban_ratifications":
    "Banimentos pendentes de segunda assinatura",
  "moderationHealth.queue.unknown": "Outra fila",
  // As outras vinte e duas filas que o registo de notificações de admin pode
  // nomear (ver ADMIN_QUEUE_KEYS em features/notifications/api/adminQueueRoutes).
  "moderationHealth.queue.dsar": "Pedidos de dados",
  "moderationHealth.queue.housing_listings": "Anúncios de habitação",
  "moderationHealth.queue.housing_group_listings":
    "Anúncios de habitação em grupo",
  "moderationHealth.queue.landlord_intro_requests":
    "Apresentações de senhorios",
  "moderationHealth.queue.landlord_suggestions": "Sugestões de senhorios",
  "moderationHealth.queue.concerns": "Preocupações de governação",
  "moderationHealth.queue.intakes": "Formulários",
  "moderationHealth.queue.legal_requests": "Exigências legais e do Estado",
  "moderationHealth.queue.housing_coop_join_requests":
    "Pedidos de adesão a cooperativas",
  "moderationHealth.queue.community_tag_requests": "Pedidos de etiquetas",
  "moderationHealth.queue.reading_group_proposals":
    "Propostas de grupos de leitura",
  "moderationHealth.queue.safe_space_nominations":
    "Nomeações de espaços seguros",
  "moderationHealth.queue.safe_space_flags": "Sinalizações de espaços seguros",
  "moderationHealth.queue.listing_submissions": "Espaços do diretório",
  "moderationHealth.queue.listing_claims": "Reivindicações de espaços",
  "moderationHealth.queue.listing_edit_suggestions":
    "Sugestões de edição de espaços",
  "moderationHealth.queue.resource_suggestions": "Sugestões de recursos",
  "moderationHealth.queue.magazine_submissions": "Propostas de histórias",
  "moderationHealth.queue.writer_applications": "Candidaturas a escritor",
  "moderationHealth.queue.commission_interests": "Interesse em encomendas",
  "moderationHealth.queue.partner_applications": "Candidaturas a parceiro",
  "moderationHealth.queue.changemaker_nominations":
    "Nomeações de agentes de mudança",
  "moderationHealth.queue.roadmap_ideas": "Ideias de membros",

  // Qual dos três eixos disparou, dito pelo que significa e não pelo nome do
  // campo.
  "moderationHealth.breachesLabel": "O que a fez disparar:",
  "moderationHealth.breach.depth": "está muita coisa à espera",
  "moderationHealth.breach.oldest": "há algo à espera há muito tempo",
  "moderationHealth.breach.overdue": "passaram prazos que publicámos",

  "moderationHealth.stat.depth": "À espera",
  "moderationHealth.stat.oldest": "Espera mais longa",
  // Um valor nulo aqui quer dizer que a fila está VAZIA, a melhor notícia.
  "moderationHealth.stat.oldestEmpty": "Nada à espera",
  "moderationHealth.stat.overdue": "Fora do prazo",
  "moderationHealth.stat.unassigned": "Por atribuir",
  // Um valor nulo quer dizer que esta fila não tem atribuição nenhuma. Um zero
  // leria-se como "está tudo atribuído", o contrário do que o nulo diz.
  "moderationHealth.stat.unassignedNotApplicable": "Não se aplica",
  "moderationHealth.stat.unassignedNoClaiming":
    "Esta fila não tem passo de atribuição",
  "moderationHealth.stat.perModerator": "Cada, se repartido",
  // Um valor nulo quer dizer que não há moderação ativa nenhuma.
  "moderationHealth.stat.noModerators": "Ninguém de serviço",
  "moderationHealth.stat.noModeratorsNote":
    "Sem contas ativas de moderação ou administração",
  "moderationHealth.stat.median": "Tempo habitual de resposta",

  // Lidos da resposta, nunca repetidos aqui: os limites mudam numa só edição
  // no servidor e esta linha muda com eles.
  "moderationHealth.threshold.warnsAt": "Assinala aos {value}",
  "moderationHealth.threshold.criticalAt": "Precisa de alguém aos {value}",
  "moderationHealth.threshold.pastCritical": "Já passou dos {value}",

  "moderationHealth.hours_one": "{value} hora",
  "moderationHealth.hours_other": "{value} horas",

  // A leitura compacta, mostrada só em alerta ou crítico.
  "moderationHealth.indicator.warning_one": "{count} fila está a encher.",
  "moderationHealth.indicator.warning_other": "{count} filas estão a encher.",
  "moderationHealth.indicator.critical_one":
    "{count} fila precisa de alguém agora.",
  "moderationHealth.indicator.critical_other":
    "{count} filas precisam de alguém agora.",
  "moderationHealth.indicator.cta": "Ver estado das filas",

  // A notificação para a equipa. `ok` é o aviso de recuperação, por isso fecha
  // o alerta em vez de abrir um. Nada aqui pede pressa a ninguém.
  "moderationHealth.notification.warning.text_one":
    "{queue}: {count} item à espera, {overdue}. Espera mais longa: {oldest}.",
  "moderationHealth.notification.warning.text_other":
    "{queue}: {count} itens à espera, {overdue}. Espera mais longa: {oldest}.",
  "moderationHealth.notification.warning.meta":
    "Vale uma vista de olhos quando alguém tiver tempo.",
  "moderationHealth.notification.critical.text_one":
    "{queue}: {count} item à espera, {overdue}. Espera mais longa: {oldest}.",
  "moderationHealth.notification.critical.text_other":
    "{queue}: {count} itens à espera, {overdue}. Espera mais longa: {oldest}.",
  "moderationHealth.notification.critical.meta":
    "Passou um prazo que publicámos. Se ninguém estiver livre, diz na sala da equipa.",
  "moderationHealth.notification.ok.text_one":
    "{queue} voltou ao normal, com {count} item à espera.",
  "moderationHealth.notification.ok.text_other":
    "{queue} voltou ao normal, com {count} itens à espera.",
  "moderationHealth.notification.ok.meta":
    "Nada a fazer. Obrigada por a teres despachado.",
  "moderationHealth.notification.overdueToken_one": "{value} fora do prazo",
  "moderationHealth.notification.overdueToken_other": "{value} fora do prazo",
  "moderationHealth.notification.oldestToken_one": "{value} hora",
  "moderationHealth.notification.oldestToken_other": "{value} horas",
  "moderationHealth.notification.oldestNone": "nada à espera",

  // O aviso de chegada para a equipa. Uma string para as vinte e seis filas:
  // a fila interpola como {queue} e a contagem segue o plural do CLDR. Junta-se
  // por fila, por isso {count} pode ser maior do que um. Nada aqui pede pressa
  // a ninguém, nem diz que algo foi enviado.
  "queueArrival.text_one":
    "{queue}: {count} item à espera de uma vista de olhos.",
  "queueArrival.text_other":
    "{queue}: {count} itens à espera de uma vista de olhos.",
  "queueArrival.meta": "Chegou algo a uma fila que trabalhas.",

  // ── Relatório de horas de voluntariado (SUS-05) ────────────────────────
  // Supervisão do voluntariado: sessões e horas confirmadas num período.
  // Só agregados. Não há aqui nenhum ranking por pessoa nem string para um.
  "volunteerHours.title": "Horas de <em>voluntariado</em>",
  "volunteerHours.header.eyebrow": "Relatórios",
  "volunteerHours.header.title": "Horas de <em>voluntariado</em>",
  "volunteerHours.header.sub":
    "Sessões de voluntariado confirmadas e as horas que somaram, para a equipa poder responder a um parceiro com um número.",
  "volunteerHours.periodLabel": "Período",
  "volunteerHours.period.days30": "Últimos 30 dias",
  "volunteerHours.period.days90": "Últimos 90 dias",
  "volunteerHours.period.months12": "Últimos 12 meses",
  "volunteerHours.period.all": "Desde sempre",
  "volunteerHours.headline.hours": "Horas contribuídas",
  "volunteerHours.headline.sessions": "Sessões confirmadas",
  "volunteerHours.headline.volunteers": "Pessoas que fizeram voluntariado",
  "volunteerHours.method":
    "Só contam as sessões que quem publicou confirmou como comparecidas. Uma falta registada fica de fora de todos os números aqui. Estes são totais da plataforma: esta página não guarda registo de quem fez mais voluntariado, e nunca guardará.",
  "volunteerHours.empty":
    "Ainda não foi confirmado nada neste período. As horas aparecem aqui assim que quem publicou confirmar que alguém apareceu.",
  "volunteerHours.error":
    "Não foi possível carregar estes números. Tenta outra vez daqui a pouco.",
  "volunteerHours.sessionsHeader": "Sessões",
  "volunteerHours.hoursHeader": "Horas",
  "volunteerHours.capped":
    "Esta lista mostra as {limit} linhas principais. Os totais acima cobrem tudo o que existe no período.",
  "volunteerHours.byOpportunity.caption": "Por oportunidade",
  "volunteerHours.byOpportunity.roleHeader": "Função",
  "volunteerHours.byOpportunity.empty":
    "Nenhuma oportunidade tem horas confirmadas neste período.",
  "volunteerHours.byCommunity.caption": "Por comunidade",
  "volunteerHours.byCommunity.communityHeader": "Comunidade",
  "volunteerHours.byCommunity.empty":
    "Nenhuma comunidade tem horas confirmadas neste período. As oportunidades publicadas sem comunidade continuam a contar nos totais acima.",
  "volunteerHours.byCommunity.unresolved": "Comunidade já não consta",

  // Fila de candidaturas de parceria, agora que o filtro do OPS-04 a pode
  // deixar vazia (tarefa B).
  "partners.emptyFiltered":
    "Nada corresponde a este filtro. Volta a Tudo para veres a fila inteira.",

  // ── Recuperação de conta: as três alavancas que impedem que um acidente
  // deixe alguém de fora para sempre (PRD-06/11/13). Aparecem na gaveta do
  // membro só quando há algo a recuperar, mais a ferramenta da lista de
  // supressão no cabeçalho da página, que não pertence a nenhum membro porque
  // a conta que protegia foi apagada.
  //
  // As frases de `blockedReason` não estão aqui. É o servidor que as escreve,
  // porque é o único sítio que sabe qual das recusas se aplica, e uma cópia
  // traduzida seria um segundo conjunto de salvaguardas livre de divergir das
  // que são realmente aplicadas.
  "recovery.sectionTitle": "Recuperação de conta",
  "recovery.sectionHint":
    "Reparações para membros que não conseguem voltar a entrar sozinhos. Tudo o que fizeres aqui fica registado em teu nome.",
  "recovery.loadError":
    "Não foi possível carregar o estado de recuperação deste membro. Recarrega antes de assumires que não há nada aqui.",
  "recovery.reasonLabel": "Porque estás a fazer isto?",
  "recovery.reasonHint":
    "Fica no registo permanente de auditoria. Escreve o que um colega precisaria de saber daqui a um ano.",
  "recovery.missingReasonToast": "Escreve um motivo antes de confirmar.",

  "recovery.reactivate.label": "Desativação sem registo",
  "recovery.reactivate.body":
    "Esta conta está desativada sem qualquer registo de alguém o ter pedido, por isso iniciar sessão não a traz de volta sozinho.",
  "recovery.reactivate.cta": "Reativar conta",
  "recovery.reactivate.blockedFallback":
    "A reativação não está disponível para este membro.",
  "recovery.reactivate.confirmTitle": "Reativar {name}?",
  "recovery.reactivate.confirmBody":
    "{name} volta a ficar ativo e reaparece na plataforma. Não restaura mais nada: nenhuma sanção é levantada e nenhuma eliminação é cancelada.",
  "recovery.reactivate.confirmCta": "Reativar",
  "recovery.reactivate.reasonPlaceholder":
    "ex.: pedido de apoio 412: desativado sem linha no registo depois da migração de junho",
  "recovery.reactivate.doneToast": "{name} está ativo outra vez.",

  "recovery.relink.label": "Identidade de início de sessão",
  "recovery.relink.body":
    "Uma conta Google com o endereço verificado deste membro foi recusada ao iniciar sessão. Isso acontece quando a conta Google é recriada, o que gera uma identidade nova para o mesmo endereço.",
  "recovery.relink.blockedFallback":
    "A religação não está disponível para este membro.",
  "recovery.relink.candidateLabel": "Identidade Google terminada em {tail}",
  "recovery.relink.candidateMeta":
    "{attempts} tentativas, a primeira a {first}, a mais recente a {last}",
  "recovery.relink.status.pending": "À espera",
  "recovery.relink.status.applied": "Ligada",
  "recovery.relink.status.dismissed": "Recusada",
  "recovery.relink.status.superseded": "Retirada",
  "recovery.relink.applyCta": "Religar",
  "recovery.relink.dismissCta": "Recusar",
  "recovery.relink.relinkConfirmTitle":
    "Entregar a conta de {name} a esta identidade?",
  "recovery.relink.relinkConfirmBody":
    "A partir de agora, quem tiver a conta Google terminada em {tail} inicia sessão como {name}. Todas as sessões que {name} tem neste momento terminam de imediato. Só faz isto quando tiveres a certeza de que essa conta é mesmo dele.",
  "recovery.relink.relinkConfirmCta": "Religar início de sessão",
  "recovery.relink.relinkReasonPlaceholder":
    "ex.: pedido de apoio 987: confirmado por videochamada que a conta Google de trabalho foi recriada",
  "recovery.relink.relinkDoneToast":
    "{name} já pode iniciar sessão com a conta Google nova. As sessões antigas foram terminadas.",
  "recovery.relink.dismissConfirmTitle": "Recusar esta identidade?",
  "recovery.relink.dismissConfirmBody":
    "A conta Google terminada em {tail} deixa de ser oferecida como forma de voltar à conta de {name}. Fica registada, e voltar a tentar não a devolve à fila.",
  "recovery.relink.dismissConfirmCta": "Recusar identidade",
  "recovery.relink.dismissReasonPlaceholder":
    "ex.: o membro confirmou que esta conta não é dele",
  "recovery.relink.dismissDoneToast":
    "Essa identidade não será oferecida outra vez.",

  "recovery.suppression.openCta": "Lista de supressão",
  "recovery.suppression.title": "Lista de supressão de eliminações",
  "recovery.suppression.body":
    "Quando alguém apaga a conta, o endereço entra numa lista permanente para que iniciar sessão outra vez não a recrie em silêncio. Procura aqui um endereço e levanta-o quando a pessoa mudou de ideias ou a eliminação foi um engano.",
  "recovery.suppression.emailLabel": "Endereço de email",
  "recovery.suppression.emailPlaceholder":
    "o endereço que a pessoa está a tentar usar",
  "recovery.suppression.lookupCta": "Verificar endereço",
  "recovery.suppression.missingEmailToast":
    "Escreve um endereço para verificar.",
  "recovery.suppression.notSuppressed":
    "{email} não está na lista de supressão. O que os está a bloquear é outra coisa.",
  "recovery.suppression.found":
    "{email} foi suprimido a {date}. Entrada {hash}.",
  "recovery.suppression.liftWarning":
    "Levantar não restaura nada. A conta apagada e tudo o que tinha desapareceram de vez. Isto só deixa de recusar uma conta nova neste endereço.",
  "recovery.suppression.reasonPlaceholder":
    "ex.: pedido de apoio 233: pediu para voltar e recomeçar",
  "recovery.suppression.liftCta": "Levantar supressão",
  "recovery.suppression.liftedToast": "Supressão levantada.",
  "recovery.suppression.liftedBody":
    "Levantada. Esse endereço já pode criar uma conta nova. Nada da antiga volta.",

  // ── PRD-32: registo de exigências legais e do Estado ──────────────────────
  "legalRequests.navLabel": "Pedidos legais",
  "legalRequests.title": "Exigências <em>legais e do Estado</em>",
  "legalRequests.eyebrow": "Registo de transparência",
  "legalRequests.headerSub":
    "Todas as exigências de dados de membros vindas de um tribunal, de uma força policial, de um ministério ou de qualquer outro braço do Estado. O relatório público de transparência conta estas linhas e não publica nenhum dos seus campos.",
  "legalRequests.recordCta": "Registar uma exigência",
  "legalRequests.demoNotice":
    "O modo de demonstração mostra linhas de exemplo. Nada aqui foi registado e nada é enviado.",
  "legalRequests.countLine":
    "Registos que correspondem a estes filtros: {count}.",
  "legalRequests.empty":
    "Nenhum registo corresponde a estes filtros. Alarga-os para ver o resto do registo.",
  "legalRequests.loadError":
    "Não conseguimos ler o registo. Tenta outra vez antes de tratares isto como um registo vazio.",
  "legalRequests.forbidden":
    "A tua conta não pode ler este registo. Está aberto apenas a administração.",
  "legalRequests.loadMore": "Carregar mais",
  "legalRequests.loadingMore": "A carregar…",
  "legalRequests.voidedChip": "Anulado",
  "legalRequests.gagOrderChip": "Ordem de silêncio",
  "legalRequests.row.openAriaLabel":
    "Abrir a exigência de {body}, recebida a {date}",
  "legalRequests.row.meta": "{jurisdiction}, recebida a {date}",
  "legalRequests.row.accounts":
    "{affected} contas nomeadas, {notified} avisadas",
  "legalRequests.type.subpoena": "Intimação",
  "legalRequests.type.court_order": "Ordem judicial",
  "legalRequests.type.police_request": "Pedido policial",
  "legalRequests.type.emergency_disclosure_request":
    "Exigência de divulgação de emergência",
  "legalRequests.type.preservation_request": "Pedido de preservação",
  "legalRequests.type.takedown_demand": "Exigência de remoção",
  "legalRequests.type.other": "Outro",
  "legalRequests.outcome.complied_in_full": "Cumprida na íntegra",
  "legalRequests.outcome.complied_in_part": "Cumprida em parte",
  "legalRequests.outcome.narrowed": "Reduzida e depois cumprida",
  "legalRequests.outcome.refused": "Recusada",
  "legalRequests.outcome.withdrawn": "Retirada",
  "legalRequests.outcome.pending": "Pendente",
  "legalRequests.dataCategory.account_identifiers": "Identificadores de conta",
  "legalRequests.dataCategory.contact_details": "Dados de contacto",
  "legalRequests.dataCategory.account_metadata": "Metadados da conta",
  "legalRequests.dataCategory.connection_logs": "Registos de ligação",
  "legalRequests.dataCategory.profile_content": "Conteúdo do perfil",
  "legalRequests.dataCategory.posts_and_comments": "Publicações e comentários",
  "legalRequests.dataCategory.private_messages": "Mensagens privadas",
  "legalRequests.dataCategory.uploaded_media": "Ficheiros carregados",
  "legalRequests.dataCategory.membership_records": "Registos de adesão",
  "legalRequests.dataCategory.other": "Outro",
  "legalRequests.filter.stateLabel": "Registos",
  "legalRequests.filter.state.all": "Todos os registos",
  "legalRequests.filter.state.active": "Em vigor",
  "legalRequests.filter.state.voided": "Anulados",
  "legalRequests.filter.typeLabel": "Tipo de exigência",
  "legalRequests.filter.anyType": "Qualquer tipo",
  "legalRequests.filter.outcomeLabel": "Desfecho",
  "legalRequests.filter.anyOutcome": "Qualquer desfecho",
  "legalRequests.field.requestingBody": "Quem exigiu",
  "legalRequests.field.requestingBodyHint":
    "O organismo que fez a exigência, com o nome que usa no próprio documento.",
  "legalRequests.field.jurisdiction": "Jurisdição",
  "legalRequests.field.requestType": "Tipo de exigência",
  "legalRequests.field.receivedOn": "Recebida a",
  "legalRequests.field.accountsAffected": "Contas nomeadas",
  "legalRequests.field.accountsAffectedHint":
    "Quantas contas de membros a exigência abrangia, seja o que for que tenha sido entregue no fim.",
  "legalRequests.field.outcome": "Desfecho",
  "legalRequests.field.outcomeHint":
    "Deixa pendente se a exigência chegou hoje. Volta e completa quando a equipa tiver respondido.",
  "legalRequests.field.dataDisclosed": "O que foi entregue",
  "legalRequests.field.dataDisclosedHint":
    "Não marques nada quando nada saiu da plataforma. Estas categorias são só para a equipa, em qualquer nível de agregação.",
  "legalRequests.field.memberNotifiedOn": "Membros avisados a",
  "legalRequests.field.memberNotifiedOnHint":
    "O dia em que os membros nomeados foram avisados. Isto regista o que a equipa fez: a QueerPulse não envia nada a partir deste ecrã.",
  "legalRequests.field.accountsNotified": "Contas avisadas",
  "legalRequests.field.accountsNotifiedHint":
    "Quantas das contas nomeadas foram avisadas. Nunca pode ser mais do que o número de contas nomeadas.",
  "legalRequests.field.withheldReason": "Porque não foram avisados",
  "legalRequests.field.withheldReasonHint":
    "Opcional enquanto não houver ninguém a avisar.",
  "legalRequests.field.withheldReasonRequired":
    "Porque não foram avisados (obrigatório)",
  "legalRequests.field.withheldReasonRequiredHint":
    "Saíram dados da plataforma e ninguém foi avisado, por isso a razão tem de ficar em ficha. Um espaço em branco aqui é recusado.",
  "legalRequests.field.gagOrder": "Sob ordem de silêncio",
  "legalRequests.field.gagOrderHint":
    "Ligado quando o documento proíbe avisar os membros que nomeia.",
  "legalRequests.field.internalNote": "Nota interna",
  "legalRequests.field.internalNoteHint":
    "Só para a equipa, em qualquer nível de agregação. Não chega a nenhum membro nem a nenhum número publicado.",
  "legalRequests.form.drawerLabel": "Editor de exigências legais",
  "legalRequests.form.createEyebrow": "Novo registo",
  "legalRequests.form.createTitle": "Registar uma exigência",
  "legalRequests.form.editEyebrow": "Alterar",
  "legalRequests.form.editTitle": "Alterar este registo",
  "legalRequests.action.cancel": "Cancelar",
  "legalRequests.action.record": "Registar",
  "legalRequests.action.save": "Guardar alterações",
  "legalRequests.action.amend": "Alterar",
  "legalRequests.action.void": "Anular este registo",
  "legalRequests.problem.requestingBodyRequired":
    "Nomeia o organismo que fez a exigência.",
  "legalRequests.problem.jurisdictionRequired": "Nomeia a jurisdição.",
  "legalRequests.problem.receivedOnRequired":
    "Indica o dia em que a exigência chegou.",
  "legalRequests.problem.accountsAffectedInvalid":
    "Contas nomeadas tem de ser um número inteiro, até 100000.",
  "legalRequests.problem.accountsNotifiedInvalid":
    "Contas avisadas tem de ser um número inteiro, até 100000.",
  "legalRequests.problem.notifiedExceedsAffected":
    "Foram avisadas mais contas do que as que a exigência nomeou. Só uma conta nomeada pode ser avisada.",
  "legalRequests.problem.notifiedCountNeedsDate":
    "Indica o dia em que os membros foram avisados, ou volta a pôr a contagem a zero.",
  "legalRequests.problem.notifiedDateNeedsCount":
    "Indica quantas contas foram avisadas nesse dia, ou limpa a data.",
  "legalRequests.problem.withheldReasonRequired":
    "Foram entregues dados e ninguém foi avisado. Diz porquê.",
  "legalRequests.detail.drawerLabel": "Exigência registada",
  "legalRequests.detail.eyebrow": "Registo",
  "legalRequests.detail.untitled": "A carregar este registo",
  "legalRequests.detail.loadError":
    "Não conseguimos ler este registo. Lê-o outra vez antes de agires sobre ele.",
  "legalRequests.detail.voidedOn": "Retirado dos números publicados a {date}.",
  "legalRequests.detail.noVoidReason": "Não ficou nenhuma razão guardada.",
  "legalRequests.detail.nothingDisclosed": "Não foi entregue nada.",
  "legalRequests.detail.nobodyNotified": "Ainda não foi avisado ninguém.",
  "legalRequests.detail.noWithheldReason": "Nada em ficha.",
  "legalRequests.detail.gagOrderYes":
    "Sim. O documento proíbe avisar os membros que nomeia.",
  "legalRequests.detail.gagOrderNo": "Não.",
  "legalRequests.detail.noInternalNote": "Sem nota.",
  "legalRequests.detail.recordedBy": "Registado por",
  "legalRequests.detail.recorderErased": "Essa conta foi entretanto apagada.",
  "legalRequests.detail.lastUpdated": "Última alteração",
  "legalRequests.void.eyebrow": "Retirar um registo",
  "legalRequests.void.title": "Anular este registo",
  "legalRequests.void.warning":
    "Isto não pode ser desfeito. A linha fica no registo e continua legível, todos os números publicados deixam de a contar, e a contagem de registos anulados é ela própria publicada.",
  "legalRequests.void.body":
    "A exigência de {body} sai dos números publicados assim que fizeres isto.",
  "legalRequests.void.reasonLabel": "Porque está a ser anulado",
  "legalRequests.void.reasonPlaceholder":
    "ex.: introduzido duas vezes, e o registo que fica é o de 11 de maio",
  "legalRequests.void.reasonHint":
    "Obrigatório. Um registo que não consegue dizer porque é que uma linha saiu dos números vale menos do que um que nunca a deixasse sair.",
  "legalRequests.toast.created": "Registado.",
  "legalRequests.toast.updated": "Registo alterado.",
  "legalRequests.toast.voided":
    "Registo anulado. Continua no registo, fora dos números publicados.",
  "legalRequests.error.save": "Não conseguimos guardar esse registo.",
  "legalRequests.error.voidedConflict":
    "Este registo foi anulado, e um registo anulado fica congelado.",
  "legalRequests.error.void": "Não conseguimos anular esse registo.",
  "legalRequests.error.alreadyVoided": "Alguém já anulou este registo.",

  // ── PRD-31: fila de escalamentos de evasão a banimentos ───────────────────
  "banEvasionEscalations.navLabel": "Escalamentos de evasão",
  "banEvasionEscalations.title": "Escalamentos de <em>evasão a banimentos</em>",
  "banEvasionEscalations.eyebrow": "Fila da equipa",
  "banEvasionEscalations.headerSub":
    "Quem modera uma comunidade sabe uma coisa sobre quem se candidata: se corresponde a alguém que essa comunidade barrou. Escalar é a forma de pedir o resto do quadro, e é aqui que ele é lido.",
  "banEvasionEscalations.demoNotice":
    "O modo de demonstração mostra escalamentos de exemplo. Nada aqui é uma candidatura real, e resolver um não envia nada.",
  "banEvasionEscalations.status.open": "Abertos",
  "banEvasionEscalations.status.resolved": "Resolvidos",
  "banEvasionEscalations.emptyOpen":
    "Não há nenhum escalamento à espera. Todas as perguntas levantadas por moderação de comunidade estão fechadas.",
  "banEvasionEscalations.emptyResolved":
    "Ainda não foi fechado nenhum escalamento.",
  "banEvasionEscalations.loadError":
    "Não conseguimos ler a fila. Pode haver alguém à espera, por isso lê outra vez antes de tratares isto como resolvido.",
  "banEvasionEscalations.forbidden":
    "A tua conta não pode ler esta fila. Está aberta a moderação e administração.",
  "banEvasionEscalations.subjectErased": "Quem se candidatou apagou a conta",
  "banEvasionEscalations.moderatorErased":
    "alguém da moderação que entretanto apagou a conta",
  "banEvasionEscalations.resolverErased":
    "uma colega que entretanto apagou a conta",
  "banEvasionEscalations.raisedBy": "Levantado por {name} a {date}",
  "banEvasionEscalations.moderatorNote": "O que a moderação escreveu",
  "banEvasionEscalations.assessmentNote":
    "Isto é um sinal para ler, e o juízo é teu. Nada na plataforma age sobre ele, e nada disto volta para a comunidade que perguntou.",
  "banEvasionEscalations.assessmentClear":
    "Verificado em todas as comunidades e na lista de banimentos da plataforma. Nada correspondeu a uma conta removida.",
  "banEvasionEscalations.assessmentUnavailable":
    "A conta de quem se candidatou foi apagada, por isso já não há nada para cruzar. Não é possível fazer nenhuma avaliação.",
  "banEvasionEscalations.outcomeTerm": "O que a equipa encontrou",
  "banEvasionEscalations.resolvedBy": "Fechado por {name} a {date}",
  "banEvasionEscalations.resolvedUnknownDate": "Fechado por {name}",
  "banEvasionEscalations.noResolutionNote": "Ninguém escreveu nenhuma nota.",
  "banEvasionEscalations.action.resolve": "Resolver",
  "banEvasionEscalations.action.cancel": "Cancelar",
  "banEvasionEscalations.resolve.eyebrow": "Fechar a pergunta",
  "banEvasionEscalations.resolve.title": "Resolver este escalamento",
  "banEvasionEscalations.resolve.body":
    "Isto regista que olhaste, e permite que {community} volte a perguntar se a pessoa aparecer outra vez. Não bane ninguém: o que decidires fazer acontece nas superfícies que já existem para isso.",
  "banEvasionEscalations.resolve.noteLabel": "Nota (opcional)",
  "banEvasionEscalations.resolve.notePlaceholder":
    "O que verificaste e o que encontraste",
  "banEvasionEscalations.resolve.noteHint":
    "Só para a equipa. Quem escalou fica a saber que alguém fechou a pergunta, e nada sobre o que encontraste.",
  "banEvasionEscalations.toast.resolved": "Escalamento resolvido.",
  "banEvasionEscalations.error.resolve":
    "Não conseguimos resolver esse escalamento.",
  "banEvasionEscalations.error.alreadyResolved":
    "Alguém já resolveu este escalamento.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PHOTO-EVIDENCE — PHOTO-EVIDENCE. The reported gathering photo inside the moderation report drawer (AdminReportPhotoEvidence.tsx). Rendered only for an event_photo report. imageAlt is the image's accessible name and deliberately says what the image IS rather than what is in it: a moderator's screen reader is often audible to whoever is nearby, and describing the person in a photo that may be outing them is the exact harm being judged. unavailable is the honest state for a photo the uploader deleted after filing; the report stays actionable, so the wording never implies the case is over.
  // PRD-47d — PRD-47d - OVERWRITES two existing keys; adds none. `ambiguous_authors` now answers two subject types: `listing_public_question` (a question and the answer under it) and `review` (a review and the reviewed party's public reply under it, on a directory listing, an employer or a home). Today's copy names a question and a listing, so a moderator refused on an employer-review or housing-review report reads a sentence about a surface they are not looking at. Two further corrections on top of the generalisation. (1) The drawer note said restrict and ban "won't go through here"; the backend only sets `is_author_ambiguous` when a second half actually EXISTS, and nothing on the wire tells the drawer whether it does, so the old sentence was already false on an unanswered question and would be false on most reviews. It now says they CAN be refused. The refusal string keeps its absolute phrasing, because it only ever renders when the flag really fired. (2) It names "whoever posted first" rather than "whoever asked", which is true of a reviewer as well as an asker, and points at "the page it was posted on" rather than "the listing", which is true of a home and an employer as well. This block supersedes the identical pair in PRD-47c.json (see the note in PRD-47D-LANDLORD-TAKEDOWN.md): that manifest is missing `overwrite`, so the merge would have skipped it, and its Portuguese is unaccented where the live catalogue is accented.
  "moderation.reportDrawer.photoEvidence.title": "Fotografia denunciada",
  "moderation.reportDrawer.photoEvidence.imageAlt":
    "A fotografia a que esta denuncia diz respeito, tal como estava no momento em que foi apresentada.",
  "moderation.reportDrawer.photoEvidence.unavailable":
    "Esta fotografia ja nao esta disponivel. Foi retirada depois de a denuncia ter sido apresentada, por isso estas a decidir com base nos detalhes abaixo e nao na imagem. O facto de a fotografia ter desaparecido nao encerra a denuncia.",
  "moderation.reportDrawer.photoEvidence.captionLabel":
    "Legenda escrita por quem publicou",
  "moderation.reportDrawer.photoEvidence.uploadedAt":
    "Publicada no album a {date}",
  "moderation.reportDrawer.photoEvidence.fullSizeCta": "Abrir em tamanho real",
};
