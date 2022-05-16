import { AppBar, ButtonGroup, Card, CardContent, Container, SwipeableDrawer, IconButton, InputAdornment, Stack, TextField, Toolbar, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider, Button, CircularProgress, Paper } from '@mui/material';
import { Box } from '@mui/system';

import { Fragment, useState, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';

import HomeItem from './components/HomeItem';
import HomeCommand from './components/HomeCommand';
import { Hash, HashedObject, Identity, ObjectDiscoveryReply, Resources, WordCode } from '@hyper-hyper-space/core';
import { HyperBrowserConfig } from '../../model/HyperBrowserConfig';
import { PeerComponent, useObjectDiscovery, useObjectDiscoveryWithResources, useStateObject } from '@hyper-hyper-space/react';
import { Home, Folder, Device, FolderItem, SpaceLink } from '@hyper-hyper-space/home';
import CreateFolderDialog from './components/CreateFolderDialog';
import RenameFolderItemDialog from './components/RenameFolderDialog';
import { Link } from 'react-router-dom';
import CreateSpaceDialog from './components/CreateSpaceDialog';
import { SpaceDisplayInfo, supportedSpaces } from '../../model/SupportedSpaces';
import { FolderTreeSearch } from '../../model/FolderTreeSearch';

type HomeContext = {
    home: Home | undefined,
    owner: Identity | undefined,
    localDevice: Device | undefined,
    openFolder: (folder: Folder, path?: string) => void,
    openCreateFolder: () => void,
    openRenameFolder: (folder: Folder) => void,
    openSpace: (entryPointHash: Hash) => void,
    openCreateSpace: () => void,
    deleteFolder: (folder: Folder, parent: Folder) => void,
    setViewingFolder: (folder?: Folder) => void,
    setViewingFolderByHash: (hash: Hash) => void,
    viewingFolder: Folder | undefined
}

function HomeSpace() {

    const params = useParams();

    const homeHash = decodeURIComponent(params.hash as Hash);
    const [homeResources, setHomeResources] = useState<Resources|undefined>(undefined);

    const [loadError, setLoadError] = useState<string|undefined>(undefined);

    useEffect(() => {
        HyperBrowserConfig.initHomeResources(homeHash, setLoadError, 'worker').then((r: Resources) => {
            setHomeResources(r);
        }).catch((reason: any) => {
            console.log('could not init home resources:');
            console.log(reason);
        })
    }, []);

    
    const [home, setHome]               = useState<Home|undefined>(undefined);
    const homeState = useStateObject(home);
    const [localDevice, setLocalDevice] = useState<Device|undefined>(undefined);
    const [owner, setOwner]             = useState<Identity|undefined>(undefined);
    const [desktopFolder, setDesktopFolder] = useState<Folder|undefined>(undefined);

    const desktopFolderState = useStateObject<Folder>(desktopFolder, desktopFolder?.ownEventsFilter());
    

    const [viewingFolder, setViewingFolder] = useState<Folder|undefined>()

    /*useEffect(() => {
        console.log('homeState')
        console.log(homeState)
        //console.log(Object.values((homeState?.fields['desktop']?.fields['root']?.fields['items'].contents) || {}));
    }, [homeState]);

    useEffect(() => {
        console.log('desktopFolderState');
        console.log(desktopFolderState);
        console.log(desktopFolderState?.value?.items?.getMutableContents().size)
    }, [desktopFolderState]);
    */

    //const [currentFolder, setCurrentFolder] = useState<Folder>(homeState?.fields['desktop']?.fields['root']?.current as Folder);

    const [showCreateSpace, setShowCreateSpace] = useState(false);

    const openCreateSpace = () => {
        setShowCreateSpace(true);
    }

    const closeCreateSpace = () => {
        setShowCreateSpace(false);
    }

    const [showCreateFolder, setShowCreateFolder] = useState(false);

    const openCreateFolder = () => {
        setShowCreateFolder(true);
    }

    const closeCreateFolder = () => {
        setShowCreateFolder(false);
    }

    const [folderItemToRename, setFolderItemToRename] = useState<FolderItem|undefined>(undefined);

    const openRenameFolderItem = (item: FolderItem) => {
        setFolderItemToRename(item);
    }

    const closeRenameFolderItem = () => {
        setFolderItemToRename(undefined);
    }

    const deleteFolderItem = (item: FolderItem, parent: Folder) => {
        parent.items?.deleteElement(item);
        parent.items?.saveQueuedOps();
    }

    const openFolder = (folder: Folder, path?: string) => {

        const pathPrefix = path === undefined? './folder/' : './folder/' + encodeURIComponent(path) + '_';

        const url = pathPrefix + encodeURIComponent(folder.getLastHash());

        navigate(url);
    }

    const openSpace = (entryPointHash: Hash) => {
        window.open('./#/space/' + encodeURIComponent(entryPointHash), '_blank');
    }


    const setViewingFolderByHash = (hash: Hash) => {
        const folder = home?.desktop?._currentFolderItems.get(hash) as (Folder|undefined);
        if (folder !== undefined) {
            setViewingFolder(folder);
        } else {
            homeResources?.store.load(hash).then((obj?: HashedObject) => {
                if (obj instanceof Folder) {
                    obj.loadItemNamesAndWatchForChanges().then(() => {
                        setViewingFolder(obj);
                    });
                }
            })
        }
        
    }

    const homeContext: HomeContext = {
        home: home,
        localDevice: localDevice,
        owner: owner,
        openFolder: openFolder,
        openCreateFolder: openCreateFolder,
        openRenameFolder: openRenameFolderItem,
        openSpace: openSpace,
        openCreateSpace: openCreateSpace,
        deleteFolder: deleteFolderItem,
        setViewingFolder: setViewingFolder,
        setViewingFolderByHash: setViewingFolderByHash,
        viewingFolder: viewingFolder
    };

    useEffect(() => {

        const initHome = async () => {

            const obj = await homeResources?.store.load(homeHash, false);

            if (obj === undefined) {
                setLoadError('Error: The home object (hash ' + homeHash + ') is missing from the store.');
                return;
            }

            if (!(obj instanceof Home)) {
                setLoadError('Error: The home object is of the wrong type:' + obj?.getClassName());
                return;
            }

            const newHome = obj as Home;

            await newHome.findLocalDevice();

            const newOwner = newHome?.getAuthor();
    
            if (newOwner === undefined) {
                setLoadError('Error: the home object has no owner.');
                return;
            }
    
            setOwner(newOwner);

            const rootHash = newHome?.desktop?.root?.hash() as Hash;
            const desktopFolder = await homeResources?.store.loadAndWatchForChanges(rootHash) as Folder;

            await desktopFolder.loadItemNamesAndWatchForChanges();

            setDesktopFolder(desktopFolder);

            await new Promise(r => setTimeout(r, 100));

            //await newHome.loadAndWatchForChanges();
            console.log('STARTING SYNC')
            await newHome.startSync();
            console.log('DONE STARTING SYNC')

            //await newHome.loadAndWatchForChanges();
    
            //await newHome.loadHomeDevice();

            //await newHome.startSync();

            setHome(newHome);
            setLocalDevice(newHome._localDevice);

        }

        if (homeResources !== undefined && homeHash !== undefined) {

            initHome().catch((reason: any) => {
                setLoadError(String(reason))
                console.log('Error initializing home:');
                console.log(reason);
            });

        }

    }, [homeHash, homeResources]);

    const [resourcesForDiscovery, setResourcesForDiscovery] = useState<Resources|undefined>(undefined);

    useEffect(() => {
        HyperBrowserConfig.initStarterResources().then((r: Resources) => {
            setResourcesForDiscovery(r);
        },
        (reason: any) => {
            alert('Error initializing discovery resources: ' + reason);
        })
    }, [])

    const [searchValue, setSearchValue] = useState('');
    const searching = searchValue !== '';

    const [wordsForDiscovery, setWordsForDiscovery] = useState<string|undefined>(undefined);
    const [noDiscovery, setNoDiscovery] = useState(false); 

    const discovered = useObjectDiscoveryWithResources(resourcesForDiscovery, wordsForDiscovery, 'en', 10, true);
    const results = discovered? Array.from(discovered.values()).filter((r: ObjectDiscoveryReply) => r.object !== undefined && supportedSpaces.get(r.object.getClassName()) !== undefined) : [];

    const [wordsForLocalSearch, setWordsForLocalSearch] = useState<string|undefined>(undefined);

    const [searchResults, setSearchResults] = useState<Array<SpaceLink>>([]);

    useEffect(() => {

        const root = homeState?.value?.desktop?.root;

        if (wordsForLocalSearch === undefined || root === undefined) {
            setSearchResults([]);
        } else {
            setSearchResults(FolderTreeSearch.byPhrase(wordsForLocalSearch, root));
        }
        
    }, [wordsForLocalSearch, homeState])

    const doSearch = (value: string) => {

        const words = value.toLowerCase().split(/[ -]+/);
        if (words.length === 3 && WordCode.english.check(words[0]) && WordCode.english.check(words[1]) && WordCode.english.check(words[2])) {
            setWordsForDiscovery(words[0] + '-' + words[1] + '-' + words[2]);
            setDiscoveryTimeout(window.setTimeout(discoveryTimeoutCallback, 8000));
        } else {
            setWordsForDiscovery(undefined);
        }

        if (value.trim().length > 0) {
            setWordsForLocalSearch(value);
        } else {
            setWordsForLocalSearch(undefined);
        }
        
    };

    const searchValueChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setSearchValue(newValue);
        setNoDiscovery(false);
        setShowTimeoutMessage(false);
        if (discoveryTimeout !== undefined) {
            window.clearTimeout(discoveryTimeout);
        }
        setDiscoveryTimeout(undefined);

        if (searchTimeout !== undefined) {
            window.clearTimeout(searchTimeout);
        }

        setSearchTimeout(window.setTimeout(() => doSearch(newValue), 200));

    };

    const searchKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setSearchValue('');
        }
    }

    //const ready = !(homeResources === undefined || home === undefined || owner === undefined || homeState === undefined);
    const ready = !(homeResources === undefined || desktopFolder === undefined || desktopFolderState === undefined || owner === undefined);

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
 
    const navigate = useNavigate();

    const openManageLinkedDevicesDialog = () => {
        navigate('./devices');
    };

    const [searchTimeout, setSearchTimeout] = useState<number|undefined>(undefined);

    const [discoveryTimeout, setDiscoveryTimeout] = useState<number|undefined>(undefined);

    const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

    const discoveryTimeoutCallback = () => {
        setShowTimeoutMessage(true);
        setDiscoveryTimeout(undefined);
    }

    const noLookup = () => {
        setNoDiscovery(true);
    }

    return (
    <Fragment>
        { !ready &&
            <Fragment>
            { loadError === undefined &&
                <p>Initializing home space...</p>
            }
            { loadError !== undefined && 
                <p><span style={{background:'red' , color: 'white'}}>{loadError} </span></p>
            }
            </Fragment>
        }
        { ready &&
        <Fragment>
        <PeerComponent resources={homeResources}>
        <AppBar position="fixed" color="default">
            <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Link to="/start" style={{height: 34}}><img src="isologo.png" style={{height: 34, paddingRight: '0.75rem'}} /></Link>
                <Typography style={{textAlign: 'center', flexGrow: 1}} variant="h6" noWrap>
                    🏠 {owner.info?.name}'s Home Space
                </Typography>
                <Container style={{paddingRight: 0, width: 'auto'}} sx={{paddingLeft: {xs: 0, sm: '2rem', md: '4rem'}}}>
                    <IconButton onClick={openDrawer}><img src="icons/streamline-icon-navigation-menu-1@48x48.png" style={{width:'36px', height:'36px', margin:'2px', padding: '2px'}}></img></IconButton>
                </Container>
            </Toolbar>
        </AppBar>
        <main style={{height: "100%"}}>
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    pt: {xs: 10, sm: 12},
                    pb: 6,
                    height: "100%"
                }}
            >

                <Stack sx={{ justifyContent: 'space-between', height: "100%"}}>
                    { !searching &&
                    <Container maxWidth="xl" style={{/*overflow: 'scroll'*/}}>
                        <Stack
                            sx={{ justifyContent: 'space-between', pt: {xs: 2, sm: 3}, pl: {xs: 0, sm: '1rem', md: '4rem'}, pr: {xs: 0, sm: '1rem', md: '4rem'}}}
                            direction='row'
                            spacing={2}
                        >
                            <Stack
                                direction='row'
                                spacing={0}
                                style={{flexWrap: 'wrap'}}
                            >
                                {/*{Object.values((homeState?.fields['desktop']?.fields['root']?.fields['items']?.contents) || {}).map((proxy: StateProxy) => {*/}
                                {/*{Object.values(((homeState?.value as Home)?.desktop?.root?.items?.contents()) || {}).map((proxy: FolderItem) => {*/}
                                {Object.values(((desktopFolderState?.value as Folder)?.items?.contents()) || {}).map((proxy: FolderItem) => {

                                        const showItem = (item: FolderItem) => {


                                            

                                            //const item = homeState?.fields['desktop']?.fields['items']?.contents['itemHash'];
                                            //const name = item.fields['name'].current as MutableReference<string>;

                                            if (item instanceof Folder && item.name?.getValue() !== undefined) {
                                                const name = item.name;
                                                return <HomeItem 
                                                            key={item.getLastHash()}
                                                            icon="streamline-icon-folder-empty@48x48.png" 
                                                            name={name?.getValue()}
                                                            click={() => { openFolder(item); }}
                                                            menu={[{name: 'Open',   action: () => { openFolder(item); } }, 
                                                                   {name: 'Rename', action: () => { openRenameFolderItem(item); }}, 
                                                                   {name: 'Delete', action: () => { deleteFolderItem(item, desktopFolder); }}]}
                                                        />;
                                            } else if (item instanceof SpaceLink && item.name?.getValue() !== undefined) { 
                                                const name = item.name;
                                                return <HomeItem 
                                                key={item.getLastHash()}
                                                icon="streamline-icon-pencil-write-1@48x48.png" 
                                                name={name?.getValue()}
                                                click={() => { openSpace(item.spaceEntryPoint?.getLastHash() as Hash); }}
                                                menu={[{name: 'Open',   action: () => { openSpace(item.spaceEntryPoint?.getLastHash() as Hash); } }, 
                                                       {name: 'Rename', action: () => { openRenameFolderItem(item); }}, 
                                                       {name: 'Delete', action: () => { deleteFolderItem(item, desktopFolder); }}]}
                                            />;
                                            } else {
                                                return <Fragment key={item.getLastHash()}></Fragment>;
                                            }
                                        };

                                        return showItem(proxy);
                                    })
                                }

                                {/*<HomeItem icon="streamline-icon-folder-empty@48x48.png" name="Public Folder"></HomeItem>*/}
                                {/*<HomeItem icon="streamline-icon-common-file-empty@48x48.png" name="Personal Page" click={() => {alert('Pages will be available soon.')}}></HomeItem>*/}
                                {/*<HomeItem icon="streamline-icon-pencil-write-1@48x48.png" name="Notes" click={() => {alert('Text documents will be available soon.')}}></HomeItem>*/}
                                <HomeItem
                                    icon="streamline-icon-add-circle-bold@48x48.png" 
                                    name=" " 
                                    menu={[
                                        {
                                            name: 'New Folder',
                                            action: openCreateFolder
                                        },
                                        {
                                            name: 'New Space',
                                            action: openCreateSpace
                                        }]}
                                    clickOpensMenu />

                                {/*<HomeItem icon="📂" name="Public Folder"></HomeItem>
                                <HomeItem icon="📄" name="Personal Page"></HomeItem>
                                <HomeItem icon="✍️" name="Notes"></HomeItem>
            <HomeItem icon="➕" name=" "></HomeItem>*/}


                                
                            
                            </Stack>
                            <Stack
                                direction='row'
                                spacing={2}
                            >
                                <HomeItem icon="streamline-icon-archive@48x48.png" name="Archived" badge={4} click={() => {alert('Archived items will be available soon.')}}></HomeItem>
                            </Stack>
                            

                        </Stack>
                    </Container>
                    }
                    <Stack>
                        { !searching &&
                        <Container maxWidth="md" sx={{pt: 2}}>
                            <Container sx={{width:{xs: '65%', sm:'55%', md: '52%', lg:'50%'}}}>
                                <h3><img src="logo.png" style={{width: '100%'}}/></h3>
                            </Container>
                        </Container>
                        }
                        <Container maxWidth="lg">
                            <Stack
                                sx={{ pt: {xs: 2, sm: 3} }}
                                direction={{xs:'column',  sm:'row'}}
                                spacing={2}
                                justifyContent="center"
                            >
                                <TextField 
                                    variant="outlined" 
                                    sx={{width: {xs: '100%', sm: '70%', md: '60%', lg: '50%'}}}
                                    InputProps={{
                                        startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography fontSize="1.7rem">🔎</Typography>
                                        </InputAdornment>
                                        ),
                                    }}
                                    label="3-words for lookup or keywords to search your home"
                                    value={searchValue}
                                    onChange={searchValueChanged}
                                    onKeyUp={searchKeyUp}
                                >

                                </TextField>
                            </Stack>
                        </Container>
                        { searching && wordsForDiscovery !== undefined && !noDiscovery &&
                        <Container maxWidth="lg" style={{marginTop:'2rem'}} >
                            <Card variant='outlined' sx={{width: {xs: '100%', sm: '70%', md: '60%', lg: '50%'}}} style={{margin: 'auto'}}>
                                <CardContent>
                                    <Typography variant='body1'>Matches for 3-word code <span style={{backgroundColor: 'yellow'}}>{wordsForDiscovery.replaceAll('-', ' ')}</span></Typography>
                                    {results.length === 0 && 
                                        <Fragment>
                                            <Box sx={{display: 'flex', marginTop: '2rem'}}>
                                                <CircularProgress style={{margin: 'auto'}}/>
                                            </Box>
                                            { showTimeoutMessage && 
                                            <Box sx={{display: 'flex', marginTop: '1rem'}}>
                                                <Typography>This is taking longer than expected. Are your 3-words correct? Poke someone to open this space then.</Typography>
                                            </Box>
                                            }
                                            <Box sx={{display: 'flex', marginTop: '1rem'}}>
                                                <Button style={{margin: 'auto'}} onClick={noLookup}>Cancel</Button>
                                            </Box>
                                        </Fragment>
                                    }
                                    {results.length > 0 &&
                                    <Fragment>
                                        <Stack divider={<Divider orientation="horizontal" flexItem />} style={{marginTop: '1rem'}} >
                                            {results.map((r: ObjectDiscoveryReply) => 
                                                                    <Stack key={r.object?.getLastHash()} style={{justifyContent: 'space-between'}} direction="row"  spacing={2}>
                                                                        <Typography style={{alignSelf: 'center'}}>
                                                                            <span style={{background: (supportedSpaces.get(r.object?.getClassName() as string) as SpaceDisplayInfo).color, color: 'white'}}>{(supportedSpaces.get(r.object?.getClassName() as string) as SpaceDisplayInfo).name}</span>{r.object?.getAuthor()?.info?.name && <Fragment> space by {r.object?.getAuthor()?.info?.name}</Fragment> }
                                                                        </Typography>  
                                                                        <Button variant="contained" onClick={() => { openSpace(r.object?.getLastHash() as Hash); }}>Open</Button>
                                                                    </Stack>
                                            )}
                                        </Stack>
                                        <Box sx={{display: 'flex', marginTop: '1rem'}}>
                                            <Button style={{margin: 'auto'}} onClick={noLookup}>Close</Button>
                                        </Box>
                                        </Fragment>
                                    }
                                </CardContent>
                            </Card>
                        </Container>
                        }

                        { searching && searchResults.length > 0 &&
                            <Container maxWidth="lg" style={{marginTop:'2rem'}} >
                                <Box sx={{width: {xs: '100%', sm: '70%', md: '60%', lg: '50%'}}} style={{margin: 'auto'}}>

                                    <Stack
                                        direction='row'
                                        spacing={0}
                                        style={{flexWrap: 'wrap', paddingTop: '1rem'}}
                                    >
                                    {searchResults.map((link: SpaceLink) => (
                                        <HomeItem 
                                        key={link.getLastHash()}
                                        icon="streamline-icon-pencil-write-1@48x48.png" 
                                        name={link.name?.getValue()}
                                        click={() => { openSpace(link.spaceEntryPoint?.getLastHash() as Hash); }}
                                        />
                                    ))}

                                    </Stack>


                                </Box>
                            </Container>
                            }
                    </Stack>

                    <Container maxWidth="lg" sx={{pt:12, pl:0, pr:0}}>
                        <div style={{textAlign: 'center'}}>
                        <ButtonGroup style={{flexWrap: 'wrap'}} variant="contained" color="inherit">
                            <HomeCommand icon="streamline-icon-single-neutral-profile-picture@48x48.png" title="Profile" action={() => {alert('Profiles will be available soon.')}}></HomeCommand>
                            <HomeCommand icon="streamline-icon-book-address@48x48.png" title="Contacts" action={() => {alert('Contacts will be available soon.')}}></HomeCommand>
                            <HomeCommand icon="streamline-icon-conversation-chat-2@48x48.png" title="Chat" badge={4} action={() => {alert('Chat will be available soon.')}}></HomeCommand>
                            <HomeCommand icon="streamline-icon-satellite-1@48x48.png" title="Spaces" action={() => {alert('Space updates will be available soon.')}}></HomeCommand>
                            {/*<HomeCommand icon="streamline-icon-cog-1@48x48.png" title="Config"></HomeCommand>
                            <HomeCommand icon="🙂" title="Profile"></HomeCommand>
                            <HomeCommand icon="📒" title="Contacts"></HomeCommand>
                            <HomeCommand icon="💬" title="Chat" badge={4}></HomeCommand>
                            <HomeCommand icon="🛸" title="Spaces"></HomeCommand>
                            <HomeCommand icon="⚙️" title="Config"></HomeCommand>*/}
                        </ButtonGroup>
                        </div>
                    </Container>

                </Stack>
            </Box>
            <SwipeableDrawer anchor='right' open={showDrawer} onOpen={onOpenDrawer} onClose={onCloseDrawer}>
            <Box
                sx={{ width: 300 }}
                role="presentation"
                onClick={onCloseDrawer}
                onKeyDown={onCloseDrawer}
            >
                <List
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
                </List>
            
            </Box>
            </SwipeableDrawer>

            { showCreateSpace && 
                <CreateSpaceDialog folder={(viewingFolder || desktopFolder) as Folder} context={homeContext} onClose={closeCreateSpace}/>
            }

            { showCreateFolder &&
                <CreateFolderDialog parent={(viewingFolder || desktopFolder) as Folder} context={homeContext} onClose={closeCreateFolder}/>
            }

            { folderItemToRename !== undefined &&
                <RenameFolderItemDialog item={folderItemToRename} context={homeContext} onClose={closeRenameFolderItem}/>
            }

            {/*  homeState?.value?.desktop?.root */}

            <Outlet context={homeContext} />

        </main>

        </PeerComponent>
        </Fragment>
        
        }
    </Fragment>
    
    );

}



export type { HomeContext };

export default HomeSpace;