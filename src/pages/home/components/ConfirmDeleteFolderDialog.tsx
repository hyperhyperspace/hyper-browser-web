import { Store } from '@hyper-hyper-space/core';
import { Folder } from '@hyper-hyper-space/home';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { Fragment, useState } from 'react';

import { HomeContext } from '../HomeSpace';


function ConfirmDeleteFolderDialog(props: {folder: Folder, context: HomeContext, onClose: () => void}) {

    const [open, setOpen] = useState(true);

    const [creating, setCreating] = useState(false);

    const close = () => {
        setOpen(false);
        props.onClose();
    }

    const [name, setName] = useState(props.folder.name?.getValue() || '');
    const [nameError, setNameError] = useState(false);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            renameFolder();
        } else {
            setNameError(false);
        }
    };

    const { home } = props.context;

    const renameFolder = async () => {

        if (name.trim() === '') {
            setNameError(true);
        } else {
            setCreating(true);
            const store = home?.getStore() as Store;
            await props.folder.name?.setValue(name);
            store.save(props.folder);
            close();
        }

    };


    return (
        <Fragment>
            <Dialog open={open} scroll='paper' onClose={close}>
                <DialogTitle>Rename Folder</DialogTitle>
                
                
                <DialogContent>
                    <TextField 
                        value={name} onChange={handleNameChange} 
                        onKeyPress={handleNameKeyPress} 
                        error={nameError} 
                        helperText={nameError? 'Please enter a name' : 'Folder name'}
                        autoFocus
                        disabled={creating}
                    />
                </DialogContent>
                <DialogActions>
                {!creating &&
                    <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button variant="outlined" onClick={renameFolder} disabled={home===undefined}>Rename</Button><Button onClick={close}>Cancel</Button></Stack>
                }
                {creating &&
                    <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><CircularProgress style={{margin: 'auto'}}/></Stack>
                }
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default ConfirmDeleteFolderDialog;