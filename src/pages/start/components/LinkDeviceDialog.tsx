import { Dialog, DialogContent, DialogTitle, Stack, Typography, TextField, Card, CardContent, DialogActions, Button, Paper, IconButton, DialogContentText } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router';
import { HyperBrowserConfig } from '../../../model/HyperBrowserConfig';
import { useHyperBrowserEnv } from '../../../context/HyperBrowserContext';
import { Hash, Identity, MutableSet } from '@hyper-hyper-space/core';
import { Device, Home, LinkDeviceOffer } from '@hyper-hyper-space/home';

function LinkDeviceDialog(params: {id: Identity, offer: LinkDeviceOffer, remoteDevice: Device}) {

    const navigate = useNavigate();

    const cancel = () => {
        navigate('/start');
    }

    const env = useHyperBrowserEnv();

    const [showLinkingDialog, setShowLinkingDialog] = useState<boolean>(false);

    const [deviceName, setDeviceName] = useState<string>(constructDeviceName());

    const deviceNameInput = useRef<HTMLInputElement>(null);

    const [deviceNameError, setDeviceNameError] = useState(false);

    const replicateHome = () => {

        let go = true;

        const deviceNameError = deviceName.trim() === '';
        setDeviceNameError(deviceNameError);
        go = go && !deviceNameError;

        if (go) {

            setShowLinkingDialog(true);

            HyperBrowserConfig.create(params.id.info, deviceName, env.homes.value as MutableSet<Hash>, params.id._keyPair)
                .then(async (home: Home) => {
                    
                    console.log('created home')

                    const store = params.offer.getStore();
                    await store.save(params.offer);

                    console.log('saved offer')
                    
                    const resources = await HyperBrowserConfig.initHomeResources(home.hash(), (err: string) => {
                        console.log('error verifying sync:')
                        console.log(err);
                    });

                    home.setResources(resources);
                    
                    await home.addDevice(params.remoteDevice);

                    console.log('added remote device, starting sync...')

                    await home.startSync();
                    
                    console.log('sync started')
                    
                    const localDevice = (await home.findLocalDevice()) as Device;

                    await params.offer.newDevice?.setValue(localDevice);
                    await params.offer.newDevice?.saveQueuedOps();

                    console.log('added local devicem waiting for remote...')

                    const replRemoteDevice = home.devices?.get(params.remoteDevice.hash()) as Device;

                    console.log('remote device is:')
                    console.log(replRemoteDevice);

                    while (replRemoteDevice.name?.getValue() === undefined) {
                        console.log('waiting for sync...')
                        await new Promise(r => setTimeout(r, 500)); 
                    }

                    console.log('verified sync!');

                    await home.stopSync();

                    resources.store?.close();
                    resources.mesh?.pod?.shutdown();

                })
                .then(() => {
                    navigate('/');
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
        <DialogContentText style={{padding: 2}}>
          <Typography>You will be redirected to your Home Space in a few seconds...</Typography>
        </DialogContentText>
    </Dialog>
</Fragment>);
}

const deviceNamePatterns: Array<[RegExp, string]> = [
    [/windows nt 10.0/i, 'Windows 10'],
    [/windows nt 6.2/i, 'Windows 8'],
    [/windows nt 6.1/i, 'Windows 7'],
    [/windows nt 6.0/i, 'Windows Vista'],
    [/windows nt 5.2/i, 'Windows Server 2003/XP x64'],
    [/windows nt 5.1/i, 'Windows XP'],
    [/windows xp/i, 'Windows XP'],
    [/windows nt 5.0/i, 'Windows 2000'],
    [/windows me/i, 'Windows ME'],
    [/win98/i, 'Windows 98'],
    [/win95/i, 'Windows 95'],
    [/win16/i, 'Windows 3.11'],
    [/macintosh|mac os x/i, 'Mac OS X'],
    [/mac_powerpc/i, 'Mac OS 9'],
    [/linux/i, 'Linux'],
    [/ubuntu/i, 'Ubuntu'],
    [/iphone/i, 'iPhone'],
    [/ipod/i, 'iPod'],
    [/ipad/i, 'iPad'],
    [/android/i, 'Android'],
    [/blackberry/i, 'BlackBerry'],
    [/webos/i, 'Mobile']
];

const browserNamePatterns: Array<[RegExp, string]> = [
    [/opera/i, 'Opera'],
    [/edg/i, 'Edge'],
    [/chrome/i, 'Chrome'],
    [/safari/i, 'Safari'],
    [/firefox/i, 'Firefox'],
    [/msie/i, 'IE']
];

function constructDeviceName() {

    let name = '';

    const agent = navigator.userAgent;

    for (const [pattern, browser] of browserNamePatterns) {
        if (pattern.test(agent)) {
            name = browser + ' on ';
            break;
        }
    }

    for (const [pattern, os] of deviceNamePatterns) {
        if (pattern.test(agent)) {
            name = name + os;
            break;
        }
    }

    if (name === '') {
        name = 'My first device';
    }

    return name;

}

export default LinkDeviceDialog;