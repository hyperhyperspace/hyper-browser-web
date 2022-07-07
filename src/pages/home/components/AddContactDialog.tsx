import { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { Dialog, useTheme, useMediaQuery, DialogTitle, DialogActions, Stack, Button, Tabs, Tab, DialogContent, Paper, Typography, Input, TextField, Card, CardContent, Divider } from '@mui/material';
import { Box } from '@mui/system';
import { useObjectDiscoveryWithResources } from '@hyper-hyper-space/react';
import { HomeContext } from '../HomeSpace';
import { ObjectDiscoveryReply, WordCode, Identity, Hash } from '@hyper-hyper-space/core';
import CircularProgress from '@mui/material/CircularProgress';
import { Contacts, Profile } from '@hyper-hyper-space/home';

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
    
    const [method, setMethod] = useState<'code'|'import'>(urlProfile === undefined? 'code' : 'import');

    // discovery using entered 3-word code
    const { home, resourcesForDiscovery } = useOutletContext<HomeContext>();
    const [wordsForDiscovery, setWordsForDiscovery] = useState<string|undefined>(undefined);
    const discovered = useObjectDiscoveryWithResources(resourcesForDiscovery, wordsForDiscovery, 'en', 10, false);
    const discoveredIds = discovered? Array.from(discovered.values()).filter((r: ObjectDiscoveryReply) => r.object !== undefined && r.object.getClassName() === Identity.className).map((r: ObjectDiscoveryReply) => (r.object as Identity)) : [];

    const [discoveryTrigger, setDiscoveryTrigger] = useState<number|undefined>(undefined);

    const [word1, setWord1] = useState<string>('');
    const [word2, setWord2] = useState<string>('');
    const [word3, setWord3] = useState<string>('');

    const word2Ref = useRef<HTMLInputElement>(null);
    const word3Ref = useRef<HTMLInputElement>(null);

    const [word1Error, setWord1Error] = useState<boolean>(false);
    const [word2Error, setWord2Error] = useState<boolean>(false);
    const [word3Error, setWord3Error] = useState<boolean>(false);

    const onChangeWord1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWord1(event.target.value);
    };

    const onChangeWord2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWord2(event.target.value);
    };

    const onChangeWord3 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWord3(event.target.value);
    };

    const onKeypressWord1 = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            word2Ref.current?.focus();
        }
    }

    const onKeypressWord2 = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            word3Ref.current?.focus();
        }
    }

    useEffect(() => {
        if (discoveryTrigger !== undefined) {
            window.clearTimeout(discoveryTrigger);
        }

        const word1OK = WordCode.english.check(word1);
        const word2OK = WordCode.english.check(word2);
        const word3OK = WordCode.english.check(word3);

        setWord1Error(word1.length > 0 && !word1OK);
        setWord2Error(word2.length > 0 && !word2OK);
        setWord3Error(word3.length > 0 && !word3OK);

        if (word1OK && word2OK && word3OK) {
            setWordsForDiscovery(word1 + '-' + word2 + '-' + word3);
        } else {
            setWordsForDiscovery(undefined);
        }
    }, [word1, word2, word3]);
    
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

    // import using exported profile

    const [exportedIdentity, setExportedIdentity] = useState<string>(urlProfile || '');

    const [importedIdentity, setImportedIdentity] = useState<Identity>();
    const [importError, setImportError]           = useState<boolean>(false);

    const exportedProfileOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;

        setExportedIdentity(newValue);
    };

    useEffect(() => {

        const doImport = async () => {
            try {
                const id = await Contacts.importIdentity(JSON.parse(exportedIdentity));
                setImportError(false);
                setImportedIdentity(id);
            } catch (e) {
                console.log(e);
                setImportError(true);
                setImportedIdentity(undefined);
            }
    
        }

        if (exportedIdentity.length > 0) {
            doImport();
        } else {
            setImportedIdentity(undefined);
            setImportError(false);
        }
        

    }, [exportedIdentity]);

    const changeMethod = () => {

    };

    return (
        <Dialog open={open} scroll='paper' onClose={close} fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='sm' >
            <DialogTitle>Add new contact</DialogTitle>

            <DialogContent>
                <Card>
                <CardContent>
                <Box sx={{ width: '100%'}}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={method} onChange={changeMethod} aria-label="Choose add contact method">
                            <Tab label="Using 3-word code" value="code" onClick={() => setMethod('code')}/>
                            <Tab label="Using exported profile" value="import" onClick={() => setMethod('import')}/>
                        </Tabs>
                    </Box>
                    
                    
                    {method==='code' &&
                        <Box style={{padding: '1rem', marginTop: '1.5rem'}}>
                            <Stack direction="row" spacing={1} style={{alignItems: 'baseline'}}>
                                <Typography >
                                    Code:
                                </Typography>
                                <TextField value={word1} onChange={onChangeWord1} onKeyPress={onKeypressWord1} error={word1Error} inputProps={{size: 12}} size='small' autoFocus />
                                <TextField value={word2} onChange={onChangeWord2} onKeyPress={onKeypressWord2} error={word2Error} inputProps={{size: 12}} inputRef={word2Ref} size='small' />
                                <TextField value={word3} onChange={onChangeWord3} error={word3Error} inputProps={{size: 12}} inputRef={word3Ref} size='small' />
                            </Stack>
                            {wordsForDiscovery !== undefined && discoveredIds.length === 0 && 
                                <Box style={{marginTop: '2rem'}}>
                                    { false && 
                                    <Box sx={{display: 'flex', marginBottom: '1rem'}}>
                                        <Typography>This is taking longer than expected. Are your 3-words correct? Poke someone to open this space then.</Typography>
                                    </Box>
                                    }
                                    <Box sx={{display: 'flex'}}>
                                        <CircularProgress style={{margin: 'auto'}}/>
                                    </Box>
                                </Box>
                            }
                            {wordsForDiscovery !== undefined && discoveredIds.length > 0 &&
                            
                            <Stack divider={<Divider orientation="horizontal" flexItem />} style={{marginTop: '1rem'}} >
                                            {discoveredIds.map((id: Identity) => (
                                                                    <Stack key={id.getLastHash()} style={{justifyContent: 'space-between', marginTop: '1rem'}} direction="row"  spacing={2}>
                                                                        <Typography style={{alignSelf: 'center'}}>
                                                                            <span style={{background: 'orange', color: 'white'}}>{id.info?.type || 'Identity'}</span> named <Fragment>{id.info?.name}</Fragment>
                                                                        </Typography>  
                                                                        <Stack direction="row" spacing={2}>
                                                                            <Button variant="outlined" size="small" onClick={() => { navigate('../view-profile/' + encodeURIComponent(id.getLastHash() as Hash)); }}>Open</Button>
                                                                            <Button variant="contained" size="small" onClick={() => { addContact(id); }}>Add</Button>
                                                                        </Stack>
                                                                    </Stack>
                                            ))}
                                        </Stack>
                            }
                        </Box>
                    }
                    {method === 'import' &&
                        
                        <Box style={{padding: '1rem', marginTop: '1.5rem'}}>
                            <TextField
                                label="Paste exported profile here"
                                value={exportedIdentity}
                                maxRows={4}
                                minRows={4}
                                multiline
                                fullWidth
                                onChange={exportedProfileOnChange}
                            />
                            {importError && 
                            <Box style={{marginTop:'2rem'}}>
                                <Typography>Cannot import: entered an invalid export.</Typography>
                            </Box>
                            }
                            {importedIdentity !== undefined &&
                                <Stack style={{justifyContent: 'space-between', marginTop: '2rem'}} direction="row"  spacing={2}>
                                        <Typography style={{alignSelf: 'center'}}>
                                            <span style={{background: 'orange', color: 'white'}}>{importedIdentity.info?.type || 'Identity'}</span> named <Fragment>{importedIdentity.info?.name}</Fragment>
                                        </Typography>  
                                        <Stack direction="row" spacing={2}>
                                            <Button variant="outlined" size="small" onClick={() => { navigate('../view-profile/' + encodeURIComponent(importedIdentity.getLastHash() as Hash)); }}>Open</Button>
                                            <Button variant="contained" size="small" onClick={() => { addContact(importedIdentity); }}>Add</Button>
                                        </Stack>
                                </Stack>
                            }
                        </Box>
                    }
                    
                    
                </Box>
                </CardContent>
                </Card>
            </DialogContent>
            <DialogActions>
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button onClick={cancel}>Cancel</Button></Stack>
            </DialogActions>
        </Dialog>
    );

}

export default AddContactDialog;