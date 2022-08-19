import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField} from '@mui/material';

import { Folder, SpaceLink } from '@hyper-hyper-space/home';

import { HyperBrowserConfig } from '../../../model/HyperBrowserConfig';
import { supportedSpaces } from '../../../model/SupportedSpaces';

import { HomeContext } from '../HomeSpace';

import { ClassRegistry, HashedObject, Identity, RSAKeyPair } from '@hyper-hyper-space/core';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';

function CreateSpaceDialog(props: {folder: Folder, context: HomeContext, onClose: () => void}) {

    const [open, setOpen] = useState(true);

    const [creating, setCreating] = useState(false);

    const [spaceType, setSpaceType] = useState<string>('');
    const [spaceTypeError, setSpaceTypeError] = useState(false);

    const handleSpaceTypeChange = (event: SelectChangeEvent<string>) => {
        setSpaceType(event.target.value);
        setSpaceTypeError(false);
    }

    const [name, setName] = useState('');
    const [nameError, setNameError] = useState(false);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            createSpace();
        } else {
            setNameError(false);
        }
    };

    const close = () => {
        setOpen(false);
        props.onClose();
    }

    const { home } = props.context;

    const createSpace = async () => {

        if (home !== undefined ) {

            let err = false;

            if (name.trim() === '') {
                setNameError(true);
                err = true;
            }
            
            if (spaceType === '') { 
                setSpaceTypeError(true);
                err = true;
            }
            
            if (!err) {

                setCreating(true);
    
                const clazz = ClassRegistry.lookup(spaceType) as new () => HashedObject;
    
                console.log(spaceType);
                console.log(clazz);

                // Currently `WikiSpace` objects need to know about
                // their author in their constructor, so this is a workaround...
                // 
                // Maybe there's a way to fix `WikiSpace` so it doesn't need this?
                let entryPoint;
                if (spaceType === WikiSpace.className) {
                    entryPoint = new WikiSpace(home.getAuthor(), name.trim());
                } else {
                    entryPoint = new clazz();
                }

                entryPoint.setAuthor((home.getAuthor()) as Identity);
    

                const link = new SpaceLink(home.getAuthor() as Identity, entryPoint.clone());
                await link.name?.setValue(name.trim());
                await props.folder.getStore().save(link);
                console.log('saved link: ' + link.getLastHash());

                console.log('items: ' + props.folder.items?.getLastHash());
                console.log(props.folder.items?.getStore().getName());
                console.log(props.folder.getStore().getName());
                await props.folder.items?.push(link);
                await props.folder.items?.saveQueuedOps();
                console.log('saved folder items')

                const store = await HyperBrowserConfig.initSavedSpaceStore(home, link.spaceEntryPoint as HashedObject);
                await store.save(entryPoint, true);
                await store.save(home.getAuthor()?.getKeyPair() as RSAKeyPair);

                if (spaceType === WikiSpace.className) {
                    (entryPoint as WikiSpace).createWelcomePage(name);
                }

                window.open('./#/space/' + encodeURIComponent(entryPoint.getLastHash()), '_blank');

                close();
            }
        }
        
    };


    return (
        <Dialog open={open} scroll='paper' onClose={close}>
            <DialogTitle>Create New Space</DialogTitle>

            <DialogContent>

                <Stack direction='column' spacing={2} padding={1}>
                    <FormControl fullWidth>
                        <InputLabel id="select-space-type-label">Type</InputLabel>
                        <Select
                            labelId="select-space-type-label"
                            id="select-space-type"
                            value={spaceType}
                            error={spaceTypeError}
                            label="Type"
                            onChange={handleSpaceTypeChange}
                            disabled={creating}
                        >
                            {Array.from(supportedSpaces.entries()).map(([className, spaceInfo]) => {
                                return <MenuItem key={className} value={className}>{spaceInfo.name}</MenuItem>;
                            })}
                        </Select>
                    </FormControl>

                    <TextField
                        value={name} onChange={handleNameChange} 
                        onKeyPress={handleNameKeyPress} 
                        error={nameError} 
                        helperText={nameError? 'Please enter a name' : 'Space name'}
                        disabled={creating}
                        fullWidth
                    />
                </Stack>

            </DialogContent>

            <DialogActions>
            {!creating &&
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button variant="outlined" onClick={createSpace} disabled={home===undefined}>Create</Button><Button onClick={close}>Cancel</Button></Stack>
            }
            {creating &&
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><CircularProgress style={{margin: 'auto'}}/></Stack>
            }                

            </DialogActions>

        </Dialog>
    );
}

export default CreateSpaceDialog;