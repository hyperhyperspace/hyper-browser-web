import { Hash, MutationEvent, MutationObserver, MutableContentEvents, Resources, Identity } from '@hyper-hyper-space/core';
import { ChatSpace, Conversation, Profile } from '@hyper-hyper-space/home';
import { useObjectState } from '@hyper-hyper-space/react';
import { Filter } from '@mui/icons-material';
import { Avatar, Chip, Container, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Stack, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { DateUtils } from '../../model/DateUtils';
import { ProfileUtils } from '../../model/ProfileUtils';
import { AllChatsNav } from './AllChats';


function AllChatsSummary(props: {onClose: () => void, summaryWidth: string, conv?: Conversation, chats: ChatSpace, resources: Resources, nav: AllChatsNav}) {

    const [ownProfile, setOwnProfile] = useState<Profile>();
    const ownProfileState             = useObjectState<Profile>(ownProfile);

    useEffect(() => {

        const loadOwnProfile = async () => {
            const ownId = props.chats.getAuthor() as Identity;
            const ownProfile = await props.resources.store.load(new Profile(ownId).hash(), true, true) as Profile;
            setOwnProfile(ownProfile)
        };

        loadOwnProfile();
    }, [props.chats])


    const [convs, setConvs]       = useState<Array<Conversation>>();
    const [profiles, setProfiles] = useState<Map<Hash, Profile>>();

    const updateProfiles = async () => {

        if (props.chats.conversations !== undefined) {

            const profiles = new Map<Hash, Profile>();

            for (const conv of props.chats.conversations.values()) {

                const p = await initProfileForConv(conv, profObs);

                if (props.chats.conversations.has(conv)) {
                    const hash = conv.getRemoteIdentity().getLastHash();
                    profiles.set(hash, p);
                }
                
            }

            if (props.conv !== undefined && !props.chats.conversations.has(props.conv)) {
                const hash = props.conv.getRemoteIdentity().getLastHash();
                const p = await initProfileForConv(props.conv, profObs);
                profiles.set(hash, p);
            }
            
            setProfiles(profiles);
        }
    }

    const initProfileForConv = async (conv: Conversation, profileObs: MutationObserver) => {
        const newProfile = new Profile(conv.getRemoteIdentity());

        let p = await props.resources.store.load(newProfile.hash(), true, true) as Profile|undefined;
        p?.addObserver(profileObs);

        if (p === undefined) {
            
            await props.resources.store.save(newProfile);
            p = await props.resources.store.load(newProfile.hash(), true, true) as Profile;
            p.addObserver(profileObs);
        }

        return p;
    }

    const disposeProfile = (p: Profile, obs: MutationObserver) => {
        p.dontWatchForChanges();
        p.removeObserver(obs);
    }

    const updateConvs = () => {
        let newConvs = Array.from(props.chats.conversations?.values()|| [])

        newConvs.sort((c1: Conversation, c2: Conversation) => {

            const m1 = c1.getSortedMessages();
            const m2 = c2.getSortedMessages();

            const t1 = m1.length > 0? (m1[m1.length-1].timestamp || 0) : Number.MAX_SAFE_INTEGER;
            const t2 = m2.length > 0? (m2[m2.length-1].timestamp || 0) : Number.MAX_SAFE_INTEGER;

            if (t1 !== t2) {
                return t2 - t1;
            } else {
                return c1.getLastHash().localeCompare(c2.getLastHash());
            }
        });

        if (props.conv !== undefined) {
            if (!props.chats.conversations?.has(props.conv)) {
                newConvs.unshift(props.conv);
            }
        }

        setConvs(newConvs);
    }

    const profObs: MutationObserver = () => {
        setProfiles((oldVal: Map<Hash, Profile> | undefined) => {
            return new Map<Hash, Profile>((oldVal || new Map()).entries());
        })
    };

    const convObs: MutationObserver = (ev: MutationEvent) => {

        if (ev.emitter === props.chats.conversations) {
            if (ev.action === MutableContentEvents.AddObject) {
                const conv = ev.data as Conversation;
                initProfileForConv(conv, profObs).then((p: Profile) => {
                    if (props.chats.conversations?.has(conv)) {
                        setProfiles((oldVal: Map<Hash, Profile> | undefined) => {

                            const newVal = new Map<Hash, Profile>((oldVal || new Map()).entries());

                            newVal.set(conv.getRemoteIdentity().getLastHash(), p);

                            return newVal;
                        });
                    }
                });
            } else if (ev.action === MutableContentEvents.RemoveObject) {
                const conv = ev.data as Conversation;

                setProfiles((oldVal: Map<Hash, Profile> | undefined) => {
                    const newVal = new Map<Hash, Profile>((oldVal || new Map()).entries());

                    const p = oldVal?.get(conv.getRemoteIdentity().getLastHash());

                    if (p !== undefined) {
                        newVal.delete(conv.getRemoteIdentity().getLastHash());
                        disposeProfile(p, profObs);
                    }
                    

                    return newVal;
                });
            }
        }

        updateConvs();

    };

    useEffect(() => {

        let convs = props.chats.conversations

        convs?.addObserver(convObs);

        updateProfiles();
        updateConvs();
        
        return () => {
            convs?.removeObserver(convObs);

            if (profiles !== undefined) {
                for (const p of profiles.values()) {
                    disposeProfile(p, profObs);
                }
            }
        }

    }, [props.chats.conversations, props.conv]);



    const ownContact = ownProfileState?.getValue() === undefined? undefined : ProfileUtils.createContact(ownProfileState?.getValue() as Profile);

    return  (<Stack style={{height: '100%', width: '100%'}}>
                

                    <Stack direction="row" sx={{justifyContent: 'space-between', backgroundColor: 'lightgray'}}>
                        <Container style={{paddingLeft: '8px'}}>
                            <IconButton onClick={props.nav.editProfile}>{ownContact?.picture !== undefined && 
                                            <Avatar alt={ownContact?.name || ''} src={ownContact.picture} />
                                        }
                                        {ownContact?.picture === undefined && 
                                            <Avatar alt={ownContact?.name || ''}>{ownContact?.initials || ''}</Avatar>
                                        }</IconButton>
                        </Container>
                        <IconButton  onClick={() => {props.nav.viewContacts(); }}><img src="icons/streamline-icon-messages-bubble-square-add-messages-chat@48x48.png" style={{width:'30px', height:'30px', margin:'1px', padding: '2px'}}></img></IconButton>
                    </Stack>

                    <div style={{height: 'calc(100% - 60px)', flexGrow:1}}>
                        <Box style={{top: 55, height: 'calc(100% - 69px)', width: 'calc(' + props.summaryWidth + ' - 1px)', position: 'absolute', overflowX: 'scroll'}}> 

                <List style={{width: '100%', paddingTop: '4px', paddingBottom: '4px'}}>
                {convs?.filter((conv: Conversation) => (conv.incoming?.messages?.size() || conv.outgoing?.messages?.size() || conv.getLastHash() === props.conv?.getLastHash()))?.map((conv: Conversation) => {
                    
                    const p = profiles?.get(conv.getRemoteIdentity().getLastHash());
                    
                    if (p !== undefined) {

                        const c = ProfileUtils.createContact(p);
                        const ms = conv.getSortedMessages();
                        const t = ms.length > 0? DateUtils.format(ms[ms.length-1].timestamp as number) : undefined;

                        return (
                            <ListItem disablePadding key={'conversation-'+conv.getLastHash()}>
                                <ListItemButton 
                                    style={{paddingTop: '2px', paddingBottom: '2px'}} 
                                    component="a" 
                                    onClick={() => { props.nav.viewConversation(c.hash); }}
                                >
                                    <ListItemIcon>
                                        {c.picture !== undefined && 
                                            <Avatar alt={c.name} src={c.picture} />
                                        }
                                        {c.picture === undefined && 
                                            <Avatar alt={c.name}>{c.initials}</Avatar>
                                        }
                                    </ListItemIcon>
                                        <ListItemText 
                                            primary={<span> {c.name} {conv._unreadMessages.size > 0 && <Chip style={{}} color="success" size="small" label={<b>{conv._unreadMessages.size}</b>}/>}</span>}
                                            secondary={ms.length === 0? '' : ms[ms.length-1].content as string}
                                        >

                                        </ListItemText>
                                        {t !== undefined && 
                                        <Stack direction="column" style={{alignSelf: 'stretch', marginTop: '6px', marginBottom: '6px', marginLeft: '6px'}}><Typography style={{fontSize:'0.875rem'}}>{t}</Typography></Stack>
                                            }
                                    </ListItemButton>
                                    
                            </ListItem>);
        
                    } else {
                        return <div key={'conversation-missing-'+conv.getLastHash()}></div>;
                    }


                })}

                    {/*
                {Array(100).fill(1).map(() => (
                    <ListItem disablePadding key={'conversation-'}>
                        <ListItemButton style={{paddingTop: '2px', paddingBottom: '2px'}} component="a" onClick={() => { alert('choose chat') }}>
                            <ListItemIcon>
                                {c.picture !== undefined && 
                                    <Avatar alt={c.name} src={c.picture} />
                                }
                                {c.picture === undefined && 
                                    <Avatar alt={c.name}>{c.initials}</Avatar>
                                }
                            </ListItemIcon>
                                <ListItemText 
                                    primary={'Micah Fitch'}
                                    secondary={'hola amigo'}
                                />
                            </ListItemButton>
                    </ListItem>))}
                    */}
                </List>
                    
                </Box>
                </div>
            </Stack>);
}

export default AllChatsSummary;