import { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { Dialog, useTheme, useMediaQuery, DialogTitle, Stack, Typography, Button, DialogContent, FormControl, FormLabel, FormGroup, FormControlLabel, Switch, Input, IconButton, TextField, DialogActions } from '@mui/material';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';

import { Hash, HashedObject, Identity, Space } from '@hyper-hyper-space/core';

import { useObjectState } from '@hyper-hyper-space/react';

import { Contacts } from '@hyper-hyper-space/home';

import { HomeContext } from '../HomeSpace';
import Context from '@mui/base/TabsUnstyled/TabsContext';


function ShareProfileDialog() {

    const navigate = useNavigate();

    const [open, setOpen] = useState(true);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const close = () => {
        setOpen(false);
        navigate('..');
    };

    const { owner, home, resources } = useOutletContext<HomeContext>();

    const [contacts, setContacts] = useState<Contacts>();
    const contactsState = useObjectState(contacts);

    const [profileIsPublic, setProfileIsPublic] = useState<boolean>();

    useEffect(() => {

        if (home !== undefined && resources !== undefined) {
            const contactsHash = home.contacts?.hash() as Hash;
            resources.store?.load(contactsHash).then((loaded?: HashedObject) => {

                const c = loaded as (Contacts | undefined);

                if (c === undefined) {
                    throw new Error('Could not load contacts for this home account!');
                } else {
                    setContacts(c);
                    setProfileIsPublic(c.profileIsPublic?._value);
                }
            });
        }
        

    }, [home, resources]);

    const [shareUrl, setShareUrl] = useState<string>();

    useEffect(() => {
        if (owner !== undefined) {
            setShareUrl(document.location.origin + document.location.pathname + '#/add-contact/'+encodeURIComponent(JSON.stringify(Contacts.exportIdentity(owner))));
        }
    }, [owner]);


    const handleIsPublicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProfileIsPublic(event.target.checked);
        contacts?.profileIsPublic?.setValue(event.target.checked);
        contacts?.profileIsPublic?.saveQueuedOps();
    };

    const shareUrlInputRef   = useRef<HTMLInputElement>();
    const exportTextFieldRef = useRef<HTMLInputElement>();

    const copyUrl = () => {
        (navigator.clipboard as any).writeText(shareUrl);
        shareUrlInputRef.current?.setSelectionRange(0, shareUrlInputRef.current?.value.length);
        shareUrlInputRef.current?.select();
    }

    const share = () => {
        navigator.share({url: shareUrl});
    }

    const copyExport = () => {
        (navigator.clipboard as any).writeText(JSON.stringify(Contacts.exportIdentity(owner as Identity)));
        exportTextFieldRef.current?.setSelectionRange(0, exportTextFieldRef.current?.value.length);
        exportTextFieldRef.current?.select();
    }

    const [exportProfile, setExportProfile] = useState<boolean>(false);

    return (
        <Dialog open={open} scroll='paper' onClose={close} fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='sm' PaperProps={{sx: {minHeight: '60%'}}}>
            <DialogTitle>Share your profile</DialogTitle>

            <DialogContent>
            <Typography>Your profile code is <span style={{backgroundColor: 'yellow'}}>{Space.getWordCodingForHash(owner?.getLastHash() as Hash).join(' ')}</span>.</Typography>

            {contacts !== undefined && owner !== undefined &&
                <Stack paddingTop='2rem' spacing={2}>
                    <FormControl component="fieldset" >
                        <FormLabel component="legend">Public access</FormLabel>
                        <FormGroup aria-label="Enable profile lookup" row>
                            <FormControlLabel
                                value="start"
                                control={<Switch color="primary" checked={profileIsPublic !== undefined && profileIsPublic} onChange={handleIsPublicChange}/>}
                                label="Allow profile lookup using 3-word code"
                                labelPlacement="start"
                            />
                        </FormGroup>
                    </FormControl>
                    { shareUrl !== undefined &&
                    <FormControl component="fieldset" >
                        <FormLabel component="legend">Profile sharing link</FormLabel>
                        <Stack direction="row" style={{width:'95%', marginLeft: '1rem', marginRight: '1rem'}}>
                            <Input style={{flexGrow: 1, marginRight: '1rem'}} value={shareUrl} inputRef={shareUrlInputRef}></Input>
                            <IconButton aria-label="copy">
                                <ContentCopyIcon onPointerUp={copyUrl}/>
                            </IconButton>
                            { (navigator as any).canShare  !== undefined && (navigator as any).canShare({url: shareUrl}) &&
                            <IconButton aria-label="copy">
                                <ShareIcon onPointerUp={share}/>
                            </IconButton>
                            }
                        </Stack>
                    </FormControl>
                    }
                    <FormControl component="fieldset" >
                        <FormLabel component="legend">Profile export</FormLabel>
                        <Stack direction="column" spacing={1} style={{width:'95%', marginLeft: '1rem', marginRight: '1rem', paddingTop: '0.5rem'}}>
                            { !exportProfile &&
                                <Stack direction="row" spacing={1} style={{alignItems: 'baseline'}}><Button variant="outlined" onPointerUp={() => { setExportProfile(true); }}>Export profile</Button><Typography style={{color: 'gray'}}>For importing in other systems.</Typography></Stack>
                            }
                            { exportProfile && 
                            <Fragment>
                            <TextField
                                style={{flexGrow: 1, marginRight: '1rem'}} 
                                value={JSON.stringify(Contacts.exportIdentity(owner))}
                                maxRows={4}
                                minRows={4}
                                multiline
                                inputRef={exportTextFieldRef}
                            />
                            <Stack direction="row" spacing={1} style={{alignItems: 'baseline'}}><Button variant="contained" onPointerUp={copyExport}>Copy to Clipboard</Button><Typography style={{color: 'gray'}}>Needs to be sent without changes.</Typography></Stack>
                            </Fragment>
                            }
                        </Stack>
                    </FormControl>
                </Stack>
            }
            </DialogContent>
            <DialogActions>
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button onClick={close}>Close</Button></Stack>
            </DialogActions>
        </Dialog>
    );

}

export default ShareProfileDialog;