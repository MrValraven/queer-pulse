import { sections } from "./cinemaRights.data";
import { ContactBlock, FaqSection } from "./RightsFaqParts";

export function RightsFaq() {
  return (
    <>
      {sections.map((section) => (
        <FaqSection key={section.id} section={section} />
      ))}
      <ContactBlock />
    </>
  );
}
