import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState } from 'react';


function AskForPersistentStorageDialog(props: {onClose?: () => void}) {

    const [open, setOpen]       = useState(true);
    const [waiting, setWaiting] = useState(false);
    const [granted, setGranted] = useState<boolean|undefined>(undefined);
    const [error, setError]     = useState<any>(undefined);

    const close = () => {
        setOpen(false);
        if (props.onClose !== undefined) {
            props.onClose();
        }
    }

    const ask = () => {
        setWaiting(true);
        navigator.storage.persist().then((granted: boolean) => {
            setWaiting(false);
            setGranted(granted);
        },
        (reason: any) => {
            setWaiting(false);
            setError(reason);
        });
    }

    return <Dialog open={open} scroll='paper' onClose={close}>
        <DialogTitle>Storage for your Home</DialogTitle>
        <DialogContent>
            <Card variant="outlined">
                <CardContent style={{background: 'lightgray'}}>
        { !waiting && (granted === undefined) && (error === undefined) &&
            <Typography>It'd be wise to ask your browser to use <b>permanent storage</b> for your Home Space.<br /> <br /> Otherwise, you may lose the contents of yor home when you close this window.</Typography>
        }
        { waiting &&
            <Typography>Please authorize the use of <b>persistent storage</b> (your browser should be asking for your confirmation now).</Typography>
        }
        { granted !== undefined && granted &&
            <Typography>Great! You're using persistent storage now.</Typography>
        }
        { granted !== undefined && !granted &&
            <Typography>You chose to use <b>temporary storage</b>. You'll be prompted again the next time you open your home (if your browser hasn't deleted it!).</Typography>
        }
        { error !== undefined &&
            <Typography>There was an <b>error</b> while trying to set up permanent storage: {error}</Typography>
        }
                </CardContent>
            </Card>
        </DialogContent>
        <DialogActions>
            {!waiting && granted === undefined && error === undefined &&
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button variant="outlined" onClick={ask}>Use permanent storage</Button><Button onClick={close}>I'll do this later</Button></Stack>
            }
            {waiting &&
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button onClick={close}>Cancel</Button></Stack>
            }
            { (granted !== undefined || error !== undefined) &&
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button onClick={close}>OK</Button></Stack>
            }
        </DialogActions>
    </Dialog>;
}

export default AskForPersistentStorageDialog;