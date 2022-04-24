import { ChatRoom } from '@hyper-hyper-space/p2p-chat';

const supportedSpaceNames = new Map<string, string>();

supportedSpaceNames.set(ChatRoom.className, "Chat Room");

const supportedSpaceColors = new Map<string, string>();

supportedSpaceColors.set(ChatRoom.className, 'lightgreen');

export { supportedSpaceNames, supportedSpaceColors };