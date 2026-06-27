import type { IconType } from "react-icons";
import { FiActivity, FiHeart, FiSmile, FiPhone, FiBarChart2, FiUsers, FiGlobe, FiMessageCircle } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import type { InfoCard as InfoCardBase } from "./arrivingPage.data";

export type InfoCard = Omit<InfoCardBase, "icon"> & { icon: IconType };

const CHANGEMAKERS = routes.changemakers;
const VOLUNTEER = routes.volunteer;
const PLATFORMS = routes.platforms;

export const HEALTH: InfoCard[] = [
  { icon: FiActivity, iconBg: "rgba(74,140,111,.1)", title: "Registering with SNS", body: "Register with the Serviço Nacional de Saúde (SNS) as soon as you have a NIF. You're entitled to a GP (médico de família). Ask at your local health centre (Centro de Saúde) — Arroios, Mouraria, and Príncipe Real all have active centres.", link: { label: "sns.gov.pt →", href: "https://www.sns.gov.pt", external: true } },
  { icon: FiHeart, iconBg: "rgba(232,119,90,.1)", title: "Trans-affirming care", body: "Portugal's Gender Identity Law is one of Europe's most progressive. The SNS provides trans healthcare including hormones. The Saúde Trans project (run by QueerPulse member Jonas Ferreira) trains GPs. Ask ILGA Portugal for a referral to an affirming GP.", link: { label: "About Jonas's work →", href: CHANGEMAKERS } },
  { icon: FiSmile, iconBg: "rgba(122,82,184,.1)", title: "Mental health support", body: "Opus Diversus provides peer support and mental health resources specifically for LGBTQ+ people in Lisbon. Mariana Loução (QueerPulse member) runs a monthly peer support group for queer professionals. ILGA Portugal also has a support line.", link: { label: "Opus Diversus →", href: VOLUNTEER } },
  { icon: FiPhone, iconBg: "rgba(74,140,111,.1)", title: "Crisis support", body: "ILGA Portugal runs a support line for LGBTQ+ people facing crisis, discrimination, or violence. They can also help connect you with legal aid if needed. The line is Portuguese-language with limited English support — bring a friend if needed.", link: { label: "ILGA Portugal →", href: PLATFORMS } },
];

export const HOUSING: InfoCard[] = [
  { icon: FiBarChart2, iconBg: "rgba(232,119,90,.1)", title: "The reality of the market", body: "Lisbon rents have increased significantly over the past five years. Budget €800–1100 for a room in central neighbourhoods. Arroios and Mouraria offer better value. Move fast — good listings go in days. Airbnb has reduced long-term rental stock dramatically." },
  { icon: FiUsers, iconBg: "rgba(74,140,111,.1)", title: "Community housing network", body: "The Queer Housing Justice Network (run by Catarina Vaz) tracks queer-safe sublets and short-term shares within the community. Check the QueerPulse board — several members post housing regularly. The best leads come through the network, not portals.", link: { label: "Queer Housing Network →", href: CHANGEMAKERS } },
  { icon: FiGlobe, iconBg: "rgba(45,27,61,.08)", title: "Queer immigrant support", body: "If you're new to Portugal and navigating residency alongside housing, the Queer Immigrant Support Network (founded by Fátima Mendes) connects LGBTQ+ newcomers with legal aid, housing leads, and practical help getting settled.", link: { label: "Find support →", href: VOLUNTEER } },
  { icon: FiMessageCircle, iconBg: "rgba(232,119,90,.1)", title: "Ask on the board", body: '"Looking for a room or short-term sublet — arriving in June" is a completely valid post. The community is genuinely helpful about this. Someone will know someone.', link: { label: "Go to the board →", href: "/#board" } },
];
