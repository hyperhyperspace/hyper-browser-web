import { useState } from 'react';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';



function CreateHomeDialog(props: {onClose: () => void, setSaveSpacePending: React.Dispatch<React.SetStateAction<boolean>>}) {

    const [open, setOpen] = useState(true);

    const close = () => {
        setOpen(false);
        props.onClose();
    }

    const createHome = () => {
        props.setSaveSpacePending(true);
        window.open('./#/start/create-home', '_blank');
        close();
    }

    const decline = () => {
        props.setSaveSpacePending(false);
        close();
    }

    return (
        <Dialog open={open} scroll='paper' onClose={close}>
            <DialogTitle>Initialize a Home Space? 🏠</DialogTitle>
            <DialogContent>
                <Card variant="outlined">
                    <CardContent style={{background: 'lightgray'}}>
                        <Typography>
                            To save a copy of the space in this device, you need to create a Home Space first.
                        </Typography>
                    </CardContent>
                </Card>
            </DialogContent>
            <DialogActions>
                <Stack direction="row" style={{margin: 'auto'}} spacing={2}><Button variant="outlined" onClick={createHome}>Create Home Space</Button><Button onClick={decline}>No, thanks</Button></Stack>
            </DialogActions>
        </Dialog>
    );
}

export default CreateHomeDialog;