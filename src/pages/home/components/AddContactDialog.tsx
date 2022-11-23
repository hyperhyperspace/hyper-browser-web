import { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { Dialog, useTheme, useMediaQuery, DialogTitle, DialogActions, Stack, Button, Tabs, Tab, DialogContent, Paper, Typography, Input, TextField, Card, CardContent, Divider } from '@mui/material';
import { Box } from '@mui/system';
import { useObjectDiscoveryWithResources } from '@hyper-hyper-space/react';
import { HomeContext } from '../HomeSpace';
import { ObjectDiscoveryReply, WordCode, Identity, Hash } from '@hyper-hyper-space/core';
import CircularProgress from '@mui/material/CircularProgress';
import { Contacts, Profile } from '@hyper-hyper-space/home';
import LookupThreeWordCode from './LookupThreeWordCode';
import ImportExportedProfile from './ImportExportedProfile';

function AddContactDialog() {

    const navigate = useNavigate();
    const params = useParams();

    const urlProfile = params.profile;

    const [open, setOpen] = useState(true);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const close = () => {
        setOpen(false);
        navigate('..');
    };

    const [method, setMethod] = useState<'code' | 'import'>(urlProfile === undefined ? 'code' : 'import');

    // discovery using entered 3-word code
    const { home, resourcesForDiscovery } = useOutletContext<HomeContext>();

    const cancel = () => {
        close();
    };

    const addContact = async (id: Identity) => {

        const profile = new Profile(id);

        await home?.contacts?.current?.add(profile);
        await home?.contacts?.current?.saveQueuedOps();

        if (urlProfile === undefined) {
            navigate(-1);
        } else {
            navigate('/');
        }

    };

    const renderIdentity = (id?: Identity) => (
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" size="small" onClick={() => { navigate('../view-profile/' + encodeURIComponent(id!.getLastHash() as Hash)); }}>Open</Button>
            <Button variant="contained" size="small" onClick={() => { addContact(id!); }}>Add</Button>
        </Stack>
    )
    // import using exported profile

    const changeMethod = () => {

    };

    return (
        <Dialog open={open} scroll='paper' onClose={close} fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='sm' >
            <DialogTitle>Add new contact</DialogTitle>

            <DialogContent>
                <Card>
                    <CardContent>
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={method} onChange={changeMethod} aria-label="Choose add contact method">
                                    <Tab label="Using 3-word code" value="code" onClick={() => setMethod('code')} />
                                    <Tab label="Using exported profile" value="import" onClick={() => setMethod('import')} />
                                </Tabs>
                            </Box>


                            {method === 'code' && <LookupThreeWordCode
                                resourcesForDiscovery={resourcesForDiscovery!}
                                renderIdentity={renderIdentity}
                            />}
                            {method === 'import' && <ImportExportedProfile
                                renderIdentity={renderIdentity} 
                            />}
                        </Box>
                    </CardContent>
                </Card>
            </DialogContent>
            <DialogActions>
                <Stack direction="row" style={{ margin: 'auto', paddingBottom: '1rem' }} spacing={2}><Button onClick={cancel}>Cancel</Button></Stack>
            </DialogActions>
        </Dialog>
    );

}

export default AddContactDialog;