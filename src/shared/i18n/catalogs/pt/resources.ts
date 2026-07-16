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
  "legal.hero.eyebrow": "Apoio Jurídico",
  "legal.hero.title": "Conhece os teus direitos. <em>Guarda os comprovativos.</em>",
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

  "safety.outro.title": "A segurança é uma funcionalidade, <em>não uma nota de rodapé.</em>",
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
  "queer101.faq.q4": "Só tive relações com um género. Isso faz de mim uma pessoa heterossexual?",
  "queer101.faq.a4":
    "Não necessariamente. Identidade e experiência não são a mesma coisa. Muitas pessoas bissexuais e queer só namoraram com um género durante longos períodos das suas vidas — circunstâncias, preferência ou acaso têm todos um papel. O que importa é o que sentes, não uma lista das tuas relações passadas.",
  "queer101.faq.q5": "Tudo bem estar em questionamento? E se nunca tiver a certeza?",
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
  "queer101.talk.peerSupport.cta": "Juntar-te ao grupo →",
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
  // Nota: a GlossaryPage tem o seu PRÓPRIO alternador EN/PT para os termos
  // (`GLOSSARY_COPY`, `BLOCKS` em glossary.data.tsx), independente do idioma
  // global do site — deliberadamente não mexido (ver relatório). Só a parte
  // fixa (independente do alternador) passa a usar o catálogo.
  "glossary.backLink": "Biblioteca de Recursos",
  "glossary.hero.title": "Um <em>glossário</em> em construção.",
  "glossary.hero.dek":
    "Palavras usadas aqui — em toda a plataforma, na revista, nos encontros. <b>As definições são rascunhos de trabalho.</b> Onde um termo é contestado, dizemo-lo. Onde é específico de Lisboa, assinalamo-lo. <em>Sugere alterações no fundo da página; a equipa editorial vê-as semanalmente.</em>",
  "glossary.foot.body":
    "Este é um documento de trabalho. As sugestões são lidas pela equipa editorial semanalmente e discutidas na assembleia mensal. <em>Vamos errar; preferimos errar publicamente e corrigir.</em>",

  // ── PronounsGuidePage (+ PronounsGuideSections.tsx + pronounsGuide.data.tsx) ──
  // Conteúdo específico para pessoas trans — assinalar para revisão nativa.
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

  "pronounsGuide.sidebar.updateName.title": "Atualiza o teu <em>nome agora</em>",
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

  "pronounsGuide.outro.title": "Perguntas sobre as <em>tuas definições de identidade?</em>",
  "pronounsGuide.outro.sub": "Escreve-nos. Respondemos dentro de dois dias úteis.",
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
  "pronounsGuide.faq.q6": "Como é que a plataforma trata os dados de nome legal?",
  "pronounsGuide.faq.a6":
    "Os dados de nome legal só são guardados se os tiveres fornecido explicitamente para um propósito que o exigisse (ex.: certas candidaturas a bolsas feitas através da plataforma). Nunca são usados como o teu nome de exibição e são guardados em separado, com controlos de acesso mais rígidos. Podes pedir a sua eliminação a qualquer momento através de <a>Exportação de Dados</a>.",

  // ── MentalHealthPage (+ MentalHealthSections.tsx + mentalHealth.data.ts) ──
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

  "mentalHealth.experiences.title": "Coisas que a comunidade <em>já sentiu</em>",
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
  "mentalHealth.sns.step2.title": "Referenciação do médico de família para psicologia",
  "mentalHealth.sns.step2.text":
    "O teu médico de família pode referenciar-te para um psicólogo ou psiquiatra através do SNS. Os tempos de espera para a primeira consulta são tipicamente de 3–6 meses. Para necessidades urgentes, explica claramente a gravidade — isso pode acelerar a referenciação.",
  "mentalHealth.sns.step3.title": "O idioma importa",
  "mentalHealth.sns.step3.text":
    "Os terapeutas e psiquiatras do SNS trabalham tipicamente em português. Se o teu português for limitado, a terapia privada em inglês é mais prática para a maioria das pessoas expatriadas. Plataformas online (BetterHelp, Zenklub) oferecem terapeutas de língua inglesa a preços mais baixos do que as tarifas privadas em Lisboa.",
  "mentalHealth.sns.step4.title": "Tarifas privadas em Lisboa",
  "mentalHealth.sns.step4.text":
    "A terapia privada varia entre 50–120 € por sessão. Alguns terapeutas oferecem tarifas em escala progressiva — vale sempre a pena perguntar. Vários terapeutas no nosso diretório oferecem tarifas de pessoa da comunidade para pessoas da QueerPulse.",
  "mentalHealth.sns.peer.title": "Apoio entre pares <em>dentro da comunidade</em>",
  "mentalHealth.sns.peer.body":
    "O grupo de apoio entre pares de saúde mental reúne-se mensalmente. As pessoas partilham experiências, recomendam recursos, e apoiam-se mutuamente — sem facilitação profissional, só conversa honesta.",
  "mentalHealth.sns.peer.joinCta": "Juntar-te ao grupo",
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
  "mentalHealth.therapistProfile.status.acceptingNew": "A aceitar novas pessoas",
  "mentalHealth.therapistProfile.status.waitlistOnly": "Só em lista de espera",
  "mentalHealth.therapistProfile.section.about": "Sobre",
  "mentalHealth.therapistProfile.section.howIWork": "Como trabalho",
  "mentalHealth.therapistProfile.section.training":
    "Formação e qualificações",
  "mentalHealth.therapistProfile.section.firstSession":
    "A tua primeira sessão",
  "mentalHealth.therapistProfile.seeFullProfileCta": "Ver perfil completo →",

  // ── WellbeingPage (+ WellbeingSections.tsx + wellbeing.data.ts) ──────────
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
    "Sóbrie e social — encontros e apoio que não giram à volta de bebida.",

  "wellbeing.therapists.title": "Terapeutas afirmativos queer <em>em Lisboa</em>",
  "wellbeing.therapists.lead":
    "Avaliados por pessoas da comunidade. Cada terapeuta listado foi recomendado por pelo menos duas pessoas da QueerPulse. Não cobramos taxas de listagem. Queres adicionar alguém? <a>Contacta-nos.</a>",
  "wellbeing.therapists.requestIntroCta": "Pedir apresentação →",
  "wellbeing.therapists.applyPrompt": "És um terapeuta afirmativo queer?",
  "wellbeing.therapists.applyCta": "Candidata-te a ser listado →",

  "wellbeing.peer.title": "Não precisas de <em>carregar isto sozinhe.</em>",
  "wellbeing.peer.body":
    "Um espaço de apoio entre pares moderado dentro do Fórum — para pessoas a passar por momentos difíceis. Sem conselhos a menos que sejam pedidos. Sem consertar. Só pessoas que compreendem, a escutar.",
  "wellbeing.peer.joinCta": "Juntar-te ao grupo",
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

  "therapistProfilePage.worksWith.title": "As áreas em que {name} <em>trabalha</em>",
  "therapistProfilePage.worksWith.sub":
    "Autodeclarado e consistente com a comunidade que avaliza.",
  "therapistProfilePage.approachTitle.he": "A abordagem dele",
  "therapistProfilePage.approachTitle.she": "A abordagem dela",
  "therapistProfilePage.approachTitle.neutral": "A abordagem delu",
  "therapistProfilePage.vouches.title_one":
    "{count} pessoa <em>avalizou</em>",
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
  "therapistProfilePage.sidebar.crisisChatCta": "Abrir chat de crise",
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
  "transHub.community.joinCta": "Juntar-te ao hub",
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
  // Overdose response / substance-safety guidance — highest-stakes copy in
  // this namespace. Numbers, timings, drug names, phone numbers and org
  // names preserved exactly. Flag for the closest native review.
  "harmReduction.emergency.emergencyLabel": "Emergência:",
  "harmReduction.emergency.snsLabel": "SNS 24 (não urgente):",
  "harmReduction.emergency.mentalHealthLabel":
    "Linha de Apoio (saúde mental):",

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
  "harmReduction.section.duringNight.item.breaks.title":
    "Faz pausas na dança",
  "harmReduction.section.duringNight.item.breaks.body":
    "O sobreaquecimento é um risco real. Sai, senta-te, arrefece regularmente. Se sentires muito calor e deixares de suar, pede ajuda imediatamente.",
  "harmReduction.section.duringNight.item.mixing.title":
    "Misturar substâncias",
  "harmReduction.section.duringNight.item.mixing.body":
    "Álcool + MDMA: mais pesado para o corpo, aumenta a desidratação. MDMA + cocaína: stress cardíaco significativo. MDMA + cetamina: imprevisível. Nunca misturar com opioides a menos que tenhas naloxona presente.",
  "harmReduction.section.duringNight.item.lookAfter.title":
    "Cuidem uns dos outros",
  "harmReduction.section.duringNight.item.lookAfter.body":
    "Se a pessoa ao teu lado parecer confusa, com calor excessivo, ou não responder à tua voz — tira-a da multidão, dá-lhe água e, se não houver melhoria em 5 minutos, liga 112.",

  "harmReduction.section.after.label": "No dia seguinte",
  "harmReduction.section.after.title": "Recuperação",
  "harmReduction.section.after.item.comedown.title":
    "A quebra do MDMA é real",
  "harmReduction.section.after.item.comedown.body":
    "O MDMA esgota temporariamente a serotonina. Os dias 2 a 4 depois do consumo podem trazer humor em baixo, ansiedade, e fadiga. Isto é neurológico, não um reflexo da tua vida. Passa. Comer, dormir, e atividade física ligeira ajudam.",
  "harmReduction.section.after.item.sleepFood.title":
    "Dormir e comer primeiro",
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
  "harmReduction.section.sober.item.nonAlcoholic.title":
    "Opções sem álcool",
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
  "harmReduction.section.services.item.checkpoint.title":
    "Checkpoint Lisboa",
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

  "sober.gatherings.title": "Encontros <em>sóbries.</em>",
  "sober.gatherings.lead":
    "Eventos sem álcool, ou eventos onde o álcool está presente mas não é o foco. Todos os encontros da QueerPulse estão assinalados quando são sem álcool.",
  "sober.gatherings.hostCta": "+ Organizar ou participar num encontro",
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
    "Um espaço privado e moderado dentro da QueerPulse para pessoas em recuperação. Reunião semanal online, canal de texto, e encontros presenciais ocasionais. Sem programa específico — todas as abordagens são bem-vindas.",
  "sober.recovery.peerGroup.linkLabel": "Juntar-te ao grupo →",
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

  "sober.host.modalTitle": "Encontros sóbries",
  "sober.host.success.hostTitle": "Encontro <em>submetido.</em>",
  "sober.host.success.attendTitle": "Estás <em>dentro.</em>",
  "sober.host.success.hostSub":
    "Um coordenador vai confirmar a listagem sem álcool e adicioná-la ao calendário dentro de um dia. Vais receber a checklist de anfitrião por email.",
  "sober.host.success.attendSub":
    "Guardámos o teu lugar. A localização privada e um lembrete simpático vão chegar-te no dia anterior — nada é partilhado publicamente.",
  "sober.host.intro":
    "Começa um encontro sem álcool, ou junta-te a uma reunião de pares já existente. De qualquer forma, decides tu quão visível queres estar.",
  "sober.host.modeLabel": "O que gostarias de fazer?",
  "sober.host.mode.host.name": "Organizar um encontro",
  "sober.host.mode.host.desc": "Propõe um novo encontro sem álcool.",
  "sober.host.mode.attend.name": "Participar num encontro",
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
  "sober.host.submitCta.host": "Submeter encontro",
  "sober.host.submitCta.attend": "Pedir para participar",
};
