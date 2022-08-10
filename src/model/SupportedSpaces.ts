import { TextSpace } from './text/TextSpace';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';

type SpaceDisplayInfo = { name: string, color: string };

const supportedSpaces: Map<string, SpaceDisplayInfo> = new Map();

supportedSpaces.set(TextSpace.className, { name: 'Plain Text', color: 'green'});
supportedSpaces.set(WikiSpace.className, { name: 'Wiki', color: 'blue'});

export { supportedSpaces };
export type { SpaceDisplayInfo };