import { Fragment, useEffect, useState } from 'react';

import { Folder, Home, SpaceLink } from '@hyper-hyper-space/home';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import FolderTreeComponent from '../../components/FolderTreeComponent';
import { Box } from '@mui/system';
import { HashedObject, Identity, MutableReference, SpaceEntryPoint, Store } from '@hyper-hyper-space/core';


function SaveSpaceDialog(props: {home?: Home, spaceEntryPoint: HashedObject & SpaceEntryPoint, onClose: () => void}) {

    const [open, setOpen] = useState(true);

    const [saving, setSaving] = useState(false);

    const defaultName = props.spaceEntryPoint.getName();

    const [name, setName] = useState<string>((defaultName instanceof MutableReference? defaultName.getValue() : defaultName) || '');
    const [nameError, setNameError] = useState(false);

    const [destination, setDestination] = useState(props.home?.desktop?.root as Folder);

    useEffect(() => {
        setDestination(props.home?.desktop?.root as Folder);
    }, [props.home]);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            save();
        } else {
            setNameError(false);
        }
    };

    const close = () => {
        setOpen(false);
        props.onClose();        
    }

    const doSave = async () => {

        setSaving(true);

        const store = (props.home as Home).getStore() as Store;

        const link = new SpaceLink((props.home as Home).getAuthor() as Identity, props.spaceEntryPoint);
        link.name?.setValue(name);

        console.log('destination is defined', destination !== undefined);
        console.log('destination', destination);

        await store.save(link);
        destination.items?.push(link);
        await destination.items?.saveQueuedOps();

        close();
    }

    const save = () => {
        if (name.trim() === '') {
            setNameError(true);
        } else {
            doSave();
        }
    }

    const folderChosen = (folder: Folder) => {
        console.log('choosed:')
        console.log(folder)
        setDestination(folder);
    }

    return (<Dialog open={open} scroll='paper' onClose={close} fullWidth maxWidth='sm'>

                <DialogTitle>
                    Save Space to 🏠
                </DialogTitle>


                <DialogContent>

                    <Stack spacing={2} paddingTop={2} paddingBottom={2} direction="column">
                    
                    <TextField
                        value={name}
                        onChange={handleNameChange}
                        onKeyPress={handleNameKeyPress}
                        error={nameError}
                        autoFocus
                        label="Save as"
                        disabled={saving}/>
                    
                    { props.home?.desktop === undefined && 
                        <Typography>Loading...</Typography>
                    }
                    { props.home?.desktop !== undefined &&
                        <Box>
                            <Typography>Choose folder:</Typography>
                            <FolderTreeComponent style={{padding: '1rem', border: '1px solid', borderRadius: '4px', borderColor: 'lightgray'}} tree={props.home.desktop} onFolderSelect={folderChosen}/>
                        </Box>
                    }
                    
                    </Stack>
                </DialogContent>
                
                <DialogActions>
                    {props.home !== undefined &&
                    <Fragment>
                        { !saving && 
                            <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button variant="outlined" onClick={save}>Save</Button><Button onClick={close}>Cancel</Button></Stack>
                        }
                        { saving && 
                            <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><CircularProgress style={{margin: 'auto'}}/></Stack>
                        }
                    </Fragment>
                    }
                </DialogActions>
            </Dialog>);

}

export default SaveSpaceDialog;