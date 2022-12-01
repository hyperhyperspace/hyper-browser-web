


import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router';
import {  Typography, CircularProgress, DialogContent, DialogTitle, Stack, Card, CardContent, DialogActions, Button, Chip, FormGroup, FormControlLabel, Switch } from '@mui/material';
import { Hash, Resources, Identity, Space, SpaceEntryPoint, MutationEvent, MutableContentEvents } from '@hyper-hyper-space/core';
import { useObjectDiscoveryIfNecessary, useObjectState } from '@hyper-hyper-space/react';
import { Home, SpaceLink } from '@hyper-hyper-space/home';

import { Box } from '@mui/system';
import { Profile } from '@hyper-hyper-space/home';
import { HyperBrowserConfig } from '../../model/HyperBrowserConfig';
import { TextSpace } from '../../model/text/TextSpace';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import HomeItem from '../../pages/home/components/HomeItem';

function ViewProfile(props: {identityHash: Hash, close: () => void, home?: Home, resources?: Resources, resourcesForDiscovery?: Resources, anonMode?: boolean, startChat?: (id: Identity) => void}) {

    const navigate = useNavigate();

    const [locallyFoundIdentity, setLocallyFoundIdentity] = useState<Identity>();

    const identity = useObjectDiscoveryIfNecessary<Identity>(props.resourcesForDiscovery, props.identityHash, locallyFoundIdentity);

    const contactsState = useObjectState(props.home?.contacts?.current);
    const hostingState  = useObjectState(props.home?.contacts?.hosting);

    const [profile, setProfile] = useState<Profile>();
    const profileState = useObjectState(profile);

    const [hashForDiscovery, setHashForDiscovery] = useState<Hash|undefined>();

    const discoveredProfile = useObjectDiscoveryIfNecessary<Profile>(props.resourcesForDiscovery, hashForDiscovery);

    useEffect(() => {

        let tearDown: (() => void) | undefined = undefined;
        let discovered = false;

        const configDiscovered = async () => {

            if (!discovered && profile === undefined && discoveredProfile !== undefined) {

                discovered = true;

                let p = discoveredProfile.clone();

                if (props.anonMode || !contactsState?.getValue()?.has(p)) {

                    const tmpResources = await HyperBrowserConfig.initTransientSpaceResources(hashForDiscovery as Hash);
                
                    p.setResources(tmpResources);
    
                    await tmpResources.store.save(p);
    
                    await p.loadAndWatchForChanges();
    
                    await p.startSync({requester: tmpResources.getId()});

                    p.published?.addObserver( (ev: MutationEvent) => {
                        if (ev.emitter === p.published) {
                            if (ev.action === MutableContentEvents.AddObject) {
                                const link = ev.data as SpaceLink;
                                link.name?.loadAndWatchForChanges();
                            } else if (ev.action === MutableContentEvents.RemoveObject) {
                                const link = ev.data as SpaceLink;
                                link.name?.dontWatchForChanges();
                            }    
                        }
                    });

                    for (const link of p.published?.values() || []) {
                        link.name?.loadAndWatchForChanges();
                    }

                    tearDown = async () => { 
                        p.dontWatchForChanges();
                        await p.stopSync();
                        tmpResources.mesh.shutdown();
                        tmpResources.store.close();
                    };
                }
                
                setProfile(p);
            }
        };

        configDiscovered();

        return () => {
            if (tearDown !== undefined) {
                tearDown();
            }
        };

    }, [hashForDiscovery, discoveredProfile]);
    

    useEffect(() => {
        const attemptToLoad = async () => {
            if (props.identityHash !== undefined && props.resources !== undefined) {
                const id = await props.resources.store.load(props.identityHash, false);
                if (id !== undefined && id instanceof Identity) {
                    setLocallyFoundIdentity(id);
                }
            }  
        };

        attemptToLoad();
    }, [props.identityHash, props.resources]);

    useEffect(() => {

        // FIXME: use contacts instead of attempting to load profile.

        const init = async () => {
            if (identity !== undefined && (props.resources !== undefined || props.anonMode)) {

                let p = new Profile(identity);
                const profileHash = p.hash();

                const loaded = await props.resources?.store.load(profileHash, false) as Profile|undefined;
    
                if (loaded !== undefined) {
                    console.log(loaded);
                    p = loaded;

                    console.log('published', p.published)

                    p.published?.addObserver( (ev: MutationEvent) => {
                        if (ev.emitter === p.published) {
                            if (ev.action === MutableContentEvents.AddObject) {
                                const link = ev.data as SpaceLink;
                                link.name?.loadAndWatchForChanges();
                            } else if (ev.action === MutableContentEvents.RemoveObject) {
                                const link = ev.data as SpaceLink;
                                link.name?.dontWatchForChanges();
                            }    
                        }
                    });

                    await p.startSync();
                    setProfile(p);

                    for (const link of p.published?.values() || []) {
                        link.name?.loadAndWatchForChanges();
                    }

                    return () => {
                        p.stopSync();
                    }
                } else {
                    console.log('will try to fetch profile ' + profileHash)
                    setHashForDiscovery(profileHash);
                }
            }
        };

        init();

    }, [identity, props.resources]);

    const contact = profileState?.value !== undefined && (contactsState?.value?.has(profileState.value) || false);

    const [hosting, setHosting] = useState(false);

    useEffect(() => {
        setHosting(identity !== undefined && (hostingState?.value?.has(identity) || false));
        console.log('hosting is', identity !== undefined && (hostingState?.value?.has(identity) || false));
    }, [identity, hostingState]);

    
    const you     = profile?.owner?.getLastHash() === props.home?.getAuthor()?.getLastHash();

    const removeFromContacts = async () => {
        if (profile !== undefined) {
            await props.home?.contacts?.current?.delete(profile);
            await props.home?.contacts?.current?.saveQueuedOps();
        }
    };

    const addToContacts = async () => {
        if (profile !== undefined) {
            await props.home?.contacts?.current?.add(profile);
            await props.home?.contacts?.current?.saveQueuedOps();
        }
    };

    const toggleHosting = async () => {
        if (hosting) {
            await removeFromHosting();
        } else {
            await addToHosting();
            if (profile !== undefined && !props.home?.contacts?.current?.has(profile)) {
                await props.home?.contacts?.current?.add(profile);
                await props.home?.contacts?.current?.saveQueuedOps();
            }
        }
    }

    const removeFromHosting = async () => {
        if (identity !== undefined) {
            await props.home?.contacts?.hosting?.delete(identity);
            await props.home?.contacts?.hosting?.saveQueuedOps();
        }
        
    };

    const addToHosting = async () => {
        console.log('identity', identity);
        if (identity !== undefined) {
            console.log('hosting', props.home?.contacts?.hosting);
            await props.home?.contacts?.hosting?.add(identity);
            await props.home?.contacts?.hosting?.saveQueuedOps();
        }
    };

    

    return <Fragment>
        
            { (identity === undefined || contactsState === undefined) &&
            <Box style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', flexGrow: 1}}>
                <Box style={{display: 'flex', flexDirection: 'column'}}>
                    <CircularProgress style={{margin: 'auto', marginBottom: '2rem'}}/>
                    <Typography>Loading profile...</Typography>
                </Box>
            </Box>
            }
            { identity !== undefined && contactsState !== undefined &&
            <Fragment>
                <DialogTitle>
                    <Stack direction="row" style={{justifyContent: 'space-between'}}>
                        <Stack direction="row" spacing={1} style={{alignItems: 'center'}}>
                            <div>{identity.info?.name}</div>
                            {!props.anonMode && 
                                <Fragment>
                                {contact && !you &&
                                    <Chip icon={<img  src='icons/streamline-icon-book-address@48x48.png' style={{width:'18px', height:'18px', paddingLeft: '2px'}}/>} size="small" color="success" label="Contact" onDelete={removeFromContacts}/>
                                }
                                {!contact && !you &&
                                    <Chip size="small" label="Unknown"/>
                                }
                                {you &&
                                    <Chip color="primary" size="small" label="You"/>
                                }
                                </Fragment>
                            }
                        </Stack>
                        {!props.anonMode && !you && props.startChat !== undefined &&
                        <Stack direction="row" spacing={1}>
                            <Button onClick={() => { if (props.startChat !== undefined) props.startChat(identity); }} variant="contained" size="small" startIcon={<img  src='icons/streamline-icon-conversation-chat-2@48x48.png' style={{width:'20px', height:'20px'}}/>}>
                                Chat
                            </Button>
                        </Stack>
                        }
                        { you &&
                            <Stack direction="row" spacing={1}>
                                <Button variant="text" size="small" onClick={() => { navigate('/home/' + encodeURIComponent(props.home?.getLastHash() as string) + '/edit-profile')}}>
                                    Edit
                                </Button>
                                <Button variant="text" size="small" onClick={() => { navigate('/home/' + encodeURIComponent(props.home?.getLastHash() as string) + '/share-profile')}}>
                                    Share
                                </Button>
                            </Stack>
                        }
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} style={{width: '100%'}}>

                    { profileState?.value?.getPictureDataUrl() === undefined &&
                        <div style={{minWidth: '180px', minHeight: '180px', backgroundColor:'#ccc', display:'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                            <div style={{flexGrow: 5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}> <Typography style={{verticalAlign:'middle'}}>No picture</Typography> </div>
                        </div>
                    }

                    { profileState?.value?.getPictureDataUrl() !== undefined &&
                        <Box sx={{width: {xs: '100%'}, maxWidth: {xs: 'none', sm: '180px'}}} style={{position: 'relative'}}>
                            <img style={{minWidth:'180px', minHeight: '180px', width: '100%', height: '100%'}} src={profileState?.value?.getPictureDataUrl()} />
                        </Box>
                    }


                        <Card variant="outlined" style={{width: '100%'}}>
                            <CardContent>
                                <Typography>
                                    {identity?.info !== undefined &&
                                        <Fragment>
                                            {Object.entries(identity.info).map((entry:[string, any]) => {
                                                    return <span key={'prop-'+entry[0]}>{entry[0]}: <b>{entry[1]}</b><br /></span>;
                                                })
                                            }
                                            <span>code: <span style={{backgroundColor: 'yellow'}}>{Space.getWordCodingForHash(identity.getLastHash() as Hash).join(' ')}</span></span>
                                        </Fragment>
                                    }
                                </Typography>
                            </CardContent>
                        </Card>

                    </Stack>

                    { profileState?.value?.about?._value !== undefined &&
                    <Card variant="outlined" style={{marginTop:'2rem'}}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                About
                            </Typography>
                            <Typography>
                                {profileState?.value?.about?._value}
                            </Typography>
                        </CardContent>
                    </Card>
                    }

                
                <Stack style={{marginTop: '1.5rem'}}>

                    {!props.anonMode && 
                        <FormGroup>
                            <FormControlLabel control={<Switch checked={hosting} onChange={toggleHosting}/>} label={'Help ' + identity.info?.name + ' keep his published spaces online'}></FormControlLabel>
                        </FormGroup>
                    }

                {profileState?.value?.published?.size() === 0 && 
                    <Typography style={{color: 'gray', paddingTop: '0.25rem'}}><i>This person is not publishing any spaces.</i></Typography>
                }
                {profileState?.value?.published !== undefined && profileState?.value?.published?.size() > 0 && 
                <Stack direction="row">
                    {Array.from(profileState?.value?.published.values() || []).map((item: SpaceLink) => {
                        const entry = item.spaceEntryPoint as any as SpaceEntryPoint;
                        const name = item.name;
                        let icon = "";
                        let title: (string | undefined) = undefined;
                        if (item.spaceEntryPoint instanceof TextSpace) {
                            title = 'Text File';
                            icon = 'streamline-icon-pencil-write-1@48x48.png';
                        } else if (item.spaceEntryPoint instanceof WikiSpace) {
                            title = 'Wiki';
                            icon = 'streamlinehq-book-edit-content-48.png';
                        }

                        return <HomeItem 
                                            key={item.getLastHash()}
                                            icon={icon}
                                            name={name?.getValue()}
                                            click={() => { window.open('./#/space/' + encodeURIComponent(item.spaceEntryPoint?.getLastHash() as Hash), '_blank') }}
                                            menu={[
                                                {name: 'Open', action: () => { window.open('./#/space/' + encodeURIComponent(item.spaceEntryPoint?.getLastHash() as Hash), '_blank') }}
                                                ]}
                                            title={title}
                                            dense={true}
                                        />;
                    })}
                </Stack>
                }
                    
                </Stack>
                </DialogContent>
            </Fragment>
            }
            <DialogActions>
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}>
                    { !props.anonMode && profile !== undefined && !contact && profile.owner?.getLastHash() !== props.home?.getAuthor()?.getLastHash() &&
                    <Button variant="contained" size="small" color="success" startIcon={<img  src='icons/streamline-icon-book-address@48x48.png' style={{width:'20px', height:'20px'}}/>} onClick={addToContacts}>
                        Add to contacts
                    </Button>
                    }
                    <Button onClick={props.close}>Close</Button>
                </Stack>
            </DialogActions>
        </Fragment>
    ;

}

export default ViewProfile;