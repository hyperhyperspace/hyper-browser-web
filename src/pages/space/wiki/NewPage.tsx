import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField} from '@mui/material';

import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import { useNavigate } from 'react-router';

function NewPageDialog(props: {wiki: WikiSpace, onClose: () => void, open: boolean, goToPage: (pageName: string) => void}) {

    const [name, setName] = useState('');
    const [nameError, setNameError] = useState(false);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToPage();
        } else {
            setNameError(false);
        }
    };

    const navigate = useNavigate();


    const goToPage = () => {
        let err = false;

        if (name.trim() === '') {
            setNameError(true);
            err = true;
        }
        
        if (!err) {
            props.goToPage(name);
            props.onClose();
        } 
    };

    return (
        <Dialog open={props.open} scroll='paper' onClose={props.onClose}>
            <DialogTitle>Add a New Page</DialogTitle>

            <DialogContent>

                <Stack direction='column' spacing={2} padding={1}>
                    <TextField
                        value={name} onChange={handleNameChange} 
                        onKeyPress={handleNameKeyPress} 
                        error={nameError} 
                        helperText={nameError? 'Please enter a name' : 'Page name'}
                        fullWidth
                    />
                </Stack>

            </DialogContent>

            <DialogActions>
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button variant="outlined" onClick={goToPage}>Add</Button><Button onClick={props.onClose}>Cancel</Button></Stack>
            </DialogActions>

        </Dialog>
    );
}

export default NewPageDialog;