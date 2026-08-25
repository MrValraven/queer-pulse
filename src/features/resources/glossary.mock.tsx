import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import type { LetterBlock } from "./glossary.data";

const Q101 = routes.queer101;
const TRANS_HEALTH = routes.transHealthcare;

// Heavy demo-only glossary term registry. Imported *only* via the demo-gated
// dynamic import() in api/useGlossaryData.ts so it code-splits out of the live
// bundle (live mode fetches GET /glossary instead).
export const BLOCKS: LetterBlock[] = [
  {
    letter: "A",
    terms: [
      {
        name: "Aro/ace spectrum",
        type: "Identity",
        typePt: "Identidade",
        typeKind: "",
        def: (
          <>
            Umbrella terms for people on the aromantic or asexual spectra,
            including grey-ace, demi, and aro-but-allosexual.{" "}
            <em>Not the same as celibate.</em> See also{" "}
            <b>romantic orientation</b>.
          </>
        ),
        defPt: (
          <>
            Termos abrangentes para pessoas nos espetros arromântico ou
            assexual, incluindo grey-ace, demi e aro-mas-alossexual.{" "}
            <em>Não é o mesmo que celibato.</em> Ver também{" "}
            <b>orientação romântica</b>.
          </>
        ),
        meta: (
          <>
            Cross-references: <Link to={Q101}>Queer 101 → Beyond LGB</Link>
          </>
        ),
        metaPt: (
          <>
            Referências: <Link to={Q101}>Queer 101 → Para além de LGB</Link>
          </>
        ),
        search:
          "aro ace spectrum aromantic asexual celibate romantic orientation arromântico assexual",
      },
      {
        name: "Affirming care",
        type: "Healthcare",
        typePt: "Saúde",
        typeKind: "med",
        def: (
          <>
            A clinical approach that treats the patient's stated identity as the
            working truth, rather than something to interrogate or override. The
            opposite of <em>"gatekeeper"</em> care. WPATH guidelines describe
            it; in Portugal, Lei n.º 38/2018 codifies parts of it.
          </>
        ),
        defPt: (
          <>
            Uma abordagem clínica que trata a identidade declarada da pessoa
            como verdade de trabalho, em vez de algo a interrogar ou contrariar.
            O oposto do cuidado <em>"gatekeeper"</em>. As diretrizes da WPATH
            descrevem-na; em Portugal, a Lei n.º 38/2018 codifica parte dela.
          </>
        ),
        meta: (
          <>
            See also: <Link to={TRANS_HEALTH}>Trans Healthcare guide</Link>
          </>
        ),
        metaPt: (
          <>
            Ver também: <Link to={TRANS_HEALTH}>Guia de Saúde Trans</Link>
          </>
        ),
        search:
          "affirming care healthcare clinical wpath gatekeeper cuidado afirmativo saúde",
      },
      {
        name: "Anjos",
        type: "Lisbon",
        typePt: "Lisboa",
        typeKind: "local",
        def: (
          <>
            A central Lisbon neighbourhood that, since the late 2010s, has
            hosted much of the city's organised queer community space, including
            Clínica do Largo and the Trans Hub office.{" "}
            <b>Not a "gayborhood" in the Castro sense.</b> The community is
            woven into the existing residential fabric.
          </>
        ),
        defPt: (
          <>
            Um bairro central de Lisboa que, desde o final da década de 2010,
            acolhe grande parte do espaço comunitário queer organizado da
            cidade, incluindo a Clínica do Largo e o escritório do Trans Hub.{" "}
            <b>Não é um "gayborhood" ao estilo de Castro.</b> A comunidade está
            entrelaçada no tecido residencial existente.
          </>
        ),
        search: "anjos lisbon neighbourhood community space lisboa bairro",
      },
      {
        name: "Assigned at birth",
        type: "Essential",
        typePt: "Essencial",
        typeKind: "essential",
        def: (
          <>
            As in AFAB / AMAB: the sex marker placed on a person's birth
            certificate. The phrasing emphasises that this was a decision{" "}
            <em>made by others</em>, often without examination. Useful in
            medical contexts; less needed in social ones.
          </>
        ),
        defPt: (
          <>
            Como em AFAB / AMAB: o marcador de sexo colocado na certidão de
            nascimento. A expressão sublinha que foi uma decisão{" "}
            <em>tomada por outros</em>, muitas vezes sem reflexão. Útil em
            contextos médicos; menos necessária nos sociais.
          </>
        ),
        search: "assigned at birth afab amab sex marker atribuído nascimento",
      },
    ],
  },
  {
    letter: "B",
    terms: [
      {
        name: "Binary",
        type: "Identity",
        typePt: "Identidade",
        typeKind: "",
        def: (
          <>
            Of gender systems that recognise only two categories (man / woman).
            The word is often a shorthand for <em>limitations</em>, not a
            description of any individual.
          </>
        ),
        defPt: (
          <>
            De sistemas de género que reconhecem apenas duas categorias (homem /
            mulher). A palavra é muitas vezes uma forma abreviada de{" "}
            <em>limitações</em>, e não a descrição de uma pessoa.
          </>
        ),
        search: "binary gender man woman binário género",
      },
      {
        name: "Bichas",
        type: "Portuguese · in-community",
        typePt: "Português · na comunidade",
        typeKind: "local",
        def: (
          <>
            A reclaimed Portuguese term, roughly equivalent to "queer" used as a
            noun, used widely within the community.{" "}
            <em>Reclamation matters here.</em> Use only if you're inside;
            otherwise, opt for <b>queer</b>.
          </>
        ),
        defPt: (
          <>
            Um termo português reapropriado, aproximadamente equivalente a
            "queer" usado como substantivo, muito usado dentro da comunidade.{" "}
            <em>A reapropriação importa aqui.</em> Use apenas se fizer parte;
            caso contrário, opte por <b>queer</b>.
          </>
        ),
        search: "bichas portuguese reclaimed queer reapropriado",
      },
      {
        name: "Butch / Femme",
        type: "Identity · contested",
        typePt: "Identidade · contestado",
        typeKind: "",
        def: (
          <>
            Long-standing terms for masc and femme presentations within queer
            (particularly lesbian and trans-masc) communities.{" "}
            <em>Identity, not costume.</em> Discussions about who can use them
            are ongoing. We don't adjudicate.
          </>
        ),
        defPt: (
          <>
            Termos antigos para apresentações masc e femme dentro das
            comunidades queer (em particular lésbicas e trans-masc).{" "}
            <em>Identidade, não fantasia.</em> As discussões sobre quem os pode
            usar continuam. Não as arbitramos.
          </>
        ),
        search: "butch femme masc presentation lesbian apresentação lésbica",
      },
    ],
  },
  {
    letter: "C",
    terms: [
      {
        name: "Cis",
        type: "Essential",
        typePt: "Essencial",
        typeKind: "essential",
        def: (
          <>
            Short for cisgender, describing a person whose gender matches the
            one they were assigned at birth.{" "}
            <em>Not an insult, not a slur, just a descriptor</em>, symmetric to
            "trans". Latin: <i>cis-</i> means "on this side of".
          </>
        ),
        defPt: (
          <>
            Abreviatura de cisgénero, descreve uma pessoa cujo género
            corresponde ao que lhe foi atribuído à nascença.{" "}
            <em>Não é insulto nem ofensa, apenas um descritor</em>, simétrico a
            "trans". Do latim: <i>cis-</i> significa "deste lado de".
          </>
        ),
        search: "cis cisgender descriptor cisgénero",
      },
      {
        name: "Chosen family",
        type: "Essential",
        typePt: "Essencial",
        typeKind: "essential",
        def: (
          <>
            The set of intentional, ongoing relationships of care that queer
            people build, often in parallel with (and sometimes in place of)
            biological family.{" "}
            <b>
              Includes lovers, exes, friends, neighbours, and the person who
              calls if you don't post for three days.
            </b>
          </>
        ),
        defPt: (
          <>
            O conjunto de relações de cuidado intencionais e contínuas que as
            pessoas queer constroem, muitas vezes em paralelo com (e por vezes
            em vez de) a família biológica.{" "}
            <b>
              Inclui amantes, ex-namorades, amigues, vizinhes e a pessoa que
              liga se não publicares nada durante três dias.
            </b>
          </>
        ),
        search: "chosen family care relationships família escolhida",
      },
      {
        name: "Coming out",
        type: "Essential",
        typePt: "Essencial",
        typeKind: "essential",
        def: (
          <>
            The ongoing act of disclosing a non-heterosexual or non-cisgender
            identity. <em>Not a one-time event.</em> Most queer people come out
            hundreds of times: to coworkers, to taxi drivers, to landlords, to
            GPs.
          </>
        ),
        defPt: (
          <>
            O ato contínuo de revelar uma identidade não-heterossexual ou
            não-cisgénero. <em>Não é um acontecimento único.</em> A maioria das
            pessoas queer assume-se centenas de vezes: a colegas, a taxistas, a
            senhorios, a médicos de família.
          </>
        ),
        meta: (
          <>
            See also: <Link to={routes.comingOut}>Coming-Out Support</Link>
          </>
        ),
        metaPt: (
          <>
            Ver também:{" "}
            <Link to={routes.comingOut}>Apoio na Saída do Armário</Link>
          </>
        ),
        search: "coming out disclosing identity sair armário assumir",
      },
    ],
  },
  {
    letter: "D",
    terms: [
      {
        name: "Deadname",
        type: "Healthcare",
        typePt: "Saúde",
        typeKind: "med",
        def: (
          <>
            The name a trans person no longer uses, typically the one assigned
            at birth. <em>Don't use it</em>, even with permission, even in the
            past tense, even at a doctor's office. Lei n.º 38/2018 permits
            self-determination of name on most records in Portugal.
          </>
        ),
        defPt: (
          <>
            O nome que uma pessoa trans já não usa, normalmente o atribuído à
            nascença. <em>Não o uses</em>, nem com permissão, nem no passado,
            nem no consultório médico. A Lei n.º 38/2018 permite a
            autodeterminação do nome na maioria dos registos em Portugal.
          </>
        ),
        search: "deadname trans name nome morto",
      },
      {
        name: "Drag",
        type: "Performance",
        typePt: "Performance",
        typeKind: "",
        def: (
          <>
            A theatrical performance of gender.{" "}
            <em>Not the same as being trans.</em> Drag has a queer history, but
            plenty of straight and cis people do it; plenty of trans people
            don't.
          </>
        ),
        defPt: (
          <>
            Uma performance teatral de género.{" "}
            <em>Não é o mesmo que ser trans.</em> O drag tem uma história queer,
            mas muitas pessoas hétero e cis também o fazem; e muitas pessoas
            trans não.
          </>
        ),
        search: "drag performance gender género",
      },
    ],
  },
  {
    letter: "V",
    terms: [
      {
        name: "Vouch",
        type: "QueerPulse · platform",
        typePt: "QueerPulse · plataforma",
        typeKind: "local",
        def: (
          <>
            On QueerPulse, to <em>vouch</em> for someone is to attach your name
            to theirs as a marker of community trust. Used in three places:{" "}
            <b>member onboarding</b> (you vouch for who you're inviting),{" "}
            <b>safe spaces</b> (you vouch a venue lives up to the pact), and{" "}
            <b>service offers</b> (you vouch a therapist or skill-provider is
            what they say). Vouches are personal. They accumulate, they don't
            get rated.
          </>
        ),
        defPt: (
          <>
            No QueerPulse, <em>abonar</em> por alguém é associar o teu nome ao
            dela como marca de confiança comunitária. Usa-se em três lugares:{" "}
            <b>entrada de membros</b> (abonas por quem convidas),{" "}
            <b>espaços seguros</b> (abonas que um espaço cumpre o pacto) e{" "}
            <b>ofertas de serviços</b> (abonas que um terapeuta ou prestador é o
            que diz). Os abonos são pessoais. Acumulam-se, não são avaliados.
          </>
        ),
        search: "vouch trust onboarding safe spaces abonar confiança",
      },
    ],
  },
  {
    letter: "W",
    terms: [
      {
        name: "WPATH",
        type: "Healthcare",
        typePt: "Saúde",
        typeKind: "med",
        def: (
          <>
            The World Professional Association for Transgender Health. Publishes
            the <em>Standards of Care</em>, the most widely-used clinical
            guidelines for trans-affirming care. Currently on version 8. Used by
            most Lisbon clinicians who self-identify as trans-affirming.
          </>
        ),
        defPt: (
          <>
            A World Professional Association for Transgender Health. Publica os{" "}
            <em>Standards of Care</em>, as diretrizes clínicas mais usadas para
            o cuidado afirmativo trans. Atualmente na versão 8. Usada pela
            maioria dos clínicos de Lisboa que se identificam como afirmativos
            para pessoas trans.
          </>
        ),
        search: "wpath standards of care transgender health saúde trans",
      },
    ],
  },
];
