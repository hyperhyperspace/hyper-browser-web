import { Fragment } from 'react';
import { useNavigate } from 'react-router';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from'@mui/material';


function LinkDeviceDialog() {

    const navigate = useNavigate();

    const cancel = () => {
        navigate('/start');
    }

    return (
<Fragment>
    <Dialog open={true} scroll='paper' onClose={cancel}>
        <DialogTitle>Link this device to your Home Space</DialogTitle>
        <DialogContent>
            <Card variant="outlined">
            <CardContent style={{background: 'lightgray'}}>
            <Typography>
                If you've already set up a <b>Home Space</b>, you can import your Home Space here. It will be kept <b>synchronized automatically</b>!
            </Typography>
            </CardContent>
            </Card>
            <Paper sx={{ mt: {xs: 2, sm: 4}, p: 2}}>
                <Stack spacing={2}>
                    <Typography>Open your existing <b>Home Space</b>, go to <span style={{background: 'yellow'}}>Settings &gt; Linked Devices</span> on the top right corner and then click on <span style={{color: 'white', background: 'green'}}>add device</span>.</Typography>
                    <Typography>Use the following device code:</Typography>
                    <Stack direction="row" justifyContent="center" spacing={2}>
                        <Typography style={{background:'yellow'}}>pie</Typography>
                        <Typography style={{background:'yellow'}}>banana</Typography>
                        <Typography style={{background:'yellow'}}>karting</Typography>
                        <Typography style={{background:'yellow'}}>fumble</Typography>
                    </Stack>
                    <Typography>Once you've done it, you'll need to <b>come back here and confirm</b>.</Typography>
                </Stack>
            </Paper>
        </DialogContent>
        <DialogActions>
        <Button style={{margin: 'auto'}} onClick={cancel}>Cancel</Button>
        </DialogActions>
    </Dialog>
</Fragment>
        
    );
}

export default LinkDeviceDialog;