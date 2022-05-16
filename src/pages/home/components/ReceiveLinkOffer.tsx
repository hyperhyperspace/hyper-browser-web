import { Fragment, useState, useRef, useEffect } from 'react';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router';
import { Hash, HeaderBasedSyncAgent, Identity, LogLevel, MemoryBackend, Mesh, MutableSet, PeerGroupAgent, Resources, RNGImpl, RSAKeyPair, StateGossipAgent, Store, WordCode } from '@hyper-hyper-space/core';
import { Device, LinkDeviceOffer } from '@hyper-hyper-space/home';
import { HomeContext } from '../HomeSpace';
import { useStateObject } from '@hyper-hyper-space/react';

function ReceiveLinkOffer(props: {close: () => void}) {

    const word1Input = useRef<HTMLInputElement>(null);
    const word2Input = useRef<HTMLInputElement>(null);
    const word3Input = useRef<HTMLInputElement>(null);
    const word4Input = useRef<HTMLInputElement>(null);

    const [currentWord1, setCurrentWord1] = useState('');
    const [currentWord2, setCurrentWord2] = useState('');
    const [currentWord3, setCurrentWord3] = useState('');
    const [currentWord4, setCurrentWord4] = useState('');

    const [word1Error, setWord1Error] = useState(false);
    const [word2Error, setWord2Error] = useState(false);
    const [word3Error, setWord3Error] = useState(false);
    const [word4Error, setWord4Error] = useState(false);

    const handleWord1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentWord1(event.target.value);
    };

    const checkWord1Change = () => {

        if (currentWord1 !== '') {
            setWord1Error(!WordCode.english.check(currentWord1));
        }
    }

    const handleWord1KeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            word2Input.current?.focus();
        }
    }

    const handleWord2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentWord2(event.target.value);
    };

    const checkWord2Change = () => {
        if (currentWord2 !== '') {
            setWord2Error(!WordCode.english.check(currentWord2));
        }
    }

    const handleWord2KeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            word3Input.current?.focus();
        }
    }

    const handleWord3Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentWord3(event.target.value);
    };

    const checkWord3Change = () => {
        if (currentWord3 !== '') {
            setWord3Error(!WordCode.english.check(currentWord3));
        }
    }

    const handleWord3KeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            word4Input.current?.focus();
        }
    }

    const handleWord4Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentWord4(event.target.value);
    };

    const checkWord4Change = () => {
        if (currentWord4 !== '') {
            setWord4Error(!WordCode.english.check(currentWord4));
        }
    }

    const handleWord4KeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchOffer();
        }
    }

    const navigate = useNavigate();
    const [open, setOpen] = useState<boolean>(true);

    const close = () => {
        setOpen(false);
        props.close();
    }

    const fetchOffer = () => {

        const e1 = !WordCode.english.check(currentWord1);
        const e2 = !WordCode.english.check(currentWord2);
        const e3 = !WordCode.english.check(currentWord3);
        const e4 = !WordCode.english.check(currentWord4);

        setWord1Error(e1);
        setWord2Error(e2);
        setWord3Error(e3);
        setWord4Error(e4);

        if (!(e1 || e2 || e3 || e4)) {
            setWordCode(WordCode.english.decode([currentWord1, currentWord2, currentWord3, currentWord4]))
        }
    }

    const { home } = useOutletContext<HomeContext>();

    const [wordCode, setWordCode] = useState<string>();
    const [offer, setOffer]       = useState<LinkDeviceOffer>();
    const offerState              = useStateObject<LinkDeviceOffer>(offer);

    useEffect(() => {

        if (wordCode !== undefined && home !== undefined) {
            const createOffer = async () => {

                await new Promise(r => setTimeout(r, 0));

                const backend = new MemoryBackend(new RNGImpl().randomHexString(128));
                await backend.ready();

                const store = new Store(backend);
                const mesh = new Mesh();

                const resources = await Resources.create({mesh: mesh, store: store});
                
                const offer = new LinkDeviceOffer(wordCode);

                //offer.setResources(resources);
                store.setResources(resources);
                await store.save(offer);
                

                const localDevice = await home.findLocalDevice() as Device;

                offer.createReply(home.getAuthor() as Identity, home.getAuthor()?._keyPair as RSAKeyPair, localDevice);

                await store.save(offer);


                setOffer(offer);
                //PeerGroupAgent.controlLog.setLevel(LogLevel.DEBUG);
                //PeerGroupAgent.peersLog.setLevel(LogLevel.DEBUG);
                //HeaderBasedSyncAgent.controlLog.setLevel(LogLevel.DEBUG);
                //HeaderBasedSyncAgent.messageLog.setLevel(LogLevel.DEBUG);
                //StateGossipAgent.controlLog.setLevel(LogLevel.DEBUG);
                //StateGossipAgent.peerMessageLog.setLevel(LogLevel.DEBUG);

                console.log('starting sync...')
                
                await store.save(offer);
                await offer.startSync();

                while (offer.newDevice?.getValue() === undefined) {

                    console.log('waiting for remote device...')
                    await new Promise(r => setTimeout(r, 500)); 

                }

                console.log('got new device')
                console.log(offer.newDevice?.getValue());

                await home.addDevice((offer.newDevice?.getValue() as Device));

                //await home.devices?.add((offer.newDevice?.getValue() as Device).clone());
                //await home.devices?.saveQueuedOps();
                
                const newDevice = await home.getStore().load((offer.newDevice?.getValue() as Device).hash()) as Device;

                console.log('re-loaded new device locally')
                console.log(newDevice);

                await newDevice.name?.loadAndWatchForChanges();

                while (newDevice.name?.getValue() === undefined) {
                    console.log('waiting for sync...')
                    await new Promise(r => setTimeout(r, 500)); 
                }

                console.log('sync set-up finished');

                close();
            }

            createOffer();

        }

    }, [wordCode, home])

    return (<Fragment>
                <Dialog open={open} scroll='paper' onClose={close}>
                    <DialogTitle>Enter your new device's code</DialogTitle>
                    <DialogContent>
                        
                        <Fragment>
                        {wordCode === undefined &&
                            <Fragment>
                                <Card variant="outlined">
                                    <CardContent style={{background: 'red', padding:7}}>
                                        <Typography style={{color:'white'}}>Warning: only enter a code you've created yourself in one of your own devices!</Typography>
                                    </CardContent>
                                </Card>
                                <Stack
                                sx={{ pt: {xs: 3, sm: 5} }}
                                direction={{xs:'column',  sm:'row'}}
                                spacing={1}
                                justifyContent="center">
                                <TextField autoFocus inputRef={word1Input} value={currentWord1} onBlur={checkWord1Change} onChange={handleWord1Change} onKeyPress={handleWord1KeyPress} variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}} error={word1Error} helperText={word1Error? 'Please check this word' : undefined}></TextField>
                                <TextField inputRef={word2Input} value={currentWord2} onBlur={checkWord2Change} onChange={handleWord2Change} onKeyPress={handleWord2KeyPress} variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}} error={word2Error} helperText={word2Error? 'Please check this word' : undefined}></TextField>
                                <TextField inputRef={word3Input} value={currentWord3} onBlur={checkWord3Change} onChange={handleWord3Change} onKeyPress={handleWord3KeyPress} variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}} error={word3Error} helperText={word3Error? 'Please check this word' : undefined}></TextField>
                                <TextField inputRef={word4Input} value={currentWord4} onBlur={checkWord4Change} onChange={handleWord4Change} onKeyPress={handleWord4KeyPress} variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}} error={word4Error} helperText={word4Error? 'Please check this word' : undefined}></TextField>
                                
                                </Stack>
                            </Fragment>
                        }
                        {wordCode !== undefined && offerState?.getValue()?.replyReceivingStatus?.getValue() === undefined &&
                            <Typography>Waiting for your new device to connect...</Typography>
                        }
                        {wordCode !== undefined && offerState?.getValue()?.replyReceivingStatus?.getValue() === 'success' &&
                            <Typography><b>Connected!</b> Please go back to your new device to configure it.</Typography>
                        }
                        {wordCode !== undefined && offerState?.getValue()?.replyReceivingStatus?.getValue() === 'error' &&
                            <Typography><b>Linking devince failed.</b> Please try again later or contact us for support.</Typography>
                        }

                        </Fragment>
                    </DialogContent>
                    <DialogActions>
                    <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}>{wordCode === undefined && <Button variant="contained" color='success' onClick={fetchOffer}>Link device</Button>}<Button onClick={close}>Cancel</Button></Stack>
                    </DialogActions>
                </Dialog>
            </Fragment>);
}

export default ReceiveLinkOffer;