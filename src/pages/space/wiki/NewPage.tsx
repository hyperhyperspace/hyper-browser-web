import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography} from '@mui/material';

import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import { useNavigate, useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';

function NewPage(props: {noNavigation: boolean, contentWidth: string}) {

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

            if (wiki.getPage(name) === undefined) {
                const p = wiki.createPage(name);
                wiki.addPage(p);
            }

            nav.goToPage(name);
        } 
    };

    const navigate = useNavigate();

    return (
        <Stack style={{width: props.contentWidth}} spacing={2} direction="column">
            <TextField
                value={name} onChange={handleNameChange} 
                onKeyPress={handleNameKeyPress} 
                error={nameError} 
                helperText={nameError? 'Please enter a name' : ''}
                fullWidth
                placeholder='Untitled page'
                InputProps={{
                    autoComplete: 'off'
                }}
            />

            <Stack direction="row" spacing={1}><Button variant="contained" size="medium" onClick={goToPage}>Add new page</Button>{props.noNavigation && <Button variant="outlined" size="medium" onClick={() => {navigate(-1)}}>Cancel</Button>}</Stack>
            

        </Stack>
    );
}

export default NewPage;