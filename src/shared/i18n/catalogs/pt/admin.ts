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
  "verifications.loadError": "Não foi possível carregar as verificações",
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
  "verifications.requests.bulk.toast.success_one":
    "{count} pedido atualizado.",
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
  "common.back": "Voltar",
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

  "dashboard.metrics.activeMembers.label": "Pessoas ativas",
  "dashboard.metrics.openReports.label": "Denúncias em aberto",
  "dashboard.metrics.medianResponse.label": "Resposta mediana",
  "dashboard.metrics.sustainerMrr.label": "MRR de apoiantes",
  "dashboard.metrics.trendPercent": "{value}%",
  "dashboard.metrics.trendOldest": "mais antiga: {hours}",
  "dashboard.metrics.trendWellUnder": "bem abaixo",
  "dashboard.metrics.trendOverSla": "acima do alvo",
  "dashboard.metrics.trendNoData": "ainda sem dados suficientes",
  "dashboard.metrics.trendTracked": "acompanhado em tempo real",
  "dashboard.metrics.footGrowth": "+{count} este mês",
  "dashboard.metrics.footEmergencies_one": "{count} é uma emergência",
  "dashboard.metrics.footEmergencies_other": "{count} são emergências",
  "dashboard.metrics.footSlaTarget": "meta de SLA: {hours}",
  "dashboard.metrics.footSustainers_one": "{count} apoiante",
  "dashboard.metrics.footSustainers_other": "{count} apoiantes",

  "dashboard.triage.title": "Precisa de <em>uma pessoa</em>",
  "dashboard.triage.sortedToast": "Ordenado por urgência",
  "dashboard.triage.safetyEmergencies.title": "Emergências de segurança",
  "dashboard.triage.safetyEmergencies.sub": "Outing e doxxing",
  "dashboard.triage.safetyEmergencies.subEm": "trata destas primeiro",
  "dashboard.triage.openReports.title": "Denúncias em aberto",
  "dashboard.triage.openReports.sub": "Assédio, spam, abuso de votos de confiança",
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
  "dashboard.feed.type.reportResolved.anonymousLead":
    "Uma pessoa moderadora",
  "dashboard.feed.type.memberJoined.body": "entrou na plataforma",
  "dashboard.feed.type.memberJoined.leadCount_one": "{count} pessoa nova",
  "dashboard.feed.type.memberJoined.leadCount_other": "{count} pessoas novas",
  "dashboard.feed.type.memberJoined.genericLead": "Pessoas novas",
  "dashboard.feed.type.vouchReceived.body": "recebeu um voto de confiança de",
  "dashboard.feed.type.vouchReceived.bodyNoActor": "recebeu um novo voto de confiança",
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
  "members.header.titleLine2": "cada uma <em>com voto de confiança de alguém</em>.",
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
  "members.verify.mutualLine": "Indicou {name} como conhecimento em comum",
  "members.verify.noMutual": "Ainda sem conhecimento em comum indicado",
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
  // Aprovado: agora é enviado um email de convite automaticamente; a opção
  // de copiar a ligação abaixo mantém-se como recurso manual, por isso
  // dizê-lo com clareza, não que nada foi enviado.
  "members.verify.approvedLabel": "Recebide na comunidade",
  "members.verify.sendYourself":
    "Um email de convite está a caminho de {email}. Também podes copiar a ligação abaixo e enviá-la tu mesme, como reforço.",
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
  "members.verify.flags.sourceBurst":
    "Parte de um pico incomum desta origem",
  "members.verify.priorDeclineCount_one": "Já recusado uma vez",
  "members.verify.priorDeclineCount_other": "Já recusado {count} vezes",
  "members.verify.referenceLabel": "Referência",
  "members.verify.referenceResolved": "Corroborado por {name}",
  "members.verify.referenceUnresolved": "Indicou {email}; sem correspondência entre membros",
  "members.verify.waitingDays_one": "À espera há {count} dia",
  "members.verify.waitingDays_other": "À espera há {count} dias",
  "members.verify.declineReason.spam_pattern": "Parece spam",
  "members.verify.declineReason.underage": "Menor de 18 anos",
  "members.verify.declineReason.implausible": "Os detalhes não batem certo",
  "members.verify.declineReason.safety_concern": "Preocupação de segurança",
  "members.verify.declineReason.other": "Outro",
  "members.verify.declineModal.title": "Recusar o pedido de {name}?",
  "members.verify.declineModal.body":
    "Escolhe o motivo mais próximo. Isto não é mostrado à pessoa candidata. Ela recebe uma nota curta e genérica.",
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
  "members.verify.bulk.partialFailure_one":
    "{count} pedido não pôde ser atualizado",
  "members.verify.bulk.partialFailure_other":
    "{count} pedidos não puderam ser atualizados",
  "members.verify.bulk.action.approve": "Aprovar pedidos",
  "members.verify.bulk.action.waitlist":
    "Colocar pedidos em lista de espera",
  "members.verify.bulk.action.decline": "Recusar pedidos",
  "members.verify.bulk.confirmDecline.title": "Recusar {count} pedidos?",
  "members.verify.bulk.confirmDecline.body":
    "Escolhe o motivo mais próximo. Aplica-se aos {count} pedidos selecionados.",
  "members.verify.bulk.confirmDecline.confirmCta": "Recusar todos",
  "members.verify.status.approved": "Aprovado",
  "members.verify.status.declined": "Recusado",

  // Separador de amostra de qualidade: uma verificação periódica e só de
  // leitura de decisões passadas, para outro admin comparar notas. Não é um
  // fluxo de aprovação — dizê-lo com clareza.
  "members.sample.intro":
    "Uma verificação periódica de decisões passadas, para dois admins compararem notas.",
  "members.sample.explainer":
    "Isto mostra decisões passadas para discussão. Não regista uma segunda aprovação.",
  "members.sample.resampleCta": "Mostrar outra amostra",
  "members.sample.decisionLabel": "Decisão",
  "members.sample.empty": "Ainda não há pedidos revistos para amostrar.",

  "members.drawer.verifiedChip": "Pessoa verificada",
  "members.drawer.verifyCta": "Verificar",
  "members.drawer.verifiedToast": "Verificámos {name}.",
  "members.drawer.messageCta": "Mensagem",
  "members.drawer.restrictCta": "Restringir…",
  "members.drawer.removeCta": "Remover pessoa…",
  "members.drawer.reasonRequiredToast":
    "É necessário um motivo antes de remover",
  "members.drawer.glanceTitle": "Resumo rápido",
  "members.drawer.graphTitle": "Rede de votos de confiança: confiança nos dois sentidos",
  "members.drawer.graphAriaLabel": "Abrir a rede de confiança completa",
  "members.drawer.exploreCta": "Explorar rede",
  "members.drawer.communitiesTitle": "Comunidades",
  "members.drawer.contributionsTitle": "Histórico de contribuições",
  "members.drawer.removePanel.title": "Remover uma pessoa é permanente.",
  "members.drawer.removePanel.keepCta": "Manter pessoa",
  "members.drawer.removePanel.continueCta": "Percebi, continuar",
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
  "members.role.sectionTitle": "Papel e permissões",
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
  "staffRoles.adminSuperset":
    "A administração já tem todas as capacidades de equipa.",
  "staffRoles.systemLocked": "Contas do sistema não podem ter papéis de equipa.",

  "members.timeline.title": "Histórico de moderação: a favor e contra",
  "members.timeline.auditLinkCta": "Todas as entradas no registo de auditoria",

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
  "adminInvites.drawer.recipientAnyone": "Link aberto, qualquer pessoa pode aceitar",
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
  "adminInvites.quota.clearAriaLabel": "Repor a quota de convites de {name} para a predefinição",
  "adminInvites.quota.invalid": "Introduz um número inteiro de 0 ou mais, ou limpa o campo.",
  "adminInvites.quota.saved": "Quota de convites de {name} guardada.",
  "adminInvites.quota.cleared": "{name} voltou à quota de convites predefinida.",

  "adminCommissionInterests.title": "Interesse em <em>encomendas</em>",
  "adminCommissionInterests.header.eyebrow": "Cultura",
  "adminCommissionInterests.header.title": "Interesse no <em>quadro de encomendas</em>",
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

  "adminChangemakerNominations.title": "Nomeações de <em>agentes de mudança</em>",
  "adminChangemakerNominations.header.eyebrow": "Comunidade",
  "adminChangemakerNominations.header.title": "Quem os membros <em>propõem</em>",
  "adminChangemakerNominations.header.sub":
    "Todos os nomes que os membros nomearam para o diretório de Agentes de Mudança, dos mais recentes primeiro. Uma lista para rever.",
  "adminChangemakerNominations.empty": "Ainda não há nomeações.",
  "adminChangemakerNominations.error":
    "Não foi possível carregar as nomeações. Tenta novamente.",
  "adminChangemakerNominations.unknownMember": "Um antigo membro",
  "adminChangemakerNominations.row.by": "Nomeado por {name}",
  "adminChangemakerNominations.row.sent": "Enviado {date}",
  "adminChangemakerNominations.loadMore": "Carregar mais",
  "adminChangemakerNominations.loadingMore": "A carregar…",

  "adminReadingGroupProposals.title": "Propostas de <em>grupos de leitura</em>",
  "adminReadingGroupProposals.header.eyebrow": "Comunidade",
  "adminReadingGroupProposals.header.title": "Grupos que os membros <em>querem criar</em>",
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
  "adminReadingGroupProposals.toast.error": "Não foi possível concluir. Tenta novamente.",
  "adminReadingGroupProposals.loadMore": "Carregar mais",
  "adminReadingGroupProposals.loadingMore": "A carregar…",

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
  "adminMagazineSubmissions.row.by": "De {name}",
  "adminMagazineSubmissions.row.sent": "Enviado {date}",
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
  "adminWriterApplications.row.by": "De {name}",
  "adminWriterApplications.row.sample": "Amostra",
  "adminWriterApplications.row.sampleLink": "Amostra ligada",
  "adminWriterApplications.row.approveCta": "Aprovar",
  "adminWriterApplications.row.declineCta": "Recusar",
  "adminWriterApplications.row.reviewNotePlaceholder": "Nota opcional para o candidato",
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
  "adminListings.bulk.action.publish": "Não foi possível publicar as listagens selecionadas",
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
  "media.kinds.gathering-photos": "Fotos de encontros",
  "media.kinds.group-avatars": "Avatares de grupo",
  "media.kinds.listing-photos": "Fotos de espaços",
  "media.unowned": "Sem dono",
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

  "moderation.selectReportAriaLabel": "Selecionar denúncia: {title}",
  "moderation.reportedByLabel": "Denunciado por",
  "moderation.aboutLabel": "Sobre",
  "moderation.bulk.ariaLabel": "Ações em lote",
  "moderation.bulk.selectedCount_one": "{count} selecionada",
  "moderation.bulk.selectedCount_other": "{count} selecionadas",
  "moderation.bulk.dismissCta": "Rejeitar",
  "moderation.bulk.spamCta": "Remover como spam",
  "moderation.bulk.reassignCta": "Reatribuir…",
  "moderation.bulk.cancelCta": "Cancelar",

  "moderation.emergency.ariaLabel": "Emergências de segurança",
  "moderation.emergency.count_one": "{count} emergência de segurança",
  "moderation.emergency.count_other": "{count} emergências de segurança",
  "moderation.emergency.sub":
    "· outing e doxxing são tratados como dano urgente, com um prazo de 1 hora. Trata destas antes de tudo o resto.",

  "moderation.everythingElse": "Tudo o resto",
  "moderation.countNote_one":
    "A mostrar {count} denúncia em aberto · a mais antiga há {oldest}",
  "moderation.countNote_other":
    "A mostrar {count} denúncias em aberto · a mais antiga há {oldest}",
  "moderation.filterEmpty":
    "Nenhuma denúncia em aberto corresponde a este filtro. Tenta “Todas as gravidades”.",

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
  "moderation.appealDrawer.viewOriginalCta":
    "Ver a denúncia original e a conversa",
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

  "moderation.actions.hide.label": "Ocultar conteúdo",
  "moderation.actions.hide.desc": "Remove da vista, mantém para registo",
  "moderation.actions.hide.done": "ocultação",
  "moderation.actions.shield.label": "Proteger pessoa",
  "moderation.actions.shield.desc": "Protege a pessoa denunciada",
  "moderation.actions.shield.done": "proteção",
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
  "moderation.priorReports.newAccount": "Conta nova · {vouches} votos de confiança",
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
  "moderation.queue.bulkToast_one": "{verb} de {count} denúncia",
  "moderation.queue.bulkToast_other": "{verb} de {count} denúncias",
  "moderation.queue.bulkVerb.dismissed": "Rejeição",
  "moderation.queue.bulkVerb.removedAsSpam": "Remoção como spam",
  "moderation.queue.bulkVerb.reassigned": "Reatribuição",
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
  "communities.grid.healthAriaLabel": "Saúde {score}, ver detalhe",
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
  "communities.health.method.exampleSizeAdjust": "Ajuste ao tamanho da comunidade",
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
  "communities.support.withdrawnToast": "Pedido de apoio retirado",
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
  "governance.header.publishComingSoonToast":
    "A publicação de relatórios de transparência ainda não está disponível.",
  "governance.tabs.finances": "Finanças",
  "governance.tabs.policy": "Política e versões",
  "governance.tabs.audit": "Registo de auditoria",

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
  "governance.finances.provenance.manual.hint":
    "Introduzido por um administrador. {editor} em {date}.",
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
    "Corrija qualquer número errado. Cada alteração é registada, e o valor passa a estar marcado como introduzido por um administrador.",
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
  "governance.finances.edit.error": "Não foi possível guardar. Tente novamente.",
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

  "governance.mrrPanel.live": "MRR de apoiantes · em direto",
  "governance.mrrPanel.lead":
    "Cada euro vem apenas das pessoas. <em>Nunca vamos vender dados de ninguém</em>. Está escrito na nossa constituição, por isso obriga-nos a cumpri-lo.",
  "governance.mrrPanel.breakdown.care": "Cuidado",
  "governance.mrrPanel.breakdown.platform": "Plataforma",
  "governance.mrrPanel.breakdown.mutualAid": "Entreajuda",
  "governance.mrrPanel.breakdown.health": "Saúde",
  "governance.mrrPanel.breakdown.magazine": "Revista",
  "governance.mrrPanel.readCta": "Ler a constituição",

  "governance.policy.versionsTitle": "Registo de <em>decisões</em>",
  "governance.policy.versionsSub":
    "Cada mudança em como nos protegemos, datada e aberta.",
  "governance.policy.seeDiffCta": "Ver o que mudou",
  "governance.policy.principlesTitle": "Os nossos <em>princípios</em>",
  "governance.policy.transparencyNote":
    "As mudanças de política são propostas em aberto e ratificadas na assembleia da comunidade. Qualquer pessoa pode ler o histórico completo de edições. Nada aqui é decidido à porta fechada.",
  "governance.policy.principle.noSell": "Nunca vamos vender dados de ninguém.",
  "governance.policy.principle.visibility":
    "A visibilidade é sempre escolha da pessoa.",
  "governance.policy.principle.noSilent":
    "Sem remoções silenciosas. Cada ação carrega um motivo.",
  "governance.policy.principle.accessNeverConditional":
    "O acesso nunca depende da capacidade de pagar.",

  "governance.diff.eyebrow": "Mudança de política",
  "governance.diff.title": "v4.1 → <em>v4.2</em>",
  "governance.diff.closeCta": "Fechar",
  "governance.diff.readFullCta": "Ler a v4.2 completa",
  "governance.diff.introTitle": "Secção 3: Dano que tratamos como urgente.",
  "governance.diff.introDate": "Ratificado a 12 jun 2026, 89% a favor.",
  "governance.diff.note":
    "Proposto pelas pessoas moderadoras de Trans & Friends · votado por toda a comunidade na Assembleia Anual.",

  "governance.audit.title": "Cada ação, <em>registada</em>",
  "governance.audit.metaZero": "Nenhuma entrada corresponde a estes filtros.",
  "governance.audit.metaMatch": "{count} entradas",
  "governance.audit.exportToast": "Exportadas {total} entradas em CSV",
  "governance.audit.exportError":
    "Não foi possível exportar o registo de auditoria. Tente novamente.",
  "governance.audit.exportComingSoonToast":
    "A exportação do registo de auditoria ainda não está disponível.",
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
  "governance.audit.range.today": "Hoje",
  "governance.audit.range.week": "Esta semana",
  "governance.audit.range.quarter": "Este trimestre",
  "governance.audit.emptyTitle": "Nenhuma entrada corresponde",
  "governance.audit.emptyText":
    "Nenhuma ação de moderação corresponde a estes filtros. Tenta alargá-los.",
  "governance.audit.pagerMeta": "A mostrar {start}–{end} de {total} entradas",
  "governance.audit.pagerMatch": " ({count} correspondem)",
  "governance.audit.prevPage": "Página anterior",
  "governance.audit.nextPage": "Página seguinte",
  "governance.audit.entryModal.eyebrow": "Entrada de auditoria",
  "governance.audit.entryModal.actedWhen": "agiu {when}",
  "governance.audit.entryModal.openLinkCta": "Abrir {label}",
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
  "modPanel.requests.emptyTitle": "Sem pedidos à espera",
  "modPanel.requests.emptyDesc":
    "Está tudo em dia. Os novos pedidos vão aparecer aqui.",
  "modPanel.requests.requestedAgo": "Pedido feito há {time}",
  "modPanel.requests.approveCta": "Aprovar",
  "modPanel.requests.declineCta": "Recusar",
  "modPanel.requests.approvedToast":
    "Aprovámos {name}. Dá-lhe as boas-vindas.",
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
  "modPanel.reports.warnCta": "Avisar autoria",
  "modPanel.reports.dismissCta": "Rejeitar",
  "modPanel.reports.escalateCta": "Escalar para a equipa",
  "modPanel.reports.removedToast":
    "Publicação removida. A autoria foi notificada.",
  "modPanel.reports.warnedToast": "Enviámos um aviso a {name}.",
  "modPanel.reports.dismissedToast": "Denúncia rejeitada.",
  "modPanel.reports.escalatedToast":
    "Escalado para a equipa da QueerPulse. Está agora na fila da plataforma.",

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
  "modPanel.settings.transfer.modal.pickLabel": "Escolhe a nova pessoa responsável",
  "modPanel.settings.transfer.modal.emptyTitle": "Ainda não há a quem entregar",
  "modPanel.settings.transfer.modal.emptyDesc":
    "Precisas de pelo menos mais uma pessoa antes de poder transferir a propriedade.",
  "modPanel.settings.transfer.modal.cta": "Transferir propriedade",

  // ── Rede de votos de confiança (visualização da rede de confiança) ─────────
  "vouchGraph.modes.network": "Rede",
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
  "vouchGraph.modal.verifyToast":
    "Base de confiança associada. A abrir verificação",
  "vouchGraph.modal.citeToast":
    "Caminho de confiança citado no registo de auditoria",
  "vouchGraph.modal.privateToast": "Esta pessoa mantém a rede privada",
  "vouchGraph.modal.loadingTitle": "A carregar rede de confiança…",
  "vouchGraph.modal.emptyTitle": "Ainda sem rede de confiança",
  "vouchGraph.modal.emptyBody": "Esta pessoa ainda não tem votos de confiança registados.",
  "vouchGraph.modal.truncatedNotice":
    "A mostrar os 500 membros mais recentes. Algumas ligações podem estar ocultas.",

  "vouchGraph.inspector.emptyTitle": "Escolhe alguém",
  "vouchGraph.inspector.emptyBody":
    "Clica num nó para ver quem confia nessa pessoa e em que se baseia essa confiança. Faz duplo clique para percorrer a rede a partir daí.",
  "vouchGraph.inspector.sealed":
    "Identidade anterior selada, só o nome escolhido",
  "vouchGraph.inspector.ringBanner.title": "Parte de um anel de votos de confiança suspeito",
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
  "vouchGraph.inspector.anonBanner.title": "Identidade protegida",
  "vouchGraph.inspector.anonBanner.body":
    "Um voto de confiança anónimo. A identidade está protegida e não pode ser revelada.",
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
  "vouchGraph.inspector.expandCta": "Expandir rede",
  "vouchGraph.inspector.collapseCta": "Colapsar rede",
  "vouchGraph.inspector.citeCta": "Citar no registo de auditoria",

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

  "vouchGraph.graph.ariaLabel":
    "Rede de votos de confiança: {count} pessoas ligadas a {initials}",
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
  "settings.closedMessage.label": "Mensagem mostrada quando os registos estão fechados",
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
  "settings.saved": "Definições guardadas.",
  "settings.saveError": "Não foi possível guardar. Nada foi alterado.",

  "settings.history.title": "Alterações recentes",
  "settings.history.empty": "Ainda não há alterações.",
  "settings.history.error": "Não foi possível carregar as alterações recentes.",
  "settings.history.by": "por {actor}",
  "settings.history.unknownActor": "uma pessoa administradora entretanto eliminada",
  "settings.history.on": "ligado",
  "settings.history.off": "desligado",
  "settings.history.cleared": "vazio",
  "settings.history.changed": "{setting}: {from} → {to}",

  "settings.key.registrationEnabled": "Registo",
  "settings.key.joinRequestsEnabled": "Pedidos de convite",
  "settings.key.lockdownEnabled": "Bloqueio",
  "settings.key.lockdownAllowsModerators": "Moderação durante o bloqueio",
  "settings.key.lockdownMessage": "Mensagem de manutenção",
  "settings.key.registrationClosedMessage": "Mensagem de registos fechados",

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
  "bots.saveFailed": "Não foi possível guardar. Verifica a ligação e tenta de novo.",
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
  "roadmap.header.eyebrow": "Roteiro",
  "roadmap.header.title": "Molda o <em>roteiro</em>",
  "roadmap.header.sub":
    "Gere o quadro lançado/em construção/planeado, tria ideias de membros e edita as estatísticas da página pública.",
  "roadmap.loading": "A carregar o roteiro…",
  "roadmap.tabs.board": "Quadro",
  "roadmap.tabs.ideas": "Ideias",
  "roadmap.tabs.heroStats": "Estatísticas",

  // AdminRoadmapBoard.tsx, AdminRoadmapItemRow.tsx, AdminRoadmapItemModal.tsx,
  // AdminRoadmapItemModalFields.tsx — o quadro lançado/em construção/planeado.
  "roadmap.board.column.shipped": "Lançado",
  "roadmap.board.column.building": "Em construção",
  "roadmap.board.column.planned": "Planeado",
  "roadmap.board.empty": "Ainda não há nada nesta coluna.",
  "roadmap.board.addItemCta": "Adicionar item",
  "roadmap.board.toast.removed": "{name} foi removido do roteiro.",
  "roadmap.board.toast.updated": "{name} foi guardado.",
  "roadmap.board.toast.created": "{name} foi adicionado ao roteiro.",
  "roadmap.board.delete.title": "Remover {name}?",
  "roadmap.board.delete.body":
    "Isto remove-o do roteiro definitivamente. Deixa de aparecer em qualquer coluna.",
  "roadmap.board.delete.confirmCta": "Remover item",
  "roadmap.board.modal.createEyebrow": "Novo item",
  "roadmap.board.modal.editEyebrow": "Editar item",
  "roadmap.board.modal.createTitle": "Adicionar um item ao roteiro",
  "roadmap.board.modal.createCta": "Adicionar item",
  "roadmap.board.field.column": "Coluna",
  "roadmap.board.field.category": "Categoria",
  "roadmap.board.field.name": "Nome",
  "roadmap.board.field.description": "Descrição",
  "roadmap.board.field.date": "Data",
  "roadmap.board.field.date.placeholder": "ex.: julho de 2026",
  "roadmap.board.field.requested.title": "Pedido por membros",
  "roadmap.board.field.requested.sub":
    'Mostra a etiqueta "Pedido por membros" no cartão público.',
  "roadmap.board.field.stage": "Fase",
  "roadmap.board.field.stage.placeholder": "ex.: Em desenho",
  "roadmap.board.field.eta": "Previsão",
  "roadmap.board.field.eta.placeholder": "ex.: T4 2026",
  "roadmap.board.field.progress": "Progresso (%)",
  "roadmap.board.field.votes": "Votos iniciais",
  "roadmap.board.field.hot.title": "Mais pedido",
  "roadmap.board.field.hot.sub":
    "Destaca este item como o mais pedido na página pública.",
  "roadmap.board.item.etaLabel": "Previsão {eta}",
  "roadmap.board.item.progressLabel": "{progress}% concluído",
  "roadmap.board.item.votesLabel": "{votes} votos",
  "roadmap.board.item.liveVotesLabel": "{count} ao vivo",
  "roadmap.board.item.moveUpAriaLabel": "Mover {name} para cima",
  "roadmap.board.item.moveDownAriaLabel": "Mover {name} para baixo",
  "roadmap.board.item.requestedTag": "Pedido por membros",
  "roadmap.board.item.hotTag": "Mais pedido",

  // AdminRoadmapIdeasQueue.tsx, AdminRoadmapIdeaRows.tsx — triagem de ideias
  // submetidas por membros + a lista publicada que a página pública lê.
  "roadmap.ideas.pending.title": "Por rever",
  "roadmap.ideas.pending.empty": "Nada à espera. Todas as ideias foram triadas.",
  "roadmap.ideas.published.title": "Publicadas",
  "roadmap.ideas.published.empty": "Ainda não há nada publicado.",
  "roadmap.ideas.fromMemberTag": "De um membro",
  "roadmap.ideas.submittedLabel": "Submetida a {date}",
  "roadmap.ideas.promoteCta": "Promover",
  "roadmap.ideas.dismissCta": "Rejeitar",
  "roadmap.ideas.addPlaceholder": "Adicionar uma ideia à lista publicada…",
  "roadmap.ideas.addAriaLabel": "Texto da nova ideia",
  "roadmap.ideas.addCta": "Adicionar ideia",
  "roadmap.ideas.moveUpAriaLabel": 'Mover "{text}" para cima',
  "roadmap.ideas.moveDownAriaLabel": 'Mover "{text}" para baixo',
  "roadmap.ideas.editAriaLabel": 'Editar "{text}"',
  "roadmap.ideas.tallyLabel_one": "{count} voto",
  "roadmap.ideas.tallyLabel_other": "{count} votos",
  "roadmap.ideas.toast.promoted": "Ideia promovida para a lista publicada.",
  "roadmap.ideas.toast.dismissed": "Ideia rejeitada.",
  "roadmap.ideas.toast.removed": "Ideia removida.",
  "roadmap.ideas.toast.updated": "Ideia guardada.",
  "roadmap.ideas.toast.added": "Ideia adicionada.",
  // Diálogo de confirmação partilhado (IdeaQueueConfirmModal) — `kind` é
  // "dismiss" ou "delete", interpolado na chave (`roadmap.ideas.${kind}.*`).
  "roadmap.ideas.dismiss.title": "Rejeitar esta ideia?",
  "roadmap.ideas.dismiss.body":
    "Sai da fila de pendentes sem ser publicada. A pessoa que a submeteu não é notificada.",
  "roadmap.ideas.dismiss.confirmCta": "Rejeitar ideia",
  "roadmap.ideas.delete.title": "Remover esta ideia?",
  "roadmap.ideas.delete.body":
    "Isto remove-a da página pública do roteiro definitivamente.",
  "roadmap.ideas.delete.confirmCta": "Remover ideia",

  // AdminRoadmapHeroStats.tsx — lista editável de estatísticas do hero público.
  "roadmap.heroStats.empty":
    "Ainda não há estatísticas. Adiciona uma abaixo ou preenche a partir das contagens.",
  "roadmap.heroStats.autofillCta": "Preencher a partir das contagens",
  "roadmap.heroStats.addCta": "Adicionar estatística",
  "roadmap.heroStats.removeRowCta": "Remover",
  "roadmap.heroStats.labelPlaceholder": "ex.: 12 lançados este ano",
  "roadmap.heroStats.labelAriaLabel": "Texto da estatística",
  "roadmap.heroStats.moveUpAriaLabel": "Mover estatística para cima",
  "roadmap.heroStats.moveDownAriaLabel": "Mover estatística para baixo",
  "roadmap.heroStats.jadeToggle.title": "Destacar em jade",
  "roadmap.heroStats.toast.saved": "Estatísticas guardadas.",
  // Etiquetas de preenchimento automático — "lançado"/"planeado" concordam em
  // número (_one/_other); "em curso" é invariável, por isso fica só a chave base.
  "roadmap.heroStats.autofill.shipped_one": "{count} lançado",
  "roadmap.heroStats.autofill.shipped_other": "{count} lançados",
  "roadmap.heroStats.autofill.building": "{count} em curso",
  "roadmap.heroStats.autofill.planned_one": "{count} planeado",
  "roadmap.heroStats.autofill.planned_other": "{count} planeados",

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
  "roadmap.toolbar.dragHint": "Arrasta para mover ou reordenar · ? para atalhos",

  // ── Quadro — colunas (backlog é nova; lançado/em construção/planeado
  // reutilizam as chaves roadmap.board.column.* acima, mesmo texto),
  // subtítulos, estados vazios/WIP, dicas das etiquetas, avisos, menu.
  "roadmap.board.column.backlog": "Backlog",
  "roadmap.board.column.subtitle.backlog": "Estacionado, mas com intenção",
  "roadmap.board.column.subtitle.planned": "Assumido, ainda por começar",
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
  "roadmap.drawer.field.scope": "Âmbito",
  "roadmap.drawer.field.scopeAll": "Todas as comunidades",
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
  "roadmap.drawer.commitment.promiseToggle.title":
    "É uma promessa firme",
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
  "roadmap.drawer.comments.hideCta": "Ocultar",
  "roadmap.drawer.comments.unhideCta": "Reexibir",
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
  "roadmap.modals.mergeIdea.title": "Juntar isto a um <em>item já existente</em>",
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
  "roadmap.modals.decline.reason.capacity.label": "Sem capacidade, sinceramente",
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
  "roadmap.modals.notifyVoters.title_other": "Notificar <em>{count}</em> membros",
  "roadmap.modals.notifyVoters.itemLabel": "Item",
  "roadmap.modals.notifyVoters.messageLabel": "Mensagem",
  "roadmap.modals.notifyVoters.onceOnlyTitle": "Um único email, sem seguimentos",
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
  "roadmap.capacityView.atOnceTag": "{count} ao mesmo tempo",
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
  "roadmap.ideasView.voteSpike": "Pico de votos: {votes} votos em {hours}h",
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
  "roadmap.archiveView.deleteConfirmTitle": 'Eliminar "{name}" definitivamente?',
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
  "roadmap.publicPreview.somedaySub": "Queremos isto. Dar uma data seria mentir.",
  "roadmap.publicPreview.shippedHeading": "Lançado",
  "roadmap.publicPreview.shippedSub":
    "O registo de mudanças. Cada um destes foi pedido por alguém na sala.",
  "roadmap.publicPreview.notBuildingHeading": "Não vamos construir isto, e porquê",
  "roadmap.publicPreview.notBuildingSub":
    "A lista que a maioria das plataformas esconde. Se dissermos que não, tens um motivo.",
  "roadmap.publicPreview.requestedTag": "Pediste isto",
  "roadmap.publicPreview.committedTag": "Assumido",
  "roadmap.publicPreview.noPublicNoteFallback":
    "Ainda sem nota pública. Os membros não vão ver nada aqui até adicionares uma.",
  "roadmap.publicPreview.movedOnce": "Adiada uma vez: {from} → {to}.",
  "roadmap.publicPreview.movedMultiple": "Adiada {count}×: {from} → {to}.",
  "roadmap.publicPreview.blockedNote": "Bloqueado à espera de {by}.",
  "roadmap.publicPreview.noDateHonest": "Sem data, sinceramente",
  "roadmap.publicPreview.liveLabel": "Ativo",
  "roadmap.publicPreview.editItemTooltip": "Editar este item",
  "roadmap.publicPreview.copyPermalinkTooltip":
    "Copiar hiperligação permanente",
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
  "roadmap.toasts.bulkPublished_one": "{count} item mostrado no roteiro público",
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
  "roadmap.toasts.promoted_one": '"{name}" promovido. {votes} pessoa notificada',
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
  "roadmap.toasts.permalinkCopied": "{url} copiado",
  "roadmap.toasts.rssInfo": "RSS: {url}",
  "roadmap.toasts.auditExported": "Registo de auditoria exportado para a governança",
  "roadmap.toasts.boardReset": "Quadro reposto com o roteiro semeado",
  "roadmap.toasts.safetyReviewNeededInfo_one":
    "{count} item precisa de revisão de segurança primeiro",
  "roadmap.toasts.safetyReviewNeededInfo_other":
    "{count} itens precisam de revisão de segurança primeiro",

  // ── Página inicial (/admin/landing) ─────────────────────────────────────
  "landing.header.eyebrow": "Site público",
  "landing.header.sub": "Cura as secções que os visitantes não autenticados veem na página inicial.",

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
  "pressKit.list.previewEmpty": "Ainda sem detalhe.",
  "pressKit.list.moveUpAria": "Mover {name} para cima",
  "pressKit.list.moveDownAria": "Mover {name} para baixo",
  "pressKit.list.activeToggleAria": "Mostrar {name} no kit de imprensa público",
  "pressKit.list.activeToggleLabel": "Visível",
  "pressKit.list.activeToggleError": "Não foi possível atualizar. Tenta de novo",
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
    "Derivados dos dados da plataforma. Mostrados no kit público, não editáveis aqui.",
  "pressKit.facts.empty": "Ainda sem factos disponíveis.",

  // ── Integridade dos anúncios de habitação (Wave B1) — fila por risco ──
  "housing.risk.title": "Pontuação de risco",
  "housing.risk.reasonsLabel": "Porque está sinalizado",
  "housing.risk.evidenceLabel": "Cópia do anúncio denunciado",
  "housing.risk.reason.rent_far_below_market":
    "Renda muito abaixo do intervalo local",
  "housing.risk.reason.rent_below_market": "Renda abaixo do intervalo local",
  "housing.risk.reason.contact_info_in_text": "Contactos no texto",
  "housing.risk.reason.off_platform_payment_language":
    "Linguagem de pagamento antecipado ou fora da plataforma",
  "housing.risk.reason.discriminatory_language":
    "Possível linguagem discriminatória",
  "housing.risk.reason.lister_unverified":
    "Anunciante sem verificação de telefone ou identidade",
  "housing.risk.reason.lister_phone_only":
    "Anunciante só com telefone verificado",
  "housing.risk.reason.incomplete_listing": "Descrição escassa",
  "housing.risk.reason.no_photos": "Sem fotografias",
  "housing.risk.reason.missing_accessibility_info": "Sem informação de acessos",
};
