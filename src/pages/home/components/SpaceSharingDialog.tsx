import { Identity, Mesh, MutableObject} from '@hyper-hyper-space/core';
import { FolderItem, Profile, SpaceLink } from '@hyper-hyper-space/home';
import { useObjectState, useSyncStates } from '@hyper-hyper-space/react';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import { AppBar, Button, Dialog, DialogActions, DialogContent, FormControlLabel, FormGroup, IconButton, MenuItem, Select, SelectChangeEvent, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { Hash, useNavigate, useOutletContext } from 'react-router';
import InfoDialog from '../../../components/InfoDialog';
import { TextSpace } from '../../../model/text/TextSpace';
import { HomeContext } from '../HomeSpace';
import InfoIcon from '@mui/icons-material/Info';


function SpaceSharingDialog() {
    const navigate = useNavigate();

    const [open, setOpen] = useState(true);

    const close = () => {
        navigate('..');
    }

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const toggleHosting = () => {
        const oldVal = home?._localDevice?.hostContactSpaces?.getValue();

        home?._localDevice?.hostContactSpaces?.setValue(!(oldVal === undefined || oldVal));
        home?._localDevice?.hostContactSpaces?.save();
    };

    const { home, spaceEntryPoints } = useOutletContext<HomeContext>();

    const homeState = useObjectState(home);
    const desktopState = useObjectState(home?.desktop);
    const deviceState = useObjectState(home?._localDevice);
    const configState = useObjectState(home?.contacts?._hostingConfig);
    const contactsState = useObjectState(home?.contacts);

    const [sharingSpaces, setSharingSpaces] = useState<Array<[MutableObject, string]>>([]);

    useEffect(() => {

        const s: Array<[MutableObject, string]> = [];

        for (const id of contactsState?.getValue()?.hosting?.values()||[]) {
            const profileHash = new Profile(id).hash();

            for (const link of contactsState?.getValue()?.current?.get(profileHash)?.published?.values()||[]) {

                let mut: MutableObject|undefined  = undefined;
                let peerGroupId: string|undefined = undefined;

                if (link.spaceEntryPoint instanceof TextSpace) {                    
                    mut = link.spaceEntryPoint.content;
                    peerGroupId = Mesh.discoveryPeerGroupId(link.spaceEntryPoint);
                } else if (link.spaceEntryPoint instanceof WikiSpace) {
                    mut = link.spaceEntryPoint.pages;
                    peerGroupId = link.spaceEntryPoint.getLastHash(); // FIXME
                }

                if (mut !== undefined && peerGroupId !== undefined) {
                    s.push([mut, peerGroupId]);
                }
            }
        }

        setSharingSpaces(s);
    }, [contactsState]);


    const [ownSpaces, setOwnSpaces] = useState<Array<[MutableObject, string]>>([]);

    useEffect(() => {

        const s: Array<[MutableObject, string]> = [];

        for (const item of Array.from(desktopState?.getValue()?._currentFolderItems.values() || []).filter((item: FolderItem) => item instanceof SpaceLink)) {

            const link = item as SpaceLink;

            let mut: MutableObject|undefined  = undefined;
            let peerGroupId: string|undefined = undefined;

            const entryPoint = spaceEntryPoints[link.spaceEntryPoint?.getLastHash() as Hash];

            if (entryPoint instanceof TextSpace) {
                mut = entryPoint.content;
                peerGroupId = Mesh.discoveryPeerGroupId(entryPoint);
            } else if (entryPoint instanceof WikiSpace) {
                mut = entryPoint.pages;
                peerGroupId = entryPoint.getLastHash(); // FIXME
            }

            if (mut !== undefined && peerGroupId !== undefined) {
                s.push([mut, peerGroupId]);
            }
        }

        console.log('OWN SPACES', s);

        setOwnSpaces(s);

    }, [desktopState, spaceEntryPoints]);

    const sharingSpacesSyncStates = useSyncStates(sharingSpaces);
    const ownSpacesSyncStates     = useSyncStates(ownSpaces);

    const hostContactSpaces = deviceState?.getValue()?.hostContactSpaces?.getValue();

    const [showInfoDialog, setShowInfoDialog] = useState(false);

    return (
        <Fragment>

            {showInfoDialog &&
            <InfoDialog 
                    open={showInfoDialog}
                    title="Co-hosting of spaces"
                    content={
                        <Fragment>
                            <Typography>
                                <p>
                                    You can share some of your spaces publicly by right-clicking on them and choosing <i>Share on my profile</i>.
                                </p>
                                <p>
                                    Once you do that, other folks can help you keep these shared spaces online - even if you lose network access or close Hyper Hyper Space on all your devices.
                                </p>
                                <p>
                                    To host some else's spaces, go to <i>Contacts</i>, open their profile, and enable space sharing there. You'll see their spaces show up here!
                                </p>
                            </Typography>
                        </Fragment>
                        
                    }
                    onClose={() => {setShowInfoDialog(false);}}
                />
            }
        
        <Dialog open={open} scroll='paper' onClose={close} fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='md' PaperProps={{sx: {minHeight: '70%'}}}>
            <AppBar position="relative" color="default">
                <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}} style={{paddingRight: '12px'}}>
                    <img src="icons/streamline-icon-satellite-1@48x48.png" style={{height: '28px', paddingRight: '0.75rem'}} />
                    <Stack direction="row" spacing={0} sx={{alignItems: 'center'}}>
                    <Typography style={{textAlign: 'center', flexGrow: 1}} variant="h6" noWrap>
                        Space sharing
                    </Typography>
                    <IconButton onClick={() => {setShowInfoDialog(true);}} style={{marginLeft: '6px', padding: 0}} color="primary" aria-label="About space sharing" ><InfoIcon fontSize="small" color="info" /> </IconButton>
                    </Stack>
                    <IconButton onClick={close}><img src="icons/streamline-icon-remove-circle-1@48x48.png" style={{height:'28px'}}></img></IconButton>
                </Toolbar>
            </AppBar>
            <DialogContent>
                <FormGroup>
                    <FormControlLabel control={<Switch checked={hostContactSpaces === undefined || hostContactSpaces} onChange={toggleHosting}/>} label="Share your contact's spaces in this device"></FormControlLabel>
                </FormGroup>
                <Table stickyHeader aria-label="shared spaces">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" style={{width: '75%'}}>
                                <Typography>Shared spaces</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography>Sharing</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography>Peers</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={3} style={{borderBottom: 'none', paddingTop: '12px', paddingLeft: '10px', paddingBottom: '0px', paddingRight: '10px'}}>
                                <Typography fontSize="small">Spaces in your Home</Typography>
                            </TableCell>
                        </TableRow>
                        {Array.from(homeState?.getValue()?.desktop?._currentFolderItems.values() || []).filter((item: FolderItem) => item instanceof SpaceLink).map((item: FolderItem) => {
                            const link = item as any as SpaceLink;

                            let icon = "";
                            let mut: MutableObject|undefined = undefined;

                            let title: (string | undefined) = undefined;
                            if (link.spaceEntryPoint instanceof TextSpace) {
                                title = 'Text File';
                                icon = 'streamline-icon-pencil-write-1@48x48.png';
                                mut = link.spaceEntryPoint.content;
                            } else if (link.spaceEntryPoint instanceof WikiSpace) {
                                title = 'Wiki';
                                icon = 'streamlinehq-book-edit-content-48.png';
                                mut = link.spaceEntryPoint.pages;
                            }

                            let syncState = ownSpacesSyncStates[mut?.getLastHash() as Hash];

                            return <TableRow key={link?.getLastHash()}>
                                <TableCell style={{borderBottom: 'none', padding: '6px'}}>
                                    <Stack direction="row"><img src={'icons/' + icon} style={{width:'24px', height:'24px', marginRight: '6px'}}/><Typography>{link.name?.getValue()}</Typography></Stack>
                                </TableCell>
                                <TableCell style={{borderBottom: 'none', padding: '6px', textAlign: 'center'}}>
                                    <Typography>Yes</Typography>
                                </TableCell>
                                <TableCell style={{borderBottom: 'none', padding: '6px', textAlign: 'center'}}>
                                    {(syncState === undefined || Array.from(Object.keys(syncState.remoteStateHashes)).length === 0) && 
                                        <Typography>0</Typography>
                                    }
                                    {(syncState !== undefined && Array.from(Object.keys(syncState.remoteStateHashes)).length > 0) &&
                                        <Typography>{Array.from(Object.keys(syncState.remoteStateHashes)).length}</Typography>
                                    }
                                </TableCell>
                            </TableRow>
                        }) }
                        {Array.from(homeState?.getValue()?.contacts?.hosting?.values()||[]).map((id: Identity) => {

                            const profileHash = new Profile(id).hash();

                            return (<Fragment key={id.getLastHash()}>
                                        <TableRow >
                                            <TableCell colSpan={3} style={{borderBottom: 'none', paddingTop: '12px', paddingLeft: '10px', paddingBottom: '0px', paddingRight: '10px'}}>
                                                <Typography fontSize="small">Spaces shared by {id.info?.name}</Typography>
                                            </TableCell>
                                        </TableRow>
                                        {
                                            Array.from(homeState?.getValue()?.contacts?.current?.get(profileHash)?.published?.values() || []).map((link: SpaceLink) => {
                                                let icon = "";
                                                

                                                let mut: MutableObject|undefined = undefined;

                                                let title: (string | undefined) = undefined;
                                                if (link.spaceEntryPoint instanceof TextSpace) {
                                                    title = 'Text File';
                                                    icon = 'streamline-icon-pencil-write-1@48x48.png';
                                                    mut = link.spaceEntryPoint.content;
                                                } else if (link.spaceEntryPoint instanceof WikiSpace) {
                                                    title = 'Wiki';
                                                    icon = 'streamlinehq-book-edit-content-48.png';
                                                    mut = link.spaceEntryPoint.pages;
                                                }

                                                const configHash = homeState?.getValue()?.contacts?.getHostingConfig(link.getLastHash(), profileHash)?.hash();    
                                                
                                                //const configHash = homeState?.getValue()?.contacts?._hostingConfigMap?.get(link.getLastHash());
                                                const config     = configState?.getValue()?.get(configHash!);

                                                let mode = config?.getValue() || 'auto';

                                                let syncState = sharingSpacesSyncStates[mut?.getLastHash() as Hash];

                                                return (
                                                    <TableRow key={link.getLastHash()}>
                                                        <TableCell style={{borderBottom: 'none', padding: '6px'}}>
                                                            <Stack direction="row"><img src={'icons/' + icon} style={{width:'24px', height:'24px', marginRight: '6px'}}/><Typography>{link.name?.getValue()}</Typography></Stack>
                                                        </TableCell>
                                                        <TableCell style={{borderBottom: 'none', padding: '2px'}}>
                                                            <Select style={{width: '100%'}} size="small" value={mode} onChange={(ev: SelectChangeEvent<string>) => {
                                                                config?.setValue(ev.target.value);
                                                                config?.save();
                                                            }}>
                                                                <MenuItem value="auto">Auto</MenuItem>
                                                                <MenuItem value="on">Yes</MenuItem>
                                                                <MenuItem value="off">No</MenuItem>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell style={{borderBottom: 'none', padding: '6px', textAlign: 'center'}}>
                                                            {(syncState === undefined || Array.from(Object.keys(syncState.remoteStateHashes)).length === 0) && 
                                                                <Typography>0</Typography>
                                                            }
                                                            {(syncState !== undefined && Array.from(Object.keys(syncState.remoteStateHashes)).length > 0) &&
                                                                <Typography>{Array.from(Object.keys(syncState.remoteStateHashes)).length}</Typography>
                                                            }
                                                        </TableCell>
                                                        
                                                    </TableRow>                                                    
                                                );
                                            })
                                        }

                                    </Fragment>);
                        })}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button onClick={close}>Close</Button></Stack>
            </DialogActions>
        </Dialog>
        </Fragment>
    );
}

export default SpaceSharingDialog;