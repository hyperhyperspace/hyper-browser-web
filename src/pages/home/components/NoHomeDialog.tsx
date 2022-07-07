import { useState, useEffect, Fragment } from 'react';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import { Identity } from '@hyper-hyper-space/core';
import { Contacts } from '@hyper-hyper-space/home';

function NoHomeDialog(props: {onClose?: () => void}) {
    
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();

    const close = () => {
        setOpen(false);
        if (props.onClose !== undefined) {
            props.onClose();
        }
    }

    const { next } = useParams() as { next: string};

    const destination = next.split('/')[0];

    let [message, setMessage] = useState<string>();
    let [valid, setValid]     = useState<boolean>();

    useEffect(() => {
        const init = async () => {
            if (destination === 'add-contact') {

                let id: Identity;
                try {
                    const rawId = decodeURIComponent(next.split('/')[1]);
                    console.log(rawId);
                    const identity = await Contacts.importIdentity(JSON.parse(rawId));
        
                    setValid(true);
                    setMessage('You are about to add ' + identity.info?.name + ' as a contact in Hyper Hyper Space. You need to initialize your Home space first!');
                
                } catch (e) {
                    setValid(false);
                    setMessage('The contact in the link you followed invalid, sorry. Please check that the link was not modified.');
                }
                
            } else {
                setValid(false);
                setMessage('You received an invalid link, sorry.');
            }
        
        };

        init();
    }, []);


    return <Dialog open={open} scroll='paper' onClose={close}>
        { (valid === undefined || message === undefined) &&
            <Typography>Loading...</Typography>
        }
        { !(valid === undefined || message === undefined) &&
            <Fragment>
                <DialogTitle>Welcome to Hyper Hyper Space!</DialogTitle>
                <DialogContent>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography>{message}</Typography>
                            {valid &&
                                <Stack style={{width: '100%'}}>
                                    <Stack direction="row" style={{margin: 'auto', paddingTop: '1rem'}} spacing={2}>
                                        <Button variant="contained" onClick={() => {navigate('/start/create-home/' + encodeURIComponent(next))}}>Create a New Home</Button>
                                        <Button variant="contained" onClick={() => { navigate('/start/link-device/' + encodeURIComponent(next))}}>I have a Home, link this device</Button>
                                    </Stack>
                                </Stack>
                            }
                        </CardContent>
                    </Card>
                </DialogContent>
                <DialogActions>
                    <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button onClick={close}>Cancel</Button></Stack>
                </DialogActions>
            </Fragment>
        }

    </Dialog>
}

export default NoHomeDialog;