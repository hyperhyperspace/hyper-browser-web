import { Hash } from '@hyper-hyper-space/core';
import { Folder, FolderItem, SpaceLink } from '@hyper-hyper-space/home';
import { useObjectState } from '@hyper-hyper-space/react';
import { AppBar, Dialog, DialogActions, DialogContent, IconButton, Stack, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';

import { HomeContext } from '../HomeSpace';
import HomeItem from './HomeItem';


function ViewFolderDialog() {

    const params = useParams();
    const navigate = useNavigate();

    const [open, setOpen] = useState(true);

    const path = params.path?.split('_').map((h: string) => decodeURIComponent(h)) as Array<string>;
    const topLevelFolder   = path.length === 1;

    const close = () => {
        setViewingFolder(undefined);
        navigate('..');
    }

    const { openFolder, openCreateFolder, openRenameFolder, openCreateSpace, openSpace, deleteFolder, setViewingFolder, setViewingFolderByHash, viewingFolder } = useOutletContext<HomeContext>();

    /*const isEventForFolder = (folder?: Folder) => (ev: MutationEvent) => 
        (ev.emitter.getLastHash() === folder?.getLastHash() || 
        ( folder !== undefined && 
          folder.items !== undefined && 
          folder.items.indexOfByHash(ev.emitter.getLastHash()) >= 0));*/

    const folderState = useObjectState<Folder>(viewingFolder, {filterMutations: viewingFolder?.ownEventsFilter()});

    useEffect(() => {
        setViewingFolderByHash(path[path.length-1])
    }, [params.path]);
    

    /*useEffect(() => {
        const folderProm = (resources?.store.loadAndWatchForChanges(path[path.length-1]) as Promise<Folder>);

        if (folderProm !== undefined) {
            folderProm.then((folder: Folder) => {
                folder.loadItemNamesAndWatchForChanges().then(() => {
                    setViewingFolder(folder);
                });
            });    
        }
    }, [params.path, home]);*/

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    return (
    
        <Dialog open={open} scroll='paper' onClose={close} fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='lg' PaperProps={{sx: {minHeight: '60%'}}}>

            <AppBar position="relative" color="default">
                <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}} style={{paddingRight: '12px'}}>
                    <img src="icons/streamline-icon-folder-empty@48x48.png" style={{height: '28px', paddingRight: '0.75rem'}} />
                    <Stack direction="row" spacing={0} sx={{alignItems: 'center'}}>
                    <Typography style={{textAlign: 'center', flexGrow: 1}} variant="h6" noWrap>
                        {(folderState?.value as Folder)?.name?._value === undefined? 'Loading...' : (folderState?.value as Folder)?.name?._value}
                    </Typography>
                    <IconButton onClick={() => { 
                        if (topLevelFolder) {
                            close();
                        } else {
                            navigate('../folder/' + params.path?.split('_').slice(0, -1).map((hash: string) => encodeURIComponent(hash)).join('_'));
                        }
                    }}>
                        <img src="icons/streamline-icon-folder-upload@48x48.png" style={{height: '24px', paddingTop: '2px', marginLeft: '4px'}}/>
                    </IconButton>
                    </Stack>
                    <IconButton onClick={close}><img src="icons/streamline-icon-remove-circle-1@48x48.png" style={{height:'28px'}}></img></IconButton>
                </Toolbar>
            </AppBar>

            
            <DialogContent style={{minHeight: '300px'}}>
                {folderState?.value === undefined &&
                    <Typography>Loading...</Typography>
                }

                {folderState?.value !== undefined && 
                    <Stack
                    direction='row'
                    spacing={0}
                    style={{flexWrap: 'wrap'}}
                    >
                    {Object.values(((folderState?.value as Folder)?.items?.contents()) || {}).map((proxy: FolderItem) => {

                            //const newPath = (path === undefined? '' : path + '_') + encodeURIComponent(folderState?.value?.getLastHash() as string)

                            const showItem = (item: FolderItem) => {


                                if (item instanceof Folder && item.name?.getValue() !== undefined) {
                                    const name = item.name;
                                    return <HomeItem 
                                                key={item.getLastHash()}
                                                icon="streamline-icon-folder-empty@48x48.png" 
                                                name={name?.getValue()}
                                                click={() => { openFolder(item, params.path); }}
                                                menu={[{name: 'Open',   action: () => { openFolder(item, params.path); } }, 
                                                    {name: 'Rename', action: () => { openRenameFolder(item); }}, 
                                                    {name: 'Delete', action: () => { deleteFolder(item, folderState?.value as Folder); }}]}
                                            />;
                                } else if (item instanceof SpaceLink && item.name?.getValue() !== undefined) { 
                                    const name = item.name;
                                    return <HomeItem 
                                    key={item.getLastHash()}
                                    icon="streamline-icon-pencil-write-1@48x48.png" 
                                    name={name?.getValue()}
                                    click={() => { openSpace(item.spaceEntryPoint?.getLastHash() as Hash); }}
                                    /*menu={[{name: 'Open',   action: () => { openFolder(item); } }, 
                                           {name: 'Rename', action: () => { openRenameFolder(item); }}, 
                                           {name: 'Delete', action: () => { deleteFolder(item, desktopFolder); }}]}*/
                                />;
                                } else {
                                    return <Fragment key={item.getLastHash()}></Fragment>;
                                }
                            };

                            return showItem(proxy);
                        })
                    }

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
                    </Stack>
                }
            </DialogContent>
            <DialogActions>
            </DialogActions>
        </Dialog>
    
    );
}

export default ViewFolderDialog;