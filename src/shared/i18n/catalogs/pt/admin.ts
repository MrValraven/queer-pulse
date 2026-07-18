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
  // ── Verbos partilhados, reutilizados em vários modais/gavetas ─────────────
  "common.cancel": "Cancelar",
  "common.close": "Fechar",
  "common.back": "Voltar",
  "common.undo": "Desfazer",
  // Raiz do breadcrumb do painel de administração (usado por páginas um nível
  // abaixo de /admin, p. ex. a fila de candidaturas a parceiro).
  "common.adminBreadcrumb": "Administração",

  // ── Painel principal ──────────────────────────────────────────────────────
  "dashboard.title": "Resumo · <em>bom dia, {name}</em>",
  "dashboard.header.titleLine1": "Sete denúncias",
  "dashboard.header.titleLine2": "precisam de <em>uma pessoa</em>.",
  "dashboard.header.sub":
    "Duas estão sinalizadas como emergências de segurança — outing e doxxing. Tudo o resto está calmo. Estás a manter toda a rede estável; aqui está por onde começar.",
  "dashboard.header.digestCta": "Resumo semanal",
  "dashboard.header.digestToast": "O resumo semanal abriria num novo separador",
  "dashboard.header.moderationCta": "Abrir moderação",

  "dashboard.metrics.activeMembers.label": "Pessoas ativas",
  "dashboard.metrics.openReports.label": "Denúncias em aberto",
  "dashboard.metrics.medianResponse.label": "Resposta mediana",
  "dashboard.metrics.sustainerMrr.label": "MRR de apoiantes",
  "dashboard.metrics.trendPercent": "{value}%",
  "dashboard.metrics.trendOldest": "mais antiga: {hours}",
  "dashboard.metrics.trendWellUnder": "bem abaixo",
  "dashboard.metrics.footGrowth": "+{count} este mês",
  "dashboard.metrics.footEmergencies_one": "{count} é uma emergência",
  "dashboard.metrics.footEmergencies_other": "{count} são emergências",
  "dashboard.metrics.footSlaTarget": "meta de SLA: {hours}",
  "dashboard.metrics.footSustainers_one": "{count} apoiante",
  "dashboard.metrics.footSustainers_other": "{count} apoiantes",

  "dashboard.triage.title": "Precisa de <em>uma pessoa</em>",
  "dashboard.triage.sortedToast": "Ordenado por urgência",
  "dashboard.triage.safetyEmergencies.title": "Emergências de segurança",
  "dashboard.triage.safetyEmergencies.sub": "Outing e doxxing —",
  "dashboard.triage.safetyEmergencies.subEm": "trata destas primeiro",
  "dashboard.triage.openReports.title": "Denúncias em aberto",
  "dashboard.triage.openReports.sub": "Assédio, spam, abuso de avais",
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
  "dashboard.charts.series.vouchAbuse": "Abuso de avais",
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

  "dashboard.feed.title": "Atividade em direto",
  "dashboard.feed.live": "Direto",
  "dashboard.feed.transparency":
    "Cada ação aqui é <strong>registada e mostrada</strong> à pessoa afetada. Nunca há remoções silenciosas.",
  "dashboard.feed.auditLinkCta": "Ver o registo de auditoria",

  // ── Pessoas ────────────────────────────────────────────────────────────────
  "members.title": "Pessoas · <em>a comunidade</em>",
  "members.header.eyebrow": "Diretório de pessoas",
  "members.header.titleLine1": "{total} pessoas,",
  "members.header.titleLine2": "cada uma <em>avalizada por alguém</em>.",
  "members.header.sub":
    "Não são linhas numa tabela — são pessoas em quem alguém confiou o suficiente para as trazer. Pronomes e nomes escolhidos são os únicos nomes mostrados aqui. {count} pessoas estão à espera de serem acolhidas.",
  "members.header.exportCta": "Exportar",
  "members.filterAriaLabel": "Filtrar pessoas",
  "members.tabs.all": "Todas as pessoas",
  "members.tabs.pending": "Verificação pendente",
  "members.tabs.flagged": "Sinalizadas",
  "members.filters.all": "Todos os estados",
  "members.filters.verified": "Verificadas",
  "members.filters.new": "Novas esta semana",
  "members.empty": "Nenhuma pessoa corresponde a estes filtros.",
  "members.openAriaLabel": "Abrir {name}",
  "members.vouchedLabel": "avalizada",

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
    "Não foi possível guardar essa decisão — tenta novamente",
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
  "members.verify.ageAttested": "18+ confirmado a {date} · Termos v{version}",
  "members.verify.ageAttestedUnknown": "18+ confirmado · Termos v{version}",
  // Aprovado: a plataforma não envia qualquer email — dizê-lo com clareza.
  "members.verify.approvedLabel": "Recebide na comunidade",
  "members.verify.sendYourself":
    "Não foi enviado nenhum email. Envia tu esta ligação de convite para {email} — é a única forma de entrarem.",
  "members.verify.copyLink": "Copiar ligação",
  "members.verify.copiedLink": "Copiada",
  "members.verify.copiedToast": "Ligação de convite copiada — agora envia-lha",
  "members.verify.copyFailed":
    "Não foi possível copiar a ligação — seleciona-a e copia",
  "members.verify.noInviteCode":
    "Não veio nenhum código de convite. Atualiza a fila ou pede a um admin para o reemitir.",

  "members.drawer.verifiedChip": "Pessoa verificada",
  "members.drawer.verifyCta": "Verificar",
  "members.drawer.verifiedToast": "Verificámos {name}.",
  "members.drawer.messageCta": "Mensagem",
  "members.drawer.restrictCta": "Restringir…",
  "members.drawer.removeCta": "Remover pessoa…",
  "members.drawer.reasonRequiredToast":
    "É necessário um motivo antes de remover",
  "members.drawer.glanceTitle": "Resumo rápido",
  "members.drawer.graphTitle": "Rede de avais — quem confia nesta pessoa",
  "members.drawer.graphAriaLabel": "Abrir a rede de confiança completa",
  "members.drawer.exploreCta": "Explorar rede",
  "members.drawer.communitiesTitle": "Comunidades",
  "members.drawer.contributionsTitle": "Histórico de contribuições",
  "members.drawer.removePanel.title": "Remover uma pessoa é permanente.",
  "members.drawer.removePanel.keepCta": "Manter pessoa",
  "members.drawer.removePanel.continueCta": "Percebi — continuar",
  "members.drawer.messageSentToast": "Mensagem enviada",
  "members.drawer.missingReasonToast":
    "É necessário um motivo — {name} vai vê-lo",
  "members.drawer.restrictedToast":
    "Restrição aplicada a {name} · {duration} · {scope} — aviso enviado",
  "members.drawer.restrictionUndoneToast": "Restrição anulada.",

  "members.timeline.title": "Histórico de moderação — a favor e contra",
  "members.timeline.auditLinkCta": "Todas as entradas no registo de auditoria",

  "members.sealed.sectionTitle": "Identidade e privacidade",
  "members.sealed.title": "A identidade anterior está selada",
  "members.sealed.body":
    "Qualquer nome anterior é encriptado e não é mostrado a ninguém — nem em denúncias, nem aqui, nem à administração. Só a pessoa controla o nome escolhido.",

  "members.message.eyebrow": "A entrar em contacto",
  "members.message.title": "Mensagem para <em>{name}</em>",
  "members.message.sendAsLabel": "Enviar como",
  "members.message.sendAsSelf": "{name} (tu)",
  "members.message.sendAsTeam": "Equipa de Confiança e Segurança",
  "members.message.bodyLabel": "Mensagem",
  "members.message.placeholder":
    "Escreve a {name}… um contacto de proximidade, um aviso, uma oferta de apoio.",
  "members.message.transparency":
    "As mensagens da administração são sempre identificadas como oficiais — nunca disfarçadas de mensagem entre pares. {name} pode sempre responder.",
  "members.message.sendCta": "Enviar mensagem",

  "members.restrict.eyebrow": "A limitar o acesso, com cuidado",
  "members.restrict.title": "Restringir <em>{name}</em>",
  "members.restrict.durationLabel": "Duração",
  "members.restrict.scopeLabel": "Âmbito",
  "members.restrict.reasonLabel": "Motivo",
  "members.restrict.applyCta": "Aplicar restrição",
  "members.restrict.notePlaceholder": "Uma nota para {name} (vai vê-la)…",
  "members.restrict.transparency":
    "{name} mantém acesso total ao apoio e aos recursos. Uma restrição limita as publicações — nunca corta o acesso à ajuda.",
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
  "members.restrict.reason.other": "Outro — explica abaixo",

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
  "members.glance.vouches": "Avais",
  "members.glance.memberFor": "Aqui há",
  "members.glance.reportsAgainst": "Denúncias recebidas",

  // ── Moderação ──────────────────────────────────────────────────────────────
  "moderation.title": "Moderação · <em>triagem</em>",
  "moderation.header.eyebrow": "Fila de moderação",
  "moderation.header.title": "Duas precisam de ti <em>primeiro</em>.",
  "moderation.header.sub":
    "As denúncias são ordenadas por quem está mais em risco — não pela ordem de chegada. Outing e doxxing sobem sempre ao topo, com um prazo mais apertado de 1 hora. Cada ação regista um motivo que a pessoa vai ler.",
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
    "Toda a denúncia em aberto tem uma decisão humana associada, e toda a pessoa afetada foi informada do que aconteceu e porquê. Descansa — a rede está segura nas tuas mãos.",
  "moderation.caughtUp.backCta": "Voltar ao resumo",
  "moderation.caughtUp.replayCta": "Rever a fila",
  "moderation.backToast": "A voltar ao resumo.",

  "moderation.appealsIntro":
    "Um recurso é uma pessoa a pedir-te para veres de novo. Lê a decisão original, ouve o que tem a dizer, e depois <em>mantém ou revoga</em> — com um motivo teu. Revogar a decisão de uma colega é normal e saudável.",
  "moderation.appeal.by": "Recurso de",
  "moderation.appeal.decidedBy": "Decidido por",
  "moderation.appeal.supportersFlag_one": "{count} pessoa a apoiar",
  "moderation.appeal.supportersFlag_other": "{count} pessoas a apoiar",
  "moderation.appeal.fallbackName": "pessoa",
  "moderation.resolvedSection": "Resolvidas recentemente",

  "moderation.reportDrawer.label": "Denúncia — {title}",
  "moderation.reportDrawer.title": "Um estado trans privado foi exposto",
  "moderation.reportDrawer.cancelCta": "Cancelar",
  "moderation.reportDrawer.escalateCta": "Escalar para a equipa de segurança",
  "moderation.reportDrawer.confirmCta": "Confirmar e notificar a pessoa",
  "moderation.reportDrawer.contentTitle": "Conteúdo denunciado",
  "moderation.reportDrawer.threadTitle": "Conversa em redor",
  "moderation.reportDrawer.flaggedTag": "Sinalizado",
  "moderation.reportDrawer.peopleTitle": "Pessoas envolvidas",
  "moderation.reportDrawer.auditTitle": "Histórico de ações",
  "moderation.reportDrawer.auditEmpty":
    "Ainda não há ações registadas. Cada decisão tua fica registada aqui.",
  "moderation.reportDrawer.decisionTitle":
    "Tomar uma decisão — proteção primeiro",
  "moderation.reportDrawer.reasonTitle":
    "Motivo — obrigatório, mostrado à pessoa",
  "moderation.reportDrawer.reasonAriaLabel": "Motivo",
  "moderation.reportDrawer.notePlaceholder":
    "Acrescenta uma nota humana. A pessoa vai lê-la — escreve como gostarias que te falassem.",
  "moderation.reportDrawer.noteAriaLabel": "Nota para a pessoa",
  "moderation.reportDrawer.transparency":
    "Vamos dizer a {name} exatamente o que foi feito e porquê, com uma ligação para recorrer. Nada acontece em silêncio.",
  "moderation.reportDrawer.pickActionToast":
    "Escolhe uma ação antes de confirmar.",
  "moderation.reportDrawer.escalatedToast":
    "Escalado para a equipa de segurança. A partir daqui fica com ela.",
  "moderation.reportDrawer.confirmedToast":
    "{name}: {verb}. A pessoa foi notificada.",

  "moderation.appealDrawer.label": "Recurso — {name}",
  "moderation.appealDrawer.chooseToast": "Escolhe manter ou revogar",
  "moderation.appealDrawer.reasonRequiredToast":
    "É necessário um motivo — a pessoa vai lê-lo",
  "moderation.appealDrawer.cancelCta": "Cancelar",
  "moderation.appealDrawer.recordCta": "Registar decisão",
  "moderation.appealDrawer.originalTitle": "A decisão original",
  "moderation.appealDrawer.decidedByLine": "Decidido por {name} · {when}",
  "moderation.appealDrawer.viewOriginalCta":
    "Ver a denúncia original e a conversa",
  "moderation.appealDrawer.argumentTitle": "O argumento apresentado",
  "moderation.appealDrawer.supportersTitle": "Quem está a apoiar",
  "moderation.appealDrawer.noSupport":
    "Mais ninguém se pronunciou. Isso não conta nem a favor nem contra — muitos recursos ficam sozinhos.",
  "moderation.appealDrawer.decisionTitle": "A tua decisão",
  "moderation.appealDrawer.decisionAriaLabel": "Decisão",
  "moderation.appealDrawer.uphold": "Manter",
  "moderation.appealDrawer.upholdSub": "A decisão original mantém-se",
  "moderation.appealDrawer.overturn": "Revogar",
  "moderation.appealDrawer.overturnSub": "Anula a decisão e restaura a pessoa",
  "moderation.appealDrawer.reasonAriaLabel": "Motivo da tua decisão",
  "moderation.appealDrawer.reasonPlaceholder":
    "Explica a tua decisão por palavras tuas — a pessoa vai lê-la.",
  "moderation.appealDrawer.transparency":
    "Os recursos ficam registados como qualquer decisão. Se revogares, informamos {name} em privado e com delicadeza — sem culpabilizar.",

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
  "moderation.reasons.other": "Outro — explica abaixo",

  "moderation.priorReports.count_one": "{count} denúncia anterior",
  "moderation.priorReports.count_other": "{count} denúncias anteriores",
  "moderation.priorReports.newAccount": "Conta nova · {vouches} avais",
  "moderation.risk.atRisk": "Em risco",
  "moderation.risk.high": "Alto",
  "moderation.risk.medium": "Médio",
  "moderation.risk.low": "Baixo",
  "moderation.status.awaiting": "A aguardar",
  "moderation.status.logged": "Registada",

  "moderation.chip.outingDoxxing": "Outing / doxxing",
  "moderation.chip.harassment": "Assédio",
  "moderation.chip.vouchAbuse": "Abuso de avais",
  "moderation.chip.spam": "Spam",
  "moderation.chip.offTopic": "Fora do tópico",
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
    "Não foi possível contactar o serviço de segurança — restaurado.",
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
  "communities.grid.titleLine1": "Oito espaços,",
  "communities.grid.titleLine2": "cada um <em>bem cuidado</em>.",
  "communities.grid.sub":
    "Cada comunidade tem uma pessoa moderadora que a conhece pelo nome. A saúde é o quão estável cada uma se sente — denúncias respondidas, pessoas acompanhadas, ninguém a passar despercebido.",
  "communities.grid.newCta": "+ Nova comunidade",
  "communities.grid.newToast":
    "Criar uma nova comunidade abriria uma configuração guiada",
  "communities.grid.healthAriaLabel": "Saúde {score}, ver detalhe",
  "communities.grid.needsHand": "· precisa de uma ajuda",
  "communities.grid.stat.members": "Pessoas",
  "communities.grid.stat.activity": "Atividade",
  "communities.grid.stat.openReports": "Denúncias em aberto",
  "communities.grid.sparklineAriaLabel":
    "Tendência de saúde, mais recente {value}",

  "communities.detail.backCta": "Todas as comunidades",
  "communities.detail.stewardedBy_one":
    "Cuidada por {count} pessoa moderadora · fundada em {founded}.",
  "communities.detail.stewardedBy_other":
    "Cuidada por {count} pessoas moderadoras · fundada em {founded}.",
  "communities.detail.healthChip": "Saúde {score} · {label}",
  "communities.detail.settingsCta": "Definições",
  "communities.detail.settingsToast":
    "As definições da comunidade abririam aqui",
  "communities.detail.supportBanner.title":
    "Esta comunidade podia usar <em>uma ajuda</em>.",
  "communities.detail.supportBanner.textAlone":
    "Uma pontuação de saúde tão baixa pede apoio, não é uma marca contra quem modera. {name} está a cuidar de {members} pessoas praticamente sozinha.",
  "communities.detail.supportBanner.textThin":
    "Uma pontuação de saúde tão baixa pede apoio, não é uma marca contra quem modera. {name} está a cuidar de {members} pessoas com uma equipa reduzida.",
  "communities.detail.supportBanner.offerCta": "Oferecer apoio",
  "communities.detail.stat.members": "Pessoas",
  "communities.detail.stat.activeThisWeek": "Ativas esta semana",
  "communities.detail.stat.openReports": "Denúncias em aberto",
  "communities.detail.stat.resolvedOnTime": "Resolvidas a tempo",
  "communities.detail.tabs.queue": "Fila da comunidade",
  "communities.detail.tabs.members": "Pessoas",
  "communities.detail.tabs.settings": "Definições",
  "communities.detail.health.thriving": "próspera",
  "communities.detail.health.steady": "estável",
  "communities.detail.health.needsHand": "precisa de uma ajuda",

  "communities.queue.emptyTitle": "Nada em aberto, <em>nada por pagar</em>.",
  "communities.queue.emptyText":
    "Esta comunidade resolve tudo por si própria — um registo de {pct}% a tempo. As pessoas que a moderam raramente precisam de ti.",
  "communities.queue.moreHandled":
    "+ {count} a serem tratadas pelas próprias pessoas moderadoras da comunidade",
  "communities.queue.reviewCta": "Rever",
  "communities.members.moderatorChip": "Pessoa moderadora",
  "communities.members.seeAllCta": "Ver as {total} pessoas",

  "communities.settings.whoCanJoin": "Quem pode entrar",
  "communities.settings.moderators": "Pessoas moderadoras",
  "communities.settings.removeModAriaLabel": "Remover {name}",
  "communities.settings.addModCta": "+ Adicionar",
  "communities.settings.addModToast":
    "Procurar pessoas para adicionar à moderação",
  "communities.settings.modRemovedToast": "Removemos {name} da moderação",
  "communities.settings.secondVouch.title":
    "Exigir um segundo aval para entrar",
  "communities.settings.secondVouch.sub":
    "Torna o crescimento mais lento, aumenta a confiança. Recomendado para espaços de apoio.",
  "communities.settings.secondVouch.onToast":
    "Segundo aval agora obrigatório para entrar",
  "communities.settings.secondVouch.offToast":
    "Segundo aval deixou de ser obrigatório",
  "communities.settings.autoFreeze.title":
    "Congelar automaticamente contas novas numa denúncia de doxxing",
  "communities.settings.autoFreeze.sub":
    "Ganha tempo para uma pessoa rever antes de o dano se espalhar.",
  "communities.settings.autoFreeze.onToast":
    "Congelamento automático em denúncias de doxxing ativado",
  "communities.settings.autoFreeze.offToast":
    "Congelamento automático desativado",
  "communities.settings.codeOfCare": "Código de cuidado",
  "communities.settings.viewCta": "Ver",
  "communities.settings.codeToast": "O código de cuidado abriria aqui",
  "communities.settings.visibility": "Visibilidade",
  "communities.settings.visibility.private": "Privada",
  "communities.settings.visibility.public": "Pública",
  "communities.settings.visibility.network": "Só na rede",

  "communities.health.modalTitle": "Porquê <em>{score}</em>?",
  "communities.health.howCalculatedCta": "Como é calculada",
  "communities.health.howCalculatedToast":
    "A saúde é uma combinação ponderada de quatro sinais, recalculada todas as noites",
  "communities.health.offerSupportCta": "Oferecer apoio",
  "communities.health.closeCta": "Fechar",
  "communities.health.intro":
    "A saúde é uma combinação de quatro sinais, ponderada pelo tamanho da comunidade. É um termómetro, não uma nota —",
  "communities.health.breakdown.memberActivity.name": "Atividade das pessoas",
  "communities.health.breakdown.memberActivity.desc":
    "O quão viva a comunidade parece — publicações, respostas, presença",
  "communities.health.breakdown.reportResolution.name":
    "Resolução de denúncias",
  "communities.health.breakdown.reportResolution.desc":
    "Percentagem de denúncias resolvidas dentro do prazo (SLA)",
  "communities.health.breakdown.memberSentiment.name": "Sentimento das pessoas",
  "communities.health.breakdown.memberSentiment.desc":
    "Sondagens discretas e sinais de reação",
  "communities.health.breakdown.safetyLoad.name": "Carga de segurança",
  "communities.health.breakdown.safetyLoad.desc":
    "Inverso das denúncias de dano em relação à dimensão",
  "communities.health.narrative.strong":
    "Uma pontuação forte e equilibrada. Nada aqui precisa da tua atenção — continua a fazer o que resulta.",
  "communities.health.narrative.healthy":
    "Saudável no geral, com uma ou duas áreas a merecer um olhar atento.",
  "communities.health.narrative.dragging":
    "O sentimento e a carga de segurança estão a puxar a pontuação para baixo. É exatamente aqui que um pouco de apoio da equipa faz toda a diferença.",

  "communities.support.modalTitle": "Dar uma ajuda a <em>{name}</em>",
  "communities.support.intro":
    "Escolhe como ajudar. Podes escolher mais do que uma opção — quem modera vai ver exatamente o que ofereceste.",
  "communities.support.noteLabel": "Uma nota para quem modera (opcional)",
  "communities.support.notePlaceholder":
    "Vimos a pontuação a descer — o que ajudaria mesmo agora?",
  "communities.support.cancelCta": "Cancelar",
  "communities.support.sendCta": "Enviar apoio",
  "communities.support.sentToast": "Apoio enviado à equipa de {name}",
  "communities.support.withdrawnToast": "Pedido de apoio retirado",
  "communities.support.option.message.title": "Enviar mensagem à moderação",
  "communities.support.option.message.sub":
    "Um contacto próximo com {names} — como podemos ajudar?",
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
    "De onde vem o dinheiro, para onde vai, cada mudança de regras e cada ação que uma pessoa moderadora já tomou — tudo aberto às pessoas que nos financiam.",
  "governance.header.publishCta": "Publicar relatório",
  "governance.header.publishToast":
    "Relatório de transparência em fila — as pessoas serão notificadas quando for publicado.",
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
    "{amount} / mês — cada euro justificado, linha a linha.",

  "governance.chart.title": "Receita vs. despesa <em>por trimestre</em>",
  "governance.chart.sub":
    "A diferença é o excedente — vai diretamente para a reserva.",
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
    "Cada euro vem das pessoas, nunca de publicidade ou venda de dados. <em>Nunca vamos vender dados de ninguém</em> — está escrito na nossa constituição, não é só uma promessa.",
  "governance.mrrPanel.breakdown.care": "Cuidado",
  "governance.mrrPanel.breakdown.platform": "Plataforma",
  "governance.mrrPanel.breakdown.mutualAid": "Entreajuda",
  "governance.mrrPanel.breakdown.health": "Saúde",
  "governance.mrrPanel.breakdown.magazine": "Revista",
  "governance.mrrPanel.readCta": "Ler a constituição",

  "governance.policy.versionsTitle": "Versões do <em>Código de Cuidado</em>",
  "governance.policy.versionsSub":
    "Cada mudança em como nos protegemos, datada e aberta.",
  "governance.policy.seeDiffCta": "Ver o que mudou",
  "governance.policy.principlesTitle": "Os nossos <em>princípios</em>",
  "governance.policy.transparencyNote":
    "As mudanças de política são propostas em aberto e ratificadas na assembleia da comunidade. Qualquer pessoa pode ler o histórico completo de edições — nada aqui é decidido à porta fechada.",
  "governance.policy.principle.noSell": "Nunca vamos vender dados de ninguém.",
  "governance.policy.principle.visibility":
    "A visibilidade é sempre escolha da pessoa.",
  "governance.policy.principle.noSilent":
    "Sem remoções silenciosas — cada ação carrega um motivo.",
  "governance.policy.principle.accessNeverConditional":
    "O acesso nunca depende da capacidade de pagar.",

  "governance.diff.eyebrow": "Mudança de política",
  "governance.diff.title": "v4.1 → <em>v4.2</em>",
  "governance.diff.closeCta": "Fechar",
  "governance.diff.readFullCta": "Ler a v4.2 completa",
  "governance.diff.introTitle": "Secção 3 — Dano que tratamos como urgente.",
  "governance.diff.introDate": "Ratificado a 12 jun 2026, 89% a favor.",
  "governance.diff.note":
    "Proposto pelas pessoas moderadoras de Trans & Friends · votado por toda a comunidade na Assembleia Anual.",

  "governance.audit.title": "Cada ação, <em>registada</em>",
  "governance.audit.metaZero": "0 de {total} entradas",
  "governance.audit.metaMatch": "{count} correspondem · {total} no total",
  "governance.audit.exportToast": "Exportadas {total} entradas em CSV",
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
  "governance.audit.actionType.removed": "Remoção",
  "governance.audit.actionType.restricted": "Restrição",
  "governance.audit.actionType.warned": "Aviso",
  "governance.audit.actionType.dismissed": "Rejeição",
  "governance.audit.actionType.verified": "Verificação",
  "governance.audit.actionType.appeal": "Recurso",
  "governance.audit.actionType.policy": "Política",
  "governance.audit.actionType.froze": "Congelamento",
  "governance.audit.range.today": "Hoje",
  "governance.audit.range.thisWeek": "Esta semana",
  "governance.audit.range.thisQuarter": "Este trimestre",
  "governance.audit.emptyTitle": "Nenhuma entrada corresponde",
  "governance.audit.emptyText":
    "Tenta alargar os filtros — o registo completo tem {total} ações desde 2023.",
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
    "Organizações que se candidataram a parceria com a QueerPulse. Lê o que fazem e depois aprova-as para a página pública de parceiros ou deixa a candidatura de lado — com uma nota que vão ler.",
  "partners.forbidden": "Esta fila é apenas para administração.",
  "partners.loadError": "A fila não carregou desta vez — tenta novamente.",
  "partners.errorToast":
    "Não foi possível guardar essa decisão — tenta novamente",
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
    "Está tudo em dia — os novos pedidos vão aparecer aqui.",
  "modPanel.requests.requestedAgo": "Pedido feito há {time}",
  "modPanel.requests.approveCta": "Aprovar",
  "modPanel.requests.declineCta": "Recusar",
  "modPanel.requests.approvedToast":
    "Aprovámos {name} — dá-lhe as boas-vindas.",
  "modPanel.requests.declinedToast":
    "O pedido de {name} não foi aprovado desta vez.",
  "modPanel.requests.approvedAllToast":
    "Todos os {count} pedidos foram aprovados — a comunidade cresce.",

  "modPanel.reports.sectionLabel": "Publicações denunciadas",
  "modPanel.reports.emptyTitle": "Tudo limpo",
  "modPanel.reports.emptyDesc":
    "Nada foi sinalizado — a comunidade cuida de si própria.",
  "modPanel.reports.metaLine":
    "De {author} · sinalizado por {reporter} · há {time}",
  "modPanel.reports.removeCta": "Remover publicação",
  "modPanel.reports.warnCta": "Avisar autoria",
  "modPanel.reports.dismissCta": "Rejeitar",
  "modPanel.reports.escalateCta": "Escalar para a equipa",
  "modPanel.reports.removedToast":
    "Publicação removida. A autoria foi notificada.",
  "modPanel.reports.warnedToast": "Enviámos um aviso a {name}.",
  "modPanel.reports.dismissedToast": "Denúncia rejeitada.",
  "modPanel.reports.escalatedToast":
    "Escalado para a equipa da QueerPulse — está agora na fila da plataforma.",

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
  "modPanel.settings.dangerZone": "Zona de risco",
  "modPanel.settings.irreversible": "Ações irreversíveis",
  "modPanel.settings.archive.title": "Arquivar comunidade",
  "modPanel.settings.archive.desc":
    "As pessoas mantêm o histórico, mas novas publicações ficam desativadas.",
  "modPanel.settings.archive.cta": "Arquivar",
  "modPanel.settings.archive.toast":
    "Comunidade arquivada. As pessoas foram notificadas.",
  "modPanel.settings.transfer.title": "Transferir propriedade",
  "modPanel.settings.transfer.desc":
    "Entrega a comunidade a outra pessoa. Vais perder as permissões de fundadora.",
  "modPanel.settings.transfer.cta": "Transferir",
  "modPanel.settings.transfer.toast":
    "Transferência de propriedade iniciada — a nova pessoa responsável vai receber um convite.",

  // ── Rede de avais (visualização da rede de confiança) ─────────────────────
  "vouchGraph.modes.network": "Rede",
  "vouchGraph.modes.scenes": "Cenas",
  "vouchGraph.modes.safety": "Segurança",
  "vouchGraph.pathbar.stepPath_one": "caminho de confiança de {count} passo:",
  "vouchGraph.pathbar.stepPath_other":
    "caminho de confiança de {count} passos:",
  "vouchGraph.pathbar.noPath": "Sem caminho de confiança entre {a} e {b}",
  "vouchGraph.pathbar.fromHint":
    "Caminho a partir de {name} — shift-clique numa segunda pessoa",
  "vouchGraph.pathbar.clear": "limpar",

  "vouchGraph.legend.safety.ring": "Anel suspeito",
  "vouchGraph.legend.safety.isolated": "Isolada em confiança",
  "vouchGraph.legend.safety.reported": "Tem denúncias",
  "vouchGraph.legend.safety.withdrawn": "Aval retirado",
  "vouchGraph.legend.plain.trusted": "De confiança",
  "vouchGraph.legend.plain.verified": "Verificada",
  "vouchGraph.legend.plain.mutual": "Aval mútuo",
  "vouchGraph.legend.plain.anonymous": "Anónima",
  "vouchGraph.legend.plain.private": "Rede privada",

  "vouchGraph.modal.ariaLabel": "Rede de confiança",
  "vouchGraph.modal.eyebrow": "Rede de confiança",
  "vouchGraph.modal.searchPlaceholder": "Encontrar uma pessoa…",
  "vouchGraph.modal.searchAriaLabel": "Encontrar uma pessoa",
  "vouchGraph.modal.replayCta": "Rever",
  "vouchGraph.modal.timeCutAriaLabel": "Corte temporal",
  "vouchGraph.modal.verifyToast":
    "Base de confiança associada — a abrir verificação",
  "vouchGraph.modal.citeToast":
    "Caminho de confiança citado no registo de auditoria",
  "vouchGraph.modal.privateToast": "Esta pessoa mantém a rede privada",

  "vouchGraph.inspector.emptyTitle": "Escolhe alguém",
  "vouchGraph.inspector.emptyBody":
    "Clica num nó para ver quem confia nessa pessoa e em que se baseia essa confiança. Faz duplo clique para percorrer a rede a partir daí.",
  "vouchGraph.inspector.sealed":
    "Identidade anterior selada — só o nome escolhido",
  "vouchGraph.inspector.ringBanner.title": "Parte de um anel de avais suspeito",
  "vouchGraph.inspector.ringBanner.body":
    "Cinco contas criadas numa hora, a avalizarem-se apenas entre si — um ciclo fechado sem confiança externa.",
  "vouchGraph.inspector.isolationBanner.title": "Isolamento de confiança",
  "vouchGraph.inspector.isolationBanner.body":
    "Todos os avais que esta pessoa tem vêm de contas novas ou sinalizadas. Verifica com cuidado redobrado.",
  "vouchGraph.inspector.reportsBanner.title_one": "{count} denúncia registada",
  "vouchGraph.inspector.reportsBanner.title_other":
    "{count} denúncias registadas",
  "vouchGraph.inspector.reportsBanner.body":
    "Consulta o histórico de moderação desta pessoa antes de agires.",
  "vouchGraph.inspector.privateBanner.title": "Rede mantida privada",
  "vouchGraph.inspector.privateBanner.body":
    "Esta pessoa escolheu esconder a sua rede de avais. Respeita isso — não tentes contornar.",
  "vouchGraph.inspector.anonBanner.title": "Identidade protegida",
  "vouchGraph.inspector.anonBanner.body":
    "Uma pessoa avalizadora anónima. A identidade está protegida e não pode ser revelada.",
  "vouchGraph.inspector.vouchesIn": "avais recebidos",
  "vouchGraph.inspector.vouchesOut": "avais dados",
  "vouchGraph.inspector.joined": "entrou",
  "vouchGraph.inspector.vouchedForBy": "Avalizada por",
  "vouchGraph.inspector.hasVouchedFor": "Avalizou",
  "vouchGraph.inspector.withdrawn": "Retirados",
  "vouchGraph.inspector.none": "Ainda nenhum.",
  "vouchGraph.inspector.mutualTag": "mútuo",
  "vouchGraph.inspector.affectedTitle": "Se removesses {name}",
  "vouchGraph.inspector.affectedCount_one":
    "{count} pessoa perderia um aval desta pessoa.",
  "vouchGraph.inspector.affectedCount_other":
    "{count} pessoas perderiam um aval desta pessoa.",
  "vouchGraph.inspector.affectedPendingNote":
    " Incluindo pessoas pendentes que dependem dele.",
  "vouchGraph.inspector.ownVouchesStay_one":
    "O aval que ela deu continua válido. Pesa o custo humano antes de agires.",
  "vouchGraph.inspector.ownVouchesStay_other":
    "Os {count} avais que ela deu continuam válidos. Pesa o custo humano antes de agires.",
  "vouchGraph.inspector.useAsVerificationCta": "Usar como base de verificação",
  "vouchGraph.inspector.expandCta": "Expandir rede",
  "vouchGraph.inspector.collapseCta": "Colapsar rede",
  "vouchGraph.inspector.citeCta": "Citar no registo de auditoria",

  "vouchGraph.tooltip.vouchesIn_one": "{count} aval recebido",
  "vouchGraph.tooltip.vouchesIn_other": "{count} avais recebidos",
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
    "Vista de segurança: anéis, isolamento e denúncias ficam à vista. Os grupos vermelhos são ciclos fechados de avais.",
  "vouchGraph.canvas.zoomIn": "Ampliar",
  "vouchGraph.canvas.zoomOut": "Reduzir",
  "vouchGraph.canvas.fitToView": "Ajustar à vista",
  "vouchGraph.canvas.resetLayout": "Repor disposição",

  "vouchGraph.graph.ariaLabel":
    "Rede de avais: {count} pessoas ligadas a {initials}",
  "vouchGraph.preview.ariaLabel_one":
    "Rede de confiança de {name}: {count} ligação de aval direta",
  "vouchGraph.preview.ariaLabel_other":
    "Rede de confiança de {name}: {count} ligações de aval diretas",
};
