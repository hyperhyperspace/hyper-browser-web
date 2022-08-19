import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography} from '@mui/material';

import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import { useNavigate, useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';

function NewPage() {

    const {wiki, nav} = useOutletContext<WikiContext>();

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


    const goToPage = () => {
        let err = false;

        if (name.trim() === '') {
            setNameError(true);
            err = true;
        }
        
        if (!err) {
            nav.goToPage(name);
        } 
    };

    return (
        <Stack direction="column">
            <Typography variant="h3">Add a New Page</Typography>

                <Stack direction='column' spacing={2} padding={1}>
                    <TextField
                        value={name} onChange={handleNameChange} 
                        onKeyPress={handleNameKeyPress} 
                        error={nameError} 
                        helperText={nameError? 'Please enter a name' : 'Page name'}
                        fullWidth
                    />
                </Stack>

            <Button variant="outlined" onClick={goToPage}>Add</Button>

        </Stack>
    );
}

export default NewPage;