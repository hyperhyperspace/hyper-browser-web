import { Dialog, DialogContent, DialogTitle, Stack, Typography, TextField, Card, CardContent, DialogActions, Button, Paper, IconButton, DialogContentText } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router';
import { Hash, MutableSet } from '@hyper-hyper-space/core';

import { HyperBrowserConfig } from '../../../model/HyperBrowserConfig';
import { DeviceInfo } from '../../../model/DeviceInfo';
import { useHyperBrowserEnv } from '../../../context/HyperBrowserContext';



function CreateHomeDialog() {

    const navigate = useNavigate();

    const cancel = () => {
        navigate('/start');
    }

    const [showInfoDialog, setShowInfoDialog] = useState<boolean>(false);

    const closeInfoDialog = () => {
        setShowInfoDialog(false);
    };

    const openInfoDialog = () => {
        setShowInfoDialog(true);
    }

    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const closeConfirmDialog = () => {
        setShowConfirmDialog(false);
    }

    const env = useHyperBrowserEnv();

    const [showCreatingDialog, setShowCreatingDialog] = useState<boolean>(false);

    const [name, setName] = useState<string>('');
    const [deviceName, setDeviceName] = useState<string>(DeviceInfo.constructDeviceName('My first device'));

    const nameInput = useRef<HTMLInputElement>(null);
    const deviceNameInput = useRef<HTMLInputElement>(null);

    const [nameError, setNameError] = useState(false);
    const [deviceNameError, setDeviceNameError] = useState(false);

    const createHome = () => {

        let go = true;

        const nameError = name.trim() === '';
        setNameError(nameError);
        go = go && !nameError;

        const deviceNameError = deviceName.trim() === '';
        setDeviceNameError(deviceNameError);
        go = go && !deviceNameError;

        if (go) {
            setShowConfirmDialog(true);
        }
        
    };

    const confirmCreateHome = () => {
        setShowConfirmDialog(false);
        setShowCreatingDialog(true);
        HyperBrowserConfig.create({name: name, type: 'person'}, deviceName, env.homes.value as MutableSet<Hash>).then(() => {
            navigate('/');
        });
    }

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleDeviceNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDeviceName(event.target.value);
    };

    const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            deviceNameInput.current?.focus();
        }
    };

    const handleDeviceNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            createHome();
        }
    };

    return (
<Fragment>
    <Dialog open={true} scroll='paper' onClose={cancel}>
        <DialogTitle>Create a Home Space</DialogTitle>
        <DialogContent>
            <Card variant="outlined">
            <CardContent style={{background: 'lightgray'}}>
            <Typography>
                A <b>Home Space</b> uses in-browser storage to create a local, secure environment where you can create, save and sync spaces: both across all your devices and with other people's.
            </Typography>
            </CardContent>
            </Card>
            <Paper sx={{ mt: {xs: 3, sm: 5}, p: 2 }}>
            <Stack spacing={2} >
                <Stack spacing={0} direction="row" justifyContent="space-between">
                <Typography>🏠 Home Info: </Typography> <IconButton onClick={openInfoDialog} style={{padding: 0}} color="primary" aria-label="about home info" ><InfoIcon color="info" /> </IconButton>
                </Stack>
                <TextField value={name} inputRef={nameInput} onChange={handleNameChange} onKeyPress={handleNameKeyPress} autoFocus  error={nameError} helperText={nameError? 'Please enter your name' : 'Your Name'}/>
                <TextField value={deviceName} inputRef={deviceNameInput} onChange={handleDeviceNameChange} onKeyPress={handleDeviceNameKeyPress} error={deviceNameError} helperText={deviceNameError? "Please enter this device's name" : "This Device's Name"}/>
            </Stack>
            </Paper>
        </DialogContent>
        <DialogActions>
            <Stack direction="row" style={{margin: 'auto'}} spacing={2}><Button variant="outlined" onClick={createHome}>Create Home Space</Button><Button onClick={cancel}>Cancel</Button></Stack>
        </DialogActions>
    </Dialog>
    <Dialog
    open={showInfoDialog}
    onClose={closeInfoDialog}
  >
    <DialogTitle>
    <Stack direction="row" spacing={2}><InfoIcon color="info" /> <Typography>About your information</Typography></Stack>
    </DialogTitle>
    <DialogContent>
      <DialogContent>
        
        <Typography>The <b>information</b> you enter will be <b>stored on your own device</b>. 
        It will be used to identify yourself when you connect and share 
        spaces with other people. It doesn't have to be your real name, but 
        it'd be helpful if your friends can easily associate this name with you.</Typography>

        <Typography sx={{pt:2}}>For security reasons <b>your name cannot be changed later</b>.</Typography>

        <Typography sx={{pt:2}}>The device name cannot be seen by others, and is used to 
        help you link / unlink devices.</Typography>
        
      </DialogContent>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeInfoDialog}  style={{margin: 'auto'}} autoFocus>
        Close
      </Button>
    </DialogActions>
  </Dialog>
  <Dialog open={showConfirmDialog} onClose={closeConfirmDialog}>
      <DialogTitle>
          Confirm your information
      </DialogTitle>
      <DialogContent>
        <Card variant="outlined">
            <CardContent style={{background: 'lightgray'}}>
                <Typography>
                    For security reasons, <b>the name you just entered can't be changed later</b>. While it 
                    doesn't have to be your real name, it'd be helpful if your friends can easily 
                    associate this name with you.
                </Typography>

            </CardContent>
        </Card>  
      </DialogContent>
      <DialogActions>
        <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button variant="outlined" onClick={confirmCreateHome}>Continue as {name}</Button><Button onClick={closeConfirmDialog}>Go back</Button></Stack>
      </DialogActions>
  </Dialog>
  <Dialog open={showCreatingDialog}>
      <DialogTitle>
          Creating {name}'s Home Space
      </DialogTitle>
      <DialogContentText style={{padding: '2rem'}}>
        You will be redirected to your new Home Space in a few seconds...
      </DialogContentText>
  </Dialog>
</Fragment>);
}

export default CreateHomeDialog;