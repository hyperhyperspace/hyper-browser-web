import { Dialog, DialogContent, DialogTitle, Stack, Typography, TextField, Card, CardContent, DialogActions, Button, Paper, IconButton, DialogContentText } from '@mui/material';
import { useState, useRef, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Hash, Identity, MutableSet } from '@hyper-hyper-space/core';
import { Device, Home, LinkDeviceOffer } from '@hyper-hyper-space/home';


import { HyperBrowserConfig } from '../../../model/HyperBrowserConfig';
import { DeviceInfo } from '../../../model/DeviceInfo';
import { useHyperBrowserEnv } from '../../../context/HyperBrowserContext';


function LinkDeviceDialog(params: {id: Identity, offer: LinkDeviceOffer, remoteDevice: Device}) {

    const navigate = useNavigate();

    const cancel = () => {
        navigate('/start');
    }

    const env = useHyperBrowserEnv();

    const [showLinkingDialog, setShowLinkingDialog] = useState<boolean>(false);

    const [deviceName, setDeviceName] = useState<string>(DeviceInfo.constructDeviceName());

    const deviceNameInput = useRef<HTMLInputElement>(null);

    const [deviceNameError, setDeviceNameError] = useState(false);

    const { next } = useParams();

    const replicateHome = () => {

        let go = true;

        const deviceNameError = deviceName.trim() === '';
        setDeviceNameError(deviceNameError);
        go = go && !deviceNameError;

        if (go) {

            setShowLinkingDialog(true);

            HyperBrowserConfig.createHome(params.id.info, deviceName, env.homes.value as MutableSet<Hash>, params.id.getKeyPairIfExists())
                .then(async (home: Home) => {
                    
                    console.log('created home')

                    console.log(home);

                    const store = params.offer.getStore();
                    await store.save(params.offer);

                    console.log('saved offer')
                    
                    const resources = await HyperBrowserConfig.initHomeResources(home.hash(), (err: string) => {
                        console.log('error verifying sync:')
                        console.log(err);
                    });

                    

                    home.setResources(resources);

                    const remoteDevice = params.remoteDevice.clone();
                    remoteDevice.setResources(resources);
                    remoteDevice.setAuthor(home.getAuthor() as Identity);
                    remoteDevice.name?.setAuthor(home.getAuthor() as Identity);
                    remoteDevice.name?.setWriter(home.getAuthor() as Identity);
                    
                    console.log(home.getAuthor() as Identity);

                    await home.addDevice(/*params.*/remoteDevice);

                    console.log('added remote device, starting sync...')

                    await home.startSync(true);
                    
                    console.log('sync started')
                    
                    const localDevice = (await home.findLocalDevice()) as Device;

                    localDevice.forgetResources();
                    localDevice.setAuthor(home.getAuthor() as Identity);
                    localDevice.name?.setAuthor(home.getAuthor() as Identity);
                    localDevice.name?.setWriter(home.getAuthor() as Identity);

                    await params.offer.newDevice?.setValue(localDevice);
                    await params.offer.newDevice?.saveQueuedOps();

                    console.log('added local device, waiting for remote...')

                    const replRemoteDevice = home.devices?.get(params.remoteDevice.hash()) as Device;

                    console.log('remote device is:')
                    console.log(replRemoteDevice);

                    while (replRemoteDevice.name?.getValue() === undefined) {
                        console.log('waiting for sync...')
                        await new Promise(r => setTimeout(r, 500));
                    }

                    console.log('verified sync!');

                    await new Promise(r => setTimeout(r, 1000)); // Give it a little while to try to complete sync
                                                                 // of devices, will be finished after reload if not.

                    await home.stopSync();

                    resources.store?.close();
                    resources.mesh?.pod?.shutdown();

                })
                .then(() => {
                    if (next === undefined) {
                        navigate('/');
                    } else {
                        navigate('/' + next);
                    }
                });
        }
        
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
            replicateHome();
        }
    };

    return (
<Fragment>
    <Dialog open={true} scroll='paper' onClose={cancel}>
        <DialogTitle>Link Device to your Home Space</DialogTitle>
        <DialogContent>
            <Card variant="outlined">
            <CardContent style={{background: 'lightgray'}}>
            <Typography>
                The contents of your Home Space will be replicated automatically to this device, and they will be kept in sync.
            </Typography>
            </CardContent>
            </Card>
            <Paper sx={{ mt: {xs: 3, sm: 5}, p: 2 }}>
            <Stack spacing={2} >
                <Stack spacing={0} direction="row" justifyContent="space-between">
                <Typography>🏠 Home Info: </Typography>
                </Stack>
                <TextField value={params.id.info?.name} InputProps={{readOnly: true}}/>
                <TextField value={deviceName} inputRef={deviceNameInput} onChange={handleDeviceNameChange} onKeyPress={handleDeviceNameKeyPress} error={deviceNameError} helperText={deviceNameError? "Please enter this device's name" : "This Device's Name"}/>
            </Stack>
            </Paper>
        </DialogContent>
        <DialogActions>
            <Stack direction="row" style={{margin: 'auto'}} spacing={2}><Button variant="outlined" onClick={replicateHome} disabled={showLinkingDialog}>Link Device</Button><Button onClick={cancel}>Cancel</Button></Stack>
        </DialogActions>
    </Dialog>
    <Dialog open={showLinkingDialog}>
        <DialogTitle>
          Linking to {params.id.info?.name}'s Home Space
        </DialogTitle>
        <DialogContentText style={{padding: '2rem'}}>
          You will be redirected to your Home Space in a few seconds...
        </DialogContentText>
    </Dialog>
</Fragment>);
}



export default LinkDeviceDialog;