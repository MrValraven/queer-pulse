import type { Catalog } from "../../types";

/**
 * Resources — pt-PT inclusivo. Mesmas chaves que `en/resources.ts`.
 *
 * Notas de tradução:
 * - Registo `tu`, caloroso, nunca `você`.
 * - "Members" → *pessoas*, nunca *Membros*.
 * - Nomes próprios do mundo real (organizações, linhas de apoio, estatutos —
 *   ACT, SNS, ILGA Portugal, SOS Voz Amiga) NÃO são traduzidos.
 * - Conteúdo fictício (bios de terapeutas/advogados mock) fica em inglês —
 *   ver os catálogos dessas secções mais abaixo — porque em modo live vem da
 *   API como texto de quem o escreveu.
 * - Este ficheiro cobre informação de segurança/saúde/legal real para a
 *   comunidade queer em Lisboa — a fidelidade ao significado tem prioridade
 *   sobre a fluidez; ver relatório para pontos que merecem revisão nativa.
 */
export const resources: Catalog = {
  // ── Partilhado: ResourceModal ───────────────────────────────────────────
  "modal.closeAriaLabel": "Fechar",
  "modal.doneCta": "Concluído",

  // ── Partilhado: CrisisStrip ──────────────────────────────────────────────
  "crisis.ariaLabel": "Crise e apoio de emergência",
  "crisis.title": "Em crise <em>agora mesmo?</em>",
  "crisis.body":
    "Se estás em perigo imediato, liga para o <strong>112</strong>. Estas linhas são gratuitas e confidenciais — toca para ligar, ou copia o número.",
  "crisis.emergencyCta": "Apoio de emergência da QueerPulse",
  "crisis.jumpCta": "Todos os recursos de crise ↓",
  // crisisStrip.data.ts — nomes reais de linhas de apoio mantidos como estão;
  // só a parte descritiva e o horário são traduzidos. Assinalar para revisão
  // nativa: exatidão das linhas de crise.
  "crisis.line.emergency.name": "Emergência (polícia · ambulância)",
  "crisis.line.emergency.hours": "Sempre · gratuito",
  "crisis.line.sosVozAmiga.name": "SOS Voz Amiga",
  "crisis.line.sosVozAmiga.hours": "Diariamente 16h–24h",
  "crisis.line.ilga.name": "ILGA Portugal — Linha LGBTQ+",
  "crisis.line.ilga.hours": "Dias úteis 10h–18h",

  // ── Partilhado: SuggestEditModal ─────────────────────────────────────────
  "suggestEdit.modalTitle": "Sugerir uma alteração",
  "suggestEdit.success.title": "Sugestão <em>recebida.</em>",
  "suggestEdit.success.sub":
    "A equipa editorial vê as sugestões semanalmente e discute alterações maiores na assembleia mensal. Este é um documento vivo precisamente por causa de sugestões como a tua.",
  "suggestEdit.body.intro":
    "Editado pela comunidade. Se uma definição parecer incompleta ou incorreta, diz-nos qual o termo e o que mudarias.",
  "suggestEdit.form.termLabel": "Qual termo",
  "suggestEdit.form.selectPlaceholder": "Seleciona um termo…",
  "suggestEdit.form.newTermOption": "Um termo que falta",
  "suggestEdit.form.changeLabel": "Alteração sugerida",
  "suggestEdit.form.changePlaceholder":
    "O que está errado, e como o dirias em vez disso. Fontes são bem-vindas mas não obrigatórias.",
  "suggestEdit.cancelCta": "Cancelar",
  "suggestEdit.sendingLabel": "A enviar…",
  "suggestEdit.sendCta": "Enviar sugestão",

  // ── LegalPage ───────────────────────────────────────────────────────────
  // Informação legal/de segurança — assinalar para revisão nativa.
  "legal.meta.title":
    "Direitos legais LGBTQ+ em Portugal: trabalho, habitação e saúde",
  "legal.meta.description":
    "Conhece os teus direitos no trabalho, na habitação e na saúde como pessoa LGBTQ+ em Portugal, e encontra um diretório de advogados queer-friendly avaliados pela comunidade em Lisboa.",
  "legal.hero.eyebrow": "Apoio Jurídico",
  "legal.hero.title":
    "Conhece os teus direitos. <em>Guarda os comprovativos.</em>",
  "legal.hero.lead":
    "Guias jurídicos, advogados queer-friendly e recursos sobre discriminação para pessoas LGBTQ+ em Portugal — porque conhecer os teus direitos é o primeiro passo para os defenderes.",
  "legal.hero.anchor.workplace": "Direitos no trabalho",
  "legal.hero.anchor.housing": "Direitos na habitação",
  "legal.hero.anchor.healthcare": "Direitos na saúde",
  "legal.hero.anchor.lawyers": "Diretório de advogados",
  "legal.hero.backLink": "Guia de Segurança",

  "legal.badge.protected": "Direito protegido",
  "legal.badge.know": "Fica a saber",
  "legal.badge.practical": "Prático",

  "legal.workplace.title": "Direitos no <em>trabalho</em>",
  "legal.workplace.lead":
    "O Código do Trabalho português proíbe a discriminação com base na orientação sexual e na identidade de género. Eis o que isso significa na prática.",
  "legal.workplace.dismissal.title": "Proteção contra despedimento",
  "legal.workplace.dismissal.body":
    "Não podes ser legalmente despedide por causa da tua orientação sexual ou identidade de género. O despedimento indireto — tornar as condições intoleráveis — também é proibido. Guarda registo de tudo.",
  "legal.workplace.harassment.title": "Assédio no trabalho",
  "legal.workplace.harassment.body":
    "O assédio com base na orientação sexual ou identidade de género é ilegal. A tua entidade empregadora tem o dever legal de investigar queixas. A falta de ação torna-a responsável. Documenta cada incidente com datas.",
  "legal.workplace.pronouns.title": "Pronomes e nome no trabalho",
  "legal.workplace.pronouns.body":
    "A insistência em usar o nome ou pronomes errados depois de seres corrigide pode constituir assédio. Pessoas trabalhadoras trans têm o direito de usar o nome preferido antes de qualquer alteração legal de nome.",
  "legal.workplace.complaint.title": "Fazer uma queixa",
  "legal.workplace.complaint.body":
    "A ACT (Autoridade para as Condições do Trabalho) trata das queixas de discriminação no trabalho. Podes denunciar de forma anónima. Temos um guia passo a passo e um modelo de carta de queixa.",

  "legal.link.readGuide": "Ler o guia completo →",
  "legal.link.getTemplate": "Obter o modelo →",
  "legal.link.findSupport": "Encontrar apoio →",
  "legal.link.transHubGuide": "Guia do Trans Hub →",
  "legal.link.reportRefusal": "Denunciar uma recusa →",
  "legal.link.prepGuide": "Guia de acesso à PrEP →",

  "legal.housing.title": "Direitos na <em>habitação</em>",
  "legal.housing.lead":
    "A discriminação no arrendamento é ilegal em Portugal. Na prática, ainda acontece — eis como reagir quando acontece.",
  "legal.housing.rental.title": "Discriminação no arrendamento",
  "legal.housing.rental.body":
    "Um senhorio que se recuse a arrendar-te por causa da orientação sexual ou identidade de género está a agir ilegalmente. Documenta qualquer prova — capturas de ecrã, gravações com consentimento, recusas por escrito.",
  "legal.housing.samesex.title": "Casais do mesmo sexo e arrendamento",
  "legal.housing.samesex.body":
    "Casais do mesmo sexo têm direitos iguais nos contratos de arrendamento. Ambos os parceiros podem constar do contrato. Existem proteções contra a perda da casa se um dos parceiros sair ou falecer.",
  "legal.housing.eviction.title": "Proteções contra despejo",
  "legal.housing.eviction.body":
    "O despejo por motivos discriminatórios tem proteções adicionais. Se estás a enfrentar deslocamento numa zona em gentrificação, quem organiza a comunidade pode ajudar — contacta a Catarina Vaz através da QueerPulse.",

  "legal.healthcare.title": "Direitos na <em>saúde</em>",
  "legal.healthcare.lead":
    "As pessoas LGBTQ+ em Portugal têm pleno direito de acesso à saúde pública. O acesso específico para pessoas trans melhorou significativamente desde 2018.",
  "legal.healthcare.sns.title": "Saúde trans através do SNS",
  "legal.healthcare.sns.body":
    "Desde 2018, os cuidados de saúde trans, incluindo terapia hormonal e procedimentos cirúrgicos, estão disponíveis através do SNS. Existem listas de espera — temos um guia para as navegar.",
  "legal.healthcare.refusal.title": "Recusa de tratamento",
  "legal.healthcare.refusal.body":
    "Os prestadores de cuidados de saúde não podem legalmente recusar tratamento com base na orientação sexual ou identidade de género. Se isto acontecer, documenta e contacta imediatamente a ILGA Portugal.",
  "legal.healthcare.prep.title": "Acesso à PrEP",
  "legal.healthcare.prep.body":
    "A PrEP está disponível através do SNS sem custos se cumprires os critérios de elegibilidade. O nosso guia percorre o processo, incluindo quais as clínicas mais acolhedoras em Lisboa.",

  "legal.lawyers.title": "Advogados <em>queer-friendly</em>",
  "legal.lawyers.lead":
    "Avaliados por pessoas da comunidade, com experiência específica em casos LGBTQ+ em Portugal. Consultas iniciais gratuitas para pessoas da QueerPulse.",
  "legal.lawyers.requestConsultationCta": "Pedir consulta →",
  "legal.lawyers.emergency.title": "A enfrentar algo <em>urgente?</em>",
  "legal.lawyers.emergency.body":
    "Se estás a lidar com uma situação jurídica urgente — detenção, aviso de despejo ou suspensão no trabalho — usa a rede de emergência da QueerPulse. Normalmente há alguém disponível para ajudar dentro de horas.",
  "legal.lawyers.emergencyCta": "Rede de emergência →",

  "legal.outro.title": "Tens <em>direitos.</em>",
  "legal.outro.sub":
    "O conhecimento é a primeira linha de defesa. Partilha estes recursos com quem precisar deles.",
  "legal.outro.requestInviteCta": "Pedir um convite",

  // ── CommunityPrivacyPage ────────────────────────────────────────────────
  "communityPrivacy.meta.title":
    "Privacidade no QueerPulse: o que é visível, e para quem",
  "communityPrivacy.meta.description":
    "Como funciona a visibilidade por predefinição no QueerPulse — o que aparece no teu perfil público, dentro da comunidade e para a equipa de moderação.",
  "communityPrivacy.hero.eyebrow": "Saída do Armário · Privacidade",
  "communityPrivacy.hero.title": "Tu controlas <em>o que é visível.</em>",
  "communityPrivacy.hero.lead":
    "Este espaço funciona com visibilidade reduzida por predefinição. Aqui está exatamente o que aparece onde — no teu perfil público, dentro da comunidade e para a equipa de moderação — para estares aqui nos teus próprios termos.",
  "communityPrivacy.hero.anchor.tiers": "O que aparece onde",
  "communityPrivacy.hero.anchor.controls": "Os teus controlos",

  "communityPrivacy.tiers.title": "O que aparece <em>onde</em>",
  "communityPrivacy.tiers.lead":
    "Três camadas, do totalmente público ao só-moderação. A maior parte deste espaço vive nas duas últimas.",
  "communityPrivacy.tier.public.title": "No teu perfil público",
  "communityPrivacy.tier.public.body":
    "Quase nada de um espaço de visibilidade reduzida aparece aqui. A tua participação no espaço de saída do armário nunca é mostrada publicamente, e nada do que publicas lá fica associado ao teu perfil.",
  "communityPrivacy.tier.community.title": "Dentro da comunidade",
  "communityPrivacy.tier.community.body":
    "A lista de pessoas participantes não é mostrada a outras pessoas, a menos que escolhas ligar-te. Podes ler, reagir e publicar sem que ninguém consiga ver quem mais está aqui.",
  "communityPrivacy.tier.modTeam.title": "Só a equipa de moderação",
  "communityPrivacy.tier.modTeam.body":
    "A moderação vê o que precisa para manter o espaço seguro — denúncias, pedidos de entrada — e nada mais. Nunca vê a tua atividade mais alargada na QueerPulse, e a confidencialidade é a primeira regra que segue.",

  "communityPrivacy.controls.title": "Os teus <em>controlos</em>",
  "communityPrivacy.howTo.default":
    "A visibilidade reduzida é a predefinição neste espaço — não precisas de ativar nada para estares protegide.",
  "communityPrivacy.howTo.settings":
    "Controlas o que é visível a partir das tuas definições a qualquer momento: visibilidade do perfil, quem te consegue encontrar, e se as tuas comunidades aparecem listadas.",
  "communityPrivacy.howTo.leaving":
    "Sair de um espaço remove-te de forma limpa. Nada fica pendurado no teu perfil, e nenhuma notificação o anuncia.",

  "communityPrivacy.outro.title": "Nada disto está <em>no teu perfil.</em>",
  "communityPrivacy.outro.sub":
    "Ajusta a tua visibilidade quando quiseres — está tudo nas tuas definições.",
  "communityPrivacy.outro.cta": "Abrir definições de privacidade",

  // ── SafetyPage ──────────────────────────────────────────────────────────
  "safety.meta.title":
    "Como a QueerPulse protege a tua privacidade e segurança",
  "safety.meta.description":
    "Como funcionam os níveis de visibilidade, o sistema de avais e a proteção de dados na QueerPulse — e como denunciar uma preocupação ou sair da rede.",
  "safety.hero.cat": "Segurança e privacidade",
  "safety.hero.title": "A tua visibilidade. <em>A tua escolha.</em>",
  "safety.hero.intro":
    "A QueerPulse é um espaço onde estar fora do armário — ou não, ou algures no meio — não é da conta de ninguém a não ser tua. Eis como protegemos isso.",

  "safety.visibility.title": "Como funciona a <em>visibilidade</em>",
  "safety.visibility.body":
    "Cada pessoa escolhe o seu próprio nível de visibilidade. Não é uma definição escondida num perfil — é uma parte central de como existes na rede. Pensa nisto como um regulador, não um interruptor.",
  "safety.visibility.open.title": "Aberto a ligações",
  "safety.visibility.open.body":
    "O teu perfil é visível a todas as pessoas participantes. Qualquer pessoa na rede pode contactar-te diretamente. Podes mudar isto a qualquer momento — não há penalização por dares um passo atrás.",
  "safety.visibility.network.title": "Só rede",
  "safety.visibility.network.body":
    "O teu perfil é visível às pessoas participantes, mas o contacto direto exige uma ligação partilhada. És contactável, mas com uma camada extra de conforto.",
  "safety.visibility.private.title": "Privado",
  "safety.visibility.private.body":
    "O teu perfil só é visível à equipa e a quem te avalizou. Apareces na contagem da rede mas não na navegação. A definição certa se saíste do armário há pouco tempo, estás numa situação sensível, ou simplesmente ainda não estás pronte. Não é preciso dar explicações.",

  "safety.vouching.title": "O modelo de <em>aval</em>",
  "safety.vouching.body1":
    "Toda a gente na rede é avalizada por pelo menos uma pessoa que já lá está. Isto não é gatekeeping — é o mecanismo que faz a sala parecer digna de confiança. Quando alguém te avaliza, está a dizer: <b>conheço esta pessoa e acho que pertence aqui.</b>",
  "safety.vouching.body2":
    "Quem avaliza não é responsável pelas pessoas que avaliza, mas presta contas de forma real. Se uma pessoa avalizada tiver um comportamento prejudicial, quem a avalizou faz parte da conversa sobre o que acontece a seguir.",
  "safety.vouching.calloutHead": "Sobre estar fora do armário há pouco tempo",
  "safety.vouching.calloutBody":
    "Se ainda não estás fora do armário na tua vida profissional, podes estar como Privade dentro da QueerPulse e mesmo assim beneficiar da comunidade. Nunca partilhamos a tua participação para fora sem consentimento explícito.",

  "safety.dataUse.title": "O que <em>não fazemos</em> com os teus dados",
  "safety.dataUse.body1":
    "Não os vendemos. Não treinamos modelos com eles. Não os partilhamos com terceiros. Não fazemos publicidade. Somos uma rede pequena, sustentada pela comunidade — os teus dados não são o produto.",
  "safety.dataUse.body2":
    "O que guardamos: o teu nome, email, conteúdo do perfil e definição de visibilidade. O que não guardamos: a tua localização para além do bairro que escolhes partilhar, o teu comportamento de navegação, ou o que dizes em mensagens privadas.",
  "safety.dataUse.body3":
    "Podes pedir tudo o que temos sobre ti, ou pedir-nos para eliminar a tua conta, a qualquer momento. Envia um email para <b>hello@queerpulse.pt</b>.",

  "safety.report.title": "Se algo <em>não parecer bem</em>",
  "safety.report.body1":
    "Levamos as preocupações de segurança a sério, e respondemos-lhes nós próprios — não um sistema automático. Se alguém te fez sentir insegure, se uma mensagem ultrapassou um limite, se algo não te parece bem, diz-nos.",
  "safety.report.body2":
    "Tratamos cada denúncia com discrição. Não serás identificade à pessoa que estás a denunciar a menos que escolhas sê-lo. Nós damos seguimento.",
  "safety.report.boxTitle": "Contacta a equipa",
  "safety.report.boxBody":
    "Se precisas de denunciar uma preocupação, contacta diretamente. Lemos tudo o que é enviado para este endereço e procuramos responder dentro de 24 horas.",
  "safety.report.emailCta": "safe@queerpulse.pt",

  "safety.leaving.title": "Sair da <em>rede</em>",
  "safety.leaving.body1":
    "Podes sair a qualquer momento. Quando o fazes, o teu perfil é removido do diretório de imediato. Quaisquer mensagens que tenhas enviado permanecem com quem as recebeu — não as conseguimos apagar. As publicações no quadro são removidas. Os teus dados são eliminados dentro de 30 dias, a menos que peças para os mantermos por um motivo específico.",
  "safety.leaving.body2":
    'Não há aqui nenhum padrão enganoso. Sem ciclo de confirmação "tens a certeza?". Sem período de reflexão de 30 dias antes da eliminação. Sais, desapareceste, e desejamos-te tudo de bom.',

  "safety.outro.title":
    "A segurança é uma funcionalidade, <em>não uma nota de rodapé.</em>",
  "safety.outro.sub": "Alguma questão sobre como a rede funciona? Escreve-nos.",
  "safety.outro.cta": "hello@queerpulse.pt",

  "safety.subpageIndex.eyebrow": "Segurança",
  "safety.subpageIndex.title": "Denúncias e direitos",
  "safety.subpage.report.label": "Denúncias e Segurança",
  "safety.subpage.report.blurb":
    "Denuncia assédio ou um espaço inseguro, e vê o que acontece a seguir.",
  "safety.subpage.hateCrime.label": "Guia de Crimes de Ódio",
  "safety.subpage.hateCrime.blurb":
    "O que conta como crime de ódio em Portugal, e como denunciar um.",
  "safety.subpage.legal.label": "Apoio Jurídico",
  "safety.subpage.legal.blurb":
    "Conhece os teus direitos e encontra apoio jurídico quando precisares.",

  // ── Queer101Page (Queer101Sections.tsx + queer101.data.ts) ─────────────
  "queer101.meta.title": "Queer 101: um guia introdutório LGBTQ+, sem pressão",
  "queer101.meta.description":
    "Para quem está a explorar a identidade pela primeira vez — perguntas frequentes respondidas, termos explicados, e formas de falar com alguém, sem precisar de conta.",
  "queer101.hero.backLink": "Biblioteca de Recursos",
  "queer101.hero.label": "Queer 101",
  "queer101.hero.title": "Começa aqui, seja onde for que <em>aqui</em> esteja.",
  "queer101.hero.lead":
    "Para quem está a explorar a sua identidade pela primeira vez — ou só à procura de linguagem que encaixe. Não precisas de ter nada resolvido. Isto não é um teste.",
  "queer101.hero.reassure.noAccount":
    "Não precisas de conta para ler nada disto",
  "queer101.hero.reassure.private":
    "Nada do que lês aqui é partilhado com ninguém",
  "queer101.hero.reassure.leaveReturn":
    "Podes sair e voltar sempre que quiseres",

  "queer101.faq.title": "Perguntas <em>frequentes.</em>",
  "queer101.faq.sub":
    "Respostas honestas, sem presumir onde estás neste momento.",
  "queer101.faq.q1": "Como sei se sou queer?",
  "queer101.faq.a1":
    'Não há teste nem limite a atingir. Algumas pessoas sentem-se seguras cedo; outras demoram anos a perceber, ou nunca chegam a fixar um rótulo — e tudo isso está bem. Uma pergunta mais útil não é "sou queer?" mas sim "o que é que sinto como verdadeiro agora?" Não deves uma resposta a ninguém, nem a ti própria.',
  "queer101.faq.q2": "Preciso de um rótulo?",
  "queer101.faq.a2":
    'Não. Os rótulos podem ser úteis — dão-te linguagem, comunidade, e uma forma de te explicares quando quiseres. Mas também podem parecer uma jaula se não encaixarem bem. Muitas pessoas usam "queer" como um termo-guarda-chuva amplo e flexível. Outras preferem especificidade. Outras não usam nenhum. Tudo isso é válido, e pode mudar.',
  "queer101.faq.q3":
    "Qual é a diferença entre identidade de género e orientação sexual?",
  "queer101.faq.a3":
    "A identidade de género tem a ver com quem és — o teu sentido interno de ti própria como homem, mulher, pessoa não-binária, ou outra coisa. A orientação sexual tem a ver com por quem te sentes atraíde — romântica, sexualmente, ou ambas. São independentes: uma mulher trans pode ser heterossexual, lésbica, bissexual, ou qualquer outra coisa. Uma coisa não determina a outra.",
  "queer101.faq.q4":
    "Só tive relações com um género. Isso faz de mim uma pessoa heterossexual?",
  "queer101.faq.a4":
    "Não necessariamente. Identidade e experiência não são a mesma coisa. Muitas pessoas bissexuais e queer só namoraram com um género durante longos períodos das suas vidas — circunstâncias, preferência ou acaso têm todos um papel. O que importa é o que sentes, não uma lista das tuas relações passadas.",
  "queer101.faq.q5":
    "Tudo bem estar em questionamento? E se nunca tiver a certeza?",
  "queer101.faq.a5":
    '"Em questionamento" é uma identidade válida por si só — não é apenas uma sala de espera. Algumas pessoas encontram clareza; outras percebem que a própria pergunta deixa de importar com o tempo. Não há prazo. Não estás partide por não saberes.',
  "queer101.faq.q6":
    "Vim para Lisboa já adulte e só agora estou a explorar isto. Isso é invulgar?",
  "queer101.faq.a6":
    "De todo. Muitas pessoas descobrem que mudar-se para um sítio novo — uma cidade com vida queer visível, ou longe do ambiente onde cresceram — cria o espaço para explorar coisas que antes pareciam impossíveis. Não há idade certa. Algumas das pessoas mais vibrantes desta comunidade encontraram-se aos 40, 50 anos, ou mais tarde.",
  "queer101.faq.q7": "E se explorar e decidir que afinal não sou queer?",
  "queer101.faq.a7":
    "Também está bem. Explorar não é um compromisso. Vale a pena conhecer-te a ti própria, seja qual for a conclusão. És bem-vinde aqui em qualquer fase do processo — incluindo se saíres e voltares, ou ficares como aliade, ou nunca chegares a perceber.",

  "queer101.glossary.title": "Linguagem e <em>terminologia.</em>",
  "queer101.glossary.sub":
    "Um documento vivo. Editado pela comunidade — se uma definição parecer incompleta ou incorreta, assinala-a.",
  "queer101.glossary.suggestEditCta": "Sugerir uma alteração",
  "queer101.glossary.searchPlaceholder": "Pesquisar termos…",
  "queer101.glossary.notice":
    "Este glossário é um ponto de partida, não uma autoridade. A linguagem evolui, as pessoas discordam, e definições que parecem certas para uma pessoa podem não parecer para outra.",

  // Termos do glossário — nota: "não-binárie" e "aromântique" seguem a forma
  // neutra em -e do glossário pt-PT; "aromântique" é cunhado por analogia
  // (sinalizado no relatório para revisão nativa).
  "queer101.glossary.term.queer": "Queer",
  "queer101.glossary.def.queer":
    "Termo-guarda-chuva para identidades sexuais e de género que não são heterossexuais nem cisgénero. Reapropriado de um insulto; algumas pessoas mais velhas ainda podem achá-lo doloroso — o contexto importa.",
  "queer101.glossary.term.lgbtq": "LGBTQ+",
  "queer101.glossary.def.lgbtq":
    "Lésbicas, Gays, Bissexuais, Trans, Queer/Questionando, e muitas outras identidades. A sigla continua a expandir-se — o + é um atalho intencional para todas as pessoas não explicitamente listadas.",
  "queer101.glossary.term.genderIdentity": "Identidade de género",
  "queer101.glossary.def.genderIdentity":
    "O sentido interno que uma pessoa tem do seu próprio género — homem, mulher, não-binárie, genderfluid, ou outra coisa. Distingue-se do sexo biológico, que se refere a características físicas.",
  "queer101.glossary.term.sexualOrientation": "Orientação sexual",
  "queer101.glossary.def.sexualOrientation":
    "O padrão de atração de alguém — romântica, sexual, ou ambas. Inclui heterossexual, gay, lésbica, bissexual, pansexual, assexual, e outras.",
  "queer101.glossary.term.nonBinary": "Não-binárie",
  "queer101.glossary.def.nonBinary":
    'Uma identidade de género que não se encaixa exclusivamente em "homem" ou "mulher". Não-binárie é um termo-guarda-chuva que inclui genderqueer, genderfluid, agénero, e outras identidades. Muitas pessoas não-binárias usam pronomes neutros de género.',
  "queer101.glossary.term.trans": "Trans / Transgénero",
  "queer101.glossary.def.trans":
    "Uma pessoa cuja identidade de género é diferente do sexo que lhe foi atribuído à nascença. Ser trans é independente da orientação sexual — pessoas trans podem ser heterossexuais, gays, bissexuais, ou qualquer outra orientação.",
  "queer101.glossary.term.bisexual": "Bissexual",
  "queer101.glossary.def.bisexual":
    'Atração por mais do que um género. O "bi" não significa "só dois" — a maioria das definições inclui atração por pessoas de géneros semelhantes e diferentes. Muitas vezes abreviado para "bi".',
  "queer101.glossary.term.pansexual": "Pansexual",
  "queer101.glossary.def.pansexual":
    "Atração por pessoas independentemente do género. Por vezes usado de forma intercambiável com bissexual; algumas pessoas preferem pansexual para sublinhar que o género não é um fator na sua atração.",
  "queer101.glossary.term.asexualAromantic": "Assexual / Aromântique",
  "queer101.glossary.def.asexualAromantic":
    "Assexual (ace): sente pouca ou nenhuma atração sexual. Aromântique (aro): sente pouca ou nenhuma atração romântica. As duas coisas são distintas e podem existir em qualquer combinação. Pessoas assexuais e aromântiques fazem parte da comunidade queer.",
  "queer101.glossary.term.intersex": "Intersexo",
  "queer101.glossary.def.intersex":
    "Nasce com características sexuais físicas — cromossomas, hormonas, anatomia — que não se encaixam nas definições típicas de masculino ou feminino. Cerca de 1,7% das pessoas são intersexo. Ser intersexo é uma realidade biológica, não uma identidade.",
  "queer101.glossary.term.pronouns": "Pronomes",
  "queer101.glossary.def.pronouns":
    "As palavras usadas para nos referirmos a alguém quando não usamos o seu nome. Ela/dela, ele/dele, elu/delu, e outras. Usar os pronomes corretos de alguém é respeito básico; vale a pena perguntar quando há dúvida.",
  "queer101.glossary.term.comingOut": "Sair do armário",
  "queer101.glossary.def.comingOut":
    "O processo de revelar a tua identidade a outras pessoas. Não é um acontecimento único — a maioria das pessoas queer sai do armário repetidamente ao longo da vida, para pessoas diferentes e em contextos diferentes. Não há obrigação de sair do armário para ninguém.",

  "queer101.resources.title": "Recursos <em>selecionados.</em>",
  "queer101.resources.sub":
    "Livros, filmes e guias escolhidos pela comunidade — não por um algoritmo. Atualizado regularmente.",
  "queer101.resType.book": "Livro",
  "queer101.resType.film": "Filme",
  "queer101.resType.podcast": "Podcast",
  "queer101.resType.guide": "Guia",
  "queer101.resource.genderQueer.desc":
    "Umas memórias em banda desenhada sobre identidade de género e sexualidade — um dos pontos de entrada mais acessíveis para quem está a questionar a própria identidade.",
  "queer101.resource.stoneButchBlues.desc":
    "Um romance fundador sobre não-conformidade de género na classe trabalhadora. Disponível gratuitamente em PDF através do espólio do autor.",
  "queer101.resource.moonlight.desc":
    "Um retrato silenciosamente devastador de um homem negro queer a crescer em Miami. Sobre identidade, ternura, e o peso das expectativas dos outros.",
  "queer101.resource.kidsAreAllRight.desc":
    "Um retrato caloroso e divertido de uma família lésbica a navegar a mudança. Normalizador no melhor sentido da palavra.",
  "queer101.resource.queery.desc":
    "Entrevistas longas com pessoas queer de todos os percursos de vida. Particularmente bom para ouvir como outras pessoas navegaram a exploração e a identidade.",
  "queer101.resource.comingOutHandbook.desc":
    "Um guia prático e compassivo sobre sair do armário — incluindo quando não o fazer, como te preparares, e como cuidares de ti ao longo do processo.",

  "queer101.talk.title": "Queres falar com <em>alguém?</em>",
  "queer101.talk.body":
    "Explorar a tua identidade pode ser alegre, confuso, ou as duas coisas ao mesmo tempo. Por vezes ajuda falar com alguém que já passou por algo semelhante — sem conselhos, sem pressão.",
  "queer101.talk.peerSupport.title": "Grupo de apoio entre pares",
  "queer101.talk.peerSupport.desc":
    "Um espaço moderado e confidencial dentro da QueerPulse. Experiência partilhada, sem conselhos a menos que sejam pedidos. Reúne-se semanalmente.",
  "queer101.talk.peerSupport.cta": "Junta-te ao grupo →",
  "queer101.talk.oneToOne.title": "Conversa individual",
  "queer101.talk.oneToOne.desc":
    "Pede uma conversa com uma pessoa da comunidade que se ofereceu para falar com quem está a explorar a sua identidade pela primeira vez.",
  "queer101.talk.oneToOne.cta": "Encontrar alguém para conversar →",
  "queer101.talk.therapy.title": "Terapia afirmativa queer",
  "queer101.talk.therapy.desc":
    "Um diretório de terapeutas em Lisboa especializades em clientes LGBTQ+, compilado e avaliado pela comunidade.",
  "queer101.talk.therapy.cta": "Encontrar terapeuta →",
  "queer101.talk.askAnon.title": "Pergunta de forma anónima",
  "queer101.talk.askAnon.desc":
    "Submete uma pergunta de forma anónima ao fórum da comunidade. Respondida por pessoas reais, não bots.",
  "queer101.talk.askAnon.cta": "Perguntar no fórum →",

  "queer101.outro.title": "És bem-vinde <em>aqui.</em>",
  "queer101.outro.sub":
    "Onde quer que estejas no processo. Por mais tempo que demore. Esta comunidade não vai a lado nenhum.",
  "queer101.outro.joinCta": "Junta-te à QueerPulse",
  "queer101.outro.exploreCta": "Explorar comunidades",

  // ── GlossaryPage ────────────────────────────────────────────────────────
  "glossary.meta.title": "Glossário LGBTQ+: termos queer explicados (EN/PT)",
  "glossary.meta.description":
    "Um glossário vivo de termos LGBTQ+ — identidade, saúde e palavras específicas de Lisboa — em inglês e português, atualizado e aberto a sugestões da comunidade.",
  // Nota: a GlossaryPage tem o seu PRÓPRIO alternador EN/PT para os termos
  // (`GLOSSARY_COPY`, `BLOCKS` em glossary.data.tsx), independente do idioma
  // global do site — deliberadamente não mexido (ver relatório). Só a parte
  // fixa (independente do alternador) passa a usar o catálogo.
  "glossary.backLink": "Biblioteca de Recursos",
  "glossary.hero.title": "Um <em>glossário</em> em construção.",
  "glossary.hero.dek":
    "Palavras usadas aqui — em toda a plataforma, na revista, nos convívios. <b>As definições são rascunhos de trabalho.</b> Onde um termo é contestado, dizemo-lo. Onde é específico de Lisboa, assinalamo-lo. <em>Sugere alterações no fundo da página; a equipa editorial vê-as semanalmente.</em>",
  "glossary.foot.body":
    "Este é um documento de trabalho. As sugestões são lidas pela equipa editorial semanalmente e discutidas na assembleia mensal. <em>Vamos errar; preferimos errar publicamente e corrigir.</em>",

  // ── PronounsGuidePage (+ PronounsGuideSections.tsx + pronounsGuide.data.tsx) ──
  // Conteúdo específico para pessoas trans — assinalar para revisão nativa.
  "pronounsGuide.meta.title":
    "Pronomes e nome escolhido na QueerPulse: guia prático",
  "pronounsGuide.meta.description":
    "Como a QueerPulse trata nomes escolhidos e pronomes em toda a plataforma, com respostas sobre deadname, mudança de nome, privacidade e dados de nome legal.",

  "pronounsGuide.hero.eyebrow": "Para pessoas trans e não-binárias",
  "pronounsGuide.hero.title": "Nomes, pronomes, <em>como deve ser.</em>",
  "pronounsGuide.hero.sub":
    "Como a QueerPulse trata nomes escolhidos e pronomes — e o que fazer quando o teu nome ou género muda na plataforma.",

  "pronounsGuide.basics.eyebrow": "O básico",
  "pronounsGuide.basics.title": "Nome escolhido vs. <em>nome legal.</em>",
  "pronounsGuide.basics.body1":
    "A QueerPulse usa o teu <strong>nome escolhido</strong> em todo o lado. O teu nome legal só é guardado se o tiveres fornecido em separado — por exemplo, se te candidataste a bilhetes de evento que o exigiam. Em todos os outros contextos, usamos o que tiveres colocado como nome de exibição ou nome escolhido nas definições.",
  "pronounsGuide.basics.body2":
    "Se estás em processo de mudar o teu nome legal e queres que a QueerPulse reflita o teu novo nome antes de a papelada estar concluída, podes atualizar o teu nome de exibição a qualquer momento — sem necessidade de documentação.",

  "pronounsGuide.whenUpdate.eyebrow": "Quando atualizas o teu nome",
  "pronounsGuide.whenUpdate.title": "O que muda, <em>e quando.</em>",
  "pronounsGuide.whenUpdate.body":
    "Atualizar o teu nome de exibição é imediato na maior parte da plataforma. Algumas coisas propagam-se um pouco mais tarde — aqui está o que esperar.",

  "pronounsGuide.pronouns.eyebrow": "Pronomes",
  "pronounsGuide.pronouns.title": "Definir e <em>mudar pronomes.</em>",
  "pronounsGuide.pronouns.body1":
    "Os teus pronomes aparecem na tua página de perfil, junto ao teu nome nas conversas de mensagens, e no diretório de pessoas se tiveres tornado essa secção visível. Não aparecem em URLs, emails de notificação, ou excertos de resultados de pesquisa.",
  "pronounsGuide.pronouns.body2":
    "Podes definir vários conjuntos de pronomes (ex.: ela/elu) e adicionar uma string personalizada se nenhuma das opções predefinidas encaixar. As alterações têm efeito imediato e não há limite de quantas vezes as podes atualizar.",
  "pronounsGuide.pronouns.body3":
    "Se outra pessoa usar os pronomes errados para ti no fórum ou nas mensagens, podes denunciar através da função de denúncia em qualquer publicação ou mensagem. A nossa equipa de moderação trata o uso repetido de pronomes errados como uma questão de código de conduta.",

  "pronounsGuide.faq.eyebrow": "Perguntas frequentes",
  "pronounsGuide.faq.title": "Coisas que nos <em>perguntam.</em>",

  "pronounsGuide.sidebar.updateName.title":
    "Atualiza o teu <em>nome agora</em>",
  "pronounsGuide.sidebar.updateName.body":
    "Faz alterações ao teu nome de exibição, nome escolhido e pronomes nas definições do teu perfil.",
  "pronounsGuide.sidebar.updateName.cta": "Editar perfil",
  "pronounsGuide.sidebar.commitment.title": "O nosso compromisso",
  "pronounsGuide.sidebar.commitment.body":
    "A QueerPulse nunca vai exigir documentação para mudares o teu nome ou pronomes. Sem verificação de nome legal. Sem uso do nome morto pela equipa. Se algo na plataforma te trata pelo género errado, <a>diz-nos</a> e vamos corrigir.",
  "pronounsGuide.sidebar.wrong.title": "Algo <em>errado?</em>",
  "pronounsGuide.sidebar.wrong.body":
    "Se encontraste o teu nome morto nalgum lugar da plataforma, ou algo não está a atualizar corretamente, contacta-nos diretamente.",
  "pronounsGuide.sidebar.wrong.cta": "Contactar-nos",

  "pronounsGuide.outro.title":
    "Perguntas sobre as <em>tuas definições de identidade?</em>",
  "pronounsGuide.outro.sub":
    "Escreve-nos. Respondemos dentro de dois dias úteis.",
  "pronounsGuide.outro.cta": "Contactar-nos",

  "pronounsGuide.table.head.field": "Campo",
  "pronounsGuide.table.head.use": "Para que serve",
  "pronounsGuide.table.head.who": "Quem o vê",
  "pronounsGuide.table.displayName.field": "Nome de exibição",
  "pronounsGuide.table.displayName.use":
    "O teu nome em publicações, perfil, mensagens",
  "pronounsGuide.table.displayName.who": "Todas as pessoas",
  "pronounsGuide.table.chosenName.field": "Nome escolhido",
  "pronounsGuide.table.chosenName.use":
    "Emails da QueerPulse, comunicações internas",
  "pronounsGuide.table.chosenName.who": "Só tu",
  "pronounsGuide.table.username.field": "Nome de utilizador",
  "pronounsGuide.table.username.use":
    "Identificador do URL (queerpulse.pt/@nomedeutilizador)",
  "pronounsGuide.table.username.who": "Alterável uma vez por ano",
  "pronounsGuide.table.legalName.field": "Nome legal",
  "pronounsGuide.table.legalName.use":
    "Só se o tiveres fornecido para bilhética",
  "pronounsGuide.table.legalName.who": "Só administração + tu",

  "pronounsGuide.where.profile.title": "O teu perfil",
  "pronounsGuide.where.profile.text":
    "Atualiza-se instantaneamente. O teu novo nome aparece na tua página de perfil assim que guardas.",
  "pronounsGuide.where.profile.timing": "Imediato",
  "pronounsGuide.where.messages.title": "Mensagens",
  "pronounsGuide.where.messages.text":
    "As novas mensagens usam o teu novo nome. Os cabeçalhos de mensagens existentes atualizam-se dentro de alguns minutos.",
  "pronounsGuide.where.messages.timing": "Minutos",
  "pronounsGuide.where.forum.title": "Publicações no fórum",
  "pronounsGuide.where.forum.text":
    "Todas as tuas publicações passadas e futuras mostram o teu novo nome de exibição. Os índices de pesquisa atualizam-se durante a noite.",
  "pronounsGuide.where.forum.timing": "Até 24h para a pesquisa",
  "pronounsGuide.where.magazine.title": "Assinaturas na revista",
  "pronounsGuide.where.magazine.text":
    "Se já escreveste para a revista, envia-nos um email e atualizamos a tua assinatura em todas as edições publicadas.",
  "pronounsGuide.where.magazine.timing": "Manual · envia-nos um email",

  "pronounsGuide.faq.q1": "Posso mudar o meu nome de utilizador?",
  "pronounsGuide.faq.a1":
    "Sim, uma vez por ano. As alterações de nome de utilizador atualizam o URL do teu perfil — links antigos redirecionam durante 90 dias. Vai a Editar Perfil → Identidade para o alterar.",
  "pronounsGuide.faq.q2": "E se o meu nome morto aparecer nalgum lugar?",
  "pronounsGuide.faq.a2":
    "Contacta-nos imediatamente através de <a>help@queerpulse.pt</a> e vamos remover ou atualizar isso com prioridade. Isto inclui assinaturas na revista, publicações antigas do fórum atribuídas ao teu nome anterior, e quaisquer arquivos de email que guardemos.",
  "pronounsGuide.faq.q3": "Mudar o meu nome afeta o meu histórico de convites?",
  "pronounsGuide.faq.a3":
    "Não. As tuas relações de convite (quem te convidou, quem convidaste) são mantidas internamente por ID de conta, não por nome, por isso as mudanças de nome não têm qualquer efeito nelas.",
  "pronounsGuide.faq.q4": "Posso tornar os meus pronomes privados?",
  "pronounsGuide.faq.a4":
    "Sim — vai a Editar Perfil → Visibilidade de Campos e define Pronomes como 'Oculto'. Não vão aparecer no teu perfil nem na pesquisa de pessoas. Continuam a ser usados pela equipa em comunicações diretas.",
  "pronounsGuide.faq.q5": "E se eu não quiser especificar pronomes?",
  "pronounsGuide.faq.a5":
    "Basta deixares o campo de pronomes em branco ou por selecionar. Nenhum campo é obrigatório. Não te vamos pedir para o preencheres.",
  "pronounsGuide.faq.q6":
    "Como é que a plataforma trata os dados de nome legal?",
  "pronounsGuide.faq.a6":
    "Os dados de nome legal só são guardados se os tiveres fornecido explicitamente para um propósito que o exigisse (ex.: certas candidaturas a bolsas feitas através da plataforma). Nunca são usados como o teu nome de exibição e são guardados em separado, com controlos de acesso mais rígidos. Podes pedir a sua eliminação a qualquer momento através de <a>Exportação de Dados</a>.",

  // ── TherapistProfilePage (+ therapist/therapistProfiles.data.tsx) ────────
  // The individual therapist template rendered at /resources/therapists/:id;
  // meta describes the directory in general since every :id shares this page.
  "therapists.meta.title":
    "Terapeutas afirmativos LGBTQ+ em Lisboa: perfis verificados",
  "therapists.meta.description":
    "Conhece terapeutas e psicólogos afirmativos LGBTQ+ em Lisboa e online — especialidades, idiomas, tarifários com escala progressiva, e como é a primeira sessão.",

  // ── MentalHealthPage (+ MentalHealthSections.tsx + mentalHealth.data.ts) ──
  "mentalHealth.meta.title":
    "Apoio em saúde mental afirmativo para pessoas queer em Lisboa",
  "mentalHealth.meta.description":
    "Terapeutas afirmativos em Lisboa, linhas de apoio para emergências, e um guia prático para aceder a cuidados de saúde mental através do SNS.",
  "mentalHealth.hero.cat": "Saúde Mental",
  "mentalHealth.hero.title": "Não precisas de estar <em>bem.</em>",
  "mentalHealth.hero.sub":
    "Terapeutas afirmativos queer, informação honesta sobre como aceder a apoio de saúde mental em Lisboa, recursos de crise, e uma comunidade que compreende o que estás a carregar — porque nós também carregamos.",

  "mentalHealth.crisis.label": "Se precisas de apoio agora",
  "mentalHealth.crisis.heading": "Linhas de crise e apoio imediato",
  "mentalHealth.crisis.sub":
    "Estas linhas estão disponíveis agora. Não precisas de estar em perigo imediato para ligar — se estás a passar por um momento difícil, pedir ajuda já é suficiente.",
  "mentalHealth.crisisLine.sosVozAmiga.note": "24h · Português e inglês",
  "mentalHealth.crisisLine.sns24.note": "Linha de saúde · 24h",
  "mentalHealth.crisisLine.ilga.note": "Linha de apoio LGBTQ+",
  "mentalHealth.crisisLine.samaritans.note": "Email · Inglês · resposta em 24h",

  "mentalHealth.outro.title": "Pedir ajuda <em>não é pequeno.</em>",
  "mentalHealth.outro.sub":
    "É uma das coisas mais difíceis de fazer. A comunidade está aqui.",
  "mentalHealth.outro.cta": "Fala com alguém",

  "mentalHealth.therapists.title":
    "Terapeutas afirmativos queer <em>em Lisboa</em>",
  "mentalHealth.therapists.lead":
    'Avaliados e recomendados por pessoas da comunidade. Cada terapeuta aqui foi verificado como genuinamente afirmativo queer — não só "acolhedor", mas com experiência em vidas e identidades queer, e nas pressões específicas de seres queer e expatriade em Lisboa.',
  "mentalHealth.therapists.filterLabel": "Filtrar",
  "mentalHealth.therapists.allLanguages": "Todos os idiomas",
  "mentalHealth.therapists.accepting": "A aceitar",
  "mentalHealth.therapists.waitlist": "Lista de espera",
  "mentalHealth.therapists.viewProfileAriaLabel": "Ver o perfil de {name}",
  "mentalHealth.therapists.viewProfileCta": "Ver perfil →",

  "mentalHealth.experiences.title":
    "Coisas que a comunidade <em>já sentiu</em>",
  "mentalHealth.experiences.lead":
    "Ser expatriade queer em Lisboa traz pressões específicas. Nomeá-las não é queixarmo-nos — é o começo de as enfrentar.",
  "mentalHealth.experience.newCommunity.title":
    "Recomeçar numa comunidade nova",
  "mentalHealth.experience.newCommunity.text":
    "Perder a tua rede social queer quando te mudas é um luto genuíno. Construir uma nova demora tempo e parece pouco natural no início. Quem cá está há mais tempo lembra-se disso — fica mesmo mais fácil, mas os primeiros meses são difíceis e não há problema em dizê-lo.",
  "mentalHealth.experience.visibility.title":
    "Navegar a visibilidade numa cultura nova",
  "mentalHealth.experience.visibility.text":
    "Lisboa é, em geral, segura, mas a visibilidade queer funciona de forma diferente aqui. Algumas pessoas sentem-se mais visíveis do que na sua terra; outras sentem-se menos. Ler situações sociais numa segunda língua ou cultura é exaustivo e desorientador de formas difíceis de explicar a quem não passou por isso.",
  "mentalHealth.experience.admin.title": "O desgaste burocrático",
  "mentalHealth.experience.admin.text":
    "Vistos, NIF, AIMA, inscrição na saúde, contas bancárias que não abrem. O peso burocrático de construir uma vida num país novo é uma fonte documentada de stress crónico. Não é fraqueza — é muita coisa. Nomear isto como fator de saúde mental é válido.",
  "mentalHealth.experience.transNonbinary.title":
    "Vivências trans e não-binárias num sistema novo",
  "mentalHealth.experience.transNonbinary.text":
    "Navegar a saúde, os documentos legais e as situações sociais como pessoa trans ou não-binária em Portugal acrescenta uma camada específica de stress e trabalho. O enquadramento legal português é progressista, mas a realidade administrativa varia. O Trans Hub tem recursos específicos.",
  "mentalHealth.experience.distance.title": "Distância da família de origem",
  "mentalHealth.experience.distance.text":
    "Mudar de país costuma significar distância física da família — escolhida ou biológica. Para pessoas queer cujas relações familiares são complicadas ou condicionais, esta distância pode ser simultaneamente um alívio e o seu próprio tipo de luto. As duas coisas são reais ao mesmo tempo.",
  "mentalHealth.experience.financial.title": "Ansiedade financeira",
  "mentalHealth.experience.financial.text":
    "O custo de vida crescente em Lisboa afeta intensamente pessoas expatriadas queer. Insegurança habitacional, custos de visto, e a pressão para corresponder a um certo tipo de vida de expatriade queer são todos fatores de stress reais. A comunidade fala de dinheiro com honestidade — o tópico de economia do fórum é um bom começo.",

  "mentalHealth.sns.title": "Aceder à saúde mental <em>através do SNS</em>",
  "mentalHealth.sns.lead":
    "O sistema público de saúde português cobre a saúde mental, incluindo terapia e psiquiatria — mas o acesso é desigual. Eis o que esperar realisticamente.",
  "mentalHealth.sns.step1.title": "Inscreve-te primeiro num médico de família",
  "mentalHealth.sns.step1.text":
    "Precisas de estar inscrite num Centro de Saúde antes de aceder aos serviços de saúde mental do SNS. Inscreve-te com o teu cartão de residência ou certificado de registo da UE e número de NISS. Existem listas de espera para inscrição em médico de família nalgumas zonas.",
  "mentalHealth.sns.step2.title":
    "Referenciação do médico de família para psicologia",
  "mentalHealth.sns.step2.text":
    "O teu médico de família pode referenciar-te para um psicólogo ou psiquiatra através do SNS. Os tempos de espera para a primeira consulta são tipicamente de 3–6 meses. Para necessidades urgentes, explica claramente a gravidade — isso pode acelerar a referenciação.",
  "mentalHealth.sns.step3.title": "O idioma importa",
  "mentalHealth.sns.step3.text":
    "Os terapeutas e psiquiatras do SNS trabalham tipicamente em português. Se o teu português for limitado, a terapia privada em inglês é mais prática para a maioria das pessoas expatriadas. Plataformas online (BetterHelp, Zenklub) oferecem terapeutas de língua inglesa a preços mais baixos do que as tarifas privadas em Lisboa.",
  "mentalHealth.sns.step4.title": "Tarifas privadas em Lisboa",
  "mentalHealth.sns.step4.text":
    "A terapia privada varia entre 50–120 € por sessão. Alguns terapeutas oferecem tarifas em escala progressiva — vale sempre a pena perguntar. Vários terapeutas no nosso diretório oferecem tarifas de pessoa da comunidade para pessoas da QueerPulse.",
  "mentalHealth.sns.peer.title":
    "Apoio entre pares <em>dentro da comunidade</em>",
  "mentalHealth.sns.peer.body":
    "O grupo de apoio entre pares de saúde mental reúne-se mensalmente. As pessoas partilham experiências, recomendam recursos, e apoiam-se mutuamente — sem facilitação profissional, só conversa honesta.",
  "mentalHealth.sns.peer.joinCta": "Junta-te ao grupo",
  "mentalHealth.sns.peer.mentorCta": "Encontrar um mentor de pares →",

  // ── TherapistProfileModal + TherapistProfileBody ────────────────────────
  "mentalHealth.therapistModal.profileAriaLabel": "{name} — perfil",
  "mentalHealth.therapistModal.sayHelloCta": "Diz olá →",
  "mentalHealth.therapistModal.sentTitle": "Mensagem enviada a {name}.",
  "mentalHealth.therapistModal.sentText":
    "Vai responder-te diretamente por email se sentir que resulta. Sem notificações, sem pressão.",
  "mentalHealth.therapistModal.footNote":
    "As mensagens vão diretamente para {name} — são retidas brevemente e revistas antes da entrega, para manter o espaço seguro.",

  "mentalHealth.therapistProfile.meta.slidingScale":
    "Tarifa em escala progressiva disponível",
  "mentalHealth.therapistProfile.meta.fixedRate": "Tarifa fixa por sessão",
  "mentalHealth.therapistProfile.meta.years_one": "{count} ano de prática",
  "mentalHealth.therapistProfile.meta.years_other": "{count} anos de prática",
  "mentalHealth.therapistProfile.status.acceptingNew":
    "A aceitar novas pessoas",
  "mentalHealth.therapistProfile.status.waitlistOnly": "Só em lista de espera",
  "mentalHealth.therapistProfile.section.about": "Sobre",
  "mentalHealth.therapistProfile.section.howIWork": "Como trabalho",
  "mentalHealth.therapistProfile.section.training": "Formação e qualificações",
  "mentalHealth.therapistProfile.section.firstSession": "A tua primeira sessão",
  "mentalHealth.therapistProfile.seeFullProfileCta": "Ver perfil completo →",

  // ── WellbeingPage (+ WellbeingSections.tsx + wellbeing.data.ts) ──────────
  "wellbeing.meta.title":
    "Bem-estar LGBTQ+ em Lisboa: terapeutas, pares e apoio em crise",
  "wellbeing.meta.description":
    "Recursos de bem-estar feitos pela e para a comunidade — diretório de terapeutas verificado, apoio entre pares, contactos de emergência e redução de danos, tudo num só lugar.",

  "wellbeing.hero.eyebrow": "Bem-estar",
  "wellbeing.hero.title": "Um espaço que <em>cuida de ti.</em>",
  "wellbeing.hero.lead":
    "Recursos construídos por e para a comunidade — terapeutas, apoio entre pares, ajuda em crise, e redução de danos. É assim que é uma rede profissional quando leva o cuidado a sério.",
  "wellbeing.hero.anchor.therapists": "Diretório de terapeutas",
  "wellbeing.hero.anchor.peerSupport": "Apoio entre pares",
  "wellbeing.hero.anchor.crisis": "Recursos de crise",
  "wellbeing.hero.anchor.harmReduction": "Redução de danos",

  "wellbeing.outro.title": "Pertences <em>aqui.</em>",
  "wellbeing.outro.sub":
    "Se ainda não és pessoa da comunidade, pede um convite. Se já és, tudo o que está acima está na área de pessoas da comunidade — sem precisares de outro início de sessão.",
  "wellbeing.outro.cta": "Pedir um convite",
  "wellbeing.subpageIndex.title": "Mais apoio de bem-estar",
  "wellbeing.subpage.harmReduction.label": "Redução de Danos",
  "wellbeing.subpage.harmReduction.blurb":
    "Consumir com mais segurança — orientação prática e sem julgamentos.",
  "wellbeing.subpage.sober.label": "Sóbrie",
  "wellbeing.subpage.sober.blurb":
    "Sóbrie e social — convívios e apoio que não giram à volta de bebida.",

  "wellbeing.therapists.title":
    "Terapeutas afirmativos queer <em>em Lisboa</em>",
  "wellbeing.therapists.lead":
    "Avaliados por pessoas da comunidade. Cada terapeuta listado foi recomendado por pelo menos duas pessoas da QueerPulse. Não cobramos taxas de listagem. Queres adicionar alguém? <a>Contacta-nos.</a>",
  "wellbeing.therapists.requestIntroCta": "Pedir apresentação →",
  "wellbeing.therapists.applyPrompt": "És um terapeuta afirmativo queer?",
  "wellbeing.therapists.applyCta": "Candidata-te a ser listado →",

  "wellbeing.peer.title": "Não precisas de <em>carregar isto sozinhe.</em>",
  "wellbeing.peer.body":
    "Um espaço de apoio entre pares moderado dentro do Fórum — para pessoas a passar por momentos difíceis. Sem conselhos a menos que sejam pedidos. Sem consertar. Só pessoas que compreendem, a escutar.",
  "wellbeing.peer.joinCta": "Junta-te ao grupo",
  "wellbeing.peer.crisisCta": "Em crise agora mesmo?",
  "wellbeing.peer.stat.members.label": "pessoas no espaço de apoio",
  "wellbeing.peer.stat.moderation.label": "resposta de moderação garantida",
  "wellbeing.peer.stat.confidential.label": "confidencial dentro do grupo",

  "wellbeing.crisisSection.title": "Crise e <em>recursos de emergência</em>",
  "wellbeing.crisisSection.lead":
    "Se estás em perigo imediato, liga para o <strong>112</strong>. Estes recursos são específicos para situações LGBTQ+ em Portugal.",
  "wellbeing.crisis.sosVozAmiga.desc":
    "Apoio emocional anónimo e aconselhamento em crise. Sem julgamentos. Disponível em português e inglês.",
  "wellbeing.crisis.sosVozAmiga.hours": "Diariamente 16h–24h",
  "wellbeing.crisis.ilga.desc":
    "Apoio específico LGBTQ+, orientação jurídica, e encaminhamento para serviços afirmativos por todo o país.",
  "wellbeing.crisis.ilga.hours": "Dias úteis 10h–18h",
  "wellbeing.crisis.redeExAequo.desc":
    "Apoio para pessoas LGBTQ+ com menos de 30 anos. Chat online e telefone — seguro, confidencial, liderado por pares.",
  "wellbeing.crisis.redeExAequo.hours": "Online · Dias úteis 18h–22h",
  "wellbeing.crisis.qpEmergency.title": "Emergência QueerPulse",
  "wellbeing.crisis.qpEmergency.desc":
    "Contactos de alojamento seguro, pessoas da comunidade que podem ajudar, e vias de escalonamento de emergência — sempre disponíveis.",
  "wellbeing.crisis.qpEmergency.cta": "Abrir página de emergência →",
  "wellbeing.crisis.qpEmergency.hours": "Sempre disponível",

  "wellbeing.harm.title": "Redução de <em>danos</em>",
  "wellbeing.harm.lead":
    "Informação sem julgamentos para uma comunidade que vive no mundo real. Isto não é instrução moral — é cuidado prático. Ninguém aqui te vai dizer como viver.",
  "wellbeing.harm.nightlife.title": "Segurança básica na vida noturna",
  "wellbeing.harm.nightlife.desc":
    "O que saber antes de saíres, o que fazer se algo parecer errado, e como cuidar dos teus amigos e do teu próprio corpo.",
  "wellbeing.harm.drugsAlcohol.title": "Drogas e álcool",
  "wellbeing.harm.drugsAlcohol.desc":
    "Informação honesta sobre substâncias comuns na vida noturna queer — interações, riscos, e como pedir ajuda sem vergonha.",
  "wellbeing.harm.sexualHealth.title": "Saúde sexual em Lisboa",
  "wellbeing.harm.sexualHealth.desc":
    "Acesso à PrEP, testes de IST, e serviços de saúde sexual afirmativos que não te fazem sentir julgade por seres quem és.",
  "wellbeing.harm.chemsex.title": "Apoio em chemsex",
  "wellbeing.harm.chemsex.desc":
    "Recursos confidenciais e sem julgamentos para pessoas a navegar o chemsex — ligados a serviços reais e pessoas reais que já passaram por isso.",

  // ── TherapistProfilePage (therapist/ subfolder) ─────────────────────────
  "therapistProfilePage.backLink": "Diretório de terapeutas",
  "therapistProfilePage.verified.body_one":
    "<b>Profissional avaliade.</b> Credenciais verificadas pela QueerPulse Wellbeing em {vettedOn}. {count} aval independente da comunidade nos últimos 12 meses. <a>Como avaliamos →</a>",
  "therapistProfilePage.verified.body_other":
    "<b>Profissional avaliade.</b> Credenciais verificadas pela QueerPulse Wellbeing em {vettedOn}. {count} avais independentes da comunidade nos últimos 12 meses. <a>Como avaliamos →</a>",
  "therapistProfilePage.sendMessageCta": "Enviar mensagem",

  "therapistProfilePage.worksWith.title":
    "As áreas em que {name} <em>trabalha</em>",
  "therapistProfilePage.worksWith.sub":
    "Autodeclarado e consistente com a comunidade que avaliza.",
  "therapistProfilePage.approachTitle.he": "A abordagem dele",
  "therapistProfilePage.approachTitle.she": "A abordagem dela",
  "therapistProfilePage.approachTitle.neutral": "A abordagem delu",
  "therapistProfilePage.vouches.title_one": "{count} pessoa <em>avalizou</em>",
  "therapistProfilePage.vouches.title_other":
    "{count} pessoas <em>avalizaram</em>",
  "therapistProfilePage.vouches.sub":
    "Anonimizado por quem avaliza. A clínica não vê quem disse o quê.",
  "therapistProfilePage.vouches.addPrompt": "Já tiveste consultas com {name}?",
  "therapistProfilePage.vouches.addHelp": "Ajuda a próxima pessoa a decidir",
  "therapistProfilePage.vouches.addCta": "Adicionar um aval anonimizado →",
  "therapistProfilePage.beforeBook.title":
    "Antes de reservares — <em>bom saber</em>",

  "therapistProfilePage.sidebar.bookHeadingAccepting":
    "Reservar — próximas 4 semanas",
  "therapistProfilePage.sidebar.bookHeadingWaitlist":
    "Disponibilidade — lista de espera",
  "therapistProfilePage.sidebar.legendAvailable": "Disponível",
  "therapistProfilePage.sidebar.legendBooked": "Reservado",
  "therapistProfilePage.sidebar.heldAccepting":
    "Reservámos {slot}. {name} confirma por email — não há qualquer cobrança para reservar o horário.",
  "therapistProfilePage.sidebar.heldWaitlist":
    "Estás na lista. {name} escreve quando abrir uma vaga — normalmente 6 a 10 semanas.",
  "therapistProfilePage.sidebar.holdingLabel": "A reservar…",
  "therapistProfilePage.sidebar.joiningLabel": "A entrar na lista…",
  "therapistProfilePage.sidebar.holdSlotCta": "Reservar {slot} →",
  "therapistProfilePage.sidebar.pickSlotCta": "Escolhe um horário livre",
  "therapistProfilePage.sidebar.feesHeading": "Tarifas",
  "therapistProfilePage.sidebar.whereHeading": "Onde",
  "therapistProfilePage.sidebar.crisisHeading": "Em crise agora mesmo",
  "therapistProfilePage.sidebar.crisisText":
    "A terapia não é o caminho certo quando estás em perigo imediato. Usa isto em vez disso — está preparado para isso.",
  "therapistProfilePage.sidebar.crisisChatCta": "Apoio em crise",
  "therapistProfilePage.sidebar.sosVozAmigaCta": "SOS Voz Amiga · 213 544 545",

  "therapistProfilePage.vouch.successAriaLabel": "Aval recebido",
  "therapistProfilePage.vouch.successTitle": "Aval recebido,",
  "therapistProfilePage.vouch.successEm": "obrigade.",
  "therapistProfilePage.vouch.successBody":
    "A moderação lê todos os avais antes de serem publicados — o teu vai aparecer dentro de alguns dias, anonimizado exatamente como o escreveste. {name} não vai ver quem o enviou, nem a clínica.",
  "therapistProfilePage.vouch.modalAriaLabel": "Avalizar {name}",
  "therapistProfilePage.vouch.eyebrow": "Aval da comunidade",
  "therapistProfilePage.vouch.title":
    "Já tiveste consultas com {name}? <em>Diz o que achaste.</em>",
  "therapistProfilePage.vouch.sub":
    "Os avais são anonimizados — {name} não vai saber quem escreveu o quê, nem a clínica. Um parágrafo honesto ajuda a próxima pessoa a decidir.",
  "therapistProfilePage.vouch.form.textLabel": "O teu aval",
  "therapistProfilePage.vouch.form.textPlaceholder":
    "Como foi trabalhar com esta pessoa? O que deveria saber a próxima pessoa?",
  "therapistProfilePage.vouch.form.bylineLabel":
    "Como devemos descrever-te? (opcional)",
  "therapistProfilePage.vouch.form.bylineHelper":
    "Aparece em vez do teu nome — mantém tão vago quanto quiseres.",
  "therapistProfilePage.vouch.form.bylinePlaceholder":
    "ex.: Pessoa da comunidade · trabalho de casal",
  "therapistProfilePage.vouch.submitCta": "Adicionar o meu aval",

  // ── TransHubPage ─────────────────────────────────────────────────────────
  "transHub.meta.title":
    "Hub trans e não-binárie: saúde, questões legais e comunidade",
  "transHub.meta.description":
    "Um espaço dedicado a pessoas trans e não-binárias — orientação em saúde, guias jurídicos e administrativos, apoio entre pares e comunidade, feito especificamente para ti.",

  "transHub.hero.eyebrow": "Hub Trans e Não-Binárie",
  "transHub.hero.title": "Um espaço dedicado, <em>não um acrescento.</em>",
  "transHub.hero.lead":
    "Orientação em saúde, guias jurídicos, apoio entre pares e comunidade — construído especificamente para pessoas trans e não-binárias. Não precisas de resolver isto sozinhe.",
  "transHub.hero.anchor.healthcare": "Saúde",
  "transHub.hero.anchor.legal": "Jurídico e administrativo",
  "transHub.hero.anchor.resources": "Recursos",
  "transHub.hero.anchor.community": "Comunidade",

  "transHub.healthcare.title": "Orientação em <em>saúde</em>",
  "transHub.healthcare.lead":
    "A saúde trans em Portugal melhorou significativamente desde 2018. O SNS cobre agora terapia hormonal e cirurgias de afirmação de género. Navegar o processo continua complexo — eis como funciona.",
  "transHub.healthcare.step1.title": "Começa pelo teu médico de família",
  "transHub.healthcare.step1.body":
    "Pede uma referenciação para um endocrinologista ou para a clínica de género mais próxima. O teu médico de família pode não estar familiarizado com o processo — leva o nosso guia de referenciação para ajudar. As referenciações do SNS demoram tipicamente 6–18 meses.",
  "transHub.healthcare.step2.title": "Clínicas de género em Lisboa",
  "transHub.healthcare.step2.body":
    "O Hospital de Santa Maria e o Hospital Curry Cabral têm ambos unidades de medicina de género. As opções privadas incluem a Clínica de Identidade de Género para acesso mais rápido. Temos avaliações de pessoas da comunidade sobre as três.",
  "transHub.healthcare.step3.title": "Acesso a hormonoterapia",
  "transHub.healthcare.step3.body":
    "A terapia hormonal está disponível através do SNS assim que tiveres uma referenciação de endocrinologia. Muitas pessoas da comunidade usam o modelo de consentimento informado em clínicas privadas como primeiro passo mais rápido, e depois transitam para o SNS para cuidados continuados.",
  "transHub.healthcare.step4.title": "Procedimentos cirúrgicos",
  "transHub.healthcare.step4.body":
    "As cirurgias de afirmação de género cobertas pelo SNS incluem vaginoplastia, faloplastia, mastectomia, entre outras. As listas de espera são longas (1 a mais de 3 anos). <a>Jonas Ferreira</a> já ajudou muitas pessoas a navegar este processo.",
  "transHub.healthcare.step5.title": "Se estás a enfrentar barreiras",
  "transHub.healthcare.step5.body":
    "Se um prestador de cuidados recusar tratamento ou tornar o processo hostil, documenta tudo. Contacta <a>os nossos recursos jurídicos</a> ou a ILGA Portugal. Tens direitos — e esta comunidade pode ajudar-te a fazê-los valer.",

  "transHub.legal.title": "Jurídico e <em>administrativo</em>",
  "transHub.legal.lead":
    "Navegar as mudanças de nome legal e marcador de género em Portugal. A Lei da Identidade de Género de 2018 (Lei 38/2018) simplificou significativamente o processo.",
  "transHub.legal.step1.title": "Mudança de nome legal e género",
  "transHub.legal.step1.body":
    "Desde 2018, podes mudar o teu nome legal e marcador de género em qualquer conservatória do registo civil sem documentação médica. Só precisas de uma declaração — não é exigida avaliação psiquiátrica. A taxa é de aproximadamente 200 €.",
  "transHub.legal.step2.title": "Atualizar os teus documentos",
  "transHub.legal.step2.body":
    "Depois de atualizado o teu Cartão de Cidadão, os outros documentos seguem-se. A tua entidade empregadora, o banco e os registos de saúde podem todos ser atualizados com o novo documento. Temos uma checklist de tudo o que precisa de ser atualizado e em que ordem.",
  "transHub.legal.step3.title": "Reconhecimento legal não-binárie",
  "transHub.legal.step3.body":
    "Portugal não tem atualmente uma opção de terceiro género nos documentos oficiais. Esta é uma área de ativismo em curso — a ILGA Portugal e a Rede ex aequo estão a trabalhar nisso. Temos recursos se isto te afetar.",

  "transHub.resources.title": "Recursos e <em>guias</em>",
  "transHub.resources.lead":
    "Mantido por pessoas trans e não-binárias da comunidade. Prático, atual e gratuito.",
  "transHub.resources.openCta": "Abrir →",
  "transHub.resources.cat.guide": "Guia",
  "transHub.resources.cat.checklist": "Checklist",
  "transHub.resources.cat.directory": "Diretório",
  "transHub.resources.cat.peerSupport": "Apoio entre pares",
  "transHub.resource.snsGuide.title": "O guia de saúde trans do SNS",
  "transHub.resource.snsGuide.desc":
    "Um percurso pelo sistema público mantido pela comunidade — referenciações, clínicas, o que levar, e quanto tempo cada etapa demora na realidade.",
  "transHub.resource.docChecklist.title": "Checklist de mudança de documentos",
  "transHub.resource.docChecklist.desc":
    "Todos os documentos a atualizar depois de uma mudança de nome legal, pela ordem certa — CC, NIF, banco, entidade empregadora, registos de saúde.",
  "transHub.resource.clinicians.title": "Clínicos afirmativos",
  "transHub.resource.clinicians.desc":
    "Endocrinologistas, cirurgiões e médicos de família avaliados por pessoas trans da comunidade. Sem taxas de listagem, sem algoritmo — só experiência vivida.",
  "transHub.resource.peerCircle.title": "Círculo de apoio trans e não-binárie",
  "transHub.resource.peerCircle.desc":
    "Um espaço moderado para partilhar o que resultou, desabafar o que não resultou, e encontrar alguém alguns passos à frente no mesmo caminho.",

  "transHub.community.title": "Uma comunidade que <em>te apoia.</em>",
  "transHub.community.body":
    "O Hub Trans e Não-Binárie é mais do que recursos — são pessoas. Partilham avaliações de clínicas, celebram conquistas, e aparecem umas pelas outras quando o sistema falha.",
  "transHub.community.joinCta": "Junta-te ao hub",
  "transHub.community.stat.members.label": "pessoas no hub",
  "transHub.community.stat.reviews.label": "avaliações de clínicos",
  "transHub.community.stat.lawYear.label": "lei de autodeterminação em vigor",

  "transHub.outro.title": "És viste <em>aqui.</em>",
  "transHub.outro.sub":
    "A QueerPulse é uma rede por convite, com aval necessário. Se alguém em quem confias já está cá, pede-lhe para te avalizar.",
  "transHub.outro.cta": "Pedir um convite",

  // ── TransHealthcarePage ──────────────────────────────────────────────────
  // FLAGGED, partially swept — see sweep report. transHealthcare.data.ts's
  // ~26 procedural steps + CONTACTS stay English pending native review.
  "transHealthcare.meta.title":
    "Saúde trans em Lisboa: clínicas, mudança de nome e por onde começar",
  "transHealthcare.meta.description":
    "Um guia prático de saúde trans em Portugal — hormonoterapia no SNS e no privado, mudança legal de nome e de menção de sexo, e clínicos afirmativos em Lisboa.",

  "transHealthcare.hero.eyebrow": "Saúde Trans · Portugal",
  "transHealthcare.hero.titleLine1": "A tua jornada,",
  "transHealthcare.hero.titleLine2": "passo a passo.",
  "transHealthcare.hero.sub":
    "Como aceder a cuidados de saúde de afirmação de género em Portugal — através do SNS ou em privado. Mudança de nome legal. O que levar, a quem ligar, o que esperar.",
  "transHealthcare.hero.disclaimer":
    "Este guia reflete o sistema em vigor em junho de 2026. Confirma sempre os tempos de espera e procedimentos atuais com a ILGA Portugal ou o teu médico de família. Isto é conhecimento da comunidade, não aconselhamento jurídico ou médico.",

  "transHealthcare.path.hrtSns.label": "Hormonoterapia via SNS",
  "transHealthcare.path.hrtPrivate.label": "Hormonoterapia em privado",
  "transHealthcare.path.legalName.label": "Mudança de nome legal",
  "transHealthcare.path.genderMarker.label": "Marcador de género",
  "transHealthcare.path.surgery.label": "Acesso a cirurgia",

  "transHealthcare.section.gettingIntoSystem": "Entrar no sistema",
  "transHealthcare.section.genderClinic": "Clínica de género",
  "transHealthcare.section.ongoingCare": "Cuidados continuados",
  "transHealthcare.section.findingPrivateProvider":
    "Encontrar um prestador privado",
  "transHealthcare.section.ongoing": "Continuado",
  "transHealthcare.section.legalProcess": "O processo (Lei n.º 38/2018)",
  "transHealthcare.section.genderMarkerChange": "Mudar o marcador de género",
  "transHealthcare.section.surgeryInPortugal":
    "Cirurgia de afirmação de género em Portugal",

  "transHealthcare.sidebar.keyContacts": "Contactos importantes",
  "transHealthcare.sidebar.communityTip": "Dica da comunidade",
  "transHealthcare.sidebar.communityTipBody":
    "A ILGA Portugal oferece acompanhamento jurídico gratuito para pessoas trans a navegar o sistema do SNS. Não precisas de fazer isto sozinhe — liga antes da tua primeira consulta.",
  "transHealthcare.sidebar.relatedTitle": "Relacionado na QueerPulse",
  "transHealthcare.sidebar.solidarityCta": "Registo de Tarifas Solidárias →",
  "transHealthcare.sidebar.solidarityRole":
    "Médicos de família e psiquiatras trans-afirmativos",
  "transHealthcare.sidebar.legalCta": "Recursos Jurídicos →",
  "transHealthcare.sidebar.legalRole": "Documentos de mudança de nome",
  "transHealthcare.sidebar.mentalHealthCta": "Saúde Mental →",
  "transHealthcare.sidebar.mentalHealthRole": "Apoio ao longo do processo",

  "transHealthcare.outro.title": "Mereces <em>bons cuidados.</em>",
  "transHealthcare.outro.sub":
    "A comunidade QueerPulse inclui médicos de família, terapeutas e profissionais jurídicos trans-afirmativos. Não precisas de navegar isto sozinhe.",
  "transHealthcare.outro.cta": "Encontrar tarifas solidárias",

  // ── HarmReductionPage (+ HarmReductionSections.tsx + harmReduction.data.tsx) ──
  "harmReduction.meta.title":
    "Redução de danos em Lisboa: sair com mais segurança",
  "harmReduction.meta.description":
    "Informação sem julgamento sobre redução de danos para noites em Lisboa — naloxona e resposta a overdose, consumo mais seguro, quebras, chemsex e testes.",
  // Overdose response / substance-safety guidance — highest-stakes copy in
  // this namespace. Numbers, timings, drug names, phone numbers and org
  // names preserved exactly. Flag for the closest native review.
  "harmReduction.emergency.emergencyLabel": "Emergência:",
  "harmReduction.emergency.snsLabel": "SNS 24 (não urgente):",
  "harmReduction.emergency.mentalHealthLabel": "Linha de Apoio (saúde mental):",

  "harmReduction.hero.backLink": "Hub de Bem-estar",
  "harmReduction.hero.eyebrow": "Redução de Danos · Guia da comunidade",
  "harmReduction.hero.titleLine1": "Sem julgamento.",
  "harmReduction.hero.titleLine2": "Só informação.",
  "harmReduction.hero.sub":
    "Se vais consumir substâncias — num clube, numa festa, em casa — este guia é para ti. Não para te impedir. Para te ajudar a manteres-te em segurança.",
  "harmReduction.hero.sos":
    "<strong>Se alguém parar de respirar:</strong> liga imediatamente para o 112. Portugal tem uma lei do bom samaritano — não serás processade por pedires ajuda.",

  "harmReduction.naloxone.title": "A naloxona <em>salva vidas.</em>",
  "harmReduction.naloxone.body1":
    "A naloxona (Narcan) reverte uma overdose de opioides em minutos. Está disponível gratuitamente em Portugal através de serviços de redução de danos e em algumas farmácias. É segura, fácil de usar, e não exige receita médica. Traz contigo se tu ou alguém à tua volta consome opioides — incluindo fentanilo, heroína, ou analgésicos fortes com receita.",
  "harmReduction.naloxone.body2":
    "Em Lisboa: o GAT Lisboa, a APDES, e a equipa de redução de danos Ares do Pinhal distribuem naloxona gratuitamente. Pergunta no serviço de redução de danos mais próximo ou contacta diretamente o GAT.",
  "harmReduction.naloxone.stepsLabel": "Se alguém tiver uma overdose",
  "harmReduction.naloxone.step1":
    '<strong>Liga 112</strong> — diz "uma pessoa está inconsciente e não está a respirar normalmente"',
  "harmReduction.naloxone.step2":
    "<strong>Administra naloxona</strong> — spray nasal: um jato numa narina. Injeção: segue as instruções do kit.",
  "harmReduction.naloxone.step3":
    "<strong>Posição lateral de segurança</strong> — vira a pessoa de lado, inclina a cabeça para trás para abrir as vias respiratórias",
  "harmReduction.naloxone.step4":
    "<strong>Se não houver resposta em 2–3 minutos</strong> — dá uma segunda dose se tiveres. Continua até chegar ajuda.",
  "harmReduction.naloxone.step5":
    "<strong>Fica com a pessoa</strong> — a naloxona deixa de fazer efeito antes de muitos opioides. Precisa de ser vigiada.",

  "harmReduction.section.beforeNight.label": "Antes da noite",
  "harmReduction.section.beforeNight.title": "Fica a saber antes de sair",
  "harmReduction.section.beforeNight.item.eat.title": "Come antes",
  "harmReduction.section.beforeNight.item.eat.body":
    "O álcool e o MDMA fazem-se sentir com mais força com o estômago vazio. Faz uma refeição a sério 2–3 horas antes, não mesmo antes.",
  "harmReduction.section.beforeNight.item.test.title":
    "Testa as tuas substâncias",
  "harmReduction.section.beforeNight.item.test.body":
    "Há serviços de análise de substâncias em Lisboa — a KOSMICARE em festivais, e o serviço apoiado pela DICAD. Os kits de teste reagente são legais em Portugal e estão disponíveis online. Nunca assumas que um comprimido é o que te disseram que é.",
  "harmReduction.section.beforeNight.item.meds.title":
    "Conhece a tua medicação",
  "harmReduction.section.beforeNight.item.meds.body":
    "ISRS, IMAO, antirretrovirais, e muitos outros medicamentos interagem perigosamente com MDMA, estimulantes, e alguns psicadélicos. Verifica as interações no TripSit ou no DrugsData antes de saíres.",
  "harmReduction.section.beforeNight.item.tellSomeone.title":
    "Diz a alguém onde estás",
  "harmReduction.section.beforeNight.item.tellSomeone.body":
    "Partilha a tua localização com alguém de confiança que não vá sair. Combina uma hora para dar notícias. Isto não é paranoia — é cuidado básico contigo próprie.",
  "harmReduction.section.beforeNight.item.budget.title":
    "Planeia as tuas doses",
  "harmReduction.section.beforeNight.item.budget.body":
    "Decide o que vais tomar antes de saíres. É muito mais difícil tomar boas decisões às 3 da manhã numa sala barulhenta. Escreve num papel se ajudar.",

  "harmReduction.section.duringNight.label": "Na festa",
  "harmReduction.section.duringNight.title": "Durante a noite",
  "harmReduction.section.duringNight.alert.head":
    "Água: nem pouca, nem demasiada",
  "harmReduction.section.duringNight.alert.body":
    "O MDMA pode causar tanto desidratação como hiponatremia (excesso de água). Se estiveres a dançar muito: cerca de 500 ml por hora. Se não estiveres a dançar: cerca de 250 ml por hora. Bebidas isotónicas ajudam com o sal.",
  "harmReduction.section.duringNight.item.startLow.title":
    "Começa com pouco, espera mais do que pensas ser preciso",
  "harmReduction.section.duringNight.item.startLow.body":
    "O MDMA demora 45–90 minutos a atingir o pico de efeito. O efeito da cocaína é mais curto. Muitas hospitalizações acontecem porque alguém tomou mais antes de a primeira dose atingir o pico. Espera pelo menos 90 minutos.",
  "harmReduction.section.duringNight.item.breaks.title": "Faz pausas na dança",
  "harmReduction.section.duringNight.item.breaks.body":
    "O sobreaquecimento é um risco real. Sai, senta-te, arrefece regularmente. Se sentires muito calor e deixares de suar, pede ajuda imediatamente.",
  "harmReduction.section.duringNight.item.mixing.title": "Misturar substâncias",
  "harmReduction.section.duringNight.item.mixing.body":
    "Álcool + MDMA: mais pesado para o corpo, aumenta a desidratação. MDMA + cocaína: stress cardíaco significativo. MDMA + cetamina: imprevisível. Nunca misturar com opioides a menos que tenhas naloxona presente.",
  "harmReduction.section.duringNight.item.lookAfter.title":
    "Cuidem uns dos outros",
  "harmReduction.section.duringNight.item.lookAfter.body":
    "Se a pessoa ao teu lado parecer confusa, com calor excessivo, ou não responder à tua voz — tira-a da multidão, dá-lhe água e, se não houver melhoria em 5 minutos, liga 112.",

  "harmReduction.section.after.label": "No dia seguinte",
  "harmReduction.section.after.title": "Recuperação",
  "harmReduction.section.after.item.comedown.title": "A quebra do MDMA é real",
  "harmReduction.section.after.item.comedown.body":
    "O MDMA esgota temporariamente a serotonina. Os dias 2 a 4 depois do consumo podem trazer humor em baixo, ansiedade, e fadiga. Isto é neurológico, não um reflexo da tua vida. Passa. Comer, dormir, e atividade física ligeira ajudam.",
  "harmReduction.section.after.item.sleepFood.title": "Dormir e comer primeiro",
  "harmReduction.section.after.item.sleepFood.body":
    "Antes de mais nada. O teu corpo trabalhou muito. A vontade de tomar mais para perseguir a sensação boa quase sempre piora a quebra.",
  "harmReduction.section.after.item.worried.title":
    "Se estiveres preocupade com o teu consumo",
  "harmReduction.section.after.item.worried.body":
    "O CAT (Centro de Atendimento a Toxicodependentes) oferece apoio gratuito e confidencial — sem julgamento, sem obrigação. Não precisas de ser dependente para pedires apoio. Liga 800 20 40 60.",
  "harmReduction.section.after.item.chemsex.title":
    "Chemsex e testes de seguimento",
  "harmReduction.section.after.item.chemsex.body":
    "Se tiveste relações sexuais enquanto consumias substâncias, considera fazer um teste de IST dentro de 72 horas se quiseres PEP (profilaxia pós-exposição ao VIH). O Checkpoint e o GAT oferecem ambos testes rápidos. Sem marcação necessária.",

  "harmReduction.section.sober.label": "Sem consumir",
  "harmReduction.section.sober.title": "Sóbrie na festa",
  "harmReduction.section.sober.item.belong.title": "Também pertences ali",
  "harmReduction.section.sober.item.belong.body":
    "A vida noturna queer pode parecer centrada em substâncias. Tens o direito de lá estar sem beber ou consumir — e não deves nenhuma explicação a ninguém.",
  "harmReduction.section.sober.item.nonAlcoholic.title": "Opções sem álcool",
  "harmReduction.section.sober.item.nonAlcoholic.body":
    "A maioria dos locais em Lisboa serve água e refrigerantes. Pede água com gás e lima se não quiseres que pareça que não estás a beber — não é da conta de mais ninguém.",
  "harmReduction.section.sober.item.qpCommunity.title":
    "Comunidade Sóbrie da QueerPulse",
  "harmReduction.section.sober.item.qpCommunity.body":
    "A página Sóbrie liga pessoas da comunidade que são sóbrias ou estão a explorar a sobriedade. Não estás sozinhe em querer fazer parte da noite sem as substâncias.",
  "harmReduction.section.sober.linkCta": "Visitar a página Sóbrie →",

  "harmReduction.section.services.label": "Apoio e serviços",
  "harmReduction.section.services.title": "Onde ir",
  "harmReduction.section.services.item.gat.title": "GAT Lisboa",
  "harmReduction.section.services.item.gat.body":
    "Testes gratuitos de VIH/IST, naloxona, preservativos, apoio em redução de danos. Rua de São Lázaro 58 · gat.org.pt",
  "harmReduction.section.services.item.checkpoint.title": "Checkpoint Lisboa",
  "harmReduction.section.services.item.checkpoint.body":
    "Testes rápidos de VIH e IST, apoio à PrEP, sem necessidade de marcação. Rua do Crucifixo 100 · checkpointlx.com",
  "harmReduction.section.services.item.cat.title":
    "CAT (apoio em dependências)",
  "harmReduction.section.services.item.cat.body":
    "Apoio gratuito e confidencial para quem tiver preocupações sobre o seu consumo de substâncias. 800 20 40 60 · sem necessidade de marcação.",
  "harmReduction.section.services.item.kosmicare.title": "KOSMICARE",
  "harmReduction.section.services.item.kosmicare.body":
    "Apoio em crises psicadélicas e integração. Presente no Boom Festival e disponível para consultas todo o ano. kosmicare.org",
  "harmReduction.section.services.item.tripsit.title": "TripSit e DrugsData",
  "harmReduction.section.services.item.tripsit.body":
    "Verificador de interações entre substâncias, guias de dosagem, e informação sobre substâncias. tripsit.me · drugsdata.org",

  "harmReduction.outro.title": "Cuidem-se <em>uns aos outros.</em>",
  "harmReduction.outro.sub":
    "A redução de danos é uma prática comunitária. Quanto mais gente souber isto, mais seguras são as nossas noites.",
  "harmReduction.outro.cta": "Recursos de saúde sexual",

  // ── SoberPage (+ SoberSections.tsx + soberPage.data.ts) ─────────────────
  "sober.hero.backLink": "Hub de Bem-estar",
  "sober.meta.title":
    "Sóbrie e queer em Lisboa: eventos e espaços sem álcool",
  "sober.meta.description":
    "Uma vida social queer plena sem álcool — eventos e espaços em Lisboa que não giram à volta do bar, e apoio entre pares para quem está em recuperação, a explorar a sobriedade, ou simplesmente não bebe.",

  "sober.hero.eyebrow": "Sóbrie e social",
  "sober.hero.title": "Uma vida social plena, sem <em>álcool.</em>",
  "sober.hero.lead":
    "Estejas em recuperação, a explorar a sobriedade, a tomar medicação, ou simplesmente não bebas — não devias ter de te justificar. Existe um mundo social queer vibrante que não gira à volta do bar.",
  "sober.reason.recovery": "Em recuperação",
  "sober.reason.soberCurious": "A explorar a sobriedade",
  "sober.reason.medication": "Medicação",
  "sober.reason.health": "Motivos de saúde",
  "sober.reason.religious": "Prática religiosa",
  "sober.reason.preference": "Preferência pessoal",
  "sober.reason.justDont": "Simplesmente não me apetece",

  "sober.honest.title": "A cena queer e o <em>álcool.</em>",
  "sober.honest.p1":
    "A vida social queer há muito que se organiza à volta de bares — em parte por razões históricas (os bares eram onde era seguro ser visível), em parte porque a vida noturna é genuinamente importante para a cultura queer. Isso é real e vale a pena preservar.",
  "sober.honest.p2":
    "Mas as pessoas queer também têm taxas significativamente mais altas de consumo problemático de substâncias do que a população em geral — e isso não é incidental. Está ligado ao stress de minoria, a espaços sociais seguros limitados, e a uma cultura que por vezes faz a sobriedade parecer estar de fora.",
  "sober.honest.p3":
    "Este espaço é para quem quer comunidade e alegria sem o álcool no centro — por qualquer motivo, sem necessidade de explicação.",
  "sober.stat.rate.n": "2–3×",
  "sober.stat.fewSpaces.n": "Muito poucos",
  "sober.stat.changes.n": "Isto muda",
  "sober.stat.rate.label":
    "As pessoas LGBTQ+ têm 2 a 3 vezes mais probabilidade de ter dependência de álcool do que a população em geral (Public Health England, 2017)",
  "sober.stat.fewSpaces.label":
    "poucos espaços sociais queer são sem álcool ou verdadeiramente acolhedores para quem é sóbrie — apesar da necessidade",
  "sober.stat.changes.label":
    "isto muda quando os espaços comunitários incluem deliberadamente opções sóbrias — e quando as pessoas sóbrias não precisam de ser invisíveis",

  "sober.gatherings.title": "Convívios <em>sóbries.</em>",
  "sober.gatherings.lead":
    "Eventos sem álcool, ou eventos onde o álcool está presente mas não é o foco. Todos os convívios da QueerPulse estão assinalados quando são sem álcool.",
  "sober.gatherings.hostCta": "+ Organizar ou participar num convívio",
  "sober.type.alcoholFree": "Sem álcool",
  "sober.type.supportGroup": "Grupo de apoio",
  "sober.rsvp.going": "Vou",
  "sober.rsvp.cta": "Confirmar presença",

  "sober.venues.title": "Espaços <em>amigos da sobriedade.</em>",
  "sober.venues.lead":
    "Sítios onde podes divertir-te genuinamente sem álcool — e onde a equipa não vai tornar isso estranho. Todos também constam da lista verificada de Espaços Seguros.",
  "sober.venues.seeAllCta": "Ver todos os espaços seguros verificados →",

  "sober.voices.title": "Nas <em>próprias palavras.</em>",
  "sober.voices.lead":
    "Pessoas da comunidade sobre como é realmente a vida social queer sóbria.",

  "sober.recovery.title": "Se estás a navegar a <em>recuperação.</em>",
  "sober.recovery.body":
    "Isto não é só sobre preferência de estilo de vida. Se estás em recuperação — de álcool, substâncias, ou qualquer outra coisa — há aqui pessoas que compreendem. Sem conselhos a menos que peças.",
  "sober.recovery.peerGroup.title": "Grupo de pares Sóbrie e Queer",
  "sober.recovery.peerGroup.desc":
    "Um espaço privado e moderado dentro da QueerPulse para pessoas em recuperação. Reunião semanal online, canal de texto, e convívios presenciais ocasionais. Sem programa específico — todas as abordagens são bem-vindas.",
  "sober.recovery.peerGroup.linkLabel": "Junta-te ao grupo →",
  "sober.recovery.oneToOne.title": "Individual — fala com um par",
  "sober.recovery.oneToOne.desc":
    "Pede uma conversa com uma pessoa da comunidade que se ofereceu para falar com quem está a navegar a sobriedade. Sem conselheiros — só alguém que já passou por algo semelhante.",
  "sober.recovery.oneToOne.linkLabel": "Encontrar um par →",
  "sober.recovery.therapists.title": "Terapeutas afirmativos queer",
  "sober.recovery.therapists.desc":
    "O diretório de bem-estar inclui terapeutas especializades em dependências e identidade queer — porque essas duas coisas não são separadas.",
  "sober.recovery.therapists.linkLabel": "Encontrar um terapeuta →",
  "sober.recovery.external.title": "Recursos externos",
  "sober.recovery.external.desc":
    "APDES (redução de danos), AAPT (AA Portugal), SMART Recovery Portugal — para quando o apoio da comunidade não chega sozinho.",
  "sober.recovery.external.linkLabel": "Ver recursos →",

  "sober.outro.title": "Pertences <em>aqui.</em>",
  "sober.outro.sub":
    "Sóbrie, curiose, ou algures pelo meio. A comunidade é suficientemente grande para tudo isso.",
  "sober.outro.findSpacesCta": "Encontrar espaços seguros",
  "sober.outro.browseCommunitiesCta": "Explorar comunidades",

  "sober.host.modalTitle": "Convívios sóbries",
  "sober.host.success.hostTitle": "Convívio <em>submetido.</em>",
  "sober.host.success.attendTitle": "Estás <em>dentro.</em>",
  "sober.host.success.hostSub":
    "Um coordenador vai confirmar a listagem sem álcool e adicioná-la ao calendário dentro de um dia. Vais receber a checklist de anfitrião por email.",
  "sober.host.success.attendSub":
    "Guardámos o teu lugar. A localização privada e um lembrete simpático vão chegar-te no dia anterior — nada é partilhado publicamente.",
  "sober.host.intro":
    "Começa um convívio sem álcool, ou junta-te a uma reunião de pares já existente. De qualquer forma, decides tu quão visível queres estar.",
  "sober.host.modeLabel": "O que gostarias de fazer?",
  "sober.host.mode.host.name": "Organizar um convívio",
  "sober.host.mode.host.desc": "Propõe um novo convívio sem álcool.",
  "sober.host.mode.attend.name": "Participar num convívio",
  "sober.host.mode.attend.desc":
    "Pede para te juntares a uma reunião de apoio entre pares.",
  "sober.host.nameLabel.host": "O teu nome",
  "sober.host.nameLabel.attend": "Nome pelo qual devemos saudar-te",
  "sober.host.namePlaceholder.host": "ex.: Mariana L.",
  "sober.host.namePlaceholder.attend": "Primeiro nome ou nome escolhido",
  "sober.host.detailLabel.host": "O quê e onde",
  "sober.host.detailLabel.attend": "Qual reunião (e algo a assinalar)",
  "sober.host.detailPlaceholder.host":
    "Uma caminhada matinal, um clube de leitura tranquilo, um círculo de apoio entre pares… local, dia, hora aproximada.",
  "sober.host.detailPlaceholder.attend":
    "ex.: a reunião semanal Sóbrie e Queer de apoio entre pares — e se gostarias de alguém para te acompanhar lá.",
  "sober.host.cancelCta": "Cancelar",
  "sober.host.submitCta.host": "Submeter convívio",
  "sober.host.submitCta.attend": "Pedir para participar",

  // ── LibraryPage ──────────────────────────────────────────────────────────
  "library.meta.title":
    "Biblioteca de guias: direito, saúde, habitação e vida trans",
  "library.meta.description":
    "Guias escritos pela comunidade sobre direitos, saúde, habitação e vida trans em Portugal — pesquisáveis por tema, da discriminação no trabalho à hormonoterapia.",
  "library.hero.eyebrow": "Biblioteca de Guias",
  "library.hero.title": "Todos os guias, <em>num só lugar.</em>",
  "library.hero.lead":
    "Guias de habitação, saúde, direito, finanças e guias específicos para pessoas trans — escritos e validados pela comunidade, mantidos atualizados e livres para partilhar com quem precisar.",
  "library.hero.anchor.browseAll": "Ver tudo",
  "library.hero.anchor.legal": "Direito",
  "library.hero.anchor.health": "Saúde",
  "library.hero.anchor.housing": "Habitação",
  "library.search.placeholder":
    "Pesquisar guias — pronomes, PrEP, arrendamento…",
  "library.filterAria": "Filtrar guias por tema",
  "library.category.all": "Todos os guias",
  "library.category.housing": "Habitação",
  "library.category.health": "Saúde",
  "library.category.legal": "Direito",
  "library.category.finance": "Finanças",
  "library.category.trans": "Vida trans",
  "library.empty":
    "Ainda não há guias que correspondam — tenta outra pesquisa.",
  "library.readGuideCta": "Ler o guia →",
  "library.loadingMore": "A carregar mais guias…",
  "library.loadMoreCta": "Carregar mais guias",
  "library.popularLabel": "Mais lidos:",
  "library.outro.title": "Não encontras <em>o que precisas?</em>",
  "library.outro.sub":
    "Pergunta no fórum — normalmente já passou por isto. Ou sugere um guia que devíamos escrever.",
  "library.outro.askCommunityCta": "Perguntar à comunidade",
  "library.outro.suggestGuideCta": "Sugerir um guia",

  // ── SexualHealthPage (+ SexualHealthTabs.tsx + sexualHealth.data.ts) ────
  // Assinalado para revisão nativa — informação sobre saúde sexual/VIH/PrEP.
  // As entradas de CLINICS (desc/details/horários/meta), PREP_STEPS,
  // PREP_FAQ, HIV_INFO e os textos de GUIDES são conteúdo clínico/processual
  // denso (protocolos de dosagem, nomes de fármacos, estatísticas
  // epidemiológicas, números de contacto de emergência) — deixados em
  // inglês em vez de arriscar uma tradução médica imprecisa. Só a estrutura
  // à volta (títulos, rótulos de separadores/filtros, botões, estados
  // vazios, CTAs genéricos) está traduzida aqui; ver o relatório da sweep.
  "sexualHealth.meta.title":
    "Saúde sexual em Lisboa: testes, PrEP e recursos sobre VIH",
  "sexualHealth.meta.description":
    "Um guia prático de saúde sexual em Lisboa — onde fazer testes, como aceder à PrEP gratuita pelo SNS, recursos sobre VIH e I=I, e um diretório de clínicas avaliado pela comunidade.",

  "sexualHealth.hero.cat": "Saúde sexual",
  "sexualHealth.hero.title": "A tua saúde, <em>nos teus termos.</em>",
  "sexualHealth.hero.lead":
    "Direto, específico para pessoas queer, sem julgamentos. Testes, PrEP, recursos sobre VIH e um diretório de prestadores avaliado pela comunidade — tudo num só lugar.",
  "sexualHealth.outro.title": "A tua saúde <em>importa.</em>",
  "sexualHealth.outro.sub":
    "Perguntas, preocupações, ou simplesmente não sabes por onde começar — a comunidade está aqui.",
  "sexualHealth.outro.wellbeingCta": "Recursos de bem-estar",
  "sexualHealth.outro.peerSupportCta": "Encontrar apoio entre pares",

  "sexualHealth.tab.testing": "Testes e rastreio",
  "sexualHealth.tab.prep": "PrEP em Portugal",
  "sexualHealth.tab.hiv": "Recursos sobre VIH",
  "sexualHealth.tab.guides": "Guias e perguntas",

  "sexualHealth.testing.title": "Onde fazer o <em>teste</em> em Lisboa.",
  "sexualHealth.testing.lead":
    "Clínicas e serviços avaliados pela comunidade. Última atualização por membros em junho de 2025.",
  "sexualHealth.testing.filter.all": "Todas",
  "sexualHealth.testing.filter.public": "Grátis / SNS",
  "sexualHealth.testing.filter.ngo": "ONG",
  "sexualHealth.testing.filter.pharmacy": "Farmácia",
  "sexualHealth.testing.filter.private": "Privado",
  "sexualHealth.testing.filterAria": "Filtrar clínicas por tipo",
  "sexualHealth.testing.empty.title":
    "Ainda não há clínicas desse tipo na lista",
  "sexualHealth.testing.empty.description":
    "Há ainda muitos espaços acolhedores para fazer o teste. Limpa o filtro para ver todas as opções avaliadas pela comunidade.",
  "sexualHealth.testing.empty.clearCta": "Limpar filtros",
  "sexualHealth.testing.clinicCard.verifiedBadge": "Verificado pela comunidade",
  "sexualHealth.testing.clinicCard.viewDetailsCta": "Ver detalhes",
  "sexualHealth.testing.clinicCard.hideDetailsCta": "Ocultar detalhes",
  "sexualHealth.testing.clinicCard.testsLabel": "O que testam",
  "sexualHealth.testing.clinicCard.bringLabel": "O que levar",
  "sexualHealth.testing.clinicCard.accessLabel": "Acesso",
  "sexualHealth.testing.clinicCard.noteLabel": "Bom saber",
  "sexualHealth.testing.nominate.doneTitle": "Obrigade — <em>anotado.</em>",
  "sexualHealth.testing.nominate.doneBody":
    "Vamos verificar e rever com a comunidade antes de entrar no ar. O quadro mantém-se de confiança porque pessoas como tu o mantêm atualizado.",
  "sexualHealth.testing.nominate.anotherCta": "Nomear outra",
  "sexualHealth.testing.nominate.title":
    "Conheces um serviço que devíamos adicionar?",
  "sexualHealth.testing.nominate.body":
    "Nomeia uma clínica ou serviço para revisão da comunidade. Verificamos cada listagem antes de entrar no ar.",
  "sexualHealth.testing.nominate.placeholder":
    "Nome da clínica, localização, e porque a recomendarias…",
  "sexualHealth.testing.nominate.submitCta": "Enviar nomeação",

  "sexualHealth.prep.title": "PrEP em <em>Portugal.</em>",
  "sexualHealth.prep.faqTitle": "Perguntas <em>frequentes.</em>",

  "sexualHealth.hiv.title": "VIH — o que precisas de <em>saber.</em>",
  "sexualHealth.hiv.findServicesCta": "Encontrar serviços de apoio ao VIH",

  "sexualHealth.guides.title": "Guias e <em>perguntas.</em>",
  "sexualHealth.guides.lead":
    "Guias curtos e um espaço para perguntar o que quiseres, de forma anónima. Respondido por membros da comunidade com experiência relevante — não por bots.",
  "sexualHealth.guides.ask.doneTitle": "A tua pergunta foi <em>enviada.</em>",
  "sexualHealth.guides.ask.doneBody":
    "Uma pessoa com experiência relevante vai responder — sem nome, sem conta, nada associado a ti. Volta aqui dentro de um dia ou dois.",
  "sexualHealth.guides.ask.anotherCta": "Perguntar outra vez",
  "sexualHealth.guides.ask.title":
    "Pergunta o que quiseres — de forma anónima.",
  "sexualHealth.guides.ask.body":
    "Envia uma pergunta à comunidade. Respondida por pessoas com conhecimento relevante. Nada é partilhado ou associado à tua conta.",
  "sexualHealth.guides.ask.placeholder":
    "A tua pergunta — nenhum detalhe é demasiado pequeno ou embaraçoso…",
  "sexualHealth.guides.ask.anonymousNote":
    "Completamente anónimo. Não é necessária conta.",
  "sexualHealth.guides.ask.submitCta": "Enviar pergunta",

  // ── MicroGrantsPage (+ MicroGrantsSections.tsx + microGrants.data.ts) ───
  // Nomes/descrições de CURRENT/PAST e do painel (PANEL) ficam em inglês,
  // como conteúdo (precedente THERAPISTS); o processo da bolsa em si está
  // traduzido abaixo.
  "microGrants.hero.backLink": "Bolsas",
  "microGrants.hero.eyebrow": "Fundo comunitário",
  "microGrants.hero.title.line1": "Pouco dinheiro.",
  "microGrants.hero.title.line2": "<em>Impacto real.</em>",
  "microGrants.hero.lead":
    "Microbolsas de 200–2000 € para projetos comunitários queer em Lisboa. Financiadas pela comunidade, atribuídas pela comunidade, com prestação de contas à comunidade. Sem gatekeepers.",
  "microGrants.hero.stat.awarded.label": "atribuído até agora",
  "microGrants.hero.stat.projects.label": "projetos financiados",
  "microGrants.hero.stat.pot.label": "no fundo deste trimestre",
  "microGrants.hero.fundBar.roundLabel":
    "Ronda de financiamento do 2.º trimestre de 2026",

  "microGrants.how.01.title": "A comunidade contribui",
  "microGrants.how.01.body":
    "Quem pode dar um contributo acrescenta ao fundo trimestral — qualquer valor, a partir de 5 €. Sem pressão, sem mínimo.",
  "microGrants.how.02.title": "Os projetos candidatam-se",
  "microGrants.how.02.body":
    "Qualquer pessoa da QueerPulse pode candidatar-se a uma bolsa. Uma página: o que é o projeto, quanto precisas, o que vai fazer.",
  "microGrants.how.03.title": "A comunidade decide",
  "microGrants.how.03.body":
    "Um painel rotativo de 5 pessoas avalia as candidaturas. As decisões são publicadas na íntegra com justificação. Sem recursos — mas a próxima ronda está sempre aberta.",
  "microGrants.how.04.title": "Os projetos dão feedback",
  "microGrants.how.04.body":
    "As pessoas contempladas partilham uma atualização breve aos 3 meses. O que aconteceu, o que mudou, o que gastaram. Tudo publicado na revista.",

  "microGrants.round.statusLabel":
    "Candidaturas abertas · 2.º trimestre de 2026",
  "microGrants.round.title": "Esta ronda: <em>fazer coisas em conjunto.</em>",
  "microGrants.round.desc":
    "Este trimestre estamos a priorizar projetos que criam algo — eventos, publicações, espaços, ferramentas — a que toda a comunidade queer em Lisboa possa aceder e beneficiar. Projetos a solo e colaborações são ambos bem-vindos.",
  "microGrants.round.meta.amountLabel": "por projeto",
  "microGrants.round.meta.deadlineLabel": "prazo de candidatura",
  "microGrants.round.meta.decisionLabel": "até à decisão",
  "microGrants.round.criteriaTitle": "Critérios",
  "microGrants.criteria.member":
    "És uma pessoa da QueerPulse em situação regular",
  "microGrants.criteria.benefit":
    "O projeto beneficia a comunidade queer em Lisboa — não só tu pessoalmente",
  "microGrants.criteria.timeline":
    "Consegues concretizá-lo até 3 meses depois de receberes a bolsa",
  "microGrants.criteria.update":
    "Estás disponível para partilhar uma atualização pública breve sobre o que aconteceu",
  "microGrants.criteria.impact":
    "O dinheiro vai mudar genuinamente o que é possível — não é só acelerar o que já ias fazer",
  "microGrants.round.applyCta": "Candidatar a esta ronda",

  "microGrants.section.currentTitle": "Projetos <em>apoiados</em> atualmente",
  "microGrants.section.pastTitle": "Projetos <em>anteriores</em>",

  "microGrants.sidebar.rulesTitle": "Regras da bolsa",
  "microGrants.rule.oneGrant.title": "Uma bolsa por pessoa",
  "microGrants.rule.oneGrant.body":
    "Por ano civil. Projetos colaborativos podem candidatar-se em grupo.",
  "microGrants.rule.maximum.title": "Máximo de 2000 €",
  "microGrants.rule.maximum.body":
    "Para projetos maiores, sugerimos candidatar em várias rondas ou combinar com a Troca.",
  "microGrants.rule.benefit.title": "Benefício comunitário obrigatório",
  "microGrants.rule.benefit.body":
    "Tem de beneficiar pessoas queer em Lisboa para além de quem se candidata. Projetos pessoais não são elegíveis.",
  "microGrants.rule.reporting.title": "Prestação de contas pública",
  "microGrants.rule.reporting.body":
    "Uma atualização breve aos 3 meses — publicada aqui e na revista. Sem reembolso, mas a responsabilização importa.",
  "microGrants.rule.noPolitics.title": "Sem campanhas políticas",
  "microGrants.rule.noPolitics.body":
    "Financiamos projetos comunitários, não atividade eleitoral ou partidária.",
  "microGrants.sidebar.panelTitle":
    "Painel de avaliação — 2.º trimestre de 2026",
  "microGrants.sidebar.joinPanelCta": "Juntar-te ao painel de avaliação →",

  "microGrants.contribute.title": "Contribui para o <em>fundo.</em>",
  "microGrants.contribute.body":
    "O fundo é sustentado por quem contribui com o que pode. Não há mínimo. Cada valor torna a próxima ronda possível.",
  "microGrants.contribute.otherAmount": "Outro",
  "microGrants.contribute.cta": "Contribuir para o fundo",
  "microGrants.contribute.note":
    "As contribuições são voluntárias. Apenas para a comunidade QueerPulse. Não dedutíveis em sede fiscal ao abrigo da lei portuguesa atual.",

  "microGrants.outro.title": "A comunidade <em>autofinancia-se.</em>",
  "microGrants.outro.sub":
    "Cada projeto aqui só foi possível porque pessoas contribuíram com o que puderam. O fundo cresce com a rede.",
  "microGrants.outro.joinCta": "Juntar-te à rede",

  // ── Grant application wizard (GrantApplicationModal + step components) ──
  "microGrants.apply.category.creative.name": "Criativo e arte",
  "microGrants.apply.category.creative.sub":
    "Exposições, impressões, performances",
  "microGrants.apply.category.education.name": "Educação e conhecimento",
  "microGrants.apply.category.education.sub": "Workshops, guias, recursos",
  "microGrants.apply.category.health.name": "Saúde e bem-estar",
  "microGrants.apply.category.health.sub": "Saúde mental, redução de danos",
  "microGrants.apply.category.legal.name": "Direito e ativismo",
  "microGrants.apply.category.legal.sub": "Direitos, acompanhamento",
  "microGrants.apply.category.community.name": "Comunidade e espaço",
  "microGrants.apply.category.community.sub": "Encontros, entreajuda",
  "microGrants.apply.category.other.name": "Outro",
  "microGrants.apply.category.other.sub":
    "Algo que não encaixa bem noutra categoria",

  "microGrants.apply.commitment.update":
    "Vou partilhar uma atualização pública breve aos 3 meses — o que aconteceu, o que foi gasto, o que mudou.",
  "microGrants.apply.commitment.benefit":
    "Este projeto beneficia genuinamente a comunidade queer em Lisboa, não só eu pessoalmente.",
  "microGrants.apply.commitment.timeline":
    "Consigo concretizar isto até 3 meses depois de receber a bolsa.",

  "microGrants.apply.stepLabel.category": "Escolher uma categoria",
  "microGrants.apply.stepLabel.project": "Detalhes do projeto",
  "microGrants.apply.stepLabel.budget": "Detalhe do orçamento",
  "microGrants.apply.stepLabel.about": "Sobre ti",
  "microGrants.apply.stepLabel.review": "Rever e submeter",

  "microGrants.apply.modalAriaLabel":
    "Candidatar — ronda do 2.º trimestre de 2026",
  "microGrants.apply.modalTitle": "Candidatar — ronda do 2.º trimestre de 2026",
  "microGrants.apply.stepIndicator": "Passo {step} de {total} — {stepLabel}",
  "microGrants.apply.cancelCta": "Cancelar",
  "microGrants.apply.backCta": "← Voltar",
  "microGrants.apply.continueCta": "Continuar →",
  "microGrants.apply.submitCta": "Submeter candidatura →",
  "microGrants.apply.success.title": "Candidatura <em>submetida.</em>",
  "microGrants.apply.success.sub":
    "Vamos confirmar a receção por email dentro de 24 horas. O painel de avaliação reúne-se em meados de julho. Terás uma resposta antes de 31 de julho, seja qual for o resultado.",
  "microGrants.apply.success.closeCta": "Fechar",

  "microGrants.apply.category.stepTitle": "Que tipo de <em>projeto?</em>",
  "microGrants.apply.category.stepSub":
    "Escolhe a categoria que melhor descreve o teu projeto. Isto ajuda o painel de avaliação a ler as candidaturas em conjunto.",

  "microGrants.apply.project.stepTitle": "Fala-nos sobre <em>o projeto.</em>",
  "microGrants.apply.project.stepSub":
    "Explica com clareza e honestidade. O painel de avaliação lê tudo. Linguagem simples vence sempre a linguagem formal.",
  "microGrants.apply.project.nameLabel": "Nome do projeto",
  "microGrants.apply.project.namePlaceholder": "Um título curto e claro",
  "microGrants.apply.project.whatLabel": "O que vais criar ou fazer?",
  "microGrants.apply.project.charCounter": "{current} / {max}",
  "microGrants.apply.project.whatPlaceholder":
    "Descreve o projeto em termos simples. O que vai existir ou acontecer que não existe agora?",
  "microGrants.apply.project.beneficiaryLabel": "Quem beneficia, e como?",
  "microGrants.apply.project.beneficiaryPlaceholder":
    "Quem na comunidade queer é que isto vai alcançar? Que diferença é que isto vai fazer?",
  "microGrants.apply.project.timelineLabel": "Calendário",
  "microGrants.apply.project.timelinePlaceholder":
    "ex.: agosto–outubro de 2026",
  "microGrants.apply.project.stageLabel": "Fase do projeto",
  "microGrants.apply.project.stage.select": "Selecionar…",
  "microGrants.apply.project.stage.idea": "Ideia — ainda não começou",
  "microGrants.apply.project.stage.development": "Em desenvolvimento",
  "microGrants.apply.project.stage.ready":
    "Pronto a arrancar — só precisa de financiamento",
  "microGrants.apply.project.stage.ongoing": "Em curso — isto viria alargá-lo",

  "microGrants.apply.budget.stepTitle": "Como vais <em>gastá-lo?</em>",
  "microGrants.apply.budget.stepSub":
    "Divide o teu orçamento em rubricas. Sê realista — o painel prefere estimativas honestas a otimistas. Máximo de 2000 € nesta ronda.",
  "microGrants.apply.budget.itemPlaceholder":
    "Rubrica (ex.: custos de impressão)",
  "microGrants.apply.budget.addItemCta": "+ Adicionar rubrica",
  "microGrants.apply.budget.totalLabel": "Total pedido",
  "microGrants.apply.budget.hint":
    "Se também estás a contribuir com o teu tempo ou dinheiro, menciona-o abaixo — isso reforça a candidatura.",
  "microGrants.apply.budget.otherContributionsLabel":
    "Outras contribuições (opcional)",
  "microGrants.apply.budget.otherContributionsPlaceholder":
    "ex.: 20 horas do meu tempo, uso do estúdio de um amigo",

  "microGrants.apply.about.stepTitle": "Sobre <em>ti.</em>",
  "microGrants.apply.about.stepSub":
    "Já sabemos quem és na comunidade, mas conta-nos um pouco sobre a tua relação com este projeto e com a comunidade a que serve.",
  "microGrants.apply.about.nameLabel":
    "O teu nome (como queres que apareça no registo da bolsa)",
  "microGrants.apply.about.namePlaceholder":
    "Nome escolhido ou nome completo — tu decides",
  "microGrants.apply.about.connectionLabel": "A tua ligação a este projeto",
  "microGrants.apply.about.connectionPlaceholder":
    "Porque és a pessoa certa para isto? Qual é a tua relação com a comunidade a que serve?",
  "microGrants.apply.about.priorGrantLabel":
    "Já recebeste uma bolsa da QueerPulse antes?",
  "microGrants.apply.about.priorGrant.select": "Selecionar…",
  "microGrants.apply.about.priorGrant.first":
    "Não, esta é a minha primeira candidatura",
  "microGrants.apply.about.priorGrant.reported":
    "Sim — e entreguei um relatório",
  "microGrants.apply.about.priorGrant.pending":
    "Sim — o relatório está pendente (dentro de 3 meses)",
  "microGrants.apply.about.commitmentsLabel": "Compromissos",

  "microGrants.apply.review.stepTitle": "Revê a tua <em>candidatura.</em>",
  "microGrants.apply.review.stepSub":
    "Confirma que está tudo certo. Podes voltar atrás para editar qualquer secção.",
  "microGrants.apply.review.categoryLabel": "Categoria",
  "microGrants.apply.review.projectLabel": "Projeto",
  "microGrants.apply.review.whatLabel": "O que vais criar / fazer",
  "microGrants.apply.review.budgetLabel": "Orçamento pedido",
  "microGrants.apply.review.applicantLabel": "Pessoa candidata",
  "microGrants.apply.review.deadlineLabel": "Prazo",
  "microGrants.apply.review.deadlineValue":
    "<strong>30 de junho de 2026</strong> — decisão em 3–4 semanas",

  // ── PanelSignupModal ─────────────────────────────────────────────────────
  "microGrants.panel.modalTitle": "Juntar-te ao painel de avaliação",
  "microGrants.panel.success.title": "Estás na <em>lista.</em>",
  "microGrants.panel.success.sub":
    "Obrigade. A coordenação do painel avalia as novas pessoas voluntárias antes de cada trimestre e contacta-te antes de a ronda do 3.º trimestre abrir. Os painéis rodam para o trabalho se manter partilhado.",
  "microGrants.panel.intro":
    "O painel lê as candidaturas e decide as bolsas em conjunto. Mantemo-lo pequeno, rotativo e deliberadamente diverso — sem gatekeepers profissionais.",
  "microGrants.panel.nameLabel": "Nome",
  "microGrants.panel.namePlaceholder": "O teu nome",
  "microGrants.panel.emailLabel": "Email",
  "microGrants.panel.emailPlaceholder": "tu@exemplo.com",
  "microGrants.panel.whyLabel": "Porque gostarias de ajudar a avaliar",
  "microGrants.panel.whyPlaceholder":
    "Uma frase ou duas — experiência vivida, o tipo de projetos que te importam, o tempo que podes dar.",
  "microGrants.panel.cancelCta": "Cancelar",
  "microGrants.panel.submitCta": "Adicionar-me ao painel",

  // ── PeerSupportPage (+ peerSupport.data.ts) ─────────────────────────────
  "peerSupport.meta.title":
    "Apoio entre pares para pessoas trans em Lisboa: como funciona",
  "peerSupport.meta.description":
    "Apoio entre pares no Trans Hub da QueerPulse — não é terapia nem aconselhamento, é alguém que já passou pelo que estás a viver. Como pedir apoio ou tornares-te numa pessoa de apoio.",

  "peerSupport.hero.eyebrow": "Trans Hub · Apoio entre pares",
  "peerSupport.hero.title": "Alguém que <em>percebe.</em>",
  "peerSupport.hero.lead":
    "Apoio entre pares no Hub, em termos simples: o que é, o que não é, como pedi-lo, e como te tornares numa pessoa de apoio quando estiveres pronte.",
  "peerSupport.hero.anchor.what": "O que é",
  "peerSupport.hero.anchor.how": "Como funciona",
  "peerSupport.what.title": "O que <em>é</em> o apoio entre pares",
  "peerSupport.what.p1":
    "Apoio entre pares não é terapia nem é aconselhamento. É estar com alguém que já passou pelo que estás a passar e que não precisa que lhe expliques tudo. Sem notas clínicas, sem diagnóstico, sem objetivo que tenhas de atingir no fim.",
  "peerSupport.what.p2":
    "No Hub, o apoio entre pares funciona de duas formas: o círculo aberto onde o grupo aparece em conjunto, e o emparelhamento um-para-um quando queres falar sempre com a mesma pessoa ao longo do tempo. Tu escolhes qual, e podes mudar quando quiseres.",
  "peerSupport.how.title": "Como <em>funciona</em>",
  "peerSupport.how.lead":
    "Quatro passos, nenhum deles vinculativo. Mantés o controlo em todos eles.",
  "peerSupport.step.01.title": "Diz-nos o que precisas",
  "peerSupport.step.01.body":
    "Publica no Hub ou envia mensagem a uma pessoa moderadora. Podes ser tão específico ou vago quanto quiseres — 'Comecei HRT agora e quero alguém que perceba' já chega.",
  "peerSupport.step.02.title": "Emparelhamos-te, com cuidado",
  "peerSupport.step.02.body":
    "Uma pessoa moderadora sugere uma ou duas pessoas cuja experiência se cruza com a tua. Nada é automático e ninguém vê o teu pedido além da equipa de moderação. Dizes que sim ou ainda não.",
  "peerSupport.step.03.title": "Tu defines o formato",
  "peerSupport.step.03.body":
    "Um café, uma caminhada, uma nota de voz uma vez por semana, ou o círculo às quintas-feiras — o que for sustentável para os dois. Não há compromisso mínimo nem estranheza em parar.",
  "peerSupport.step.04.title": "Também podes tornar-te uma pessoa de apoio",
  "peerSupport.step.04.body":
    "A maioria das pessoas que recebem apoio acaba por apoiar outra pessoa mais tarde. Quando estiveres pronte, diz a uma pessoa moderadora. Fazemos uma orientação curta e sem pressão sobre como acolher espaço e manter a confidencialidade.",
  "peerSupport.outro.title": "Não tens de carregar isto <em>sozinho.</em>",
  "peerSupport.outro.sub":
    "O Hub está aqui, e o fórum mais alargado da comunidade também.",
  "peerSupport.outro.hubCta": "Ir para o Trans Hub",
  "peerSupport.outro.forumCta": "Abrir o fórum",

  // ── AccessibleLisbonPage (+ accessibleLisbon.data.ts) ───────────────────
  "accessibleLisbon.meta.title":
    "Lisboa acessível: percursos sem degraus e espaços calmos",
  "accessibleLisbon.meta.description":
    "Lisboa acessível verificada pela comunidade — percursos sem degraus, bares e cafés de baixo estímulo sensorial, e parques para famílias, testados por quem lá esteve.",
  "accessibleLisbon.hero.eyebrow": "Lisboa Acessível",
  "accessibleLisbon.hero.title": "Lisboa, <em>verdadeiramente acessível.</em>",
  "accessibleLisbon.hero.lead":
    "Percursos sem degraus, espaços de baixo estímulo sensorial e locais para famílias — cada entrada verificada por alguém da comunidade que lá esteve. Se está na lista, alguém verificou pessoalmente.",
  "accessibleLisbon.verifiedTag": "Verificado por pares",

  "accessibleLisbon.group.routes.label": "Percursos de corrida sem degraus",
  "accessibleLisbon.group.routes.intro":
    "Circuitos que o grupo de corrida já percorreu a pé — piso plano e uniforme, sem escadas nem lancis para transpor.",
  "accessibleLisbon.group.venues.label": "Espaços sociais",
  "accessibleLisbon.group.venues.intro":
    "Cafés e restaurantes onde pessoas da comunidade já estiveram pessoalmente. Só entram na lista sítios que alguém verificou de facto.",
  "accessibleLisbon.group.family.label": "Locais para famílias",
  "accessibleLisbon.group.family.intro":
    "Parques e espaços que funcionam com carrinhos de bebé, crianças pequenas e o ocasional colapso — escolhidos pelo grupo de pais.",

  "accessibleLisbon.place.parqueNacoes.detail":
    "7 km, completamente plano, alcatrão largo todo o percurso. O circuito mais fácil para começar, sem degraus a partir do elevador nascente.",
  "accessibleLisbon.place.belemAlges.detail":
    "5 km de ida e volta ao longo do rio. Suave, aberto, e podes voltar para trás em qualquer ponto.",
  "accessibleLisbon.place.alamedaGulbenkian.detail":
    "4 km por jardins e passeios largos. Uma subida ligeira, o resto é nivelado.",
  "accessibleLisbon.place.arquivo.detail":
    "Café-biblioteca, genuinamente sossegado, entrada nivelada a partir da praça. Bom para encontros de baixo ruído.",
  "accessibleLisbon.place.mariaCaxuxa.detail":
    "Entrada sem degraus, aro magnético auditivo, casa de banho acessível, e equipa que sabe o que faz.",
  "accessibleLisbon.place.heim.detail":
    "Com lugares sentados, música baixa, bom café. Um pequeno degrau à entrada — a equipa traz uma rampa se pedires.",
  "accessibleLisbon.place.trindade.detail":
    "Acessível pela entrada do Chiado; a sala de trás, mais sossegada, tem excelente acústica para um grupo.",
  "accessibleLisbon.place.jardimEstrela.detail":
    "Parque infantil vedado, percursos sem degraus, café e casas de banho no local. O relvado de piquenique junto ao chafariz pode ser reservado.",
  "accessibleLisbon.place.eduardoVii.detail":
    "Relvados largos e planos na parte de baixo, acesso fácil com carrinho a partir do Marquês. Evita a subida íngreme no verão.",
  "accessibleLisbon.place.gulbenkianGardens.detail":
    "Sombra, lagos, patos, e percursos suaves por todo o lado. Calmo e raramente cheio em manhãs de semana.",

  "accessibleLisbon.flag.7km": "7 km",
  "accessibleLisbon.flag.tarmac": "Alcatrão",
  "accessibleLisbon.flag.stepFree": "Sem degraus",
  "accessibleLisbon.flag.5km": "5 km",
  "accessibleLisbon.flag.flat": "Plano",
  "accessibleLisbon.flag.turnBackAnywhere": "Podes voltar a qualquer ponto",
  "accessibleLisbon.flag.4km": "4 km",
  "accessibleLisbon.flag.mostlyLevel": "Maioritariamente nivelado",
  "accessibleLisbon.flag.lowNoise": "Baixo ruído",
  "accessibleLisbon.flag.seated": "Lugares sentados",
  "accessibleLisbon.flag.hearingLoop": "Aro magnético auditivo",
  "accessibleLisbon.flag.accessibleWc": "Casa de banho acessível",
  "accessibleLisbon.flag.rampOnRequest": "Rampa a pedido",
  "accessibleLisbon.flag.lowMusic": "Música baixa",
  "accessibleLisbon.flag.stepFreeEntrance": "Entrada sem degraus",
  "accessibleLisbon.flag.quietBackRoom": "Sala de trás sossegada",
  "accessibleLisbon.flag.playground": "Parque infantil",
  "accessibleLisbon.flag.toilets": "Casas de banho",
  "accessibleLisbon.flag.buggyFriendly": "Acesso com carrinho de bebé",
  "accessibleLisbon.flag.openSpace": "Espaço aberto",
  "accessibleLisbon.flag.shaded": "Com sombra",
  "accessibleLisbon.flag.smoothPaths": "Percursos suaves",
  "accessibleLisbon.flag.calm": "Calmo",

  "accessibleLisbon.outro.title":
    "Estiveste nalgum sítio <em>que funciona?</em>",
  "accessibleLisbon.outro.sub":
    "A lista só se mantém honesta porque continuamos a acrescentar-lhe coisas. Traz um local verificado para o quadro de recursos da tua comunidade.",
  "accessibleLisbon.outro.cta": "Encontrar um encontro",

  // ── ArtCritGuidePage (+ artCritGuide.data.ts) ───────────────────────────
  "artCritGuide.meta.title":
    "Como funcionam as críticas de grupo da Artes Arco-Íris",
  "artCritGuide.meta.description":
    "Como funcionam as sessões de crítica de grupo da Artes Arco-Íris — o método honesto, gentil e específico, os quatro passos, e exemplos de feedback útil.",
  "artCritGuide.hero.eyebrow": "Artes Arco-Íris",
  "artCritGuide.hero.title": "Como funcionam as <em>nossas críticas.</em>",
  "artCritGuide.hero.lead":
    "Honesto, gentil, específico — por esta ordem. Aqui está o método completo, para que a tua primeira crítica aberta pareça menos um teste e mais a sala do teu lado.",
  "artCritGuide.hero.anchor.principle": "O princípio",
  "artCritGuide.hero.anchor.flow": "Como decorre uma sessão",
  "artCritGuide.hero.anchor.examples": "O que dizer",

  "artCritGuide.principle.title": "O <em>princípio</em>",
  "artCritGuide.principle.body":
    "Honesto, gentil, específico — por esta ordem. Elogio vago não ajuda ninguém e crueldade disfarçada de honestidade é só crueldade. Criticamos o trabalho que está à nossa frente, nunca o currículo por trás dele nem a pessoa que o fez.",

  "artCritGuide.flow.title": "Como decorre <em>uma sessão</em>",
  "artCritGuide.flow.lead": "Da chegada ao café, em quatro momentos.",
  "artCritGuide.flow.step1.title": "Chegar e instalar-te",
  "artCritGuide.flow.step1.body":
    "Café primeiro. Começamos tarde de propósito para que ninguém esteja a criticar antes de tirar o casaco. Traz um trabalho, acabado ou não.",
  "artCritGuide.flow.step2.title": "Quem fez enquadra o trabalho",
  "artCritGuide.flow.step2.body":
    "Tens dois minutos para dizer o que é e — se quiseres — em que estás preso. Também podes não dizer nada e deixar o trabalho falar. Ambos são permitidos.",
  "artCritGuide.flow.step3.title": "A sala responde",
  "artCritGuide.flow.step3.body":
    "Vamos dando a volta. Observações específicas, depois perguntas, depois sugestões se convidadas. Falamos do que está na parede, não do que teríamos feito em vez disso.",
  "artCritGuide.flow.step4.title": "Quem fez fica com o que serve",
  "artCritGuide.flow.step4.body":
    "Nunca és obrigade a concordar. Fica com o que é útil, deixa o resto, e passamos ao próximo trabalho. Mesa comprida e comida a seguir.",

  "artCritGuide.examples.title": "O que <em>dizer</em>",
  "artCritGuide.examples.lead":
    "Específico vence simpático. Aqui está a diferença, nas próprias palavras da sala.",
  "artCritGuide.examples.tryThis": "Experimenta isto",
  "artCritGuide.examples.avoid": "Evita",
  "artCritGuide.example1.good":
    '"O coral lê-se como o ponto focal mas o olhar continua a ser puxado para o canto inferior esquerdo — é intencional?"',
  "artCritGuide.example1.avoid":
    '"Adoro!" (gentil, mas nada específico — não dá à pessoa nada com que trabalhar.)',
  "artCritGuide.example2.good":
    '"O bordo por acabar parece vivo; terminá-lo pode matar a tensão que aqui tens."',
  "artCritGuide.example2.avoid":
    '"Eu teria usado uma paleta diferente." (sobre o trabalho que terias feito, não o dela.)',
  "artCritGuide.example3.good":
    '"O que estavas a tentar fazer com o espaço negativo? Pode estar a fazer mais do que pensas."',
  "artCritGuide.example3.avoid":
    '"Isto não está mesmo a funcionar." (um veredito sem porta de saída.)',

  "artCritGuide.outro.title": "Traz <em>um trabalho.</em>",
  "artCritGuide.outro.sub":
    "Acabado ou não — meio acabado é exatamente para que serve uma crítica. Encontra a próxima crítica aberta no quadro.",
  "artCritGuide.outro.cta": "Encontrar a próxima crítica",

  // ── ComingOutAtWorkPage (+ comingOutAtWork.data.ts) ─────────────────────
  "comingOutAtWork.meta.title":
    "Sair do armário no trabalho: timing, frases e direitos",
  "comingOutAtWork.meta.description":
    "Um guia prático para sair do armário no trabalho em Portugal — como ler o ambiente, frases para colegas, e o que fazer se correr mal.",
  // VOICES stay English — attributed peer quotes (a member's own words).
  "comingOutAtWork.hero.eyebrow": "Saída do Armário · No Trabalho",
  "comingOutAtWork.hero.title": "Sair do armário <em>no trabalho.</em>",
  "comingOutAtWork.hero.lead":
    "Não há uma única forma certa nem um prazo. Este é um guia prático para leres o teu local de trabalho, teres a conversa nos teus termos, e conheceres os teus direitos se correr mal.",
  "comingOutAtWork.hero.anchor.timing": "Há um momento certo?",
  "comingOutAtWork.hero.anchor.signals": "Ler o teu local de trabalho",
  "comingOutAtWork.hero.anchor.scripts": "A conversa",
  "comingOutAtWork.hero.anchor.bad": "Se correr mal",

  "comingOutAtWork.timing.title": "Há um <em>momento certo?</em>",
  "comingOutAtWork.timing.lead": "Resposta curta: só o teu.",
  "comingOutAtWork.timing1.title": "Não há um momento certo universal",
  "comingOutAtWork.timing1.body":
    "Quem te disser que há um momento correto está a vender-te alguma coisa. O momento certo é o que for certo para a tua segurança, as tuas finanças, e a tua paz de espírito — por esta ordem.",
  "comingOutAtWork.timing2.title": "Segurança primeiro",
  "comingOutAtWork.timing2.body":
    "Se sair do armário puder pôr em risco o teu emprego, visto, ou habitação, esse cálculo pode vir primeiro. Proteger-te não é o mesmo que esconder-te.",
  "comingOutAtWork.timing3.title": "Podes fazê-lo em graus",
  "comingOutAtWork.timing3.body":
    "Estar fora do armário para uma colega de confiança é uma escolha completa e válida. Não deves um anúncio a todo o escritório, nunca.",

  "comingOutAtWork.signals.title": "Ler o teu <em>local de trabalho</em>",
  "comingOutAtWork.signals.lead":
    "Nenhum destes é decisivo por si só — mas juntos dizem-te muito.",
  "comingOutAtWork.signals.goodBadge": "Sinal verde",
  "comingOutAtWork.signals.cautionBadge": "Cuidado",
  "comingOutAtWork.signal1.text":
    "Colegas LGBTQ+ visíveis, fora do armário e que parecem bem",
  "comingOutAtWork.signal2.text":
    "Uma política escrita de não discriminação que nomeia orientação sexual e identidade de género",
  "comingOutAtWork.signal3.text":
    "Linguagem inclusiva na conversa do dia a dia — parceiros/as, não suposições",
  "comingOutAtWork.signal4.text":
    "Piadas que ficam por contestar, inclusive por parte de chefias",
  "comingOutAtWork.signal5.text":
    "Uma cultura em que a vida pessoal é policiada ou motivo de fofoca",
  "comingOutAtWork.signal6.text":
    "Sem RH, ou um RH que reporta diretamente à pessoa a quem estarias a revelar-te",

  "comingOutAtWork.scripts.title": "Ter a <em>conversa</em>",
  "comingOutAtWork.scripts.lead":
    "Palavras que podes pedir emprestadas. Ajusta-as até soarem como tu.",
  "comingOutAtWork.script1.context": "Discreto, a uma colega",
  "comingOutAtWork.script1.line":
    '"A minha namorada — ela chama-se Ana — e eu fomos a Sintra no fim de semana." Dito de passagem, resolve tudo sem precisar de uma conversa marcada.',
  "comingOutAtWork.script2.context": "Se quiseres ser deliberade",
  "comingOutAtWork.script2.line":
    '"Queria mencionar, já que trabalhamos de perto — sou gay. Não é grande coisa para mim no dia a dia, só não queria continuar a editar-me à tua frente."',
  "comingOutAtWork.script3.context": "A definir um limite ao mesmo tempo",
  "comingOutAtWork.script3.line":
    '"Tenho todo o gosto em responder a perguntas, mas preferia que não se tornasse o assunto. Obrigade por manteres isto normal."',

  "comingOutAtWork.bad.title": "Se correr <em>mal</em>",
  "comingOutAtWork.bad1.title": "Documenta tudo",
  "comingOutAtWork.bad1.body":
    "Datas, palavras, testemunhas. A discriminação com base na orientação sexual ou identidade de género é ilegal em Portugal, e um registo é o que transforma uma experiência num caso.",
  "comingOutAtWork.bad2.title": "Tens direitos",
  "comingOutAtWork.bad2.body":
    "Não podes ser legalmente despedide ou assediade por seres queer. A ACT trata queixas de discriminação no trabalho, e podes reportar de forma anónima. A nossa página de apoio jurídico tem os modelos.",
  "comingOutAtWork.bad3.title": "Não estás sozinhe nisto",
  "comingOutAtWork.bad3.body":
    "O espaço de saída do armário e a comunidade mais alargada já acompanharam pessoas exatamente nisto. Traz o assunto ao fórum — vais encontrar pessoas que sobreviveram à mesma chefia.",

  "comingOutAtWork.outro.title": "O teu calendário é <em>teu.</em>",
  "comingOutAtWork.outro.sub":
    "Conhece os teus direitos antes de precisares deles, e apoia-te em quem já passou por isto.",
  "comingOutAtWork.outro.rightsCta": "Conhecer os teus direitos no trabalho",
  "comingOutAtWork.outro.talkCta": "Falar sobre isto",

  // ── DisabilityHealthcarePage (+ disabilityHealthcare.data.ts) ───────────
  "disabilityHealthcare.meta.title":
    "Deficiência e doença crónica: saúde em Portugal",
  "disabilityHealthcare.meta.description":
    "Um guia prático para navegar a saúde portuguesa com deficiência ou doença crónica — adaptações, referenciações, médicos de família acessíveis e seguros.",
  // STEPS are administrative/navigational guidance — translated. TIPS stay
  // English — attributed peer quotes (a member's own words).
  "disabilityHealthcare.hero.eyebrow": "Disabled Queers",
  "disabilityHealthcare.hero.title": "O sistema, <em>navegado.</em>",
  "disabilityHealthcare.hero.lead":
    "Como avançar na saúde portuguesa com uma deficiência ou doença crónica — adaptações, referenciações, médicos de família atentos à acessibilidade, e o labirinto dos seguros — sem que se torne uma consulta sobre a tua identidade.",
  "disabilityHealthcare.hero.anchor.steps": "Passo a passo",
  "disabilityHealthcare.hero.anchor.tips": "Dicas entre pares",

  "disabilityHealthcare.steps.title": "Passo a <em>passo</em>",
  "disabilityHealthcare.steps.lead":
    "Nunca perguntes a alguém aqui qual é o seu diagnóstico — e espera o mesmo cuidado por parte do sistema.",
  "disabilityHealthcare.step1.title": "Regista as tuas adaptações",
  "disabilityHealthcare.step1.body":
    "Pede ao teu Centro de Saúde para registar as tuas necessidades de acesso no processo — mobilidade, sensoriais, comunicação. Uma vez no sistema, deixas de ter de as reexplicar em cada consulta, e as marcações podem ser feitas em conformidade.",
  "disabilityHealthcare.step2.title": "Pede referenciações sem rodeios",
  "disabilityHealthcare.step2.body":
    "Tens direito a uma referenciação para especialista sem que isso se torne uma consulta sobre a tua identidade. Um pequeno resumo escrito do teu historial, entregue no início, mantém a consulta focada no motivo real da tua vinda.",
  "disabilityHealthcare.step3.title":
    "Escolhe médicos de família atentos à acessibilidade",
  "disabilityHealthcare.step3.body":
    "Algumas clínicas em Lisboa são visivelmente melhores — sem degraus, sem pressa, dispostas a escrever as coisas. O grupo mantém uma lista feita por pares; pergunta no espaço por nomes atuais.",
  "disabilityHealthcare.step4.title": "Navega a papelada dos seguros",
  "disabilityHealthcare.step4.body":
    "A papelada de reembolsos e do atestado de incapacidade é um labirinto à parte. Guarda cópias de tudo, pede decisões por escrito, e apoia-te no grupo — alguém já preencheu o mesmo formulário.",

  "disabilityHealthcare.tips.title": "Dicas <em>entre pares</em>",

  "disabilityHealthcare.outro.title": "Tu defines os <em>termos.</em>",
  "disabilityHealthcare.outro.sub":
    "Conhece os teus direitos, e nunca navegues isto sozinhe. A página jurídica e o grupo estão ambos aqui.",
  "disabilityHealthcare.outro.rightsCta": "Conhecer os teus direitos",
  "disabilityHealthcare.outro.askCta": "Perguntar ao grupo",

  // ── FirstMeetupGuidePage (+ firstMeetupGuide.data.ts) ───────────────────
  "firstMeetupGuide.meta.title":
    "O teu primeiro encontro QueerPulse: o que esperar",
  "firstMeetupGuide.meta.description":
    "O que acontece de facto num primeiro encontro presencial, o que 'sem agenda' significa na prática, e respostas às perguntas que quem chega tem medo de fazer.",
  "firstMeetupGuide.hero.eyebrow": "Queer Social",
  "firstMeetupGuide.hero.title":
    "O teu primeiro encontro, <em>sem pressão.</em>",
  "firstMeetupGuide.hero.lead":
    'O que esperar, o que "sem agenda" realmente significa, e respostas às coisas que estás demasiado nervoso/a para perguntar. Vem sozinho, vem ansioso — vais ser bem cuidade.',
  "firstMeetupGuide.hero.anchor.expect": "O que esperar",
  "firstMeetupGuide.hero.anchor.values": "Os nossos valores",
  "firstMeetupGuide.hero.anchor.faq": "Perguntas nervosas",

  "firstMeetupGuide.expect.title": "O que <em>esperar</em>",
  "firstMeetupGuide.expect.lead":
    "O formato todo, para que nada seja surpresa.",
  "firstMeetupGuide.expect1.title": "Sem agenda, sem proposta",
  "firstMeetupGuide.expect1.body":
    "Ninguém te vai perguntar o que fazes profissionalmente nem tentar recrutar-te para nada. O formato é este: aparece, fala com quem calhar ao teu lado, sai quando quiseres.",
  "firstMeetupGuide.expect2.title": "A mesa de troca de livros",
  "firstMeetupGuide.expect2.body":
    "Normalmente há uma pequena pilha de livros na mesa. Traz um, leva um, ou usa-a só para teres algo que fazer com as mãos nos primeiros dez minutos. Funciona.",
  "firstMeetupGuide.expect3.title": "Vem sozinho ou traz alguém",
  "firstMeetupGuide.expect3.body":
    "A maioria das pessoas vem sozinha da primeira vez. Vais ser bem cuidade. Se ajudar trazer une amigue, traz une amigue — ambos são completamente normais.",

  "firstMeetupGuide.values.title": 'O que "sem agenda" <em>significa</em>',
  "firstMeetupGuide.values.lead":
    "Quatro coisas a que nos mantemos fiéis, para que a sala continue fácil para todes.",
  "firstMeetupGuide.value1":
    "Não precisas de estar fora do armário, ou fora de uma forma específica, para estares aqui.",
  "firstMeetupGuide.value2":
    "Pede sempre autorização antes de tirar fotografias — de todes.",
  "firstMeetupGuide.value3":
    "Cuidamos de quem vem pela primeira vez; todes já fomos isso um dia.",
  "firstMeetupGuide.value4":
    "O que se partilha presencialmente fica presencialmente.",

  "firstMeetupGuide.faq.title": "As perguntas <em>nervosas</em>",
  "firstMeetupGuide.faq1.q": "E se eu não conhecer ninguém?",
  "firstMeetupGuide.faq1.a":
    "Ninguém conhece, da primeira vez. A pessoa anfitriã chega cedo especificamente para receber as pessoas à porta e apresentar-te. Diz que és nove por aqui — é a frase mais fácil de dizer aqui.",
  "firstMeetupGuide.faq2.q": "E se eu estiver mesmo nervoso/a?",
  "firstMeetupGuide.faq2.a":
    "Quase todes estão, e quase todes quase dão meia-volta à porta. As pessoas que estão a preparar as mesas este mês fizeram exatamente isso no primeiro encontro delas. Fica fácil depressa.",
  "firstMeetupGuide.faq3.q": "Como vou encontrar o grupo?",
  "firstMeetupGuide.faq3.a":
    "A pessoa anfitriã publica onde vai estar e o que vai vestir — normalmente numa entrada ou elevador específico, a uma hora marcada, e depois todes seguem juntes. Vê a publicação fixada do encontro.",
  "firstMeetupGuide.faq4.q": "Tenho de ficar o tempo todo?",
  "firstMeetupGuide.faq4.a":
    "Não. Sai quando quiseres, sem precisares de explicar. Ficar vinte minutos também conta como teres vindo.",

  "firstMeetupGuide.outro.title": "Basta <em>aparecer.</em>",
  "firstMeetupGuide.outro.sub":
    "É esse o único requisito de entrada. O próximo encontro está no quadro.",
  "firstMeetupGuide.outro.cta": "Encontrar o próximo encontro",

  // ── GroupShowArchivePage (+ groupShowArchive.data.ts) ───────────────────
  "groupShowArchive.meta.title":
    "Artes Arco-Íris: arquivo de todas as exposições",
  "groupShowArchive.meta.description":
    "Um arquivo de todas as exposições de grupo da Artes Arco-Íris — datas, locais e o que foi feito, desde o primeiro pop-up até à residência mais recente.",
  // SHOWS (title/when/venue/blurb) are an archival record of real community
  // shows — kept English per the scope rule. Only the chrome is translated.
  "groupShowArchive.hero.eyebrow": "Artes Arco-Íris · Arquivo",
  "groupShowArchive.hero.title": "Tudo o que já <em>pendurámos.</em>",
  "groupShowArchive.hero.lead":
    "O coletivo documenta todas as exposições antes de as desmontarmos. Aqui está o arquivo — encontra-te a ti mesme, leva o que tiver o teu trabalho, e vê o que a sala fez em conjunto.",
  "groupShowArchive.hero.anchor.shows": "As exposições",

  "groupShowArchive.shows.title": "As <em>exposições</em>",
  "groupShowArchive.shows.lead":
    "Mais recentes primeiro. Os conjuntos completos de fotos estão em cada álbum.",

  "groupShowArchive.outro.title":
    "Documentado <em>generosamente,</em> creditado sempre.",
  "groupShowArchive.outro.sub":
    "Fotografaste a última exposição? Junta o teu conjunto ao arquivo para que o trabalho de ninguém desapareça quando as paredes vierem abaixo.",
  "groupShowArchive.outro.cta": "Ver próximas exposições",

  // ── IngredientsMapPage (+ ingredientsMap.data.ts) ───────────────────────
  "ingredientsMap.meta.title": "Onde encontrar ingredientes de casa em Lisboa",
  "ingredientsMap.meta.description":
    "Um mapa feito pela comunidade de mercearias, mercados e bancas em Lisboa com ingredientes de casa — organizado por bairro, da Mouraria a Marvila.",
  "ingredientsMap.hero.eyebrow": "Queer POC",
  "ingredientsMap.hero.title": "Ingredientes de <em>casa.</em>",
  "ingredientsMap.hero.lead":
    "Um mapa vivo de onde encontrar os sabores de casa em Lisboa — reunido pelo grupo, organizado por bairro. Casa é em parte um sabor, e é aqui que se encontra.",

  "ingredientsMap.intro":
    "Trinta e quatro locais, catorze países, tudo reunido pelo grupo. Este mapa existe porque casa é em parte um sabor, e encontrá-lo numa cidade nova é uma forma própria de pertença. Encontraste um sítio que falta? Nunca é tarde para acrescentares o teu.",

  "ingredientsMap.hood.mourariaIntendente": "Mouraria e Intendente",
  "ingredientsMap.hood.anjosArroios": "Anjos e Arroios",
  "ingredientsMap.hood.marvilaBeato": "Marvila e Beato",

  "ingredientsMap.spot.mercearia.finds":
    "Produtos essenciais cabo-verdianos — milho para cachupa, coentros frescos, óleo de palma.",
  "ingredientsMap.spot.mercearia.origin": "Cabo Verde",
  "ingredientsMap.spot.mercearia.hours": "Seg–Sáb, melhor de manhã",
  "ingredientsMap.spot.lojaBengali.finds":
    "Especiarias do sul da Ásia a peso, dals, óleo de mostarda, paneer fresco aos fins de semana.",
  "ingredientsMap.spot.lojaBengali.origin": "Bangladeche · Índia",
  "ingredientsMap.spot.lojaBengali.hours": "Diariamente até tarde",
  "ingredientsMap.spot.tropical.finds":
    "Banana-plátano, inhame, malagueta scotch bonnet, peixe seco de cozinhas da África Ocidental.",
  "ingredientsMap.spot.tropical.origin": "Nigéria · Gana",
  "ingredientsMap.spot.tropical.hours": "Seg–Sáb",
  "ingredientsMap.spot.padaria.finds":
    "Padaria cabo-verdiana — aberta aos sábados de manhã, esgota depressa.",
  "ingredientsMap.spot.padaria.origin": "Cabo Verde",
  "ingredientsMap.spot.padaria.hours": "Sáb de manhã",
  "ingredientsMap.spot.mercado.finds":
    "Produtos brasileiros — mandioca, açaí, guaraná, fruta tropical fresca.",
  "ingredientsMap.spot.mercado.origin": "Brasil",
  "ingredientsMap.spot.mercado.hours": "Ter–Dom",
  "ingredientsMap.spot.asiaMarket.finds":
    "Do leste e sudeste asiático — farinhas de arroz, ervas frescas, tofu, kimchi.",
  "ingredientsMap.spot.asiaMarket.origin": "Vietname · Coreia · China",
  "ingredientsMap.spot.asiaMarket.hours": "Diariamente",

  "ingredientsMap.missing.prompt": "Conheces um sítio que falta?",
  "ingredientsMap.missing.cta": "Adicionar o teu sítio",
  "ingredientsMap.missing.toast":
    "Adicionado à fila — uma pessoa moderadora vai colocá-lo no mapa. Obrigada!",

  "ingredientsMap.outro.title":
    "A alegria é tão <em>política</em> quanto a solidariedade.",
  "ingredientsMap.outro.sub":
    "O mapa é uma das melhores coisas que fizemos juntes. Traz o resto de ti também para o grupo.",
  "ingredientsMap.outro.cta": "Juntar-te à conversa",

  // ── LgbtqAgingGuidePage (+ lgbtqAgingGuide.data.ts) ─────────────────────
  "lgbtqAgingGuide.meta.title":
    "Envelhecer LGBTQ+ em Portugal: saúde a partir dos 50",
  "lgbtqAgingGuide.meta.description":
    "Navegar a saúde portuguesa como pessoa LGBTQ+ com mais de 50 anos — encontrar médicos e hospitais afirmativos, opções de cuidados e apoio em saúde mental.",
  "lgbtqAgingGuide.hero.eyebrow": "Queer Elders",
  "lgbtqAgingGuide.hero.title": "Envelhecer nos <em>teus próprios termos.</em>",
  "lgbtqAgingGuide.hero.lead":
    "Navegar a saúde portuguesa como pessoa LGBTQ+ com mais de 50 anos — médicos de família, hospitais, cuidados, e saúde mental, com a história específica que carregas tomada como dada, não como surpresa.",
  "lgbtqAgingGuide.hero.anchor.topics": "O essencial",
  "lgbtqAgingGuide.hero.anchor.links": "Ligações úteis",

  "lgbtqAgingGuide.topics.title": "O <em>essencial</em>",
  "lgbtqAgingGuide.topics.lead":
    "Simples, prático, e escrito pelo grupo que o usa. Recentemente traduzido para português.",
  "lgbtqAgingGuide.topic1.title":
    "Encontrar um médico de família que não torne isto estranho",
  "lgbtqAgingGuide.topic1.body":
    "Podes pedir a um Centro de Saúde que registe os teus pronomes e a tua parceria, e mudar de médico se um deles for desdenhoso. Traz um resumo escrito do teu historial para não teres de explicar a tua vida do zero em cada consulta.",
  "lgbtqAgingGuide.topic2.title":
    "Hospitais e referenciações para especialistas",
  "lgbtqAgingGuide.topic2.body":
    "As suposições sobre familiares mais próximos ainda complicam parcerias do mesmo sexo em contexto hospitalar. Um simples documento assinado nomeando a tua parceria como contacto e decisora evita a maioria dos problemas antes de começarem.",
  "lgbtqAgingGuide.topic3.title": "Cuidados a idosos e habitação",
  "lgbtqAgingGuide.topic3.body":
    "Pergunta diretamente a qualquer instituição de cuidados sobre a experiência que têm com residentes LGBTQ+ e casais do mesmo sexo. As boas respondem sem rodeios; a própria resposta diz-te quase tudo o que precisas de saber.",
  "lgbtqAgingGuide.topic4.title": "Saúde mental em idade avançada",
  "lgbtqAgingGuide.topic4.body":
    "O isolamento e toda uma vida de cautela cobram o seu preço. Existe terapia afirmativa a qualquer idade, e o grupo de pessoas idosas mantém uma pequena lista de profissionais que compreendem a história particular que carregas.",

  "lgbtqAgingGuide.links.title": "Ligações <em>úteis</em>",
  "lgbtqAgingGuide.link.ilga.label": "ILGA Portugal — serviços",
  "lgbtqAgingGuide.link.ilga.note":
    "Apoio, ajuda jurídica, e programas comunitários, incluindo para pessoas LGBTQ+ mais velhas.",
  "lgbtqAgingGuide.link.sns24.label": "Linha de saúde SNS 24",
  "lgbtqAgingGuide.link.sns24.note":
    "808 24 24 24 · linha nacional de saúde 24h para triagem e aconselhamento.",

  "lgbtqAgingGuide.outro.title": "A vida mais tarde, <em>bem acompanhada.</em>",
  "lgbtqAgingGuide.outro.sub":
    "Se o que precisas é falar com alguém, o diretório de saúde mental é afirmativo a qualquer idade.",
  "lgbtqAgingGuide.outro.cta": "Encontrar apoio afirmativo",

  // ── OralHistoryProjectPage (+ oralHistoryProject.data.ts) ───────────────
  // VOICES stay English — attributed peer quotes (a member's own words).
  "oralHistoryProject.meta.title":
    "Projeto de histórias orais LGBTQ+ em Lisboa: participa",
  "oralHistoryProject.meta.description":
    "Estamos a gravar as vidas de pessoas LGBTQ+ mais velhas em Lisboa — só voz, se preferires, sem necessidade de rosto, e sempre nos teus termos.",

  "oralHistoryProject.hero.eyebrow": "Queer Elders · História Oral",
  "oralHistoryProject.hero.title":
    "A tua história vale a pena <em>guardar.</em>",
  "oralHistoryProject.hero.lead":
    "Estamos a gravar as vidas de pessoas LGBTQ+ mais velhas em Lisboa — só voz, se preferires, sem necessidade de rosto, inteiramente nos teus termos. Aqui está o que participar realmente significa.",
  "oralHistoryProject.hero.anchor.about": "Sobre o projeto",
  "oralHistoryProject.hero.anchor.how": "Como participar",
  "oralHistoryProject.hero.anchor.voices": "Nas palavras delas",

  "oralHistoryProject.about.title": "Sobre o <em>projeto</em>",
  "oralHistoryProject.about.body":
    "Estamos a gravar as vidas de pessoas LGBTQ+ mais velhas em Lisboa antes que essas histórias se percam — as comuns, especialmente. A tua história não precisa de ser dramática para valer a pena guardar. A história entra na sala e senta-se.",

  "oralHistoryProject.how.title": "Como <em>participar</em>",
  "oralHistoryProject.how.lead":
    "Quatro passos, e mantés o controlo em todos eles.",
  "oralHistoryProject.step1.title": "Diz que tens interesse",
  "oralHistoryProject.step1.body":
    "Uma palavra discreta a uma pessoa moderadora ou uma nota no grupo é tudo o que é preciso. Não há formulário nem compromisso ainda — só uma conversa sobre se parece certo.",
  "oralHistoryProject.step2.title": "Escolhe como apareces",
  "oralHistoryProject.step2.body":
    "Só voz está perfeitamente bem; nunca é exigido rosto. Tu decides o que é gravado, o que fica fora de registo, e a que nome fica associado.",
  "oralHistoryProject.step3.title": "Grava ao teu ritmo",
  "oralHistoryProject.step3.body":
    "A Sofia faz as entrevistas, com calma, em quantas sessões quiseres. Podes pausar, revisitar, ou parar totalmente a qualquer momento, e nada é usado sem o teu sim final.",
  "oralHistoryProject.step4.title": "Decide como é usado",
  "oralHistoryProject.step4.body":
    "Só arquivo, exibição comunitária, ou parte do documentário — a tua escolha, e pode mudar mais tarde. Mantés o direito de retirar a tua gravação.",
  "oralHistoryProject.participateCta": "Gostava de participar",
  "oralHistoryProject.participateToast":
    "Obrigade — a Sofia vai contactar-te com calma para conversar sobre isto. Sem compromisso.",

  "oralHistoryProject.voices.title": "Nas <em>palavras delas</em>",

  "oralHistoryProject.outro.title": "História, <em>mantida honesta.</em>",
  "oralHistoryProject.outro.sub":
    "Ainda não estás pronte para gravar mas queres ajudar? O grupo precisa sempre de ouvintes e transcritores.",
  "oralHistoryProject.outro.cta": "Perguntar como ajudar",

  // ── QtipocArchivePage (+ qtipocArchive.data.ts) ─────────────────────────
  // PIECES (title/kind/year/blurb) are an archival record — kept English.
  "qtipocArchive.meta.title":
    "Arquivo QTIPOC: memória viva da comunidade queer em Lisboa",
  "qtipocArchive.meta.description":
    "Um arquivo vivo da vida QTIPOC em Lisboa — ensaios fotográficos, escrita, gravações e documentos, contribuídos e creditados por quem os criou.",

  "qtipocArchive.hero.eyebrow": "Queer POC · Arquivo",
  "qtipocArchive.hero.title": "Guardado por nós, <em>para nós.</em>",
  "qtipocArchive.hero.lead":
    "Um arquivo vivo da vida QTIPOC em Lisboa — ensaios fotográficos, escrita, gravações, documentos. Contribuído, creditado, e guardado com cuidado. Credita todo o trabalho, especialmente o emocional.",
  "qtipocArchive.hero.anchor.about": "Sobre o arquivo",
  "qtipocArchive.hero.anchor.collection": "A coleção",

  "qtipocArchive.about.title": "Sobre o <em>arquivo</em>",
  "qtipocArchive.about.body":
    "Um arquivo vivo, mantido pela comunidade, da vida QTIPOC em Lisboa — ensaios fotográficos, textos escritos, gravações, e documentos, guardados por nós e para nós. Nada aqui é extraído; tudo é contribuído, creditado, e guardado com cuidado.",

  "qtipocArchive.collection.title": "A <em>coleção</em>",
  "qtipocArchive.collection.lead":
    "Mais recentes primeiro. Toca em qualquer peça para o conjunto completo.",
  "qtipocArchive.contribute.prompt":
    "Tens algo para acrescentar — uma foto, uma peça, uma gravação?",
  "qtipocArchive.contribute.cta": "Contribuir para o arquivo",
  "qtipocArchive.contribute.toast":
    "Obrigade — uma pessoa moderadora vai contactar-te sobre como o acrescentar, com crédito completo e nos teus termos.",

  "qtipocArchive.outro.title": "Nada aqui é <em>extraído.</em>",
  "qtipocArchive.outro.sub":
    "Tudo é dado, nos termos de quem contribui. Traz o teu quando estiveres pronte.",
  "qtipocArchive.outro.cta": "Falar com o grupo",

  // ── QtipocOrganisationsPage (+ qtipocOrganisations.data.ts) ─────────────
  // ORGS (name/mission/offers/tags) are a directory record — kept English.
  "qtipocOrganisations.meta.title":
    "Organizações QTIPOC em Portugal e como contactá-las",
  "qtipocOrganisations.meta.description":
    "Grupos por todo o Portugal a trabalhar onde raça e diversidade sexual e de género se encontram — o que fazem, o que oferecem, e como contactá-las.",

  "qtipocOrganisations.hero.eyebrow": "Queer POC",
  "qtipocOrganisations.hero.title":
    "Organizações que <em>seguram tudo isto.</em>",
  "qtipocOrganisations.hero.lead":
    "Grupos por todo o Portugal a trabalhar onde raça e queerness se encontram — nenhuma tratada como nota de rodapé da outra. O que fazem, o que oferecem, e como contactá-las.",
  "qtipocOrganisations.hero.anchor.orgs": "As organizações",
  "qtipocOrganisations.hero.anchor.verify": "Antes de te envolveres",

  "qtipocOrganisations.orgs.title": "As <em>organizações</em>",

  "qtipocOrganisations.verify.title": "Antes de te <em>envolveres</em>",
  "qtipocOrganisations.verify.body":
    "Antes de te envolveres com qualquer organização, vê como estão recentes e ativos os seus canais, e pergunta ao grupo se alguém já lidou diretamente com elas. A experiência vivida da comunidade é a melhor verificação que há — e se a tens, partilha-a.",

  "qtipocOrganisations.outro.title": "Conheces uma que nos <em>falta?</em>",
  "qtipocOrganisations.outro.sub":
    "Este diretório cresce de boca em boca. Traz as que te ajudaram.",
  "qtipocOrganisations.outro.cta": "Adicionar uma organização",

  // ── QueerPaediatriciansPage (+ queerPaediatricians.data.ts) ─────────────
  // PROVIDERS are a peer-reviewed directory record, akin to therapist bios —
  // kept English. HOW_IT_WORKS is chrome, translated.
  "queerPaediatricians.meta.title":
    "Pediatras LGBTQ+-friendly em Lisboa, recomendados por pais",
  "queerPaediatricians.meta.description":
    "Uma lista verificada por outros pais e mães de pediatras em Lisboa em quem as famílias LGBTQ+ realmente confiam — à vontade com duas mães ou dois pais no formulário, avaliados com honestidade.",

  "queerPaediatricians.hero.eyebrow": "Queer Parents",
  "queerPaediatricians.hero.title": "Médicos que <em>não hesitam.</em>",
  "queerPaediatricians.hero.lead":
    "Pediatras em Lisboa em quem famílias da rede realmente confiam — que não hesitam perante duas mães no formulário de admissão e que falam com ambas por igual. Verificados por pares, datados, honestos.",
  "queerPaediatricians.hero.anchor.list": "A lista",
  "queerPaediatricians.hero.anchor.how": "Como funciona",

  "queerPaediatricians.list.title": "A <em>lista</em>",
  "queerPaediatricians.list.lead":
    "Cada entrada foi acrescentada por um pai ou mãe que os consulta. As datas mostram a última verificação por pares.",
  "queerPaediatricians.suggest.prompt":
    "Conheces une pediatra que a comunidade devia ter?",
  "queerPaediatricians.suggest.cta": "Sugerir um profissional",
  "queerPaediatricians.suggest.toast":
    "Obrigade — uma pessoa moderadora da rede de pais vai dar seguimento para o acrescentar e verificar.",

  "queerPaediatricians.how.title": "Como funciona a <em>lista</em>",
  "queerPaediatricians.how1":
    "Mantida e verificada por pares: só pais e mães da rede acrescentam nomes, e só os que realmente consultam. Reverificamos as entradas regularmente e datamo-las para que saibas quão atuais estão.",
  "queerPaediatricians.how2":
    "Um nome aqui significa que uma família da comunidade confia nele — não que verificámos o seu registo clínico. Usa sempre o teu próprio critério, e diz-nos se a tua experiência for diferente para que a lista se mantenha honesta.",

  "queerPaediatricians.outro.title": "Pergunta à <em>rede.</em>",
  "queerPaediatricians.outro.sub":
    "Procuras algo específico — um dentista, um terapeuta para um adolescente? O fórum de pais é a forma mais rápida de chegar a um nome de confiança.",
  "queerPaediatricians.outro.cta": "Perguntar no fórum",

  // ── RunningGuidePage (+ runningGuide.data.ts) ───────────────────────────
  "runningGuide.meta.title":
    "Grupo de corrida queer em Lisboa: ritmos e o que levar",
  "runningGuide.meta.description":
    "O grupo de corrida da QueerPulse em Lisboa — três grupos de ritmo, do social ao mais exigente, o que levar à primeira corrida, e a regra mais importante: ninguém corre sozinhe.",

  "runningGuide.hero.eyebrow": "Queer Runners",
  "runningGuide.hero.title":
    "A tua primeira corrida, <em>com honestidade.</em>",
  "runningGuide.hero.lead":
    "Qual é o teu grupo de ritmo, o que trazer, e a coisa mais importante de todas: ninguém corre sozinhe e ninguém fica para trás. Aqui está tudo o que precisas antes de domingo.",
  "runningGuide.hero.anchor.pace": "Grupos de ritmo",
  "runningGuide.hero.anchor.bring": "O que trazer",

  "runningGuide.pace.title": "Qual grupo é <em>o teu</em>",
  "runningGuide.pace.lead":
    "Dividimo-nos em três grupos de ritmo no início. Escolhe o honesto, não o ambicioso — podes sempre subir na semana seguinte. Todos os ritmos pertencem aqui.",
  "runningGuide.pace1.name": "Lento e Social",
  "runningGuide.pace1.pace": "7:00–8:00 min/km · corrida-caminhada bem-vinda",
  "runningGuide.pace1.who":
    "Quem vem pela primeira vez, quem está a voltar de uma pausa, e quem quer mesmo conversar o percurso todo. Quem corre mais devagar dita o ritmo e ninguém fica nunca para trás.",
  "runningGuide.pace2.name": "Meio-Termo",
  "runningGuide.pace2.pace": "5:30–6:30 min/km · constante",
  "runningGuide.pace2.who":
    "Consegues correr 5 km sem parar e queres companhia a um ritmo confortável e sustentável. O maior grupo, e o mais fácil de encaixar.",
  "runningGuide.pace3.name": "Rápido e Focado",
  "runningGuide.pace3.pace": "4:30–5:15 min/km · treino",
  "runningGuide.pace3.who":
    "A construir para uma corrida ou à procura de um recorde pessoal. Continua social no café a seguir — só mais rápido na estrada. Reagrupamo-nos em cada curva para que o grupo nunca se separe de vez.",

  "runningGuide.bring.title": "O que <em>trazer</em>",
  "runningGuide.bring.lead":
    "Versão curta: menos do que pensas. Aqui está a lista completa.",
  "runningGuide.bring1.title": "Ténis em que já saibas correr",
  "runningGuide.bring1.note":
    "O que já tens serve para a primeira vez — não compres nada especial. Se as calçadas começarem a magoar-te os tornozelos, pergunta ao grupo; temos opiniões fortes sobre calçado à prova de Lisboa.",
  "runningGuide.bring2.title": "Camadas que possas tirar",
  "runningGuide.bring2.note":
    "As manhãs começam frescas e aquecem depressa. Algo que possas atar à cintura vale mais do que uma peça quente única.",
  "runningGuide.bring3.title": "Água para depois",
  "runningGuide.bring3.note":
    "Terminamos perto do café, por isso não precisas de levar muita — uma garrafa pequena chega para o percurso.",
  "runningGuide.bring4.title": "Nada a provar",
  "runningGuide.bring4.note":
    "Não precisas de um historial de corrida, de um certo corpo, ou de um objetivo. Aparecer é o único requisito de entrada. Vem pelo café e caminha o percurso se for essa a versão de hoje.",

  "runningGuide.outro.title": "Vemo-nos na <em>linha de partida.</em>",
  "runningGuide.outro.sub":
    "O café a seguir é metade do objetivo. Encontra a próxima corrida no quadro de encontros.",
  "runningGuide.outro.cta": "Encontrar a próxima corrida",

  // ── SchoolFormsGuidePage (+ schoolFormsGuide.data.ts) ───────────────────
  // Official form terms ("encarregado de educação", "mãe / pai") kept
  // byte-identical to the EN source — they are the real Portuguese terms.
  // VOICES stay English — attributed peer quotes (a member's own words).
  "schoolFormsGuide.meta.title":
    "Formulários de matrícula escolar para famílias queer em Lisboa",
  "schoolFormsGuide.meta.description":
    "Como navegar os formulários de admissão escolar sendo uma família queer ou com dois pais/mães em Lisboa — o que esperar nos campos, como pedir os dois nomes, e os teus direitos.",

  "schoolFormsGuide.hero.eyebrow": "Queer Parents",
  "schoolFormsGuide.hero.title": "Dois pais, <em>um só formulário.</em>",
  "schoolFormsGuide.hero.lead":
    "Formulários de admissão escolar, navegados: o que esperar nos campos, como pedir para os vossos dois nomes aparecerem em todo o lado, e os teus direitos quando um formulário ainda não acompanhou a tua família.",
  "schoolFormsGuide.hero.anchor.forms": "Sobre os formulários",
  "schoolFormsGuide.hero.anchor.rights": "Os teus direitos",
  "schoolFormsGuide.hero.anchor.voices": "O que outras pessoas fizeram",

  "schoolFormsGuide.forms.title": "Sobre os <em>formulários</em>",
  "schoolFormsGuide.forms.lead":
    "Três passos que resolvem a maior parte disto.",
  "schoolFormsGuide.form1.title": "Lê primeiro os campos dos pais",
  "schoolFormsGuide.form1.body":
    'Muitas escolas em Lisboa usam agora dois campos de "encarregado de educação" sem rótulo nem género especificado — podes colocar logo os vossos dois nomes. Onde um formulário ainda diz "mãe / pai", tens o direito de riscar e escrever o que é verdade.',
  "schoolFormsGuide.form2.title": "Pergunta antes de assumir o pior",
  "schoolFormsGuide.form2.body":
    "A maioria do pessoal administrativo diz que sim sem hesitar quando lhe pedes para usar os nomes de ambos os pais em todo o lado. Pergunta cedo, pergunta por escrito, e geralmente descobres que o formulário é a única coisa antiquada na escola.",
  "schoolFormsGuide.form3.title": "Obtém o acordo dos dois nomes por escrito",
  "schoolFormsGuide.form3.body":
    "Um pequeno email a confirmar que ambos os pais estão registados e são contactados por igual poupa-te a reexplicar isto em cada ida buscar o filho, em cada autorização de visita de estudo, e em cada reunião de pais, durante anos.",

  "schoolFormsGuide.rights.title": "Os teus <em>direitos</em>",
  "schoolFormsGuide.rights.lead":
    "Resumo em linguagem simples. Para o panorama jurídico completo, a página de apoio jurídico aprofunda mais.",
  "schoolFormsGuide.badge.protected": "Direito protegido",
  "schoolFormsGuide.badge.know": "Fica a saber",
  "schoolFormsGuide.badge.practical": "Prático",
  "schoolFormsGuide.right1.title": "Reconhecimento igual",
  "schoolFormsGuide.right1.body":
    'Pais do mesmo sexo têm estatuto legal totalmente igual como pais em Portugal. Uma escola não pode legalmente reconhecer apenas um de vocês, e ambos podem ser o "encarregado de educação" oficial.',
  "schoolFormsGuide.right2.title": "O nome do teu filho",
  "schoolFormsGuide.right2.body":
    "Filhos de casais do mesmo sexo podem usar os apelidos de ambos os pais. As escolas têm de usar o nome que consta nos documentos da criança — incluindo um nome escolhido onde os registos já tenham sido atualizados.",
  "schoolFormsGuide.right3.title": "Se uma escola resistir",
  "schoolFormsGuide.right3.body":
    "É raro, mas se acontecer, documenta e levanta a questão por escrito junto da direção da escola. A ILGA Portugal e a rede de pais podem ambas ajudar-te a escalar isto com calma.",

  "schoolFormsGuide.voices.title": "O que outras pessoas <em>fizeram</em>",

  "schoolFormsGuide.outro.title":
    "Não tens de <em>explicar a tua família.</em>",
  "schoolFormsGuide.outro.sub":
    "Conhece os teus direitos, e depois apoia-te na rede. A página de apoio jurídico tem os modelos.",
  "schoolFormsGuide.outro.legalCta": "Ler o guia jurídico",
  "schoolFormsGuide.outro.forumCta": "Perguntar ao fórum de pais",

  // ── SharedEquipmentPage (+ sharedEquipment.data.ts) ─────────────────────
  "sharedEquipment.meta.title":
    "Equipamento partilhado: o material do coletivo Rainbow Arts",
  "sharedEquipment.meta.description":
    "A risógrafa, o forno de cerâmica, o projetor e o kit de encadernação que o coletivo Rainbow Arts partilha em Lisboa — o que está disponível, como reservar, e como cuidamos do material.",

  "sharedEquipment.hero.eyebrow": "Artes Arco-Íris",
  "sharedEquipment.hero.title":
    "Material partilhado, <em>cuidado partilhado.</em>",
  "sharedEquipment.hero.lead":
    "O riso, o forno de cerâmica, o projetor — tudo o que o coletivo possui em conjunto, para que serve, e como reservá-lo. O trato é simples: reserva, limpa, regista.",
  "sharedEquipment.hero.anchor.kit": "O material",
  "sharedEquipment.hero.anchor.care": "Como cuidamos dele",

  "sharedEquipment.kit.title": "O <em>material</em>",
  "sharedEquipment.kit.lead":
    "Está tudo no atelier. Toca em pedir e uma pessoa moderadora confirma o teu horário.",
  "sharedEquipment.item1.name": "Risógrafo a duas cores",
  "sharedEquipment.item1.specs":
    "RZ recondicionado, A3, atualmente com coral + preto carregados. Fica no atelier para uso coletivo.",
  "sharedEquipment.item1.status": "Livre esta semana",
  "sharedEquipment.item2.name": "Forno elétrico de cerâmica",
  "sharedEquipment.item2.specs":
    "Modelo de carregamento superior, tamanho médio, cone 6. As cozeduras são agendadas — junta a tua à folha partilhada com uma semana de antecedência.",
  "sharedEquipment.item2.status": "Próxima cozedura domingo",
  "sharedEquipment.item3.name": "Projetor + suporte",
  "sharedEquipment.item3.specs":
    "1080p, alcance longo, bom para decalque e trabalho de projeção. Portátil, com bolsa protetora.",
  "sharedEquipment.item3.status": "Emprestado até sexta",
  "sharedEquipment.item4.name": "Kit de encadernação",
  "sharedEquipment.item4.specs":
    "Sovelas, dobradores de osso, linha encerada, guilhotina de cartão. Para zines e edições pequenas.",
  "sharedEquipment.item4.status": "Livre esta semana",
  "sharedEquipment.requestSlotCta": "Pedir horário",
  "sharedEquipment.onLoanCta": "Emprestado",
  "sharedEquipment.requestToast":
    "Pedido enviado para {name} — uma pessoa moderadora vai confirmar o teu horário.",

  "sharedEquipment.care.title": "Como <em>cuidamos dele</em>",
  "sharedEquipment.care1":
    "Reserva, limpa, regista — as três regras que mantêm o material partilhado partilhável.",
  "sharedEquipment.care2":
    "Deixa-o melhor do que o encontraste. Se algo se partir, diz no canal; ninguém está em sarilhos, só precisamos de saber.",
  "sharedEquipment.care3":
    "Os consumíveis (tinta, linha, cartão) funcionam por caixa de honestidade com reposição. Usa bastante, contribui um pouco.",

  "sharedEquipment.outro.title": "Faz <em>alguma coisa.</em>",
  "sharedEquipment.outro.sub":
    "O material está aqui para que o trabalho aconteça. Vem a um dia de impressão e usa-o.",
  "sharedEquipment.outro.cta": "Encontrar um dia de impressão",

  // ── SpoonTheoryPage (+ spoonTheory.data.ts) ─────────────────────────────
  // FLAGGED for native review — see en/resources.ts comment above this block.
  "spoonTheory.meta.title":
    "Teoria das colheres: como a usamos nesta comunidade queer",
  "spoonTheory.meta.description":
    "O que é a teoria das colheres e como a QueerPulse a usa para doença crónica e deficiência — eventos híbridos por defeito, faltar sem penalização, e 'estou com poucas colheres' como frase válida.",

  "spoonTheory.hero.eyebrow": "Pessoas Queer com Deficiência",
  "spoonTheory.hero.title": "O que queremos dizer com <em>colheres.</em>",
  "spoonTheory.hero.lead":
    'Uma forma partilhada de falar sobre energia limitada — o que é a teoria das colheres, como esta comunidade vive com ela, e como a usar quando confirmas presença. Não precisas de um ensaio: "hoje estou com poucas colheres" já é uma frase completa aqui.',
  "spoonTheory.hero.anchor.what": "O que é",
  "spoonTheory.hero.anchor.uses": "Como a usamos",
  "spoonTheory.hero.anchor.rsvp": "Ao confirmar presença",

  "spoonTheory.what.title": "O que <em>é</em>",
  "spoonTheory.what.spoonsCaption":
    "Quatro colheres restantes de seis — uma tarde normal.",
  "spoonTheory.what.p1":
    "A teoria das colheres é uma forma simples de falar sobre energia limitada. Começas o dia com um número certo de colheres, e cada tarefa — tomar banho, deslocar-te, uma conversa difícil — custa uma ou mais. Quando acabam, acabam, e o dia seguinte nem sempre as repõe.",
  "spoonTheory.what.p2":
    "Não é uma metáfora para cansaço. É uma forma de pessoas com doença crónica, deficiência e dor crónica tornarem visível um limite invisível — para si próprias e umas para as outras — sem terem de escrever um ensaio sobre isso.",

  "spoonTheory.uses.title": "Como a <em>usamos</em>",
  "spoonTheory.use1.title": "Híbrido por defeito",
  "spoonTheory.use1.body":
    "Todos os encontros têm opção online, para que um dia de poucas colheres nunca signifique ficar de fora. Online nunca é segunda categoria — é só outra porta para a mesma sala.",
  "spoonTheory.use2.title": "Aparece se puderes, sem penalização",
  "spoonTheory.use2.body":
    "Confirmaste presença e não consegues ir? Sem problema. Contamos com isso. As colheres que poupas ao ficar em casa são tuas para guardar.",
  "spoonTheory.use3.title":
    '"Hoje estou com poucas colheres" já é uma frase completa',
  "spoonTheory.use3.body":
    "Ninguém aqui te vai pedir para justificares. Podes dizê-lo ao confirmares presença, quando chegas, ou quando precisas de sair mais cedo, e será simplesmente respeitado.",

  "spoonTheory.rsvp.title": "Ao <em>confirmar presença</em>",
  "spoonTheory.rsvpTip1":
    "Diz à pessoa anfitriã quantas colheres tens, se ajudar no planeamento — lugares sentados, cantos calmos, uma saída fácil perto da porta.",
  "spoonTheory.rsvpTip2":
    "Pede o que precisas com antecedência; será tratado sem alarido e sem comentários.",
  "spoonTheory.rsvpTip3":
    "Cuidadores e assistentes pessoais são sempre bem-vindes, sem necessidade de reserva.",

  "spoonTheory.outro.title": "Vem como <em>estiveres.</em>",
  "spoonTheory.outro.sub":
    "Não estamos a medir nada. Todos os encontros são híbridos, sem compromisso de chegada, e feitos para corpos reais.",
  "spoonTheory.outro.cta": "Encontrar um encontro de baixo estímulo",

  // ── IntersectionalityPage (+ IntersectionalityCards.tsx +
  //    IntersectionalityFooter.tsx + intersectionality.data.ts) ───────────
  "intersectionality.meta.title":
    "Raça, fé e classe na comunidade queer de Lisboa",
  "intersectionality.meta.description":
    "Como raça, fé, classe e deficiência se cruzam com a identidade queer em Lisboa — vozes de membros e recursos para quem vive mais do que uma identidade ao mesmo tempo.",
  "intersectionality.hero.backLabel": "Biblioteca de Recursos",
  "intersectionality.hero.cat": "Interseccionalidade",
  "intersectionality.hero.title":
    "Mais do que uma coisa <em>ao mesmo tempo.</em>",
  "intersectionality.hero.sub":
    "Ser queer e uma pessoa racializada, queer e religiosa, queer e trabalhadora, queer e com deficiência — estas identidades não se sobrepõem de forma simples. Esta página existe para quem navega várias camadas ao mesmo tempo, e para uma comunidade empenhada em acolhê-las todas.",
  "intersectionality.opening.strong": "Esta página é para todas as pessoas.",
  "intersectionality.opening.text":
    "Não como um exercício educativo para quem não vive estas experiências. Como um recurso para quem vive, e como um compromisso visível da QueerPulse de que ser queer não significa um único tipo de pessoa.",

  "intersectionality.nav.race": "Raça e etnia",
  "intersectionality.nav.faith": "Fé e religião",
  "intersectionality.nav.class": "Classe e economia",
  "intersectionality.nav.community": "Dentro da própria comunidade",
  "intersectionality.nav.orgs": "Organizações e recursos",

  "intersectionality.race.heading": "Raça e <em>etnia</em>",
  "intersectionality.race.intro":
    "Ser uma pessoa queer racializada em Lisboa significa navegar duas coisas ao mesmo tempo que os espaços dominantes raramente pensam em conjunto. A história colonial de Portugal molda esta cidade de formas visíveis para quem as vive — e invisíveis para quem não as vive.",
  "intersectionality.race.info1.eyebrow": "Navegar espaços queer",
  "intersectionality.race.info1.title": "Quando ser queer não chega",
  "intersectionality.race.info1.body":
    "Os espaços queer em Lisboa, como na maioria das cidades, podem reproduzir as dinâmicas raciais do mundo em geral. A fetichização, a exclusão e as microagressões não desaparecem só porque um espaço é queer. As diretrizes da comunidade abordam isto explicitamente — e o fórum tem tópicos para discutir situações concretas.",
  "intersectionality.race.info1.link": "Diretrizes da comunidade →",
  "intersectionality.race.info2.eyebrow": "A história colonial de Portugal",
  "intersectionality.race.info2.title": "O que é bom saber ao chegar aqui",
  "intersectionality.race.info2.body":
    "Portugal tem uma relação específica e muitas vezes por processar com a sua história colonial. As comunidades afro-portuguesa, brasileira, cabo-verdiana e angolana são significativas e complexas. Chegar como pessoa racializada vinda de fora desta história significa aprender um novo conjunto de dinâmicas. Isto leva tempo e a comunidade pode ajudar.",
  "intersectionality.race.info3.eyebrow": "Grupos da comunidade",
  "intersectionality.race.info3.title": "Espaços para pessoas QTIPOC",
  "intersectionality.race.info3.body":
    "A QueerPulse tem um grupo comunitário fechado para pessoas QTIPOC (queer, trans e intersexo racializadas) — um espaço para as conversas que a comunidade mais alargada nem sempre é o contexto certo para ter. Junta-te através da página de Comunidades.",
  "intersectionality.race.info3.link": "Grupo comunitário QTIPOC →",

  "intersectionality.faith.heading": "Fé e <em>religião</em>",
  "intersectionality.faith.intro":
    "Ser queer e religioso/a não é uma contradição — apesar de muita gente tentar fazer-te sentir que é. Portugal é predominantemente católico, e a relação entre a Igreja e as pessoas LGBTQ+ é complicada, está em evolução e é profundamente pessoal.",
  "intersectionality.faith.info1.eyebrow": "O contexto católico",
  "intersectionality.faith.info1.title": "Uma igreja em mudança",
  "intersectionality.faith.info1.body":
    "A Igreja Católica portuguesa é institucionalmente conservadora mas cada vez mais diversa na prática. Algumas paróquias são ativamente acolhedoras; outras não. Há padres em Lisboa conhecidos por serem afirmativos — a comunidade sabe quem são. Pergunta no fórum.",
  "intersectionality.faith.info2.eyebrow": "Outras tradições",
  "intersectionality.faith.info2.title":
    "Islão, judaísmo, evangélicos e outras",
  "intersectionality.faith.info2.body":
    "Lisboa tem comunidades muçulmana e judaica em crescimento, e uma variedade de igrejas protestantes e evangélicas. A relação entre cada comunidade e os seus membros LGBTQ+ varia imenso. O fórum tem tópicos para navegar questões de fé em cada um destes contextos.",
  "intersectionality.faith.info2.link": "Fórum: fé e ser queer →",
  "intersectionality.faith.info3.eyebrow": "Sem religião",
  "intersectionality.faith.info3.title": "O secularismo também é válido",
  "intersectionality.faith.info3.body":
    "Portugal é cada vez mais secular, sobretudo entre as gerações mais novas. Se a tua relação com a religião é complicada, hostil ou inexistente — isso também é completamente válido aqui. A comunidade não exige nem presume qualquer relação específica com a fé.",

  "intersectionality.class.heading": "Classe e <em>economia</em>",
  "intersectionality.class.intro":
    "A comunidade queer tem muitas vezes um carácter de classe não dito — certos bares, eventos, estéticas e códigos sociais assinalam pertença de formas que excluem quem não pode ou não participa. Nomear isto é o primeiro passo para fazer algo sobre isso.",
  "intersectionality.class.note.strong": "A posição da QueerPulse:",
  "intersectionality.class.note.text":
    "Tentamos tornar a participação na comunidade acessível independentemente do rendimento. Os encontros têm opções de preço variável; o fórum é gratuito; esta plataforma é gratuita para quem não pode pagar uma contribuição. Se o custo for uma barreira para o que seja aqui, contacta-nos diretamente — será tratado com discrição.",
  "intersectionality.class.info1.eyebrow":
    "A subida do custo de vida em Lisboa",
  "intersectionality.class.info1.title": "O que a gentrificação significa aqui",
  "intersectionality.class.info1.body":
    "Lisboa tornou-se significativamente mais cara na última década, em parte impulsionada pela migração internacional, incluindo a comunidade queer expatriada. Vale a pena assumir isto com honestidade — a comunidade queer faz parte de um padrão que deslocou residentes locais trabalhadores. Esta tensão é real e a comunidade tenta lidar com ela em vez de a ignorar.",
  "intersectionality.class.info2.eyebrow": "Vida social queer",
  "intersectionality.class.info2.title": "O custo de pertencer",
  "intersectionality.class.info2.body":
    "A cultura de bares e discotecas como forma social queer por defeito exclui quem não bebe, não pode pagar entradas, ou tem dificuldade com ambientes noturnos. A QueerPulse organiza deliberadamente eventos sociais gratuitos ou de baixo custo, durante o dia ou início da noite, e com álcool opcional.",
  "intersectionality.class.info2.link": "Comunidade sóbria →",
  "intersectionality.class.info3.eyebrow": "Apoio económico",
  "intersectionality.class.info3.title": "Recursos da comunidade",
  "intersectionality.class.info3.body":
    "A página da Economia tem recursos sobre apoio financeiro de emergência, navegação de subsídios, e entreajuda comunitária. A Troca de Competências é uma ferramenta comunitária não monetária. Ambas estão disponíveis para todas as pessoas membras.",
  "intersectionality.class.info3.link": "Recursos da Economia →",

  "intersectionality.community.heading":
    "Navegar <em>a própria comunidade</em>",
  "intersectionality.community.intro":
    "Os espaços queer não são automaticamente seguros para todas as pessoas queer. O racismo, o classismo, a transfobia, o capacitismo e outras dinâmicas existem dentro das comunidades LGBTQ+. Isto não é motivo para sair — é motivo para nomear.",
  "intersectionality.community.info1.eyebrow": "Denúncia e responsabilização",
  "intersectionality.community.info1.title":
    "Se algo acontecer num espaço da comunidade",
  "intersectionality.community.info1.body":
    "A QueerPulse tem uma função de denúncia para comportamentos que violem as diretrizes da comunidade — incluindo racismo, discriminação e assédio. As denúncias são tratadas pela equipa de moderação. Se não tiveres a certeza se algo é denunciável, a página de Contacto chega diretamente à equipa.",
  "intersectionality.community.info1.link": "Denunciar algo →",
  "intersectionality.community.info2.eyebrow": "Grupos da comunidade",
  "intersectionality.community.info2.title":
    "Encontrar a tua comunidade específica",
  "intersectionality.community.info2.body":
    "Para além da comunidade principal, a QueerPulse tem grupos fechados para pessoas QTIPOC, pessoas com deficiência ou doença crónica, pais e mães queer, e pessoas sóbrias. Existem para que se possam ter as conversas para as quais o espaço mais alargado nem sempre é o adequado.",
  "intersectionality.community.info2.link": "Ver grupos da comunidade →",
  "intersectionality.community.info3.eyebrow": "O fórum",
  "intersectionality.community.info3.title":
    "Onde acontecem as conversas mais difíceis",
  "intersectionality.community.info3.body":
    "O tópico de Interseccionalidade do fórum é um dos mais ativos da plataforma. É onde as pessoas membras levantam experiências específicas, partilham recursos, se desafiam e se apoiam mutuamente. É moderado mas não filtrado.",
  "intersectionality.community.info3.link": "Fórum: interseccionalidade →",

  "intersectionality.commit.heading":
    "Aquilo a que a QueerPulse <em>se compromete.</em>",
  "intersectionality.commit.sub":
    "Estas são coisas concretas, não aspirações. Somos responsáveis por elas — se não as estivermos a cumprir, diz-nos.",
  "intersectionality.commit.governanceCta": "Como somos geridos →",
  "intersectionality.commit.accountableCta": "Responsabiliza-nos →",
  "intersectionality.commitment1.title": "Moderação ativa",
  "intersectionality.commitment1.text":
    "A plataforma é ativamente moderada para racismo, transfobia, classismo e capacitismo — não só homofobia. As denúncias são levadas a sério e têm seguimento.",
  "intersectionality.commitment2.title": "Grupos comunitários interseccionais",
  "intersectionality.commitment2.text":
    "Espaços fechados para pessoas QTIPOC, com deficiência, sóbrias, e outras comunidades dentro da comunidade são mantidos como um recurso genuíno, não um gesto simbólico.",
  "intersectionality.commitment3.title": "Acessibilidade económica",
  "intersectionality.commitment3.text":
    "Ninguém é excluído de eventos ou recursos da comunidade por causa do custo. Existem opções de preço variável e gratuitas para tudo o que organizamos.",
  "intersectionality.commitment4.title": "Não somos um bloco único",
  "intersectionality.commitment4.text":
    "A QueerPulse não fala a uma só voz sobre questões políticas. A comunidade contém multidões. O fórum é um lugar para ter os debates, não para os resolver a partir de cima.",

  "intersectionality.orgs.heading": "Organizações e <em>recursos</em>",
  "intersectionality.orgs.intro":
    "Organizações externas relevantes para as interseções específicas desta página.",
  "intersectionality.org1.focus": "QTIPOC",
  "intersectionality.org1.text":
    "Organização portuguesa que trabalha em direitos LGBTQ+ com um foco explícito na interseção entre raça, migração e ser queer em Portugal.",
  "intersectionality.org1.link": "Tópico de discussão →",
  "intersectionality.org2.focus": "Fé",
  "intersectionality.org2.text":
    "Comunidade cristã afirmativa de pessoas queer, sediada em Lisboa. Aberta a todas as denominações e tradições, focada em reconciliar fé e identidade queer.",
  "intersectionality.org2.link": "Fórum: tópico de fé →",
  "intersectionality.org3.focus": "Raça e migração",
  "intersectionality.org3.text":
    "A principal organização de direitos LGBTQ+ de Portugal. Trabalha explicitamente na interseção entre direitos LGBTQ+ e migração/raça. Apoio jurídico e advocacia.",
  "intersectionality.org3.link": "Recursos jurídicos →",
  "intersectionality.org4.focus": "Deficiência",
  "intersectionality.org4.text":
    "Consulta a página de Acessibilidade da QueerPulse para recursos específicos sobre deficiência para pessoas queer e com deficiência em Lisboa.",
  "intersectionality.org4.link": "Página de Acessibilidade →",

  "intersectionality.outro.title": "Tudo o que és <em>pertence aqui.</em>",
  "intersectionality.outro.sub":
    "Não só as partes mais fáceis de acolher. Tudo.",
  "intersectionality.outro.findCta": "Encontrar o teu grupo comunitário",
  "intersectionality.outro.forumCta": "Fórum →",
};
