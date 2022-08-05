import { Hash, HashedObject, MutableObject, MutationEvent, Resources } from '@hyper-hyper-space/core';
import { ChatSpace, Conversation, Message, Profile } from '@hyper-hyper-space/home';
import { useObjectDiscoveryIfNecessary, useObjectState } from '@hyper-hyper-space/react';
import { Avatar, Button, Chip, IconButton, Stack, TextField, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/system';
import { Fragment, useEffect, useRef, useState } from 'react';
import { DateUtils } from '../../model/DateUtils';
import { ProfileUtils } from '../../model/ProfileUtils';
import { AllChatsNav } from './AllChats';

function Chat(props: {onClose: () => void, chatWidth: string, noSummary: boolean, identityHash?: Hash, conv?: Conversation, chats: ChatSpace, resources: Resources, resourcesForDiscovery: Resources, nav: AllChatsNav}) {

    const remoteId = props.conv?.getRemoteIdentity();
    const profileHash = new Profile(remoteId).hash();


    const [loadedProfile, setLoadedProfile] = useState<Profile>();
    const discoveredProfile     = useObjectDiscoveryIfNecessary<Profile>(props.resourcesForDiscovery, profileHash, loadedProfile);
    const [profile, setProfile] = useState<Profile>();
    const profileState          = useObjectState<Profile>(profile);


    

    const convState = useObjectState<Conversation>(props.conv, (ev: MutationEvent) => MutableObject.isContentChangeEvent(ev));

    useEffect(() => {


        const loadRemoteProfile = async () => {

            if (props.conv === undefined) {
                setLoadedProfile(undefined);
            } else {
                //const remoteId = props.conv?.getRemoteIdentity();
                //profile = await props.resources.store.load(new Profile(remoteId).hash(), true, true) as Profile;
                const profile = await props.resources.store.load(profileHash, true, true) as Profile;
                setLoadedProfile(profile);
            }
        };

        loadRemoteProfile();

    }, [profileHash]);

    useEffect(() => {

        let profile = discoveredProfile;
        

        if (profile !== undefined) {
            const profileHash = profile.hash();
            if (!profile.isWatchingForChanges()) {
                props.resources.store.save(profile).then(() => {
                    props.resources.store.load(profileHash, true, true).then((loadedProfile?: HashedObject) => {
                        profile = loadedProfile as Profile;
                        profile.startSync();
                        setProfile(profile)
                    });
                });
                
            } else {
                profile.startSync();
                setProfile(profile);
            }
            
            

            return () => {
                profile?.stopSync();
            }
        }


    }, [discoveredProfile]);



    const contact = profileState?.getValue() === undefined ? undefined : ProfileUtils.createContact(profileState?.getValue() as Profile);

    const name = profileState?.getValue()?.owner?.info?.name === undefined? '' : (profileState?.getValue()?.owner?.info?.name as string).trim().split(' ')[0];

    const messages = convState?.getValue()?.getSortedMessages() || [];

    const [newMessage, setNewMessage] = useState<string>('');

    const newMessageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.currentTarget.value);
    }

    const post = () => {
        if (props.conv !== undefined && newMessage.trim().length > 0) {

            // add conversation to chat space if not already there (i.e. this is its first message)
            if (!props.chats.conversations?.hasByHash(props.conv?.getLastHash())) {
                props.chats.conversations?.add(props.conv as Conversation);
                props.chats.conversations?.save();
            }

            props.conv?.post(newMessage);
            setNewMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            post();
        }
    }

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    useEffect(() => {
        if (convState?.value !== undefined) {
            if (convState?.value._unreadMessages.size > 0) {
                convState?.value.markAsRead();
            }
        }
    }, [convState]);

    return (
        <Stack direction="column" style={{borderLeft: 'solid 1px', borderLeftColor: 'darkgray', height: '100%', width: '100%'}}>
            <Stack direction="row" style={{width: '100%'}} sx={{justifyContent: 'space-between', backgroundColor: 'lightgray'}}>
                <Stack direction="row" sx={{alignItems: 'center'}}>
                    {props.noSummary && 
                <IconButton  onClick={props.nav.viewChatSummary}><img src="icons/streamlinehq-arrow-thick-left-arrows-diagrams-48x48.png" style={{width:'30px', height:'30px', margin:'1px', padding: '2px'}}></img></IconButton>    
                    }
                    <IconButton onClick={() => {props.nav.viewProfile(props.identityHash as Hash)}}>{contact?.picture !== undefined && 
                                            <Avatar alt={contact?.name || ''} src={contact.picture} />
                                        }
                                        {contact?.picture === undefined && 
                                            <Avatar alt={contact?.name || ''}>{contact?.initials || ''}</Avatar>
                                        }</IconButton>
                    <Typography>{contact?.name || ''}</Typography>
                </Stack>
                <IconButton  onClick={props.onClose}><img src="icons/streamline-icon-remove-circle-1@48x48.png" style={{width:'30px', height:'30px', margin:'1px', padding: '2px'}}></img></IconButton>
            </Stack>
            <div style={{height: 'calc(100% - 60px)', flexGrow:1}}>
            <Box style={{top: 55, height: 'calc(100% - 115px)', width: 'calc(' + props.chatWidth + ' - 1px)', position: 'absolute', overflowX: 'scroll'}}>
                <Stack direction="column" style={{paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px'}} spacing={'0.1rem'}>
                {(convState?.getValue()?.getSortedMessages() || []).map((m: Message, idx: number) => {

                    const ownMessage = m.getAuthor()?.getLastHash() === props.conv?.getLocalIdentity().getLastHash();
                    const delivered  = !ownMessage || !props.conv?._unconfirmedMessages.has(m.getLastHash());

                    const prevMessage = idx>0? convState?.getValue()?.getSortedMessages()[idx-1] : undefined;
                    const dateNotice = (prevMessage === undefined) ||
                                       (prevMessage !== undefined &&
                                        !DateUtils.sameDay(new Date(prevMessage.timestamp as number), new Date(m.timestamp as number)))? 
                                            DateUtils.formatDay(m.timestamp as number) : undefined;

                    return  <Fragment key={'message-' + m.getLastHash()}>
                                {dateNotice && 
                                <Stack direction="row" style={{margin: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem'}}>
                                    <Typography style={{color: 'gray', fontSize: '0.875rem'}}>{dateNotice}</Typography>
                                </Stack>}
                                <Stack direction="row">
                                    <Typography style={{flexGrow: 1}}>
                                        {ownMessage && <b>You</b>}{!ownMessage && <b>{name}</b>} {m.content || ''}
                                    </Typography>
                                    <Stack direction="row" style={{alignItems: 'center'}} spacing={1}>
                                        {!delivered && <CircularProgress size="0.875rem"/>}
                                        <Typography style={{color: 'gray', fontSize: '0.875rem'}}>
                                            {DateUtils.getHourAndMinutes(new Date(m.timestamp as number))}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Fragment>
                })}
                <div ref={chatEndRef}></div>
            {/*{Array(100).fill(1).map(() => (
                <Fragment>
                <Typography><b>You:</b> How's it going Micah?</Typography>
                <Typography><b>Micah:</b> It's all good</Typography>
                </Fragment>
            ))}*/}
                </Stack>
            </Box>
            </div>
            
            

            {props.conv && <Stack direction="row" spacing={1} style={{backgroundColor: 'white', padding: '3px', bottom: 0, width: '100%'}}><TextField autoComplete="off" style={{flexGrow: 1}} fullWidth onChange={newMessageChanged} onKeyPress={handleKeyPress} value={newMessage} /> <Button variant="contained" onClick={post}>Send</Button></Stack>}
        </Stack>
    );
}

export default Chat;