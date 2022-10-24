import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { AppBar, Button, IconButton, List, ListItem, ListItemIcon, ListItemText, Stack, SwipeableDrawer, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';


import { Hash, HashedObject, MutableReference, Space, SpaceEntryPoint } from '@hyper-hyper-space/core';
import { useObjectState } from '@hyper-hyper-space/react';
import { FolderItem, Home, SpaceLink } from '@hyper-hyper-space/home';

import CreateHomeDialog from './CreateHomeDialog';
import SaveSpaceDialog from './SaveSpaceDialog';

import { supportedSpaces } from '../../model/SupportedSpaces';
import { HyperBrowserConfig } from '../../model/HyperBrowserConfig';


function SpaceFrameToolbar(props: {home?: Home|Hash, spaceEntryPointHash: Hash, spaceEntryPoint?: HashedObject & SpaceEntryPoint, foundLocalCopy?: boolean}) {

    const navigate = useNavigate();

    const spaceState = useObjectState(props.spaceEntryPoint);

    const [title, setTitle] = useState<string>();

    useEffect(() => {

        const val = spaceState?.getValue()?.getName();

        if (val instanceof MutableReference) {
            const t = val.getValue();

            if (typeof(t) === 'string') {
                setTitle(t);
            }
        } else if (typeof(val) === 'string') {
            setTitle(val);
        }
    }, [spaceState])

    const homeHash = props.home instanceof HashedObject? props.home.getLastHash() : props.home;

    const [home, setHome] = useState<Home>();

    const homeState = useObjectState(home);

    const links = homeState?.value?.desktop?.currentLinksForSpace(props.spaceEntryPointHash) || [] as Array<SpaceLink>;

    const isSaved = homeState?.value === undefined? (props.foundLocalCopy !== undefined && props.foundLocalCopy) : links.length > 0;

    const [showCreateHomeDialog, setShowCreateHomeDialog] = useState(false);

    const openCreateHomeDialog = () => {
        setShowCreateHomeDialog(true);
    }

    const closeCreateHomeDialog = () => {
        setShowCreateHomeDialog(false);
    }

    const [showSaveSpaceDialog, setShowSaveSpaceDialog] = useState(false);

    const openSaveSpaceDialog = () => {
        setShowSaveSpaceDialog(true);
    }

    const closeSaveSpaceDialog = () => {
        setShowSaveSpaceDialog(false);
    }

    const save = () => {
        if (homeHash === undefined) {
            openCreateHomeDialog();
        } else {
            openSaveSpaceDialog();
        }
    }

    const viewAuthorProfile = () => {

        navigate('./view-author');

    }

    // drawer

    const [showDrawer, setShowDrawer] = useState(false);

    const onCloseDrawer = (ev: React.SyntheticEvent) => {
        setShowDrawer(false);
    };

    const onOpenDrawer = (ev: React.SyntheticEvent) => {
        setShowDrawer(true);
    };

    const openDrawer = () => {
        setShowDrawer(true);
    };

    const spaceDisplayInfo = props.spaceEntryPoint === undefined? undefined : supportedSpaces.get(props.spaceEntryPoint.getClassName());

    const openContainingFolder = (path: Array<FolderItem>) => {
        const url = '../#/home/' + encodeURIComponent((props.home as Home).getLastHash()) + '/folder/' + encodeURIComponent(path.slice(0, -1).map((value: FolderItem) => value.getLastHash()).join('_'))
        window.open(url, '_blank');
    }

    const [saveSpacePending, setSaveSpacePending] = useState(false);

    useEffect(() => {
        if (saveSpacePending && homeState?.value !== undefined) {
            setSaveSpacePending(false);
            openSaveSpaceDialog();
        }
    }, [homeState, saveSpacePending]);

    const [loadingHome, setLoadingHome] = useState<boolean>(false);

    useEffect(() => {

        const init = async () => {
            console.log('LOADING HOME...')
            const homeResources = await HyperBrowserConfig.initHomeResources(homeHash as string, (e) => { console.log('Error while initializing home in SpaceFrameToolbar'); console.log(e);}, 'worker');
            const loaded = await homeResources.store.loadAndWatchForChanges(homeHash as string) as Home; 
            setHome(loaded);
        };

        if ((showDrawer || showSaveSpaceDialog) && homeHash !== undefined && home === undefined && !loadingHome) {
            setLoadingHome(true);
            init();
        }
    }, [showDrawer, showSaveSpaceDialog, homeHash, home]);

    return (
        <Fragment>
            <AppBar position="fixed" color="default">
                <Toolbar variant="dense" sx={{display: 'flex', justifyContent: 'space-between', minHeight:'38px', maxHeight: '38px'}}>
                    <Link to="/start" style={{height: 30}}><img src="isologo.png" style={{height: 30, paddingRight: '0.75rem'}} /></Link>
                
                    <Stack direction="row" spacing={2} style={{maxWidth: '75%', alignItems: 'center'}}>


{/* title === undefined ?
                                <Typography variant="h6" noWrap style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color:'grey'}}>
                                    untitled
                                </Typography> :
                                <Typography variant="h6" noWrap style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                                    {title}
                                </Typography>
                            */}
                        {isSaved && 
                            <Fragment>

                            
                            
                                <Typography variant="h6" noWrap style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                                    {title !== undefined && <Fragment>{title}</Fragment>}
                                </Typography><Typography style={{color: 'gray'}}>({Space.getWordCodingForHash(props.spaceEntryPointHash).join('-')})</Typography>

                            </Fragment>
                        }
                        
                        {!isSaved &&
                        <Fragment>
                            <Typography variant="h6" noWrap style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                                {title !== undefined && <Fragment>{title}</Fragment>}
                            </Typography><Typography style={{color: 'gray'}}>({Space.getWordCodingForHash(props.spaceEntryPointHash).join('-')}, unsaved<IconButton onClick={save}><img src="icons/streamline-icon-floppy-disk@48x48.png" style={{width:'20px', height:'20px', padding: '1px', marginRight:'-6px'}}></img></IconButton>)</Typography>
                            {/*<Fragment>
                                <Typography variant="h6" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{Space.getWordCodingForHash(props.spaceEntryPointHash).join('-')}</Typography><Typography style={{color: 'gray'}}>(unsaved<IconButton onClick={save}><img src="icons/streamline-icon-floppy-disk@48x48.png" style={{width:'20px', height:'20px', padding: '1px', marginRight:'-6px'}}></img></IconButton>)</Typography>
                            </Fragment>*/}
                        </Fragment>
                        }
                    </Stack>
                    
                    <IconButton onClick={openDrawer}><img src="icons/streamline-icon-satellite-1@48x48.png" style={{width:'32px', height:'32px', margin:'2px', padding: '2px'}}></img></IconButton>
                </Toolbar>
            </AppBar>
            <SwipeableDrawer anchor='right' open={showDrawer} onOpen={onOpenDrawer} onClose={onCloseDrawer}>
            <Box
                sx={{ width: {xs: '98%', 'sm': '98%', 'md': 400 }}}
                role="presentation"
                onClick={onCloseDrawer}
                onKeyDown={onCloseDrawer}
            >
                <List
                    sx={{ width: '100%', bgcolor: 'background.paper' }}
                >

                    <ListItem>
                        <ListItemIcon>
                            <img src="icons/streamline-icon-satellite-1@48x48.png" style={{width:'28px', height:'28px', margin:'2px', padding: '2px'}}></img>
                        </ListItemIcon>
                        <ListItemText primary="Space Info" />
                    </ListItem>

                    <ListItem>
                    <div style={{paddingLeft: '1rem'}}>
                    <Box paddingBottom='0.5rem'>
                        <Typography><b>hash</b>: {props.spaceEntryPointHash}</Typography>
                    </Box>
                    <Box paddingBottom='0.5rem'>
                        <Typography><b>code</b>: <span style={{backgroundColor: 'yellow'}}>{Space.getWordCodingForHash(props.spaceEntryPointHash).join(' ')}</span></Typography>
                        {spaceDisplayInfo !== undefined && <Typography><b>type</b>: {spaceDisplayInfo.name}</Typography>}

                    </Box>
                    
                        {props.spaceEntryPoint?.getAuthor()?.info?.name !== undefined &&
                        <Box></Box>
                        }
                    
                        
                    </div>
                    </ListItem>
                        
                    <ListItem>
                        <ListItemIcon>
                                <img src="icons/streamline-icon-single-neutral-profile-picture@48x48.png" style={{width:'28px', height:'28px', margin:'2px', padding: '2px'}}></img>
                        </ListItemIcon>
                        <ListItemText primary="Owner" />
                    </ListItem>
                    <ListItem>
                        <div style={{paddingLeft: '1rem', width: '100%'}}>
                            {props.spaceEntryPoint?.getAuthor()?.info?.name === undefined &&
                                <Box paddingBottom='0.5rem'><Typography>This space has no owner</Typography></Box>
                            }
                            {props.spaceEntryPoint?.getAuthor()?.info?.name !== undefined &&
                                <Fragment>
                                <Box paddingBottom='0.5rem'><Typography><b>hash:</b> {props.spaceEntryPoint?.getAuthor()?.getLastHash()} </Typography></Box>

                                <Box paddingBottom='0.5rem'>
                                    <Typography><b>code</b>: <span style={{backgroundColor: 'yellow'}}>{Space.getWordCodingForHash(props.spaceEntryPoint?.getAuthor()?.getLastHash() as Hash).join(' ')}</span> </Typography>
                                    <Typography><b>name</b>: {props.spaceEntryPoint?.getAuthor()?.info?.name}</Typography>
                                </Box>
                                <Stack direction="row" style={{margin: 'auto', paddingTop: '1rem'}} spacing={2}><Button variant='contained' style={{margin: 'auto'}} onClick={viewAuthorProfile}>View Profile</Button></Stack>
                                </Fragment>
                            }
                        </div>
                    </ListItem>

                    <ListItem>
                        <ListItemIcon>
                            <img src="icons/streamline-icon-floppy-disk@48x48.png" style={{width:'28px', height:'28px', margin:'2px', padding: '2px'}}></img>
                        </ListItemIcon>
                        <ListItemText primary="Local Copy" />
                    </ListItem>
                    {!isSaved && <ListItem>
                    <div style={{paddingLeft: '1rem', width: '100%'}}>

                        <Stack direction="row" style={{margin: 'auto'}}><Typography style={{backgroundColor: 'green', color: 'white', margin: 'auto', padding: '2px'}}>Using a temporary copy</Typography></Stack>
                        <Stack direction="row" style={{margin: 'auto', paddingTop: '1rem'}} spacing={2}><Button variant='contained' style={{margin: 'auto'}} onClick={save}>Save this space</Button></Stack>
                    </div>
                    
                    </ListItem>}
                    {isSaved && <ListItem>
                        <div style={{paddingLeft: '1rem', width: '100%'}}>
                        {homeState?.value !== undefined && 
                            <Fragment>
                                <Box paddingBottom='0.5rem'><Typography>In <b>{homeState?.value?.getAuthor()?.info?.name}</b>'s Home Space:</Typography></Box>

                                {links.map((link: SpaceLink) => (
                                    Array.from(homeState?.value?.desktop?.getPathsForItemHash(link.getLastHash())?.values() || []).map((path: Array<FolderItem>) =>  (

                                        <Box paddingBottom='0.5rem' key={path.map((item: FolderItem) => item.getLastHash()).join('-')}>
                                            <Typography><b>name</b>: {(path.at(-1) as FolderItem).name?.getValue()}</Typography>
                                            <Typography style={{marginTop:'-0.25rem'}}><b style={{verticalAlign:'middle', lineHeight: '20px'}}>location</b><span style={{verticalAlign:'middle', lineHeight: '20px'}}>: {path.slice(0, -1).map((value: FolderItem) => value.name?.getValue() || 'unnamed').join('/')}</span><IconButton onClick={() => openContainingFolder(path)}><img src="icons/streamline-icon-folder-empty@48x48.png" style={{width:'20px', height:'20px', padding: '1px'}}></img></IconButton></Typography>
                                        </Box>)))
                                )}
                            </Fragment>
                        
                        }
                        {homeState?.value === undefined &&
                            <Typography>Loading...</Typography>
                        }
                        
                        
                        </div>
                    </ListItem>}

                    

                </List>

                

                {/*<List
                    sx={{ width: '100%', bgcolor: 'background.paper' }}
                    component="nav"
                >
                    <ListItemButton>
                        <ListItemIcon>
                            <img src="icons/streamline-icon-cog-1@48x48.png" style={{width:'28px', height:'28px', margin:'2px', padding: '2px'}}></img>
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }} onClick={openManageLinkedDevicesDialog}>
                            <ListItemIcon>
                                <img src="icons/streamline-icon-connect-device-exchange@48x48.png" style={{width:'28px', height:'28px', margin:'2px', padding: '2px'}}></img>
                            </ListItemIcon>
                            <ListItemText primary="Linked Devices" />
                        </ListItemButton>
                    </List>
                </List>*/}
            
            </Box>
            </SwipeableDrawer>
            {showCreateHomeDialog && <CreateHomeDialog onClose={closeCreateHomeDialog} setSaveSpacePending={setSaveSpacePending}/>}
            {showSaveSpaceDialog && <SaveSpaceDialog spaceEntryPoint={props.spaceEntryPoint as (HashedObject & SpaceEntryPoint)} onClose={closeSaveSpaceDialog} home={home}/>}
        </Fragment>);

}

export default SpaceFrameToolbar;