import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useStudioScenes } from "./api/useStudioScenes";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioSceneCard } from "./StudioSceneCard";
import { useStudioHomeShelf } from "./useStudioHomeShelf";

/** "Local scenes" on Studio home: one swipeable row, with See all opening
 *  every scene as a grid. It grows in once scenes arrive and stays folded
 *  while there are none or the read fails. */
export function StudioHomeScenes() {
  const { scenes } = useStudioScenes();
  const { attachFrame, ...shelf } = useStudioHomeShelf("scenes", scenes.length);
  return (
    <Collapse isOpen={scenes.length > 0}>
      <div ref={attachFrame}>
        <StudioShelf
          id="studio-home-scenes"
          title={
            <Translation
              i18nKey="studio:home.scenes.title"
              components={{ em: <em /> }}
            />
          }
          layout={shelf.layout}
          seeAllHref={shelf.seeAllHref}
          seeAllLabel={shelf.seeAllLabel}
          seeAllReplace={shelf.seeAllReplace}
        >
          {scenes.map((scene) => (
            <StudioSceneCard key={scene.id} scene={scene} />
          ))}
        </StudioShelf>
      </div>
    </Collapse>
  );
}
