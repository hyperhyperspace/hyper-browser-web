import { Hash, HashedObject, Identity, Resources } from '@hyper-hyper-space/core';
import { ChatSpace, Conversation } from '@hyper-hyper-space/home';
import { useObjectDiscoveryIfNecessary } from '@hyper-hyper-space/react';
import { Stack } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import AllChatsSummary from './AllChatsSummary';
import Chat from './Chat';

type AllChatsNav = {
    editProfile: () => void, 
    viewProfile: (id: Hash) => void, 
    viewConversation: (id: Hash) => void,
    viewChatSummary: () => void,
    viewContacts: () => void
};

function AllChats(props: {
    onClose: () => void, 
    noSummary?: boolean, 
    narrowChat?: boolean, 
    remoteIdHash?: Hash,
    chats: ChatSpace,
    localId: Identity,
    resources: Resources,
    resourcesForDiscovery: Resources,
    nav: AllChatsNav
}) {

        

    const noSummary  = props.noSummary || false;
    const narrowChat = props.narrowChat || false;

    const summaryWidth = noSummary? '100%' : (narrowChat? '40%' : '32%');
    const chatWidth    = noSummary? '100%' : (narrowChat? '60%' : '68%');

    const [locallyFoundRemoteId, setLocallyFoundRemoteId] = useState<Identity>();

    const remoteId = useObjectDiscoveryIfNecessary<Identity>(props.resourcesForDiscovery, props.remoteIdHash, locallyFoundRemoteId);

    const [conv, setConv] = useState<Conversation>();

    useEffect(() => {

        if (props.remoteIdHash !== undefined) {
            props.resources.store.load(props.remoteIdHash).then((id?: HashedObject) => {
                if (id instanceof Identity) {
                    setLocallyFoundRemoteId(id);
                }
            });
        }
        
    }, [props.remoteIdHash])

    useEffect(() => {

        if (props.localId !== undefined && remoteId !== undefined) {
            setConv(props.chats.getConversationFor(remoteId));
        }
        

    }, [props.localId, remoteId])

    return  <Stack direction="row" style={{width: '100%', height: '100%'}}>
                {(!noSummary || props.remoteIdHash === undefined) &&
                    <Box style={{width: summaryWidth, height: '100%'}}>
                        <AllChatsSummary chats={props.chats} conv={conv} onClose={props.onClose} summaryWidth={summaryWidth} resources={props.resources} nav={props.nav} />
                    </Box>
                }
                {(!noSummary || props.remoteIdHash !== undefined) && 
                    <Box style={{width: chatWidth, height: '100%'}}>
                        <Chat chats={props.chats} identityHash={props.remoteIdHash} conv={conv} onClose={props.onClose} chatWidth={chatWidth} noSummary={noSummary} resources={props.resources} nav={props.nav}/>
                    </Box>
                }
                
            </Stack>;

}

export default AllChats;
export type { AllChatsNav };