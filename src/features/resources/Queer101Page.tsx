import { PageShell } from "../../shared/components/layout";
import {
  Queer101Hero,
  Queer101Faq,
  Queer101Glossary,
  Queer101Resources,
  Queer101TalkOptions,
  Queer101Outro,
} from "./Queer101Sections";

export function Queer101Page() {
  return (
    <PageShell>
      <Queer101Hero />
      <Queer101Faq />
      <Queer101Glossary />
      <Queer101Resources />
      <Queer101TalkOptions />
      <Queer101Outro />
    </PageShell>
  );
}
