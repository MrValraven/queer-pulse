import type { Catalog } from "../../types";

/**
 * Cópia das notificações, indexada pelo valor do `notifications_type_enum` do
 * backend. A API envia `type` + `payload` e nenhum texto — é esta cópia que a
 * pessoa lê. Ver `en/notifications.ts` para as notas de contrato.
 *
 * Registo: tu (nunca você). Formas inclusivas por reformulação neutra primeiro
 * — nenhuma destas frases concorda em género com a pessoa destinatária. Ver
 * `docs/i18n/glossary-pt.md`: Gatherings → Convívios, Vouch → dar um voto de confiança,
 * "bem-vinde" como forma neutra.
 */
export const notifications: Catalog = {
  "type.connection_request.text": "Alguém quer ligar-se a ti.",
  "type.connection_request.textNamed":
    "<profile>{name}</profile> quer ligar-se a ti.",
  "type.connection_request.meta": "Pedido de ligação",

  "type.connection_accepted.text": "O teu pedido de ligação foi aceite.",
  "type.connection_accepted.textNamed":
    "<profile>{name}</profile> aceitou o teu pedido de ligação.",
  "type.connection_accepted.meta": "Ligação",

  "type.vouch_received.text": "Alguém te deu um voto de confiança.",
  "type.vouch_received.textNamed":
    "<profile>{name}</profile> deu-te um voto de confiança.",
  "type.vouch_received.meta": "Voto de confiança",

  // Enviada a quem gere o espaço quando alguém lhe dá um voto de confiança. Um
  // voto de confiança anónimo não resolve autor e mantém o `.text` genérico
  // (nunca o nomeia).
  "type.safe_space_vouch.text":
    "Alguém deu um voto de confiança ao teu espaço seguro.",
  "type.safe_space_vouch.textNamed":
    "<profile>{name}</profile> deu um voto de confiança ao teu espaço seguro.",
  "type.safe_space_vouch.meta": "Espaço seguro",

  // Enviada quando uma nova casa fica disponível e corresponde a uma procura
  // guardada com alertas ativos. Do sistema (sem autor); `title`/`area` vêm do payload.
  "type.housing_listing_match.text":
    "Uma nova casa em {area} corresponde à tua procura guardada: {title}.",
  "type.housing_listing_match.meta": "Alerta de casa",

  "type.promoted_to_member.text": "Já fazes parte da comunidade. Bem-vinde.",
  "type.promoted_to_member.meta": "Adesão",

  // `new_message` (linha "Tens uma nova mensagem" no centro de notificações) foi
  // descontinuado: os avisos de MD só aparecem no distintivo do ícone de
  // mensagens e nas notificações push, nunca aqui.

  "type.introduction_made.text":
    "Uma apresentação que fizeste foi concretizada.",
  "type.introduction_made.textNamed":
    "Uma apresentação que fizeste a <profile>{name}</profile> foi concretizada.",
  "type.introduction_made.meta": "Apresentação",

  "type.mention.text": "Foste mencionado numa discussão.",
  "type.mention.textNamed":
    "<profile>{name}</profile> mencionou-te numa discussão.",
  "type.mention.meta": "Menção",

  // As notificações "mention" ramificam consoante `payload.entityKind` — o
  // que foi mencionado, não quem. O "type.mention.*" acima cobre uma pessoa
  // (e qualquer registo antigo de antes de existir `entityKind`); estas
  // cobrem o resto.
  "type.mention.community.text":
    "A tua comunidade c/{entityRef} foi mencionada numa discussão.",
  "type.mention.community.textNamed":
    "<profile>{name}</profile> mencionou a tua comunidade c/{entityRef}.",
  "type.mention.community.meta": "Menção de comunidade",

  "type.mention.business.text":
    "O teu negócio b/{entityRef} foi mencionado numa discussão.",
  "type.mention.business.textNamed":
    "<profile>{name}</profile> mencionou o teu negócio b/{entityRef}.",
  "type.mention.business.meta": "Menção de negócio",

  "type.mention.event.text":
    "O teu convívio e/{entityRef} foi mencionado numa discussão.",
  "type.mention.event.textNamed":
    "<profile>{name}</profile> mencionou o teu convívio e/{entityRef}.",
  "type.mention.event.meta": "Menção de convívio",

  "type.mention.thread.text":
    "O teu tópico t/{entityRef} foi mencionado numa discussão.",
  "type.mention.thread.textNamed":
    "<profile>{name}</profile> mencionou o teu tópico t/{entityRef}.",
  "type.mention.thread.meta": "Menção de tópico",

  "type.forum_reply.text": "Alguém respondeu ao teu comentário.",
  "type.forum_reply.textNamed":
    "<profile>{name}</profile> respondeu ao teu comentário.",
  "type.forum_reply.meta": "Resposta",

  "type.event_invite.text": "Tens um convite para um convívio.",
  "type.event_invite.textNamed":
    "<profile>{name}</profile> convidou-te para um convívio.",
  "type.event_invite.meta": "Convite para convívio",

  "type.event_cohost_invite.text":
    "Tens um convite para coanfitriar um convívio.",
  "type.event_cohost_invite.textNamed":
    "<profile>{name}</profile> convidou-te para coanfitriar um convívio.",
  "type.event_cohost_invite.meta": "Convite para coanfitriar",

  "type.event_reminder.text":
    "Está a aproximar-se um convívio em que vais estar.",
  "type.event_reminder.meta": "Lembrete de convívio",

  "type.waitlist_promoted.text":
    "Abriu uma vaga. Já não estás em lista de espera.",
  "type.waitlist_promoted.meta": "Lista de espera",

  "type.event_cancelled.text": "Um convívio em que vais estar foi cancelado.",
  "type.event_cancelled.meta": "Atualização de convívio",

  "type.event_updated.text":
    "Mudaram detalhes de um convívio em que vais estar.",
  "type.event_updated.meta": "Atualização de convívio",
  "type.event_updated.time.text":
    "Mudou a hora de início de um convívio em que vais estar.",
  "type.event_updated.time.meta": "Atualização de convívio",
  "type.event_updated.location.text":
    "Mudou o local de um convívio em que vais estar.",
  "type.event_updated.location.meta": "Atualização de convívio",

  // Cobertura alargada de notificações. As personalizadas têm o campo
  // `<profile>{name}</profile>` em `textNamed`; as geradas pelo sistema
  // (pedido aprovado/recusado, registo aprovado, denúncia/recurso/roteiro) não
  // têm autor e por isso só têm `.text` genérico.
  "type.event_rsvp.text": "Alguém confirmou presença no teu convívio.",
  "type.event_rsvp.textNamed":
    "<profile>{name}</profile> confirmou presença no teu convívio.",
  "type.event_rsvp.meta": "Presença em convívio",

  "type.community_reply.text": "Alguém respondeu à tua publicação.",
  "type.community_reply.textNamed":
    "<profile>{name}</profile> respondeu à tua publicação.",
  "type.community_reply.meta": "Resposta",

  "type.forum_thread_reply.text": "Alguém respondeu ao teu tópico.",
  "type.forum_thread_reply.textNamed":
    "<profile>{name}</profile> respondeu ao teu tópico.",
  "type.forum_thread_reply.meta": "Resposta",

  // Enviada a quem segue um tópico quando aparece uma nova publicação nele
  // (uma conversa do fórum com essa etiqueta). {topicLabel} vem do payload.
  "type.topic_new_post.text":
    "Alguém publicou num tópico que segues: {topicLabel}.",
  "type.topic_new_post.textNamed":
    "<profile>{name}</profile> publicou num tópico que segues: {topicLabel}.",
  "type.topic_new_post.meta": "Atualização de tópico",

  "type.join_request_received.text":
    "Alguém pediu para entrar na tua comunidade.",
  "type.join_request_received.textNamed":
    "<profile>{name}</profile> pediu para entrar na tua comunidade.",
  "type.join_request_received.meta": "Pedido de entrada",

  "type.join_request_approved.text":
    "Estás dentro. O teu pedido para entrar foi aprovado.",
  "type.join_request_approved.meta": "Pedido de entrada",

  "type.join_request_declined.text":
    "O teu pedido para entrar não foi aceite desta vez.",
  "type.join_request_declined.meta": "Pedido de entrada",

  "type.job_application.text": "Alguém candidatou-se à tua oferta de trabalho.",
  "type.job_application.textNamed":
    "<profile>{name}</profile> candidatou-se à tua oferta de trabalho.",
  "type.job_application.meta": "Candidatura",

  "type.listing_approved.text": "O teu registo de negócio já está no ar.",
  "type.listing_approved.meta": "Registo aprovado",

  "type.report_resolved.text": "Demos seguimento a uma denúncia que fizeste.",
  "type.report_resolved.meta": "Atualização de denúncia",

  // Aviso de serviço para quem pode agir sobre uma nova denúncia. O sino nunca
  // identifica quem a apresentou, por isso esta copy também não o faz. As
  // variantes `.emergency.*` são exposição e divulgação de dados pessoais, os
  // dois motivos com prazo de uma hora.
  "type.report_filed.text":
    "Há uma nova denúncia à espera na fila de moderação.",
  "type.report_filed.meta": "Denúncia apresentada",
  "type.report_filed.emergency.text":
    "Uma denúncia urgente precisa de uma decisão dentro de uma hora.",
  "type.report_filed.emergency.meta": "Denúncia urgente",

  "type.community_report_filed.text": "Algo em {communityName} foi denunciado.",
  "type.community_report_filed.meta": "Denúncia na tua comunidade",
  // OPS-05. Chega a quem tem a comunidade a seu cargo quando a equipa da
  // plataforma oferece ajuda. Só na aplicação e por push: a QueerPulse não
  // envia e-mail nenhum.
  "type.community_support_offered.text":
    "Alguém da QueerPulse ofereceu ajuda a {communityName}.",
  "type.community_support_offered.meta": "Uma oferta de apoio",
  "type.community_report_filed.emergency.text":
    "Uma denúncia urgente em {communityName} precisa de uma decisão dentro de uma hora.",
  "type.community_report_filed.emergency.meta": "Denúncia urgente",

  // ── Remoção de uma comunidade (TS-10) ────────────────────────────────────
  // O payload não nomeia nenhum moderador, por isso esta cópia também não o
  // faz. Traz os termos, porque o sino é o único sítio onde a pessoa os pode
  // ler: a QueerPulse não envia email e não há forma de contactar a moderação
  // de uma comunidade. Uma pausa com prazo e uma remoção definitiva têm frases
  // separadas. Reformulação neutra: nenhuma concorda em género.
  "type.community_banned.permanent.text":
    "Já não fazes parte de {communityName}. O motivo indicado: {reason}",
  "type.community_banned.permanent.meta": "Remoção de uma comunidade",
  "type.community_banned.permanent.rule.text":
    "Já não fazes parte de {communityName}, ao abrigo da regra \u201c{ruleText}\u201d. O motivo indicado: {reason}",
  "type.community_banned.permanent.rule.meta": "Remoção de uma comunidade",
  "type.community_banned.timed.text":
    "Não podes publicar em {communityName} até {expiresAt}. O motivo indicado: {reason}",
  "type.community_banned.timed.meta": "Pausa numa comunidade",
  "type.community_banned.timed.rule.text":
    "Não podes publicar em {communityName} até {expiresAt}, ao abrigo da regra \u201c{ruleText}\u201d. O motivo indicado: {reason}",
  "type.community_banned.timed.rule.meta": "Pausa numa comunidade",
  "type.community_banned.whenFallback": "uma data que não ficou registada",

  // ── Conta e segurança (ID-06) ────────────────────────────────────────────
  // As únicas linhas deste catálogo sobre a CONTA e não sobre a comunidade.
  //
  // Duas regras mandam na redação, ambas sobre o que se lê num ecrã bloqueado
  // antes sequer de decidir desbloquear o telemóvel:
  //  - Nada aqui nomeia o tema da QueerPulse, outra pessoa, ou qualquer
  //    conteúdo. Uma pré-visualização de push que exponha alguém seria um dano
  //    criado por esta funcionalidade, não evitado por ela.
  //  - Nada aqui promete email. A QueerPulse não envia nenhum. Os canais são
  //    este sino e as notificações push.
  //
  // `{deviceLabel}` é o nome grosso guardado no servidor ("Chrome on macOS") e
  // `{when}` é resolvido por `signInTimeToken` na língua de quem lê.
  "type.security_new_sign_in.text":
    "A tua conta iniciou sessão em {deviceLabel}, {when}. Se foste tu, não tens de fazer nada.",
  "type.security_new_sign_in.deviceFallback":
    "um dispositivo que não reconhecemos",
  "type.security_new_sign_in.meta": "Novo dispositivo com sessão iniciada",
  // Usado quando não se consegue ler a hora do início de sessão. Vago de
  // propósito: uma hora errada num alerta de segurança é pior do que hora
  // nenhuma.
  "type.security_new_sign_in.whenFallback": "há pouco",
  // A linha de ecrã bloqueado para o mesmo alerta. De propósito mais curta e
  // mais vaga do que o texto do sino: uma pré-visualização de push é lida por
  // quem tiver o telemóvel na mão, por isso não nomeia dispositivo nem hora,
  // apenas que há algo para abrir.
  "type.security_new_sign_in.push":
    "Um novo dispositivo iniciou sessão na tua conta.",

  "type.account_export_ready.text":
    "A exportação dos teus dados terminou e está pronta para transferir.",
  "type.account_export_ready.meta": "Exportação pronta",

  // `{daysRemaining}` vem diretamente do payload. Redigido à volta do que
  // ainda se pode fazer, porque durante estes dias ainda se pode.
  // Flat form, for a row whose payload carries no readable day count. The
  // plural forms below win whenever it does.
  "type.account_deletion_final_warning.text":
    "A tua conta está agendada para eliminação em breve. Até lá ainda podes cancelar.",
  "type.account_deletion_final_warning.text_one":
    "A tua conta é eliminada dentro de {daysRemaining} dia. Até lá ainda podes cancelar.",
  "type.account_deletion_final_warning.text_other":
    "A tua conta é eliminada dentro de {daysRemaining} dias. Até lá ainda podes cancelar.",
  "type.account_deletion_final_warning.meta": "Eliminação agendada",

  // Cartão de sócie a trinta dias de caducar (SUS-07). `{communityName}` e
  // `{daysRemaining}` vêm diretamente do payload; `daysRemaining` também é
  // espelhado em `count` para o CLDR escolher o plural.
  //
  // Dois conjuntos, porque cada um pede uma coisa diferente. O par
  // `.renewable` é usado quando o programa deixa a pessoa renovar o próprio
  // cartão, e aponta para o botão que está à espera dela. O par simples é
  // usado quando não deixa, e aponta para a comunidade.
  "type.card_expiring.text":
    "O teu cartão de sócie caduca em breve. É a comunidade que emite o novo.",
  "type.card_expiring.text_one":
    "O teu cartão de {communityName} caduca dentro de {daysRemaining} dia. É a comunidade que emite o novo.",
  "type.card_expiring.text_other":
    "O teu cartão de {communityName} caduca dentro de {daysRemaining} dias. É a comunidade que emite o novo.",
  "type.card_expiring.meta": "Cartão a caducar",
  "type.card_expiring.renewable.text":
    "O teu cartão de sócie caduca em breve. Podes renová-lo tu.",
  "type.card_expiring.renewable.text_one":
    "O teu cartão de {communityName} caduca dentro de {daysRemaining} dia. Podes renová-lo tu.",
  "type.card_expiring.renewable.text_other":
    "O teu cartão de {communityName} caduca dentro de {daysRemaining} dias. Podes renová-lo tu.",
  "type.card_expiring.renewable.meta": "Cartão a caducar",

  "type.appeal_resolved.text": "Há uma decisão sobre o teu recurso.",
  "type.appeal_resolved.meta": "Atualização de recurso",

  "type.invite_accepted.text": "Alguém que convidaste acabou de entrar.",
  "type.invite_accepted.textNamed":
    "<profile>{name}</profile> entrou com o teu convite.",
  "type.invite_accepted.meta": "Convite aceite",

  "type.listing_review.text": "Alguém avaliou o teu negócio.",
  "type.listing_review.textNamed":
    "<profile>{name}</profile> avaliou o teu negócio.",
  "type.listing_review.meta": "Nova avaliação",

  "type.roadmap_status.text": "Há novidades sobre uma ideia que partilhaste.",
  "type.roadmap_status.meta": "Atualização do roteiro",

  // Uma edição da revista publicada (CON-05). `{issueNumber}` e `{issueTitle}`
  // vêm diretamente do payload. Isto substituiu um digest por email, por isso o
  // texto nomeia a página e mais nada: não vai nada a caminho.
  "type.magazine_issue_published.text":
    "A edição {issueNumber} saiu: {issueTitle}. Vê o que traz.",
  "type.magazine_issue_published.meta": "Nova edição",

  // Desfecho de uma preocupação — título por estado terminal
  // (resolvida/descartada); as chaves simples são o recurso alternativo.
  "type.concern_update.text":
    "Há novidades sobre uma preocupação que levantaste.",
  "type.concern_update.meta": "Atualização de preocupação",
  "type.concern_update.resolved.text":
    "A preocupação que levantaste foi analisada e resolvida.",
  "type.concern_update.resolved.meta": "Atualização de preocupação",
  "type.concern_update.dismissed.text":
    "A preocupação que levantaste foi analisada e encerrada.",
  "type.concern_update.dismissed.meta": "Atualização de preocupação",

  // ── Desfecho de formulários enviados ─────────────────────────────────────
  // Todos os formulários da tabela `intake_submissions` EXCETO uma preocupação
  // de governação, que mantém o texto de `concern_update` acima. Estes andavam
  // a usá-lo emprestado, por isso quem enviava uma playlist à Cultura lia que a
  // sua "preocupação" tinha sido analisada. `{form}` é resolvido por
  // `intakeFormToken` a partir do `kind` do payload, para a linha nomear o
  // formulário que a pessoa preencheu mesmo.
  "type.intake_reviewed.text": "Analisámos o que nos enviaste.",
  "type.intake_reviewed.meta": "Submissão analisada",
  "type.intake_reviewed.resolved.text":
    "Analisámos {form} e vamos avançar com isso.",
  "type.intake_reviewed.resolved.meta": "Submissão analisada",
  "type.intake_reviewed.dismissed.text":
    "Analisámos {form}. Desta vez não vamos avançar.",
  "type.intake_reviewed.dismissed.meta": "Submissão analisada",
  // Um por cada tipo de formulário do backend. Cada um funciona como
  // complemento de "Analisámos …", por isso ficam em minúsculas.
  "type.intake_reviewed.form.grant": "a tua candidatura a microfinanciamento",
  "type.intake_reviewed.form.suggest_edit": "a tua sugestão de correção",
  "type.intake_reviewed.form.sober_host": "a tua listagem sem álcool",
  "type.intake_reviewed.form.panel_signup": "a tua inscrição no painel",
  "type.intake_reviewed.form.incubator_cohort":
    "a tua candidatura à coorte da incubadora",
  "type.intake_reviewed.form.incubator_mentor":
    "a tua inscrição como pessoa mentora",
  "type.intake_reviewed.form.incubator_session": "o teu pedido de sessão",
  "type.intake_reviewed.form.culture_suggest_pick": "a tua sugestão",
  "type.intake_reviewed.form.culture_post_project":
    "a publicação do teu projeto",
  "type.intake_reviewed.form.culture_submit_work": "o trabalho que enviaste",
  "type.intake_reviewed.form.culture_submit_playlist": "a tua playlist",
  // Usado quando o payload nomeia um formulário que este catálogo ainda não
  // conhece.
  "type.intake_reviewed.formFallback": "o que nos enviaste",

  // ── Desfecho de um pedido de acesso a dados ──────────────────────────────
  // Um direito legal sobre dados, comunicado como tal. Também andava a usar
  // `concern_update` emprestado. `{reference}` é o número do processo da própria
  // pessoa, o mesmo que a página de pedido de dados lista no histórico, que é
  // para onde a linha liga. Nada aqui promete email: a QueerPulse não envia
  // nenhum.
  "type.dsar_resolved.text":
    "Há uma decisão sobre o pedido de dados que fizeste.",
  "type.dsar_resolved.meta": "Pedido de dados",
  "type.dsar_resolved.resolved.text":
    "O teu pedido de dados está concluído. Referência: {reference}.",
  "type.dsar_resolved.resolved.meta": "Pedido de dados",
  "type.dsar_resolved.rejected.text":
    "O teu pedido de dados foi analisado e não pôde ser satisfeito. Referência: {reference}.",
  "type.dsar_resolved.rejected.meta": "Pedido de dados",
  // Usado quando não se consegue ler o número do processo do payload, para a
  // frase não acabar em "Referência: .".
  "type.dsar_resolved.referenceFallback": "não registada",

  // Um admin ajustou manualmente o estado de verificação do membro. Nomeia
  // apenas o nível para o qual foi movido; {level} é uma das quatro etiquetas
  // logo abaixo.
  "type.verification_update.text":
    "O teu nível de verificação foi atualizado para {level}.",
  "type.verification_update.meta": "Atualização de verificação",
  "type.verification_update.level.none": "Nenhum",
  "type.verification_update.level.email": "Email",
  "type.verification_update.level.phone": "Telefone",
  "type.verification_update.level.id_verified": "Identidade verificada",
  // Recurso alternativo para um `toLevel` que esta versão não reconhece.
  "type.verification_update.levelFallback": "um novo nível",

  // O pedido de verificação do próprio membro foi aprovado. Reutiliza as
  // mesmas etiquetas de {level} da cópia acima, a partir de `requestedLevel`,
  // já que uma aprovação concede sempre o nível que foi pedido.
  "type.verification_update.approved.text":
    "O teu pedido de verificação foi aprovado. O teu nível de verificação é agora {level}.",
  "type.verification_update.approved.meta": "Atualização de verificação",

  // O pedido de verificação do próprio membro foi recusado. Nenhum nível
  // mudou, por isso a cópia nunca nomeia um. {reason} é a nota do admin a
  // explicar a decisão.
  "type.verification_update.rejected.text":
    "O teu pedido de verificação foi recusado.",
  "type.verification_update.rejected.meta": "{reason}",
  // Recurso alternativo para uma recusa sem motivo no payload (não deveria
  // acontecer — o backend exige um para recusar — mas a leitura é defensiva).
  "type.verification_update.rejected.reasonFallback":
    "Não foi partilhado um motivo.",

  // Resultado de moderação — título por ação; a nota da equipa dirigida ao
  // membro ("a razão que o membro lê") entra como {note}. Ao tocar, abre a
  // página de recurso. As chaves simples são o fallback para uma ação
  // desconhecida.
  "type.moderation_outcome.text": "Há uma decisão da equipa de moderação.",
  "type.moderation_outcome.meta": "{note}",
  "type.moderation_outcome.warn.text":
    "Recebeste um aviso da equipa de moderação.",
  "type.moderation_outcome.warn.meta": "{note}",
  "type.moderation_outcome.suspend.text": "A tua conta foi suspensa.",
  "type.moderation_outcome.suspend.meta": "{note}",
  "type.moderation_outcome.ban.text":
    "A tua conta foi suspensa permanentemente.",
  "type.moderation_outcome.ban.meta": "{note}",
  // Uma restrição levantada é boa notícia, e a frase genérica sobre "uma
  // decisão da equipa de moderação" soa a mais uma má notícia a chegar. Por
  // isso tem uma frase própria.
  "type.moderation_outcome.restriction_lifted.text":
    "A tua restrição foi levantada.",
  "type.moderation_outcome.restriction_lifted.meta": "{note}",

  // Outro membro creditou uma persona tua como colaboradora num item dele
  // (descoberta de personas, Fase 5, Momento 6). O primeiro tipo ao vivo cujo
  // `.actions` o adaptador preenche — ver `notificationDtoToView`.
  "type.subprofile_credit.text": "{subprofileName} creditou-te em {itemTitle}.",
  "type.subprofile_credit.meta": "Crédito de persona",

  // Enviada quando o motor de XP/crachás credita um membro ao ultrapassar um
  // nível. Do sistema (sem autor); {level}/{name} vêm do payload.
  "type.xp_level_up.text": "Chegaste ao Nível {level}, {name}.",
  "type.xp_level_up.meta": "Subida de nível",

  // Enviada quando o motor de XP/crachás atribui um crachá a um membro. Do
  // sistema (sem autor); {badgeName} vem do payload.
  "type.badge_earned.text": "Ganhaste o crachá {badgeName}.",
  "type.badge_earned.meta": "Crachá ganho",

  "type.writer_application_approved.text":
    "A tua candidatura a escritor foi aprovada. Já podes submeter histórias.",
  "type.writer_application_approved.meta": "Candidatura a escritor",
  "type.writer_application_declined.text":
    "A tua candidatura a escritor não foi aceite desta vez.",
  "type.writer_application_declined.meta": "Candidatura a escritor",

  "type.story_submission_decided.accepted.text":
    "A revista aceitou \u201C{workingTitle}\u201D. Abre as tuas submissões para ler a resposta da redação.",
  "type.story_submission_decided.accepted.meta": "Submissão de história",
  "type.story_submission_decided.commissioned.text":
    "\u201C{workingTitle}\u201D foi encomendada. Abre as tuas submissões para ler a resposta da redação.",
  "type.story_submission_decided.commissioned.meta": "Submissão de história",
  "type.story_submission_decided.declined.text":
    "\u201C{workingTitle}\u201D não foi aceite desta vez. Abre as tuas submissões para ler a resposta da redação.",
  "type.story_submission_decided.declined.meta": "Submissão de história",
  "type.story_submission_decided.text":
    "A revista decidiu sobre \u201C{workingTitle}\u201D.",
  "type.story_submission_decided.meta": "Submissão de história",

  "type.volunteer_application_received.text":
    "Alguém candidatou-se a uma das tuas oportunidades de voluntariado.",
  "type.volunteer_application_received.meta": "Candidatura de voluntariado",
  "type.volunteer_application_decided.accepted.text":
    "A tua candidatura de voluntariado foi aceite.",
  "type.volunteer_application_decided.accepted.meta":
    "Candidatura de voluntariado",
  "type.volunteer_application_decided.declined.text":
    "A tua candidatura de voluntariado não foi aceite desta vez.",
  "type.volunteer_application_decided.declined.meta":
    "Candidatura de voluntariado",
  "type.volunteer_application_decided.text":
    "Há uma novidade sobre a tua candidatura de voluntariado.",
  "type.volunteer_application_decided.meta": "Candidatura de voluntariado",

  "type.changemaker_nomination_approved.text":
    "A tua nomeação de {nomineeName} foi aprovada. Vamos começar a contar a história.",
  "type.changemaker_nomination_approved.meta": "Nomeação de changemaker",
  "type.changemaker_nomination_dismissed.text":
    "A tua nomeação de {nomineeName} não avançou desta vez.",
  "type.changemaker_nomination_dismissed.meta": "Nomeação de changemaker",

  // Proposta de troca numa das tuas publicações na bolsa de competências. O
  // payload só traz o id da publicação e a linha da oferta, por isso é o meta
  // que diz qual a troca e a linha encaminha para a caixa de propostas. A
  // oferta vai no `meta` e não no `textNamed`, cujo único token é `{name}`
  // (ver `NotificationItem`).
  "type.barter_proposal_received.text":
    "Alguém propôs uma troca numa das tuas publicações.",
  "type.barter_proposal_received.textNamed":
    "<profile>{name}</profile> propôs uma troca numa das tuas publicações.",
  "type.barter_proposal_received.meta":
    "Bolsa de competências · {listingOffer}",
  "type.barter_proposal_received.offerFallback": "uma troca que publicaste",

  "type.unknown.text": "Tens uma nova notificação.",
  "type.unknown.meta": "Notificação",

  // Chrome da página de notificações
  "page.title": "Notificações",
  "page.markAllRead": "Marcar tudo como lido",
  "page.markReadError":
    "Não conseguimos marcar como lido. Continua à tua espera. Tenta novamente daqui a pouco.",
  "page.markAllReadError":
    "Não conseguimos marcar como lido. Continuam à tua espera. Tenta novamente daqui a pouco.",
  "page.dayRecent": "Hoje e recentes",
  "page.dayEarlier": "Anteriores",
  "page.empty.title": "Tudo em dia",
  "page.empty.description": "Sem notificações nesta categoria.",
  "page.error.title": "Não conseguimos carregar as tuas notificações",
  "page.error.description":
    "Algo correu mal ao contactar o servidor. Isto não é uma caixa vazia. Tenta novamente daqui a pouco.",
  "page.error.retry": "Tentar novamente",
  "page.loadMoreCta": "Carregar mais notificações",
  "page.loadingMore": "A carregar…",

  // Separadores de filtro (notificationTabs em data.tsx + o separador Menções)
  // ── Linhas agrupadas (SOC-10) ─────────────────────────────────────────────
  // Acrescentado ao texto da própria linha, para que "Ana respondeu" passe a
  // "Ana respondeu e mais 39". Uma linha para uma conversa: quarenta respostas
  // eram quarenta linhas, quarenta por ler e quarenta toques para limpar.
  "bundle.others_one": "e mais 1",
  "bundle.others_other": "e mais {count}",

  "tabs.all": "Todas",
  "tabs.events": "Encontros",
  "tabs.community": "Comunidade",
  "tabs.platform": "Plataforma",
  "tabs.mentions": "Menções",

  // Rótulos de ação partilhados pela lista de notificações de demonstração
  "actions.viewThread": "Ver conversa",
  "actions.viewEvent": "Ver encontro",
  "actions.viewProfile": "Ver perfil",
  "actions.accept": "Aceitar",
  "actions.decline": "Recusar",
  "actions.readNow": "Ler agora",
  "actions.seeDetails": "Ver detalhes",
  "actions.seeBarterBoard": "Ver quadro de trocas",
  "actions.viewReplies": "Ver respostas",
  "actions.readReport": "Ler relatório",
  // Ações numa notificação subprofile_credit (descoberta de personas, Fase 5,
  // Momento 6) — o primeiro tipo ao vivo com ações.
  "actions.makePersona": "Cria uma persona para isto",
  "actions.seeTheWork": "Ver o trabalho",

  // Lista de notificações de demonstração (notificationsList.data.tsx)
  "list.2.text":
    "A tua inscrição em <strong>{title}</strong> foi confirmada. O encontro é no dia {date}, em {venue}.",
  "list.2.meta": "Encontro · Convívio",
  "list.3.text":
    "<strong>{name}</strong> convidou-te a juntares-te ao grupo de leitura <strong>{group}</strong>.",
  "list.3.meta": "Grupo de leitura · Convite",
  "list.3.joinedToast": "Juntaste-te ao grupo de leitura {group}",
  "list.3.declinedToast": "Convite recusado",
  "list.4.text":
    "<strong>{name}</strong> mencionou-te no tópico do Fórum: “{quote}”",
  "list.4.meta": "Fórum · Menção",
  "list.5.text":
    "<strong>{title}</strong> já está disponível. Destaque de capa: {cover}",
  "list.5.meta": "Revista · junho de 2026",
  "list.6.text":
    "Lembrete: o grupo de leitura <strong>{group}</strong> reúne-se {when} às {time}, na Mouraria. {spots}",
  "list.6.meta": "Grupo de leitura · Lembrete",
  "list.6.spots_one": "Ainda há {count} vaga aberta.",
  "list.6.spots_other": "Ainda há {count} vagas abertas.",
  "list.7.text": "<strong>{name}</strong> aceitou o teu pedido de ligação.",
  "list.7.meta": "Ligação",
  "list.8.text":
    "Nova funcionalidade da plataforma: <strong>{feature}</strong> já suporta pacotes de serviços. Podes oferecer pacotes de várias sessões.",
  "list.8.meta": "Atualização da plataforma",
  "list.9.text":
    "O <strong>{event}</strong> a que foste tem uma conversa de continuação marcada para {date}.",
  "list.9.meta": "Encontro · Continuação",
  "list.11.text_one":
    "O teu post no Fórum (“{postTitle}”) recebeu {count} resposta.",
  "list.11.text_other":
    "O teu post no Fórum (“{postTitle}”) recebeu {count} respostas.",
  "list.11.meta": "Fórum · Atividade",
  "list.12.text":
    "O <strong>{report}</strong> já foi publicado. As estatísticas de moderação e as contas já estão disponíveis.",
  "list.12.meta": "Governação · Relatório trimestral",
  "list.13.text":
    "<strong>{subprofileName}</strong> creditou-te em {itemTitle}.",
  "list.13.meta": "Crédito de persona",

  // Conversa de menções (MentionsPanel.tsx / mentions.data.tsx)
  "mentions.day.today": "Hoje",
  "mentions.day.yesterday": "Ontem",
  "mentions.day.thisWeek": "Esta semana",
  "mentions.eyebrow": "Menções · {handle}",
  "mentions.heading": "Quando alguém <em>te menciona.</em>",
  "mentions.lead":
    "Posts, respostas e artigos que te mencionam com @. Distinto das Notificações. Esta é só a conversa de menções.",
  "mentions.tabs.all": "Todas",
  "mentions.tabs.unread": "Não lidas",
  "mentions.tabs.posts": "Em posts",
  "mentions.tabs.articles": "Em artigos",
  "mentions.tabs.events": "Em encontros",
  "mentions.unreadSummary_one": "{count} não lida",
  "mentions.unreadSummary_other": "{count} não lidas",
  "mentions.oldestFrom": "· a mais antiga de {when}",
  "mentions.ago.justNow": "agora mesmo",
  "mentions.ago.unknown": "há pouco",
  "mentions.allCaughtUp": "Tudo em dia",
  "mentions.markAllRead": "Marcar tudo como lido",
  "mentions.markAllReadToast": "Tudo marcado como lido",
  "mentions.empty.title": "Sem menções por aqui",
  "mentions.empty.description":
    "Não há nada nesta vista por agora. Quando alguém te mencionar, aparece aqui. Não precisas de andar à procura.",
  // Live ainda não tem endpoint de caixa de menções — mostrado em vez de uma
  // lista vazia silenciosa, para ler como honestamente por terminar (MentionsPanel).
  "mentions.comingSoon.title": "As menções estão a caminho",
  "mentions.comingSoon.description":
    "Ainda estamos a construir o sítio onde cada menção @ aterra. Até lá, continuas a saber assim que alguém te mencionar.",
  "mentions.composer.placeholder": "Responder a {name}…",
  "mentions.row.read": "Lida",
  "mentions.row.going": "Vais",
  "mentions.row.rsvpGoingToast": "Vais · convite de {name}",
  "mentions.row.rsvpWithdrawnToast": "Presença retirada",
  "mentions.row.genericToast": "{label} · {name}",
  "mentions.actions.reply": "Responder",
  "mentions.actions.openThread": "Abrir conversa",
  "mentions.actions.markRead": "Marcar como lida",
  "mentions.actions.openArticle": "Abrir artigo",
  "mentions.actions.rsvp": "Confirmar presença",
  "mentions.actions.openPost": "Abrir post",
  "mentions.where.prefix": "Em",
  "mentions.context.reply": "numa resposta",
  "mentions.context.articleComment": "num comentário a um artigo",
  "mentions.context.namedInvite": "num convite de {name}",
  "mentions.context.communityPost": "num post da comunidade {community}",
  "mentions.context.thread": "numa conversa",
  "mentions.context.eventInvite": "num convite para um encontro",
  "mentions.context.communityReply": "numa resposta na comunidade {community}",
  // Caixa de menções em direto (GET /mentions) — grupo do dia + alternativas
  // quando a linha do backend não traz rótulo/autor resolvido (MentionsPanel).
  "mentions.day.earlier": "Mais antigas",
  "mentions.liveContext.community": "num post da comunidade",
  "mentions.liveContext.generic": "mencionou-te",
  "mentions.liveWhere.fallback": "a conversa",
  "mentions.liveActor.unknown": "Alguém",

  // Pré-visualização de notificação (NotificationDeepLinkPage.tsx / Cards.tsx)
  "deepLink.back": "Notificações",
  "deepLink.types.connection": "Ligação",
  "deepLink.types.gathering": "Encontro",
  "deepLink.types.reply": "Resposta",
  "deepLink.types.mention": "Menção",
  "deepLink.types.moderation": "Moderação",
  "deepLink.summary.connection": "{name} quer ligar-se a ti",
  "deepLink.summary.gathering": "A tua presença em {event} foi aceite",
  "deepLink.summary.reply": "{name} respondeu ao teu post",
  "deepLink.summary.mention": "{name} mencionou-te num post",
  "deepLink.summary.moderation":
    "Uma atualização sobre a tua conta: recurso {ref}",
  "deepLink.connection.toastConnected": "Ligação feita com {name}",
  "deepLink.connection.toastDeclined": "Pedido recusado",
  "deepLink.connection.connectedTitle": "A ligação está <em>feita</em>",
  "deepLink.connection.connectedBody":
    "{name} já faz parte da tua rede. Mensagens e novidades marcadas já estão abertas entre vocês.",
  "deepLink.connection.viewConnections": "Ver as tuas ligações",
  "deepLink.connection.wantsToConnect": "{name} quer <em>ligar-se</em>",
  "deepLink.connection.noteIntro": "Enviou-te uma nota com o pedido:",
  "deepLink.connection.mutualConnections_one": "{count} ligação em comum",
  "deepLink.connection.mutualConnections_other": "{count} ligações em comum",
  "deepLink.connection.accept": "Aceitar",
  "deepLink.connection.decline": "Recusar",
  "deepLink.connection.notNow": "Agora não, decidir depois",
  "deepLink.connection.remindLaterToast": "Lembramos-te mais tarde",
  "deepLink.gathering.badge": "Vais",
  "deepLink.gathering.guestListConfirmed": "Estás na lista de convidados.",
  "deepLink.gathering.confirmedByHost":
    "A tua presença foi confirmada por quem organiza.",
  "deepLink.gathering.addToCalendar": "Adicionar ao calendário",
  "deepLink.gathering.addedToastCalendar": "Adicionado ao teu calendário",
  "deepLink.gathering.viewDetails": "Ver detalhes do encontro",
  "deepLink.reply.yourPost": "O teu post",
  "deepLink.reply.theirReply": "Resposta de {name}",
  "deepLink.reply.meta": "Respondeu ao teu post · {when}",
  "deepLink.mention.theirPost": "Post de {name}",
  "deepLink.mention.meta": "Mencionou-te num post · {when}",
  "deepLink.composer.placeholder": "Responder a {name}…",
  "deepLink.composer.send": "Enviar",
  "deepLink.sentReply.you": "Tu",
  "deepLink.sentReply.justNow": "Agora mesmo",
  "deepLink.moderation.heading": "Uma atualização sobre a tua conta",
  "deepLink.moderation.reference":
    "Referência <refNum>{ref}</refNum> · Atualizado a {updated}",
  "deepLink.moderation.viewOutcome": "Ver o resultado do recurso",
  "deepLink.moderation.howItWorks": "Como funciona a moderação",
};
