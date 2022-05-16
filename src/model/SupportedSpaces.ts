import { ChatRoom } from '@hyper-hyper-space/p2p-chat';
import { TextSpace } from './text/TextSpace';

type SpaceDisplayInfo = { name: string, color: string };

const supportedSpaces: Map<string, SpaceDisplayInfo> = new Map();

supportedSpaces.set(TextSpace.className, { name: 'Plain Text', color: 'green'});

export { supportedSpaces };
export type { SpaceDisplayInfo };