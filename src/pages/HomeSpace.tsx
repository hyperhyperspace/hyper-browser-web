import { AppBar, ButtonGroup, Container, SwipeableDrawer, IconButton, InputAdornment, Stack, TextField, Toolbar, Typography, List, ListSubheader, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Box } from '@mui/system';

import { Fragment, useState, useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router';

import HomeItem from '../components/HomeItem';
import HomeCommand from '../components/HomeCommand';
import { Hash, HashedObject, Identity, Mesh, MutableSet, Resources, Store, WorkerSafeIdbBackend } from '@hyper-hyper-space/core';
import { HyperBrowserConfig } from '../model/HyperBrowserConfig';
import { PeerComponent, StateObject, useStateObject, useStateObjectByHash } from '@hyper-hyper-space/react';
import { Home, Folder, Device } from '@hyper-hyper-space/home';

type HomeContext = {
    home: Home | undefined,
    owner: Identity | undefined,
    devices: StateObject<MutableSet<Device>> | undefined,
    desktop: StateObject<Folder> | undefined;
}

function HomeSpace() {

    const params = useParams();

    const homeHash = decodeURIComponent(params.hash as string);
    const [homeResources, setHomeResources] = useState<Resources|undefined>(undefined);

    const [loadError, setLoadError] = useState<string|undefined>(undefined);

    useEffect(() => {
        initHomeResources(homeHash, setLoadError).then((r: Resources) => {
            setHomeResources(r);
        })
    }, []);

    
    const [home, setHome]   = useState<Home|undefined>(undefined);
    const [owner, setOwner] = useState<Identity|undefined>(undefined);

    const devices = useStateObject<MutableSet<Device>>(home?.devices);
    const desktop = useStateObject<Folder>(home?.desktop);

    const homeContext: HomeContext = {
        home: home,
        owner: owner,
        devices: devices,
        desktop: desktop
    };

    useEffect(() => {
        homeResources?.store.load(homeHash).then((obj?: HashedObject) => {

            if (obj === undefined) {
                setLoadError('Error: The home object (hash ' + homeHash + ' is missing from the store.');
                return;
            }

            if (!(obj instanceof Home)) {
                setLoadError('Error: The home object is of the wrong type:' + obj?.getClassName());
                return;
            }

            const newHome = obj as Home;

            setHome(newHome);

            const newOwner = newHome?.getAuthor();

            if (newOwner === undefined) {
                setLoadError('Error: the home object has no owner.');
                return;
            }

            setOwner(newOwner);

            home?.loadAndWatchForChanges();

        }).catch((reason: any) => {
            setLoadError(String(reason))
        });

    }, [homeHash, homeResources]);

    const [searchValue, setSearchValue] = useState('');
    const searching = searchValue !== '';

    const searchValueChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setSearchValue(newValue);
    };

    const searchKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setSearchValue('');
        }
    }

    const ready = !(homeResources === undefined || home === undefined || owner === undefined);

    const [showDrawer, setShowDrawer] = useState(false);

    const onCloseDrawer = (ev: React.SyntheticEvent) => {
        setShowDrawer(false);
    }

    const onOpenDrawer = (ev: React.SyntheticEvent) => {
        setShowDrawer(true);
    }

    const openDrawer = () => {
        setShowDrawer(true);
    }
 
    const location = useLocation();

    useEffect(() => {
        console.log(location);
    }, [location]);

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
                <img src="isologo.png" style={{height: 34, paddingRight: '0.75rem'}} />
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
                    <Container maxWidth="xl">
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
                                
                                {desktop?.value?.items?.contents().map((obj: HashedObject) => {
                                    {obj instanceof Folder && 
                                        <HomeItem icon="streamline-icon-folder-empty@48x48.png" name="Public Folder"></HomeItem>    
                                    }

                                    })
                                }

                                <HomeItem icon="streamline-icon-folder-empty@48x48.png" name="Public Folder"></HomeItem>
                                <HomeItem icon="streamline-icon-common-file-empty@48x48.png" name="Personal Page"></HomeItem>
                                <HomeItem icon="streamline-icon-pencil-write-1@48x48.png" name="Notes"></HomeItem>
                                <HomeItem icon="streamline-icon-add-circle-bold@48x48.png" name=" "></HomeItem>

                                {/*<HomeItem icon="📂" name="Public Folder"></HomeItem>
                                <HomeItem icon="📄" name="Personal Page"></HomeItem>
                                <HomeItem icon="✍️" name="Notes"></HomeItem>
            <HomeItem icon="➕" name=" "></HomeItem>*/}


                                
                            
                            </Stack>
                            <Stack
                                direction='row'
                                spacing={2}
                            >
                                <HomeItem icon="streamline-icon-archive@48x48.png" name="Archived" badge={4}></HomeItem>
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
                    </Stack>

                    <Container maxWidth="lg" sx={{pt:12, pl:0, pr:0}}>
                        <div style={{textAlign: 'center'}}>
                        <ButtonGroup style={{flexWrap: 'wrap'}} variant="contained" color="inherit">
                            <HomeCommand icon="streamline-icon-single-neutral-profile-picture@48x48.png" title="Profile"></HomeCommand>
                            <HomeCommand icon="streamline-icon-book-address@48x48.png" title="Contacts"></HomeCommand>
                            <HomeCommand icon="streamline-icon-conversation-chat-2@48x48.png" title="Chat" badge={4}></HomeCommand>
                            <HomeCommand icon="streamline-icon-satellite-1@48x48.png" title="Spaces"></HomeCommand>
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
                        <ListItemButton sx={{ pl: 4 }} onClick={openDrawer}>
                            <ListItemIcon>
                                <img src="icons/streamline-icon-connect-device-exchange@48x48.png" style={{width:'28px', height:'28px', margin:'2px', padding: '2px'}}></img>
                            </ListItemIcon>
                            <ListItemText primary="Linked Devices" />
                        </ListItemButton>
                    </List>
                </List>
            
            </Box>
            </SwipeableDrawer>

            <Outlet context={homeContext} />

        </main>

        </PeerComponent>
        </Fragment>
        
        }
    </Fragment>
    
    );

}

const initHomeResources = async(homeHash: Hash, setLoadError: (err: string) => void) => {
    const backend = new WorkerSafeIdbBackend(HyperBrowserConfig.backendNameForHomeHash(homeHash));

    try {
        console.log('Initializing storage backend for home space ' + homeHash + '...');
        await backend.ready();
        console.log('Storage backend for home space ready');
    } catch (e: any) {
        console.log('Error initializing storage backend for starter page');
        setLoadError('Error initializing storage backend: ' + e.toString());
    }

    const store = new Store(backend);
    const mesh = new Mesh();

    const resources = await Resources.create({mesh: mesh, store: store});

    return resources;
}

export type { HomeContext };

export default HomeSpace;