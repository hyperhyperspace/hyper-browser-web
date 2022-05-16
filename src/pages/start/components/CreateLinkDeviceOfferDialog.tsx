import { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from'@mui/material';
import { Device, LinkDeviceOffer } from '@hyper-hyper-space/home';
import { Identity, MemoryBackend, Mesh, Resources, RNGImpl, RSAKeyPair, Store, WordCode } from '@hyper-hyper-space/core';
import { HyperBrowserConfig } from '../../../model/HyperBrowserConfig';
import LinkDeviceDialog from './LinkDeviceDialog';


function CreateLinkDeviceOfferDialog() {

    const navigate = useNavigate();

    const [wordCode, setWordCode] = useState<string[]>();
    const [offer, setOffer] = useState<LinkDeviceOffer>();
    const [reply, setReply] = useState<{id: Identity, remoteDevice: Device}>();

    useEffect(() => {

        let offer     : LinkDeviceOffer | undefined;
        let resources : Resources | undefined;

        const createOffer = async () => {

            await new Promise(r => setTimeout(r, 0));

            const backend = new MemoryBackend(new RNGImpl().randomHexString(128));
            await backend.ready();
        
            const store = new Store(backend);
            const mesh = new Mesh();
        
            resources = await Resources.create({mesh: mesh, store: store});

            const code  = new RNGImpl().randomHexString(48);

            offer = new LinkDeviceOffer(code);

            setOffer(offer);

            store.setResources(resources);
            await store.save(offer);
            //offer.setResources(resources);

            let gotReply = false;

            offer.reply?.addMutationObserver(() => {

                if (!gotReply) {
                    offer?.decodeReply().then(async (reply: {id: Identity, remoteDevice: Device} |undefined) => {
                        if (reply === undefined) {
                            alert('Error receiving your Home Space info.')
                            offer?.replyReceivingStatus?.setValue('error');
                        } else {
                            reply.id.forgetResources();
                            reply.remoteDevice.forgetResources();
                            setReply(reply);
                            gotReply = true;
                            offer?.replyReceivingStatus?.setValue('success');
                        }
                        offer?.replyReceivingStatus?.saveQueuedOps();
                    });
                }
            });

            setWordCode(WordCode.english.encode(code));
            offer.startSync(true);
        }
        
        createOffer();

        return () => {
            console.log('cleaning up offer...');
            if (offer !== undefined) {
                offer.stopSync();
            }
            if (resources !== undefined) {
                resources.store?.close();
                resources.mesh?.pod?.shutdown();
            }
        };
    }, []);

    const cancel = () => {
        navigate('/start');
    }

    return (
<Fragment>
    {reply === undefined && 
    <Dialog open={true} scroll='paper' onClose={cancel}>
        <DialogTitle>Link this device to your Home Space</DialogTitle>
        <DialogContent>
            {/*<Card variant="outlined">
            <CardContent style={{background: 'lightgray'}}>
            <Typography>
                If you've already set up a <b>Home Space</b>, you can import your Home Space here. It will be kept <b>synchronized automatically</b>!
            </Typography>
            </CardContent>
            </Card>*/}
            <Paper sx={{ mt: {xs: 2, sm: 4}, p: 2}}>
                <Fragment>
                {wordCode !== undefined &&
                    <Stack spacing={2}>
                        <Typography>Open your <b>Home Space</b> in your other device, go to <span style={{background: 'yellow'}}>Settings &gt; Linked Devices</span> on the upper right corner and then click on <span style={{color: 'white', background: 'green'}}>add device</span>.</Typography>
                        <Typography>Use the following <b>device code</b>:</Typography>
                        <Stack direction="row" justifyContent="center" spacing={2}>
                            <Typography style={{background:'yellow'}}>{wordCode[0]}</Typography>
                            <Typography style={{background:'yellow'}}>{wordCode[1]}</Typography>
                            <Typography style={{background:'yellow'}}>{wordCode[2]}</Typography>
                            <Typography style={{background:'yellow'}}>{wordCode[3]}</Typography>
                        </Stack>
                        <Typography>Once you've done it, you'll need to <b>come back here to complete the process</b>.</Typography>

                    </Stack>
                }
                {wordCode === undefined &&
                    <Stack spacing={2}>
                        <Typography>Preparing to link this device...</Typography>
                    </Stack>
                }
                </Fragment>
                
            </Paper>
        </DialogContent>
        <DialogActions>
        <Button style={{margin: 'auto'}} onClick={cancel}>Cancel</Button>
        </DialogActions>
    </Dialog>
    }
    {reply !== undefined &&
        <LinkDeviceDialog offer={offer as LinkDeviceOffer}  id={reply.id} remoteDevice={reply.remoteDevice}/> 
    }
</Fragment>
        
    );
}

export default CreateLinkDeviceOfferDialog;